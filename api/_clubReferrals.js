import {
  clubCommissionRate,
  clubCommissionPct,
  clubDiscountCode,
  commissionCents,
  DEFAULT_CLUB_COMMISSION_PCT,
} from "../src/lib/clubEconomy.js";

const REGISTRY_ID = "CLUB_REFERRAL_REGISTRY";
export const REFERRAL_COMMISSION_RATE = DEFAULT_CLUB_COMMISSION_PCT / 100;

export async function loadClubEconomy(admin, clubId) {
  if (!clubId) return {};
  const { data } = await admin.from("clubs_detail").select("data").eq("club_id", clubId).maybeSingle();
  return data?.data || {};
}

export async function loadReferralRegistry(admin) {
  const { data } = await admin.from("clubs_detail").select("data").eq("club_id", REGISTRY_ID).maybeSingle();
  return data?.data || { byClubId: {} };
}

export async function saveReferralRegistry(admin, registry) {
  await admin.from("clubs_detail").upsert(
    { club_id: REGISTRY_ID, data: registry, updated_at: new Date().toISOString() },
    { onConflict: "club_id" },
  );
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function ensureClubBucket(registry, clubId) {
  if (!registry.byClubId[clubId]) {
    registry.byClubId[clubId] = {
      commissionRate: REFERRAL_COMMISSION_RATE,
      referrals: [],
      payouts: [],
    };
  }
  return registry.byClubId[clubId];
}

export function summarizeReferrals(clubData) {
  const referrals = clubData?.referrals || [];
  const payouts = clubData?.payouts || [];
  const totalEarned = referrals.reduce((sum, r) => sum + (r.commission || 0), 0);
  const totalPaid = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pending = Math.max(0, totalEarned - totalPaid);
  const trialPlayers = referrals.filter((r) => referralPlayerStatus(r) === "trialing").length;
  const activePlayers = referrals.filter((r) => referralPlayerStatus(r) === "active").length;
  const thisMonth = monthKey();
  const monthPending = referrals
    .filter((r) => r.month === thisMonth && r.payoutStatus !== "paid")
    .reduce((sum, r) => sum + (r.commission || 0), 0);

  return {
    commissionRate: clubData?.commissionRate ?? REFERRAL_COMMISSION_RATE,
    totalEarned,
    totalPaid,
    pending,
    monthPending,
    activePlayers,
    trialPlayers,
    codeUsers: referrals.length,
    referralCount: referrals.length,
    referrals: referrals.slice().reverse(),
    payouts: payouts.slice().reverse(),
  };
}

export function referralPlayerStatus(entry) {
  if (!entry) return "active";
  if (entry.status === "trialing") return "trialing";
  if (entry.status === "active") return "active";
  if ((Number(entry.amountPaid) || 0) <= 0) return "trialing";
  return entry.status || "active";
}

function samePlayer(entry, playerId, playerEmail) {
  if (playerId && entry.playerId && entry.playerId === playerId) return true;
  const a = String(entry.playerEmail || "").trim().toLowerCase();
  const b = String(playerEmail || "").trim().toLowerCase();
  return Boolean(a && b && a === b);
}

/** Añade o actualiza un referido en el bucket (incluye periodo gratuito). */
export function upsertReferralInBucket(bucket, payload, commissionPct) {
  const amountPaidCents = Math.max(0, Number(payload.amountPaidCents) || 0);
  const isTrial = amountPaidCents <= 0;
  const commission = isTrial ? 0 : commissionCents(amountPaidCents, commissionPct);
  const dedupeKey = payload.stripeInvoiceId || payload.stripeSessionId;
  if (dedupeKey && (bucket.referrals || []).some((r) => r.stripeInvoiceId === dedupeKey || r.stripeSessionId === dedupeKey)) {
    return { ok: true, duplicate: true };
  }

  const existing = (bucket.referrals || []).find((r) => samePlayer(r, payload.playerId, payload.playerEmail));
  if (existing && isTrial) {
    return { ok: true, duplicate: true, entry: existing };
  }
  if (existing && !isTrial && referralPlayerStatus(existing) === "trialing") {
    existing.amountPaid = amountPaidCents;
    existing.commission = commission;
    existing.status = "active";
    existing.payoutStatus = "pending";
    existing.plan = payload.plan || existing.plan;
    existing.stripeInvoiceId = payload.stripeInvoiceId || existing.stripeInvoiceId;
    existing.stripeSessionId = payload.stripeSessionId || existing.stripeSessionId;
    existing.convertedAt = new Date().toISOString();
    return { ok: true, upgraded: true, entry: existing };
  }

  const entry = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubCode: payload.clubCode || "",
    playerEmail: payload.playerEmail || "",
    playerName: payload.playerName || payload.playerEmail?.split("@")[0] || "Jugador",
    playerId: payload.playerId || "",
    plan: payload.plan || "",
    amountPaid: amountPaidCents,
    commission,
    month: monthKey(),
    payoutStatus: isTrial ? "none" : "pending",
    status: isTrial ? "trialing" : "active",
    stripeInvoiceId: payload.stripeInvoiceId || null,
    stripeSessionId: payload.stripeSessionId || null,
    createdAt: new Date().toISOString(),
  };

  bucket.referrals = bucket.referrals || [];
  bucket.referrals.push(entry);
  return { ok: true, entry };
}

export async function recordReferralPayment(admin, {
  clubId,
  clubCode,
  playerEmail,
  playerName,
  playerId,
  plan,
  amountPaidCents,
  stripeInvoiceId,
  stripeSessionId,
}) {
  if (!clubId) return { ok: false, reason: "invalid_input" };

  const registry = await loadReferralRegistry(admin);
  const club = await loadClubEconomy(admin, clubId);
  const bucket = ensureClubBucket(registry, clubId);
  const rate = clubCommissionRate(club);
  bucket.commissionRate = rate;
  const result = upsertReferralInBucket(bucket, {
    clubCode,
    playerEmail,
    playerName,
    playerId,
    plan,
    amountPaidCents,
    stripeInvoiceId,
    stripeSessionId,
  }, clubCommissionPct(club));

  if (result.duplicate) return result;
  await saveReferralRegistry(admin, registry);
  return result;
}

export async function markReferralPayout(admin, clubId, { amount, month, note, iban, markPaid = true }) {
  const registry = await loadReferralRegistry(admin);
  const bucket = ensureClubBucket(registry, clubId);
  const payoutAmount = Math.round(Number(amount) || 0);
  if (payoutAmount <= 0) return { ok: false, reason: "invalid_amount" };

  const payout = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    month: month || monthKey(),
    amount: payoutAmount,
    note: note || "",
    iban: iban || "",
    status: markPaid ? "paid" : "pending",
    createdAt: new Date().toISOString(),
    paidAt: markPaid ? new Date().toISOString() : null,
  };

  bucket.payouts.push(payout);

  if (markPaid) {
    let remaining = payoutAmount;
    bucket.referrals.forEach((r) => {
      if (remaining <= 0 || r.payoutStatus === "paid") return;
      remaining -= r.commission || 0;
      if (remaining >= 0) r.payoutStatus = "paid";
    });
  }

  await saveReferralRegistry(admin, registry);
  return { ok: true, payout, summary: summarizeReferrals(bucket) };
}
