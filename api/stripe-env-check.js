/** Diagnóstico: env vars y modos Stripe (sin exponer secretos). */

import { getStripeModeDiagnostics } from "./_stripeMode.js";

export default function handler(_req, res) {
  const allNames = Object.keys(process.env).sort();
  const customNames = allNames.filter((k) => !k.startsWith("VERCEL_") && !k.startsWith("AWS_") && !k.startsWith("NODE_"));

  const has = {
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    STRIPE_PUBLISHABLE_KEY: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    VITE_STRIPE_PUBLISHABLE_KEY: Boolean(process.env.VITE_STRIPE_PUBLISHABLE_KEY),
    STRIPE_MODE: process.env.STRIPE_MODE || null,
    VITE_STRIPE_MODE: process.env.VITE_STRIPE_MODE || null,
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    VITE_SUPABASE_URL: Boolean(process.env.VITE_SUPABASE_URL),
  };

  const mode = getStripeModeDiagnostics();

  return res.status(200).json({
    stripeEnvPresent: has,
    mode,
    customEnvCount: customNames.length,
    customEnvNames: customNames,
    hint: mode.mismatch
      ? mode.hint
      : !has.STRIPE_SECRET_KEY
        ? "Falta STRIPE_SECRET_KEY en Vercel → Production. Si ya existe, borra duplicados y redeploy sin caché."
        : "Stripe secret presente.",
  });
}
