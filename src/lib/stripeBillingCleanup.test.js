import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isCancelableSubscription,
  willStripeChargeAgain,
  isRefundableInvoice,
  refundableAmountCents,
  summarizeBillingCleanup,
  shouldBlockUserDelete,
  shouldCancelOrphanInvoice,
  isTooNewToTreatAsOrphan,
  isStripeMissingError,
} from "./stripeBillingCleanup.js";

describe("stripeBillingCleanup", () => {
  it("cancela trial, activa y past_due; ignora already canceled", () => {
    assert.equal(isCancelableSubscription({ status: "trialing" }), true);
    assert.equal(isCancelableSubscription({ status: "active" }), true);
    assert.equal(isCancelableSubscription({ status: "past_due" }), true);
    assert.equal(isCancelableSubscription({ status: "canceled" }), false);
  });

  it("cancel_at_period_end no genera cobro futuro pero sí se puede anular al borrar", () => {
    const sub = { status: "active", cancel_at_period_end: true };
    assert.equal(isCancelableSubscription(sub), true);
    assert.equal(willStripeChargeAgain(sub), false);
    assert.equal(willStripeChargeAgain({ status: "trialing" }), true);
  });

  it("reembolsa una factura pagada de los últimos 14 días", () => {
    const now = Date.parse("2026-09-09T12:00:00.000Z");
    const inv = {
      status: "paid",
      amount_paid: 2000,
      amount_refunded: 0,
      created: Math.floor(Date.parse("2026-09-09T08:00:00.000Z") / 1000),
    };
    assert.equal(isRefundableInvoice(inv, now), true);
    assert.equal(refundableAmountCents(inv), 2000);
  });

  it("no reembolsa facturas antiguas ni ya devueltas", () => {
    const now = Date.parse("2026-09-09T12:00:00.000Z");
    const old = {
      status: "paid",
      amount_paid: 2000,
      amount_refunded: 0,
      created: Math.floor(Date.parse("2026-01-01T00:00:00.000Z") / 1000),
    };
    const done = {
      status: "paid",
      amount_paid: 2000,
      amount_refunded: 2000,
      created: Math.floor(now / 1000),
    };
    assert.equal(isRefundableInvoice(old, now), false);
    assert.equal(isRefundableInvoice(done, now), false);
  });

  it("resume reembolsos en euros para el admin", () => {
    const s = summarizeBillingCleanup({
      canceled: [{ id: "sub_1" }, { id: "sub_2" }],
      voided: ["in_open"],
      refunded: [{ amount: 2000 }],
      errors: [],
    });
    assert.equal(s.canceledCount, 2);
    assert.equal(s.refundedCents, 2000);
    assert.equal(s.refundedEuros, "20,00");
  });

  it("bloquea el borrado si Stripe sigue activo o no se ha podido comprobar", () => {
    assert.equal(shouldBlockUserDelete({ stillActive: true }).block, true);
    assert.equal(shouldBlockUserDelete({
      stillActive: false,
      stripeErrors: ["customers: timeout"],
      canceledCount: 0,
      customerIds: [],
    }).block, true);
    assert.equal(shouldBlockUserDelete({ stillActive: false, canceledCount: 2, customerIds: ["cus_1"] }).block, false);
    assert.equal(shouldBlockUserDelete({
      stillActive: false,
      stripeErrors: ["retrieve: No such subscription: sub_x"],
      canceledCount: 0,
      customerIds: [],
    }).block, false);
  });

  it("cancela la factura huérfana al terminar el trial, no el alta reciente", () => {
    const now = Date.parse("2026-09-09T12:00:00.000Z");
    const oldSub = { created: Math.floor(Date.parse("2026-08-20T00:00:00.000Z") / 1000) };
    const newSub = { created: Math.floor(now / 1000) - 60 };
    assert.equal(shouldCancelOrphanInvoice({ amount_paid: 0 }, false, oldSub, now), false);
    assert.equal(shouldCancelOrphanInvoice({
      amount_paid: 2000,
      billing_reason: "subscription_create",
    }, false, newSub, now), false);
    assert.equal(shouldCancelOrphanInvoice({
      amount_paid: 2000,
      billing_reason: "subscription_cycle",
    }, false, oldSub, now), true);
    assert.equal(shouldCancelOrphanInvoice({
      amount_paid: 2000,
      billing_reason: "subscription_cycle",
    }, true, oldSub, now), false);
    assert.equal(isTooNewToTreatAsOrphan(newSub, now), true);
    assert.equal(isTooNewToTreatAsOrphan(oldSub, now), false);
  });

  it("detecta errores de recurso inexistente en Stripe", () => {
    assert.equal(isStripeMissingError("No such customer: cus_x"), true);
    assert.equal(isStripeMissingError("timeout contacting Stripe"), false);
  });
});
