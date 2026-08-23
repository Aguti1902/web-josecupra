import { getStripe, getSiteUrl } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

/** Alineado con src/lib/playerAddons.js (ids actuales + legacy). */
const ADDONS = {
  "addon-pdf": { name: "Descarga en PDF DEPRO", amount: 500, featureId: "pdf_export" },
  "addon-cargas": { name: "Mis cargas DEPRO", amount: 500, featureId: "cargas" },
  "addon-progression": { name: "Tests con registro DEPRO", amount: 500, featureId: "physical_tests" },
  "addon-unlimited-exercises": { name: "Ejercicios ilimitados + carpeta", amount: 500, featureId: "unlimited_exercises" },
  // Legacy
  "addon-library": { name: "Biblioteca ampliada DEPRO", amount: 500, featureId: "exercise_library" },
  "addon-physical-tests": { name: "Tests físicos DEPRO", amount: 500, featureId: "physical_tests" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { addonId, userId, email, origin } = req.body || {};
  const addon = ADDONS[addonId];
  if (!addon || !userId || !email) {
    return res.status(400).json({ error: "Datos de extra no válidos" });
  }

  try {
    const stripe = await getStripe();
    const site = origin || getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: addon.amount,
          recurring: { interval: "month" },
          product_data: { name: addon.name },
        },
        quantity: 1,
      }],
      metadata: {
        type: "addon",
        addonId,
        featureId: addon.featureId,
        userId,
        email,
      },
      success_url: `${site}/dashboard/subscription?addon_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/dashboard/subscription?addon_cancel=1`,
      locale: "es",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-addon-checkout:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
