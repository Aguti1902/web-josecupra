/**
 * Inserta/actualiza el secreto Stripe test en Supabase app_secrets.
 * Uso: node scripts/seed-stripe-secret.mjs sk_test_...
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

const secret = process.argv[2] || process.env.STRIPE_SECRET_KEY;
if (!secret?.startsWith("sk_test_")) {
  console.error("Uso: node scripts/seed-stripe-secret.mjs sk_test_...");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await sb.from("app_secrets").upsert(
  { key: "stripe_test_secret", value: secret, updated_at: new Date().toISOString() },
  { onConflict: "key" },
);

if (error) {
  console.error("❌", error.message);
  console.error("Ejecuta antes scripts/supabase-app-secrets.sql en Supabase SQL Editor.");
  process.exit(1);
}

console.log("✅ stripe_test_secret guardado en Supabase app_secrets");
