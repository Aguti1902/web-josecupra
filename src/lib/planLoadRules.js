/**
 * Reglas de carga y colocación de sesiones — PDF §3 + matriz objetivos 2.0
 */
import {
  resolveMatrixSessionTypes,
  parseWeeklyFrequency,
  SECONDARY_BLOCKED_FREQ1_MESSAGE,
} from "./objectiveSessionMatrix";

export { parseWeeklyFrequency, SECONDARY_BLOCKED_FREQ1_MESSAGE };

/** Mensaje cuando la combinación objetivo + días + competición no permite planificar bien */
export const PLAN_COHERENCE_MESSAGE = `No es posible generar una planificación óptima con los parámetros seleccionados.

La combinación entre tus días disponibles para entrenar, el día de competición y el objetivo elegido no permite distribuir correctamente las cargas de entrenamiento.

Para ofrecerte una planificación más segura y eficaz, te recomendamos modificar alguno de estos parámetros:
• añadir otro día disponible para entrenar;
• cambiar el día de entrenamiento;
• o seleccionar un objetivo diferente.

Una vez ajustados estos datos podremos generar una planificación de mayor calidad.`;

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

/** Intensidad de cada tipo de sesión (PDF §3.1) */
export const SESSION_INTENSITY = {
  "Fuerza A": "alta",
  "Fuerza B": "media",
  "Fuerza Superior A": "alta",
  "Fuerza Superior B": "media",
  Velocidad: "alta",
  "Full Body": "media",
  Pliometría: "alta",
  Isométricos: "baja",
  Hipertrofia: "alta",
  "Hipertrofia Anterior": "alta",
  "Hipertrofia Posterior": "alta",
  "Hipertrofia Push": "alta",
  "Hipertrofia Pull": "alta",
  "Hipertrofia Pierna": "alta",
  "Resistencia anaeróbica": "alta",
  "Resistencia umbral": "media",
  "Resistencia aeróbica": "baja",
  Prevención: "baja",
  Movilidad: "baja",
  "Sesión mínima": "baja",
};

const MATCH_DAY_MAP = {
  sabado: "Sábado",
  sábado: "Sábado",
  domingo: "Domingo",
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
};

/** Opciones de día de competición (onboarding + motor) */
export const COMPETITION_DAY_OPTIONS = ["Fin de semana", "Entre semana", "No compito"];

export function normalizeMatchDay(diaCompeticion) {
  if (!diaCompeticion) return null;
  const raw = String(diaCompeticion).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (raw.includes("no compito") || raw.includes("no compite")) return null;
  if (raw.includes("fin de semana") || raw.includes("sabado") || raw.includes("domingo")) return "Sábado";
  if (raw.includes("entre semana")) return "Viernes";
  return MATCH_DAY_MAP[raw] || null;
}

/** Distancia en días entre día de entreno y día de partido */
export function getMatchDayDistance(trainingDay, matchDay) {
  if (!matchDay || !trainingDay) return null;
  const ti = DAY_ORDER.indexOf(trainingDay);
  const mi = DAY_ORDER.indexOf(matchDay);
  if (ti < 0 || mi < 0) return null;
  let dist = ti - mi;
  if (dist > 3) dist -= 7;
  if (dist < -3) dist += 7;
  return dist;
}

export function getAllowedIntensities(distance) {
  if (distance === null) return ["alta", "media", "baja"];
  if (distance === -1 || distance === 1) return ["baja"];
  if (distance === -2 || distance === 2) return ["media", "baja"];
  return ["alta", "media", "baja"];
}

export function sessionIntensity(sessionType) {
  return SESSION_INTENSITY[sessionType] || "media";
}

function isConsecutive(dayA, dayB) {
  const ia = DAY_ORDER.indexOf(dayA);
  const ib = DAY_ORDER.indexOf(dayB);
  return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
}

/** Selección determinista de N días desde el pool disponible. */
function selectDaysFromPool(pool, n) {
  if (pool.length <= n) return pool.slice(0, n);
  const picked = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor((i * pool.length) / n);
    const day = pool[idx];
    if (!picked.includes(day)) picked.push(day);
  }
  for (const day of pool) {
    if (picked.length >= n) break;
    if (!picked.includes(day)) picked.push(day);
  }
  return picked.slice(0, n);
}

function permuteDays(days) {
  if (days.length <= 1) return [days];
  const [first, ...rest] = days;
  const perms = permuteDays(rest);
  const out = [];
  for (let i = 0; i <= rest.length; i++) {
    for (const p of perms) {
      out.push([...rest.slice(0, i), first, ...rest.slice(i)]);
    }
  }
  return out;
}

