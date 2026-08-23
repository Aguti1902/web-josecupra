import { supabase } from "./supabase";
import { PLANS, getPlanLimits, getNextPlan, resolvePlanForClub } from "./checkoutPlans";
import { FEATURES, planIncludesFeature, upsellPlanForFeature } from "./planFeatures";
import { featuresForAddon } from "./playerAddons";
import { isClubAdmin } from "./clubRoles";

const STORAGE_PREFIX = "depro_subscription_";
export const TRIAL_PERIOD_DAYS = 15;

export const PLAN_LABELS = {
  "coach-starter": "Entrenador Starter",
  "coach-pro": "Entrenador Pro",
  "coach-premium": "Entrenador Premium",
  "club-inicial": "Club Inicial",
  "club-pro": "Club Profesional",
  "club-elite": "Club Elite",
  "player-essential": "Jugador Standard",
  "player-pro": "Jugador Premium",
  basic: "Plan Standard",
  premium: "Plan Premium",
};

export const PLAN_PRICES = {
  "coach-starter": "14,99€/mes",
  "coach-pro": "29,99€/mes",
  "coach-premium": "49,99€/mes",
  "club-inicial": "199€/mes",
  "club-pro": "399€/mes",
  "club-elite": "699€/mes",
  "player-essential": "29€/mes",
  "player-pro": "99€/mes",
  basic: "49€/mes",
  premium: "119€/mes",
};

export function getPlanLabel(plan) {
  if (!plan) return "Plan DEPRO";
  const id = String(plan).toLowerCase();
  if (PLANS[id]?.name) return PLANS[id].name;
  return PLAN_LABELS[id] || plan;
}

export function getPlanPrice(plan) {
  if (!plan) return null;
  return PLAN_PRICES[String(plan).toLowerCase()] || null;
}

