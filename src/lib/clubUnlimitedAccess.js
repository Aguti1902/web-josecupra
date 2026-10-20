import { getPlanLimits, resolvePlanForClub, PLANS } from "./checkoutPlans.js";
import { canManageClubBilling } from "./clubRoles.js";
import { isProCoachUser } from "./clubAuto/clubAutoCoachBridge.js";

function clubBillingSource(user, club) {
  return String(
    user?.billingSource
    || club?.billingSource
    || user?.club?.billingSource
    || ""
  ).toLowerCase();
}

function isSoloCoachAccount(user, club) {
  const c = club || user?.club;
  return !!(isProCoachUser(user) || user?.isSoloCoach || c?.isSoloCoach);
}

function resolvePlan(user, club) {
  if (user?.plan && PLANS[user.plan]) return PLANS[user.plan];
  const solo = isSoloCoachAccount(user, club);
  if (user?.role === "club") {
    return resolvePlanForClub(club?.plan || user?.club?.plan, solo ? "coach" : "club");
  }
  if (club?.plan) return resolvePlanForClub(club.plan, solo ? "coach" : "club");
  return null;
}

/**
 * Academia creada desde el panel DEPRO: cupos y funciones sin contratar plan Stripe.
 * Coordinadores, entrenadores y ayudantes nunca pagan; el administrador del club
 * tampoco si la cuenta no va por Stripe.
 */
export function hasUnlimitedClubAccess(user, club) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (isSoloCoachAccount(user, club)) return false;
  if (user.role !== "club") return false;
  // Staff de academia (coordinador / entrenador / ayudante): acceso a su parte, sin paywall.
  if (!canManageClubBilling(user)) return true;
  const c = club || user.club || null;
  const billing = clubBillingSource(user, c);
  if (billing === "stripe") return false;
  if (user.stripeSubscriptionId || c?.stripeSubscriptionId) return false;
  return true;
}

/** Límites efectivos de equipos/jugadores. Null = ilimitado. */
export function getEffectivePlanLimits(user, club) {
  if (hasUnlimitedClubAccess(user, club)) {
    return { maxTeams: null, maxPlayers: null };
  }
  const plan = resolvePlan(user, club);
  return plan
    ? getPlanLimits(plan.id, { purchasedAddons: user?.purchasedAddons || [] })
    : { maxTeams: null, maxPlayers: null };
}
