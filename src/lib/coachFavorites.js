/** Favoritos de ejercicios del entrenador (Modo Personalizado) — solo localStorage. */
const key = (clubId) => `depro_coach_favorites_${clubId || "x"}`;

export function loadFavorites(clubId) {
  try { return JSON.parse(localStorage.getItem(key(clubId)) || "[]"); } catch { return []; }
}

export function toggleFavorite(clubId, exerciseId) {
  const favs = loadFavorites(clubId);
  const next = favs.includes(exerciseId) ? favs.filter((id) => id !== exerciseId) : [...favs, exerciseId];
  try { localStorage.setItem(key(clubId), JSON.stringify(next)); } catch {}
  return next;
}