/** Puntuación para ordenar sesiones en días (competición + separación de cargas altas). */
function scoreDayAssignment(pairs, matchDay) {
  let score = 0;

  for (const p of pairs) {
    const dist = getMatchDayDistance(p.day, matchDay);
    const intensity = sessionIntensity(p.sessionType);
    const dayIdx = DAY_ORDER.indexOf(p.day);

    if (matchDay) {
      if (intensity === "alta" && dayIdx >= 1 && dayIdx <= 3) score += 10;
      if (intensity === "alta" && dist === -1) score -= 8;
      if (intensity === "alta" && dist === 1) score -= 6;
      if (intensity === "alta" && dist === 2) score -= 5;
      if (intensity === "baja" && (dist === -1 || dist === 1 || dist === 2)) score += 6;
    }
  }

  const ordered = [...pairs].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const cur = ordered[i];
    if (isConsecutive(prev.day, cur.day)) {
      if (sessionIntensity(prev.sessionType) === "alta" && sessionIntensity(cur.sessionType) === "alta") {
        score -= 12;
      }
    } else if (
      sessionIntensity(prev.sessionType) === "alta"
      && sessionIntensity(cur.sessionType) === "alta"
      && Math.abs(DAY_ORDER.indexOf(cur.day) - DAY_ORDER.indexOf(prev.day)) === 2
    ) {
      score += 4;
    }
  }

  const dayKey = pairs.map((p) => p.day).join("|");
  score -= dayKey.charCodeAt(0) * 0.001;
  return score;
}

/**
 * Asigna tipos de sesión a días disponibles.
 * Prioridad (PDF §Regla de prioridad):
 * 1. Disponibilidad del jugador
 * 2. Matriz fija (tipos sin modificar)
 * 3. Orden según día de competición
 * 4. Separar cargas altas cuando sea posible
 */
export function assignSessionsToDays(sessionTypes, availableDays, matchDay = null) {
  const pool = (availableDays?.length ? availableDays : DAY_ORDER.slice(0, 5))
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  const n = sessionTypes.length;
  if (pool.length < n) return [];

  const selectedDays = selectDaysFromPool(pool, n);
  const dayPermutations = permuteDays(selectedDays);

  let bestPairs = null;
  let bestScore = -Infinity;

  for (const dayOrder of dayPermutations) {
    const pairs = sessionTypes.map((sessionType, i) => ({
      sessionType,
      day: dayOrder[i],
    }));
    const score = scoreDayAssignment(pairs, matchDay);
    if (score > bestScore) {
      bestScore = score;
      bestPairs = pairs;
    }
  }

  if (!bestPairs) {
    bestPairs = sessionTypes.map((sessionType, i) => ({
      sessionType,
      day: selectedDays[i],
    }));
  }

  return bestPairs.map((p) => ({
    sessionType: p.sessionType,
    day: p.day,
    distance: getMatchDayDistance(p.day, matchDay),
    allowedIntensities: getAllowedIntensities(getMatchDayDistance(p.day, matchDay)),
  }));
}

/** Secuencia semanal determinista según matriz fija (PDF objetivos 2.0). */
export function getSessionTypesForUser(objetivo, frecuencia, objetivoSecundario = null) {
  const result = resolveMatrixSessionTypes(objetivo, objetivoSecundario, frecuencia);
  return result.sessionTypes || [];
}

/**
 * Comprueba si objetivo, frecuencia, días y competición permiten una planificación coherente.
 */
export function validatePlanCoherence(user) {
  const n = parseWeeklyFrequency(user?.frecuencia);
  const availableDays = (user?.disponibles || [])
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  if (availableDays.length < n) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  const matrixResult = resolveMatrixSessionTypes(
    user?.objetivo,
    user?.objetivoSecundario,
    user?.frecuencia,
  );

  if (matrixResult.error) {
    return { ok: false, message: matrixResult.error };
  }

  const sessionTypes = matrixResult.sessionTypes;
  if (!sessionTypes?.length || sessionTypes.length !== n) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);
  const assignments = assignSessionsToDays(sessionTypes, availableDays, matchDay);

  if (assignments.length !== sessionTypes.length) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  return { ok: true, sessionTypes, assignments };
}

/** @deprecated La matriz fija ya incluye el secundario; no sustituir sesiones sueltas. */
export function applySecondaryObjective(sessions) {
  return sessions;
}

/** @deprecated La matriz fija define las sesiones de velocidad. */
export function enforceMaxOneVelocity(sessionTypes) {
  return sessionTypes;
}

/** @deprecated Usar matriz fija */
export function adaptSessionType(sessionType) {
  return sessionType;
}

export const SESSION_ADAPTATIONS = {};

export function mergeSessionTypes(primary, secondary, n) {
  const result = resolveMatrixSessionTypes(primary, secondary, String(n));
  return result.sessionTypes || [];
}
