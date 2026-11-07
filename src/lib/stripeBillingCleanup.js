/**
 * Reglas de limpieza de cobros Stripe al borrar o cancelar una cuenta.
 * Sin SDK: se testea en Node sin claves.
 */

export const CANCELABLE_SUB_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "paused",
  "incomplete",
];

const REFUND_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const ORPHAN_GRACE_MS = 30 * 60 * 1000;

export function isCancelableSubscription(sub) {
  if (!sub || typeof sub !== "object") return false;
  const status = String(sub.status || "").toLowerCase();
  if (status === "canceled" || status === "cancelled") return false;
  return CANCELABLE_SUB_STATUSES.includes(status);
}

/** True si Stripe puede generar un cobro futuro (no cuenta cancel_at_period_end). */
export function willStripeChargeAgain(sub) {
  if (!isCancelableSubscription(sub)) return false;
  if (sub.cancel_at_period_end) return false;
  return true;
}

export function isRefundableInvoice(inv, now = Date.now(), windowMs = REFUND_WINDOW_MS) {
  if (!inv || typeof inv !== "object") return false;
  if (String(inv.status || "").toLowerCase() !== "paid") return false;
  const paid = Number(inv.amount_paid) || 0;
  const already = Number(inv.amount_refunded) || 0;
  if (paid <= 0 || already >= paid) return false;
  const createdMs = Number(inv.created) ? Number(inv.created) * 1000 : 0;
  if (!createdMs) return false;
  return now - createdMs <= windowMs;
}

export function refundableAmountCents(inv) {
  const paid = Number(inv?.amount_paid) || 0;
  const already = Number(inv?.amount_refunded) || 0;
  return Math.max(0, paid - already);
}

export function paymentIntentId(inv) {
  const pi = inv?.payment_intent;
  if (!pi) return "";
  if (typeof pi === "string") return pi;
  return String(pi.id || "");
}

export function customerIdFrom(obj) {
  const c = obj?.customer;
  if (!c) return "";
  if (typeof c === "string") return c;
  return String(c.id || "");
}

export function summarizeBillingCleanup({
  canceled = [],
  voided = [],
  refunded = [],
  errors = [],
  detached = [],
  deletedCustomers = [],
} = {}) {
  const refundedCents = refunded.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  return {
    canceledCount: canceled.length,
    voidedCount: voided.length,
    refundedCount: refunded.length,
    detachedCount: detached.length,
    deletedCustomerCount: deletedCustomers.length,
    refundedCents,
    refundedEuros: (refundedCents / 100).toFixed(2).replace(".", ","),
    canceledIds: canceled.map((s) => s.id).filter(Boolean),
    errors,
  };
}

export function isStripeMissingError(message) {
  const m = String(message || "").toLowerCase();
  return /no such|resource_missing|has been deleted|invalid customer/.test(m);
}

export function stripeErrorsAreOnlyMissing(errors = []) {
  if (!errors.length) return true;
  return errors.every((e) => isStripeMissingError(e));
}

/**
 * No borrar Auth si Stripe sigue pudiendo cobrar, o si no hemos podido comprobarlo.
 */
export function shouldBlockUserDelete({
  stillActive,
  customerIds = [],
  canceledCount = 0,
  stripeErrors = [],
} = {}) {
  if (stillActive) {
    return {
      block: true,
      reason: "Stripe todavía tiene una suscripción activa. El usuario no se ha eliminado.",
    };
  }
  const hard = (stripeErrors || []).filter((e) => !isStripeMissingError(e));
  if (hard.length && canceledCount === 0 && !customerIds.length) {
    return {
      block: true,
      reason: hard[0] || "No se pudo verificar Stripe. El usuario no se ha eliminado para evitar cobros.",
    };
  }
  return { block: false };
}

/**
 * Factura real (no el 0 € del inicio de trial) sin usuario en la app → huérfana.
 * No cancela el alta reciente (`subscription_create`) para no romper el checkout.
 * El cobro al terminar el trial es `subscription_cycle`.
 */
export function shouldCancelOrphanInvoice(invoice, userFound, sub, now = Date.now()) {
  if (userFound) return false;
  const paid = Number(invoice?.amount_paid ?? invoice?.amount_due ?? 0);
  if (paid <= 0) return false;
  const reason = String(invoice?.billing_reason || "");
  if (reason === "subscription_create") return false;
  if (reason === "subscription_cycle") return true;
  if (sub && isTooNewToTreatAsOrphan(sub, now)) return false;
  return true;
}

export function isTooNewToTreatAsOrphan(sub, now = Date.now(), graceMs = ORPHAN_GRACE_MS) {
  const created = Number(sub?.created) ? Number(sub.created) * 1000 : 0;
  if (!created) return false;
  return now - created < graceMs;
}

export function subscriptionEmailHint(sub, customer) {
  return String(
    sub?.metadata?.email
    || customer?.email
    || sub?.customer_email
    || "",
  ).trim().toLowerCase();
}
