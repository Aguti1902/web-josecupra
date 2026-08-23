import { createClient } from "@supabase/supabase-js";

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
const supabaseUrl =
  env.VITE_SUPABASE_URL ??
  "https://lkbyybhtdeimktpaqgil.supabase.co";

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Mjg1MTksImV4cCI6MjA5NDEwNDUxOX0.QTzwNQpQx4SD66OTtG0CY_N-_cpw2KRTOIsKigGU0AQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
