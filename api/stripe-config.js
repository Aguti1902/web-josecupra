/** Expone la clave publicable de Stripe en runtime. */

import { resolveStripeMode, resolveStripePublishableKey } from "./_stripePublic.js";
import { getStripeModeDiagnostics } from "./_stripeMode.js";

export default function handler(_req, res) {
  const publishableKey = resolveStripePublishableKey();
  const diag = getStripeModeDiagnostics();
  // Ante mismatch, reportar testMode=true (el backend también forzará secret test)
  const testMode = diag.mismatch ? true : resolveStripeMode(publishableKey);

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    publishableKey,
    testMode,
    mismatch: diag.mismatch,
    secretKind: diag.secretKind,
    publishableKind: diag.publishableKind,
    hint: diag.hint,
  });
}
