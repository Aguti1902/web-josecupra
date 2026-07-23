/**
 * Matriz fija de selección de entrenamientos — PDF «lógica objetivos ind 2.0»
 * Completamente determinista: misma entrada → misma secuencia de sesiones.
 */
export const SECONDARY_BLOCKED_FREQ1_MESSAGE = `Con un único entrenamiento semanal solo es posible trabajar correctamente un objetivo principal. Si deseas trabajar un segundo objetivo deberás seleccionar al menos dos entrenamientos semanales.`;

export const MATRIX_UNDEFINED_PREFIX = "Combinación no definida en matriz:";

const VALID_PRIMARIES = ["fuerza", "velocidad", "resistencia", "hipertrofia", "estetica", "movilidad", "prevencion"];

export function normalizeObjectiveKey(objetivo) {
  const key = (objetivo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (key === "estetica") return "hipertrofia";
  return key;
}

/** Secuencias fijas de 5 sesiones: solo objetivo principal (sin secundario). */
export const PRIMARY_ONLY_MATRIX = {
  fuerza: ["Fuerza A", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B", "Pliometría"],
  velocidad: ["Velocidad", "Fuerza A", "Fuerza B", "Pliometría", "Prevención"],
  resistencia: ["Resistencia aeróbica", "Resistencia umbral", "Resistencia anaeróbica", "Fuerza A", "Movilidad"],
  hipertrofia: ["Hipertrofia Pierna", "Hipertrofia Push", "Hipertrofia Pull", "Full Body", "Hipertrofia Anterior"],
  movilidad: ["Movilidad", "Prevención", "Isométricos", "Full Body", "Fuerza B"],
  prevencion: ["Prevención", "Movilidad", "Isométricos", "Full Body", "Fuerza B"],
};

/** Secuencias fijas de 5 sesiones por combinación principal + secundario (PDF 2.0 + extensiones Prevención). */
export const OBJECTIVE_MATRIX = {
  fuerza: {
    velocidad: ["Fuerza A", "Velocidad", "Fuerza B", "Pliometría", "Fuerza Superior A"],
    resistencia: ["Fuerza A", "Resistencia umbral", "Fuerza B", "Fuerza Superior A", "Movilidad"],
    hipertrofia: ["Fuerza A", "Full Body", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B"],
    estetica: ["Fuerza A", "Full Body", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B"],
    movilidad: ["Fuerza A", "Movilidad", "Fuerza B", "Fuerza Superior A", "Prevención"],
    prevencion: ["Fuerza A", "Prevención", "Fuerza B", "Fuerza Superior A", "Movilidad"],
  },
  velocidad: {
    fuerza: ["Velocidad", "Fuerza A", "Pliometría", "Fuerza B", "Prevención"],
    resistencia: ["Velocidad", "Resistencia umbral", "Fuerza A", "Pliometría", "Prevención"],
    hipertrofia: ["Velocidad", "Full Body", "Fuerza A", "Pliometría", "Prevención"],
    estetica: ["Velocidad", "Full Body", "Fuerza A", "Pliometría", "Prevención"],
    movilidad: ["Velocidad", "Movilidad", "Fuerza A", "Pliometría", "Prevención"],
    prevencion: ["Velocidad", "Prevención", "Fuerza A", "Pliometría", "Movilidad"],
  },
  resistencia: {
    fuerza: ["Resistencia aeróbica", "Fuerza A", "Resistencia umbral", "Resistencia anaeróbica", "Movilidad"],
    velocidad: ["Resistencia aeróbica", "Velocidad", "Resistencia umbral", "Fuerza A", "Pliometría"],
    hipertrofia: ["Resistencia aeróbica", "Full Body", "Resistencia umbral", "Fuerza A", "Resistencia anaeróbica"],
    estetica: ["Resistencia aeróbica", "Full Body", "Resistencia umbral", "Fuerza A", "Resistencia anaeróbica"],
    movilidad: ["Resistencia aeróbica", "Movilidad", "Resistencia umbral", "Fuerza A", "Prevención"],
    prevencion: ["Resistencia aeróbica", "Prevención", "Resistencia umbral", "Fuerza A", "Movilidad"],
  },
  hipertrofia: {
    fuerza: ["Hipertrofia Pierna", "Fuerza A", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    velocidad: ["Hipertrofia Pierna", "Velocidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    resistencia: ["Hipertrofia Pierna", "Resistencia umbral", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    movilidad: ["Hipertrofia Pierna", "Movilidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    prevencion: ["Hipertrofia Pierna", "Prevención", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
  },
  movilidad: {
    fuerza: ["Movilidad", "Fuerza A", "Prevención", "Isométricos", "Full Body"],
    velocidad: ["Movilidad", "Velocidad", "Prevención", "Isométricos", "Full Body"],
    resistencia: ["Movilidad", "Resistencia umbral", "Prevención", "Isométricos", "Full Body"],
    hipertrofia: ["Movilidad", "Full Body", "Prevención", "Isométricos", "Hipertrofia Pierna"],
    estetica: ["Movilidad", "Full Body", "Prevención", "Isométricos", "Hipertrofia Pierna"],
    prevencion: ["Movilidad", "Prevención", "Isométricos", "Full Body", "Fuerza B"],
  },
  prevencion: {
    fuerza: ["Prevención", "Fuerza A", "Movilidad", "Isométricos", "Full Body"],
    velocidad: ["Prevención", "Velocidad", "Movilidad", "Isométricos", "Full Body"],
    resistencia: ["Prevención", "Resistencia aeróbica", "Movilidad", "Isométricos", "Full Body"],
    hipertrofia: ["Prevención", "Full Body", "Movilidad", "Isométricos", "Hipertrofia Pierna"],
    estetica: ["Prevención", "Full Body", "Movilidad", "Isométricos", "Hipertrofia Pierna"],
    movilidad: ["Prevención", "Movilidad", "Isométricos", "Full Body", "Fuerza B"],
  },
};

export function parseWeeklyFrequency(frecuencia) {
  return Math.min(5, Math.max(1, parseInt(String(frecuencia).replace(/\D/g, "")) || 3));
}

/** Normaliza principal + secundario desde perfil (ignora secundario obsoleto si solo hay un objetivo). */
export function resolveUserObjectives(user) {
  const principal = user?.objetivo || user?.objetivos?.[0] || "";
  let secondary = user?.objetivoSecundario || null;

  if (Array.isArray(user?.objetivos)) {
    if (user.objetivos.length <= 1) {
      secondary = null;
    } else if (!secondary) {
      secondary = user.objetivos[1] || null;
    }
  }

  if (secondary && normalizeObjectiveKey(secondary) === normalizeObjectiveKey(principal)) {
    secondary = null;
  }

  return { principal, secondary: secondary || null };
}

function matrixUndefinedMessage(principal, secondary) {
  if (secondary) {
    return `${MATRIX_UNDEFINED_PREFIX} ${principal} + ${secondary}`;
  }
  return `${MATRIX_UNDEFINED_PREFIX} ${principal} (solo principal)`;
}

/**
 * Resuelve la secuencia fija de sesiones según objetivos.
 * @returns {{ sessionTypes?: string[], fullSequence?: string[], error?: string }}
 */
export function resolveMatrixSessionTypes(objetivoPrincipal, objetivoSecundario, frecuencia) {
  const n = parseWeeklyFrequency(frecuencia);
  const pri = normalizeObjectiveKey(objetivoPrincipal);
  let sec = objetivoSecundario ? normalizeObjectiveKey(objetivoSecundario) : null;

  if (!pri || !VALID_PRIMARIES.includes(pri)) {
    const msg = `${MATRIX_UNDEFINED_PREFIX} objetivo principal «${objetivoPrincipal || "?"}» no reconocido`;
    console.error("[DEPRO matriz]", msg);
    return { error: msg };
  }

  if (sec && sec === pri) sec = null;

  if (n === 1 && sec) {
    return { error: SECONDARY_BLOCKED_FREQ1_MESSAGE };
  }

  let sequence;

  if (!sec) {
    sequence = PRIMARY_ONLY_MATRIX[pri];
    if (!sequence?.length) {
      const msg = matrixUndefinedMessage(objetivoPrincipal, null);
      console.error("[DEPRO matriz]", msg);
      return { error: msg };
    }
    sequence = [...sequence];
  } else {
    const row = OBJECTIVE_MATRIX[pri]?.[sec];
    if (!row?.length) {
      const msg = matrixUndefinedMessage(objetivoPrincipal, objetivoSecundario);
      console.error("[DEPRO matriz]", msg);
      return { error: msg };
    }
    sequence = [...row];
  }

  return {
    sessionTypes: sequence.slice(0, n),
    fullSequence: sequence,
  };
}

/** @deprecated Usar PRIMARY_ONLY_MATRIX — mantenido solo por compatibilidad de imports. */
export function getPrimaryOnlySequence(objetivo) {
  const key = normalizeObjectiveKey(objetivo);
  return PRIMARY_ONLY_MATRIX[key] ? [...PRIMARY_ONLY_MATRIX[key]] : null;
}
