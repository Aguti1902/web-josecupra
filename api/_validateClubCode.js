import { createClient } from "@supabase/supabase-js";
import { clubMatchesDiscountCode } from "../src/lib/clubEconomy.js";
import { SUPABASE_SERVICE_ROLE_FALLBACK } from "./_serviceRoleKey.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_FALLBACK;

export { audienceGetsClubDiscount } from "../src/lib/clubEconomy.js";

export async function validateClubCode(code) {
  const needle = String(code || "").trim().toUpperCase();
  if (!needle) return { valid: false };
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: clubs } = await sb.from("clubs").select("id, name, login_code").eq("login_code", needle).limit(1);
    let clubId = clubs?.[0]?.id || "";
    let clubName = clubs?.[0]?.name || "";
    if (!clubId) {
      const { data: details } = await sb.from("clubs_detail").select("club_id, data");
      const found = (details || []).find((d) => clubMatchesDiscountCode(d.data, needle));
      if (found) {
        clubId = found.club_id || found.id || "";
        clubName = found.data?.name || "";
      }
    }
    if (!clubId) return { valid: false };
    const { data: detailRow } = await sb.from("clubs_detail").select("data").eq("club_id", clubId).maybeSingle();
    const data = detailRow?.data || {};
    const teams = Array.isArray(data.teams) ? data.teams.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
    })) : [];
    return {
      valid: true,
      clubId,
      clubName: clubName || data.name || "",
      teams,
    };
  } catch {
    return { valid: false };
  }
}
