/** Detecta si Stripe está en modo test (sk_test / pk_test o STRIPE_MODE=test). */

export function isStripeTestMode() {
  const forced = (process.env.STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return (process.env.STRIPE_SECRET_KEY || "").includes("_test_");
}
