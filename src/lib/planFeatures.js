/**
 * Registro de funcionalidades del panel: qué plan las incluye y si
 * quedan bloqueadas durante el periodo de prueba de 15 días.
 */
import { PLAN_ORDER, PLANS } from "./checkoutPlans";

export const FEATURES = {
  feedback: {
    id: "feedback",
    labelKey: "features.feedback",
    descKey: "features.feedback_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: true,
  },
  ranking: {
    id: "ranking",
    labelKey: "features.ranking",
    descKey: "features.ranking_desc",
    audiences: ["player"],
    minPlan: { player: "player-essential" },
    trialLocked: true,
  },
  physical_tests: {
    id: "physical_tests",
    labelKey: "features.physical_tests",
    descKey: "features.physical_tests_desc",
    audiences: ["player"],
    minPlan: { player: "player-essential" },
    trialLocked: true,
  },
  pdf_export: {
    id: "pdf_export",
    labelKey: "features.pdf_export",
    descKey: "features.pdf_export_desc",
    audiences: ["player", "coach", "club"],
    minPlan: { player: "player-essential", coach: "coach-starter", club: "club-inicial" },
    trialLocked: true,
  },
  mesocycle: {
    id: "mesocycle",
    labelKey: "features.mesocycle",
    descKey: "features.mesocycle_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-starter", club: "club-inicial" },
    trialLocked: true,
  },
  cargas: {
    id: "cargas",
    labelKey: "features.cargas",
    descKey: "features.cargas_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-pro", club: "club-pro" },
    trialLocked: true,
  },
  team_tests: {
    id: "team_tests",
    labelKey: "features.team_tests",
    descKey: "features.team_tests_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-pro", club: "club-inicial" },
    trialLocked: true,
  },
  coach_contact: {
    id: "coach_contact",
    labelKey: "features.coach_contact",
    descKey: "features.coach_contact_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: true,
  },
};

function planIndex(audience, planId) {
  const order = PLAN_ORDER[audience] || [];
  const idx = order.indexOf(planId);
  return idx === -1 ? order.length : idx;
}

/** ¿El plan actual alcanza el mínimo requerido para la feature? */
export function planIncludesFeature(planId, audience, feature) {
  if (!feature) return true;
  const minId = feature.minPlan?.[audience];
  if (!minId) return true;
  if (!planId) return false;
  if (PLANS[planId]) {
    return planIndex(audience, planId) >= planIndex(audience, minId);
  }
  return true;
}

/** Plan sugerido para desbloquear la feature (upsell). */
export function upsellPlanForFeature(planId, audience, feature) {
  if (!feature) return null;
  const minId = feature.minPlan?.[audience];
  if (!minId) return null;
  if (planIncludesFeature(planId, audience, feature)) {
    const order = PLAN_ORDER[audience] || [];
    const idx = order.indexOf(planId);
    if (idx >= 0 && idx < order.length - 1) return PLANS[order[idx + 1]];
    return null;
  }
  return PLANS[minId] || null;
}

/** Features bloqueadas para el usuario (trial o plan inferior). */
export function lockedFeaturesForUser(user, { isInTrial, hasFeatureAccess, resolveUserAudience }) {
  const audience = resolveUserAudience(user);
  const planId = user?.plan || null;
  return Object.values(FEATURES).filter((f) => {
    if (!f.audiences.includes(audience)) return false;
    return !hasFeatureAccess(user, f.id);
  }).map((f) => ({
    ...f,
    reason: isInTrial(user) && f.trialLocked ? "trial" : "plan",
    upsellPlan: upsellPlanForFeature(planId, audience, f),
  }));
}
