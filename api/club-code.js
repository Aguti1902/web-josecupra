import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { lookupClubByDiscountCode } from "./_clubReferrals.js";

/** Público: valida un código club y devuelve el % configurado (sin IBAN ni datos sensibles). */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ valid: false, error: "Method not allowed" });

  const code = String(req.query.code || "").trim();
  if (!code) return res.status(400).json({ valid: false });

  try {
    const admin = getSupabaseAdmin();
    const found = await lookupClubByDiscountCode(admin, code);
    if (!found?.valid) return res.status(200).json({ valid: false });
    return res.status(200).json({
      valid: true,
      clubId: found.clubId,
      name: found.name || "",
      commissionPct: found.commissionPct,
    });
  } catch (err) {
    return res.status(200).json({ valid: false, error: err.message });
  }
}
