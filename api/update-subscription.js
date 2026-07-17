import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PRICES } from "./_planCatalog.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cambia el plan de un usuario (upgrade/downgrade) desde su propio dashboard.
 * - Si el usuario tiene una suscripción Stripe activa (stripeSubscriptionId en su
 *   metadata), se actualiza el importe de esa suscripción con prorrateo automático.
 * - Si no la tiene (cuentas creadas por el admin sin checkout de Stripe todavía),
 *   el cambio se guarda directamente en la metadata de Supabase — modo "local".
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, newPlanId } = req.body || {};
  const newPrice = PRICES[newPlanId];
  if (!userId || !newPrice) return res.status(400).json({ error: "Plan o usuario no válido" });
  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: "Falta configuración del servidor" });

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const meta = userData.user.user_metadata || {};
    const subscriptionId = meta.stripeSubscriptionId;
    let status = meta.subscriptionStatus || "active";
    let mode = "local";

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const itemId = subscription.items?.data?.[0]?.id;
        if (itemId) {
          const updated = await stripe.subscriptions.update(subscriptionId, {
            items: [
              {
                id: itemId,
                price_data: {
                  currency: "eur",
                  unit_amount: newPrice.amount,
                  recurring: { interval: "month" },
                  product_data: { name: newPrice.name, description: newPrice.description },
                },
              },
            ],
            proration_behavior: "create_prorations",
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
