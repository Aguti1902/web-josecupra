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

function sameTraining(existing, entry) {
  if (!existing?.sessionId || !entry?.sessionId || existing.sessionId !== entry.sessionId) return false;
  const sameExercise = (entry.exerciseId && existing.exerciseId === entry.exerciseId)
    || (
      entry.catalogId != null
      && existing.catalogId === entry.catalogId
      && String(existing.exerciseName || "").trim().toLowerCase() === String(entry.exerciseName || "").trim().toLowerCase()
    );
  if (!sameExercise) return false;
  return Number(existing.weekNumber || 0) === Number(entry.weekNumber || 0);
}

/** Un entreno = un registro. Otro día o otra semana crea uno nuevo; reabrir el mismo actualiza el suyo. */
export function saveLoadLog(userId, entry) {
  if (!userId) return null;
  const logs = getLoadLogs(userId);
  const idx = logs.findIndex((row) => sameTraining(row, entry));
  if (idx >= 0) {
    const updated = {
      ...logs[idx],
      ...entry,
      id: logs[idx].id,
      recordedAt: logs[idx].recordedAt || new Date().toISOString(),
      catalogId: entry?.catalogId ?? logs[idx].catalogId ?? null,
      updatedAt: new Date().toISOString(),
    };
    const next = logs.map((row, i) => (i === idx ? updated : row));
    writeLoadLogs(userId, next);
    queueSync(userId, next);
    return updated;
  }
  const record = {
    id: `load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    recordedAt: new Date().toISOString(),
    catalogId: entry?.catalogId ?? null,
    ...entry,
  };
  const clipped = [record, ...logs].slice(0, 500);
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

/**
 * Registro de ESTE entreno. No rellena la semana 2 con los kilos, tiempos o
 * distancias de la semana 1: si este día no tiene registro, el formulario va vacío.
 */
export function findLatestLoadLog(userId, match = {}) {
  const logs = getLoadLogs(userId).filter((l) => logMatchesExercise(l, match));
  const week = match.weekNumber;
  const sameWeek = (l) => week == null || Number(l.weekNumber) === Number(week);
  if (match.sessionId) {
    return logs.find((l) => l.sessionId === match.sessionId && sameWeek(l)) || null;
  }
  if (week != null) {
    return logs.find((l) => sameWeek(l)) || null;
  }
  return logs[0] || null;
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
