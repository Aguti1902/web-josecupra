import { loadStripe } from "@stripe/stripe-js";

const buildTimeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;
let resolvedKey = buildTimeKey || "";
let testModeFlag = null;

async function fetchConfig(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function resolvePublishableKey() {
  if (resolvedKey) return resolvedKey;

  const runtime = await fetchConfig("/runtime-config.json");
  if (runtime?.publishableKey) {
    resolvedKey = runtime.publishableKey;
    if (runtime.testMode != null) testModeFlag = runtime.testMode;
    return resolvedKey;
  }

  const api = await fetchConfig("/api/stripe-config");
  if (api?.publishableKey) {
    resolvedKey = api.publishableKey;
    if (api.testMode != null) testModeFlag = api.testMode;
    return resolvedKey;
  }

  return "";
}

export function isStripeTestMode() {
  if (testModeFlag != null) return testModeFlag;

  const forced = (import.meta.env.VITE_STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return (resolvedKey || buildTimeKey || "").includes("_test_");
}

export async function getStripePromise() {
  const key = await resolvePublishableKey();
  if (!key) {
    console.warn("[DEPRO] Falta clave publicable Stripe — revisa Vercel env y redeploy");
    return null;
  }
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}
