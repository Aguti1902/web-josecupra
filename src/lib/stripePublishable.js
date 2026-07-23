import { loadStripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;

export function getStripePromise() {
  if (!publishableKey) {
    console.warn("[DEPRO] Falta VITE_STRIPE_PUBLISHABLE_KEY");
    return null;
  }
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}
