/**
 * Estado de extras del carrito: contratado vs incluido en plan vs no contratado.
 * El acceso en trial NO cuenta como extra comprado.
 */

function isPremiumPlan(user) {
  const plan = String(user?.plan || "").toLowerCase();
  return plan === "player-pro" || plan === "premium" || plan === "pro" || plan === "coach-premium";
}

export function isAddonPurchased(user, addon) {
  const ids = user?.purchasedAddons || [];
  if (!addon) return false;
  if (ids.includes(addon.id)) return true;
  if (addon.featureId && ids.includes(addon.featureId)) return true;
  return false;
}

/**
 * @returns {"paid"|"plan_included"|"missing"}
 */
export function addonOwnershipState(user, addon) {
  if (isAddonPurchased(user, addon)) return "paid";
  if (isPremiumPlan(user)) return "plan_included";
  return "missing";
}

export function addonOwnershipLabel(state, { inTrial = false } = {}) {
  if (state === "paid") return "Contratado";
  if (state === "plan_included") return "Incluido en tu plan";
  if (inTrial) return "No contratado · disponible en prueba";
  return "No contratado";
}

