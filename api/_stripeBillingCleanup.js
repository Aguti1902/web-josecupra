/**
 * Cancela todas las suscripciones Stripe de un cliente (plan + extras)
 * y reembolsa facturas pagadas recientes. Usado al borrar un usuario.
 */
import {
  CANCELABLE_SUB_STATUSES,
  isCancelableSubscription,
  willStripeChargeAgain,
  isRefundableInvoice,
  refundableAmountCents,
  paymentIntentId,
  customerIdFrom,
  summarizeBillingCleanup,
  isTooNewToTreatAsOrphan,
  subscriptionEmailHint,
  isStripeMissingError,
} from "../src/lib/stripeBillingCleanup.js";


async function safe(label, fn, errors) {
  try {
    return await fn();
  } catch (err) {
    errors.push(`${label}: ${err?.message || err}`);
    return null;
  }
}

async function listAll(fn) {
  const out = [];
  let starting_after;
  for (let i = 0; i < 30; i++) {
    const page = await fn(starting_after);
    const data = page?.data || [];
    out.push(...data);
    if (!page?.has_more || !data.length) break;
    starting_after = data[data.length - 1].id;
  }
  return out;
}

export async function collectCustomerIds(stripe, { email, customerId, subscriptionId }, errors = []) {
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
      () => stripe.customers.list({ email: normalized, limit: 100 }),
      errors,
    );
    for (const c of listed?.data || []) {
      if (c?.id) ids.add(c.id);
    }
  }
  return [...ids];
}

async function listCancelableForCustomer(stripe, customerId, errors) {
  const found = [];
  const seen = new Set();
  for (const status of CANCELABLE_SUB_STATUSES) {
    const errBefore = errors.length;
    const rows = await safe(
      `list ${customerId} ${status}`,
      () => listAll((starting_after) => stripe.subscriptions.list({
        customer: customerId,
        status,
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
      })),
      errors,
    );
    if (errors.length > errBefore) {
      const last = errors[errors.length - 1];
      if (isStripeMissingError(last)) {
        errors.pop();
        return [];
      }
    }
    for (const sub of rows || []) {
      if (!isCancelableSubscription(sub) || seen.has(sub.id)) continue;
      seen.add(sub.id);
      found.push(sub);
    }
  }
  return found;
}

async function cancelCustomerSubscriptions(stripe, customerId, errors, { immediate = true } = {}) {
  const canceled = [];
  const subs = await listCancelableForCustomer(stripe, customerId, errors);
  for (const sub of subs) {
    const done = immediate
      ? await safe(
        `cancel ${sub.id}`,
        () => stripe.subscriptions.cancel(sub.id, { invoice_now: false, prorate: false }),
        errors,
      )
      : await safe(
        `period-end ${sub.id}`,
        () => stripe.subscriptions.update(sub.id, { cancel_at_period_end: true }),
        errors,
      );
    if (done?.id) canceled.push({ id: done.id, status: done.status || sub.status });
  }
  return canceled;
}

async function detachPaymentMethods(stripe, customerId, errors) {
  const detached = [];
  const page = await safe(
    `pms ${customerId}`,
    () => stripe.paymentMethods.list({ customer: customerId, type: "card", limit: 100 }),
    errors,
  );
  for (const pm of page?.data || []) {
    const done = await safe(`detach ${pm.id}`, () => stripe.paymentMethods.detach(pm.id), errors);
    if (done?.id) detached.push(done.id);
  }
  return detached;
}

async function deleteStripeCustomer(stripe, customerId, errors) {
  const done = await safe(`delete customer ${customerId}`, () => stripe.customers.del(customerId), errors);
  return done?.id || done?.deleted ? customerId : null;
}

