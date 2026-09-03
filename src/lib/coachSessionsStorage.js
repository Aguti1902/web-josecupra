/**
 * coachSessionsStorage — persistencia de microciclos/sesiones generados por
 * DEPRO Coach. localStorage es la fuente inmediata; se sincroniza en segundo
 * plano contra `clubs_detail` (mismo patrón que `CargasPage`/`adminStorage`).
 *
 * Una semana, una vez generada por el motor de reglas, se congela: las
 * ediciones del entrenador (sustituciones, notas, orden) se guardan sobre
 * esa copia concreta en lugar de regenerarse en cada carga.
 */
import { saveClubDetail, loadClubDetail } from "./adminStorage";
import { generateMicrociclo, generateMesociclo } from "./coachEngine";
import {
  usesClubAutoEngine,
  generateClubAutoWeekForCoach,
  generateClubAutoMesocicloForCoach,
  coachConfigFingerprint,
} from "./clubAuto/clubAutoCoachBridge";
import { cycleEndDate } from "./planSwapLimits.js";

function weekKeyFor(clubId, teamId, weekStart) {
  return `depro_coach_week_${clubId}_${teamId}_${weekStart}`;
}
function mesoKeyFor(clubId, teamId) {
  return `depro_coach_meso_${clubId}_${teamId}`;
}

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveCoachCycle(clubId, teamId) {
  const meso = lsGet(mesoKeyFor(clubId, teamId), null);
  const today = todayIso();
  const start = meso?.cycleStartDate || meso?.startDate;
  const end = meso?.cycleEndDate || (start ? cycleEndDate(start) : null);
  if (start && end && today < end) {
    return { startDate: start, endDate: end };
  }
  return { startDate: today, endDate: cycleEndDate(today) };
}

function weekMatchesEngine(week, config) {
  if (!week) return false;
  const fp = coachConfigFingerprint(config);
  if (week.configFingerprint && week.configFingerprint !== fp) return false;
  if (usesClubAutoEngine(config)) {
    if (week.engine !== "club_auto") return false;
    const end = week.cycleEndDate || (week.cycleStartDate ? cycleEndDate(week.cycleStartDate) : null);
    if (end && todayIso() >= end) return false;
    return true;
  }
  return week.engine !== "club_auto";
}

function withFingerprint(data, config) {
  return { ...data, configFingerprint: coachConfigFingerprint(config) };
}

export function loadOrGenerateWeek({ clubId, teamId, weekStart, config, library }) {
  const key = weekKeyFor(clubId, teamId, weekStart);
  const cached = lsGet(key, null);
  if (weekMatchesEngine(cached, config)) return cached;

  const detail = loadClubDetail(clubId);
  const remote = detail?.coachWeeks?.[`${teamId}_${weekStart}`];
  if (weekMatchesEngine(remote, config)) {
    lsSet(key, remote);
    return remote;
  }

  const cycle = resolveCoachCycle(clubId, teamId);
  let generated;
  try {
    generated = withFingerprint(
      usesClubAutoEngine(config)
        ? generateClubAutoWeekForCoach(config, {
          weekStart,
          cycleStart: cycle.startDate,
        })
        : generateMicrociclo({ config, weekStart, library }),
      config,
    );
  } catch {
    generated = withFingerprint({ sessions: [], weekStart, engine: usesClubAutoEngine(config) ? "club_auto" : "depro" }, config);
  }
  if (Array.isArray(generated?.sessions) && generated.sessions.length > 0) {
    saveWeek({ clubId, teamId, weekStart, data: generated });
    const mesoKey = mesoKeyFor(clubId, teamId);
    const meso = lsGet(mesoKey, null) || {};
    if (!meso.cycleStartDate || todayIso() >= (meso.cycleEndDate || "")) {
      lsSet(mesoKey, {
        ...meso,
        cycleStartDate: cycle.startDate,
        cycleEndDate: cycle.endDate,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        engine: usesClubAutoEngine(config) ? "club_auto" : meso.engine,
      });
    }
  }
  return generated;
}

export function saveWeek({ clubId, teamId, weekStart, data }) {
  lsSet(weekKeyFor(clubId, teamId, weekStart), data);
}

export function updateSessionInWeek({ clubId, teamId, weekStart, sessionId, updater }) {
  const week = loadOrGenerateWeek({ clubId, teamId, weekStart, config: {}, library: [] });
  const sessions = week.sessions.map((s) => (s.id === sessionId ? updater(s) : s));
  const next = { ...week, sessions };
  saveWeek({ clubId, teamId, weekStart, data: next });
  return next;
}

