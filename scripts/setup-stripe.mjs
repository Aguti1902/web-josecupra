/**
 * Bootstrap Stripe: crea productos, precios mensuales y webhook endpoint DEPRO.
 *
 * Uso:
 *   npm run stripe:setup:test   → api/stripe-prices.test.json (sk_test_...)
 *   npm run stripe:setup:live   → api/stripe-prices.live.json (sk_live_...)
 *
 * Requiere STRIPE_SECRET_KEY en .env acorde al modo.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const args = process.argv.slice(2);
const modeArg = args.find((a) => a === "--test" || a === "--live");
const mode = modeArg === "--live" ? "live" : "test";

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

const PRICES = {
  "coach-starter":    { amount: 1499,  name: "DEPRO Entrenador Starter",   description: "1 equipo · hasta 25 jugadores · microciclo IA" },
  "coach-pro":        { amount: 2999,  name: "DEPRO Entrenador Pro",       description: "3 equipos · hasta 60 jugadores · control de carga" },
  "coach-premium":    { amount: 4999,  name: "DEPRO Entrenador Premium",   description: "Equipos ilimitados · GPS · diagramas IA" },
  "club-inicial":     { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":         { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":       { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential": { amount: 2900,  name: "DEPRO Jugador Básico",       description: "Plan IA · ranking · tests · panel privado" },
  "player-pro":       { amount: 9900,  name: "DEPRO Jugador Premium",      description: "Seguimiento humano · videollamada · WhatsApp · 30 plazas" },
};

const ADDONS = {
  "addon-pdf": { amount: 500, name: "DEPRO · Descarga en PDF", description: "PDF de sesiones y plan mensual" },
  "addon-cargas": { amount: 500, name: "DEPRO · Mis cargas", description: "Registro de cargas e histórico" },
  "addon-progression": { amount: 500, name: "DEPRO · Tests con registro", description: "Tests físicos con registro" },
};

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌ Falta STRIPE_SECRET_KEY en .env");
  process.exit(1);
}

const keyIsTest = key.includes("_test_");
if (mode === "test" && !keyIsTest) {
  console.error("❌ Modo --test requiere STRIPE_SECRET_KEY=sk_test_...");
  process.exit(1);
}
if (mode === "live" && keyIsTest) {
  console.error("❌ Modo --live requiere STRIPE_SECRET_KEY=sk_live_...");
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL || (mode === "test" ? "http://localhost:5173" : "https://www.deprotrain.com")).replace(/\/$/, "");
const webhookUrl = `${siteUrl}/api/stripe-webhook`;
const paymentDomains = Array.from(
  new Set(
    [
      process.env.STRIPE_PAYMENT_DOMAIN,
      (() => {
        try {
          return new URL(siteUrl).hostname;
        } catch {
          return null;
        }
      })(),
      "www.deprotrain.com",
      "deprotrain.com",
    ].filter(Boolean),
  ),
);

const stripe = new Stripe(key);
const pricesOut = {};
const pricesPath = resolve(root, `api/stripe-prices.${mode}.json`);

async function ensureProduct(planId, def) {
  const search = await stripe.products.search({
    query: `metadata['depro_plan_id']:'${planId}'`,
    limit: 1,
  });
  if (search.data[0]) return search.data[0];

  return stripe.products.create({
    name: def.name,
    description: def.description,
    metadata: { depro_plan_id: planId },
  });
}

async function ensurePrice(planId, productId, def) {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 20 });
  const match = existing.data.find(
    (p) => p.unit_amount === def.amount && p.recurring?.interval === "month",
  );
  if (match) return match;

  return stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: def.amount,
    recurring: { interval: "month" },
    metadata: { depro_plan_id: planId },
  });
}

async function ensureWebhook() {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const found = list.data.find((w) => w.url === webhookUrl);
  if (found) {
    console.log(`ℹ️  Webhook ya existe: ${found.id}`);
    return found;
  }
  return stripe.webhookEndpoints.create({
    url: webhookUrl,
    enabled_events: WEBHOOK_EVENTS,
    description: mode === "test" ? "DEPRO test — suscripciones y pagos" : "DEPRO producción — suscripciones y pagos",
  });
}

async function ensurePaymentMethodDomains() {
  const existing = await stripe.paymentMethodDomains.list({ limit: 100 });
  for (const domain of paymentDomains) {
    let row = existing.data.find((d) => d.domain_name === domain);
    if (!row) {
      row = await stripe.paymentMethodDomains.create({ domain_name: domain, enabled: true });
      console.log(`✅ Payment Method Domain creado: ${domain} (${row.id})`);
    } else if (!row.enabled) {
      row = await stripe.paymentMethodDomains.update(row.id, { enabled: true });
      console.log(`✅ Payment Method Domain reactivado: ${domain}`);
    } else {
      console.log(`ℹ️  Payment Method Domain OK: ${domain}`);
    }
    console.log(
      `   Apple Pay: ${row.apple_pay?.status || "?"} · Google Pay: ${row.google_pay?.status || "?"} · Link: ${row.link?.status || "?"}`,
    );
  }
}

async function ensureBillingPortal() {
  try {
    const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
    const returnUrl = `${siteUrl.replace(/\/$/, "")}/dashboard/subscription`;
    if (configs.data.length) {
      await stripe.billingPortal.configurations.update(configs.data[0].id, {
        default_return_url: returnUrl,
      });
      console.log(`✅ Customer Portal return_url → ${returnUrl}`);
      return;
    }
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "DEPRO — gestión de suscripción",
      },
      default_return_url: returnUrl,
      features: {
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        subscription_update: { enabled: false },
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
      },
    });
    console.log("✅ Customer Portal configurado");
  } catch (e) {
    console.warn("⚠️  Portal:", e.message);
  }
}

async function ensureAddonProduct(addonId, def) {
  const search = await stripe.products.search({
    query: `metadata['depro_addon_id']:'${addonId}'`,
    limit: 1,
  });
  if (search.data[0]) return search.data[0];

  return stripe.products.create({
    name: def.name,
    description: def.description,
    metadata: { depro_addon_id: addonId },
  });
}

async function ensureAddonPrice(addonId, productId, def) {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 20 });
  const match = existing.data.find(
    (p) => p.unit_amount === def.amount && p.recurring?.interval === "month",
  );
  if (match) return match;

  return stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: def.amount,
    recurring: { interval: "month" },
    metadata: { depro_addon_id: addonId },
  });
}

async function main() {
  console.log(`🔧 Configurando Stripe DEPRO (${mode.toUpperCase()})…`);
  console.log(`   Site: ${siteUrl}`);

  for (const [planId, def] of Object.entries(PRICES)) {
    const product = await ensureProduct(planId, def);
    const price = await ensurePrice(planId, product.id, def);
    pricesOut[planId] = price.id;
    console.log(`✅ ${planId} → ${price.id} (${(def.amount / 100).toFixed(2)} €/mes)`);
  }

  for (const [addonId, def] of Object.entries(ADDONS)) {
    const product = await ensureAddonProduct(addonId, def);
    const price = await ensureAddonPrice(addonId, product.id, def);
    pricesOut[addonId] = price.id;
    console.log(`✅ extra ${addonId} → ${price.id} (${(def.amount / 100).toFixed(2)} €/mes)`);
  }

  writeFileSync(pricesPath, `${JSON.stringify(pricesOut, null, 2)}\n`);
  console.log(`\n📄 Guardado ${pricesPath}`);

  const webhook = await ensureWebhook();
  console.log(`\n🔗 Webhook: ${webhookUrl}`);
  console.log(`   ID: ${webhook.id}`);
  if (webhook.secret) {
    console.log("\n⚠️  Añade a Vercel y .env:");
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  } else {
    console.log("\nℹ️  El secreto del webhook solo se muestra al crearlo. Revócalo y vuelve a ejecutar si necesitas uno nuevo.");
  }

  await ensurePaymentMethodDomains();
  await ensureBillingPortal();
  console.log(`\n✅ Setup ${mode} completado. Haz commit de api/stripe-prices.${mode}.json y despliega.`);
  console.log(`   En Vercel Production: SITE_URL=${siteUrl}`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
