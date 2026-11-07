/**
 * Ranking DEPRO: puntos, rachas, récords y retos a partir de los registros
 * que el jugador guarda en su propia planificación. Sin validación externa.
 */
import { mondayOfDate, resolvePlayerPlanStartDate } from "./playerPlanEngine.js";
import { extractFuerzaSnapshot, parseTimeToSeconds } from "./loadAnalytics.js";

export const RANKING_POINTS = {
  session: 50,
  perfectWeek: 150,
  record: 100,
  mesocycle: 150,
};

const DAY_INDEX = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  miércoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  sábado: 5,
  domingo: 6,
};

const TEST_IDS = ["resistencia", "sprint", "cod", "cmj"];
const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function isoDate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayIndex(name) {
  return DAY_INDEX[String(name || "").toLowerCase()] ?? 0;
}

function inWindow(date, window) {
  return !!date && date >= window.start && date <= window.end;
}

function num(value) {
  if (value == null || value === "") return null;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function formatRankingNumber(value, digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatRecordValue(mark) {
  if (!mark) return null;
  if (mark.kind === "kg") return `${formatRankingNumber(mark.value, mark.value % 1 ? 1 : 0)} kg`;
  if (mark.kind === "distance") {
    if (mark.value >= 1000) return `${formatRankingNumber(mark.value / 1000, mark.value % 1000 ? 1 : 0)} km`;
    return `${Math.round(mark.value)} m`;
  }
  if (mark.kind === "time") {
    if (mark.value >= 60) {
      const minutes = Math.floor(mark.value / 60);
      const seconds = Math.round(mark.value % 60);
      return `${minutes}'${String(seconds).padStart(2, "0")}"`;
    }
    return `${formatRankingNumber(mark.value, 2)} s`;
  }
  if (mark.kind === "rectas") return `${formatRankingNumber(mark.value, 0)} rectas`;
  return String(mark.value);
}

export function periodWindow(mode, anchorDate = new Date()) {
  const anchor = isoDate(anchorDate) || isoDate(new Date());
  if (mode === "global") return { mode, start: "1970-01-01", end: "2999-12-31", label: "global" };
  if (mode === "weekly") {
    const start = mondayOfDate(new Date(`${anchor}T12:00:00`));
    return { mode, start, end: addDaysIso(start, 6), label: start };
  }
  const d = new Date(`${anchor}T12:00:00`);
  const start = isoDate(new Date(d.getFullYear(), d.getMonth(), 1, 12));
  const end = isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
  return { mode: "monthly", start, end, label: start.slice(0, 7) };
}

export function shiftAnchor(mode, anchorDate, delta) {
  const d = new Date(isoDate(anchorDate) ? `${isoDate(anchorDate)}T12:00:00` : Date.now());
  if (mode === "weekly") d.setDate(d.getDate() + delta * 7);
  else d.setMonth(d.getMonth() + delta);
  return d;
}

export function monthLabel(anchorDate) {
  const d = new Date(`${isoDate(anchorDate)}T12:00:00`);
  const name = MONTHS_ES[d.getMonth()] || "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function recentMonthAnchors(now = new Date(), count = 6) {
  const anchors = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(isoDate(now) ? `${isoDate(now)}T12:00:00` : Date.now());
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    d.setHours(12, 0, 0, 0);
    anchors.push(d);
  }
  return anchors;
}

function collectScheduledSessions(plan) {
  if (!plan) return [];
  const startMonday = mondayOfDate(new Date(`${resolvePlayerPlanStartDate(plan)}T12:00:00`));
  const list = [];
  const push = (session, dayName, weekNumber) => {
    if (!session) return;
    const day = session.dayName || session.assignedDay || dayName || "Lunes";
    const week = Number(session.weekNumber || session.week || weekNumber || 1) || 1;
    list.push({
      id: session.id || `${day}_w${week}_${list.length}`,
      dayName: day,
      weekNumber: week,
      date: addDaysIso(startMonday, (week - 1) * 7 + dayIndex(day)),
      marked: session.status === "completed" || session.completion === 100,
    });
  };

  const weeks = Array.isArray(plan.weeks) ? plan.weeks : null;
  if (weeks?.length) {
    weeks.forEach((week, idx) => {
      const wn = week.week || idx + 1;
      const days = Array.isArray(week.days) ? week.days : [];
      const fromDays = days.flatMap((d) => (d.sessions || []).map((s) => ({ s, day: d.day })));
      if (fromDays.length) fromDays.forEach(({ s, day }) => push(s, day, wn));
      else (week.sessions || []).forEach((s) => push(s, s.dayName, wn));
    });
  } else {
    const days = Array.isArray(plan) ? plan : (plan.days || []);
    days.forEach((d) => {
      (d.sessions || []).forEach((s) => push(s, d.day, s.weekNumber || s.week || 1));
    });
  }

  const seen = new Set();
  return list.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

function applyCompletions(sessions, { progress, loadLogs } = {}) {
  const sessionMap = progress?.sessions || {};
  const weeks = progress?.weeks || {};
  const logs = Array.isArray(loadLogs) ? loadLogs : [];
  const list = sessions.map((s) => ({ ...s }));

  for (const s of list) {
    const rec = sessionMap[s.id];
    if (rec?.completed === true || rec?.completion === 100) s.marked = true;
    const wk = mondayOfDate(new Date(`${s.date}T12:00:00`));
    const ids = Array.isArray(weeks[wk]) ? weeks[wk] : [];
    if (ids.includes(s.dayName) || ids.includes(s.id)) s.checked = true;
    if (rec?.updatedAt) s.registeredOn = String(rec.updatedAt).slice(0, 10);
  }

  const consumed = new Set();
  for (const log of logs) {
    if (!log?.sessionId) continue;
    const target = list.find((s) => s.id === log.sessionId);
    if (!target) continue;
    target.logged = true;
    const date = String(log.recordedAt || "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && (!target.registeredOn || date < target.registeredOn)) {
      target.registeredOn = date;
    }
    consumed.add(log);
  }

  for (const log of logs) {
    if (consumed.has(log)) continue;
    const date = String(log?.recordedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const open = list.find((s) => s.date === date && !s.marked && !s.logged && !s.checked);
    if (!open) continue;
    open.logged = true;
    open.registeredOn = open.registeredOn || date;
    consumed.add(log);
  }

  const extras = [];
  const seenDays = new Set();
  for (const log of logs) {
    if (consumed.has(log) || log?.tipoRegistro === "session_rpe") continue;
    const date = String(log?.recordedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || seenDays.has(date)) continue;
    if (list.some((s) => s.date === date)) continue;
    seenDays.add(date);
    extras.push({
      id: `log_${date}`,
      dayName: null,
      date,
      extra: true,
      logged: true,
      registeredOn: date,
    });
  }

  return [...list, ...extras].map((s) => {
    const completed = !!(s.marked || s.logged || s.checked);
    return { ...s, completed, scoredOn: completed ? (s.registeredOn || s.date) : null };
  });
}

function weeksMap(sessions) {
  const map = {};
  for (const s of sessions) {
    if (s.extra) continue;
    const wk = mondayOfDate(new Date(`${s.date}T12:00:00`));
    if (!map[wk]) map[wk] = { scheduled: 0, completed: 0 };
    map[wk].scheduled += 1;
    if (s.completed) map[wk].completed += 1;
  }
  return map;
}

export function computeStreak(weekMap, now = new Date()) {
  const thisMonday = mondayOfDate(now);
  let cursor = thisMonday;
  const current = weekMap[cursor];
  if (!current || current.scheduled === 0 || current.completed < current.scheduled) {
    cursor = addDaysIso(thisMonday, -7);
  }
  let streak = 0;
  for (let i = 0; i < 52; i += 1) {
    const week = weekMap[cursor];
    if (!week || week.scheduled === 0 || week.completed < week.scheduled) break;
    streak += 1;
    cursor = addDaysIso(cursor, -7);
  }
  return streak;
}

export function medalsForStreak(streak) {
  return [1, 2, 4, 8].map((weeks) => ({
    weeks,
    label: weeks === 1 ? "1 semana" : `${weeks} semanas`,
    unlocked: streak >= weeks,
  }));
}

function domainOf(log) {
  const tipo = String(log?.tipoRegistro || "").toLowerCase();
  if (tipo === "session_rpe" || tipo === "no_registrable") return null;
  if (tipo === "fuerza") return "fuerza";
  if (tipo === "velocidad" || tipo === "pliometria") return "velocidad";
  if (tipo === "resistencia") return "resistencia";
  const obj = String(log?.objective || "").toLowerCase();
  if (obj.includes("veloc")) return "velocidad";
  if (obj.includes("resist")) return "resistencia";
  if (obj.includes("fuerza") || obj.includes("hiper")) return "fuerza";
  if (Array.isArray(log?.series) || log?.weight) return "fuerza";
  if (log?.distance) return "resistencia";
  if (log?.time) return "velocidad";
  return null;
}

function normalizeTestDate(raw) {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(String(raw))) return String(raw).slice(0, 10);
  const months = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const match = String(raw).toLowerCase().match(/(\d{1,2})\s+([a-záéíóúñ]{3})\w*\.?\s+(\d{4})/);
  if (match && months[match[2].slice(0, 3)] != null) {
    return isoDate(new Date(Number(match[3]), months[match[2].slice(0, 3)], Number(match[1]), 12));
  }
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return isoDate(parsed);
  return null;
}

function marksFromLogs(logs) {
  const buckets = { fuerza: [], velocidad: [], resistencia: [] };
  for (const log of logs || []) {
    const date = String(log?.recordedAt || "").slice(0, 10);
    const domain = domainOf(log);
    if (!domain || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (domain === "fuerza") {
      const snap = extractFuerzaSnapshot(log);
      if (snap?.maxWeight != null) {
        buckets.fuerza.push({ value: snap.maxWeight, date, label: log.exerciseName || "Fuerza", higher: true, kind: "kg" });
      }
    } else if (domain === "velocidad") {
      const sec = parseTimeToSeconds(log.time);
      if (sec != null) buckets.velocidad.push({ value: sec, date, label: log.exerciseName || "Velocidad", higher: false, kind: "time" });
    } else if (log.distance != null && num(log.distance) != null) {
      buckets.resistencia.push({ value: num(log.distance), date, label: log.exerciseName || "Resistencia", higher: true, kind: "distance" });
    } else {
      const sec = parseTimeToSeconds(log.time);
      if (sec != null) buckets.resistencia.push({ value: sec, date, label: log.exerciseName || "Resistencia", higher: false, kind: "time" });
    }
  }
  return buckets;
}

function marksFromTests(tests = {}) {
  const buckets = { fuerza: [], velocidad: [], resistencia: [] };
  for (const id of TEST_IDS) {
    for (const entry of tests[id] || []) {
      const value = num(entry?.value);
      const date = normalizeTestDate(entry?.date);
      if (value == null || !date) continue;
      if (id === "sprint" || id === "cod") {
        buckets.velocidad.push({ value, date, label: id === "cod" ? "COD 5-10-5" : "Sprint", higher: false, kind: "time" });
      } else if (id === "resistencia") {
        buckets.resistencia.push({ value, date, label: "Resistencia", higher: true, kind: "rectas" });
      }
    }
  }
  return buckets;
}

function isBetter(value, previous, higher) {
  if (previous == null) return true;
  return higher ? value > previous : value < previous;
}

function pickDisplay(marks) {
  if (!marks.length) return null;
  const kind = ["kg", "distance", "time", "rectas"].find((k) => marks.some((m) => m.kind === k)) || marks[0].kind;
  const group = marks.filter((m) => m.kind === kind);
  const higher = group[0].higher;
  return group.reduce((best, mark) => (!best || isBetter(mark.value, best.value, higher) ? mark : best), null);
}

function domainRecord(marks, window) {
  const kinds = [...new Set(marks.map((m) => m.kind))];
  let improved = false;
  let improvedLabel = null;
  for (const kind of kinds) {
    const group = marks.filter((m) => m.kind === kind);
    const higher = group[0].higher;
    const priorBest = group
      .filter((m) => m.date < window.start)
      .reduce((best, m) => (best == null || isBetter(m.value, best, higher) ? m.value : best), null);
    const inside = group.filter((m) => inWindow(m.date, window));
    if (!inside.length) continue;
    const bestInside = inside.reduce((best, m) => (!best || isBetter(m.value, best.value, higher) ? m : best), null);
    if (bestInside && isBetter(bestInside.value, priorBest, higher)) {
      improved = true;
      improvedLabel = bestInside.label;
    }
  }
  const display = pickDisplay(marks);
  return {
    value: formatRecordValue(display),
    label: display?.label || null,
    improved,
    improvedLabel,
    empty: !display,
  };
}

function sessionsLabel(scheduledIn, completedScheduled, extraDone) {
  if (scheduledIn > 0) return `${completedScheduled}/${scheduledIn}`;
  return extraDone > 0 ? String(extraDone) : "0/0";
}

export function scoreSources(sources = {}, { mode = "monthly", anchorDate, now } = {}) {
  const nowDate = now || new Date();
  const window = periodWindow(mode, anchorDate || nowDate);
  const sessions = applyCompletions(collectScheduledSessions(sources.plan), sources);
  const map = weeksMap(sessions);
  const streak = computeStreak(map, nowDate);

  const fromLogs = marksFromLogs(sources.loadLogs);
  const fromTests = marksFromTests(sources.tests);
  const records = {
    fuerza: domainRecord([...fromLogs.fuerza, ...fromTests.fuerza], window),
    velocidad: domainRecord([...fromLogs.velocidad, ...fromTests.velocidad], window),
    resistencia: domainRecord([...fromLogs.resistencia, ...fromTests.resistencia], window),
  };
  const recordHits = Object.entries(records).filter(([, rec]) => rec.improved);

  const scheduledIn = sessions.filter((s) => !s.extra && inWindow(s.date, window));
  const completedScheduled = scheduledIn.filter((s) => s.completed).length;
  const scored = sessions.filter((s) => s.completed && inWindow(s.scoredOn, window));
  const extraDone = scored.filter((s) => s.extra).length;
  const perfectWeeks = Object.entries(map)
    .filter(([wk, week]) => week.scheduled > 0 && week.completed >= week.scheduled && inWindow(wk, window))
    .length;

  const planned = sessions.filter((s) => !s.extra);
  const mesoFinished = planned.length > 0 && planned.every((s) => s.completed);
  const mesoDate = mesoFinished
    ? planned.map((s) => s.scoredOn || s.date).sort().at(-1)
    : null;
  const mesoInPeriod = !!(mesoFinished && inWindow(mesoDate, window));

  const breakdown = {
    sessions: scored.length * RANKING_POINTS.session,
    consistency: perfectWeeks * RANKING_POINTS.perfectWeek,
    records: recordHits.length * RANKING_POINTS.record,
    mesocycle: mesoInPeriod ? RANKING_POINTS.mesocycle : 0,
  };
  const points = breakdown.sessions + breakdown.consistency + breakdown.records + breakdown.mesocycle;
  const recordNames = recordHits.map(([key, rec]) => rec.improvedLabel || key).join(", ");

  const challenges = [
    {
      id: "sessions",
      title: mode === "weekly" ? "Reto semanal" : mode === "global" ? "Reto global" : "Reto mensual",
      detail: scheduledIn.length
        ? "Completa las sesiones programadas"
        : "Registra las sesiones de tu planificación",
      current: completedScheduled,
      total: scheduledIn.length,
      pct: scheduledIn.length ? Math.round((completedScheduled / scheduledIn.length) * 100) : (extraDone ? 100 : 0),
      reward: `+${breakdown.sessions + breakdown.consistency} pts`,
      done: scheduledIn.length > 0 && completedScheduled >= scheduledIn.length,
    },
    {
      id: "record",
      title: "Logro: mejora de marca",
      detail: recordHits.length
        ? `Superaste tu marca en ${recordNames}`
        : "Supera tu última marca en fuerza, velocidad o resistencia",
      current: recordHits.length ? 1 : 0,
      total: 1,
      pct: recordHits.length ? 100 : 0,
      reward: `+${breakdown.records} pts`,
      done: recordHits.length > 0,
    },
    {
      id: "meso",
      title: "Mesociclo",
      detail: "Completa todas las sesiones del mesociclo",
      current: planned.filter((s) => s.completed).length,
      total: planned.length,
      pct: planned.length ? Math.round((planned.filter((s) => s.completed).length / planned.length) * 100) : 0,
      reward: mesoInPeriod ? `+${RANKING_POINTS.mesocycle} pts` : `+${RANKING_POINTS.mesocycle} pts al cerrarlo`,
      done: mesoInPeriod,
    },
  ];

  return {
    points,
    breakdown,
    sessionCount: scored.length,
    sessionsScheduled: scheduledIn.length,
    sessionsLabel: sessionsLabel(scheduledIn.length, completedScheduled, extraDone),
    perfectWeeks,
    streak,
    medals: medalsForStreak(streak),
    records,
    challenges,
    window,
  };
}

export function rankEntries(entries) {
  const sorted = [...entries].sort((a, b) => (b.points - a.points) || String(a.name || "").localeCompare(String(b.name || ""), "es"));
  return sorted.map((entry, index) => {
    const above = index > 0 ? sorted[index - 1] : null;
    const tied = !!(above && above.points === entry.points);
    const gap = above ? Math.max(0, above.points - entry.points) : 0;
    return {
      ...entry,
      rank: index + 1,
      tied,
      gap: tied ? 1 : gap,
      aheadName: above?.name || null,
    };
  });
}

export function withEvolution(currentRanked, previousRanked) {
  const prevById = new Map((previousRanked || []).map((entry) => [entry.id, entry]));
  const reliable = previousRanked.length > 0 && previousRanked.length === currentRanked.length
    && previousRanked.every((entry) => entry.history !== false);
  return {
    reliable,
    ranked: currentRanked.map((entry) => {
      const prev = prevById.get(entry.id);
      const known = prev && prev.history !== false;
      return {
        ...entry,
        rankDelta: reliable && known ? prev.rank - entry.rank : null,
        pointsDelta: known ? entry.points - prev.points : null,
      };
    }),
  };
}

function snapshotPoints(snapshot, mode, monthKey) {
  if (!snapshot) return 0;
  if (mode === "weekly") return Number(snapshot.weekly) || 0;
  if (mode === "global") return Number(snapshot.global) || 0;
  if (snapshot.monthKey && monthKey && snapshot.monthKey !== monthKey) return 0;
  return Number(snapshot.monthly) || 0;
}

function snapshotSessions(snapshot, mode) {
  if (!snapshot) return "0/0";
  if (mode === "weekly") {
    if (snapshot.weeklyScheduled != null) return `${snapshot.weeklyDone || 0}/${snapshot.weeklyScheduled}`;
    return String(snapshot.weeklyDone || snapshot.weeklySessions || 0);
  }
  if (snapshot.sessionsScheduled != null) return `${snapshot.sessionsDone || 0}/${snapshot.sessionsScheduled}`;
  return String(snapshot.sessionsDone || snapshot.completedSessions || 0);
}

export function legacyFriendSnapshot(stats = {}) {
  const completed = Number(stats.completedSessions) || 0;
  const weekly = Number(stats.weeklySessions) || 0;
  const pct = Number(stats.planPct) || 0;
  return {
    monthly: completed * RANKING_POINTS.session + (pct >= 100 ? RANKING_POINTS.perfectWeek : 0),
    weekly: weekly * RANKING_POINTS.session,
    global: completed * RANKING_POINTS.session,
    sessionsDone: completed,
    sessionsScheduled: Number(stats.totalSessions) || 0,
    weeklyDone: weekly,
    weeklySessions: weekly,
    completedSessions: completed,
  };
}

export function buildRankingBoard({ people = [], mode = "monthly", anchorDate, now } = {}) {
  const nowDate = now || new Date();
  const anchor = anchorDate || nowDate;
  const window = periodWindow(mode, anchor);
  const prevAnchor = mode === "global" ? null : shiftAnchor(mode, anchor, -1);

  const current = [];
  const previous = [];
  let mineScore = null;

  for (const person of people) {
    if (person.snapshot && !person.sources) {
      const knownMonth = mode !== "monthly" || !person.snapshot.monthKey || person.snapshot.monthKey === window.label;
      current.push({
        id: person.id,
        name: person.name,
        mine: !!person.mine,
        points: knownMonth ? snapshotPoints(person.snapshot, mode, window.label) : 0,
        sessionsLabel: knownMonth ? snapshotSessions(person.snapshot, mode) : "0/0",
        streak: Number(person.snapshot.streak) || 0,
      });
      continue;
    }
    const score = scoreSources(person.sources || {}, { mode, anchorDate: anchor, now: nowDate });
    if (person.mine) mineScore = score;
    current.push({
      id: person.id,
      name: person.name,
      mine: !!person.mine,
      points: score.points,
      sessionsLabel: score.sessionsLabel,
      streak: score.streak,
    });
    if (prevAnchor) {
      const prev = scoreSources(person.sources || {}, { mode, anchorDate: prevAnchor, now: nowDate });
      previous.push({ id: person.id, name: person.name, points: prev.points, history: true });
    }
  }

  const evolved = withEvolution(rankEntries(current), rankEntries(previous));
  const mine = evolved.ranked.find((entry) => entry.mine) || null;
  return { ranked: evolved.ranked, reliableEvolution: evolved.reliable, mine, mineScore, window };
}

export function buildActivity(score, name = "Tú") {
  if (!score) return [];
  const feed = [];
  if (score.sessionCount > 0) {
    feed.push({
      id: "sessions",
      type: "session",
      name,
      action: `registraste ${score.sessionCount} sesión${score.sessionCount === 1 ? "" : "es"}`,
      detail: `${score.sessionsLabel} en la planificación`,
      timeAgo: "Este periodo",
    });
  }
  for (const [key, rec] of Object.entries(score.records || {})) {
    if (!rec?.improved) continue;
    feed.push({
      id: `rec_${key}`,
      type: "achievement",
      name,
      action: `mejoraste tu marca de ${rec.improvedLabel || key}`,
      detail: rec.value ? `Mejor marca: ${rec.value}` : "Nuevo récord",
      timeAgo: "Este periodo",
    });
  }
  if (score.perfectWeeks > 0) {
    feed.push({
      id: "streak",
      type: "streak",
      name,
      action: `cerraste ${score.perfectWeeks} semana${score.perfectWeeks === 1 ? "" : "s"} al completo`,
      detail: "Todas las sesiones programadas",
      timeAgo: "Este periodo",
    });
  }
  if (score.breakdown?.mesocycle) {
    feed.push({
      id: "meso",
      type: "achievement",
      name,
      action: "cerraste el mesociclo",
      detail: `+${RANKING_POINTS.mesocycle} pts`,
      timeAgo: "Este periodo",
    });
  }
  return feed;
}

export function rankingSnapshot(userIdSources, now = new Date()) {
  const month = scoreSources(userIdSources, { mode: "monthly", anchorDate: now, now });
  const week = scoreSources(userIdSources, { mode: "weekly", anchorDate: now, now });
  const global = scoreSources(userIdSources, { mode: "global", anchorDate: now, now });
  return {
    monthKey: month.window.label,
    monthly: month.points,
    weekly: week.points,
    global: global.points,
    sessionsDone: month.sessionCount,
    sessionsScheduled: month.sessionsScheduled,
    weeklyDone: week.sessionCount,
    weeklyScheduled: week.sessionsScheduled,
    streak: month.streak,
  };
}

export function readPlayerSources(userId) {
  const empty = { plan: null, progress: { weeks: {}, sessions: {} }, loadLogs: [], tests: {} };
  if (!userId || typeof localStorage === "undefined") return empty;
  let plan = null;
  try { plan = JSON.parse(localStorage.getItem(`depro_plan_${userId}`) || "null"); } catch { plan = null; }
  const progress = { weeks: {}, sessions: {} };
  try {
    const blob = JSON.parse(localStorage.getItem(`depro_session_progress_${userId}`) || "null");
    if (blob?.weeks) progress.weeks = { ...blob.weeks };
    if (blob?.sessions) progress.sessions = { ...blob.sessions };
  } catch { /* ignore */ }
  const prefix = `depro_progress_${userId}_`;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const wk = key.slice(prefix.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(wk)) continue;
    try {
      const ids = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(ids)) progress.weeks[wk] = [...new Set([...(progress.weeks[wk] || []), ...ids])];
    } catch { /* ignore */ }
  }
  let loadLogs = [];
  try { loadLogs = JSON.parse(localStorage.getItem(`depro_load_logs_${userId}`) || "[]"); } catch { loadLogs = []; }
  const tests = {};
  for (const id of TEST_IDS) {
    try { tests[id] = JSON.parse(localStorage.getItem(`depro_test_${userId}_${id}`) || "[]"); }
    catch { tests[id] = []; }
  }
  return { plan, progress, loadLogs, tests };
}

export function readTeamPeers(user) {
  const teamId = user?.team;
  if (!teamId || typeof localStorage === "undefined") return [];
  try {
    const reg = JSON.parse(localStorage.getItem(`depro_team_registry_${teamId}`) || "[]");
    return (Array.isArray(reg) ? reg : [])
      .filter((p) => p?.id && p.id !== user.id)
      .map((p) => ({
        id: p.id,
        name: p.name || p.email || "Jugador",
        sources: readPlayerSources(p.id),
      }));
  } catch {
    return [];
  }
}

export function positionHint(entry, total) {
  if (!entry) return "Completa sesiones de tu planificación para entrar en la liga.";
  if (total <= 1 && entry.points === 0) return "Registra tus sesiones para sumar puntos.";
  if (entry.rank === 1) {
    return total > 1 ? "Lideras la liga." : "Eres el primero de tu liga.";
  }
  if (entry.tied) return `Empatado con ${entry.aheadName}. Te falta 1 pt para superar.`;
  return `Te faltan ${formatRankingNumber(entry.gap)} pts para superar a ${entry.aheadName}.`;
}
