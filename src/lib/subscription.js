import { supabase } from "./supabase";

const STORAGE_PREFIX = "depro_subscription_";

export const PLAN_LABELS = {
  basic: "Plan Básico",
  premium: "Plan Premium",
};

export const PLAN_PRICES = {
  basic: "49€/mes",
  premium: "119€/mes",
};

export function getPlanLabel(plan) {
  if (!plan) return "Plan DEPRO";
  return PLAN_LABELS[String(plan).toLowerCase()] || plan;
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

/** Jugador individual con plan de pago (no usuario de club) */
export function isIndividualSubscriber(user) {
  if (!user || user.role !== "player") return false;
  if (user.team_role || user.role === "club") return false;
  const sub = getSubscriptionFromUser(user);
  return !!(sub?.plan || user.plan);
}

export function getSubscriptionFromUser(user) {
  if (!user?.id) return null;
  const local = loadLocalSubscription(user.id);
  const meta = user;
  const plan = meta.plan || local?.plan || null;
  if (!plan) return null;

  const status = meta.subscriptionStatus || local?.status || "active";
  return {
    plan,
    status,
    cancelAt: meta.subscriptionCancelAt || local?.cancelAt || null,
    stripeSubscriptionId: meta.stripeSubscriptionId || local?.stripeSubscriptionId || null,
  };
}

export function isSubscriptionActive(sub) {
  if (!sub) return false;
  if (sub.status === "active") return true;
  if (sub.status === "cancel_at_period_end" && sub.cancelAt) {
    return new Date(sub.cancelAt) > new Date();
  }
  return false;
}

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

  // TODO (Stripe): descomentar cuando exista el endpoint
  // try {
  //   const res = await fetch("/api/cancel-subscription", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ userId: user.id, email: user.email }),
  //   });
  //   const data = await res.json().catch(() => ({}));
  //   if (res.ok && data.ok) {
  //     payload.subscriptionCancelAt = data.cancelAt || cancelAt;
  //     if (data.stripeSubscriptionId) payload.stripeSubscriptionId = data.stripeSubscriptionId;
  //   } else if (data.error) {
  //     return { ok: false, error: data.error };
  //   }
  // } catch { /* fallback local */ }

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
