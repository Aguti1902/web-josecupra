/**
 * Tests físicos globales (protocolos/vídeos del admin).
 * GET por id para no bajar todos los clubs (móvil).
 */
import { mergeEvalTests } from "./evalTestDefaults.js";
import { mergeListsPreferVideo, countListVideos } from "./contentRestore.js";

export const GLOBAL_TESTS_ID = "GLOBAL_TESTS";
export const GLOBAL_TESTS_STORAGE_KEY = "depro_global_tests";

export function readLocalGlobalTests() {
  try {
    const raw = localStorage.getItem(GLOBAL_TESTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeLocalGlobalTests(tests) {
  try {
    localStorage.setItem(GLOBAL_TESTS_STORAGE_KEY, JSON.stringify(tests || []));
  } catch { /* cupo */ }
}

export async function fetchGlobalTestsFromCloud() {
  try {
    const r = await fetch(`/api/admin-clubs?id=${encodeURIComponent(GLOBAL_TESTS_ID)}`);
    if (!r.ok) return null;
    const data = await r.json();
    const entry = data.club
      || (data.clubs || []).find((c) => c.id === GLOBAL_TESTS_ID)
      || (data.clubs || [])[0]
      || null;
    if (!entry) return [];
    return Array.isArray(entry.tests) ? entry.tests : [];
  } catch {
    return null;
  }
}

/** Fusiona local + nube y deja el resultado en localStorage. */
export async function hydrateGlobalTests() {
  const local = readLocalGlobalTests();
  const cloud = await fetchGlobalTestsFromCloud();
  if (cloud == null) return mergeEvalTests(local);
  const merged = mergeEvalTests(mergeListsPreferVideo(local, cloud));
  writeLocalGlobalTests(merged);
  return merged;
}

/**
 * Si el admin tiene vídeos solo en este dispositivo, los sube.
 * Requiere sesión admin (POST /api/admin-clubs).
 */
export async function pushLocalGlobalTestsIfRicher() {
  const local = readLocalGlobalTests();
  if (!countListVideos(local)) return { ok: true, skipped: true };
  const cloud = await fetchGlobalTestsFromCloud();
  if (cloud == null) return { ok: false, error: "no-cloud" };
  if (countListVideos(cloud) >= countListVideos(local) && (cloud?.length || 0) >= local.length) {
    return { ok: true, skipped: true };
  }
  const merged = mergeEvalTests(mergeListsPreferVideo(local, cloud));
  const { persistGlobalTests } = await import("./adminStorage.js");
  return persistGlobalTests(merged);
}
