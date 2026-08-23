/**
 * Registro de funcionalidades del panel: qué plan las incluye y si
 * quedan bloqueadas durante el periodo de prueba de 15 días.
 *
 * PDF §6: durante la demo el usuario explora casi todo; solo se bloquea
 * persistencia (PDF, export, guardar progreso/cargas/estadísticas).
 */
import { PLAN_ORDER, PLANS } from "./checkoutPlans.js";

export const FEATURES = {
  feedback: {
    id: "feedback",
    labelKey: "features.feedback",
    descKey: "features.feedback_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: false,
    upsellBenefits: [
      "Feedback semanal personalizado del preparador",
      "Ajustes del plan según tu evolución",
      "Incluido en Premium (plazas limitadas)",
    ],
  },
  ranking: {
    id: "ranking",
    labelKey: "features.ranking",
    descKey: "features.ranking_desc",
    audiences: ["player"],
    minPlan: { player: "player-essential" },
    trialLocked: false,
  },
  physical_tests: {
    id: "physical_tests",
    labelKey: "features.physical_tests",
    descKey: "features.physical_tests_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: false,
    addonId: "addon-progression",
    upsellBenefits: ["Tests físicos guiados", "Registro e histórico", "Comparativas de progreso"],
  },
  pdf_export: {
    id: "pdf_export",
    labelKey: "features.pdf_export",
    descKey: "features.pdf_export_desc",
    audiences: ["player", "coach", "club"],
    minPlan: { player: "player-pro", coach: "coach-premium", club: "club-inicial" },
    trialLocked: true,
    addonId: "addon-pdf",
    upsellBenefits: ["Descarga de sesiones en PDF", "Plan semanal imprimible", "Formato profesional DEPRO"],
  },
  mesocycle: {
    id: "mesocycle",
    labelKey: "features.mesocycle",
    descKey: "features.mesocycle_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-starter", club: "club-inicial" },
    trialLocked: false,
  },
  cargas: {
    id: "cargas",
    labelKey: "features.cargas",
    descKey: "features.cargas_desc",
    audiences: ["player", "coach", "club"],
    minPlan: { player: "player-pro", coach: "coach-premium", club: "club-pro" },
    trialLocked: false,
    addonId: "addon-cargas",
    upsellBenefits: ["Registro de cargas por ejercicio", "Histórico y gráficos", "Sincronizado con tus sesiones"],
  },
  team_tests: {
    id: "team_tests",
    labelKey: "features.team_tests",
    descKey: "features.team_tests_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-starter", club: "club-inicial" },
    trialLocked: false,
  },
  coach_contact: {
    id: "coach_contact",
    labelKey: "features.coach_contact",
    descKey: "features.coach_contact_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: false,
    upsellBenefits: ["Chat directo con tu preparador", "Respuestas personalizadas", "Historial de conversaciones"],
  },
  progression: {
    id: "progression",
    labelKey: "features.progression",
    descKey: "features.progression_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: false,
    addonId: "addon-progression",
  },
  exercise_library: {
    id: "exercise_library",
    labelKey: "features.exercise_library",
    descKey: "features.exercise_library_desc",
    audiences: ["player"],
    minPlan: { player: "player-essential" },
    trialLocked: false,
    addonId: "addon-unlimited-exercises",
  },
  unlimited_exercises: {
    id: "unlimited_exercises",
    labelKey: "features.unlimited_exercises",
    descKey: "features.unlimited_exercises_desc",
    audiences: ["player"],
    minPlan: { player: "player-pro" },
    trialLocked: false,
    addonId: "addon-unlimited-exercises",
    upsellBenefits: ["Cambios de ejercicio ilimitados", "Misma planificación base", "Ideal para probar variantes"],
  },
  unlimited_ball_warmups: {
    id: "unlimited_ball_warmups",
    labelKey: "features.unlimited_ball_warmups",
    descKey: "features.unlimited_ball_warmups_desc",
    audiences: ["coach", "club"],
    minPlan: { coach: "coach-premium", club: "club-inicial" },
    trialLocked: false,
    addonId: "addon-coach-ball-refresh",
    upsellBenefits: ["Cambiar tareas con balón sin límite", "Misma sesión, otra variante", "Incluido en Premium"],
  },
  extra_teams: {
    id: "extra_teams",
    labelKey: "features.extra_teams",
    descKey: "features.extra_teams_desc",
    audiences: ["coach"],
    minPlan: { coach: "coach-premium" },
    trialLocked: false,
    addonId: "addon-coach-teams",
    upsellBenefits: ["Hasta 4 equipos", "+3 equipos extra", "Incluido en Premium"],
  },
};

function planIndex(audience, planId) {
  const canonical = planId === "coach-pro" ? "coach-starter" : planId;
  const order = PLAN_ORDER[audience] || [];
  const idx = order.indexOf(canonical);
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
    trialAddon: f.addonId || null,
  }));
}
