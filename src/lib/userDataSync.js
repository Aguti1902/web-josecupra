/**
 * Datos personales del usuario (cargas individuales, wellness, tests)
 * en clubs_detail USER_DATA_{userId}. Cruzan de dispositivo.
 */

import { getLoadLogs, writeLoadLogs } from "./loadLogs.js";
import { getWellnessMap, writeWellnessMap } from "./wellnessLogs.js";

const TEST_IDS = ["resistencia", "sprint", "cod", "cmj"];

export function userDataBlobId(userId) {
  return `USER_DATA_${String(userId || "").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function playerTestStorageKey(userId, testId) {
  return `depro_test_${userId}_${testId}`;
}

export function readPlayerTests(userId) {
  if (!userId) return {};
  const out = {};
  for (const tid of TEST_IDS) {
    try {
      out[tid] = JSON.parse(localStorage.getItem(playerTestStorageKey(userId, tid)) || "[]");
    } catch {
      out[tid] = [];
    }
  }
  return out;
}

export function writePlayerTests(userId, playerTests = {}) {
  if (!userId || !playerTests || typeof playerTests !== "object") return;
  for (const [tid, entries] of Object.entries(playerTests)) {
    if (!tid) continue;
    try {
      localStorage.setItem(playerTestStorageKey(userId, tid), JSON.stringify(Array.isArray(entries) ? entries : []));
    } catch { /* cupo */ }
  }
}

export function mergeLoadLogLists(local = [], remote = []) {
  const map = new Map();
  for (const e of [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])]) {
    if (!e || typeof e !== "object") continue;
    const id = e.id || `${e.recordedAt || ""}|${e.sessionId || ""}|${e.date || ""}`;
    if (!id) continue;
    const prev = map.get(id);
    if (!prev) {
      map.set(id, e);
      continue;
    }
    const pt = Date.parse(prev.updatedAt || prev.recordedAt || 0) || 0;
    const nt = Date.parse(e.updatedAt || e.recordedAt || 0) || 0;
    map.set(id, nt >= pt ? { ...prev, ...e } : { ...e, ...prev });
  }
  return [...map.values()].sort((a, b) =>
    String(b.recordedAt || b.updatedAt || "").localeCompare(String(a.recordedAt || a.updatedAt || "")),
  );
}

export function mergeWellnessMaps(local = {}, remote = {}) {
  const out = { ...(remote && typeof remote === "object" ? remote : {}) };
  for (const [weekKey, entry] of Object.entries(local && typeof local === "object" ? local : {})) {
    const prev = out[weekKey];
    if (!prev) {
      out[weekKey] = entry;
      continue;
    }
    const pt = Date.parse(prev.updatedAt || 0) || 0;
    const nt = Date.parse(entry?.updatedAt || 0) || 0;
    out[weekKey] = nt >= pt ? { ...prev, ...entry } : { ...entry, ...prev };
  }
  return out;
}

export function mergePlayerTestsMaps(local = {}, remote = {}) {
  const keys = new Set([
    ...Object.keys(remote && typeof remote === "object" ? remote : {}),
    ...Object.keys(local && typeof local === "object" ? local : {}),
  ]);
  const out = {};
  for (const tid of keys) {
    const a = Array.isArray(local?.[tid]) ? local[tid] : [];
    const b = Array.isArray(remote?.[tid]) ? remote[tid] : [];
    const map = new Map();
    for (const e of [...b, ...a]) {
      if (!e || typeof e !== "object") continue;
      const id = e.id || `${e.date || ""}|${e.value || ""}`;
      map.set(id, e);
    }
    out[tid] = [...map.values()];
  }
  return out;
}

async function authHeaders() {
  try {
    const { supabase } = await import("./supabase.js");
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function fetchUserData(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}`, {
      headers: await authHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return json.data || null;
  } catch {
    return null;
  }
}

export async function persistUserData(userId, patch) {
  if (!userId || !patch || typeof patch !== "object") return { ok: false, error: "datos incompletos" };
  try {
    const res = await fetch("/api/user-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ userId, ...patch }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error || "Error al guardar" };
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, error: e?.message || "Error de red" };
  }
}

export function queuePersistUserData(userId, patch) {
  persistUserData(userId, patch).catch(() => {});
}

/** Login: une local + remoto y sube el resultado. */
export async function hydrateUserPersonalData(userId) {
  if (!userId) return null;
  const remote = await fetchUserData(userId);
  const localLogs = getLoadLogs(userId);
  const localWellness = getWellnessMap(userId);
  const localTests = readPlayerTests(userId);

  const loadLogs = mergeLoadLogLists(localLogs, remote?.loadLogs);
  const wellness = mergeWellnessMaps(localWellness, remote?.wellness);
  const playerTests = mergePlayerTestsMaps(localTests, remote?.playerTests);

  writeLoadLogs(userId, loadLogs);
  writeWellnessMap(userId, wellness);
  writePlayerTests(userId, playerTests);

  const hasLocal = localLogs.length || Object.keys(localWellness).length
    || Object.values(localTests).some((a) => a?.length);
  const hasRemote = remote && (remote.loadLogs?.length || Object.keys(remote.wellness || {}).length
    || Object.values(remote.playerTests || {}).some((a) => a?.length));
  if (hasLocal || hasRemote) {
    await persistUserData(userId, { loadLogs, wellness, playerTests });
  }
  return { loadLogs, wellness, playerTests };
}
