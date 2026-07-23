/** Expone la clave publicable de Stripe en runtime. */

import { resolveStripeMode, resolveStripePublishableKey } from "./_stripePublic.js";

export default function handler(_req, res) {
  const publishableKey = resolveStripePublishableKey();
  const testMode = resolveStripeMode(publishableKey);

  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).json({ publishableKey, testMode });
}
