/**
 * Evaluación pura de acceso a features (sin Supabase / localStorage).
 * Usado por hasFeatureAccess en subscription.js y por tests.
 */
import { FEATURES, planIncludesFeature } from "./planFeatures.js";
import { featuresForAddon } from "./playerAddons.js";

/** Features Premium-only (sin extra comprable). */
const PREMIUM_ONLY_FEATURES = new Set(["feedback", "coach_contact"]);

/**
 * @param {{
 *   audience: string,
 *   planId?: string|null,
 *   billingSource?: string|null,
 *   isTrial?: boolean,
 *   isPro?: boolean,
 *   purchasedAddons?: string[],
 *   featureId: string,
 * }} opts
 */
export function evaluateFeatureAccess({
  audience,
  planId = null,
  billingSource = null,
  isTrial = false,
  isPro = false,
  purchasedAddons = [],
  featureId,
}) {
  const feature = FEATURES[featureId];
  if (!feature) return true;
  if (!feature.audiences.includes(audience)) return true;

  // Club/coach manual: sin paywall. Jugadores manuales respetan el plan.
  if (billingSource === "manual" && audience !== "player") return true;

  if (feature.addonId && purchasedAddons.includes(feature.addonId)) return true;
  if (purchasedAddons.some((aid) => featuresForAddon(aid).includes(featureId))) return true;

  if (audience === "player" && isPro && !isTrial) return true;

  // Trial Standard: extras visibles, feedback/preparador solo Premium
  if (isTrial) {
    if (PREMIUM_ONLY_FEATURES.has(featureId)) return false;
    return true;
  }

  const effectivePlan = planId || (audience === "player" ? "player-essential" : null);
  if (!effectivePlan) return true;
  return planIncludesFeature(effectivePlan, audience, feature);
}
