import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { purgeStripeBilling } from "./_stripeBillingCleanup.js";

function mockStripe({
  customers = [],
  subscriptions = [],
  openInvoices = [],
  paidInvoices = [],
} = {}) {
  const canceled = [];
  const voided = [];
  const refundCalls = [];
  return {
    canceled,
    voided,
    refundCalls,
    customers: {
      async list({ email }) {
        return { data: customers.filter((c) => c.email === email) };
      },
    },
    subscriptions: {
      async retrieve(id) {
        const sub = subscriptions.find((s) => s.id === id);
        if (!sub) throw new Error("no sub");
        return sub;
      },
      async list({ customer, status }) {
        return {
          data: subscriptions.filter((s) => s.customer === customer && s.status === status),
        };
      },
      async cancel(id) {
        canceled.push(id);
        return { id, status: "canceled" };
      },
    },
    invoices: {
      async list({ customer, status }) {
        const src = status === "open" ? openInvoices : paidInvoices;
        return { data: src.filter((i) => i.customer === customer) };
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
  };
}

describe("purgeStripeBilling", () => {
  it("cancela plan y extras del mismo cliente y reembolsa 20€ recientes", async () => {
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
    });

    const out = await purgeStripeBilling(stripe, { email: "prueba@depro.es", refundRecent: true });
    assert.equal(out.canceledCount, 2);
    assert.equal(out.voidedCount, 1);
    assert.equal(out.refundedCents, 2000);
    assert.deepEqual(stripe.canceled.sort(), ["sub_addon", "sub_plan"]);
    assert.equal(stripe.refundCalls[0]?.amount, 2000);
  });

  it("sigue funcionando si el usuario de Auth ya no existe (solo email)", async () => {
    const stripe = mockStripe({
      customers: [{ id: "cus_x", email: "gone@depro.es" }],
      subscriptions: [{ id: "sub_x", customer: "cus_x", status: "active" }],
    });
    const out = await purgeStripeBilling(stripe, { email: "gone@depro.es" });
    assert.equal(out.canceledCount, 1);
    assert.equal(out.customerIds[0], "cus_x");
  });
});
