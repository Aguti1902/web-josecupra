/** Diagnóstico: qué env vars Stripe llegan a Vercel (solo nombres, sin valores). */

export default function handler(_req, res) {
  const names = Object.keys(process.env).filter((k) =>
    /STRIPE|VITE_STRIPE|SITE_URL|VERCEL_URL/i.test(k),
  );

  const has = {
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    STRIPE_PUBLISHABLE_KEY: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    VITE_STRIPE_PUBLISHABLE_KEY: Boolean(process.env.VITE_STRIPE_PUBLISHABLE_KEY),
    STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    STRIPE_MODE: Boolean(process.env.STRIPE_MODE),
    VITE_STRIPE_MODE: Boolean(process.env.VITE_STRIPE_MODE),
    SITE_URL: Boolean(process.env.SITE_URL),
    VERCEL_URL: Boolean(process.env.VERCEL_URL),
  };

  return res.status(200).json({
    stripeEnvPresent: has,
    matchingEnvNames: names.sort(),
    hint: !has.STRIPE_SECRET_KEY
      ? "Falta STRIPE_SECRET_KEY (sk_test_...) — el checkout no puede crear sesiones sin ella."
      : "Stripe secret presente.",
  });
}
