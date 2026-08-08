/**
 * Reglas de carga, distancias al partido y colocación (Fases 1 y 3).
 */
import {
  buildWeekSessionList,
  parseWeeklyFrequency,
  SECONDARY_BLOCKED_FREQ1_MESSAGE,
  resolveUserObjectives,
  MATRIX_UNDEFINED_PREFIX,
  normalizeObjectiveKey,
  objectiveOfSession,
} from "./objectiveSessionMatrix.js";

export {
  parseWeeklyFrequency,
  SECONDARY_BLOCKED_FREQ1_MESSAGE,
  MATRIX_UNDEFINED_PREFIX,
  resolveUserObjectives,
};

export const PLAN_COHERENCE_MESSAGE = `No es posible generar una planificación óptima con los parámetros seleccionados.

La combinación entre tus días disponibles para entrenar, el día de competición y el objetivo elegido no permite distribuir correctamente las cargas de entrenamiento.

Para ofrecerte una planificación más segura y eficaz, te recomendamos modificar alguno de estos parámetros:
• añadir otro día disponible para entrenar;
• cambiar el día de entrenamiento;
• o seleccionar un objetivo diferente.

Una vez ajustados estos datos podremos generar una planificación de mayor calidad.`;

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

/** Intensidad de plantilla por tipo de sesión. */
export const SESSION_INTENSITY = {
  "Fuerza Inferior": "alta",
  "Fuerza Superior": "alta",
  "Fuerza Full": "alta",
  "Fuerza A": "alta",
  "Fuerza B": "alta",
  "Fuerza Superior A": "alta",
  "Fuerza Superior B": "alta",
  Velocidad: "alta",
  "Full Body": "alta",
  Pliometría: "alta",
  Isométricos: "baja",
  Hipertrofia: "alta",
  "Hipertrofia Anterior": "alta",
  "Hipertrofia Posterior": "alta",
  "Hipertrofia Push": "alta",
  "Hipertrofia Pull": "alta",
  "Hipertrofia Pierna": "alta",
  "Hipertrofia Torso": "alta",
  "Hipertrofia Full": "alta",
  "Resistencia anaeróbica": "alta",
  "Resistencia umbral": "media",
  "Resistencia aeróbica": "baja",
  Prevención: "baja",
  Movilidad: "baja",
  "Sesión mínima": "baja",
};

/** Intensidad mínima para considerar el objetivo "trabajado". */
export const OBJECTIVE_MIN_INTENSITY = {
  fuerza: "media",
  velocidad: "alta",
  hipertrofia: "media",
  resistencia_anaerobica: "alta",
  resistencia_umbral: "media",
  resistencia_aerobica: "baja",
  resistencia: "baja",
  prevencion: "baja",
  movilidad: "baja",
};

const INTENSITY_RANK = { baja: 1, media: 2, alta: 3 };

export function intensityRank(i) {
  return INTENSITY_RANK[i] || 0;
}

export function sessionIntensity(sessionType) {
  return SESSION_INTENSITY[sessionType] || "media";
}

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

export const COMPETITION_DAY_OPTIONS = ["Fin de semana", "Entre semana", "No compito"];

export function normalizeMatchDay(diaCompeticion) {
  if (!diaCompeticion) return null;
  const raw = String(diaCompeticion).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (raw.includes("no compito") || raw.includes("no compite") || raw === "no_compito") return null;
  if (raw.includes("fin de semana") || raw.includes("sabado")) return "Sábado";
  if (raw.includes("domingo")) return "Domingo";
  if (raw.includes("entre semana") || raw === "entre_semana") return "Viernes";
  return MATCH_DAY_MAP[raw] || null;
}

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

/**
 * Tabla de distancias actualizada:
 * −1 → MEDIA o BAJA
 * −2 → cualquiera (incluida ALTA)
 * −3+ → cualquiera
 * +1 → solo BAJA
 * +2 → MEDIA o BAJA
 * +3+ → cualquiera
 * null (no_compito) → cualquiera
 */
export function getAllowedIntensities(distance) {
  if (distance === null || distance === undefined) return ["alta", "media", "baja"];
  if (distance === -1) return ["media", "baja"];
  if (distance === 1) return ["baja"];
  if (distance === 2) return ["media", "baja"];
  if (distance === -2) return ["alta", "media", "baja"];
  return ["alta", "media", "baja"];
}

export function dayAllowsIntensity(day, matchDay, intensity) {
  const allowed = getAllowedIntensities(getMatchDayDistance(day, matchDay));
  return allowed.includes(intensity);
}

export function maxAllowedIntensity(day, matchDay) {
  const allowed = getAllowedIntensities(getMatchDayDistance(day, matchDay));
  if (allowed.includes("alta")) return "alta";
  if (allowed.includes("media")) return "media";
  return "baja";
}

function isConsecutive(dayA, dayB) {
  const ia = DAY_ORDER.indexOf(dayA);
  const ib = DAY_ORDER.indexOf(dayB);
  return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
}

