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

export function isRealAdminUser(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return String(user.email || "").toLowerCase() === "jose@depro.es";
}

const SNAPSHOT_KEYS = [
  "id", "email", "name", "role", "type", "typeLabel", "teamRole", "clubId", "clubName",
  "plan", "subscriptionStatus", "billingSource", "purchasedAddons", "trialEndsAt",
  "stripeSubscriptionId", "stripeCustomerId", "posicion", "deporte", "objetivo",
  "objetivos", "frecuencia", "material", "experiencia", "diaCompeticion", "disponibles",
  "lesion", "lesionSubtipo", "edad", "phone", "telefono", "isSoloCoach",
  "managedTeamIds", "teamId", "manualPrice",
];

export function startImpersonation(snapshot) {
  if (!snapshot?.id) return;
  const slim = {};
  for (const k of SNAPSHOT_KEYS) {
    if (snapshot[k] !== undefined) slim[k] = snapshot[k];
  }
  sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify(slim));
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
