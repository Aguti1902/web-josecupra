/** Clave publicable TEST (segura en cliente). Fallback si Vercel no inyecta env. */

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export const STRIPE_TEST_PUBLISHABLE_KEY =
  "pk_test_51TVzAWL0FQK1XtUnkAE6it45JKwnJnF2fDTrUYYcNDzmey00viN4Iaji4yM753tQVB1wvuURdKhDPF5xv2DGtpJf00HrLOieCX";

export function resolveStripePublishableKey() {
  return clean(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    STRIPE_TEST_PUBLISHABLE_KEY,
  );
}

export function resolveStripeMode(publishableKey = resolveStripePublishableKey()) {
  const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return publishableKey.includes("_test_");
}
