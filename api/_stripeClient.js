import Stripe from "stripe";
import embeddedSecret from "./_stripeSecret.embedded.js";
import { loadStripeSecretFromSupabase } from "./_stripeSecretLoader.js";

let _stripe;

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function readEmbeddedSecret() {
  return clean(embeddedSecret);
}

export function getStripeSecretKeySync() {
  return clean(
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    readEmbeddedSecret(),
  );
}

export async function getStripeSecretKey() {
  const fromEnv = getStripeSecretKeySync();
  if (fromEnv) return fromEnv;
  return loadStripeSecretFromSupabase();
}

export async function getStripe() {
  const key = await getStripeSecretKey();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY missing. Guardala en Supabase app_secrets o configura Vercel y redeploy.",
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