/** Añade una sesión nueva (propia o duplicada) al microciclo de la semana — Modo Personalizado */
export function addSessionToWeek({ clubId, teamId, weekStart, session }) {
  const week = loadOrGenerateWeek({ clubId, teamId, weekStart, config: {}, library: [] });
  const next = { ...week, sessions: [...week.sessions, session] };
  saveWeek({ clubId, teamId, weekStart, data: next });
  return next;
}

export function removeSessionFromWeek({ clubId, teamId, weekStart, sessionId }) {
  const week = loadOrGenerateWeek({ clubId, teamId, weekStart, config: {}, library: [] });
  const next = { ...week, sessions: week.sessions.filter((s) => s.id !== sessionId) };
  saveWeek({ clubId, teamId, weekStart, data: next });
  return next;
}

export function loadOrGenerateMesociclo({ clubId, teamId, config, startDate, endDate, numWeeks, library }) {
  const key = mesoKeyFor(clubId, teamId);
  const fp = coachConfigFingerprint(config);
  const cycle = resolveCoachCycle(clubId, teamId);
  const start = startDate || cycle.startDate;
  const end = endDate || cycle.endDate;
  const cached = lsGet(key, null);
  if (cached && cached.configFingerprint === fp) {
    const cachedEnd = cached.cycleEndDate || cached.endDate;
    if (cachedEnd && todayIso() < cachedEnd) {
      if (!(usesClubAutoEngine(config) && cached.engine !== "club_auto")) {
        return cached;
      }
    }
  }

  const detail = loadClubDetail(clubId);
  const remote = detail?.coachMesociclo?.[teamId];
  if (remote && (!remote.configFingerprint || remote.configFingerprint === fp)) {
    const remoteEnd = remote.cycleEndDate || remote.endDate;
    if (remoteEnd && todayIso() < remoteEnd
      && !(usesClubAutoEngine(config) && remote.engine !== "club_auto")) {
      lsSet(key, remote);
      return remote;
    }
  }

  let generated;
  try {
    generated = withFingerprint(
      usesClubAutoEngine(config)
        ? generateClubAutoMesocicloForCoach(config, { startDate: start, endDate: end, numWeeks })
        : generateMesociclo({ config, startDate: start, numWeeks: numWeeks || 4, library }),
      config,
    );
  } catch {
    generated = withFingerprint({
      startDate: start,
      endDate: end,
      weeks: [],
      objetivoLabel: "Mesociclo",
      numWeeks: numWeeks || 4,
      engine: usesClubAutoEngine(config) ? "club_auto" : "depro",
    }, config);
  }
  if (Array.isArray(generated?.weeks) && generated.weeks.length > 0) {
    generated.cycleStartDate = generated.cycleStartDate || start;
    generated.cycleEndDate = generated.cycleEndDate || end;
    saveMesociclo({ clubId, teamId, data: generated });
  }
  return generated;
}

export function saveMesociclo({ clubId, teamId, data }) {
  lsSet(mesoKeyFor(clubId, teamId), data);
}

function listLocalStorageKeys() {
  const keys = [];
  try {
    if (typeof localStorage.length === "number" && typeof localStorage.key === "function") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }
      if (keys.length) return keys;
    }
    keys.push(...Object.keys(localStorage));
  } catch { /* ignore */ }
  return keys;
}

/** Invalida microciclos/mesociclos congelados tras cambiar el cuestionario. */
export function clearCoachGeneratedPlans(clubId, teamId) {
  if (!clubId) return;
  try {
    const prefixWeek = `depro_coach_week_${clubId}_${teamId || ""}`;
    const prefixMeso = `depro_coach_meso_${clubId}_${teamId || ""}`;
    listLocalStorageKeys().forEach((key) => {
      if (key.startsWith(prefixWeek) || key.startsWith(`depro_coach_week_${clubId}_`)) {
        if (!teamId || key.includes(`_${teamId}_`) || key.endsWith(`_${teamId}`)) {
          localStorage.removeItem(key);
        }
      }
      if (key === prefixMeso || key.startsWith(`${prefixMeso}`)) {
        localStorage.removeItem(key);
      }
    });
  } catch { /* ignore */ }

  const detail = loadClubDetail(clubId);
  if (!detail) return;
  const next = { ...detail };
  delete next.coachWeeks;
  delete next.coachMesociclo;
  saveClubDetail(clubId, next).catch(() => {});
}
