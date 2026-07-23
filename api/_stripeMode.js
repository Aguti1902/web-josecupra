/** Detecta si Stripe está en modo test (sk_test / pk_test o STRIPE_MODE=test). */

import { getStripeTestSecretFallback } from "./_stripeTestKey.js";

function secretKeyHint() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    getStripeTestSecretFallback() ||
    ""
  );
}

export function isStripeTestMode() {
  const forced = (process.env.STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return secretKeyHint().includes("_test_");
}
