/** Fusiona JWT + caché local. Si el usuario saltó el trial, gana el estado local activo. */
export function mergeSubscriptionState(meta = {}, local = null) {
  const plan = meta.plan || local?.plan || null;
  const skipped = !!(meta.skippedTrial || local?.skippedTrial || local?.status === "active");
  const status = skipped
    ? "active"
    : (meta.subscriptionStatus || local?.status || (meta.trialEndsAt ? "trialing" : "active"));
  return {
    plan: plan || local?.plan || "player-essential",
    status,
    cancelAt: meta.subscriptionCancelAt || local?.cancelAt || null,
    trialEndsAt: skipped ? null : (meta.trialEndsAt || local?.trialEndsAt || null),
    billingSource: meta.billingSource || local?.billingSource || null,
    stripeSubscriptionId: meta.stripeSubscriptionId || local?.stripeSubscriptionId || null,
    purchasedAddons: meta.purchasedAddons || local?.purchasedAddons || [],
    skippedTrial: skipped,
  };
}
