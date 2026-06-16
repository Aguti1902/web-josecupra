/**
 * Plantillas fijas del PDF — estructura de sesiones jugador
 * La IA / motor local solo rellena ejercicios dentro de estos bloques.
 */

const BASE_BLOCKS = {
  warmup: { type: "calentamiento", label: "Calentamiento", duration: "10 min", slots: 2, tags: ["movilidad", "activacion"] },
  calm:   { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
  core:   { type: "complementario", label: "Core + estabilidad", duration: "12 min", slots: 2, tags: ["core", "prevencion"] },
};

export const PLAYER_TEMPLATES = {
  "Fuerza A": {
    duration: "55–65 min", intensity: "Alta",
    blocks: [
      BASE_BLOCKS.warmup,
      { type: "principal", label: "Fuerza tren inferior", duration: "25 min", slots: 4, tags: ["fuerza", "tren_inferior", "gluteo"] },
      BASE_BLOCKS.core,
      BASE_BLOCKS.calm,
    ],
  },
  "Fuerza B": {
    duration: "55–65 min", intensity: "Alta",
    blocks: [
      BASE_BLOCKS.warmup,
      { type: "principal", label: "Fuerza tren superior", duration: "25 min", slots: 4, tags: ["fuerza", "tren_superior", "empuje", "traccion"] },
      { type: "complementario", label: "Hombro + core", duration: "12 min", slots: 2, tags: ["prevencion", "hombro", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  Velocidad: {
    duration: "45–55 min", intensity: "Máxima",
    blocks: [
      { type: "calentamiento", label: "Activación neuromuscular", duration: "12 min", slots: 2, tags: ["movilidad", "activacion"] },
      { type: "principal", label: "Sprint + aceleración", duration: "20 min", slots: 4, tags: ["velocidad", "fuerza_explosiva"] },
      { type: "complementario", label: "Pliometría controlada", duration: "10 min", slots: 2, tags: ["pliometria"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Resistencia aeróbica": {
    duration: "50–60 min", intensity: "Media",
    blocks: [
      { type: "calentamiento", label: "Calentamiento progresivo", duration: "10 min", slots: 2, tags: ["resistencia_aerobica", "movilidad"] },
      { type: "principal", label: "Bloque aeróbico continuo", duration: "30 min", slots: 3, tags: ["resistencia", "resistencia_aerobica"] },
      { type: "complementario", label: "Core resistencia", duration: "10 min", slots: 2, tags: ["core", "resistencia"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Resistencia anaeróbica": {
    duration: "45–55 min", intensity: "Alta",
    blocks: [
      BASE_BLOCKS.warmup,
      { type: "principal", label: "Intervalos anaeróbicos", duration: "25 min", slots: 4, tags: ["resistencia", "resistencia_anaerobica", "velocidad"] },
      { type: "complementario", label: "Recuperación activa", duration: "8 min", slots: 2, tags: ["movilidad", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Resistencia umbral": {
    duration: "50–60 min", intensity: "Media-alta",
    blocks: [
      BASE_BLOCKS.warmup,
      { type: "principal", label: "Trabajo en umbral", duration: "28 min", slots: 4, tags: ["resistencia", "resistencia_umbral"] },
      { type: "complementario", label: "Fuerza resistencia", duration: "10 min", slots: 2, tags: ["fuerza", "resistencia"] },
      BASE_BLOCKS.calm,
    ],
  },
  Hipertrofia: {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Full body", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "tren_inferior", "tren_superior"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Anterior": {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Cadena anterior", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "tren_inferior", "empuje"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Posterior": {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Cadena posterior", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "gluteo", "traccion"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Push": {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Empuje + hombro", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "empuje", "hombro", "tren_superior"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Pull": {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Tracción + hombro", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "traccion", "hombro", "tren_superior"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Pierna": {
    duration: "55–70 min", intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Pierna + glúteo", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "tren_inferior", "gluteo"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  Prevención: {
    duration: "40–50 min", intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Movilidad", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Prevención", duration: "25 min", slots: 4, tags: ["prevencion"] },
      { type: "complementario", label: "Estabilidad", duration: "10 min", slots: 2, tags: ["core", "prevencion"] },
      BASE_BLOCKS.calm,
    ],
  },
  Movilidad: {
    duration: "35–45 min", intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Activación suave", duration: "8 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Movilidad profunda", duration: "25 min", slots: 4, tags: ["movilidad", "prevencion"] },
      { type: "complementario", label: "Respiración + core", duration: "8 min", slots: 2, tags: ["core", "movilidad"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Sesión mínima": {
    duration: "20–25 min", intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Calentamiento suave", duration: "8 min", slots: 2, tags: ["movilidad", "activacion"] },
      { type: "complementario", label: "Core + estabilidad", duration: "10 min", slots: 2, tags: ["core", "prevencion"] },
      BASE_BLOCKS.calm,
    ],
  },
};

/** Secuencia semanal según objetivo y frecuencia (PDF) */
export function getWeeklySessionTypes(objetivo, frecuencia) {
  const n = parseInt(String(frecuencia).replace(/\D/g, "")) || 3;
  const obj = (objetivo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (obj === "fuerza") {
    if (n === 1) return ["Fuerza A"];
    if (n === 2) return ["Fuerza A", "Fuerza B"];
    if (n === 3) return ["Fuerza A", "Fuerza B", "Velocidad"];
    return ["Fuerza A", "Fuerza B", "Velocidad", "Prevención"];
  }
  if (obj === "velocidad") {
    return ["Velocidad", "Fuerza A", "Prevención", "Velocidad"].slice(0, n);
  }
  if (obj === "resistencia") {
    if (n === 1) return ["Resistencia aeróbica"];
    if (n === 2) return ["Resistencia aeróbica", "Resistencia anaeróbica"];
    if (n === 3) return ["Resistencia aeróbica", "Resistencia anaeróbica", "Resistencia umbral"];
    return ["Resistencia aeróbica", "Resistencia anaeróbica", "Resistencia umbral", "Fuerza A"];
  }
  if (obj === "hipertrofia" || obj === "estetica") {
    if (n === 1) return ["Hipertrofia"];
    if (n === 2) return ["Hipertrofia Anterior", "Hipertrofia Posterior"];
    if (n === 3) return ["Hipertrofia Push", "Hipertrofia Pull", "Hipertrofia Pierna"];
    return ["Hipertrofia Push", "Hipertrofia Pull", "Hipertrofia Pierna", "Prevención"];
  }
  if (obj === "prevencion" || obj === "movilidad") {
    return ["Prevención", "Movilidad", "Prevención", "Movilidad"].slice(0, n);
  }
  return ["Fuerza A", "Fuerza B", "Velocidad"].slice(0, n);
}

export function getTemplate(sessionType) {
  return PLAYER_TEMPLATES[sessionType] || PLAYER_TEMPLATES["Fuerza A"];
}

export function templateToPromptText(sessionType) {
  const t = getTemplate(sessionType);
  return t.blocks.map((b) => `${b.label} (${b.duration}): ${b.slots} ejercicios [${b.tags.join(", ")}]`).join("\n");
}
