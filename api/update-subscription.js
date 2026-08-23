import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { PRICES, buildSubscriptionItemUpdate } from "./_planCatalog.js";
import {
  PREMIUM_PLAYER_CAP,
  isPremiumPlanId,
  countPremiumPlayersFromUsers,
  premiumSpotsRemaining,
} from "./_premiumCapacity.js";

/**
 * Cambia el plan de un usuario (upgrade/downgrade) desde su propio dashboard.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, newPlanId } = req.body || {};
  const newPrice = PRICES[newPlanId];
  if (!userId || !newPrice) return res.status(400).json({ error: "Plan o usuario no válido" });

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return res.status(500).json({ error: "Falta configuración del servidor" });
  }

  try {
    const stripe = await getStripe();
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const meta = userData.user.user_metadata || {};
    const currentPlan = meta.plan || null;

    // Upgrade a Premium: respetar cupo de 40 plazas
    if (isPremiumPlanId(newPlanId) && !isPremiumPlanId(currentPlan)) {
      const users = [];
      let page = 1;
      const perPage = 200;
      for (;;) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) break;
        const batch = data?.users || [];
        users.push(...batch);
        if (batch.length < perPage) break;
        page += 1;
        if (page > 50) break;
      }
      const used = countPremiumPlayersFromUsers(users);
      const remaining = premiumSpotsRemaining(used);
      if (remaining <= 0) {
        return res.status(409).json({
          error: `No quedan plazas Premium (máx. ${PREMIUM_PLAYER_CAP}). Vuelve a intentarlo más adelante o contacta con soporte.`,
          remaining: 0,
          cap: PREMIUM_PLAYER_CAP,
        });
      }
    }

    const subscriptionId = meta.stripeSubscriptionId;
    let status = meta.subscriptionStatus || "active";
    let mode = "local";

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const itemId = subscription.items?.data?.[0]?.id;
        if (itemId) {
          const updated = await stripe.subscriptions.update(subscriptionId, {
            items: [buildSubscriptionItemUpdate(newPlanId, itemId)],
            proration_behavior: "create_prorations",
            metadata: { plan: newPlanId },
          });
          status = updated.status;
          mode = "stripe";
        }
      } catch (stripeErr) {
        console.error("update-subscription (Stripe):", stripeErr.message);
        return res.status(500).json({ error: "No se pudo actualizar el pago con Stripe. Inténtalo de nuevo." });
      }
    }

    const audience = newPlanId.split("-")[0];
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, plan: newPlanId, audience, subscriptionStatus: status },
    });

    return res.status(200).json({ ok: true, plan: newPlanId, status, mode });
  } catch (err) {
    console.error("update-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
