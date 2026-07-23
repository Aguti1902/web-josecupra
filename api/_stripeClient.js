import Stripe from "stripe";

let _stripe;

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export function getStripeSecretKey() {
  return clean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY);
}

export function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY no configurada en Vercel (sk_test_...). Añádela en Production y haz Redeploy.",
    );
  }
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export function getSiteUrl() {
  const raw = process.env.SITE_URL || process.env.VERCEL_URL || "https://web-josecupra.vercel.app";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw}`.replace(/\/$/, "");
}
