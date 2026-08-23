/**
 * GET: plazas Premium restantes (jugadores individuales).
 */
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import {
  PREMIUM_PLAYER_CAP,
  countPremiumPlayersFromUsers,
  premiumSpotsRemaining,
} from "./_premiumCapacity.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const admin = getSupabaseAdmin();
    const users = [];
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return res.status(400).json({ error: error.message });
      const batch = data?.users || [];
      users.push(...batch);
      if (batch.length < perPage) break;
      page += 1;
      if (page > 50) break;
    }

    const used = countPremiumPlayersFromUsers(users);
    const remaining = premiumSpotsRemaining(used);
    return res.status(200).json({
      ok: true,
      cap: PREMIUM_PLAYER_CAP,
      used,
      remaining,
      available: remaining > 0,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error al consultar plazas" });
  }
}
