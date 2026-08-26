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
  const activePlayers = referrals.filter((r) => r.status === "active").length;
  const trialPlayers = referrals.filter((r) => r.status === "trialing" || r.status === "trial").length;
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
  if (!clubId || !amountPaidCents || amountPaidCents <= 0) return { ok: false, reason: "invalid_input" };

  const registry = await loadReferralRegistry(admin);
  const club = await loadClubEconomy(admin, clubId);
  const bucket = ensureClubBucket(registry, clubId);
  const rate = clubCommissionRate(club);
  bucket.commissionRate = rate;
  const commission = commissionCents(amountPaidCents, clubCommissionPct(club));
  const dedupeKey = stripeInvoiceId || stripeSessionId;
  if (dedupeKey && bucket.referrals.some((r) => r.stripeInvoiceId === dedupeKey || r.stripeSessionId === dedupeKey)) {
    return { ok: true, duplicate: true };
  }

  const entry = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubCode: clubCode || "",
    playerEmail: playerEmail || "",
    playerName: playerName || playerEmail?.split("@")[0] || "Jugador",
    playerId: playerId || "",
    plan: plan || "",
    amountPaid: amountPaidCents,
    commission,
    month: monthKey(),
    payoutStatus: "pending",
    status: "active",
    stripeInvoiceId: stripeInvoiceId || null,
    stripeSessionId: stripeSessionId || null,
    createdAt: new Date().toISOString(),
  };

  bucket.referrals.push(entry);
  await saveReferralRegistry(admin, registry);
  return { ok: true, entry };
}

/** Alta con código (incluye prueba gratuita, importe 0). No crea plantilla ni equipo. */
export async function recordClubCodeSignup(admin, {
  clubId,
  clubCode,
  playerEmail,
  playerName,
  playerId,
  plan,
  status = "trialing",
  stripeSessionId,
}) {
  if (!clubId) return { ok: false, reason: "invalid_input" };
  const registry = await loadReferralRegistry(admin);
  const bucket = ensureClubBucket(registry, clubId);
  const dedupeKey = stripeSessionId || playerId || playerEmail;
  if (dedupeKey && bucket.referrals.some((r) =>
    r.stripeSessionId === stripeSessionId
    || (playerId && r.playerId === playerId)
    || (playerEmail && r.playerEmail === playerEmail && r.status === status)
  )) {
    return { ok: true, duplicate: true };
  }
  const entry = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubCode: clubCode || "",
    playerEmail: playerEmail || "",
    playerName: playerName || playerEmail?.split("@")[0] || "Jugador",
    playerId: playerId || "",
    plan: plan || "",
    amountPaid: 0,
    commission: 0,
    month: monthKey(),
    payoutStatus: "none",
    status: status || "trialing",
    stripeInvoiceId: null,
    stripeSessionId: stripeSessionId || null,
    createdAt: new Date().toISOString(),
  };
  bucket.referrals.push(entry);
  await saveReferralRegistry(admin, registry);
  return { ok: true, entry };
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
