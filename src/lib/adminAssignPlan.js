/**
 * Asignación de planes desde admin (individuales + club auto).
 * Persistencia local alineada con playerPlanStorage / coachSessionsStorage.
 */
import { savePlayerPlan, loadPlayerPlan, normalizePlayerPlan, persistPlayerPlanRemote } from "./playerPlanStorage.js";
import { buildFourWeekPlan, buildPlayerPlan } from "./playerPlanEngine.js";
import {
  questionnaireToCoachConfig,
  generateClubAutoWeekForCoach,
  coachConfigFingerprint,
  startOfIsoWeek,
} from "./clubAuto/clubAutoCoachBridge.js";
import { supabase } from "./supabase.js";
import { trainingProfileSnapshotFromAny } from "./playerTrainingProfile.js";

const ASSIGNMENTS_KEY = "depro_admin_plan_assignments";
const CLUB_ASSIGN_KEY = "depro_admin_club_plan_assignments";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    const msg = String(e?.message || e || "");
    if (e?.name === "QuotaExceededError" || /quota/i.test(msg)) {
      throw new Error("No se pudo guardar el plan: el almacenamiento del navegador está lleno. Reintenta; el plan se guarda compacto en el servidor.");
    }
    throw e;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function mapPlayerRow(u) {
  return {
    id: u.id,
    name: u.name || u.nombre || u.email || u.id,
    email: u.email || "",
    role: "player",
    plan: u.plan || null,
    subscriptionStatus: u.subscriptionStatus || null,
  };
}