async function voidOpenInvoices(stripe, customerId, errors) {
  const voided = [];
  for (const status of ["open", "draft"]) {
    const page = await safe(
      `${status} invoices ${customerId}`,
      () => stripe.invoices.list({ customer: customerId, status, limit: 50 }),
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

export async function hasActiveStripeBilling(stripe, { email, customerId, subscriptionId } = {}) {
  const errors = [];
  const customerIds = await collectCustomerIds(stripe, { email, customerId, subscriptionId }, errors);
  let sawHardError = errors.some((e) => !isStripeMissingError(e));
  let listedOk = false;

  for (const cid of customerIds) {
    const errBefore = errors.length;
    const subs = await listCancelableForCustomer(stripe, cid, errors);
    const newHard = errors.slice(errBefore).filter((e) => !isStripeMissingError(e));
    if (newHard.length) sawHardError = true;
    else listedOk = true;
    if (subs.some(willStripeChargeAgain)) return true;
  }

  if (subscriptionId) {
    const errBefore = errors.length;
    const sub = await safe("check leftover", () => stripe.subscriptions.retrieve(subscriptionId), errors);
    if (errors.length > errBefore && isStripeMissingError(errors[errors.length - 1])) {
      errors.pop();
      listedOk = true;
    } else if (errors.slice(errBefore).some((e) => !isStripeMissingError(e))) {
      sawHardError = true;
    } else {
      listedOk = true;
    }
    if (willStripeChargeAgain(sub)) return true;
  }

  if (!customerIds.length && !subscriptionId) {
    return false;
  }
  if (sawHardError && !listedOk) return true;
  return false;
}

/**
 * @returns {Promise<object>} resumen para el admin
 */
export async function purgeStripeBilling(stripe, {
  email,
  customerId,
  subscriptionId,
  refundRecent = true,
  detachPayments = true,
  deleteCustomer = true,
  immediate = true,
} = {}) {
  const errors = [];
  const customerIds = await collectCustomerIds(stripe, { email, customerId, subscriptionId }, errors);

  const canceled = [];
  const voided = [];
  const refunded = [];
  const detached = [];
  const deletedCustomers = [];

  for (const cid of customerIds) {
    canceled.push(...await cancelCustomerSubscriptions(stripe, cid, errors, { immediate }));
    voided.push(...await voidOpenInvoices(stripe, cid, errors));
    if (refundRecent) {
      refunded.push(...await refundRecentPaid(stripe, cid, errors));
    }
    if (detachPayments) {
      detached.push(...await detachPaymentMethods(stripe, cid, errors));
    }
    if (deleteCustomer && immediate) {
      const deleted = await deleteStripeCustomer(stripe, cid, errors);
      if (deleted) deletedCustomers.push(deleted);
    }
  }

  if (subscriptionId && !canceled.some((s) => s.id === subscriptionId)) {
    const extra = immediate
      ? await safe(
        `cancel leftover ${subscriptionId}`,
        () => stripe.subscriptions.cancel(subscriptionId, { invoice_now: false, prorate: false }),
        errors,
      )
      : await safe(
        `period-end leftover ${subscriptionId}`,
        () => stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true }),
        errors,
      );
    if (extra?.id) canceled.push({ id: extra.id, status: extra.status || "active" });
  }

  const stillActive = await hasActiveStripeBilling(stripe, { email, customerId, subscriptionId });

  return {
    ...summarizeBillingCleanup({
      canceled, voided, refunded, errors, detached, deletedCustomers,
    }),
    customerIds,
    stillActive,
    detached,
    deletedCustomers,
  };
}

/** Cancelación desde la app: todas las subs del customer (plan + extras). */
export async function cancelPlatformSubscriptions(stripe, {
  email,
  customerId,
  subscriptionId,
  immediate,
} = {}) {
  return purgeStripeBilling(stripe, {
    email,
    customerId,
    subscriptionId,
    refundRecent: false,
    detachPayments: false,
    deleteCustomer: false,
    immediate,
  });
}

/**
 * Si no hay usuario Auth para esta suscripción, se cancela ya (red de seguridad del webhook).
 * No se usa en checkout.session.completed (el usuario puede crearse milisegundos después).
 */
export async function cancelOrphanSubscription(stripe, supabaseAdmin, subscription, emailHint) {
  if (!subscription?.id || !isCancelableSubscription(subscription)) {
    return { canceled: false, reason: "not_cancelable" };
  }
  const customerId = customerIdFrom(subscription);
  let customer = null;
  if (customerId) {
    try { customer = await stripe.customers.retrieve(customerId); } catch { /* ignore */ }
  }
  const email = subscriptionEmailHint(subscription, customer) || String(emailHint || "").trim().toLowerCase();
  const { findUserByStripeCustomer } = await import("./_supabaseAdmin.js");
  const user = await findUserByStripeCustomer(supabaseAdmin, customerId, email);
  if (user) return { canceled: false, reason: "user_exists", userId: user.id };

  const billing = await purgeStripeBilling(stripe, {
    email,
    customerId,
    subscriptionId: subscription.id,
    refundRecent: true,
    detachPayments: true,
    deleteCustomer: true,
    immediate: true,
  });
  return {
    canceled: billing.canceledCount > 0 || billing.deletedCustomerCount > 0,
    subscriptionId: subscription.id,
    email,
    errors: billing.errors,
    billing,
  };
}

/** Recorre suscripciones Stripe y cancela las que no tienen usuario en Auth. */
export async function cancelOrphanSubscriptions(stripe, supabaseAdmin, { graceNew = true } = {}) {
  const canceled = [];
  const skipped = [];
  const errors = [];
  const seen = new Set();

  for (const status of CANCELABLE_SUB_STATUSES) {
    const rows = await safe(
      `scan ${status}`,
      () => listAll((starting_after) => stripe.subscriptions.list({
        status,
        limit: 100,
        expand: ["data.customer"],
        ...(starting_after ? { starting_after } : {}),
      })),
      errors,
    );
    for (const sub of rows || []) {
      if (!sub?.id || seen.has(sub.id) || !isCancelableSubscription(sub)) continue;
      seen.add(sub.id);
      if (graceNew && isTooNewToTreatAsOrphan(sub)) {
        skipped.push({ id: sub.id, reason: "too_new" });
        continue;
      }
      const result = await cancelOrphanSubscription(stripe, supabaseAdmin, sub, "");
      if (result.canceled) canceled.push({ id: sub.id, email: result.email });
      else if (result.reason === "user_exists") skipped.push({ id: sub.id, reason: "user_exists" });
      if (result.errors?.length) errors.push(...result.errors);
    }
  }

  return {
    scanned: seen.size,
    canceledCount: canceled.length,
    skippedCount: skipped.length,
    canceled,
    skipped,
    errors,
  };
}
