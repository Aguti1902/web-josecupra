import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import {
  loadReferralRegistry,
  summarizeReferrals,
  markReferralPayout,
  REFERRAL_COMMISSION_RATE,
} from "./_clubReferrals.js";

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
      const bucket = registry.byClubId[clubId] || {
        commissionRate: REFERRAL_COMMISSION_RATE,
        referrals: [],
        payouts: [],
      };

      return res.status(200).json(summarizeReferrals(bucket));
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const { action, clubId, amount, month, note, iban } = body;
      if (!clubId) return res.status(400).json({ error: "clubId required" });

      if (action === "request_payout" || action === "mark_paid") {
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
