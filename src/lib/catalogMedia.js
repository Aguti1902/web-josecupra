/**
 * Resuelve URL de vídeo de un ejercicio combinando el catálogo V2,
 * el catálogo admin (fi01 / v2_1) y los overrides que sube el admin.
 */
import { EXERCISES as ADMIN_EXERCISES } from "../data/exercises.js";
import { EXERCISES as CATALOG_EXERCISES } from "./exerciseCatalog.js";
import { getYouTubeId, youtubeEmbedUrl as youtubeEmbedFromId } from "./youtube.js";

const LS_KEY = "depro_catalog_overrides";
const CUSTOM_KEY = "depro_catalog_custom_exercises";
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
  const id = getYouTubeId(url);
  return id ? youtubeEmbedFromId(id) : null;
}

function writeId(byId, key, rec) {
  if (key == null || key === "") return;
  const k = String(key);
  const prev = byId[k];
  if (!prev) {
    byId[k] = rec;
    return;
  }
  byId[k] = {
    ...prev,
    ...rec,
    videoUrl: rec.videoUrl || prev.videoUrl,
    name: rec.name || prev.name,
  };
}

function ingest(ex, overrides, byId, byName) {
  const keys = [ex.id, ex.v2Id, ex.catalogId].filter((v) => v != null && v !== "");
  let o = {};
  for (const key of keys) {
    o = overrides[key] || overrides[String(key)] || o;
  }
  if (ex.v2Id != null) {
    o = overrides[`v2_${ex.v2Id}`] || o;
  }
  if (typeof ex.id === "number" || /^\d+$/.test(String(ex.id))) {
    o = overrides[`v2_${ex.id}`] || o;
  }
  const videoUrl = String(o.videoUrl || o.video || ex.videoUrl || ex.video || "").trim();
  const name = o.nombre || o.name || ex.nombre || ex.name || "";
  const rec = { id: ex.id, name, videoUrl };
  writeId(byId, ex.id, rec);
  writeId(byId, ex.v2Id, rec);
  if (typeof ex.id === "number" || /^\d+$/.test(String(ex.id))) {
    writeId(byId, `v2_${ex.id}`, rec);
  }
  if (ex.v2Id != null) writeId(byId, `v2_${ex.v2Id}`, rec);
  const n = normalizeExerciseName(name);
  if (!n) return;
  const prev = byName[n];
  if (!prev || (videoUrl && !prev.videoUrl)) byName[n] = rec;
}

function loadLocalOverrides() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadCustomExercises() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CUSTOM_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function mergeCatalogMedia(overrides = {}, extraExercises = []) {
  const byId = {};
  const byName = {};
  for (const ex of ADMIN_EXERCISES) ingest(ex, overrides, byId, byName);
  for (const ex of CATALOG_EXERCISES) ingest(ex, overrides, byId, byName);
  for (const ex of extraExercises) ingest(ex, overrides, byId, byName);
  return { byId, byName };
}

let cache = null;
let inflight = null;

export function invalidateCatalogMediaCache() {
  cache = null;
  inflight = null;
}

export function getCatalogMediaSync() {
  if (cache) return cache;
  cache = mergeCatalogMedia(loadLocalOverrides(), loadCustomExercises());
  return cache;
}

export function resolveExerciseVideo(ex, media = getCatalogMediaSync()) {
  if (!ex) return "";
  const direct = String(ex.videoUrl || ex.video || "").trim();
  if (direct && direct !== "#") return direct;
  const ids = [ex.id, ex.catalogId, ex.exerciseId, ex.v2Id];
  for (const id of ids) {
    if (id == null || id === "") continue;
    const hit = media.byId[String(id)];
    if (hit?.videoUrl) return hit.videoUrl;
    const raw = String(id);
    const num = raw.replace(/^v2_/, "").split("_")[0];
    if (num && media.byId[num]?.videoUrl) return media.byId[num].videoUrl;
    if (num && media.byId[`v2_${num}`]?.videoUrl) return media.byId[`v2_${num}`].videoUrl;
  }
  const n = normalizeExerciseName(ex.nombre || ex.name);
  if (n && media.byName[n]?.videoUrl) return media.byName[n].videoUrl;
  if (n.length >= 6) {
    for (const [k, rec] of Object.entries(media.byName)) {
      if (!rec.videoUrl) continue;
      if (k.startsWith(n) || n.startsWith(k)) return rec.videoUrl;
    }
  }
  return "";
}

export function exerciseYouTubeId(ex, media = getCatalogMediaSync()) {
  return getYouTubeId(resolveExerciseVideo(ex, media));
}

async function fetchCloudOverrides() {
  try {
    const byId = await fetch(`/api/admin-clubs?id=${encodeURIComponent(CLOUD_ID)}`);
    if (byId.ok) {
      const json = await byId.json();
      const entry = (json?.clubs || [])[0];
      if (entry?.overrides && typeof entry.overrides === "object") return entry.overrides;
    }
  } catch { /* ignore */ }
  try {
    const res = await fetch("/api/admin-clubs");
    if (!res.ok) return null;
    const json = await res.json();
    const entry = (json?.clubs || []).find((c) => c.id === CLOUD_ID);
    if (entry?.overrides && typeof entry.overrides === "object") return entry.overrides;
  } catch { /* ignore */ }
  return null;
}

export async function prefetchCatalogMedia() {
  if (typeof fetch !== "function") return getCatalogMediaSync();
  if (inflight) return inflight;
  inflight = (async () => {
    let overrides = loadLocalOverrides();
    const cloud = await fetchCloudOverrides();
    if (cloud) {
      overrides = { ...overrides, ...cloud };
      try { localStorage.setItem(LS_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
    }
    cache = mergeCatalogMedia(overrides, loadCustomExercises());
    return cache;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
