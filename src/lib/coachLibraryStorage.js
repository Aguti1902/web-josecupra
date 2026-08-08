/**
 * coachLibraryStorage — persistencia de la biblioteca de ejercicios DEPRO Coach.
 *
 * Estrategia (igual que adminStorage.js): localStorage como caché offline-first,
 * `api/coach-library.js` (Supabase) como fuente de verdad, y el catálogo completo
 * (`exerciseCatalog` → coachLibraryFromCatalog) como seed la primera vez.
 */
import { getCoachLibraryFromCatalog } from "./coachLibraryFromCatalog";

const LS_KEY = "depro_coach_library";
const MIGRATE_FLAG = "depro_coach_lib_v2";

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function lsFlag(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSetFlag(key, value = "1") {
  try { localStorage.setItem(key, value); } catch {}
}

async function apiLibrary(method, body) {
  const res = await fetch("/api/coach-library", {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, data: json };
}

let _cache = null;

function catalogSeed() {
  return getCoachLibraryFromCatalog();
}

/**
 * Si el caché es el seed antiguo (~91 ítems), remigra una vez al catálogo completo
 * fusionando por id (CMS custom / ediciones se conservan).
 */
function maybeRemigrateOldSeed(list) {
  if (!Array.isArray(list) || list.length === 0) return catalogSeed();
  // Seed antiguo (~91) o incompleto: siempre ampliar al catálogo completo
  if (list.length >= 120) {
    lsSetFlag(MIGRATE_FLAG);
    return list;
  }
  const base = catalogSeed();
  const byId = new Map(base.map((e) => [e.id, e]));
  for (const ex of list) {
    if (!ex?.id) continue;
    // Conservar ediciones CMS / custom encima del catálogo base
    byId.set(ex.id, { ...(byId.get(ex.id) || {}), ...ex });
  }
  const merged = [...byId.values()];
  lsSet(LS_KEY, merged);
  lsSetFlag(MIGRATE_FLAG);
  return merged;
}

function resolveLocalSeed() {
  const local = lsGet(LS_KEY, null);
  if (local && local.length > 0) return maybeRemigrateOldSeed(local);
  const seed = catalogSeed();
  lsSet(LS_KEY, seed);
  lsSetFlag(MIGRATE_FLAG);
  return seed;
}

/** Carga la biblioteca completa (seed catálogo + ediciones del CMS + ejercicios propios) */
export async function loadCoachLibrary() {
  if (_cache) return _cache;

  try {
    const { ok, data } = await apiLibrary("GET");
    if (ok && data?.exercises?.length > 0) {
      const migrated = maybeRemigrateOldSeed(data.exercises);
      lsSet(LS_KEY, migrated);
      // Si remigramos desde el seed corto, subir el merge a la API
      if (migrated !== data.exercises && migrated.length > data.exercises.length) {
        apiLibrary("POST", { exercises: migrated }).catch(() => {});
      }
      _cache = migrated;
      return _cache;
    }
    if (ok && data && data.exercises && data.exercises.length === 0) {
      // API vacía: sembrar con catálogo completo
      const seed = resolveLocalSeed();
      apiLibrary("POST", { exercises: seed }).catch(() => {});
      _cache = seed;
      return _cache;
    }
  } catch (e) {
    console.warn("[coachLibraryStorage] loadCoachLibrary API error:", e.message);
  }

  _cache = resolveLocalSeed();
  return _cache;
}

export function getCachedCoachLibrary() {
  if (_cache) return _cache;
  _cache = resolveLocalSeed();
  return _cache;
}

export async function saveCoachLibrary(exercises) {
  _cache = exercises;
  lsSet(LS_KEY, exercises);
  lsSetFlag(MIGRATE_FLAG);
  const { ok, data } = await apiLibrary("POST", { exercises });
  if (!ok) console.warn("[coachLibraryStorage] saveCoachLibrary falló en Supabase:", data?.error);
  return { ok };
}

export async function upsertExercise(exercise) {
  const lib = await loadCoachLibrary();
  const idx = lib.findIndex((e) => e.id === exercise.id);
  let next;
  if (idx >= 0) {
    next = lib.slice();
    next[idx] = exercise;
  } else {
    next = [...lib, exercise];
  }
  await saveCoachLibrary(next);
  return next;
}

export async function deleteExercise(id) {
  const lib = await loadCoachLibrary();
  const next = lib.filter((e) => e.id !== id);
  await saveCoachLibrary(next);
  return next;
}

export async function approveExercise(id) {
  const lib = await loadCoachLibrary();
  const next = lib.map((e) => (e.id === id ? { ...e, estado: "aprobado" } : e));
  await saveCoachLibrary(next);
  return next;
}

/** Añade un ejercicio propio creado por un entrenador en modo Personalizado (queda pendiente de aprobación) */
export async function submitCustomExercise(exercise, { clubId } = {}) {
  const id = exercise.id || `coach_custom_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const full = {
    video: "", gif: "", descripcion: "", objetivo: "", subcategoria: "",
    bloquesPermitidos: ["Bloque 1", "Bloque 2", "Bloque 3"],
    protocolosPermitidos: ["A", "B", "C"],
    material: ["sin_material"], duracion: 6, complejidad: "media",
    progresion: null, regresion: null, etiquetas: [], gruposMusculares: [],
    capacidadFisica: "", espacioNecesario: "reducido", numeroJugadores: "individual",
    tiempoRecomendado: "", notas: "",
    ...exercise,
    id,
    estado: "pendiente_aprobacion",
    creadoPor: clubId || exercise.creadoPor || null,
  };
  return upsertExercise(full);
}
