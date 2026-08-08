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

function weekMatchesEngine(week, config) {
  if (!week) return false;
  const fp = coachConfigFingerprint(config);
  if (week.configFingerprint && week.configFingerprint !== fp) return false;
  if (usesClubAutoEngine(config)) return week.engine === "club_auto";
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

  const generated = withFingerprint(
    usesClubAutoEngine(config)
      ? generateClubAutoWeekForCoach(config, { weekStart, weekOffset: 0 })
      : generateMicrociclo({ config, weekStart, library }),
    config,
  );
  saveWeek({ clubId, teamId, weekStart, data: generated });
  return generated;
}

export function saveWeek({ clubId, teamId, weekStart, data }) {
  lsSet(weekKeyFor(clubId, teamId, weekStart), data);
  const detail = loadClubDetail(clubId) || { id: clubId };
  const coachWeeks = { ...(detail.coachWeeks || {}), [`${teamId}_${weekStart}`]: data };
  saveClubDetail(clubId, { ...detail, coachWeeks }).catch(() => {});
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

export function loadOrGenerateMesociclo({ clubId, teamId, config, startDate, numWeeks = 4, library }) {
  const key = mesoKeyFor(clubId, teamId);
  const fp = coachConfigFingerprint(config);
  const cached = lsGet(key, null);
  if (cached && cached.startDate === startDate) {
    if (cached.configFingerprint && cached.configFingerprint !== fp) {
      // invalid — regenerate below
    } else if (!(usesClubAutoEngine(config) && cached.engine !== "club_auto")) {
      return cached;
    }
  }

  const detail = loadClubDetail(clubId);
  const remote = detail?.coachMesociclo?.[teamId];
  if (remote && remote.startDate === startDate) {
    if ((!remote.configFingerprint || remote.configFingerprint === fp)
      && !(usesClubAutoEngine(config) && remote.engine !== "club_auto")) {
      lsSet(key, remote);
      return remote;
    }
  }

  const generated = withFingerprint(
    usesClubAutoEngine(config)
      ? generateClubAutoMesocicloForCoach(config, { startDate, numWeeks })
      : generateMesociclo({ config, startDate, numWeeks, library }),
    config,
  );
  saveMesociclo({ clubId, teamId, data: generated });
  return generated;
}

export function saveMesociclo({ clubId, teamId, data }) {
  lsSet(mesoKeyFor(clubId, teamId), data);
  const detail = loadClubDetail(clubId) || { id: clubId };
  const coachMesociclo = { ...(detail.coachMesociclo || {}), [teamId]: data };
  saveClubDetail(clubId, { ...detail, coachMesociclo }).catch(() => {});
}

/** Invalida microciclos/mesociclos congelados tras cambiar el cuestionario. */
export function clearCoachGeneratedPlans(clubId, teamId) {
  if (!clubId) return;
  try {
    const prefixWeek = `depro_coach_week_${clubId}_${teamId || ""}`;
    const prefixMeso = `depro_coach_meso_${clubId}_${teamId || ""}`;
    Object.keys(localStorage).forEach((key) => {
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
  const coachWeeks = { ...(detail.coachWeeks || {}) };
  const coachMesociclo = { ...(detail.coachMesociclo || {}) };
  if (teamId) {
    Object.keys(coachWeeks).forEach((k) => {
      if (k.startsWith(`${teamId}_`)) delete coachWeeks[k];
    });
    delete coachMesociclo[teamId];
  } else {
    Object.keys(coachWeeks).forEach((k) => delete coachWeeks[k]);
    Object.keys(coachMesociclo).forEach((k) => delete coachMesociclo[k]);
  }
  saveClubDetail(clubId, { ...detail, coachWeeks, coachMesociclo }).catch(() => {});
}
