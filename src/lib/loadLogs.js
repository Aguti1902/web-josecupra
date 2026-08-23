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

export function saveLoadLog(userId, entry) {
  if (!userId) return null;
  const record = {
    id: `load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    recordedAt: new Date().toISOString(),
    ...entry,
  };
  const logs = [record, ...getLoadLogs(userId)];
  localStorage.setItem(loadLogsKey(userId), JSON.stringify(logs.slice(0, 500)));
  return record;
}

export function updateLoadLog(userId, logId, patch) {
  const logs = getLoadLogs(userId).map((l) => (l.id === logId ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l));
  localStorage.setItem(loadLogsKey(userId), JSON.stringify(logs));
  return logs.find((l) => l.id === logId) || null;
}

export function clearTrialLoadLogs(userId) {
  if (!userId) return;
  localStorage.removeItem(loadLogsKey(userId));
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
