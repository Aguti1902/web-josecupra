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
  return list.filter((p) => normalizeAgeBlock(p.ageBlock) === block);
}

export function isMesocycleStatusActive(plan) {
  const status = String(plan?.status || "").toLowerCase().trim();
  return status === "activo" || status === "active";
}

/**
 * Entrenadores: solo mesociclos activos del bloque.
 * Si ninguno está marcado activo, cae al que cubre las fechas de hoy.
 */
export function pickActiveMesocycles(plans) {
  const list = Array.isArray(plans) ? plans : [];
  const flagged = list.filter(isMesocycleStatusActive);
  if (flagged.length) return flagged;
  const dated = list.filter((p) => p.startDate && isDateRangeActive(p.startDate, p.endDate));
  if (dated.length) return dated;
  return list;
}

export function pickCurrentMesocycle(plans) {
  const active = pickActiveMesocycles(plans);
  if (!active.length) return null;
  const dated = active.find((p) => isDateRangeActive(p.startDate, p.endDate));
  return dated || active[0];
}

function isDateRangeActive(startDate, endDate) {
  if (!startDate) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
  return today >= start && (!end || today <= end);
}

/** Al activar un mesociclo, el resto del mismo bloque pasa a completado. */
export function activateMesocycleInList(plans, mesocycleId) {
  const list = Array.isArray(plans) ? plans : [];
  const target = list.find((p) => p.id === mesocycleId);
  if (!target) return list;
  const block = normalizeAgeBlock(target.ageBlock);
  return list.map((p) => {
    const next = { ...p, ageBlock: normalizeAgeBlock(p.ageBlock) || p.ageBlock };
    if (p.id === mesocycleId) return { ...next, status: "activo" };
    if (block && normalizeAgeBlock(p.ageBlock) === block && isMesocycleStatusActive(p)) {
      return { ...next, status: "completado" };
    }
    return next;
  });
}

export function withNormalizedAgeBlocks(plans) {
  return (Array.isArray(plans) ? plans : []).map((p) => ({
    ...p,
    ageBlock: normalizeAgeBlock(p.ageBlock) || p.ageBlock || null,
  }));
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
