/**
 * Eliminación completa de un jugador en datos de club (servidor y localStorage).
 */

export function playerMatches(entry, userId, email) {
  if (!entry || typeof entry !== "object") return false;
  const id = String(entry.id || entry.userId || entry.player_id || "");
  const em = String(entry.email || "").toLowerCase();
  if (userId && id && id === String(userId)) return true;
  if (email && em && em === String(email).toLowerCase()) return true;
  return false;
}

export function dropPlayerFromList(list, userId, email) {
  if (!Array.isArray(list)) return list;
  return list.filter((p) => !playerMatches(p, userId, email));
}

export function isPurgedPlayer(entry, purgedPlayers = []) {
  if (!entry || !purgedPlayers?.length) return false;
  return purgedPlayers.some((p) => playerMatches(entry, p.userId || p.id, p.email));
}

export function filterPurgedFromList(list, purgedPlayers = []) {
  if (!Array.isArray(list) || !purgedPlayers?.length) return list || [];
  return list.filter((p) => !isPurgedPlayer(p, purgedPlayers));
}

export function addPurgedPlayer(data, { userId, email } = {}) {
  const next = data && typeof data === "object" ? { ...data } : {};
  const prev = Array.isArray(next.purgedPlayers) ? next.purgedPlayers : [];
  const row = {
    userId: userId ? String(userId) : "",
    email: email ? String(email).toLowerCase() : "",
    at: new Date().toISOString(),
  };
  if (!row.userId && !row.email) return next;
  const exists = prev.some((p) => playerMatches(p, row.userId, row.email) || (
    (row.userId && String(p.userId || p.id || "") === row.userId)
    || (row.email && String(p.email || "").toLowerCase() === row.email)
  ));
  if (exists) return next;
  next.purgedPlayers = [...prev, row].slice(-200);
  return next;
}

/**
 * Quita al jugador de users/squad/players del JSON del club y registra tombstone.
 * @returns {{ data: object, changed: boolean }}
 */
export function stripPlayerFromClubData(data, userId, email) {
  if (Array.isArray(data)) return { data, changed: false };
  const source = data && typeof data === "object" ? data : {};
  let changed = false;
  const drop = (list) => {
    if (!Array.isArray(list)) return list;
    const filtered = dropPlayerFromList(list, userId, email);
    if (filtered.length !== list.length) changed = true;
    return filtered;
  };
  const next = { ...source };
  next.users = drop(next.users);
  if (Array.isArray(next.teams)) {
    next.teams = next.teams.map((t) => ({
      ...t,
      squad: drop(t.squad),
      players: drop(t.players),
    }));
  }
  const withTomb = addPurgedPlayer(next, { userId, email });
  if ((withTomb.purgedPlayers || []).length !== (source.purgedPlayers || []).length) {
    changed = true;
  }
  return { data: withTomb, changed };
}

const EXTRA_USER_KEYS = [
  "depro_player_photo_",
  "depro_feedback_",
  "depro_wellness_",
  "depro_load_logs_",
  "depro_friends_",
];

function isClubDetailStorageKey(key) {
  if (!key?.startsWith("depro_club_")) return false;
  if (key === "depro_club_custom_warmups" || key === "depro_club_custom_tasks") return false;
  if (key.startsWith("depro_club_profile_")) return false;
  return true;
}

function dropLocalKey(key) {
  try {
    localStorage.removeItem(key);
    return 1;
  } catch {
    return 0;
  }
}

/**
 * Limpia plantillas, club JSON, branding y logs de este navegador.
 */
