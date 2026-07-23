/** Expone la clave publicable de Stripe en runtime. */

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export default function handler(_req, res) {
  const publishableKey = clean(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
  const testMode =
    forced === "test" ||
    (forced !== "live" && publishableKey.includes("_test_"));

  if (!publishableKey) {
    return res.status(503).json({
      error: "Stripe publishable key no configurada",
      hint: "Añade VITE_STRIPE_PUBLISHABLE_KEY (pk_test_...) en Vercel → Environment Variables → Production, luego Redeploy.",
    });
  }

  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).json({ publishableKey, testMode });
}