function minIntensityForObjective(objKey) {
  return OBJECTIVE_MIN_INTENSITY[normalizeObjectiveKey(objKey)] || "baja";
}

/**
 * FASE 1 — Chequeo previo de compatibilidad.
 * @returns {{ ok, hardBlock?, qualityWarning?, message?, sessionTypes?, embedSecondary?, primary?, secondary? }}
 */
export function checkPlanCompatibility(user) {
  const n = parseWeeklyFrequency(user?.frecuencia);
  const availableDays = (user?.disponibles || [])
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  if (availableDays.length < n) {
    return { ok: false, hardBlock: true, message: PLAN_COHERENCE_MESSAGE };
  }

  const { principal, secondary } = resolveUserObjectives(user);
  const matrix = buildWeekSessionList(principal, secondary, user?.frecuencia);
  if (matrix.error) {
    return { ok: false, hardBlock: true, message: matrix.error };
  }

  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);
  const pri = normalizeObjectiveKey(principal);
  const minP = minIntensityForObjective(pri);

  const daysWithCapacity = availableDays.map((day) => ({
    day,
    max: maxAllowedIntensity(day, matchDay),
    allowed: getAllowedIntensities(getMatchDayDistance(day, matchDay)),
  }));

  const canWorkP = daysWithCapacity.some((d) => intensityRank(d.max) >= intensityRank(minP));
  if (!canWorkP) {
    const msg = `Tu objetivo es ${principal}, que necesita al menos un día de intensidad ${minP.toUpperCase()}. Con tus días disponibles y tu competición, ningún día admite esa intensidad. Añade más días disponibles o cambia de objetivo.`;
    return {
      ok: false,
      hardBlock: true,
      message: msg,
      sessionTypes: matrix.sessionTypes,
      primary: pri,
      secondary: matrix.secondary,
    };
  }

  const anyAlta = daysWithCapacity.some((d) => d.allowed.includes("alta"));
  let qualityWarning = null;
  if (!anyAlta && (minP === "media" || minP === "alta") && pri !== "velocidad") {
    qualityWarning = `Tu plan se generará, pero el estímulo será de intensidad media. Para progresar más en ${principal} conviene añadir un día que permita intensidad alta.`;
  }

  return {
    ok: true,
    hardBlock: false,
    qualityWarning,
    message: qualityWarning,
    sessionTypes: matrix.sessionTypes,
    embedSecondary: matrix.embedSecondary,
    fillSessions: matrix.fillSessions || [],
    fillIndexes: matrix.fillIndexes || [],
    primary: pri,
    secondary: matrix.secondary,
    availableDays,
    matchDay,
  };
}

/**
 * Colocación Fase 3: ordenar por intensidad desc; elegir día con ventana más holgada.
 * No-ALTA consecutivas es PREFERENTE.
 * Fase 3C: relleno de fuerza solo en día ALTA; si no, → Prevención.
 */
