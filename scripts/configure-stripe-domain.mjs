/**
 * Configura Stripe para el dominio canónico de DEPRO.
 *
 * - Webhook → https://www.deprotrain.com/api/stripe-webhook
 * - Payment Method Domains (Apple Pay / Google Pay / Link)
 * - Customer Portal return_url
 *
 * Uso:
 *   SITE_URL=https://www.deprotrain.com STRIPE_SECRET_KEY=sk_test_... node scripts/configure-stripe-domain.mjs
 *   npm run stripe:domain
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { getStripeTestSecretFallback } from "../api/_stripeTestKey.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const SITE_URL = (process.env.SITE_URL || "https://www.deprotrain.com").replace(/\/$/, "");
const WEBHOOK_URL = `${SITE_URL}/api/stripe-webhook`;
const DOMAINS = Array.from(
  new Set([
    process.env.STRIPE_PAYMENT_DOMAIN,
    (() => {
      try {
        return new URL(SITE_URL).hostname;
      } catch {
        return null;
      }
    })(),
    "www.deprotrain.com",
    "deprotrain.com",
  ].filter(Boolean)),
);

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
];

const key =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_TEST_SECRET_KEY ||
  getStripeTestSecretFallback();

if (!key) {
  console.error("❌ Falta STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = key.includes("_live_") ? "live" : "test";

async function main() {
  console.log(`🔧 Stripe dominio DEPRO (${mode})`);
  console.log(`   SITE_URL=${SITE_URL}`);

  for (const domain of DOMAINS) {
    const list = await stripe.paymentMethodDomains.list({ limit: 100 });
    let row = list.data.find((d) => d.domain_name === domain);
    if (!row) {
      row = await stripe.paymentMethodDomains.create({ domain_name: domain, enabled: true });
      console.log(`✅ Domain creado: ${domain}`);
    } else if (!row.enabled) {
      row = await stripe.paymentMethodDomains.update(row.id, { enabled: true });
      console.log(`✅ Domain reactivado: ${domain}`);
    } else {
      console.log(`ℹ️  Domain OK: ${domain}`);
    }
    console.log(
      `   Apple=${row.apple_pay?.status} Google=${row.google_pay?.status} Link=${row.link?.status}`,
    );
  }

  const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
  let hook = hooks.data.find((w) => w.url === WEBHOOK_URL);
  if (hook) {
    hook = await stripe.webhookEndpoints.update(hook.id, {
      enabled_events: WEBHOOK_EVENTS,
      disabled: false,
      description: `DEPRO ${SITE_URL} (${mode})`,
    });
    console.log(`ℹ️  Webhook existente: ${hook.id}`);
    console.log("   (el whsec_ solo se muestra al crear; regenera en Dashboard si hace falta)");
  } else {
    hook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
      description: `DEPRO ${SITE_URL} (${mode})`,
    });
    console.log(`✅ Webhook creado: ${hook.id}`);
    console.log(`\n⚠️  Añade en Vercel Production:`);
    console.log(`STRIPE_WEBHOOK_SECRET=${hook.secret}`);
  }
  console.log(`   URL: ${WEBHOOK_URL}`);

  const returnUrl = `${SITE_URL}/dashboard/subscription`;
  const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
  if (configs.data[0]) {
    await stripe.billingPortal.configurations.update(configs.data[0].id, {
      default_return_url: returnUrl,
    });
    console.log(`✅ Portal return_url → ${returnUrl}`);
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
    console.log(`✅ Portal creado → ${returnUrl}`);
  }

  console.log(`\n✅ Listo. En Vercel (proyecto de www.deprotrain.com):`);
  console.log(`   SITE_URL=${SITE_URL}`);
  console.log(`   STRIPE_WEBHOOK_SECRET=whsec_... (el del webhook de arriba)`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
