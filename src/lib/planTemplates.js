/**
 * Plantillas fijas del PDF — estructura de sesiones jugador
 * La IA / motor local solo rellena ejercicios dentro de estos bloques.
 */

export const PLAYER_TEMPLATES = {
  "Fuerza A": {
    duration: "55–65 min",
    intensity: "Alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento", duration: "10 min", slots: 2, tags: ["movilidad", "activacion"] },
      { type: "principal", label: "Fuerza tren inferior", duration: "25 min", slots: 4, tags: ["fuerza", "tren_inferior", "gluteo"] },
      { type: "complementario", label: "Core + estabilidad", duration: "12 min", slots: 2, tags: ["core", "prevencion"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  "Fuerza B": {
    duration: "55–65 min",
    intensity: "Alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento", duration: "10 min", slots: 2, tags: ["movilidad", "activacion"] },
      { type: "principal", label: "Fuerza tren superior", duration: "25 min", slots: 4, tags: ["fuerza", "tren_superior", "empuje", "traccion"] },
      { type: "complementario", label: "Hombro + core", duration: "12 min", slots: 2, tags: ["prevencion", "hombro", "core"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  Velocidad: {
    duration: "45–55 min",
    intensity: "Máxima",
    blocks: [
      { type: "calentamiento", label: "Activación neuromuscular", duration: "12 min", slots: 2, tags: ["movilidad", "activacion"] },
      { type: "principal", label: "Sprint + aceleración", duration: "20 min", slots: 4, tags: ["velocidad", "fuerza_explosiva"] },
      { type: "complementario", label: "Pliometría controlada", duration: "10 min", slots: 2, tags: ["pliometria"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  "Resistencia aeróbica": {
    duration: "50–60 min",
    intensity: "Media",
    blocks: [
      { type: "calentamiento", label: "Calentamiento progresivo", duration: "10 min", slots: 2, tags: ["resistencia_aerobica", "movilidad"] },
      { type: "principal", label: "Bloque aeróbico continuo", duration: "30 min", slots: 3, tags: ["resistencia", "resistencia_aerobica"] },
      { type: "complementario", label: "Core resistencia", duration: "10 min", slots: 2, tags: ["core", "resistencia"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  "Resistencia anaeróbica": {
    duration: "45–55 min",
    intensity: "Alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Intervalos anaeróbicos", duration: "25 min", slots: 4, tags: ["resistencia", "resistencia_anaerobica", "velocidad"] },
      { type: "complementario", label: "Recuperación activa", duration: "8 min", slots: 2, tags: ["movilidad", "core"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  "Resistencia umbral": {
    duration: "50–60 min",
    intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Trabajo en umbral", duration: "28 min", slots: 4, tags: ["resistencia", "resistencia_umbral"] },
      { type: "complementario", label: "Fuerza resistencia", duration: "10 min", slots: 2, tags: ["fuerza", "resistencia"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  Hipertrofia: {
    duration: "55–70 min",
    intensity: "Media-alta",
    blocks: [
      { type: "calentamiento", label: "Calentamiento articular", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Hipertrofia", duration: "35 min", slots: 5, tags: ["fuerza", "estetica"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  Prevención: {
    duration: "40–50 min",
    intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Movilidad", duration: "10 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Prevención", duration: "25 min", slots: 4, tags: ["prevencion"] },
      { type: "complementario", label: "Estabilidad", duration: "10 min", slots: 2, tags: ["core", "prevencion"] },
      { type: "vuelta_calma", label: "Relajación", duration: "5 min", slots: 2, tags: ["movilidad"] },
    ],
  },
  Movilidad: {
    duration: "35–45 min",
    intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Activación suave", duration: "8 min", slots: 2, tags: ["movilidad"] },
      { type: "principal", label: "Movilidad profunda", duration: "25 min", slots: 4, tags: ["movilidad", "prevencion"] },
      { type: "complementario", label: "Respiración + core", duration: "8 min", slots: 2, tags: ["core", "movilidad"] },
      { type: "vuelta_calma", label: "Cierre", duration: "5 min", slots: 2, tags: ["movilidad"] },
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
    const seq = ["Velocidad", "Fuerza A", "Prevención", "Velocidad"];
    return seq.slice(0, n);
  }
  if (obj === "resistencia") {
    const seq = ["Resistencia aeróbica", "Resistencia anaeróbica", "Resistencia umbral", "Fuerza A"];
    return seq.slice(0, n);
  }
  if (obj === "hipertrofia" || obj === "estetica") {
    if (n === 1) return ["Hipertrofia"];
    if (n === 2) return ["Hipertrofia", "Hipertrofia"];
    if (n === 3) return ["Hipertrofia", "Hipertrofia", "Hipertrofia"];
    return ["Hipertrofia", "Hipertrofia", "Hipertrofia", "Prevención"];
  }
  if (obj === "prevencion" || obj === "movilidad") {
    const seq = ["Prevención", "Movilidad", "Prevención", "Movilidad"];
    return seq.slice(0, n);
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
