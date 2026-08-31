/**
 * Persistencia de URLs de vídeo del catálogo en Supabase (clubs_detail CATALOG_OVERRIDES).
 */
import { mergePreferVideo, countOverrideVideos } from "./contentRestore.js";

const LS_KEY = "depro_catalog_overrides";

export function loadLocalCatalogOverrides() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalCatalogOverrides(overrides) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify(overrides || {}));
  } catch { /* cupo */ }
}

async function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const { supabase } = await import("./supabase.js");
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch { /* sin sesión */ }
  return headers;
}

export async function fetchCatalogOverridesFromCloud() {
  try {
    const res = await fetch("/api/catalog-overrides");
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json?.overrides && typeof json.overrides === "object") return json.overrides;
    }
  } catch { /* ignore */ }
  try {
    const r = await fetch(`/api/admin-clubs?id=${encodeURIComponent("CATALOG_OVERRIDES")}`);
    if (!r.ok) return null;
    const data = await r.json();
    const entry = (data.clubs || [])[0];
    return entry?.overrides && typeof entry.overrides === "object" ? entry.overrides : null;
  } catch {
    return null;
  }
}

export async function persistCatalogOverrides(overrides) {
  saveLocalCatalogOverrides(overrides);
  const res = await fetch("/api/catalog-overrides", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ overrides }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "No se pudieron guardar los vídeos en la base de datos");
  }
  return data;
}

export async function hydrateCatalogOverrides() {
  const local = loadLocalCatalogOverrides();
  const cloud = await fetchCatalogOverridesFromCloud();
  if (!cloud) return { overrides: local, shouldPush: countOverrideVideos(local) > 0 };
  const merged = mergePreferVideo(local, cloud);
  saveLocalCatalogOverrides(merged);
  return {
    overrides: merged,
    shouldPush: countOverrideVideos(merged) > countOverrideVideos(cloud),
  };
}
