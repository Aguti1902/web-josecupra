/**
 * Capacidad del plan Premium (jugadores individuales).
 * Tagline checkout: 40 plazas.
 */
export const PREMIUM_PLAYER_CAP = 40;

export function isPremiumPlanId(planId) {
  const p = String(planId || "").toLowerCase();
  return p === "player-pro" || p === "premium" || p === "pro";
}

/** Cuenta usuarios player con plan premium en la lista de auth users (admin). */
export function countPremiumPlayersFromUsers(users = []) {
  let n = 0;
  for (const u of users) {
    const meta = u.user_metadata || u || {};
    const role = meta.role || u.role || "player";
    if (role !== "player" && role !== "jugador") continue;
    if (isPremiumPlanId(meta.plan || u.plan)) n += 1;
  }
  return n;
}

export function premiumSpotsRemaining(premiumCount, cap = PREMIUM_PLAYER_CAP) {
  return Math.max(0, cap - (Number(premiumCount) || 0));
}

export function canJoinPremium(premiumCount, { alreadyPremium = false, cap = PREMIUM_PLAYER_CAP } = {}) {
  if (alreadyPremium) return true;
  return premiumSpotsRemaining(premiumCount, cap) > 0;
}
