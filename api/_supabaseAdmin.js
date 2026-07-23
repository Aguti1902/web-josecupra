import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://lkbyybhtdeimktpaqgil.supabase.co";

export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
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
