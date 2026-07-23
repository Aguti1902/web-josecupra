/** Expone la clave publicable de Stripe en runtime (Vercel no siempre la embebe en el build). */

export default function handler(_req, res) {
  const publishableKey =
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    "";

  const forced = (process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE || "").toLowerCase();
  const testMode =
    forced === "test" ||
    (forced !== "live" && publishableKey.includes("_test_"));

  if (!publishableKey) {
    return res.status(503).json({ error: "Stripe publishable key no configurada" });
  }

  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).json({ publishableKey, testMode });
}
