/**
 * Fusión de plantillas, cargas y marcas de tests entre local y nube.
 * Evita que un dispositivo vacío pise datos reales de otro.
 */
import { filterPurgedFromList } from "./clubPlayerPurge.js";

export function squadPlayerId(player) {
  if (!player || typeof player !== "object") return "";
  return String(player.id || player.email || "").trim();
}

export function mergeSquadPlayers(a = [], b = []) {
  const map = new Map();
  for (const p of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    const id = squadPlayerId(p);
    if (!id) continue;
    const prev = map.get(id);
    map.set(id, prev ? { ...prev, ...p } : p);
  }
  return [...map.values()];
}

function squadStamp(team) {
  const raw = team?.squadUpdatedAt || team?.squad_updated_at || 0;
  const n = Date.parse(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Lectura: une plantillas para no perder jugadores locales sin sincronizar.
 * Si el remoto trae plantilla, se usa como base y se añaden los locales extra.
 */
export function pickSquadForRead(remoteSquad, localSquad) {
  const r = Array.isArray(remoteSquad) ? remoteSquad : [];
  const l = Array.isArray(localSquad) ? localSquad : [];
  if (!r.length) return l;
  if (!l.length) return r;
  return mergeSquadPlayers(r, l);
}

/**
 * Escritura: la plantilla entrante gana si trae marca de tiempo más reciente.
 * Un cliente vacío sin marca no borra la plantilla del servidor.
 */
export function pickSquadForWrite(existingTeam, incomingTeam) {
  const existing = Array.isArray(existingTeam?.squad) ? existingTeam.squad : [];
  if (!incomingTeam || !Array.isArray(incomingTeam.squad)) return existing;
  const incoming = incomingTeam.squad;
  const eAt = squadStamp(existingTeam);
  const iAt = squadStamp(incomingTeam);
  if (iAt && iAt >= eAt) return incoming;
  if (eAt && eAt > iAt) return existing;
  if (incoming.length >= existing.length) return mergeSquadPlayers(existing, incoming);
  if (existing.length > incoming.length) return mergeSquadPlayers(incoming, existing);
  return incoming;
}

function teamIdOf(team) {
  return String(team?.id || team?.name || "").trim();
}

export function mergeTeamsForRead(remoteTeams, localTeams, purgedPlayers = []) {
  const local = Array.isArray(localTeams) ? localTeams : [];
  const remote = Array.isArray(remoteTeams) ? remoteTeams : [];
  const ids = new Set();
  const out = [];
  const push = (team, otherList) => {
    const id = teamIdOf(team);
    if (!id || ids.has(id)) return;
    ids.add(id);
    const other = otherList.find((t) => teamIdOf(t) === id);
    const squad = pickSquadForRead(team.squad, other?.squad);
    out.push({
      ...(other || {}),
      ...team,
      id: team.id || other?.id || id,
      squad,
      squadUpdatedAt: team.squadUpdatedAt || other?.squadUpdatedAt || team.squadUpdatedAt,
    });
  };
  remote.forEach((t) => push(t, local));
  local.forEach((t) => push(t, remote));
  if (!purgedPlayers?.length) return out;
  return out.map((t) => ({
    ...t,
    squad: filterPurgedFromList(t.squad || [], purgedPlayers),
  }));
}

export function mergeTeamsForWrite(existingTeams, incomingTeams) {
  const existing = Array.isArray(existingTeams) ? existingTeams : [];
  const incoming = Array.isArray(incomingTeams) ? incomingTeams : null;
  if (!incoming) return existing;
  const ids = new Set();
  const out = [];
  const push = (team, fromIncoming) => {
    const id = teamIdOf(team);
    if (!id || ids.has(id)) return;
    ids.add(id);
    const other = (fromIncoming ? existing : incoming).find((t) => teamIdOf(t) === id);
    const existingTeam = fromIncoming ? other : team;
    const incomingTeam = fromIncoming ? team : other;
    const squad = pickSquadForWrite(existingTeam, incomingTeam || team);
    out.push({
      ...(existingTeam || {}),
      ...(incomingTeam || {}),
      id: (incomingTeam || team).id || (existingTeam || team).id || id,
      squad,
      squadUpdatedAt:
        (incomingTeam && squadStamp(incomingTeam) >= squadStamp(existingTeam)
          ? incomingTeam.squadUpdatedAt
          : existingTeam?.squadUpdatedAt) || incomingTeam?.squadUpdatedAt || existingTeam?.squadUpdatedAt,
    });
  };
  incoming.forEach((t) => push(t, true));
  existing.forEach((t) => push(t, false));
  return out;
}

export function mergeTeamCargasMaps(existing = {}, incoming = {}) {
  const out = { ...(existing && typeof existing === "object" ? existing : {}) };
  if (!incoming || typeof incoming !== "object") return out;
  for (const [teamId, cargas] of Object.entries(incoming)) {
    if (!cargas || typeof cargas !== "object" || Array.isArray(cargas)) {
      if (cargas && !out[teamId]) out[teamId] = cargas;
      continue;
    }
    out[teamId] = { ...(out[teamId] && typeof out[teamId] === "object" ? out[teamId] : {}), ...cargas };
  }
  return out;
}

export function mergeSeasonTestsMaps(existing = {}, incoming = {}) {
  const out = { ...(existing && typeof existing === "object" ? existing : {}) };
  if (!incoming || typeof incoming !== "object") return out;
  for (const [teamId, players] of Object.entries(incoming)) {
    if (!players || typeof players !== "object") continue;
    out[teamId] = { ...(out[teamId] && typeof out[teamId] === "object" ? out[teamId] : {}) };
    for (const [playerId, tests] of Object.entries(players)) {
      out[teamId][playerId] = {
        ...(out[teamId][playerId] && typeof out[teamId][playerId] === "object" ? out[teamId][playerId] : {}),
        ...(tests && typeof tests === "object" ? tests : {}),
      };
    }
  }
  return out;
}

export function mergeClubDataFields(localClub, remote) {
  const local = localClub && typeof localClub === "object" ? localClub : {};
  const src = remote && typeof remote === "object" ? remote : {};
  return {
    teams: mergeTeamsForRead(src.teams, local.teams, src.purgedPlayers || local.purgedPlayers || []),
    teamCargas: mergeTeamCargasMaps(local.teamCargas, src.teamCargas),
    seasonTests: mergeSeasonTestsMaps(local.seasonTests, src.seasonTests),
  };
}