function loadLocalSubscription(userId) {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${userId}`) || "null");
  } catch {
    return null;
  }
}

function saveLocalSubscription(userId, data) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Plan en caché local (tras checkout si la sesión JWT aún no se refrescó). */
export function getCachedSubscription(userId) {
  return loadLocalSubscription(userId);
}

/** Sincroniza suscripción en localStorage tras checkout o webhook. */
export function syncLocalSubscription(userId, data) {
  if (!userId || !data?.plan) return;
  saveLocalSubscription(userId, {
    plan: data.plan,
    status: data.status || data.subscriptionStatus || "trialing",
    trialEndsAt: data.trialEndsAt || null,
    stripeSubscriptionId: data.stripeSubscriptionId || null,
    billingSource: data.billingSource || "stripe",
    purchasedAddons: data.purchasedAddons || [],
  });
}

/** Jugador individual con plan de pago (no usuario de club) */
export function isIndividualSubscriber(user) {
  if (!user || user.role !== "player") return false;
  if (user.team_role) return false;
  const sub = getSubscriptionFromUser(user);
  return !!(sub?.plan || user.plan || user.stripeSubscriptionId || user.billingSource === "stripe");
}

export function getSubscriptionFromUser(user) {
  if (!user?.id) return null;
  const local = loadLocalSubscription(user.id);
  const meta = user;
  const plan = meta.plan || local?.plan || null;
  if (!plan && !meta.stripeSubscriptionId && meta.billingSource !== "stripe") return null;

  const status = meta.subscriptionStatus || local?.status || (meta.trialEndsAt ? "trialing" : "active");
  return {
    plan: plan || local?.plan || "player-essential",
    status,
    cancelAt: meta.subscriptionCancelAt || local?.cancelAt || null,
    trialEndsAt: meta.trialEndsAt || local?.trialEndsAt || null,
    billingSource: meta.billingSource || local?.billingSource || null,
    stripeSubscriptionId: meta.stripeSubscriptionId || local?.stripeSubscriptionId || null,
    purchasedAddons: meta.purchasedAddons || local?.purchasedAddons || [],
  };
}

export function isSubscriptionActive(sub) {
  if (!sub) return false;
  if (sub.status === "active") return true;
  // Alta manual / demo: acceso válido sin Stripe
  if (sub.status === "comp" || sub.status === "demo") return true;
  // Pendiente / borrador: perfil creado, sin acceso de producto todavía
  if (sub.status === "pendiente" || sub.status === "borrador") return false;
  if (sub.status === "trialing") {
    if (!sub.trialEndsAt) return true;
    return new Date(sub.trialEndsAt) > new Date();
  }
  if (sub.status === "cancel_at_period_end" && sub.cancelAt) {
    return new Date(sub.cancelAt) > new Date();
  }
  return false;
}

/** Cuentas admin/manual sin restricciones de trial. */
export function isManualBilling(user) {
  const sub = getSubscriptionFromUser(user);
  return sub?.billingSource === "manual" || user?.billingSource === "manual";
}

export function isInTrial(user) {
  if (!user || isManualBilling(user)) return false;
  const sub = getSubscriptionFromUser(user);
  if (!sub) return false;

  const trialEnd = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const trialActive = trialEnd ? trialEnd > new Date() : false;

  if (sub.status === "trialing") return trialActive || !trialEnd;
  if (trialActive) return true;
  return false;
}

export function getTrialDaysLeft(user) {
  if (!isInTrial(user)) return 0;
  const sub = getSubscriptionFromUser(user);
  if (!sub?.trialEndsAt) return TRIAL_PERIOD_DAYS;
  const ms = new Date(sub.trialEndsAt) - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Trial acabado sin suscripción activa — debe pagar para continuar.
 * No aplica a cuentas manuales, admin ni jugadores gestionados por club sin facturación propia.
 */
export function mustPayToContinue(user) {
  if (!user || isManualBilling(user) || user.role === "admin") return false;

  // Solo el administrador del club gestiona la suscripción del club
  if (user.role === "club" && !user.club?.isSoloCoach && !isClubAdmin(user)) return false;

  const sub = getSubscriptionFromUser(user);
  if (!sub || isSubscriptionActive(sub)) return false;

  if (user.role === "player") {
    if (user.team_role) return false;
    if (user.clubId && !user.stripeSubscriptionId && user.billingSource !== "stripe") return false;
  }

  const hasBillingTrail =
    sub.stripeSubscriptionId ||
    user.stripeSubscriptionId ||
    user.billingSource === "stripe" ||
    user.billingSource === "trial_no_card" ||
    sub.billingSource === "trial_no_card" ||
    sub.trialEndsAt;

  return !!hasBillingTrail;
}

export function shouldShowTrialWatermark(user) {
  return isInTrial(user);
}

export function resolveUserAudience(user) {
  if (user?.role === "player") return "player";
  if (user?.role === "club") {
    if (user?.club?.isSoloCoach) return "coach";
    return "club";
  }
  return "player";
}

export function isPlayerPro(user) {
  const plan = user?.plan || getSubscriptionFromUser(user)?.plan;
  const p = String(plan || "").toLowerCase();
  return p === "player-pro" || p === "premium" || p === "pro";
}

/** Acceso a una funcionalidad concreta (plan + trial + extras comprados). */
export function hasFeatureAccess(user, featureId) {
  if (!user) return false;
  if (isManualBilling(user)) return true;

  const feature = FEATURES[featureId];
  if (!feature) return true;

  const audience = resolveUserAudience(user);
  if (!feature.audiences.includes(audience)) return true;

  const sub = getSubscriptionFromUser(user);
  const planId = sub?.plan || user.plan;
  const purchased = user.purchasedAddons || sub?.purchasedAddons || [];

  if (feature.addonId && purchased.includes(feature.addonId)) return true;
  // Addons agrupados (p.ej. progresión+test, ejercicios+biblioteca)
  if (purchased.some((aid) => featuresForAddon(aid).includes(featureId))) return true;

  // Premium incluye todos los extras cuando no está en trial
  if (audience === "player" && isPlayerPro(user) && !isInTrial(user)) return true;

  // Prueba gratuita 15 días: acceso de prueba a TODAS las funcionalidades individuales
  // (la persistencia a largo plazo sigue dependiendo del plan/contratación)
  if (isInTrial(user)) return true;

  if (!planId) return true;
  return planIncludesFeature(planId, audience, feature);
}

export function getFeatureLockReason(user, featureId) {
  const feature = FEATURES[featureId];
  if (!feature || hasFeatureAccess(user, featureId)) return null;
  if (isInTrial(user) && feature.trialLocked) return "trial";
  return "plan";
}

export function getFeatureUpsellPlan(user, featureId) {
  const audience = resolveUserAudience(user);
  const planId = user?.plan || getSubscriptionFromUser(user)?.plan;
  const feature = FEATURES[featureId];
  if (isInTrial(user) && feature?.addonId) {
    return null;
  }
  return upsellPlanForFeature(planId, audience, feature);
}

/** Activa la suscripción antes de fin de trial (cobro inmediato). */
export async function activateSubscriptionNow(user) {
  if (!user?.id) return { ok: false, error: "Usuario no válido" };
  try {
    const res = await fetch("/api/activate-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "No se pudo activar la suscripción" };
    }
    syncLocalSubscription(user.id, {
      plan: data.plan || user.plan,
      status: "active",
      trialEndsAt: null,
      stripeSubscriptionId: user.stripeSubscriptionId,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Error de red" };
  }
}

/** Compra un extra (upsell) vía Stripe Checkout. */
export async function purchaseAddon(user, addonId) {
  if (!user?.id) return { ok: false, error: "Usuario no válido" };
  try {
    const res = await fetch("/api/create-addon-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addonId,
        userId: user.id,
        email: user.email,
        origin: window.location.origin,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || "No se pudo iniciar el pago" };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Error de red" };
  }
}

export { FEATURES, lockedFeaturesForUser } from "./planFeatures";

function billingPeriodEnd(from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/**
 * Cancela la suscripción localmente y guarda metadata para Stripe futuro.
 * Cuando exista /api/cancel-subscription, se llamará antes del fallback local.
 */
export async function cancelSubscription(user) {
  if (!user?.id) return { ok: false, error: "Usuario no válido" };

  const cancelAt = billingPeriodEnd();
  const payload = {
    subscriptionStatus: "cancel_at_period_end",
    subscriptionCancelAt: cancelAt,
  };

  // Stripe: cancelar al final del periodo
  try {
    const res = await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      payload.subscriptionCancelAt = data.cancelAt || cancelAt;
      if (data.stripeSubscriptionId) payload.stripeSubscriptionId = data.stripeSubscriptionId;
    } else if (data.error && user.stripeSubscriptionId) {
      return { ok: false, error: data.error };
    }
  } catch { /* fallback local si no hay endpoint */ }

  try {
    const { error } = await supabase.auth.updateUser({ data: payload });
    if (error) return { ok: false, error: error.message };
  } catch (e) {
    return { ok: false, error: e.message || "Error al cancelar" };
  }

  saveLocalSubscription(user.id, {
    plan: user.plan,
    status: "cancel_at_period_end",
    cancelAt: payload.subscriptionCancelAt,
    cancelledAt: new Date().toISOString(),
    stripeSubscriptionId: user.stripeSubscriptionId || null,
  });

  return { ok: true, cancelAt: payload.subscriptionCancelAt };
}

export function formatSubscriptionDate(iso, locale = "es-ES") {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Abre el Customer Portal de Stripe (tarjeta, facturas, cancelación). */
export async function openBillingPortal(user) {
  if (!user?.id) return { ok: false, error: "Usuario no válido" };
  try {
    const res = await fetch("/api/create-billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, origin: window.location.origin }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || "No se pudo abrir el portal de facturación" };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Error de red" };
  }
}

export { getPlanLimits, getNextPlan };

/**
 * Resuelve el plan DEPRO (objeto de checkoutPlans) asociado a un usuario/club.
 * Prioridad: user.plan si es un id reconocido → club.plan (id o texto legacy) → null.
 * Devolver null significa "sin datos de plan" — los consumidores deben tratarlo
 * como ilimitado para no bloquear cuentas antiguas sin plan asignado.
 */
export function resolveCurrentPlan(user, club) {
  if (user?.plan && PLANS[user.plan]) return PLANS[user.plan];
  if (user?.role === "club") {
    return resolvePlanForClub(club?.plan, "club");
  }
  if (club?.plan) return resolvePlanForClub(club.plan, "club");
  return null;
}

/**
 * Cambia el plan del usuario. Si tiene una suscripción Stripe activa, la actualiza
 * (con prorrateo automático) vía /api/update-subscription. Si no (cuentas locales/demo
 * sin Stripe todavía), el cambio se guarda directamente en la metadata del usuario.
 */
export async function changePlan({ user, newPlanId }) {
  if (!user?.id || !newPlanId) return { ok: false, error: "Datos no válidos" };
  try {
    const res = await fetch("/api/update-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, email: user.email, newPlanId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "No se pudo cambiar el plan", remaining: data.remaining };
    }
    saveLocalSubscription(user.id, {
      plan: newPlanId,
      status: data.status || "active",
      stripeSubscriptionId: data.stripeSubscriptionId || user.stripeSubscriptionId || null,
    });
    return { ok: true, plan: newPlanId, status: data.status, mode: data.mode };
  } catch (e) {
    return { ok: false, error: e.message || "Error de red al cambiar el plan" };
  }
}

/** Plazas Premium restantes (máx. 40 jugadores). */
export async function fetchPremiumCapacity() {
  try {
    const res = await fetch("/api/premium-capacity");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, remaining: 0, available: false, error: data.error };
    return {
      ok: true,
      cap: data.cap,
      used: data.used,
      remaining: data.remaining,
      available: !!data.available,
    };
  } catch (e) {
    return { ok: false, remaining: 0, available: false, error: e.message };
  }
}
