import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2ilsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

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
