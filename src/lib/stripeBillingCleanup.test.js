import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isCancelableSubscription,
  isRefundableInvoice,
  refundableAmountCents,
  summarizeBillingCleanup,
} from "./stripeBillingCleanup.js";

describe("stripeBillingCleanup", () => {
  it("cancela trial, activa y past_due; ignora already canceled", () => {
    assert.equal(isCancelableSubscription({ status: "trialing" }), true);
    assert.equal(isCancelableSubscription({ status: "active" }), true);
    assert.equal(isCancelableSubscription({ status: "past_due" }), true);
    assert.equal(isCancelableSubscription({ status: "canceled" }), false);
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
});
