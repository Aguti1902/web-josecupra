/**
 * Reglas de carga y colocación de sesiones — doc técnico PDF §3
 */
import { getWeeklySessionTypes, parseWeeklyFrequency } from "./planTemplates";

/** Mensaje cuando la combinación objetivo + días + competición no permite planificar bien */
export const PLAN_COHERENCE_MESSAGE = `No es posible generar una planificación óptima con los parámetros seleccionados.

La combinación entre tus días disponibles para entrenar, el día de competición y el objetivo elegido no permite distribuir correctamente las cargas de entrenamiento.

Para ofrecerte una planificación más segura y eficaz, te recomendamos modificar alguno de estos parámetros:
• añadir otro día disponible para entrenar;
• cambiar el día de entrenamiento;
• o seleccionar un objetivo diferente.

Una vez ajustados estos datos podremos generar una planificación de mayor calidad.`;

function normalizeObjKey(objetivo) {
  return (objetivo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Sesión representativa del objetivo secundario para sustituir la última complementaria */
const SECONDARY_REPLACEMENT = {
  fuerza: "Fuerza A",
  velocidad: "Velocidad",
  resistencia: "Resistencia aeróbica",
  hipertrofia: "Hipertrofia",
  estetica: "Hipertrofia",
  prevencion: "Prevención",
  movilidad: "Movilidad",
};

/** Máximo 1 sesión de Velocidad/semana; la segunda explosiva debe ser Pliometría */
export function enforceMaxOneVelocity(sessionTypes) {
  let seenVel = false;
  return sessionTypes.map((s) => {
    if (s !== "Velocidad") return s;
    if (!seenVel) {
      seenVel = true;
      return s;
    }
    return "Pliometría";
  });
}

/**
 * Objetivo secundario: sustituye la última sesión complementaria (PDF §objetivo secundario).
 * No mezcla listas completas de ambos objetivos.
 */
export function applySecondaryObjective(sessions, objetivoPrincipal, objetivoSecundario) {
  if (!sessions?.length || sessions.length < 2) return sessions;
  if (!objetivoSecundario) return sessions;
  if (normalizeObjKey(objetivoSecundario) === normalizeObjKey(objetivoPrincipal)) return sessions;

  const replacement = SECONDARY_REPLACEMENT[normalizeObjKey(objetivoSecundario)];
  if (!replacement) return sessions;

  let replaceIdx = sessions.length - 1;
  const pri = normalizeObjKey(objetivoPrincipal);
  const sec = normalizeObjKey(objetivoSecundario);

  if (pri === "resistencia" && sec === "velocidad") {
    const anaIdx = sessions.indexOf("Resistencia anaeróbica");
    if (anaIdx >= 0) replaceIdx = anaIdx;
  }

  const out = [...sessions];
  if (out[replaceIdx] === replacement) return out;
  out[replaceIdx] = replacement;
  return out;
}

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

/** Adaptación cuando el día no permite la intensidad requerida (PDF §3.6) */
export const SESSION_ADAPTATIONS = {
  "Fuerza A": { media: "Fuerza B", baja: "Movilidad" },
  "Fuerza Superior A": { media: "Fuerza Superior B", baja: "Movilidad" },
  Velocidad: { media: "Fuerza B", baja: "Movilidad" },
  Pliometría: { media: "Isométricos", baja: "Movilidad" },
  "Full Body": { media: "Fuerza B", baja: "Movilidad" },
  "Resistencia anaeróbica": { media: "Resistencia umbral", baja: "Resistencia aeróbica" },
  Hipertrofia: { media: "Fuerza B", baja: "Movilidad" },
  "Hipertrofia Anterior": { media: "Fuerza B", baja: "Movilidad" },
  "Hipertrofia Posterior": { media: "Fuerza B", baja: "Movilidad" },
  "Hipertrofia Push": { media: "Fuerza B", baja: "Movilidad" },
  "Hipertrofia Pull": { media: "Fuerza B", baja: "Movilidad" },
  "Hipertrofia Pierna": { media: "Fuerza B", baja: "Movilidad" },
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

/** Distancia en días entre día de entreno y día de partido (negativo = pre-partido) */
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

/** Intensidades permitidas según distancia al partido (PDF §3.2) */
export function getAllowedIntensities(distance) {
  if (distance === null) return ["alta", "media", "baja"];
  if (distance === -1 || distance === 1) return ["baja"];
  if (distance === -2 || distance === 2) return ["media", "baja"];
  return ["alta", "media", "baja"];
}

export function sessionIntensity(sessionType) {
  return SESSION_INTENSITY[sessionType] || "media";
}

export function adaptSessionType(sessionType, allowedIntensities) {
  const required = sessionIntensity(sessionType);
  if (allowedIntensities.includes(required)) return sessionType;
  const adaptations = SESSION_ADAPTATIONS[sessionType];
  if (!adaptations) {
    if (required === "alta" && allowedIntensities.includes("media")) return "Fuerza B";
    if (allowedIntensities.includes("baja")) return "Prevención";
    return sessionType;
  }
  if (required === "alta") {
    if (allowedIntensities.includes("media")) return adaptations.media;
    return adaptations.baja;
  }
  if (required === "media" && !allowedIntensities.includes("media")) {
    return adaptations.baja || "Movilidad";
  }
  return sessionType;
}

const HIGH_INTENSITY = new Set(
  Object.entries(SESSION_INTENSITY)
    .filter(([, v]) => v === "alta")
    .map(([k]) => k)
);

function isConsecutive(dayA, dayB) {
  const ia = DAY_ORDER.indexOf(dayA);
  const ib = DAY_ORDER.indexOf(dayB);
  return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
}

/**
 * Asigna tipos de sesión a días disponibles respetando:
 * - distancia al partido e intensidad permitida
 * - no dos sesiones ALTA consecutivas
 * - preferencias de día ideal (etiquetas)
 */
export function assignSessionsToDays(sessionTypes, availableDays, matchDay = null) {
  const pool = (availableDays?.length ? availableDays : DAY_ORDER.slice(0, 5))
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  const assignments = [];
  const usedDays = new Set();

  for (const rawType of sessionTypes) {
    let best = null;
    let bestScore = -Infinity;

    for (const day of pool) {
      if (usedDays.has(day)) continue;

      const dist = getMatchDayDistance(day, matchDay);
      const allowed = getAllowedIntensities(dist);
      const adapted = adaptSessionType(rawType, allowed);
      const intensity = sessionIntensity(adapted);

      // Penalizar ALTA consecutiva
      const prev = assignments[assignments.length - 1];
      if (prev && isConsecutive(prev.day, day)) {
        if (HIGH_INTENSITY.has(prev.sessionType) && HIGH_INTENSITY.has(adapted)) continue;
      }

      let score = 0;
      if (allowed.includes(sessionIntensity(rawType))) score += 10;
      if (intensity === "alta" && (dist === -3 || dist === 3 || dist <= -4 || dist >= 4)) score += 5;
      if (intensity === "baja" && (dist === -1 || dist === 1)) score += 8;
      if (intensity === "media" && (dist === -2 || dist === 2)) score += 6;
      score -= DAY_ORDER.indexOf(day) * 0.1;

      if (score > bestScore) {
        bestScore = score;
        best = { sessionType: adapted, day, distance: dist, allowedIntensities: allowed };
      }
    }

    if (!best) {
      const day = pool.find((d) => !usedDays.has(d)) || pool[assignments.length % pool.length];
      const dist = getMatchDayDistance(day, matchDay);
      const allowed = getAllowedIntensities(dist);
      best = {
        sessionType: adaptSessionType(rawType, allowed),
        day,
        distance: dist,
        allowedIntensities: allowed,
      };
    }

    usedDays.add(best.day);
    assignments.push(best);
  }

  return assignments;
}

export function mergeSessionTypes(primary, secondary, n) {
  const out = [];
  const seen = new Set();
  const add = (list) => {
    for (const s of list || []) {
      if (out.length >= n) return;
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  };
  add(primary);
  add(secondary);
  return out.slice(0, n);
}

export function getSessionTypesForUser(objetivo, frecuencia, objetivoSecundario = null) {
  let sessions = getWeeklySessionTypes(objetivo, frecuencia);
  sessions = enforceMaxOneVelocity(sessions);
  if (objetivoSecundario) {
    sessions = applySecondaryObjective(sessions, objetivo, objetivoSecundario);
    sessions = enforceMaxOneVelocity(sessions);
  }
  return sessions;
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

  const sessionTypes = getSessionTypesForUser(
    user?.objetivo,
    user?.frecuencia,
    user?.objetivoSecundario,
  );

  if (sessionTypes.length !== n) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);
  const assignments = assignSessionsToDays(sessionTypes, availableDays, matchDay);

  if (assignments.length !== sessionTypes.length) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  let criticalDowngrades = 0;
  for (let i = 0; i < sessionTypes.length; i++) {
    const planned = sessionTypes[i];
    const assigned = assignments[i];
    if (!assigned?.sessionType) {
      return { ok: false, message: PLAN_COHERENCE_MESSAGE };
    }
    const plannedIntensity = sessionIntensity(planned);
    if (plannedIntensity === "alta" && sessionIntensity(assigned.sessionType) === "baja") {
      criticalDowngrades += 1;
    }
  }

  if (matchDay) {
    const highSessions = sessionTypes.filter((s) => sessionIntensity(s) === "alta").length;
    const highCapacityDays = availableDays.filter((d) =>
      getAllowedIntensities(getMatchDayDistance(d, matchDay)).includes("alta"),
    ).length;
    if (highSessions > 0 && highCapacityDays === 0) {
      return { ok: false, message: PLAN_COHERENCE_MESSAGE };
    }
    if (highSessions > highCapacityDays && criticalDowngrades >= Math.ceil(highSessions / 2)) {
      return { ok: false, message: PLAN_COHERENCE_MESSAGE };
    }
  }

  if (criticalDowngrades > Math.max(1, Math.floor(n / 2))) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE };
  }

  return { ok: true, sessionTypes, assignments };
}
