/**
 * Recupera catálogo / calentamientos / tests sin pisar vídeos locales.
 */

export function coerceContentList(raw) {
  if (Array.isArray(raw)) return raw.filter((x) => x && typeof x === "object");
  if (!raw || typeof raw !== "object") return [];
  const numeric = Object.keys(raw)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => raw[k])
    .filter((x) => x && typeof x === "object");
  if (numeric.length) return numeric;
  return Object.entries(raw)
    .filter(([k, v]) => v && typeof v === "object" && k !== "purgedPlayers" && k !== "users" && k !== "teams")
    .filter(([, v]) => v.videoUrl || v.video || v.id)
    .map(([id, v]) => ({ id: v.id || id, ...v, videoUrl: v.videoUrl || v.video || "" }));
}

export function countOverrideVideos(overrides) {
  if (!overrides || typeof overrides !== "object") return 0;
  return Object.values(overrides).filter((o) => o && (o.videoUrl || o.video)).length;
}

export function mergePreferVideo(local = {}, cloud = {}) {
  const out = { ...(cloud || {}) };
  for (const [key, lv] of Object.entries(local || {})) {
    const cv = out[key] && typeof out[key] === "object" ? out[key] : {};
    const loc = lv && typeof lv === "object" ? lv : {};
    out[key] = {
      ...cv,
      ...loc,
      videoUrl: loc.videoUrl || loc.video || cv.videoUrl || cv.video || "",
      video: loc.video || loc.videoUrl || cv.video || cv.videoUrl || "",
    };
  }
  return out;
}

export function countListVideos(list) {
  return coerceContentList(list).filter((x) => x.videoUrl || x.video).length;
}

/** Une listas (calentamientos, tareas, tests): el vídeo local gana; no duplica por id/URL. */
export function mergeListsPreferVideo(local = [], cloud = []) {
  const out = [];
  const seenId = new Set();
  const seenVideo = new Set();
  const push = (item) => {
    if (!item || typeof item !== "object") return;
    const id = item.id != null && item.id !== "" ? String(item.id) : "";
    const vid = String(item.videoUrl || item.video || "").trim();
    if (id && seenId.has(id)) {
      const existing = out.find((x) => String(x.id) === id);
      if (existing && vid && !(existing.videoUrl || existing.video)) {
        existing.videoUrl = vid;
        existing.video = vid;
      }
      return;
    }
    if (vid && seenVideo.has(vid)) return;
    if (id) seenId.add(id);
    if (vid) seenVideo.add(vid);
    out.push({
      ...item,
      videoUrl: item.videoUrl || item.video || "",
      video: item.video || item.videoUrl || "",
    });
  };
  coerceContentList(local).forEach(push);
  coerceContentList(cloud).forEach(push);
  return out;
}

/** No sustituir una lista con vídeos por un POST vacío (fallo de red / sesión). */
export function protectContentList(incoming, existing) {
  const inc = coerceContentList(incoming);
  const ex = coerceContentList(existing);
  if (inc.length === 0 && countListVideos(ex) > 0) return ex;
  return inc;
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

export async function fetchMetaClub(id) {
  if (typeof fetch !== "function") return null;
  try {
    const r = await fetch(`/api/admin-clubs?id=${encodeURIComponent(id)}`);
    if (!r.ok) return null;
    const data = await r.json();
    return (data.clubs || [])[0] || null;
  } catch {
    return null;
  }
}

export async function saveMetaClub(id, name, detail) {
  if (typeof fetch !== "function") return false;
  const res = await fetch("/api/admin-clubs", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ club: { id, name }, detail }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo guardar en la base de datos");
  }
  return true;
}
