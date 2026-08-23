/**
 * One-shot: registra dominios de pago + webhook LIVE usando STRIPE_SECRET_KEY del runtime.
 * POST /api/stripe-bootstrap-domain
 * Header: x-depro-bootstrap: deprotrain-live-2026
 */
import { getStripe, getSiteUrl } from "./_stripeClient.js";

const BOOTSTRAP_TOKEN = "deprotrain-live-2026";

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.headers["x-depro-bootstrap"] || "").trim();
  if (token !== BOOTSTRAP_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const stripe = await getStripe();
    const siteUrl = getSiteUrl();
    const keyHint = (process.env.STRIPE_SECRET_KEY || "").includes("_live_")
      ? "live"
      : "test-or-fallback";

    if (keyHint !== "live") {
      return res.status(400).json({
        error: "STRIPE_SECRET_KEY no es sk_live_ en este despliegue",
        keyHint,
        siteUrl,
      });
    }

    const domains = ["www.deprotrain.com", "deprotrain.com"];
    const domainResults = [];
    const existingDomains = await stripe.paymentMethodDomains.list({ limit: 100 });
    for (const domain of domains) {
      let row = existingDomains.data.find((d) => d.domain_name === domain);
      if (!row) {
        row = await stripe.paymentMethodDomains.create({ domain_name: domain, enabled: true });
        domainResults.push({ domain, status: "created", id: row.id });
      } else {
        if (!row.enabled) {
          row = await stripe.paymentMethodDomains.update(row.id, { enabled: true });
        }
        domainResults.push({
          domain,
          status: "ok",
          id: row.id,
          apple: row.apple_pay?.status,
          google: row.google_pay?.status,
        });
      }
    }

    const webhookUrl = `${siteUrl}/api/stripe-webhook`;
    const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
    let hook = hooks.data.find((w) => w.url === webhookUrl);
    let webhookSecret = null;
    if (hook) {
      hook = await stripe.webhookEndpoints.update(hook.id, {
        enabled_events: WEBHOOK_EVENTS,
        disabled: false,
        description: "DEPRO LIVE www.deprotrain.com",
      });
    } else {
      hook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: WEBHOOK_EVENTS,
        description: "DEPRO LIVE www.deprotrain.com",
      });
      webhookSecret = hook.secret || null;
    }

    const returnUrl = `${siteUrl}/dashboard/subscription`;
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

    return res.status(200).json({
      ok: true,
      siteUrl,
      keyHint,
      domains: domainResults,
      webhook: {
        id: hook.id,
        url: webhookUrl,
        secret: webhookSecret,
        note: webhookSecret
          ? "Añade STRIPE_WEBHOOK_SECRET en Vercel Production y redeploy"
          : "Webhook ya existía; el whsec_ solo se muestra al crear. Revélalo en Dashboard → Webhooks si hace falta.",
      },
      portalReturnUrl: returnUrl,
    });
  } catch (err) {
    console.error("stripe-bootstrap-domain:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
