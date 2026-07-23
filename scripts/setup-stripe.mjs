/**
 * Bootstrap Stripe: crea productos, precios mensuales y webhook endpoint DEPRO.
 *
 * Uso:
 *   SITE_URL=https://depro.es node scripts/setup-stripe.mjs
 *
 * Requiere STRIPE_SECRET_KEY en .env (sk_live_... recomendado).
 * Escribe api/stripe-prices.json y muestra STRIPE_WEBHOOK_SECRET para Vercel.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
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
  "player-essential": { amount: 1999,  name: "DEPRO Jugador Esencial",     description: "Plan mensual IA · panel privado · PDF" },
  "player-pro":       { amount: 3999,  name: "DEPRO Jugador Pro",          description: "Plan IA adaptativo · tests · alertas de carga" },
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

const siteUrl = (process.env.SITE_URL || "https://depro.es").replace(/\/$/, "");
const webhookUrl = `${siteUrl}/api/stripe-webhook`;

const stripe = new Stripe(key);
const pricesOut = {};
const pricesPath = resolve(root, "api/stripe-prices.json");

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
    description: "DEPRO producción — suscripciones y pagos",
  });
}

async function ensureBillingPortal() {
  try {
    const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
    if (configs.data.length) return;
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "DEPRO — gestión de suscripción",
      },
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

async function main() {
  console.log("🔧 Configurando Stripe DEPRO…");
  console.log(`   Site: ${siteUrl}`);

  for (const [planId, def] of Object.entries(PRICES)) {
    const product = await ensureProduct(planId, def);
    const price = await ensurePrice(planId, product.id, def);
    pricesOut[planId] = price.id;
    console.log(`✅ ${planId} → ${price.id} (${(def.amount / 100).toFixed(2)} €/mes)`);
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

  await ensureBillingPortal();
  console.log("\n✅ Setup completado. Haz commit de api/stripe-prices.json y despliega.");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
