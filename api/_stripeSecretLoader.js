import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_FALLBACK } from "./_serviceRoleKey.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_FALLBACK;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

let cachedSecret = null;

export async function loadStripeSecretFromSupabase() {
  if (cachedSecret) return cachedSecret;
  try {
    const { data, error } = await adminClient()
      .from("app_secrets")
      .select("value")
      .eq("key", "stripe_test_secret")
      .maybeSingle();
    if (error) {
      console.warn("stripe secret supabase:", error.message);
      return "";
    }
    cachedSecret = (data?.value || "").trim();
    return cachedSecret;
  } catch (err) {
    console.warn("stripe secret supabase:", err.message);
    return "";
  }
}
