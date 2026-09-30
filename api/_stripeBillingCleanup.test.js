import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { purgeStripeBilling, cancelPlatformSubscriptions } from "./_stripeBillingCleanup.js";

function mockStripe({
  customers = [],
  subscriptions = [],
  openInvoices = [],
  paidInvoices = [],
  paymentMethods = [],
} = {}) {
  const canceled = [];
  const voided = [];
  const refundCalls = [];
  const detached = [];
  const deletedCustomers = [];
  const periodEnd = [];
  const store = { subscriptions: subscriptions.map((s) => ({ ...s })) };

  return {
    canceled,
    voided,
    refundCalls,
    detached,
    deletedCustomers,
    periodEnd,
    customers: {
      async list({ email }) {
        return { data: customers.filter((c) => c.email === email), has_more: false };
      },
      async retrieve(id) {
        const c = customers.find((row) => row.id === id);
        if (!c) throw new Error(`No such customer: ${id}`);
        return c;
      },
      async del(id) {
        deletedCustomers.push(id);
        return { id, deleted: true };
      },
    },
    subscriptions: {
      async retrieve(id) {
        const sub = store.subscriptions.find((s) => s.id === id);
        if (!sub) throw new Error(`No such subscription: ${id}`);
        return sub;
      },
      async list({ customer, status }) {
        return {
          data: store.subscriptions.filter((s) => (
            (!customer || s.customer === customer) && s.status === status
          )),
          has_more: false,
        };
      },
      async cancel(id) {
        canceled.push(id);
        const sub = store.subscriptions.find((s) => s.id === id);
        if (sub) sub.status = "canceled";
        return { id, status: "canceled" };
      },
      async update(id, patch) {
        periodEnd.push(id);
        const sub = store.subscriptions.find((s) => s.id === id);
        if (sub) Object.assign(sub, patch);
        return { id, status: sub?.status || "active", ...patch };
      },
    },
    invoices: {
      async list({ customer, status }) {
        const src = status === "paid" ? paidInvoices : status === "draft" ? [] : openInvoices;
        return { data: src.filter((i) => i.customer === customer), has_more: false };
      },
      async voidInvoice(id) {
        voided.push(id);
        return { id };
      },
    },
    refunds: {
      async create({ payment_intent, amount }) {
        const id = `re_${refundCalls.length + 1}`;
        refundCalls.push({ payment_intent, amount, id });
        return { id };
      },
    },
    paymentMethods: {
      async list({ customer }) {
        return {
          data: paymentMethods.filter((pm) => pm.customer === customer),
          has_more: false,
        };
      },
      async detach(id) {
        detached.push(id);
        return { id };
      },
    },
  };
}

describe("purgeStripeBilling", () => {
  it("cancela plan y extras del mismo cliente, reembolsa, desvincula y borra el customer", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const stripe = mockStripe({
      customers: [{ id: "cus_1", email: "prueba@depro.es" }],
      subscriptions: [
        { id: "sub_plan", customer: "cus_1", status: "active" },
        { id: "sub_addon", customer: "cus_1", status: "trialing" },
      ],
      openInvoices: [{ id: "in_open", customer: "cus_1", status: "open" }],
      paidInvoices: [{
        id: "in_paid",
        customer: "cus_1",
        status: "paid",
        amount_paid: 2000,
        amount_refunded: 0,
        created: nowSec,
        payment_intent: "pi_20e",
      }],
      paymentMethods: [{ id: "pm_1", customer: "cus_1" }],
    });

    const out = await purgeStripeBilling(stripe, { email: "prueba@depro.es", refundRecent: true });
    assert.equal(out.canceledCount, 2);
    assert.equal(out.voidedCount, 1);
    assert.equal(out.refundedCents, 2000);
    assert.equal(out.stillActive, false);
    assert.deepEqual(stripe.canceled.sort(), ["sub_addon", "sub_plan"]);
    assert.equal(stripe.refundCalls[0]?.amount, 2000);
    assert.deepEqual(stripe.detached, ["pm_1"]);
    assert.deepEqual(stripe.deletedCustomers, ["cus_1"]);
  });

  it("sigue funcionando si el usuario de Auth ya no existe (solo email)", async () => {
    const stripe = mockStripe({
      customers: [{ id: "cus_x", email: "gone@depro.es" }],
      subscriptions: [{ id: "sub_x", customer: "cus_x", status: "active" }],
    });
    const out = await purgeStripeBilling(stripe, { email: "gone@depro.es" });
    assert.equal(out.canceledCount, 1);
    assert.equal(out.customerIds[0], "cus_x");
    assert.equal(out.stillActive, false);
  });

  it("la cancelación desde la app no borra el customer ni el payment method", async () => {
    const stripe = mockStripe({
      customers: [{ id: "cus_1", email: "vivo@depro.es" }],
      subscriptions: [
        { id: "sub_plan", customer: "cus_1", status: "trialing" },
        { id: "sub_addon", customer: "cus_1", status: "active" },
      ],
      paymentMethods: [{ id: "pm_keep", customer: "cus_1" }],
    });
    const out = await cancelPlatformSubscriptions(stripe, {
      email: "vivo@depro.es",
      immediate: true,
    });
    assert.equal(out.canceledCount, 2);
    assert.equal(stripe.deletedCustomers.length, 0);
    assert.equal(stripe.detached.length, 0);
    assert.equal(out.stillActive, false);
  });

  it("en periodo pagado programa cancel_at_period_end de todas las subs", async () => {
    const stripe = mockStripe({
      customers: [{ id: "cus_1", email: "pagado@depro.es" }],
      subscriptions: [
        { id: "sub_plan", customer: "cus_1", status: "active" },
        { id: "sub_addon", customer: "cus_1", status: "active" },
      ],
    });
    const out = await cancelPlatformSubscriptions(stripe, {
      email: "pagado@depro.es",
      immediate: false,
    });
    assert.equal(out.canceledCount, 2);
    assert.deepEqual(stripe.periodEnd.sort(), ["sub_addon", "sub_plan"]);
    assert.equal(stripe.canceled.length, 0);
    assert.equal(out.stillActive, false);
  });
});
