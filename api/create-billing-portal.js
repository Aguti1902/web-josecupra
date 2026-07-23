import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, origin } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId requerido" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stripe = await getStripe();

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const customerId = userData.user.user_metadata?.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({ error: "No hay cliente Stripe vinculado a esta cuenta" });
    }

    const returnUrl = `${origin || "https://depro.es"}/dashboard/subscription`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    console.error("create-billing-portal:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
