import {
  clubCommissionPct,
  clubDiscountCode,
  clubCommissionOnTotal,
  clubMatchesDiscountCode,
  DEFAULT_CLUB_COMMISSION_PCT,
  parseAddonIdList,
  looksLikeCatalogPlanAmount,
} from "../src/lib/clubEconomy.js";
import { getAddonDef } from "./_addonCatalog.js";

const REGISTRY_ID = "CLUB_REFERRAL_REGISTRY";
export const REFERRAL_COMMISSION_RATE = DEFAULT_CLUB_COMMISSION_PCT / 100;

export async function loadClubEconomy(admin, clubId) {
  if (!clubId) return {};
  const { data } = await admin.from("clubs_detail").select("data").eq("club_id", clubId).maybeSingle();
  return data?.data || {};
}

export async function resolveClubEconomy(admin, { clubId, clubCode } = {}) {
  if (clubId) {
    const data = await loadClubEconomy(admin, clubId);
    if (data && typeof data === "object" && Object.keys(data).length) {
      return { ...data, id: data.id || clubId };
    }
  }
  const code = String(clubCode || "").trim();
  if (!code) return {};
  try {
    const { data: details } = await admin.from("clubs_detail").select("club_id, data");
    const found = (details || []).find((d) => clubMatchesDiscountCode(d.data, code));
    if (found) return { ...(found.data || {}), id: found.club_id };
  } catch { /* ignore */ }
  return {};
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

function extrasCentsFromIds(addonIds) {
  return parseAddonIdList(addonIds).reduce((sum, id) => {
    const def = getAddonDef(id);
    return sum + (Number(def?.amount) || 0);
  }, 0);
}

/**
 * Total sobre el que se calcula la comisión.
 * Si Stripe (o un asiento viejo) solo guardó el precio de catálogo y hay extras
 * del carrito, se suman. Si el total ya incluye extras, no se duplican.
 */
export function paidTotalForCommission(amountPaidCents, addonIds) {
  const paid = Math.round(Number(amountPaidCents) || 0);
  if (paid <= 0) return 0;
  const extras = extrasCentsFromIds(addonIds);
  if (extras > 0 && looksLikeCatalogPlanAmount(paid)) return paid + extras;
  return paid;
}

export function applyClubCommissionToReferral(entry, club) {
  const selectedAddons = parseAddonIdList(entry?.selectedAddons);
  const amountPaid = paidTotalForCommission(entry?.amountPaid, selectedAddons);
  const pct = clubCommissionPct(club);
  const commission = amountPaid > 0 ? clubCommissionOnTotal(amountPaid, club) : 0;
  return {
    ...entry,
    selectedAddons,
    amountPaid,
    commission,
    commissionPct: pct,
  };
}

/** Reescribe asientos del club: comisión = total pagado × % configurado ahora. */
export async function syncClubReferralCommissions(admin, clubId) {
  if (!clubId) return { ok: false, changed: 0 };
  const club = await loadClubEconomy(admin, clubId);
  const registry = await loadReferralRegistry(admin);
  const bucket = registry.byClubId?.[clubId];
  if (!bucket?.referrals?.length) return { ok: true, changed: 0 };

  let changed = 0;
  bucket.referrals = bucket.referrals.map((r) => {
    const next = applyClubCommissionToReferral(r, club);
    if (
      Number(next.commission) !== Number(r.commission)
      || Number(next.amountPaid) !== Number(r.amountPaid)
      || Number(next.commissionPct) !== Number(r.commissionPct)
    ) {
      changed += 1;
    }
    return next;
  });
  bucket.commissionRate = clubCommissionPct(club) / 100;
  if (changed) await saveReferralRegistry(admin, registry);
  return { ok: true, changed };
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
  selectedAddons,
  stripeInvoiceId,
  stripeSessionId,
}) {
  const addonIds = parseAddonIdList(selectedAddons);
  const paid = paidTotalForCommission(amountPaidCents, addonIds);
  if (!paid || paid <= 0) return { ok: false, reason: "invalid_input" };

  const club = await resolveClubEconomy(admin, { clubId, clubCode });
  const resolvedClubId = clubId || club.id;
  if (!resolvedClubId) return { ok: false, reason: "invalid_input" };

  const registry = await loadReferralRegistry(admin);
  const bucket = ensureClubBucket(registry, resolvedClubId);
  const pct = clubCommissionPct(club);
  const rate = pct / 100;
  bucket.commissionRate = rate;
  const commission = clubCommissionOnTotal(paid, club);
  const month = monthKey();
  const emailLc = String(playerEmail || "").toLowerCase();
  if (bucket.referrals.some((r) => {
    if (stripeInvoiceId && r.stripeInvoiceId === stripeInvoiceId) return true;
    if (stripeSessionId && r.stripeSessionId === stripeSessionId) return true;
    const samePlayer = (playerId && r.playerId === playerId)
      || (emailLc && String(r.playerEmail || "").toLowerCase() === emailLc);
    return samePlayer
      && r.month === month
      && Number(r.amountPaid) === Number(paid)
      && Number(r.commission) > 0;
  })) {
    return { ok: true, duplicate: true };
  }

  const entry = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubCode: clubCode || clubDiscountCode(club) || "",
    playerEmail: playerEmail || "",
    playerName: playerName || playerEmail?.split("@")[0] || "Jugador",
    playerId: playerId || "",
    plan: plan || "",
    selectedAddons: addonIds,
    amountPaid: paid,
    commission,
    commissionPct: pct,
    month,
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
  const club = await resolveClubEconomy(admin, { clubId, clubCode });
  const resolvedClubId = clubId || club.id;
  if (!resolvedClubId) return { ok: false, reason: "invalid_input" };
  const registry = await loadReferralRegistry(admin);
  const bucket = ensureClubBucket(registry, resolvedClubId);
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

function referralMatchesPlayer(r, { userId, email } = {}) {
  const id = String(r?.playerId || r?.userId || "");
  const em = String(r?.playerEmail || r?.email || "").toLowerCase();
  if (userId && id && id === String(userId)) return true;
  if (email && em && em === String(email).toLowerCase()) return true;
  return false;
}

function isPaidReferral(r) {
  return (Number(r?.amountPaid) || 0) > 0 || (Number(r?.commission) || 0) > 0;
}

/** Quita al jugador del registro de comisiones (todos los clubs). unpaidOnly = solo altas sin cobro. */
export async function removePlayerFromReferralRegistry(admin, { userId, email, unpaidOnly = false } = {}) {
  if (!userId && !email) return { ok: false, changed: false };
  const registry = await loadReferralRegistry(admin);
  let changed = false;
  for (const bucket of Object.values(registry.byClubId || {})) {
    const prev = bucket.referrals || [];
    const next = prev.filter((r) => {
      if (!referralMatchesPlayer(r, { userId, email })) return true;
      if (unpaidOnly && isPaidReferral(r)) return true;
      return false;
    });
    if (next.length !== prev.length) {
      bucket.referrals = next;
      changed = true;
    }
  }
  if (changed) await saveReferralRegistry(admin, registry);
  return { ok: true, changed };
}

/** Altas a 0 € cuyo usuario ya no existe en Auth: se quitan al cargar comisiones. */
export async function scrubUnpaidReferralsMissingUsers(admin, clubId) {
  if (!clubId) return { ok: false, changed: false };
  const registry = await loadReferralRegistry(admin);
  const bucket = registry.byClubId?.[clubId];
  if (!bucket?.referrals?.length) return { ok: true, changed: false };

  const kept = [];
  let changed = false;
  for (const r of bucket.referrals) {
    if (isPaidReferral(r)) {
      kept.push(r);
      continue;
    }
    let exists = false;
    if (r.playerId) {
      try {
        const { data } = await admin.auth.admin.getUserById(r.playerId);
        exists = !!data?.user;
      } catch { exists = false; }
    }
    if (!exists && r.playerEmail) {
      try {
        const { findUserByEmail } = await import("./_supabaseAdmin.js");
        exists = !!(await findUserByEmail(admin, r.playerEmail));
      } catch { exists = false; }
    }
    if (exists) kept.push(r);
    else changed = true;
  }
  if (changed) {
    bucket.referrals = kept;
    await saveReferralRegistry(admin, registry);
  }
  return { ok: true, changed };
}

export { referralMatchesPlayer, isPaidReferral };

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
