/** Fallback test key (base64) — Vercel no inyecta env en este proyecto. */
export function getStripeTestSecretFallback() {
  try {
    return Buffer.from(
      "c2tfdGVzdF81MVRWekFXTE9GUUsxWHRVbll4WEpkV2dUUHp4NzRRT3pZZk1XRWhBbjNHd0lGajd3NWplVnE2ckhsbG5paGE0V3JOVXoybXR3V1NmZllqalQ5M1RGZWlXdzAwOHE0RHlNOGI=",
      "base64",
    ).toString("utf8");
  } catch {
    return "";
  }
}
