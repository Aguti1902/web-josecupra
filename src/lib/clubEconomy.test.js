import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clubDiscountCode,
  clubCommissionPct,
  clubCommissionRate,
  commissionCents,
  clubCommissionOnTotal,
  stripePaidCents,
  clubMatchesDiscountCode,
  withSyncedDiscountCode,
  parseCommissionPct,
  formatCommissionPreview,
  looksLikeCatalogPlanAmount,
} from "./clubEconomy.js";

describe("clubEconomy", () => {
  it("usa discountCode y cae a loginCode", () => {
    assert.equal(clubDiscountCode({ discountCode: "abc10" }), "ABC10");
    assert.equal(clubDiscountCode({ loginCode: "cdf2026" }), "CDF2026");
    assert.equal(clubDiscountCode({ login_code: "x1" }), "X1");
  });

  it("comisión por club, no un fijo global", () => {
    assert.equal(clubCommissionPct({}), 10);
    assert.equal(clubCommissionPct({ referralCommissionPct: "15" }), 15);
    assert.equal(clubCommissionPct({ referralCommissionPct: 7.5 }), 7.5);
    assert.equal(clubCommissionRate({ referralCommissionPct: 20 }), 0.2);
    assert.equal(parseCommissionPct(-4), 0);
    assert.equal(parseCommissionPct(140), 100);
  });

  it("calcula céntimos de comisión", () => {
    assert.equal(commissionCents(1999, 10), 200);
    assert.equal(commissionCents(10000, 15), 1500);
  });

  it("comisión sobre el total final, no un 10% fijo del catálogo", () => {
    assert.equal(clubCommissionOnTotal(10000, { referralCommissionPct: 10 }), 1000);
    assert.equal(clubCommissionOnTotal(9000, { referralCommissionPct: 10 }), 900);
    assert.equal(clubCommissionOnTotal(10000, { referralCommissionPct: 25 }), 2500);
    assert.equal(clubCommissionOnTotal(3900, { referralCommissionPct: 15 }), 585);
  });

  it("preview 100 € y 90 € con el % del club", () => {
    assert.equal(formatCommissionPreview(100, 10), 10);
    assert.equal(formatCommissionPreview(90, 10), 9);
    assert.equal(formatCommissionPreview(100, 15), 15);
    assert.equal(formatCommissionPreview(90, 15), 13.5);
  });

  it("detecta importe de catálogo (sin extras del carrito)", () => {
    assert.equal(looksLikeCatalogPlanAmount(2900), true);
    assert.equal(looksLikeCatalogPlanAmount(2610), true);
    assert.equal(looksLikeCatalogPlanAmount(3900), false);
    assert.equal(looksLikeCatalogPlanAmount(10000), false);
  });

  it("lee el importe cobrado de Stripe (total / amount_paid / líneas)", () => {
    assert.equal(stripePaidCents({ amount_total: 9000 }), 9000);
    assert.equal(stripePaidCents({ amount_paid: 0, total: 10900 }), 10900);
    assert.equal(stripePaidCents({
      lines: { data: [{ amount: 2610 }, { amount: 500 }, { amount: 500 }] },
    }), 3610);
    assert.equal(stripePaidCents({
      line_items: { data: [{ amount_total: 2610 }, { amount_total: 500 }] },
    }), 3110);
    assert.equal(stripePaidCents({ amount_total: 0, payment_status: "no_payment_required", lines: { data: [{ amount: 2610 }] } }), 0);
    assert.equal(stripePaidCents({}), 0);
  });

  it("el código de descuento coincide con login o discount", () => {
    const club = { loginCode: "ABC2026", discountCode: "PROMOABC" };
    assert.equal(clubMatchesDiscountCode(club, "promoabc"), true);
    assert.equal(clubMatchesDiscountCode(club, "abc2026"), true);
    assert.equal(clubMatchesDiscountCode(club, "otro"), false);
  });

  it("sincroniza loginCode y discountCode al editar", () => {
    const next = withSyncedDiscountCode({ loginCode: "OLD" }, "nuevo1");
    assert.equal(next.discountCode, "NUEVO1");
    assert.equal(next.loginCode, "NUEVO1");
    assert.equal(next.login_code, "NUEVO1");
  });
});
