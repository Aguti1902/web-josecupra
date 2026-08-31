/**
 * Decide si una suscripción Stripe / local se cancela ya (trial)
 * o al final del periodo pagado.
 */
export function shouldCancelSubscriptionImmediately(source = {}, now = Date.now()) {
  const status = String(source.status || "").toLowerCase();
  if (status === "trialing") return true;

  if (typeof source.trial_end === "number" && source.trial_end * 1000 > now) {
    return true;
  }

  if (source.trialEndsAt) {
    const end = new Date(source.trialEndsAt).getTime();
    if (!Number.isNaN(end) && end > now) return true;
  }

  return false;
}
