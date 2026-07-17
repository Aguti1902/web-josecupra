/**
 * coachLibraryStorage — persistencia de la biblioteca de ejercicios DEPRO Coach.
 *
 * Estrategia (igual que adminStorage.js): localStorage como caché offline-first,
 * `api/coach-library.js` (Supabase) como fuente de verdad, y la biblioteca seed
 * (`coachExerciseLibrary.js`) como contenido inicial la primera vez que se usa.
 */
import { COACH_EXERCISE_LIBRARY } from "../data/coachExerciseLibrary";

const LS_KEY = "depro_coach_library";

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
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

/** Carga la biblioteca completa (seed + ediciones del CMS + ejercicios propios pendientes) */
export async function loadCoachLibrary() {
  if (_cache) return _cache;

  try {
    const { ok, data } = await apiLibrary("GET");
    if (ok && data?.exercises?.length > 0) {
      lsSet(LS_KEY, data.exercises);
      _cache = data.exercises;
      return _cache;
    }
    if (ok && data && data.exercises && data.exercises.length === 0) {
      // Primera vez: sembrar la API con la biblioteca base para que el CMS tenga algo editable
      const local = lsGet(LS_KEY, null);
      const seed = local && local.length > 0 ? local : COACH_EXERCISE_LIBRARY;
      lsSet(LS_KEY, seed);
      apiLibrary("POST", { exercises: seed }).catch(() => {});
      _cache = seed;
      return _cache;
    }
  } catch (e) {
    console.warn("[coachLibraryStorage] loadCoachLibrary API error:", e.message);
  }

  const local = lsGet(LS_KEY, null);
  _cache = local && local.length > 0 ? local : COACH_EXERCISE_LIBRARY;
  return _cache;
}

export function getCachedCoachLibrary() {
  if (_cache) return _cache;
  const local = lsGet(LS_KEY, null);
  _cache = local && local.length > 0 ? local : COACH_EXERCISE_LIBRARY;
  return _cache;
}

export async function saveCoachLibrary(exercises) {
  _cache = exercises;
  lsSet(LS_KEY, exercises);
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
