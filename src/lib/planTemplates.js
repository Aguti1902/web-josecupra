/**
 * Plantillas de sesión DEPRO — slots etiquetados v2 + overrides admin.
 */
import {
  SESSION_TEMPLATES,
  WEEKLY_SESSION_CONFIG,
  isV2Template,
  getResistanceVariantKey,
} from "./sessionTemplatesV2.js";
import { resolveMatrixSessionTypes } from "./objectiveSessionMatrix.js";

export { isV2Template, WEEKLY_SESSION_CONFIG, getResistanceVariantKey };

const STORAGE_KEY = "depro_template_overrides";

export const PLAYER_TEMPLATES = {
  ...SESSION_TEMPLATES,
  "Sesión mínima": {
    title: "Sesión mínima",
    duration: "20–25 min",
    intensityLevel: "baja",
    objective: "movilidad",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento suave",
        duration: "8 min",
        slots: [{ rol: "calentamiento", objetivo: "movilidad", qty: 1, description: "Warm-up" }],
      },
      {
        type: "complementario",
        label: "Core + estabilidad",
        duration: "10 min",
        slots: [
          { rol: "core", qty: 1, description: "Core" },
          { rol: "complementario", objetivo: "prevencion", qty: 1, description: "Estabilidad" },
        ],
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [{ rol: "vuelta_calma", qty: 1, description: "Cool-down" }],
      },
    ],
  },
  // Aliases hipertrofia legacy
  Hipertrofia: SESSION_TEMPLATES["Hipertrofia Full"],
  "Hipertrofia Anterior": SESSION_TEMPLATES["Hipertrofia Pierna"],
  "Hipertrofia Posterior": SESSION_TEMPLATES["Hipertrofia Pierna"],
};

/** Secuencia semanal determinista. */
export function getWeeklySessionTypes(objetivo, frecuencia) {
  const result = resolveMatrixSessionTypes(objetivo, null, frecuencia);
  return result.sessionTypes || [];
}

export function countBlockSlots(block) {
  if (Array.isArray(block.slots)) {
    return block.slots.reduce((n, s) => n + (typeof s === "object" ? (s.qty || 1) : 1), 0);
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
  const base = PLAYER_TEMPLATES[sessionType] || PLAYER_TEMPLATES["Fuerza Inferior"] || PLAYER_TEMPLATES["Fuerza A"];
  const overrides = loadOverrides()[sessionType];

  if (isV2Template(base)) {
    if (!overrides?.v2Blocks) return base;
    const blocks = base.blocks.map((b, i) => {
      const slotQtys = overrides.v2Blocks[i]?.slotQtys;
      if (!slotQtys || !Array.isArray(b.slots)) return b;
      return {
        ...b,
        slots: b.slots.map((s, si) => ({
          ...s,
          qty: Math.max(1, slotQtys[si] != null ? slotQtys[si] : (s.qty || 1)),
        })),
      };
    });
    return { ...base, blocks };
  }

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
  const base = PLAYER_TEMPLATES[sessionType] || PLAYER_TEMPLATES["Fuerza Inferior"];
  const overrides = loadOverrides();
  if (!overrides[sessionType]) overrides[sessionType] = { blocks: [], v2Blocks: [] };

  if (isV2Template(base)) {
    const block = base.blocks[blockIndex];
    if (!Array.isArray(block?.slots)) return;
    const existing = overrides[sessionType].v2Blocks?.[blockIndex]?.slotQtys
      || block.slots.map((s) => s.qty || 1);
    const current = existing.reduce((n, q) => n + q, 0);
    const target = Math.max(1, Math.min(12, slots));
    const delta = target - current;
    const slotQtys = [...existing];
    const lastIdx = Math.max(0, slotQtys.length - 1);
    slotQtys[lastIdx] = Math.max(1, slotQtys[lastIdx] + delta);
    if (!overrides[sessionType].v2Blocks) overrides[sessionType].v2Blocks = [];
    overrides[sessionType].v2Blocks[blockIndex] = { slotQtys };
  } else {
    if (!overrides[sessionType].blocks) overrides[sessionType].blocks = [];
    overrides[sessionType].blocks[blockIndex] = { slots };
  }
  saveTemplateOverrides(overrides);
}

export function templateToPromptText(sessionType) {
  const t = getTemplate(sessionType);
  return t.blocks.map((b) => {
    if (Array.isArray(b.slots) && typeof b.slots[0] === "object") {
      const slotDesc = b.slots.map((s) => s.rol || s.patron || s.description || "?").join(", ");
      return `${b.label} (${b.duration}): slots [${slotDesc}]`;
    }
    return `${b.label} (${b.duration}): ${b.slots} ejercicios [${(b.tags || []).join(", ")}]`;
  }).join("\n");
}
