import { getStripe, getSiteUrl } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

const ADDONS = {
  "addon-pdf": { name: "Export PDF DEPRO", amount: 500, featureId: "pdf_export" },
  "addon-progression": { name: "Progresión avanzada DEPRO", amount: 500, featureId: "progression" },
  "addon-library": { name: "Biblioteca ampliada DEPRO", amount: 500, featureId: "exercise_library" },
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
