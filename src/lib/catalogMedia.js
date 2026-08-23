/**
 * Resuelve URL de vídeo de un ejercicio combinando el catálogo V2,
 * el catálogo admin (fi01 / v2_1) y los overrides que sube el admin.
 */
import { EXERCISES as ADMIN_EXERCISES } from "../data/exercises.js";
import { EXERCISES as CATALOG_EXERCISES } from "./exerciseCatalog.js";

const LS_KEY = "depro_catalog_overrides";
const CLOUD_ID = "CATALOG_OVERRIDES";

export function normalizeExerciseName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function youtubeEmbedUrl(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function ingest(ex, overrides, byId, byName) {
  const o = overrides[ex.id] || overrides[String(ex.id)] || {};
  const videoUrl = String(o.videoUrl || o.video || ex.videoUrl || "").trim();
  const name = o.nombre || o.name || ex.nombre || ex.name || "";
  const rec = { id: ex.id, name, videoUrl };
  byId[String(ex.id)] = rec;
  if (ex.v2Id != null) byId[String(ex.v2Id)] = rec;
  const n = normalizeExerciseName(name);
  if (!n) return;
  const prev = byName[n];
  if (!prev || (videoUrl && !prev.videoUrl)) byName[n] = rec;
}

export function mergeCatalogMedia(overrides = {}) {
  const byId = {};
  const byName = {};
  for (const ex of ADMIN_EXERCISES) ingest(ex, overrides, byId, byName);
  for (const ex of CATALOG_EXERCISES) ingest(ex, overrides, byId, byName);
  return { byId, byName };
}

let cache = null;
let inflight = null;

export function getCatalogMediaSync() {
  if (cache) return cache;
  let overrides = {};
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw) overrides = JSON.parse(raw);
  } catch { /* ignore */ }
  cache = mergeCatalogMedia(overrides);
  return cache;
}

export function resolveExerciseVideo(ex, media = getCatalogMediaSync()) {
  if (!ex) return "";
  const direct = String(ex.videoUrl || ex.video || "").trim();
  if (direct) return direct;
  const ids = [ex.id, ex.catalogId, ex.exerciseId, ex.v2Id].filter((v) => v != null && v !== "");
  for (const id of ids) {
    const hit = media.byId[String(id)];
    if (hit?.videoUrl) return hit.videoUrl;
  }
  const n = normalizeExerciseName(ex.nombre || ex.name);
  if (media.byName[n]?.videoUrl) return media.byName[n].videoUrl;
  if (n.length >= 6) {
    for (const [k, rec] of Object.entries(media.byName)) {
      if (!rec.videoUrl) continue;
      if (k.startsWith(n) || n.startsWith(k)) return rec.videoUrl;
    }
  }
  return "";
}

export async function prefetchCatalogMedia() {
  if (typeof fetch !== "function") return getCatalogMediaSync();
  if (inflight) return inflight;
  inflight = (async () => {
    let overrides = {};
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (raw) overrides = JSON.parse(raw);
    } catch { /* ignore */ }
    try {
      const res = await fetch("/api/admin-clubs");
      if (res.ok) {
        const json = await res.json();
        const entry = (json?.clubs || []).find((c) => c.id === CLOUD_ID);
        if (entry?.overrides && typeof entry.overrides === "object") {
          overrides = { ...overrides, ...entry.overrides };
          try { localStorage.setItem(LS_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
    cache = mergeCatalogMedia(overrides);
    return cache;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
