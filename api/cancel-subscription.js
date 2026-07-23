import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId requerido" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stripe = await getStripe();

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const meta = userData.user.user_metadata || {};
    const subscriptionId = meta.stripeSubscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({ error: "No hay suscripción Stripe activa en esta cuenta" });
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const cancelAt = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toISOString()
      : null;

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        subscriptionStatus: "cancel_at_period_end",
        subscriptionCancelAt: cancelAt,
      },
    });

    return res.status(200).json({
      ok: true,
      cancelAt,
      stripeSubscriptionId: subscriptionId,
    });
  } catch (err) {
    console.error("cancel-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