/** Lista jugadores asignables (local + API admin). */
export function listAssignablePlayers() {
  const clients = readJson("depro_admin_clients", []);
  const users = readJson("depro_users", []);
  const map = new Map();

  for (const c of clients) {
    if (!c?.id) continue;
    const role = c.role || c.tipo || "player";
    if (role !== "player" && role !== "jugador") continue;
    map.set(c.id, mapPlayerRow(c));
  }
  for (const u of users) {
    if (!u?.id) continue;
    if (u.role && u.role !== "player" && u.role !== "jugador") continue;
    if (!map.has(u.id)) map.set(u.id, mapPlayerRow(u));
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/** Carga jugadores desde /api/admin-users y sincroniza caché local. */
export async function fetchAssignablePlayers() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch("/api/admin-users", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return listAssignablePlayers();

    const players = (json.users || [])
      .filter((u) => u.type === "player" || u.role === "player")
      .map(mapPlayerRow);

    try {
      const existing = readJson("depro_admin_clients", []);
      const byId = new Map(existing.map((c) => [c.id, c]));
      for (const p of players) byId.set(p.id, { ...byId.get(p.id), ...p, role: "player" });
      writeJson("depro_admin_clients", [...byId.values()]);
    } catch { /* ignore */ }

    return players.sort((a, b) => a.name.localeCompare(b.name, "es"));
  } catch {
    return listAssignablePlayers();
  }
}

export function listAssignableClubTargets() {
  const clubs = readJson("depro_clubs", []);
  const clients = readJson("depro_admin_clients", []);
  const out = [];

  for (const club of clubs) {
    if (!club?.id) continue;
    out.push({
      id: club.id,
      kind: "club",
      name: club.name || club.nombre || club.id,
      email: club.adminEmail || club.email || "",
      clubId: club.id,
    });
    for (const team of club.teams || club.equipos || []) {
      out.push({
        id: `${club.id}::${team.id || team.name}`,
        kind: "equipo",
        name: `${club.name || "Club"} · ${team.name || team.nombre || "Equipo"}`,
        email: team.coachEmail || "",
        clubId: club.id,
        teamId: team.id || team.name,
      });
    }
    const coord = club.coordinator || club.coordinador;
    if (coord && (coord.email || coord.id || coord.name)) {
      out.push({
        id: coord.id || `${club.id}::coordinador`,
        kind: "coordinador",
        name: `${club.name || "Club"} · ${coord.name || "Coordinador"}`,
        email: coord.email || "",
        clubId: club.id,
      });
    }
  }

  for (const c of clients) {
    const role = c.role || c.tipo;
    const teamRole = c.teamRole || c.team_role;
    const isCoach =
      role === "coach"
      || role === "entrenador"
      || c.tipo === "entrenador"
      || teamRole === "entrenador"
      || c.type === "coach"
      || c.type === "club_entrenador";
    const isCoord =
      teamRole === "coordinador"
      || c.tipo === "coordinador"
      || c.type === "club_coordinador";

    if (isCoach) {
      out.push({
        id: c.id,
        kind: "entrenador",
        name: c.name || c.nombre || c.email || c.id,
        email: c.email || "",
        clubId: c.clubId || null,
        teamId: c.teamId || null,
        isSoloCoach: !!c.isSoloCoach,
      });
    } else if (isCoord) {
      out.push({
        id: c.id,
        kind: "coordinador",
        name: c.name || c.nombre || c.email || c.id,
        email: c.email || "",
        clubId: c.clubId || null,
      });
    }
  }

  // Deduplicar por id+kind
  const seen = new Set();
  return out
    .filter((t) => {
      const key = `${t.kind}:${t.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/** Carga destinos club/equipo/entrenador/coordinador desde API + clubs. */
export async function fetchAssignableClubTargets() {
  const base = listAssignableClubTargets();
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch("/api/admin-users", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return base;

    const map = new Map(base.map((t) => [`${t.kind}:${t.id}`, t]));
    for (const u of json.users || []) {
      if (u.type === "coach" || u.type === "club_entrenador") {
        const t = {
          id: u.id,
          kind: "entrenador",
          name: u.name || u.email || u.id,
          email: u.email || "",
          clubId: u.clubId || null,
          teamId: u.teamId || null,
          isSoloCoach: !!u.isSoloCoach || u.type === "coach",
        };
        map.set(`${t.kind}:${t.id}`, t);
      } else if (u.type === "club_coordinador") {
        const t = {
          id: u.id,
          kind: "coordinador",
          name: u.name || u.email || u.id,
          email: u.email || "",
          clubId: u.clubId || null,
        };
        map.set(`${t.kind}:${t.id}`, t);
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  } catch {
    return base;
  }
}

/**
 * Asigna un plan individual generado a un usuario.
 * Normaliza a formato día-array y persiste en servidor + localStorage.
 * @returns {Promise<object>}
 */
export async function assignPlanToPlayer({
  userId,
  plan = null,
  profile = null,
  startDate = null,
  endDate = null,
  cycles = 1,
}) {
  if (!userId) throw new Error("userId requerido");

  let assigned = plan;
  if (!assigned && profile) {
    const n = Math.max(1, Math.min(6, Number(cycles) || 1));
    if (n <= 1) {
      assigned = buildPlayerPlan(profile);
    } else {
      const weeks = [];
      for (let c = 0; c < n; c++) {
        const four = buildFourWeekPlan(profile);
        weeks.push(...(four || []).map((w, i) => ({
          ...w,
          week: c * 4 + (w.week || i + 1),
          cycle: c + 1,
        })));
      }
      assigned = {
        weeks,
        cycles: n,
        multiCycle: true,
      };
    }
  } else if (assigned && cycles > 1 && Array.isArray(assigned.weeks)) {
    const n = Math.max(1, Math.min(6, Number(cycles) || 1));
    if (n > 1 && (assigned.weeks.length || 0) <= 4) {
      const base = assigned.weeks;
      const weeks = [];
      for (let c = 0; c < n; c++) {
        weeks.push(...base.map((w, i) => ({
          ...w,
          week: c * 4 + (w.week || i + 1),
          cycle: c + 1,
        })));
      }
      assigned = { ...assigned, weeks, cycles: n, multiCycle: true };
    }
  }
  if (!assigned) throw new Error("Plan o perfil requerido");

  const profileSnapshot = profile
    ? trainingProfileSnapshotFromAny(profile)
    : (assigned.profileSnapshot || null);

  const meta = {
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || null,
    assignedAt: new Date().toISOString(),
    assignedBy: "admin",
  };

  const payload = {
    ...assigned,
    assignment: meta,
    assignedTo: userId,
    source: "admin_manual",
    premiumPending: false,
    planPendingManual: false,
    ...(profileSnapshot ? { profileSnapshot } : {}),
  };

  // Guardar forma canónica (weeks + días) en servidor; local = normalizado para UI admin
  const normalized = normalizePlayerPlan(payload);
  savePlayerPlan(userId, normalized);

  const remote = await persistPlayerPlanRemote(userId, {
    ...payload,
    // Asegurar weeks si venía solo como día-array
    weeks: payload.weeks || (Array.isArray(normalized) ? [{ week: 1, days: normalized, sessions: [] }] : undefined),
  });
  if (!remote.ok) {
    throw new Error(remote.error || "No se pudo guardar el plan en el servidor. El jugador no lo verá en otro dispositivo.");
  }

  const registry = readJson(ASSIGNMENTS_KEY, []);
  registry.unshift({
    userId,
    startDate: meta.startDate,
    endDate: meta.endDate,
    assignedAt: meta.assignedAt,
    sessionCount: payload.sessions?.length || payload.weeks?.[0]?.sessions?.length || normalized?.filter?.((d) => d.sessions?.length)?.length || 0,
    cycles: payload.cycles || 1,
  });
  safeSet(ASSIGNMENTS_KEY, registry.slice(0, 200));

  return normalized;
}

/**
 * Resuelve clubId + teamId reales para persistir en el panel ProCoach / club.
 * El panel lee `depro_coach_week_${clubId}_${teamId}_${weekStart}`, no el registro admin.
 */
export function resolveClubAutoAssignIds({ kind, clubId, teamId, targetId } = {}) {
  const clubs = readJson("depro_clubs", []);
  const clients = readJson("depro_admin_clients", []);
  let cid = clubId || null;
  let tid = teamId || null;

  if (!cid && kind === "club") {
    cid = targetId || null;
  }
  if (!cid && kind === "equipo" && String(targetId || "").includes("::")) {
    const [clubPart, teamPart] = String(targetId).split("::");
    cid = clubPart;
    tid = tid || teamPart;
  }
  if (!cid) {
    const client = clients.find((c) => c.id === targetId);
    if (client?.clubId) cid = client.clubId;
    if (!tid && client?.teamId) tid = client.teamId;
  }
  if (!cid && String(targetId || "").startsWith("coach_")) cid = targetId;

  const club = (cid && (clubs.find((c) => c.id === cid) || readJson(`depro_club_${cid}`, null))) || null;
  if (!tid && club?.teams?.length) {
    tid = club.teams[0].id || club.teams[0].name || null;
  }
  return { clubId: cid || null, teamId: tid || null, club };
}

function persistAssignedWeeksToCoachPanel({
  clubId,
  teamId,
  config,
  cycles,
  startDate,
  meta,
}) {
  if (!clubId || !teamId || !config) return;

  const detail = readJson(`depro_club_${clubId}`, { id: clubId });
  const fp = coachConfigFingerprint(config);
  const monday = startOfIsoWeek(startDate);
  const nWeeks = Math.max(1, cycles) * 4;
  const nextDetail = {
    id: clubId,
    name: detail.name,
    abbreviation: detail.abbreviation,
    teams: detail.teams,
    isSoloCoach: detail.isSoloCoach !== false,
    coachConfig: { ...(detail.coachConfig || {}), ...config },
    planningMode: "auto",
    mode: "depro",
    origen: detail.origen || "automatico",
  };

  // Solo la primera semana en local. El resto se regenera desde coachConfig
  // para no saturar el cupo del navegador (el error «almacenamiento lleno»).
  try {
    const week = generateClubAutoWeekForCoach(config, { weekStart: monday, weekOffset: 0 });
    safeSet(`depro_coach_week_${clubId}_${teamId}_${monday}`, {
      ...week,
      configFingerprint: fp,
      assignment: meta,
    });
  } catch {
    /* el panel regenera desde coachConfig */
  }

  safeSet(`depro_coach_meso_${clubId}_${teamId}`, {
    engine: "club_auto",
    startDate: monday,
    numWeeks: nWeeks,
    configFingerprint: fp,
    assignment: meta,
  });

  const mergedLocal = { ...detail, ...nextDetail };
  delete mergedLocal.coachWeeks;
  delete mergedLocal.coachMesociclo;
  safeSet(`depro_club_${clubId}`, mergedLocal);
  const clubs = readJson("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === clubId);
  if (idx >= 0) {
    const summary = { ...clubs[idx], ...nextDetail };
    delete summary.coachWeeks;
    delete summary.coachMesociclo;
    delete summary.teams;
    clubs[idx] = summary;
    safeSet("depro_clubs", clubs);
  }
  import("./adminStorage.js").then(({ patchClubDetail }) => {
    patchClubDetail(clubId, {
      coachConfig: nextDetail.coachConfig,
      planningMode: "auto",
      mode: "depro",
      origen: nextDetail.origen,
      isSoloCoach: nextDetail.isSoloCoach,
    }).catch(() => {});
  }).catch(() => {});
}

/**
 * Asigna microciclo/mesociclo club-auto a club / equipo / entrenador / coordinador.
 * Persiste en el panel (coachWeeks / coachConfig) para que el ProCoach lo vea al entrar.
 */
export function assignClubAutoPlan({
  targetId,
  kind,
  clubId,
  teamId,
  questionnaire,
  startDate = null,
  endDate = null,
  cycles = 1,
}) {
  if (!targetId) throw new Error("targetId requerido");
  if (!questionnaire) throw new Error("cuestionario requerido");

  const packed = questionnaireToCoachConfig(questionnaire);
  if (!packed.ok) {
    throw new Error((packed.errors || []).join(" ") || "Cuestionario inválido");
  }

  const n = Math.max(1, Math.min(6, Number(cycles) || 1));
  const resolved = resolveClubAutoAssignIds({ kind, clubId, teamId, targetId });

  const meta = {
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || null,
    assignedAt: new Date().toISOString(),
    assignedBy: "admin",
    kind: kind || "club",
    clubId: resolved.clubId || clubId || null,
    teamId: resolved.teamId || teamId || null,
    targetId,
    cycles: n,
  };

  const payload = {
    engine: "club_auto",
    questionnaire,
    assignment: meta,
  };

  const key = `depro_club_auto_plan_${targetId}`;
  safeSet(key, payload);

  persistAssignedWeeksToCoachPanel({
    clubId: meta.clubId,
    teamId: meta.teamId,
    config: packed.config,
    cycles: n,
    startDate: meta.startDate,
    meta,
  });

  const registry = readJson(CLUB_ASSIGN_KEY, []);
  registry.unshift(meta);
  safeSet(CLUB_ASSIGN_KEY, registry.slice(0, 80));

  return payload;
}

export function getPlayerAssignment(userId) {
  return loadPlayerPlan(userId);
}

export default {
  listAssignablePlayers,
  fetchAssignablePlayers,
  listAssignableClubTargets,
  fetchAssignableClubTargets,
  assignPlanToPlayer,
  assignClubAutoPlan,
  resolveClubAutoAssignIds,
};
