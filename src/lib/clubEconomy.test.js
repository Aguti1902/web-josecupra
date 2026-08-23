import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clubDiscountCode,
  clubCommissionPct,
  clubCommissionRate,
  commissionCents,
  clubMatchesDiscountCode,
  withSyncedDiscountCode,
  parseCommissionPct,
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
