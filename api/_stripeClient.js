import Stripe from "stripe";
import embeddedSecret from "./_stripeSecret.embedded.js";
import { loadStripeSecretFromSupabase } from "./_stripeSecretLoader.js";
import { getStripeTestSecretFallback } from "./_stripeTestKey.js";
import { getStripeModeDiagnostics } from "./_stripeMode.js";
import { resolveStripePublishableKey } from "./_stripePublic.js";

let _stripe;
let _stripeKeyUsed = "";

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
    readEmbeddedSecret() ||
    getStripeTestSecretFallback(),
  );
}

/**
 * Resuelve la secret key alineada con la publishable.
 * Si hay sk_live + pk_test, usa fallback test para evitar
 * "checkout session requires a live key, but a test key was used".
 */
export async function getStripeSecretKey() {
  const diag = getStripeModeDiagnostics();
  const fromEnv = getStripeSecretKeySync();
  const publishable = resolveStripePublishableKey();
  const pubIsTest = publishable.includes("_test_");
  const secretIsLive = fromEnv.includes("_live_");

  if (secretIsLive && pubIsTest) {
    const testKey = clean(
      process.env.STRIPE_TEST_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY_TEST ||
      getStripeTestSecretFallback() ||
      "",
    );
    if (testKey) {
      console.warn(
        "[DEPRO Stripe] mismatch live secret + test publishable → usando secret test para Embedded Checkout.",
        diag.hint,
      );
      return testKey;
    }
  }

  if (fromEnv) return fromEnv;
  const fromDb = await loadStripeSecretFromSupabase();
  if (fromDb) return fromDb;
  return getStripeTestSecretFallback();
}

export async function getStripe() {
  const key = await getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY no disponible.");
  }
  // Recrear cliente si cambió la key (p. ej. mismatch → test)
  if (!_stripe || _stripeKeyUsed !== key) {
    _stripe = new Stripe(key);
    _stripeKeyUsed = key;
  }
  return _stripe;
}

/** Dominio canónico de producción (fallback si falta SITE_URL en Vercel). */
export const DEFAULT_SITE_URL = "https://www.deprotrain.com";

export function getSiteUrl() {
  // No usar VERCEL_URL: en Production es un *.vercel.app efímero y rompe return_url / webhooks.
  const raw = clean(process.env.SITE_URL) || DEFAULT_SITE_URL;
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw}`.replace(/\/$/, "");
}
