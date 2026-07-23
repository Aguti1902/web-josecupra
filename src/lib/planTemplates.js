/**
 * Plantillas fijas del PDF — estructura de sesiones jugador (§2.1)
 * v2.0: slots por pool (sessionTemplatesV2.js)
 * Legacy: tags + slots numéricos (hipertrofia/resistencia detallada)
 */
import { SESSION_TEMPLATES, WEEKLY_SESSION_CONFIG, isV2Template } from "./sessionTemplatesV2";

export { isV2Template, WEEKLY_SESSION_CONFIG };

const STORAGE_KEY = "depro_template_overrides";

const BASE_BLOCKS = {
  warmup8: { type: "calentamiento", label: "Calentamiento", duration: "8 min", slots: 2, tags: ["movilidad", "activacion"] },
  warmup6: { type: "calentamiento", label: "Calentamiento", duration: "6 min", slots: 2, tags: ["movilidad", "activacion"] },
  calm:    { type: "vuelta_calma", label: "Vuelta a la calma", duration: "5 min", slots: 2, tags: ["movilidad"] },
  core:    { type: "complementario", label: "Core", duration: "12 min", slots: 2, tags: ["core", "prevencion"] },
  coreSoft:{ type: "complementario", label: "Core suave", duration: "8 min", slots: 2, tags: ["core", "prevencion"] },
};

