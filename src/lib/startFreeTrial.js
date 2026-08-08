/**
 * Prueba gratuita sin tarjeta (PDF §8).
 * Crea cuenta con status trialing + trialEndsAt; sin Stripe.
 * Al vencer, mustPayToContinue bloquea el acceso hasta pagar.
 */
import { TRIAL_PERIOD_DAYS, syncLocalSubscription } from "./subscription.js";

export function computeTrialEndsAt(days = TRIAL_PERIOD_DAYS) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Metadata de usuario para trial sin tarjeta. */
export function buildTrialMetadata(form = {}, planId = "player-essential") {
  const audience = form.audience || (planId.startsWith("club") ? "club" : planId.startsWith("coach") ? "coach" : "player");
  const role = audience === "club" ? "club" : audience === "coach" ? "coach" : "player";
  const trialEndsAt = computeTrialEndsAt();

  return {
    name: form.nombre || form.name || "",
    audience,
    role,
    plan: planId,
    objetivo: form.objetivo || "",
    objetivoSecundario: form.objetivoSecundario || "",
    objetivos: form.objetivos || [],
    deporte: form.deporte || "",
    frecuencia: form.frecuencia || "",
    material: Array.isArray(form.material) ? form.material.join("|") : (form.material || ""),
    experiencia: form.experiencia || "",
    diaCompeticion: form.diaCompeticion || "",
    edad: form.edad || "",
    lesion: form.lesion || [],
    lesionSubtipo: form.lesionSubtipo || [],
    disponibles: form.disponibles || [],
    clubCode: form.clubCode || "",
    clubName: form.club || form.clubName || "",
    primaryColor: form.primaryColor || "",
    secondaryColor: form.secondaryColor || "",
    subscriptionStatus: "trialing",
    trialEndsAt,
    billingSource: "trial_no_card",
    purchasedAddons: [],
  };
}

/** Persiste suscripción local de trial (espejo Auth metadata). */
export function persistLocalTrial(userId, planId, trialEndsAt) {
  if (!userId) return;
  syncLocalSubscription(userId, {
    plan: planId,
    status: "trialing",
    trialEndsAt,
    billingSource: "trial_no_card",
  });
}

export default {
  computeTrialEndsAt,
  buildTrialMetadata,
  persistLocalTrial,
};
