import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  summarizeReferrals,
  upsertReferralInBucket,
  referralPlayerStatus,
  REFERRAL_COMMISSION_RATE,
} from "./_clubReferrals.js";
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

  it("tasa por defecto 10%", () => {
    assert.equal(REFERRAL_COMMISSION_RATE, 0.1);
    assert.equal(commissionCents(10000, 10), 1000);
    assert.equal(commissionCents(10000, 25), 2500);
  });

  it("registra periodo gratuito (0 €) y lo cuenta en el código", () => {
    const bucket = { referrals: [] };
    const trial = upsertReferralInBucket(bucket, {
      clubCode: "UDCEDILACAN2026",
      playerEmail: "trial@test.com",
      playerName: "Jugador trial",
      playerId: "u-trial",
      plan: "player-essential",
      amountPaidCents: 0,
      stripeSessionId: "cs_trial",
    }, 10);
    assert.equal(trial.ok, true);
    assert.equal(trial.entry.status, "trialing");
    assert.equal(trial.entry.commission, 0);
    const summary = summarizeReferrals(bucket);
    assert.equal(summary.codeUsers, 1);
    assert.equal(summary.trialPlayers, 1);
    assert.equal(summary.activePlayers, 0);
    assert.equal(referralPlayerStatus(trial.entry), "trialing");
  });

  it("al cobrar después del trial, actualiza el mismo jugador a activo", () => {
    const bucket = { referrals: [] };
    upsertReferralInBucket(bucket, {
      playerEmail: "ana@test.com",
      playerId: "u-ana",
      amountPaidCents: 0,
      stripeSessionId: "cs_1",
    }, 10);
    const paid = upsertReferralInBucket(bucket, {
      playerEmail: "ana@test.com",
      playerId: "u-ana",
      amountPaidCents: 10000,
      stripeInvoiceId: "in_1",
    }, 10);
    assert.equal(paid.upgraded, true);
    assert.equal(bucket.referrals.length, 1);
    assert.equal(bucket.referrals[0].status, "active");
    assert.equal(bucket.referrals[0].commission, 1000);
    const summary = summarizeReferrals(bucket);
    assert.equal(summary.codeUsers, 1);
    assert.equal(summary.trialPlayers, 0);
    assert.equal(summary.activePlayers, 1);
  });
});
