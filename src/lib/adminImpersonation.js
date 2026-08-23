/**
 * Vista admin del panel de un usuario (sin cerrar la sesión de admin).
 * Se guarda en sessionStorage y AuthContext lo aplica encima del usuario admin.
 */

export const IMPERSONATE_KEY = "depro_impersonate";

export function getImpersonationSnapshot() {
  try {
    const raw = sessionStorage.getItem(IMPERSONATE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    return snap?.id ? snap : null;
  } catch {
    return null;
  }
}

export function startImpersonation(snapshot) {
  if (!snapshot?.id) return;
  sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify(snapshot));
}

export function stopImpersonation() {
  try {
    sessionStorage.removeItem(IMPERSONATE_KEY);
  } catch { /* ignore */ }
}

export function isPremiumPlayerPlan(plan) {
  const p = String(plan || "").toLowerCase();
  return p === "player-pro" || p === "premium" || p === "pro";
}

export function isPlayerUser(u) {
  return u?.type === "player" || u?.role === "player";
}

/** En jugadores: Premium primero. El resto mantiene fecha (más reciente arriba). */
export function compareUsersForAdminList(a, b) {
  const aPlayer = isPlayerUser(a);
  const bPlayer = isPlayerUser(b);
  if (aPlayer && bPlayer) {
    const aPrem = isPremiumPlayerPlan(a.plan);
    const bPrem = isPremiumPlayerPlan(b.plan);
    if (aPrem !== bPrem) return aPrem ? -1 : 1;
  }
  return new Date(b.created_at || 0) - new Date(a.created_at || 0);
}

export function canImpersonateUser(u) {
  if (!u?.id) return false;
  if (u.role === "admin" || u.type === "admin") return false;
  return true;
}

export function canDeleteUser(u, adminEmail) {
  if (!u?.id) return false;
  if (u.role === "admin" || u.type === "admin") return false;
  if (u.email && adminEmail && String(u.email).toLowerCase() === String(adminEmail).toLowerCase()) return false;
  if (String(u.email || "").toLowerCase() === "jose@depro.es") return false;
  return true;
}
