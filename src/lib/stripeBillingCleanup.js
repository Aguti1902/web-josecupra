/**
 * Reglas de limpieza de cobros Stripe al borrar una cuenta.
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

export function isCancelableSubscription(sub) {
  if (!sub || typeof sub !== "object") return false;
  const status = String(sub.status || "").toLowerCase();
  if (status === "canceled" || status === "cancelled") return false;
  return CANCELABLE_SUB_STATUSES.includes(status);
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
} = {}) {
  const refundedCents = refunded.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  return {
    canceledCount: canceled.length,
    voidedCount: voided.length,
    refundedCount: refunded.length,
    refundedCents,
    refundedEuros: (refundedCents / 100).toFixed(2).replace(".", ","),
    canceledIds: canceled.map((s) => s.id).filter(Boolean),
    errors,
  };
}
