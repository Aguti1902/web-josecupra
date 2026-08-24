/**
 * Planificación de clubs academia: UNA fuente (GLOBAL_PLANS).
 * Los clubs llevados por mí ven las mismas sesiones que Planificación admin,
 * filtradas por el bloque de edad del equipo.
 */
export const GLOBAL_PLANS_CLUB_ID = "GLOBAL_PLANS";
export const GLOBAL_PLANS_STORAGE_KEY = "depro_global_plans";
export const GLOBAL_PLANS_META_KEY = "depro_global_plans_meta";

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

function sessionWeight(session) {
  if (!session || typeof session !== "object") return 1;
  const exercises = Array.isArray(session.exercises) ? session.exercises.length : 0;
  const blocks = Array.isArray(session.blocks)
    ? session.blocks.reduce((n, b) => n + (b?.exercises?.length || 0), 0)
    : 0;
  return 1 + exercises + blocks;
}

/** Más microciclos / sesiones / ejercicios = más contenido (evita que una nube vieja pise lo local). */
export function plansRichness(plans) {
  const list = Array.isArray(plans) ? plans : [];
  return list.reduce((n, p) => {
    const sessions = Array.isArray(p?.sessions) ? p.sessions : [];
    return n + 1000 + sessions.reduce((m, s) => m + sessionWeight(s), 0);
  }, 0);
}

export function readLocalGlobalPlans() {
  try {
    const raw = localStorage.getItem(GLOBAL_PLANS_STORAGE_KEY);
    const plans = raw ? JSON.parse(raw) : [];
    const meta = JSON.parse(localStorage.getItem(GLOBAL_PLANS_META_KEY) || "null");
    return {
      plans: Array.isArray(plans) ? plans : [],
      updatedAt: Number(meta?.updatedAt) || 0,
    };
  } catch {
    return { plans: [], updatedAt: 0 };
  }
}

export function writeLocalGlobalPlans(plans, updatedAt = Date.now()) {
  const list = clonePlans(plans);
  const ts = Number(updatedAt) || Date.now();
  try {
    localStorage.setItem(GLOBAL_PLANS_STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(GLOBAL_PLANS_META_KEY, JSON.stringify({ updatedAt: ts }));
    return { ok: true, plans: list, updatedAt: ts };
  } catch {
    return { ok: false, error: "quota", plans: list, updatedAt: ts };
  }
}

/**
 * Elige local vs nube. Una GET lenta no puede borrar lo que el admin acaba de escribir.
 * dirty: el usuario ya editó en esta sesión → nunca aplicar la nube.
 */
export function pickGlobalPlansSnapshot({
  localPlans = [],
  localUpdatedAt = 0,
  remotePlans = [],
  remoteUpdatedAt = 0,
  dirty = false,
} = {}) {
  const local = Array.isArray(localPlans) ? localPlans : [];
  const remote = Array.isArray(remotePlans) ? remotePlans : [];
  const lAt = Number(localUpdatedAt) || 0;
  const rAt = Number(remoteUpdatedAt) || 0;

  if (dirty) {
    return { plans: local, updatedAt: lAt || Date.now(), source: "local-dirty" };
  }
  if (!remote.length) {
    return { plans: local, updatedAt: lAt, source: "local" };
  }
  if (!local.length) {
    return { plans: remote, updatedAt: rAt, source: "remote" };
  }
  if (lAt && rAt) {
    if (lAt > rAt) return { plans: local, updatedAt: lAt, source: "local-newer" };
    if (rAt > lAt) return { plans: remote, updatedAt: rAt, source: "remote-newer" };
  }
  if (plansRichness(local) >= plansRichness(remote)) {
    return { plans: local, updatedAt: lAt || Date.now(), source: "local-richer" };
  }
  return { plans: remote, updatedAt: rAt, source: "remote-richer" };
}

/** Fusiona una respuesta de API con lo que hay en localStorage. */
export function ingestRemoteGlobalPlans(remotePlans, remoteUpdatedAt, { dirty = false } = {}) {
  const local = readLocalGlobalPlans();
  const picked = pickGlobalPlansSnapshot({
    localPlans: local.plans,
    localUpdatedAt: local.updatedAt,
    remotePlans,
    remoteUpdatedAt,
    dirty,
  });
  if (String(picked.source).startsWith("remote")) {
    writeLocalGlobalPlans(picked.plans, picked.updatedAt || Date.now());
  }
  return picked;
}
