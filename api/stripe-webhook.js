import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin, findUserByStripeCustomer } from "./_supabaseAdmin.js";
import { syncCheckoutSession, syncSubscriptionToUser } from "./_stripeSync.js";
import { recordReferralPayment } from "./_clubReferrals.js";
import { stripePaidCents } from "../src/lib/clubEconomy.js";
import { getStripeWebhookSecretFallback } from "./_stripeWebhookSecret.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const fromEnv = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const secretIsLive = (process.env.STRIPE_SECRET_KEY || "").includes("_live_");
  // Nunca usar whsec de test con sk_live
  const webhookSecret = fromEnv || (secretIsLive ? "" : getStripeWebhookSecretFallback() || "");
  if (!webhookSecret) {
    console.error("stripe-webhook: falta STRIPE_WEBHOOK_SECRET");
    return res.status(500).json({ error: "Webhook no configurado" });
  }

  let event;
  try {
    const stripe = await getStripe();
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe-webhook signature:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error("stripe-webhook supabase:", err.message);
    return res.status(500).json({ error: "Supabase admin no configurado" });
  }

  async function trackReferralFromMeta(meta, amountPaidCents, stripeInvoiceId, stripeSessionId) {
    const clubId = meta?.clubId || "";
    const clubCode = meta?.clubCode || "";
    const audience = meta?.audience || meta?.role || "";
    const isPlayer = audience === "player" || meta?.type === "addon" || (!audience && (clubId || clubCode));
    if (!isPlayer || !amountPaidCents) return;
    if (!clubId && !clubCode) return;

    await recordReferralPayment(supabaseAdmin, {
      clubId,
      clubCode,
      playerEmail: meta.email || "",
      playerName: meta.nombre || meta.name || "",
      playerId: meta.authUserId || meta.userId || "",
      plan: meta.plan || meta.addonId || "",
      amountPaidCents,
      stripeInvoiceId,
      stripeSessionId,
    });
  }

  async function metaFromUser(customerId, emailHint, base = {}) {
    try {
      const user = await findUserByStripeCustomer(supabaseAdmin, customerId, emailHint);
      const um = user?.user_metadata || {};
      return {
        ...base,
        clubId: base.clubId || um.clubId || "",
        clubCode: base.clubCode || um.clubCode || "",
        audience: base.audience || um.audience || um.role || "",
        email: base.email || user?.email || "",
        nombre: base.nombre || base.name || um.name || "",
        authUserId: base.authUserId || base.userId || user?.id || "",
        plan: base.plan || um.plan || "",
      };
    } catch {
      return base;
    }
  }

  try {
    const stripe = await getStripe();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await syncCheckoutSession(supabaseAdmin, session);
        const paid = stripePaidCents(session);
        if (paid > 0) {
          await trackReferralFromMeta(session.metadata || {}, paid, null, session.id);
        }
        if (session.subscription) {
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId, {
            expand: ["items.data.price.product"],
          });
          await syncSubscriptionToUser(
            supabaseAdmin,
            sub,
            session.metadata?.email || session.customer_email,
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const full = await stripe.subscriptions.retrieve(sub.id, {
          expand: ["items.data.price.product"],
        });
        await syncSubscriptionToUser(supabaseAdmin, full);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subId = typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionToUser(supabaseAdmin, sub, invoice.customer_email);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subId = typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionToUser(supabaseAdmin, sub, invoice.customer_email);
          const meta = await metaFromUser(
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            invoice.customer_email,
            { ...(sub.metadata || {}), ...(invoice.metadata || {}) },
          );
          await trackReferralFromMeta(meta, stripePaidCents(invoice), invoice.id, null);
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("stripe-webhook handler:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
