import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

const SERVICE_ROLE_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2ilsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_FALLBACK;
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
