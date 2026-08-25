/** Acceso al panel justo después de un checkout Stripe. */

export const POST_PAYMENT_FLAG = "depro_payment_just_completed";

const PAID_STATUSES = new Set([
  "trialing",
  "active",
  "cancel_at_period_end",
]);

export function markPaymentCompleted() {
  try { sessionStorage.setItem(POST_PAYMENT_FLAG, "1"); } catch { /* ignore */ }
}

export function isPaymentJustCompleted() {
  try { return sessionStorage.getItem(POST_PAYMENT_FLAG) === "1"; } catch { return false; }
}

export function hasPaidAccess(user) {
  if (!user) return false;
  const status = String(user.subscriptionStatus || "").toLowerCase();
  if (PAID_STATUSES.has(status)) return true;
  if (user.stripeSubscriptionId) return true;
  if (user.billingSource === "stripe") return true;
  return false;
}

/**
 * ¿Hay que echar al usuario a /comprar?
 * Tras pagar no: ni si el JWT aún trae pendingPayment, ni si Stripe ya dejó rastro de alta.
 */
export function shouldBlockDashboardForUnpaid(user) {
  if (!user || user.impersonating) return false;
  if (isPaymentJustCompleted()) return false;
  if (user.pendingPayment !== true) return false;
  if (hasPaidAccess(user)) return false;
  return true;
}

export function panelPathForUser(user) {
  if (user?.impersonating) return "/dashboard";
  if (user?.role === "admin" || String(user?.email || "").toLowerCase() === "jose@depro.es") {
    return "/admin";
  }
  return "/dashboard";
}

/** Solo rutas internas. Evita open-redirect. */
export function safeNextPath(raw, fallback = "/dashboard") {
  if (typeof raw !== "string") return fallback;
  const next = raw.trim();
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/login")) return fallback;
  return next;
}

export function loginPathToPanel() {
  return "/login?next=/dashboard";
}

export function withPaymentActivated(meta = {}) {
  return { ...meta, pendingPayment: false };
}

/** Contraseña con la que el front puede hacer sign-in tras el checkout. */
export function loginPasswordFromCheckout({ created, tempPassword, generatedPassword }) {
  if (typeof tempPassword === "string" && tempPassword.length >= 8) return tempPassword;
  if (created) return generatedPassword || null;
  return null;
}

export function authUpdateAfterCheckout({
  prevMeta = {},
  userMeta = {},
  purchasedAddons,
  tempPassword,
} = {}) {
  const payload = {
    user_metadata: withPaymentActivated({
      ...prevMeta,
      ...userMeta,
      ...(purchasedAddons ? { purchasedAddons } : {}),
    }),
  };
  if (typeof tempPassword === "string" && tempPassword.length >= 8) {
    payload.password = tempPassword;
  }
  return payload;
}