export function placeSessionsOnCalendar(sessionTypes, availableDays, matchDay = null, options = {}) {
  const pool = (availableDays?.length ? availableDays : DAY_ORDER.slice(0, 5))
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  const fillIndexSet = new Set(options.fillIndexes || []);
  const pending = [...sessionTypes].map((sessionType, idx) => ({
    sessionType,
    originalType: sessionType,
    intensity: sessionIntensity(sessionType),
    isFill: fillIndexSet.has(idx),
    idx,
  }));

  // Orden: intensidad descendente, luego índice original
  pending.sort((a, b) => intensityRank(b.intensity) - intensityRank(a.intensity) || a.idx - b.idx);

  const occupied = new Map(); // day -> assignment
  const pendingCompensate = {};

  for (const item of pending) {
    let sessionType = item.sessionType;
    let intensity = item.intensity;
    let adaptedIntensity = null;
    let substituted = false;

    // Fase 3C: relleno fuerza solo en día ALTA (y sin forzar ALTA consecutivas si hay alternativa)
    const isFillFuerza = item.isFill && String(sessionType).startsWith("Fuerza");
    if (isFillFuerza) {
      const altaDays = pool.filter((d) => !occupied.has(d) && dayAllowsIntensity(d, matchDay, "alta"));
      const nonAdjAlta = altaDays.filter((d) => {
        for (const [od, oa] of occupied) {
          if (isConsecutive(od, d) && oa.intensity === "alta") return false;
        }
        return true;
      });
      if (!altaDays.length || (!nonAdjAlta.length && [...occupied.values()].some((o) => o.intensity === "alta"))) {
        sessionType = "Prevención";
        intensity = "baja";
        substituted = true;
      }
    }

    const candidates = pool.filter((d) => !occupied.has(d));
    if (!candidates.length) break;

    // Preferir días que admitan la intensidad; si no, adaptar
    let scored = candidates.map((day) => {
      const allowed = getAllowedIntensities(getMatchDayDistance(day, matchDay));
      const max = maxAllowedIntensity(day, matchDay);
      let score = intensityRank(max) * 10;
      const fits = allowed.includes(intensity);
      if (fits) score += 50;
      else if (intensityRank(max) >= intensityRank("media") && intensity === "alta") score += 20; // adaptable
      else if (max === "baja") score += 5;

      // Preferente: no dos ALTA consecutivas
      for (const [od, oa] of occupied) {
        if (isConsecutive(od, day) && oa.intensity === "alta" && intensity === "alta") {
          score -= 30;
        }
      }

      // Preferir −3/+3 para ALTA
      const dist = getMatchDayDistance(day, matchDay);
      if (intensity === "alta" && (dist === -3 || dist === 3 || dist === -2)) score += 8;
      if (intensity === "baja" && (dist === -1 || dist === 1)) score += 6;

      score -= DAY_ORDER.indexOf(day) * 0.01;
      return { day, score, allowed, max, fits };
    });

    scored.sort((a, b) => b.score - a.score);
    let chosen = scored[0];

    // Si hay alternativa que evita ALTA consecutivas, usarla (preferente)
    if (intensity === "alta") {
      const nonAdj = scored.find((s) => {
        for (const [od, oa] of occupied) {
          if (isConsecutive(od, s.day) && oa.intensity === "alta") return false;
        }
        return true;
      });
      if (nonAdj) chosen = nonAdj;
    }

    // Adaptación / sustitución de plantilla
    if (!chosen.allowed.includes(intensity)) {
      if (intensity === "alta" && chosen.allowed.includes("media")) {
        adaptedIntensity = "media";
      } else if (chosen.max === "baja") {
        // ¿Es ALTA pura no adaptable?
        const nonAdaptable = ["Velocidad", "Resistencia anaeróbica"].includes(sessionType)
          && (getMatchDayDistance(chosen.day, matchDay) === -1 || getMatchDayDistance(chosen.day, matchDay) === 1);
        if (nonAdaptable || !canAdaptToLow(sessionType)) {
          const obj = objectiveOfSession(sessionType);
          pendingCompensate[obj] = (pendingCompensate[obj] || 0) + 1;
          sessionType = "Movilidad";
          intensity = "baja";
          adaptedIntensity = null;
          substituted = true;
        } else {
          adaptedIntensity = "baja";
        }
      } else {
        adaptedIntensity = chosen.max;
      }
    }

    occupied.set(chosen.day, {
      sessionType,
      originalType: item.originalType,
      day: chosen.day,
      intensity: sessionIntensity(sessionType),
      templateIntensity: intensity,
      adaptedIntensity,
      substituted,
      distance: getMatchDayDistance(chosen.day, matchDay),
      allowedIntensities: chosen.allowed,
      isFill: item.isFill,
    });
  }

  const assignments = [...occupied.values()].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  return { assignments, pendingCompensate };
}

function canAdaptToLow(sessionType) {
  const s = String(sessionType);
  if (s === "Velocidad" || s === "Resistencia anaeróbica") return false;
  return true;
}

/** API compatible con assignSessionsToDays. */
export function assignSessionsToDays(sessionTypes, availableDays, matchDay = null) {
  const { assignments } = placeSessionsOnCalendar(sessionTypes, availableDays, matchDay);
  return assignments.map((a) => ({
    sessionType: a.sessionType,
    day: a.day,
    distance: a.distance,
    allowedIntensities: a.allowedIntensities,
    adaptedIntensity: a.adaptedIntensity,
    originalType: a.originalType,
    substituted: a.substituted,
  }));
}

export function getSessionTypesForUser(objetivo, frecuencia, objetivoSecundario = null) {
  const result = buildWeekSessionList(objetivo, objetivoSecundario, frecuencia);
  if (result.error) {
    console.error("[DEPRO matriz] getSessionTypesForUser:", result.error);
    return [];
  }
  return result.sessionTypes || [];
}

/**
 * validatePlanCoherence — usa Fase 1.
 */
export function validatePlanCoherence(user) {
  const check = checkPlanCompatibility(user);
  if (!check.ok || check.hardBlock) {
    return { ok: false, message: check.message || PLAN_COHERENCE_MESSAGE, hardBlock: true };
  }

  const { assignments } = placeSessionsOnCalendar(
    check.sessionTypes,
    check.availableDays,
    check.matchDay,
    { fillSessions: check.fillSessions, fillIndexes: check.fillIndexes },
  );

  if (assignments.length !== check.sessionTypes.length) {
    return { ok: false, message: PLAN_COHERENCE_MESSAGE, hardBlock: true };
  }

  return {
    ok: true,
    sessionTypes: check.sessionTypes,
    assignments,
    qualityWarning: check.qualityWarning || null,
    embedSecondary: check.embedSecondary,
    primary: check.primary,
    secondary: check.secondary,
  };
}

export function applySecondaryObjective(sessions) {
  return sessions;
}

export function enforceMaxOneVelocity(sessionTypes) {
  return sessionTypes;
}

export function adaptSessionType(sessionType) {
  return sessionType;
}

export const SESSION_ADAPTATIONS = {};

export function mergeSessionTypes(primary, secondary, n) {
  const result = buildWeekSessionList(primary, secondary, String(n));
  return result.sessionTypes || [];
}
