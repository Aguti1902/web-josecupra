/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: service role en API routes para simplificar escritura sin auth.
 * PRODUCCIÓN: usar cookies de sesión + RLS; service role solo para jobs admin.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