export const PLAYER_TEMPLATES = {
  ...SESSION_TEMPLATES,
  // Plantillas legacy (sin slots v2) — resistencia detallada e hipertrofía por split
  "Resistencia aeróbica": {
    duration: "30–40 min", intensity: "Baja",
    blocks: [
      { type: "calentamiento", label: "Calentamiento progresivo", duration: "8 min", slots: 2, tags: ["movilidad", "resistencia_aerobica"] },
      { type: "principal", label: "Carrera continua 65–75%", duration: "25 min", slots: 1, tags: ["resistencia", "resistencia_aerobica", "aerobico"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Resistencia anaeróbica": {
    duration: "45–55 min", intensity: "Alta",
    blocks: [
      BASE_BLOCKS.warmup8,
      { type: "principal", label: "Intervalos anaeróbicos", duration: "25 min", slots: 4, tags: ["resistencia", "resistencia_anaerobica", "anaerobico", "velocidad"] },
      { type: "complementario", label: "Recuperación activa", duration: "8 min", slots: 2, tags: ["movilidad", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Resistencia umbral": {
    duration: "50–60 min", intensity: "Media",
    blocks: [
      BASE_BLOCKS.warmup8,
      { type: "principal", label: "Bloques en umbral (3×6 / 2×10 min)", duration: "28 min", slots: 3, tags: ["resistencia", "resistencia_umbral", "umbral"] },
      { type: "complementario", label: "Fuerza resistencia", duration: "10 min", slots: 2, tags: ["fuerza", "resistencia"] },
      BASE_BLOCKS.calm,
    ],
  },
  Hipertrofia: {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Básico", duration: "12 min", slots: 1, tags: ["fuerza", "estetica", "hip_full"] },
      { type: "principal", label: "Hipertrofia", duration: "25 min", slots: 4, tags: ["fuerza", "estetica", "tren_inferior", "tren_superior"] },
      { type: "complementario", label: "Aislamientos", duration: "12 min", slots: 2, tags: ["estetica", "tren_superior", "tren_inferior"] },
      { type: "complementario", label: "Core", duration: "4 min", slots: 1, tags: ["core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Anterior": {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Cadena anterior", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "hip_ant", "empuje", "tren_inferior"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Posterior": {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Cadena posterior", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "hip_post", "traccion", "gluteo"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Push": {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Empuje + hombro", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "hip_empuje", "empuje", "hombro"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Pull": {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Tracción + hombro", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "hip_traccion", "traccion", "hombro"] },
      { type: "complementario", label: "Brazos + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
      BASE_BLOCKS.calm,
    ],
  },
  "Hipertrofia Pierna": {
    duration: "55–70 min", intensity: "Alta",
    blocks: [
      { ...BASE_BLOCKS.warmup6, duration: "6–8 min" },
      { type: "principal", label: "Pierna + glúteo", duration: "35 min", slots: 5, tags: ["fuerza", "estetica", "hip_piernas", "tren_inferior", "gluteo"] },
      { type: "complementario", label: "Aislamiento + core", duration: "12 min", slots: 2, tags: ["estetica", "core"] },
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

/** Secuencia semanal según objetivo y frecuencia (v2 + legacy resistencia) */
export function getWeeklySessionTypes(objetivo, frecuencia) {
  const n = Math.min(4, Math.max(1, parseInt(String(frecuencia).replace(/\D/g, "")) || 3));
  const obj = (objetivo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const v2KeyMap = {
    fuerza: "Fuerza",
    velocidad: "Velocidad",
    resistencia: "Resistencia",
    hipertrofia: "Hipertrofia",
    estetica: "Hipertrofia",
    prevencion: "Prevención",
    movilidad: "Movilidad",
  };
  const v2Key = v2KeyMap[obj];
  if (v2Key && WEEKLY_SESSION_CONFIG[v2Key]?.[n]) {
    return WEEKLY_SESSION_CONFIG[v2Key][n];
  }

  if (obj === "resistencia") {
    if (n === 1) return ["Resistencia aeróbica"];
    if (n === 2) return ["Resistencia aeróbica", "Resistencia anaeróbica"];
    if (n === 3) return ["Resistencia aeróbica", "Resistencia anaeróbica", "Fuerza A"];
    return ["Resistencia aeróbica", "Resistencia anaeróbica", "Fuerza A", "Velocidad"];
  }
  if (obj === "hipertrofia" || obj === "estetica") {
    if (n === 1) return ["Full Body"];
    if (n === 2) return ["Fuerza Superior A", "Fuerza A"];
    if (n === 3) return ["Fuerza Superior A", "Fuerza Superior B", "Fuerza A"];
    return ["Fuerza Superior A", "Fuerza Superior B", "Fuerza A", "Fuerza B"];
  }
  return ["Fuerza A", "Fuerza B", "Velocidad"].slice(0, n);
}

export function countBlockSlots(block) {
  if (Array.isArray(block.slots)) {
    return block.slots.reduce((n, s) => n + (s.qty || 1), 0);
  }
  return typeof block.slots === "number" ? block.slots : 0;
}

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTemplateOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getTemplate(sessionType) {
  const base = PLAYER_TEMPLATES[sessionType] || PLAYER_TEMPLATES["Fuerza A"];
  if (isV2Template(base)) return base;
  const overrides = loadOverrides()[sessionType];
  if (!overrides?.blocks) return base;
  const blocks = base.blocks.map((b, i) => {
    const slotOverride = overrides.blocks[i]?.slots;
    return slotOverride != null ? { ...b, slots: slotOverride } : b;
  });
  return { ...base, blocks };
}

export function getAllTemplates() {
  return Object.keys(PLAYER_TEMPLATES).map((key) => ({
    id: key,
    ...getTemplate(key),
  }));
}

export function updateTemplateBlockSlots(sessionType, blockIndex, slots) {
  const overrides = loadOverrides();
  if (!overrides[sessionType]) overrides[sessionType] = { blocks: [] };
  if (!overrides[sessionType].blocks) overrides[sessionType].blocks = [];
  overrides[sessionType].blocks[blockIndex] = { slots };
  saveTemplateOverrides(overrides);
}

export function templateToPromptText(sessionType) {
  const t = getTemplate(sessionType);
  return t.blocks.map((b) => {
    if (Array.isArray(b.slots)) {
      const slotDesc = b.slots.map((s) => s.pool || s.poolPattern || s.poolFamily || "?").join(", ");
      return `${b.label} (${b.duration}): pools [${slotDesc}]`;
    }
    return `${b.label} (${b.duration}): ${b.slots} ejercicios [${(b.tags || []).join(", ")}]`;
  }).join("\n");
}
