import { weekKey, loadProgressIds, countCompletedSessions } from "./sessionProgress.js";

const PLAYER_CLUB_PREFIX = "depro_player_club_";

export function getPlayerClubAssoc(userId) {
  try {
    const raw = localStorage.getItem(`${PLAYER_CLUB_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" ? parsed : { clubId: parsed };
  } catch {
    return null;
  }
}

function loadClubVisual(clubId) {
  try {
    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    const base = clubs.find((c) => c.id === clubId) || {};
    const detail = JSON.parse(localStorage.getItem(`depro_club_${clubId}`) || "null") || {};
    return { ...base, ...detail };
  } catch {
    return {};
  }
}

export function applyClubBrandingToPlayer(userId, clubId) {
  if (!userId || !clubId) return;
  const club = loadClubVisual(clubId);
  if (club.logo) localStorage.setItem(`depro_player_logo_${userId}`, club.logo);
  if (club.banner) localStorage.setItem(`depro_player_banner_${userId}`, club.banner);
  if (club.primaryColor) localStorage.setItem(`depro_player_accent_${userId}`, club.primaryColor);
}

function writePlayerClubAssoc(userId, payload) {
  localStorage.setItem(`${PLAYER_CLUB_PREFIX}${userId}`, JSON.stringify(payload));
}

/**
 * Código de descuento de club: branding + trazabilidad, SIN plantilla ni equipo.
 * No escribe depro_squad_* ni depro_team_registry_* ni player_team_links.
 */
export function registerClubCodePlayer({ userId, clubId, name, email, plan, status = "pending" }) {
  if (!userId || !clubId) return;
  writePlayerClubAssoc(userId, {
    clubId,
    teamId: null,
    linkKind: "code",
    name: name || "Jugador",
    email: email || "",
    plan: plan || "—",
    status: status || "pending",
  });
  applyClubBrandingToPlayer(userId, clubId);
}

export function registerPendingClubPlayer({ userId, clubId, teamId, name, email, plan }) {
  // Código de club: nunca exigir ni guardar equipo.
  if (!teamId) {
    registerClubCodePlayer({ userId, clubId, name, email, plan, status: "pending" });
    return;
  }
  if (!userId || !clubId) return;
  writePlayerClubAssoc(userId, {
    clubId,
    teamId,
    linkKind: "squad",
    name: name || "Jugador",
    email: email || "",
    plan: plan || "—",
    status: "pending",
  });
  applyClubBrandingToPlayer(userId, clubId);
}

export function activateClubPlayerInSquad({ userId, clubId, teamId, name, email, plan }) {
  if (!userId || !clubId || !teamId) return;

  const entry = {
    id: userId,
    name: name || "Jugador",
    plan: plan || "Plan activo",
    email: email || "",
  };

  writePlayerClubAssoc(userId, {
    clubId,
    teamId,
    linkKind: "squad",
    name: entry.name,
    email: entry.email,
    plan: entry.plan,
    status: "active",
  });

  const squadKey = `depro_squad_${clubId}_${teamId}`;
  const squad = JSON.parse(localStorage.getItem(squadKey) || "[]");
  const sIdx = squad.findIndex((p) => p.id === userId);
  if (sIdx >= 0) squad[sIdx] = entry;
  else squad.push(entry);
  localStorage.setItem(squadKey, JSON.stringify(squad));

  const regKey = `depro_team_registry_${teamId}`;
  const reg = JSON.parse(localStorage.getItem(regKey) || "[]");
  const rIdx = reg.findIndex((p) => p.id === userId);
  if (rIdx >= 0) reg[rIdx] = entry;
  else reg.push(entry);
  localStorage.setItem(regKey, JSON.stringify(reg));

  applyClubBrandingToPlayer(userId, clubId);
}

export function isPlayerInActiveSquad(userId) {
  return getPlayerClubAssoc(userId)?.status === "active";
}

export function getClubCodePlayers(clubId, teamId = null, { includeCodeOnly = false } = {}) {
  const players = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PLAYER_CLUB_PREFIX)) continue;
      const val = JSON.parse(localStorage.getItem(key) || "{}");
      if (val.clubId !== clubId) continue;
      const isCodeOnly = val.linkKind === "code" || !val.teamId;
      if (isCodeOnly && !includeCodeOnly) continue;
      if (teamId && val.teamId !== teamId) continue;
      players.push({ userId: key.replace(PLAYER_CLUB_PREFIX, ""), ...val });
    }
  } catch { /* ignore */ }
  return players;
}

export function getPlayerTrainingSummary(userId) {
  const wk = weekKey();
  const planKey = `depro_plan_${userId}`;
  let plan = null;
  try {
    plan = JSON.parse(localStorage.getItem(planKey) || "null");
  } catch { /* ignore */ }

  const stats = countCompletedSessions(plan);
  const completed = stats.completed;
  const total = stats.total;
  const progressIds = loadProgressIds(userId, wk);

  return {
    weekKey: wk,
    completed,
    total,
    progressCount: progressIds.length,
    adherence: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
