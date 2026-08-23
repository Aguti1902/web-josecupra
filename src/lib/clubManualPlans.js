/**
 * Planificación de clubs academia: UNA fuente (GLOBAL_PLANS).
 * Los clubs llevados por mí ven las mismas sesiones que Planificación admin,
 * filtradas por el bloque de edad del equipo.
 */
export const GLOBAL_PLANS_CLUB_ID = "GLOBAL_PLANS";

const AGE_BLOCK_IDS = ["Bloque 1", "Bloque 2", "Bloque 3"];
const AGE_TO_BLOCK = {
  "Sub-9": "Bloque 1",
  "Sub-10": "Bloque 1",
  "Sub-11": "Bloque 1",
  "Sub-12": "Bloque 1",
  "Sub-13": "Bloque 2",
  "Sub-14": "Bloque 2",
  "Sub-15": "Bloque 2",
  "Sub-16": "Bloque 3",
  Juvenil: "Bloque 3",
  Amateur: "Bloque 3",
};

export function clonePlans(plans) {
  try {
    return JSON.parse(JSON.stringify(Array.isArray(plans) ? plans : []));
  } catch {
    return [];
  }
}

/** "Bloque 1 · Fútbol Base" y "Bloque 1" → "Bloque 1". */
export function normalizeAgeBlock(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw);
  for (const id of AGE_BLOCK_IDS) {
    if (s === id || s.startsWith(`${id} `) || s.startsWith(`${id}·`) || s.startsWith(`${id} ·`)) return id;
  }
  return AGE_TO_BLOCK[s] || null;
}

export function ageBlockForCategory(category) {
  return AGE_TO_BLOCK[category] || normalizeAgeBlock(category);
}

/** Planes del bloque del equipo. Sin categoría, se muestran todos. */
export function filterPlansForTeam(plans, category) {
  const list = Array.isArray(plans) ? plans : [];
  const block = ageBlockForCategory(category);
  if (!block) return list;
  return list.filter((p) => {
    const pb = normalizeAgeBlock(p.ageBlock);
    if (!pb) return true;
    return pb === block;
  });
}

/** El panel de club siempre lee GLOBAL_PLANS (no club.plans). */
export function resolveClubPanelPlans(_club, globalPlans = []) {
  return Array.isArray(globalPlans) ? globalPlans : [];
}

export function pickPlansFromAdminClubsResponse(clubs, _club, fallbackGlobal = []) {
  const list = Array.isArray(clubs) ? clubs : [];
  const globalEntry = list.find((c) => c.id === GLOBAL_PLANS_CLUB_ID);
  if (globalEntry?.plans?.length) return globalEntry.plans;
  return Array.isArray(fallbackGlobal) ? fallbackGlobal : [];
}
