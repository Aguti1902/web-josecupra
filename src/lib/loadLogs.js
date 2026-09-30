/** Registro de cargas por sesión — cada entrenamiento es una fotografía independiente. */

export function loadLogsKey(userId) {
  return `depro_load_logs_${userId}`;
}

export function getLoadLogs(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(loadLogsKey(userId)) || "[]");
  } catch {
    return [];
  }
}

export function writeLoadLogs(userId, logs) {
  if (!userId) return;
  try {
    localStorage.setItem(loadLogsKey(userId), JSON.stringify((logs || []).slice(0, 500)));
  } catch { /* cupo */ }
}

function queueSync(userId, logs) {
  import("./userDataSync.js").then(({ persistUserData }) => {
    persistUserData(userId, { loadLogs: logs.slice(0, 500) }).catch(() => {});
  }).catch(() => {});
}

export function saveLoadLog(userId, entry) {
  if (!userId) return null;
  const record = {
    id: `load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    recordedAt: new Date().toISOString(),
    catalogId: entry?.catalogId ?? null,
    ...entry,
  };
  const logs = [record, ...getLoadLogs(userId)];
  const clipped = logs.slice(0, 500);
  writeLoadLogs(userId, clipped);
  queueSync(userId, clipped);
  return record;
}

function logMatchesExercise(log, { exerciseId, catalogId, exerciseName } = {}) {
  if (!log) return false;
  if (exerciseId && log.exerciseId === exerciseId) return true;
  const cid = catalogId ?? null;
  if (cid != null && (log.catalogId === cid || String(log.exerciseId || "").includes(`v2_${cid}_`))) return true;
  const name = String(exerciseName || "").trim().toLowerCase();
  if (name && String(log.exerciseName || log.nombre || "").trim().toLowerCase() === name) return true;
  return false;
}

/** Último registro de un ejercicio (sobrevive si el plan se regeneró con otro instance id). */
export function findLatestLoadLog(userId, match = {}) {
  const logs = getLoadLogs(userId);
  const sameSession = logs.filter((l) => logMatchesExercise(l, match)
    && (!match.sessionId || l.sessionId === match.sessionId));
  const pool = sameSession.length ? sameSession : logs.filter((l) => logMatchesExercise(l, match));
  if (match.weekNumber != null) {
    const weekHits = pool.filter((l) => Number(l.weekNumber) === Number(match.weekNumber)
      || String(l.weekLabel || "").includes(String(match.weekNumber)));
    if (weekHits.length) return weekHits[0];
  }
  return pool[0] || null;
}

export function updateLoadLog(userId, logId, patch) {
  const logs = getLoadLogs(userId).map((l) => (l.id === logId ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l));
  writeLoadLogs(userId, logs);
  queueSync(userId, logs);
  return logs.find((l) => l.id === logId) || null;
}

export function clearTrialLoadLogs(userId) {
  if (!userId) return;
  localStorage.removeItem(loadLogsKey(userId));
  queueSync(userId, []);
}

/** Campos sugeridos según objetivo/tipo de sesión */
export function loadFieldsForObjective(objective) {
  const obj = String(objective || "").toLowerCase();
  if (obj.includes("velocidad")) {
    return ["time", "heartRate", "notes"];
  }
  if (obj.includes("resistencia")) {
    return ["distance", "time", "heartRate", "rpe", "notes"];
  }
  if (obj.includes("movilidad") || obj.includes("prevención") || obj.includes("prevencion")) {
    return ["rpe", "feelings", "notes"];
  }
  return ["weight", "sets", "reps", "notes"];
}
