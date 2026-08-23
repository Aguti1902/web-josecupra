/** Capacidad Premium jugadores — compartido API (evitar import desde src/). */
export const PREMIUM_PLAYER_CAP = 40;

export function isPremiumPlanId(planId) {
  const p = String(planId || "").toLowerCase();
  return p === "player-pro" || p === "premium" || p === "pro";
}

export function countPremiumPlayersFromUsers(users = []) {
  let n = 0;
  for (const u of users) {
    const meta = u.user_metadata || {};
    const role = meta.role || "player";
    if (role !== "player" && role !== "jugador") continue;
    if (isPremiumPlanId(meta.plan)) n += 1;
  }
  return n;
}

export function premiumSpotsRemaining(premiumCount, cap = PREMIUM_PLAYER_CAP) {
  return Math.max(0, cap - (Number(premiumCount) || 0));
}
