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

  it("quita altas sin pago al borrar al jugador", async () => {
    const { removePlayerFromReferralRegistry } = await import("./_clubReferrals.js");
    const store = { byClubId: {
      club_udv: {
        referrals: [
          { playerId: "u1", playerEmail: "remiro@test.com", amountPaid: 0, commission: 0 },
          { playerId: "u2", playerEmail: "keep@test.com", amountPaid: 2900, commission: 290 },
        ],
      },
    } };
    const admin = {
      from() {
        return {
          select() { return this; },
          eq() { return this; },
          maybeSingle: async () => ({ data: { data: store } }),
          upsert: async ({ data }) => { Object.assign(store, data); return { error: null }; },
        };
      },
    };
    await removePlayerFromReferralRegistry(admin, { userId: "u1", email: "remiro@test.com" });
    assert.equal(store.byClubId.club_udv.referrals.length, 1);
    assert.equal(store.byClubId.club_udv.referrals[0].playerId, "u2");
  });

  it("tasa por defecto 10%", () => {
    assert.equal(REFERRAL_COMMISSION_RATE, 0.1);
    assert.equal(commissionCents(10000, 10), 1000);
    assert.equal(commissionCents(10000, 25), 2500);
  });

  it("registra comisión = total pagado × % del club (plan + extras)", async () => {
    const { recordReferralPayment } = await import("./_clubReferrals.js");
    const registry = { byClubId: {} };
    const admin = {
      from() {
        let clubId = null;
        return {
          select() { return this; },
          eq(_col, val) { clubId = val; return this; },
          maybeSingle: async () => {
            if (clubId === "CLUB_REFERRAL_REGISTRY") return { data: { data: registry } };
            if (clubId === "club_udv") return { data: { data: { referralCommissionPct: 15 } } };
            return { data: null };
          },
          upsert: async ({ data }) => { Object.assign(registry, data); return { error: null }; },
        };
      },
    };
    const r90 = await recordReferralPayment(admin, {
      clubId: "club_udv",
      clubCode: "UDV2026",
      playerEmail: "a@test.com",
      amountPaidCents: 9000,
    });
    assert.equal(r90.entry.commission, 1350);
    assert.equal(r90.entry.commissionPct, 15);
    assert.equal(r90.entry.amountPaid, 9000);

    const r100 = await recordReferralPayment(admin, {
      clubId: "club_udv",
      clubCode: "UDV2026",
      playerEmail: "b@test.com",
      amountPaidCents: 10000,
    });
    assert.equal(r100.entry.commission, 1500);
    assert.equal(r100.entry.amountPaid, 10000);

    const withAddons = await recordReferralPayment(admin, {
      clubId: "club_udv",
      clubCode: "UDV2026",
      playerEmail: "c@test.com",
      amountPaidCents: 3900,
    });
    assert.equal(withAddons.entry.commission, 585);
  });

  it("si el asiento solo tiene el precio de catálogo, suma los extras del carrito", async () => {
    const { paidTotalForCommission, applyClubCommissionToReferral } = await import("./_clubReferrals.js");
    assert.equal(paidTotalForCommission(2610, ["addon-pdf", "addon-cargas"]), 3610);
    assert.equal(paidTotalForCommission(9000, ["addon-pdf"]), 9000);
    assert.equal(paidTotalForCommission(3900, ["addon-pdf"]), 3900);

    const rec = applyClubCommissionToReferral(
      { amountPaid: 2900, selectedAddons: ["addon-pdf"], commission: 290, commissionPct: 10 },
      { referralCommissionPct: 15 },
    );
    assert.equal(rec.amountPaid, 3400);
    assert.equal(rec.commission, 510);
    assert.equal(rec.commissionPct, 15);
  });

  it("recalcula asientos guardados al cambiar el % del club", async () => {
    const { syncClubReferralCommissions } = await import("./_clubReferrals.js");
    const registry = {
      byClubId: {
        club_udv: {
          commissionRate: 0.1,
          referrals: [
            { amountPaid: 10000, commission: 1000, commissionPct: 10, selectedAddons: [] },
            { amountPaid: 2900, commission: 290, commissionPct: 10, selectedAddons: ["addon-pdf"] },
          ],
        },
      },
    };
    const admin = {
      from() {
        let clubId = null;
        return {
          select() { return this; },
          eq(_col, val) { clubId = val; return this; },
          maybeSingle: async () => {
            if (clubId === "CLUB_REFERRAL_REGISTRY") return { data: { data: registry } };
            if (clubId === "club_udv") return { data: { data: { referralCommissionPct: 20 } } };
            return { data: null };
          },
          upsert: async ({ data }) => { Object.assign(registry, data); return { error: null }; },
        };
      },
    };
    const result = await syncClubReferralCommissions(admin, "club_udv");
    assert.equal(result.changed, 2);
    assert.equal(registry.byClubId.club_udv.referrals[0].commission, 2000);
    assert.equal(registry.byClubId.club_udv.referrals[1].amountPaid, 3400);
    assert.equal(registry.byClubId.club_udv.referrals[1].commission, 680);
  });
});
