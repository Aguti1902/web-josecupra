/**
 * Overrides de plantillas (nº de ejercicios, series, reps, descanso).
 * El admin los guarda en la nube para que el motor y las rutinas de los jugadores los usen.
 */
export const GLOBAL_TEMPLATES_ID = "GLOBAL_TEMPLATES";
export const STORAGE_KEY = "depro_template_overrides";

export function readLocalTemplateOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLocalTemplateOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides && typeof overrides === "object" ? overrides : {}));
  } catch { /* cupo */ }
}

export async function fetchTemplateOverridesFromCloud() {
  try {
    const r = await fetch(`/api/admin-clubs?id=${encodeURIComponent(GLOBAL_TEMPLATES_ID)}`);
    if (!r.ok) return null;
    const data = await r.json();
    const entry = data.club
      || (data.clubs || []).find((c) => c.id === GLOBAL_TEMPLATES_ID)
      || (data.clubs || [])[0]
      || null;
    if (!entry) return {};
    const ov = entry.overrides || entry.templates || entry.templateOverrides;
    return ov && typeof ov === "object" ? ov : {};
  } catch {
    return null;
  }
}

function mergeOverrides(local = {}, cloud = {}) {
  return { ...cloud, ...local };
}

export async function hydrateTemplateOverrides() {
  const local = readLocalTemplateOverrides();
  const cloud = await fetchTemplateOverridesFromCloud();
  if (cloud == null) return local;
  const merged = mergeOverrides(local, cloud);
  writeLocalTemplateOverrides(merged);
  return merged;
}

export async function persistTemplateOverrides(overrides) {
  const data = overrides && typeof overrides === "object" ? overrides : readLocalTemplateOverrides();
  writeLocalTemplateOverrides(data);
  try {
    const { persistGlobalTemplates } = await import("./adminStorage.js");
    return persistGlobalTemplates(data);
  } catch {
    return { ok: false };
  }
}
