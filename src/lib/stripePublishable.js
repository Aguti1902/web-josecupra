import { loadStripe } from "@stripe/stripe-js";
import stripePublic from "../../config/stripe.public.json";

const buildTimeKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.STRIPE_PUBLISHABLE_KEY ||
  "";

let stripePromise;
let resolvedKey = "";
let testModeFlag = null;
let resolvePromise = null;

async function fetchConfig(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Runtime (/api/stripe-config) manda sobre la key embebida en el build.
 * Así evitamos pk_test de build + sesión live de Vercel.
 */
async function resolvePublishableKey() {
  if (resolvedKey) return resolvedKey;
  if (resolvePromise) return resolvePromise;

  resolvePromise = (async () => {
    const api = await fetchConfig("/api/stripe-config");
    if (api?.publishableKey) {
      resolvedKey = api.publishableKey;
      if (api.testMode != null) testModeFlag = api.testMode;
      return resolvedKey;
    }

    const runtime = await fetchConfig("/runtime-config.json");
    if (runtime?.publishableKey) {
      resolvedKey = runtime.publishableKey;
      if (runtime.testMode != null) testModeFlag = runtime.testMode;
      return resolvedKey;
    }

    resolvedKey = buildTimeKey || stripePublic.testPublishableKey;
    return resolvedKey;
  })();

  try {
    return await resolvePromise;
  } finally {
    resolvePromise = null;
  }
}

export function isStripeTestMode() {
  if (testModeFlag != null) return testModeFlag;

  const forced = (import.meta.env.VITE_STRIPE_MODE || import.meta.env.STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return (resolvedKey || buildTimeKey || stripePublic.testPublishableKey || "").includes("_test_");
}

export async function getStripePromise() {
  const key = await resolvePublishableKey();
  if (!key) return null;
  // Si cambia la key en runtime, recrear
  if (!stripePromise || stripePromise.__key !== key) {
    stripePromise = loadStripe(key);
    stripePromise.__key = key;
  }
  return stripePromise;
}
