/**
 * Validador de cobertura / solapes musculares.
 * La Fase 2 garantiza cobertura por construcción; este módulo solo detecta y avisa.
 */

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** @typedef {"lower"|"upper"|"full"|null} MuscleGroup */

const TEMPLATE_MUSCLE_FOCUS = {
  "Fuerza Inferior": "lower",
  "Fuerza Superior": "upper",
  "Fuerza Full": "full",
  "Fuerza A": "lower",
  "Fuerza B": "upper",
  "Fuerza Superior A": "upper",
  "Fuerza Superior B": "upper",
  "Hipertrofia Pierna": "lower",
  "Hipertrofia Torso": "upper",
  "Hipertrofia Full": "full",
  "Hipertrofia Anterior": "lower",
  "Hipertrofia Posterior": "lower",
  "Hipertrofia Push": "upper",
  "Hipertrofia Pull": "upper",
  "Full Body": "full",
  Hipertrofia: "full",
};

export function isSplitTrackedSession(sessionType) {
  return sessionType in TEMPLATE_MUSCLE_FOCUS;
}

export function getSessionMuscleGroup(sessionType) {
  return TEMPLATE_MUSCLE_FOCUS[sessionType] ?? null;
}

export function getTemplateMuscleFocus(templateKey) {
  return TEMPLATE_MUSCLE_FOCUS[templateKey] || "neutral";
}

/** Compat: ya no se corrige; se mantiene la plantilla de la matriz. */
export function isAlternateTemplateAllowed() {
  return true;
}

/**
 * Compat API: no altera templateKey (cobertura por construcción).
 */
export function resolveSessionSplitVariant(sessionType, lastMuscleGroup = null) {
  const muscleGroupUsed = getSessionMuscleGroup(sessionType);
  return {
    sessionType,
    templateKey: sessionType,
    titleOverride: null,
    muscleGroupUsed,
    warning: null,
  };
}

/**
 * Valida solapes de grupo muscular en sesiones consecutivas.
 * No corrige: solo emite warnings.
 */
export function validateMuscleCoverage(assignments = []) {
  const sorted = [...assignments].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const warnings = [];
  let lastGroup = null;
  let lastType = null;

  for (const item of sorted) {
    const key = item.templateKey || item.sessionType;
    const group = getSessionMuscleGroup(key);
    if (group && lastGroup && group === lastGroup && group !== "full") {
      warnings.push(
        `[DEPRO validador] Solape muscular: ${lastType} (${lastGroup}) → ${key} (${group}) en días consecutivos de plan.`,
      );
    }
    if (group) {
      lastGroup = group;
      lastType = key;
    }
  }

  // Cobertura fuerza: empuje+tracción / anterior+posterior cuando hay ≥2 sesiones fuerza
  const fuerza = sorted.filter((a) => String(a.sessionType || a.templateKey).startsWith("Fuerza"));
  if (fuerza.length >= 2) {
    const groups = new Set(fuerza.map((a) => getSessionMuscleGroup(a.templateKey || a.sessionType)));
    if (!groups.has("full") && !(groups.has("lower") && groups.has("upper"))) {
      warnings.push("[DEPRO validador] Cobertura fuerza incompleta: falta tren inferior o superior.");
    }
  }

  return { ok: warnings.length === 0, warnings };
}

/**
 * Compat: ya no alterna plantillas; adjunta templateKey = sessionType y valida.
 */
export function applySplitAlternationToAssignments(assignments, filterParams = {}, initialLastGroup = null) {
  void filterParams;
  const sorted = [...assignments].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  let lastMuscleGroup = initialLastGroup;
  const resolved = sorted.map((item) => {
    const group = getSessionMuscleGroup(item.sessionType);
    if (group) lastMuscleGroup = group;
    return {
      ...item,
      templateKey: item.templateKey || item.sessionType,
      titleOverride: item.titleOverride || null,
      matrixSessionType: item.sessionType,
    };
  });

  const { warnings } = validateMuscleCoverage(resolved);
  if (warnings.length) {
    warnings.forEach((w) => console.warn(w));
  }

  return { assignments: resolved, lastMuscleGroup, warnings };
}
