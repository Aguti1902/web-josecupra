/**
 * Asignación de planes desde admin (individuales + club auto).
 * Persistencia local alineada con playerPlanStorage / coachSessionsStorage.
 */
import { savePlayerPlan, loadPlayerPlan } from "./playerPlanStorage.js";
import { buildFourWeekPlan, buildPlayerPlan } from "./playerPlanEngine.js";
import { generateClubAutoFourWeeks } from "./clubAuto/clubAutoEngine.js";
import { supabase } from "./supabase.js";

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
  localStorage.setItem(key, JSON.stringify(value));
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
 * @param {{ userId: string, plan?: object, profile?: object, startDate?: string, endDate?: string, cycles?: number }} opts
 */
export function assignPlanToPlayer({
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
        ...buildPlayerPlan(profile),
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
  };

  savePlayerPlan(userId, payload);

  const registry = readJson(ASSIGNMENTS_KEY, []);
  registry.unshift({
    userId,
    startDate: meta.startDate,
    endDate: meta.endDate,
    assignedAt: meta.assignedAt,
    sessionCount: payload.sessions?.length || payload.weeks?.[0]?.sessions?.length || 0,
    cycles: payload.cycles || 1,
  });
  writeJson(ASSIGNMENTS_KEY, registry.slice(0, 200));

  return payload;
}

/**
 * Asigna microciclo/mesociclo club-auto a club / equipo / entrenador / coordinador.
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

  const n = Math.max(1, Math.min(6, Number(cycles) || 1));
  const generated = generateClubAutoFourWeeks(questionnaire, { cycles: n });
  const weeks = Array.isArray(generated) ? generated : generated?.weeks || [];

  const meta = {
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || null,
    assignedAt: new Date().toISOString(),
    assignedBy: "admin",
    kind: kind || "club",
    clubId: clubId || null,
    teamId: teamId || null,
    targetId,
    cycles: n,
  };

  const payload = {
    engine: "club_auto",
    questionnaire,
    weeks,
    assignment: meta,
  };

  const key = `depro_club_auto_plan_${targetId}`;
  writeJson(key, payload);

  // Bridge a coach sessions si el destino es entrenador, equipo o coordinador
  if (kind === "entrenador" || kind === "equipo" || kind === "coordinador") {
    try {
      const existing = readJson(`depro_coach_sessions_${targetId}`, null);
      const sessions = weeks.flatMap((w) => w.sessions || w.days || []);
      writeJson(`depro_coach_assigned_plan_${targetId}`, {
        ...payload,
        sessions,
        previous: existing ? "kept" : null,
      });
    } catch {
      /* ignore */
    }
  }

  const registry = readJson(CLUB_ASSIGN_KEY, []);
  registry.unshift(meta);
  writeJson(CLUB_ASSIGN_KEY, registry.slice(0, 200));

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
};
