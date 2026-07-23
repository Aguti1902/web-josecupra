/**
 * Matriz fija de selección de entrenamientos — PDF «lógica objetivos ind 2.0»
 * Completamente determinista: misma entrada → misma secuencia de sesiones.
 */
import { WEEKLY_SESSION_CONFIG } from "./sessionTemplatesV2";

export const SECONDARY_BLOCKED_FREQ1_MESSAGE = `Con un único entrenamiento semanal solo es posible trabajar correctamente un objetivo principal. Si deseas trabajar un segundo objetivo deberás seleccionar al menos dos entrenamientos semanales.`;

export function normalizeObjectiveKey(objetivo) {
  return (objetivo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Secuencias fijas de 5 sesiones por combinación principal + secundario */
export const OBJECTIVE_MATRIX = {
  fuerza: {
    velocidad: ["Fuerza A", "Velocidad", "Fuerza B", "Pliometría", "Fuerza Superior A"],
    resistencia: ["Fuerza A", "Resistencia umbral", "Fuerza B", "Fuerza Superior A", "Movilidad"],
    hipertrofia: ["Fuerza A", "Full Body", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B"],
    estetica: ["Fuerza A", "Full Body", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B"],
    movilidad: ["Fuerza A", "Movilidad", "Fuerza B", "Fuerza Superior A", "Prevención"],
  },
  velocidad: {
    fuerza: ["Velocidad", "Fuerza A", "Pliometría", "Fuerza B", "Prevención"],
    resistencia: ["Velocidad", "Resistencia umbral", "Fuerza A", "Pliometría", "Prevención"],
    hipertrofia: ["Velocidad", "Full Body", "Fuerza A", "Pliometría", "Prevención"],
    estetica: ["Velocidad", "Full Body", "Fuerza A", "Pliometría", "Prevención"],
    movilidad: ["Velocidad", "Movilidad", "Fuerza A", "Pliometría", "Prevención"],
  },
  resistencia: {
    fuerza: ["Resistencia aeróbica", "Fuerza A", "Resistencia umbral", "Resistencia anaeróbica", "Movilidad"],
    velocidad: ["Resistencia aeróbica", "Velocidad", "Resistencia umbral", "Fuerza A", "Pliometría"],
    hipertrofia: ["Resistencia aeróbica", "Full Body", "Resistencia umbral", "Fuerza A", "Resistencia anaeróbica"],
    estetica: ["Resistencia aeróbica", "Full Body", "Resistencia umbral", "Fuerza A", "Resistencia anaeróbica"],
    movilidad: ["Resistencia aeróbica", "Movilidad", "Resistencia umbral", "Fuerza A", "Prevención"],
  },
  hipertrofia: {
    fuerza: ["Hipertrofia Pierna", "Fuerza A", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    velocidad: ["Hipertrofia Pierna", "Velocidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    resistencia: ["Hipertrofia Pierna", "Resistencia umbral", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    movilidad: ["Hipertrofia Pierna", "Movilidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    estetica: ["Hipertrofia Pierna", "Fuerza A", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
  },
  estetica: {
    fuerza: ["Hipertrofia Pierna", "Fuerza A", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    velocidad: ["Hipertrofia Pierna", "Velocidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    resistencia: ["Hipertrofia Pierna", "Resistencia umbral", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
    movilidad: ["Hipertrofia Pierna", "Movilidad", "Hipertrofia Push", "Hipertrofia Pull", "Full Body"],
  },
  movilidad: {
    fuerza: ["Movilidad", "Fuerza A", "Prevención", "Isométricos", "Full Body"],
    velocidad: ["Movilidad", "Velocidad", "Prevención", "Isométricos", "Full Body"],
    resistencia: ["Movilidad", "Resistencia umbral", "Prevención", "Isométricos", "Full Body"],
    hipertrofia: ["Movilidad", "Full Body", "Prevención", "Isométricos", "Hipertrofia Pierna"],
    estetica: ["Movilidad", "Full Body", "Prevención", "Isométricos", "Hipertrofia Pierna"],
  },
  prevencion: {
    fuerza: ["Prevención", "Fuerza A", "Movilidad", "Isométricos", "Full Body"],
    velocidad: ["Prevención", "Velocidad", "Movilidad", "Isométricos", "Full Body"],
    resistencia: ["Prevención", "Resistencia aeróbica", "Movilidad", "Isométricos", "Full Body"],
    hipertrofia: ["Prevención", "Full Body", "Movilidad", "Isométricos", "Hipertrofia Pierna"],
    movilidad: ["Prevención", "Movilidad", "Isométricos", "Full Body", "Fuerza B"],
  },
};

const PRIMARY_CONFIG_KEY = {
  fuerza: "Fuerza",
  velocidad: "Velocidad",
  resistencia: "Resistencia",
  hipertrofia: "Hipertrofia",
  estetica: "Hipertrofia",
  prevencion: "Prevención",
  movilidad: "Movilidad",
};

export function parseWeeklyFrequency(frecuencia) {
  return Math.min(5, Math.max(1, parseInt(String(frecuencia).replace(/\D/g, "")) || 3));
}

/** Secuencia de 5 sesiones solo con objetivo principal (sin secundario). */
export function getPrimaryOnlySequence(objetivo) {
  const key = normalizeObjectiveKey(objetivo);
  const configKey = PRIMARY_CONFIG_KEY[key] || "Fuerza";
  const seq = WEEKLY_SESSION_CONFIG[configKey]?.[5];
  if (seq?.length) return [...seq];
  return ["Fuerza A", "Fuerza B", "Fuerza Superior A", "Fuerza Superior B", "Pliometría"];
}

/**
 * Resuelve la secuencia fija de 5 sesiones según objetivos.
 * @returns {{ sessionTypes?: string[], error?: string }}
 */
export function resolveMatrixSessionTypes(objetivoPrincipal, objetivoSecundario, frecuencia) {
  const n = parseWeeklyFrequency(frecuencia);
  const pri = normalizeObjectiveKey(objetivoPrincipal);
  let sec = objetivoSecundario ? normalizeObjectiveKey(objetivoSecundario) : null;

  if (sec && (sec === pri || sec === "prevencion" && pri === "prevencion")) {
    sec = null;
  }

  if (n === 1 && sec) {
    return { error: SECONDARY_BLOCKED_FREQ1_MESSAGE };
  }

  let sequence;
  if (sec && OBJECTIVE_MATRIX[pri]?.[sec]) {
    sequence = [...OBJECTIVE_MATRIX[pri][sec]];
  } else {
    sequence = getPrimaryOnlySequence(objetivoPrincipal);
  }

  return { sessionTypes: sequence.slice(0, n) };
}
