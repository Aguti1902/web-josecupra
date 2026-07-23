import stripePublic from "../../config/stripe.public.json" with { type: "json" };

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export function resolveStripePublishableKey() {
  return clean(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    stripePublic.testPublishableKey,
  );
}

export function resolveStripeMode(publishableKey = resolveStripePublishableKey()) {
  const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return publishableKey.includes("_test_");
}

export { stripePublic };
