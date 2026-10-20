/** Persistencia de adherencia y progreso semanal (local + USER_DATA + plan remoto). */

import {
  loadPlayerPlan,
  savePlayerPlan,
  persistPlayerPlanRemote,
  toPersistablePlan,
} from "./playerPlanStorage.js";

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

export function isSessionCompleted(session) {
  return session?.status === "completed" || session?.completion === 100;
}

function progressBlobKey(userId) {
  return `depro_session_progress_${userId}`;
}

export function loadSessionProgressBlob(userId) {
  if (!userId) return { weeks: {}, sessions: {} };
  try {
    const raw = localStorage.getItem(progressBlobKey(userId));
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") {
      return {
        weeks: parsed.weeks && typeof parsed.weeks === "object" ? parsed.weeks : {},
        sessions: parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {},
      };
    }
  } catch { /* ignore */ }
  return { weeks: {}, sessions: {} };
}

export function saveSessionProgressBlob(userId, blob) {
  if (!userId || !blob) return;
  try {
    localStorage.setItem(progressBlobKey(userId), JSON.stringify(blob));
  } catch { /* cupo */ }
}

export function mergeSessionProgressBlobs(local = {}, remote = {}) {
  const out = {
    weeks: { ...(remote?.weeks || {}) },
    sessions: { ...(remote?.sessions || {}) },
  };
  for (const [wk, ids] of Object.entries(local?.weeks || {})) {
    const a = Array.isArray(out.weeks[wk]) ? out.weeks[wk] : [];
    const b = Array.isArray(ids) ? ids : [];
    out.weeks[wk] = [...new Set([...a, ...b])];
  }
  for (const [sid, entry] of Object.entries(local?.sessions || {})) {
    const prev = out.sessions[sid];
    if (!prev) {
      out.sessions[sid] = entry;
      continue;
    }
    const pt = Date.parse(prev.updatedAt || 0) || 0;
    const nt = Date.parse(entry?.updatedAt || 0) || 0;
    out.sessions[sid] = nt >= pt ? { ...prev, ...entry } : { ...entry, ...prev };
  }
  return out;
}

function queuePersistProgress(userId, blob) {
  if (!userId || !blob) return;
  import("./userDataSync.js").then(({ persistUserData }) => {
    persistUserData(userId, { sessionProgress: blob }).catch(() => {});
  }).catch(() => {});
}

function mapPlanSessions(plan, mapper) {
  if (!plan) return plan;
  const mapDay = (day) => ({
    ...day,
    sessions: (day.sessions || []).map(mapper),
  });
  const mapWeek = (week) => {
    const next = { ...week };
    if (Array.isArray(week.days)) next.days = week.days.map(mapDay);
    if (Array.isArray(week.sessions)) next.sessions = week.sessions.map(mapper);
    return next;
  };

  if (Array.isArray(plan) && (plan.length === 0 || plan[0]?.day != null || plan[0]?.sessions != null)) {
    const next = plan.map(mapDay);
    for (const key of Object.keys(plan)) {
      if (Number.isNaN(Number(key)) && next[key] === undefined) next[key] = plan[key];
    }
    if (Array.isArray(plan.weeks)) next.weeks = plan.weeks.map(mapWeek);
    return next;
  }

  const next = { ...plan };
  if (Array.isArray(plan.days)) next.days = plan.days.map(mapDay);
  if (Array.isArray(plan.weeks)) next.weeks = plan.weeks.map(mapWeek);
  return next;
}

export function applySessionCompletionToPlan(plan, sessionId, completed, todayName = getTodayName()) {
  if (!plan || !sessionId) return plan;
  return mapPlanSessions(plan, (s) => {
    if (s.id !== sessionId) return s;
    return {
      ...s,
      status: completed ? "completed" : (s.dayName === todayName || s.assignedDay === todayName ? "today" : "pending"),
      completion: completed ? 100 : 0,
      completedAt: completed ? new Date().toISOString() : null,
    };
  });
}

export function applyProgressBlobToPlan(plan, blob) {
  if (!plan || !blob?.sessions) return plan;
  const sessions = blob.sessions;
  return mapPlanSessions(plan, (s) => {
    const rec = sessions[s.id];
    if (!rec) return s;
    const completed = rec.completed === true || rec.completion === 100;
    if (!completed && rec.completed !== false) return s;
    return {
      ...s,
      status: completed ? "completed" : (s.status === "completed" ? "pending" : s.status),
      completion: completed ? 100 : 0,
    };
  });
}

