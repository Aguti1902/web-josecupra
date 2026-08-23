/**
 * Activa Stripe LIVE para www.deprotrain.com.
 *
 * Uso (pega las claves de https://dashboard.stripe.com/apikeys en modo Live):
 *
 *   node scripts/enable-stripe-live.mjs \
 *     --secret sk_live_... \
 *     --publishable pk_live_...
 *
 * Efectos:
 *   - Guarda sk_live en Supabase app_secrets (stripe_live_secret)
 *   - Registra Payment Method Domains + webhook live
 *   - Actualiza Customer Portal return_url
 *   - Escribe config/stripe.public.json (pk_live) y recuerda vars de Vercel
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_FALLBACK } from "../api/_serviceRoleKey.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SITE_URL = (process.env.SITE_URL || "https://www.deprotrain.com").replace(/\/$/, "");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1].trim();
  return "";
}

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const secret = arg("secret") || process.env.STRIPE_SECRET_KEY || "";
const publishable =
  arg("publishable") ||
  process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  process.env.STRIPE_PUBLISHABLE_KEY ||
  "";

if (!secret.startsWith("sk_live_")) {
  console.error("❌ Falta --secret sk_live_... (Dashboard Stripe → Live → API keys)");
  process.exit(1);
}
if (!publishable.startsWith("pk_live_")) {
  console.error("❌ Falta --publishable pk_live_...");
  process.exit(1);
}

const stripe = new Stripe(secret);
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
];

async function main() {
  console.log(`🚀 Activando Stripe LIVE → ${SITE_URL}`);

  // Payment method domains
  for (const domain of ["www.deprotrain.com", "deprotrain.com"]) {
    const list = await stripe.paymentMethodDomains.list({ limit: 100 });
    let row = list.data.find((d) => d.domain_name === domain);
    if (!row) {
      row = await stripe.paymentMethodDomains.create({ domain_name: domain, enabled: true });
      console.log(`✅ Domain LIVE creado: ${domain}`);
    } else {
      if (!row.enabled) row = await stripe.paymentMethodDomains.update(row.id, { enabled: true });
      console.log(`ℹ️  Domain LIVE OK: ${domain}`);
    }
  }

  // Webhook
  const webhookUrl = `${SITE_URL}/api/stripe-webhook`;
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
  let hook = hooks.data.find((w) => w.url === webhookUrl);
  let whsec = "";
  if (hook) {
    hook = await stripe.webhookEndpoints.update(hook.id, {
      enabled_events: WEBHOOK_EVENTS,
      disabled: false,
      description: "DEPRO LIVE www.deprotrain.com",
    });
    console.log(`ℹ️  Webhook LIVE existente: ${hook.id}`);
  } else {
    hook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: WEBHOOK_EVENTS,
      description: "DEPRO LIVE www.deprotrain.com",
    });
    whsec = hook.secret || "";
    console.log(`✅ Webhook LIVE creado: ${hook.id}`);
  }

  // Portal
  const returnUrl = `${SITE_URL}/dashboard/subscription`;
  const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
  if (configs.data[0]) {
    await stripe.billingPortal.configurations.update(configs.data[0].id, {
      default_return_url: returnUrl,
    });
  } else {
    await stripe.billingPortal.configurations.create({
      business_profile: { headline: "DEPRO — gestión de suscripción" },
      default_return_url: returnUrl,
      features: {
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
      },
    });
  }
  console.log(`✅ Portal LIVE return_url → ${returnUrl}`);

  // Supabase secret
  const sb = createClient(
    "https://lkbyybhtdeimktpaqgil.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_FALLBACK,
    { auth: { persistSession: false } },
  );
  const { error } = await sb.from("app_secrets").upsert(
    { key: "stripe_live_secret", value: secret, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) console.warn("⚠️  Supabase app_secrets:", error.message);
  else console.log("✅ stripe_live_secret guardado en Supabase");

  // Public config
  const publicPath = resolve(root, "config/stripe.public.json");
  let publicCfg = {};
  try {
    publicCfg = JSON.parse(readFileSync(publicPath, "utf8"));
  } catch { /* ignore */ }
  publicCfg.livePublishableKey = publishable;
  if (!publicCfg.testPublishableKey) {
    publicCfg.testPublishableKey =
      "pk_test_51TVzAWL0FQK1XtUnkAE6it45JKwnJnF2fDTrUYYcNDzmey00viN4Iaji4yM753tQVB1wvuURdKhDPF5xv2DGtpJf00HrLOieCX";
  }
  writeFileSync(publicPath, `${JSON.stringify(publicCfg, null, 2)}\n`);
  console.log("✅ config/stripe.public.json actualizado con pk_live");

  console.log(`
══════════════════════════════════════════════════════════
Añade en Vercel → proyecto de www.deprotrain.com → Production:

  SITE_URL=https://www.deprotrain.com
  STRIPE_MODE=live
  VITE_STRIPE_MODE=live
  STRIPE_SECRET_KEY=${secret.slice(0, 12)}… (pega sk_live completo)
  VITE_STRIPE_PUBLISHABLE_KEY=${publishable.slice(0, 12)}… (pega pk_live completo)
${whsec ? `  STRIPE_WEBHOOK_SECRET=${whsec}\n` : "  STRIPE_WEBHOOK_SECRET=whsec_… (Dashboard → Webhooks → Reveal)\n"}
Luego: Redeploy sin caché.
══════════════════════════════════════════════════════════
`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
