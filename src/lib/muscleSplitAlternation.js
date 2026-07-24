/**
 * Alternancia de split / grupo muscular entre sesiones consecutivas de fuerza o hipertrofia.
 * La matriz fija el TIPO de sesión; aquí solo se elige plantilla alternativa si hace falta.
 */

/** @typedef {"lower"|"upper"|"full"|null} MuscleGroup */

const SESSION_SPLIT_CONFIG = {
  "Fuerza A": {
    muscleGroup: "lower",
    defaultTemplate: "Fuerza A",
    alternateTemplate: "Fuerza Superior A",
    alternateTitle: "Fuerza A - Tren Superior",
  },
  "Fuerza B": {
    muscleGroup: "lower",
    defaultTemplate: "Fuerza B",
    alternateTemplate: "Fuerza Superior B",
    alternateTitle: "Fuerza B - Tren Superior",
  },
  "Fuerza Superior A": {
    muscleGroup: "upper",
    defaultTemplate: "Fuerza Superior A",
    alternateTemplate: "Fuerza A",
    alternateTitle: "Fuerza A - Tren Inferior",
  },
  "Fuerza Superior B": {
    muscleGroup: "upper",
    defaultTemplate: "Fuerza Superior B",
    alternateTemplate: "Fuerza B",
    alternateTitle: "Fuerza B - Tren Inferior",
  },
  "Hipertrofia Pierna": {
    muscleGroup: "lower",
    defaultTemplate: "Hipertrofia Pierna",
    alternateTemplate: "Hipertrofia Push",
    alternateTitle: "Hipertrofia Push",
  },
  "Hipertrofia Push": {
    muscleGroup: "upper",
    defaultTemplate: "Hipertrofia Push",
    alternateTemplate: "Hipertrofia Pull",
    alternateTitle: "Hipertrofia Pull",
  },
  "Hipertrofia Pull": {
    muscleGroup: "upper",
    defaultTemplate: "Hipertrofia Pull",
    alternateTemplate: "Hipertrofia Pierna",
    alternateTitle: "Hipertrofia Pierna",
  },
  "Hipertrofia Anterior": {
    muscleGroup: "lower",
    defaultTemplate: "Hipertrofia Anterior",
    alternateTemplate: "Hipertrofia Push",
    alternateTitle: "Hipertrofia Push",
  },
  "Hipertrofia Posterior": {
    muscleGroup: "lower",
    defaultTemplate: "Hipertrofia Posterior",
    alternateTemplate: "Hipertrofia Pull",
    alternateTitle: "Hipertrofia Pull",
  },
  "Full Body": {
    muscleGroup: "full",
    defaultTemplate: "Full Body",
    alternateTemplate: "Hipertrofia Push",
    alternateTitle: "Hipertrofia Push",
  },
  Hipertrofia: {
    muscleGroup: "full",
    defaultTemplate: "Hipertrofia",
    alternateTemplate: "Hipertrofia Push",
    alternateTitle: "Hipertrofia Push",
  },
};

const TEMPLATE_MUSCLE_FOCUS = {
  "Fuerza A": "lower",
  "Fuerza B": "lower",
  "Fuerza Superior A": "upper",
  "Fuerza Superior B": "upper",
  "Hipertrofia Pierna": "lower",
  "Hipertrofia Anterior": "lower",
  "Hipertrofia Posterior": "lower",
  "Hipertrofia Push": "upper",
  "Hipertrofia Pull": "upper",
  "Full Body": "full",
  Hipertrofia: "full",
};

const UPPER_BLOCKING_LESIONS = new Set(["hombro", "espalda"]);
const LOWER_BLOCKING_LESIONS = new Set(["rodilla", "tobillo", "pubalgia"]);

export function isSplitTrackedSession(sessionType) {
  return !!SESSION_SPLIT_CONFIG[sessionType];
}