function persistPlanWithCompletion(userId, plan) {
  if (!userId || !plan) return;
  savePlayerPlan(userId, plan);
  persistPlayerPlanRemote(userId, toPersistablePlan(plan)).catch(() => {});
}

export function markSessionComplete({ userId, planKey, sessionId, dayLabel, persist = true }) {
  return setSessionCompletion({ userId, planKey, sessionId, dayLabel, completed: true, persist });
}

export function unmarkSessionComplete({ userId, planKey, sessionId, dayLabel, persist = true }) {
  return setSessionCompletion({ userId, planKey, sessionId, dayLabel, completed: false, persist });
}

export function toggleSessionCompletion({ userId, planKey, sessionId, dayLabel, persist = true }) {
  let plan = null;
  try {
    const raw = localStorage.getItem(planKey);
    if (raw) plan = JSON.parse(raw);
  } catch { /* ignore */ }
  if (!plan && userId) plan = loadPlayerPlan(userId);

  const session = collectPlanSessions(plan).find((s) => s.id === sessionId);
  const completed = isSessionCompleted(session);
  return setSessionCompletion({ userId, planKey, sessionId, dayLabel, completed: !completed, persist });
}

function collectPlanSessions(plan) {
  if (!plan) return [];
  const days = Array.isArray(plan) ? plan : (Array.isArray(plan.days) ? plan.days : []);
  const fromDays = days.flatMap((d) => d.sessions || []);
  const fromWeeks = Array.isArray(plan.weeks)
    ? plan.weeks.flatMap((w) => [
      ...(w.days || []).flatMap((d) => d.sessions || []),
      ...(w.sessions || []),
    ])
    : [];
  return [...fromDays, ...fromWeeks];
}

export function setSessionCompletion({ userId, planKey, sessionId, dayLabel, completed, persist = true }) {
  let plan = null;
  try {
    const raw = planKey ? localStorage.getItem(planKey) : null;
    if (raw) plan = JSON.parse(raw);
  } catch { /* ignore */ }
  if (!plan && userId) plan = loadPlayerPlan(userId);

  const todayName = getTodayName();
  const updated = applySessionCompletionToPlan(plan, sessionId, completed, todayName);

  if (persist && planKey && updated && Array.isArray(updated)) {
    try {
      localStorage.setItem(planKey, JSON.stringify(updated));
    } catch { /* cupo */ }
  }

  if (userId && persist) {
    const wk = weekKey();
    const ids = loadProgressIds(userId, wk);
    if (completed) {
      if (dayLabel && !ids.includes(dayLabel)) saveProgressIds(userId, [...ids, dayLabel], wk);
    } else if (dayLabel) {
      saveProgressIds(userId, ids.filter((id) => id !== dayLabel), wk);
    }

    const blob = loadSessionProgressBlob(userId);
    blob.weeks = { ...blob.weeks, [wk]: loadProgressIds(userId, wk) };
    blob.sessions = {
      ...blob.sessions,
      [sessionId]: {
        completed: !!completed,
        completion: completed ? 100 : 0,
        dayLabel: dayLabel || null,
        weekKey: wk,
        updatedAt: new Date().toISOString(),
      },
    };
    saveSessionProgressBlob(userId, blob);
    queuePersistProgress(userId, blob);
    persistPlanWithCompletion(userId, updated);
  }

  return updated;
}

function getTodayName() {
  const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  return DAY_ORDER[(new Date().getDay() + 6) % 7];
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

export function clubSessionProgressKey(clubId, teamId) {
  return `depro_club_progress_${clubId || "club"}_${teamId || "all"}`;
}

export function loadClubSessionProgress(clubId, teamId) {
  try {
    const raw = localStorage.getItem(clubSessionProgressKey(clubId, teamId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setClubSessionCompletion({ clubId, teamId, sessionId, completed, userId = null }) {
  if (!sessionId) return {};
  const map = loadClubSessionProgress(clubId, teamId);
  map[sessionId] = {
    completed: !!completed,
    completion: completed ? 100 : 0,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(clubSessionProgressKey(clubId, teamId), JSON.stringify(map));
  } catch { /* cupo */ }
  if (userId) {
    const blob = loadSessionProgressBlob(userId);
    blob.sessions = {
      ...blob.sessions,
      [`club:${clubId}:${teamId}:${sessionId}`]: map[sessionId],
    };
    saveSessionProgressBlob(userId, blob);
    queuePersistProgress(userId, blob);
  }
  return map;
}

export function hydrateSessionProgress(userId, plan = null) {
  if (!userId) return plan;
  const local = loadSessionProgressBlob(userId);
  return applyProgressBlobToPlan(plan, local);
}
