import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import {
  loadReferralRegistry,
  loadClubEconomy,
  summarizeReferrals,
  markReferralPayout,
  scrubUnpaidReferralsMissingUsers,
  syncClubReferralCommissions,
} from "./_clubReferrals.js";
import {
  clubCommissionPct,
  clubCommissionRate,
  clubDiscountCode,
  clubPayoutAccount,
} from "../src/lib/clubEconomy.js";

async function isDeproAdmin(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return false;
  const meta = data.user.user_metadata || {};
  return meta.role === "admin" || data.user.email === "jose@depro.es";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    return res.status(500).json({ error: err.message || "Supabase admin no configurado" });
  }

  try {
    if (req.method === "GET") {
      const { clubId } = req.query;
      if (!clubId) return res.status(400).json({ error: "clubId required" });

      const registry = await loadReferralRegistry(admin);
      const club = await loadClubEconomy(admin, clubId);
      const rate = clubCommissionRate(club);
      try { await scrubUnpaidReferralsMissingUsers(admin, clubId); } catch { /* ignore */ }
      try { await syncClubReferralCommissions(admin, clubId); } catch { /* ignore */ }
      const fresh = await loadReferralRegistry(admin);
      const bucket = fresh.byClubId[clubId] || registry.byClubId[clubId] || {
        commissionRate: rate,
        referrals: [],
        payouts: [],
      };
      const payout = clubPayoutAccount(club);
      return res.status(200).json({
        ...summarizeReferrals({ ...bucket, commissionRate: rate }),
        commissionPct: clubCommissionPct(club),
        discountCode: clubDiscountCode(club),
        payoutIban: payout.iban,
        payoutAccountName: payout.accountName,
        clubFee: club.manualPrice ?? null,
        clubPlan: club.plan || null,
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const { action, clubId, amount, month, note, iban } = body;
      if (!clubId) return res.status(400).json({ error: "clubId required" });

      if (action === "request_payout" || action === "mark_paid") {
        if (action === "mark_paid") {
          const okAdmin = await isDeproAdmin(req, admin);
          if (!okAdmin) return res.status(403).json({ error: "Solo el admin DEPRO puede marcar una transferencia como hecha" });
        }
        const result = await markReferralPayout(admin, clubId, {
          amount,
          month,
          note,
          iban,
          markPaid: action === "mark_paid",
        });
        if (!result.ok) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      return res.status(400).json({ error: "action not supported" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
