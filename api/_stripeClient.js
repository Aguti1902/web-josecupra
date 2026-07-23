import Stripe from "stripe";

let _stripe;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurada");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export function getSiteUrl() {
  const raw = process.env.SITE_URL || process.env.VERCEL_URL || "https://depro.es";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw}`.replace(/\/$/, "");
}