export function purgePlayerClubArtifacts(userId, email = "") {
  if (!userId && !email) return { removed: 0 };
  let removed = 0;
  const PLAYER_CLUB_PREFIX = "depro_player_club_";

  try {
    if (userId) {
      removed += dropLocalKey(`${PLAYER_CLUB_PREFIX}${userId}`);
      removed += dropLocalKey(`depro_player_logo_${userId}`);
      removed += dropLocalKey(`depro_player_banner_${userId}`);
      removed += dropLocalKey(`depro_player_accent_${userId}`);
      removed += dropLocalKey(`depro_plan_${userId}`);
      for (const prefix of EXTRA_USER_KEYS) {
        removed += dropLocalKey(`${prefix}${userId}`);
      }
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) keys.push(k);
        }
        for (const key of keys) {
          if (key.startsWith("depro_qstate_") && key.includes(String(userId))) {
            removed += dropLocalKey(key);
          }
        }
      } catch { /* ignore */ }
    }

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    for (const key of keys) {
      if (key.startsWith("depro_squad_") || key.startsWith("depro_team_registry_")) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          if (!Array.isArray(list)) continue;
          const next = dropPlayerFromList(list, userId, email);
          if (next.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(next));
            removed += 1;
          }
        } catch { /* ignore */ }
      }
      if (key.startsWith(PLAYER_CLUB_PREFIX) && email) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "{}");
          if (playerMatches(val, userId, email) || String(val.email || "").toLowerCase() === String(email).toLowerCase()) {
            removed += dropLocalKey(key);
          }
        } catch { /* ignore */ }
      }
      if (isClubDetailStorageKey(key)) {
        try {
          const detail = JSON.parse(localStorage.getItem(key) || "null");
          if (!detail || typeof detail !== "object") continue;
          const { data, changed } = stripPlayerFromClubData(detail, userId, email);
          if (changed) {
            localStorage.setItem(key, JSON.stringify(data));
            removed += 1;
          }
        } catch { /* ignore */ }
      }
    }

    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    let clubsChanged = false;
    const nextClubs = clubs.map((club) => {
      const { data, changed } = stripPlayerFromClubData(club, userId, email);
      if (changed) clubsChanged = true;
      return data;
    });
    if (clubsChanged) {
      localStorage.setItem("depro_clubs", JSON.stringify(nextClubs));
      removed += 1;
    }
  } catch { /* ignore */ }
  return { removed };
}

/** Aplica tombstones de un club a las keys locales de plantilla. */
export function applyPurgedPlayersToStorage(clubId, purgedPlayers = []) {
  if (!clubId || !purgedPlayers?.length) return 0;
  let n = 0;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    for (const key of keys) {
      if (key === `depro_club_${clubId}` || key.startsWith(`depro_squad_${clubId}_`)) {
        try {
          const raw = JSON.parse(localStorage.getItem(key) || "null");
          if (Array.isArray(raw)) {
            const next = filterPurgedFromList(raw, purgedPlayers);
            if (next.length !== raw.length) {
              localStorage.setItem(key, JSON.stringify(next));
              n += 1;
            }
          } else if (raw && typeof raw === "object") {
            const { data, changed } = stripFromPurgedClub(raw, purgedPlayers);
            if (changed) {
              localStorage.setItem(key, JSON.stringify(data));
              n += 1;
            }
          }
        } catch { /* ignore */ }
      }
      if (key.startsWith("depro_player_club_")) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "{}");
          if (val.clubId === clubId && isPurgedPlayer({ ...val, id: key.replace("depro_player_club_", "") }, purgedPlayers)) {
            localStorage.removeItem(key);
            n += 1;
          }
        } catch { /* ignore */ }
      }
      if (key.startsWith("depro_team_registry_")) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          if (!Array.isArray(list)) continue;
          const next = filterPurgedFromList(list, purgedPlayers);
          if (next.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(next));
            n += 1;
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
  return n;
}

function stripFromPurgedClub(club, purgedPlayers) {
  let changed = false;
  const drop = (list) => {
    if (!Array.isArray(list)) return list;
    const filtered = filterPurgedFromList(list, purgedPlayers);
    if (filtered.length !== list.length) changed = true;
    return filtered;
  };
  const next = { ...club, users: drop(club.users) };
  if (Array.isArray(next.teams)) {
    next.teams = next.teams.map((t) => ({
      ...t,
      squad: drop(t.squad),
      players: drop(t.players),
    }));
  }
  return { data: next, changed };
}
