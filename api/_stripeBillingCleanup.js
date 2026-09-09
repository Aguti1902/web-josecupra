/**
 * Cancela todas las suscripciones Stripe de un cliente (plan + extras)
 * y reembolsa facturas pagadas recientes. Usado al borrar un usuario.
 */
import {
  CANCELABLE_SUB_STATUSES,
  isCancelableSubscription,
  isRefundableInvoice,
  refundableAmountCents,
  paymentIntentId,
  customerIdFrom,
  summarizeBillingCleanup,
} from "../src/lib/stripeBillingCleanup.js";

async function safe(label, fn, errors) {
  try {
    return await fn();
  } catch (err) {
    errors.push(`${label}: ${err?.message || err}`);
    return null;
  }
}

async function collectCustomerIds(stripe, { email, customerId, subscriptionId }, errors) {
  const ids = new Set();
  if (customerId) ids.add(String(customerId));

  if (subscriptionId) {
    const sub = await safe(`retrieve ${subscriptionId}`, () => stripe.subscriptions.retrieve(subscriptionId), errors);
    const cid = customerIdFrom(sub);
    if (cid) ids.add(cid);
  }

  const normalized = String(email || "").trim().toLowerCase();
  if (normalized) {
    const listed = await safe(
      `customers ${normalized}`,
      () => stripe.customers.list({ email: normalized, limit: 20 }),
      errors,
    );
    for (const c of listed?.data || []) {
      if (c?.id) ids.add(c.id);
    }
  }
  return [...ids];
}

async function cancelCustomerSubscriptions(stripe, customerId, errors) {
  const canceled = [];
  for (const status of CANCELABLE_SUB_STATUSES) {
    const page = await safe(
      `list ${customerId} ${status}`,
      () => stripe.subscriptions.list({ customer: customerId, status, limit: 100 }),
      errors,
    );
    for (const sub of page?.data || []) {
      if (!isCancelableSubscription(sub)) continue;
      const done = await safe(
        `cancel ${sub.id}`,
        () => stripe.subscriptions.cancel(sub.id, { invoice_now: false, prorate: false }),
        errors,
      );
      if (done?.id) canceled.push({ id: done.id, status: sub.status });
    }
  }
  return canceled;
}

async function voidOpenInvoices(stripe, customerId, errors) {
  const voided = [];
  const page = await safe(
    `open invoices ${customerId}`,
    () => stripe.invoices.list({ customer: customerId, status: "open", limit: 50 }),
    errors,
  );
  for (const inv of page?.data || []) {
    const done = await safe(
      `void ${inv.id}`,
      () => stripe.invoices.voidInvoice(inv.id),
      errors,
    );
    if (done?.id) voided.push(done.id);
  }
  return voided;
}

async function refundRecentPaid(stripe, customerId, errors, now = Date.now()) {
  const refunded = [];
  const page = await safe(
    `paid invoices ${customerId}`,
    () => stripe.invoices.list({ customer: customerId, status: "paid", limit: 20 }),
    errors,
  );
  for (const inv of page?.data || []) {
    if (!isRefundableInvoice(inv, now)) continue;
    const amount = refundableAmountCents(inv);
    const pi = paymentIntentId(inv);
    if (!amount || !pi) continue;
    const refund = await safe(
      `refund ${inv.id}`,
      () => stripe.refunds.create({
        payment_intent: pi,
        amount,
        reason: "requested_by_customer",
      }),
      errors,
    );
    if (refund?.id) {
      refunded.push({ invoiceId: inv.id, amount, refundId: refund.id });
    }
  }
  return refunded;
}

/**
 * @returns {Promise<object>} resumen para el admin
 */
export async function purgeStripeBilling(stripe, {
  email,
  customerId,
  subscriptionId,
  refundRecent = true,
} = {}) {
  const errors = [];
  const customerIds = await collectCustomerIds(stripe, { email, customerId, subscriptionId }, errors);

  const canceled = [];
  const voided = [];
  const refunded = [];

  for (const cid of customerIds) {
    canceled.push(...await cancelCustomerSubscriptions(stripe, cid, errors));
    voided.push(...await voidOpenInvoices(stripe, cid, errors));
    if (refundRecent) {
      refunded.push(...await refundRecentPaid(stripe, cid, errors));
    }
  }

  if (subscriptionId && !canceled.some((s) => s.id === subscriptionId)) {
    const extra = await safe(
      `cancel leftover ${subscriptionId}`,
      () => stripe.subscriptions.cancel(subscriptionId, { invoice_now: false, prorate: false }),
      errors,
    );
    if (extra?.id) canceled.push({ id: extra.id, status: extra.status });
  }

  return {
    ...summarizeBillingCleanup({ canceled, voided, refunded, errors }),
    customerIds,
  };
}
