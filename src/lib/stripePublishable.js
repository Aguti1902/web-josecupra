import { loadStripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;

export function isStripeTestMode() {
  const forced = (import.meta.env.VITE_STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return (publishableKey || "").includes("_test_");
}

export function getStripePromise() {
  if (!publishableKey) {
    console.warn("[DEPRO] Falta VITE_STRIPE_PUBLISHABLE_KEY");
    return null;
  }
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}