export function getSessionMuscleGroup(sessionType) {
  return SESSION_SPLIT_CONFIG[sessionType]?.muscleGroup ?? null;
}

export function getTemplateMuscleFocus(templateKey) {
  return TEMPLATE_MUSCLE_FOCUS[templateKey] || "neutral";
}

/** ¿La plantilla alternativa es viable con material/lesiones del jugador? */
export function isAlternateTemplateAllowed(templateKey, filterParams = {}) {
  const focus = getTemplateMuscleFocus(templateKey);
  if (focus === "neutral") return true;

  const lesiones = new Set((filterParams.lesiones || []).map((l) => String(l).toLowerCase()));

  if (focus === "upper") {
    return ![...UPPER_BLOCKING_LESIONS].some((l) => lesiones.has(l));
  }
  if (focus === "lower") {
    return ![...LOWER_BLOCKING_LESIONS].some((l) => lesiones.has(l));
  }
  return true;
}

function effectiveGroupAfterTemplate(templateKey, fallbackGroup) {
  const focus = getTemplateMuscleFocus(templateKey);
  if (focus === "lower" || focus === "upper" || focus === "full") return focus;
  return fallbackGroup;
}

/**
 * Resuelve plantilla concreta manteniendo el sessionType de la matriz.
 * @param {string} sessionType
 * @param {MuscleGroup} lastMuscleGroup — grupo de la última sesión fuerza/hipertrofia generada
 * @param {object} [filterParams]
 * @returns {{ sessionType, templateKey, titleOverride, muscleGroupUsed, warning }}
 */
export function resolveSessionSplitVariant(sessionType, lastMuscleGroup, filterParams = {}) {
  const config = SESSION_SPLIT_CONFIG[sessionType];
  if (!config) {
    return {
      sessionType,
      templateKey: sessionType,
      titleOverride: null,
      muscleGroupUsed: null,
      warning: null,
    };
  }

  let templateKey = config.defaultTemplate;
  let titleOverride = null;
  let warning = null;

  const needsAlternation = lastMuscleGroup
    && config.muscleGroup
    && lastMuscleGroup === config.muscleGroup;

  if (needsAlternation && config.alternateTemplate) {
    if (isAlternateTemplateAllowed(config.alternateTemplate, filterParams)) {
      templateKey = config.alternateTemplate;
      titleOverride = config.alternateTitle || null;
    } else {
      warning = `[DEPRO alternancia] ${sessionType}: variante alternativa bloqueada por material/lesión. Se mantiene ${config.muscleGroup} en sesiones consecutivas.`;
      console.warn(warning);
    }
  }

  const muscleGroupUsed = effectiveGroupAfterTemplate(templateKey, config.muscleGroup);

  return {
    sessionType,
    templateKey,
    titleOverride,
    muscleGroupUsed,
    warning,
  };
}

/**
 * Aplica alternancia en orden de entrenamiento (días de la semana, no calendario consecutivo).
 * @param {Array<{sessionType:string, day:string}>} assignments
 * @param {object} filterParams
 * @param {MuscleGroup} [initialLastGroup] — último grupo de la semana anterior (mesociclo)
 */
export function applySplitAlternationToAssignments(assignments, filterParams = {}, initialLastGroup = null) {
  const sorted = [...assignments].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  let lastMuscleGroup = initialLastGroup;
  const warnings = [];
  const resolved = sorted.map((item) => {
    const variant = resolveSessionSplitVariant(item.sessionType, lastMuscleGroup, filterParams);
    if (variant.warning) warnings.push(variant.warning);
    if (variant.muscleGroupUsed) {
      lastMuscleGroup = variant.muscleGroupUsed;
    }
    return {
      ...item,
      templateKey: variant.templateKey,
      titleOverride: variant.titleOverride,
      matrixSessionType: item.sessionType,
    };
  });

  return { assignments: resolved, lastMuscleGroup, warnings };
}

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
