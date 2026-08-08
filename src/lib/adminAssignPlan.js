/**
 * Asignación de planes desde admin (individuales + club auto).
 * Persistencia local alineada con playerPlanStorage / coachSessionsStorage.
 */
import { savePlayerPlan, loadPlayerPlan } from "./playerPlanStorage.js";
import { buildFourWeekPlan, buildPlayerPlan } from "./playerPlanEngine.js";
import { generateClubAutoFourWeeks } from "./clubAuto/clubAutoEngine.js";

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

/** Lista usuarios jugador del admin storage + local auth mirror. */
export function listAssignablePlayers() {
  const clients = readJson("depro_admin_clients", []);
  const users = readJson("depro_users", []);
  const map = new Map();

  for (const c of clients) {
    if (!c?.id) continue;
    const role = c.role || c.tipo || "player";
    if (role !== "player" && role !== "jugador") continue;
    map.set(c.id, {
      id: c.id,
      name: c.name || c.nombre || c.email || c.id,
      email: c.email || "",
      role: "player",
    });
  }
  for (const u of users) {
    if (!u?.id) continue;
    if (u.role && u.role !== "player" && u.role !== "jugador") continue;
    if (!map.has(u.id)) {
      map.set(u.id, {
        id: u.id,
        name: u.name || u.displayName || u.email || u.id,
        email: u.email || "",
        role: "player",
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
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
  }

  for (const c of clients) {
    if (c.role === "coach" || c.tipo === "coach" || c.tipo === "entrenador") {
      out.push({
        id: c.id,
        kind: "entrenador",
        name: c.name || c.nombre || c.email || c.id,
        email: c.email || "",
        clubId: c.clubId || null,
      });
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name, "es"));
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
      // buildFourWeekPlan no acepta weekOffset: concatenar N bloques de 4 semanas
      // (contenido determinista repetido por ciclo; etiquetado por cycle/week).
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
    // Si hay planPreview de 4 semanas y se piden más ciclos, repetir etiquetado
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
 * Asigna microciclo/mesociclo club-auto a entrenador/equipo/club.
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

  // Bridge a coach sessions si el destino es entrenador
  if (kind === "entrenador" || kind === "equipo") {
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
  listAssignableClubTargets,
  assignPlanToPlayer,
  assignClubAutoPlan,
};
