import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { summarizeReferrals, REFERRAL_COMMISSION_RATE } from "./_clubReferrals.js";
import { commissionCents } from "../src/lib/clubEconomy.js";

describe("club referrals", () => {
  it("resume usa la tasa del club", () => {
    const summary = summarizeReferrals({
      commissionRate: 0.15,
      referrals: [
        { commission: 1500, status: "active", month: "2099-01", payoutStatus: "pending" },
        { commission: 500, status: "active", month: "2099-01", payoutStatus: "paid" },
      ],
      payouts: [{ status: "paid", amount: 500 }],
    });
    assert.equal(summary.commissionRate, 0.15);
    assert.equal(summary.totalEarned, 2000);
    assert.equal(summary.pending, 1500);
    assert.equal(summary.activePlayers, 2);
  });

  it("cuenta altas de prueba gratuita en el código de club", () => {
    const summary = summarizeReferrals({
      referrals: [
        { commission: 0, status: "trialing", month: "2099-01", payoutStatus: "none" },
        { commission: 261, status: "active", month: "2099-01", payoutStatus: "pending" },
      ],
      payouts: [],
    });
    assert.equal(summary.trialPlayers, 1);
    assert.equal(summary.activePlayers, 1);
    assert.equal(summary.codeUsers, 2);
  });

  it("tasa por defecto 10%", () => {
    assert.equal(REFERRAL_COMMISSION_RATE, 0.1);
    assert.equal(commissionCents(10000, 10), 1000);
    assert.equal(commissionCents(10000, 25), 2500);
  });
});
