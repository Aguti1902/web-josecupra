import { loadStripe } from "@stripe/stripe-js";

const buildTimeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;
let resolvedKey = buildTimeKey || "";
let testModeFlag = null;

async function resolvePublishableKey() {
  if (resolvedKey) return resolvedKey;

  try {
    const res = await fetch("/api/stripe-config");
    if (!res.ok) return "";
    const data = await res.json();
    resolvedKey = data.publishableKey || "";
    if (data.testMode != null) testModeFlag = data.testMode;
    return resolvedKey;
  } catch {
    return "";
  }
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
    console.warn("[DEPRO] Falta VITE_STRIPE_PUBLISHABLE_KEY (build y /api/stripe-config)");
    return null;
  }
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}
