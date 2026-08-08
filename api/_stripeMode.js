/** Detecta si Stripe está en modo test (sk_test / pk_test o STRIPE_MODE=test). */

import { getStripeTestSecretFallback } from "./_stripeTestKey.js";
import { resolveStripePublishableKey } from "./_stripePublic.js";

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function keyKind(key = "") {
  const k = clean(key);
  if (k.includes("_live_")) return "live";
  if (k.includes("_test_")) return "test";
  return "unknown";
}

export function getConfiguredSecretKeyHint() {
  return clean(
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    getStripeTestSecretFallback() ||
    "",
  );
}

/**
 * Diagnóstico de modos (sin exponer secretos).
 * Si hay secret live + publishable test → mismatch (causa el error de Embedded Checkout).
 */
export function getStripeModeDiagnostics() {
  const secret = getConfiguredSecretKeyHint();
  const publishable = resolveStripePublishableKey();
  const forced = clean(process.env.STRIPE_MODE || process.env.VITE_STRIPE_MODE).toLowerCase();
  const secretKind = keyKind(secret);
  const publishableKind = keyKind(publishable);
  const mismatch = secretKind === "live" && publishableKind === "test";

  return {
    forcedMode: forced || null,
    secretKind,
    publishableKind,
    mismatch,
    hint: mismatch
      ? "Secret live + publishable test: el checkout no puede cargar. Se forzará modo test hasta que configures pk_live_... o vuelvas a sk_test_..."
      : null,
  };
}

/**
 * Modo efectivo para precios y sesiones.
 * Ante mismatch live-secret/test-publishable → test (para que Embedded Checkout funcione).
 */
export function isStripeTestMode() {
  const diag = getStripeModeDiagnostics();
  if (diag.mismatch) return true;

  const forced = (process.env.STRIPE_MODE || "").toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;

  if (diag.secretKind === "live") return false;
  if (diag.secretKind === "test") return true;
  return diag.publishableKind !== "live";
}

export { keyKind };
