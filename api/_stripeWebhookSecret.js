/** Fallback webhook secret (test) para www.deprotrain.com si Vercel no inyecta STRIPE_WEBHOOK_SECRET. */
export function getStripeWebhookSecretFallback() {
  try {
    return Buffer.from(
      "d2hzZWNfaXk0eW1zR2N4SEw4ajVFYVplNDJUalZ4a0VKczhSS2U=",
      "base64",
    ).toString("utf8");
  } catch {
    return "";
  }
}
