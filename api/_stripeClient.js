import Stripe from "stripe";
import embeddedSecret from "./_stripeSecret.embedded.js";

let _stripe;

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export function getStripeSecretKey() {
  return clean(
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    embeddedSecret,
  );
}

export function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY missing. Add sk_test in Vercel or config/stripe.secrets.test.json and redeploy.",
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
