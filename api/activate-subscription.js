import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId requerido" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const meta = userData.user.user_metadata || {};
    const subscriptionId = meta.stripeSubscriptionId;
    if (!subscriptionId) {
      return res.status(400).json({ error: "No hay suscripción Stripe asociada" });
    }

    const stripe = await getStripe();
    const updated = await stripe.subscriptions.update(subscriptionId, {
      trial_end: "now",
      proration_behavior: "create_prorations",
    });

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        subscriptionStatus: updated.status === "trialing" ? "active" : updated.status,
        trialEndsAt: null,
        skippedTrial: true,
      },
    });

    return res.status(200).json({
      ok: true,
      plan: meta.plan,
      status: updated.status,
    });
  } catch (err) {
    console.error("activate-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
