/** Persistencia de adherencia y progreso semanal */

export function weekKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

export function loadProgressIds(userId, wk = weekKey()) {
  try {
    const raw = localStorage.getItem(`depro_progress_${userId}_${wk}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProgressIds(userId, ids, wk = weekKey()) {
  localStorage.setItem(`depro_progress_${userId}_${wk}`, JSON.stringify(ids));
}

/** Marca sesión completada en el plan guardado y en el registro de progreso */
export function markSessionComplete({ userId, planKey, sessionId, dayLabel }) {
  let plan = null;
  try {
    const raw = localStorage.getItem(planKey);
    if (raw) plan = JSON.parse(raw);
  } catch { /* ignore */ }

  if (plan && Array.isArray(plan)) {
    const updated = plan.map((day) => ({
      ...day,
      sessions: (day.sessions || []).map((s) =>
        s.id === sessionId ? { ...s, status: "completed", completion: 100 } : s
      ),
    }));
    localStorage.setItem(planKey, JSON.stringify(updated));
    plan = updated;
  }

  if (userId && dayLabel) {
    const wk = weekKey();
    const ids = loadProgressIds(userId, wk);
    if (!ids.includes(dayLabel)) {
      saveProgressIds(userId, [...ids, dayLabel], wk);
    }
  }

  return plan;
}

export function countCompletedSessions(plan) {
  if (!plan?.length) return { completed: 0, total: 0 };
  const sessions = plan.flatMap((d) => d.sessions || []).filter((s) => s.blocks?.length || s.exercises?.length);
  return {
    total: sessions.length,
    completed: sessions.filter((s) => s.status === "completed" || s.completion === 100).length,
  };
}

export function getAdherenceReminder(userId, freqNum) {
  const ids = loadProgressIds(userId);
  if (ids.length >= freqNum) return null;
  const lastKey = localStorage.getItem(`depro_last_train_${userId}`);
  const daysSince = lastKey
    ? Math.floor((Date.now() - new Date(lastKey).getTime()) / 86400000)
    : 999;
  if (daysSince >= 3) {
    return {
      message: lastKey
        ? `Llevas ${daysSince} días sin entrenar. ¿Hacemos una sesión mínima hoy?`
        : "Llevas varios días sin registrar actividad. ¿Empezamos con una sesión mínima?",
      suggestMinimal: true,
    };
  }
  return null;
}

export function touchLastTrain(userId) {
  localStorage.setItem(`depro_last_train_${userId}`, new Date().toISOString());
}
