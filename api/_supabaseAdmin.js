import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_FALLBACK } from "./_serviceRoleKey.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_FALLBACK;
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Busca usuario por stripeCustomerId o email (paginación básica). */
export async function findUserByStripeCustomer(supabaseAdmin, customerId, emailHint) {
  if (emailHint) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const byEmail = data?.users?.find(
      (u) => u.email?.toLowerCase() === String(emailHint).toLowerCase(),
    );
    if (byEmail) return byEmail;
  }
  if (!customerId) return null;
  let page = 1;
  while (page <= 10) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    const users = data?.users || [];
    const found = users.find((u) => u.user_metadata?.stripeCustomerId === customerId);
    if (found) return found;
    if (users.length < 200) break;
    page += 1;
  }
  return null;
}
