/**
 * Copia plantilla / cargas / marcas de tests del blob del club a las claves
 * que leen las pantallas (depro_squad_*, depro_cargas_*, depro_season_tests_*).
 */
import { seasonTestsKey } from "./teamTestRatings.js";

export function squadStorageKey(clubId, teamId) {
  return `depro_squad_${clubId}_${teamId}`;
}

export function cargasStorageKey(clubId, teamId) {
  return `depro_cargas_${clubId}_${teamId}`;
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* cupo */ }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Hidrata el caché del dispositivo desde el club remoto (login / recarga). */
export function hydrateClubDeviceCache(club) {
  if (!club?.id) return;
  const clubId = club.id;
  const teams = Array.isArray(club.teams) ? club.teams : [];
  for (const team of teams) {
    if (!team?.id) continue;
    if (Array.isArray(team.squad) && team.squad.length) {
      const local = readJson(squadStorageKey(clubId, team.id), []);
      const richer = team.squad.length >= (local?.length || 0) ? team.squad : local;
      writeJson(squadStorageKey(clubId, team.id), richer.length ? richer : team.squad);
    }
    const cargas = club.teamCargas?.[team.id];
    if (cargas && typeof cargas === "object") {
      const local = readJson(cargasStorageKey(clubId, team.id), null);
      if (!local || !Object.keys(local).length) {
        writeJson(cargasStorageKey(clubId, team.id), cargas);
      } else {
        writeJson(cargasStorageKey(clubId, team.id), { ...cargas, ...local });
      }
    }
    const season = club.seasonTests?.[team.id];
    if (season && typeof season === "object") {
      for (const [playerId, data] of Object.entries(season)) {
        if (!playerId || !data || typeof data !== "object") continue;
        const local = readJson(seasonTestsKey(playerId), {});
        writeJson(seasonTestsKey(playerId), { ...local, ...data });
      }
    }
  }
}
