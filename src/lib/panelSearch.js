import { EXERCISES } from "../data/exercises";

const TYPE_LABELS = {
  page: "Página",
  club: "Club",
  user: "Usuario",
  exercise: "Ejercicio",
  player: "Jugador",
  team: "Equipo",
};

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(q, ...fields) {
  const nq = norm(q);
  if (!nq) return false;
  return fields.some((f) => norm(f).includes(nq));
}

export function getSearchTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

export function flattenAdminNav(navGroups) {
  return navGroups.flatMap((g) =>
    g.items.map((item) => ({
      to: item.to.split("?")[0],
      fullTo: item.to,
      label: item.label,
      hint: item.hint || "",
      group: g.label,
    }))
  );
}

export function searchNavPages(query, pages, limit = 6) {
  if (!query.trim()) return [];
  return pages
    .filter((p) => matches(query, p.label, p.hint, p.group))
    .slice(0, limit)
    .map((p) => ({
      id: `page-${p.fullTo || p.to}`,
      type: "page",
      label: p.label,
      sub: p.group,
      to: p.fullTo || p.to,
    }));
}

export function searchExerciseCatalog(query, { admin = true, limit = 8 } = {}) {
  if (!query.trim()) return [];
  const base = admin ? "/admin/catalog" : "/dashboard/plan";
  return EXERCISES.filter((e) => matches(query, e.nombre, e.id, ...(e.etiquetas || [])))
    .slice(0, limit)
    .map((e) => ({
      id: `ex-${e.id}`,
      type: "exercise",
      label: e.nombre,
      sub: "Ejercicio · catálogo",
      to: admin ? `${base}?q=${encodeURIComponent(e.nombre)}` : base,
    }));
}

let adminCache = null;
let adminCacheAt = 0;
const CACHE_TTL = 60_000;

export async function loadAdminSearchCache(token) {
  if (adminCache && Date.now() - adminCacheAt < CACHE_TTL) return adminCache;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [usersRes, clubsRes] = await Promise.all([
    fetch("/api/admin-users", { headers }).catch(() => null),
    fetch("/api/admin-clubs", { headers }).catch(() => null),
  ]);
  const usersJson = usersRes?.ok ? await usersRes.json().catch(() => ({})) : {};
  const clubsJson = clubsRes?.ok ? await clubsRes.json().catch(() => ({})) : {};
  adminCache = {
    users: usersJson.users || [],
    clubs: clubsJson.clubs || [],
  };
  adminCacheAt = Date.now();
  return adminCache;
}

export function searchAdminEntities(query, cache, limit = 8) {
  if (!query.trim() || !cache) return [];
  const results = [];
  const q = query.trim();

  for (const c of cache.clubs || []) {
    if (results.length >= limit) break;
    if (!matches(q, c.name, c.city, c.abbreviation, c.coordinator?.name, c.coordinator?.email)) continue;
    results.push({
      id: `club-${c.id}`,
      type: "club",
      label: c.name,
      sub: [c.city, c.coordinator?.name].filter(Boolean).join(" · ") || "Club",
      to: `/admin/clubs/${c.id}`,
    });
  }

  for (const u of cache.users || []) {
    if (results.length >= limit) break;
    if (!matches(q, u.name, u.email, u.clubName, u.typeLabel, u.plan)) continue;
    let to = "/admin/users";
    if (u.type?.startsWith("club_") && u.clubId) to = `/admin/clubs/${u.clubId}`;
    results.push({
      id: `user-${u.id}`,
      type: "user",
      label: u.name || u.email,
      sub: `${u.typeLabel || u.type}${u.clubName ? ` · ${u.clubName}` : ""}`,
      to,
    });
  }

  return results.slice(0, limit);
}

export async function runAdminSearch(query, pages, token) {
  const q = query.trim();
  if (q.length < 1) return [];

  const pagesR = searchNavPages(q, pages, 5);
  const exercisesR = searchExerciseCatalog(q, { admin: true, limit: 5 });

  let entitiesR = [];
  if (q.length >= 2) {
    try {
      const cache = await loadAdminSearchCache(token);
      entitiesR = searchAdminEntities(q, cache, 8);
    } catch {
      entitiesR = [];
    }
  }

  const seen = new Set();
  return [...pagesR, ...entitiesR, ...exercisesR].filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  }).slice(0, 12);
}

export function loadClientSquadPlayers(user) {
  const players = [];
  const club = user?.club;
  const team = user?.team;
  if (!club?.id) return players;

  const teamIds = team?.id
    ? [team.id]
    : (club.teams || []).map((t) => t.id);

  for (const teamId of teamIds) {
    try {
      const raw = localStorage.getItem(`depro_squad_${club.id}_${teamId}`);
      const squad = raw ? JSON.parse(raw) : [];
      if (Array.isArray(squad)) {
        squad.forEach((p) => {
          players.push({
            id: p.id || p.email,
            name: p.name || p.nombre,
            email: p.email,
            teamId,
            teamName: club.teams?.find((t) => t.id === teamId)?.name,
          });
        });
      }
    } catch { /* ignore */ }
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("depro_player_club_")) continue;
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      if (data.clubId !== club.id) continue;
      if (team?.id && data.teamId && data.teamId !== team.id) continue;
      players.push({
        id: key.replace("depro_player_club_", ""),
        name: data.name || data.email,
        email: data.email,
        teamId: data.teamId,
      });
    }
  } catch { /* ignore */ }

  const uniq = new Map();
  players.forEach((p) => {
    const k = p.email || p.id;
    if (k && !uniq.has(k)) uniq.set(k, p);
  });
  return [...uniq.values()];
}

export function runClientSearch(query, { navItems, user }) {
  const q = query.trim();
  if (!q) return [];

  const pagesR = (navItems || [])
    .filter((n) => matches(q, n.label, n.to))
    .slice(0, 6)
    .map((n) => ({
      id: `page-${n.to}`,
      type: "page",
      label: n.label,
      sub: "Sección del panel",
      to: n.to,
    }));

  const exercisesR = searchExerciseCatalog(q, { admin: false, limit: 4 });

  const playersR = loadClientSquadPlayers(user)
    .filter((p) => matches(q, p.name, p.email, p.teamName))
    .slice(0, 6)
    .map((p) => ({
      id: `player-${p.id}`,
      type: "player",
      label: p.name || p.email,
      sub: p.teamName ? `Jugador · ${p.teamName}` : "Jugador · plantilla",
      to: "/dashboard/squad",
    }));

  const seen = new Set();
  return [...pagesR, ...playersR, ...exercisesR].filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  }).slice(0, 10);
}
