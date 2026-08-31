import { createClient } from "@supabase/supabase-js";
import { reclaimLocalStorage, safeSetItem } from "./storageQuota";

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
const supabaseUrl =
  env.VITE_SUPABASE_URL ??
  "https://lkbyybhtdeimktpaqgil.supabase.co";

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Mjg1MTksImV4cCI6MjA5NDEwNDUxOX0.QTzwNQpQx4SD66OTtG0CY_N-_cpw2KRTOIsKigGU0AQ";

/** Persistencia de sesión que no tumba el login si localStorage está lleno. */
const quotaSafeStorage = {
  getItem: (key) => {
    try {
      return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof localStorage === "undefined") return;
      if (safeSetItem(localStorage, key, value)) return;
      reclaimLocalStorage({ aggressive: true });
      safeSetItem(localStorage, key, value);
    } catch {
      /* cupo: la sesión sigue en memoria */
    }
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: quotaSafeStorage,
  },
});
