import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { shouldCancelSubscriptionImmediately } from "../src/lib/subscriptionCancel.js";
import { cancelPlatformSubscriptions } from "./_stripeBillingCleanup.js";

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
    const email = String(userData.user.email || "").toLowerCase();
    const subscriptionId = meta.stripeSubscriptionId || "";
    const customerId = meta.stripeCustomerId || "";

    if (!subscriptionId && !customerId && !email) {
      return res.status(400).json({ error: "No hay suscripción Stripe activa en esta cuenta" });
    }

    let immediate = shouldCancelSubscriptionImmediately({
      status: meta.subscriptionStatus,
      trialEndsAt: meta.trialEndsAt,
    });

    if (subscriptionId) {
      try {
        const current = await stripe.subscriptions.retrieve(subscriptionId);
        immediate = shouldCancelSubscriptionImmediately({
          status: current.status,
          trial_end: current.trial_end,
          trialEndsAt: meta.trialEndsAt,
        });
      } catch { /* usar el estado de metadata */ }
    }

    const result = await cancelPlatformSubscriptions(stripe, {
      email,
      customerId,
      subscriptionId,
      immediate,
    });

    if (result.stillActive) {
      return res.status(409).json({
        error: "No se pudo cancelar todas las suscripciones de Stripe. Inténtalo de nuevo.",
        billing: result,
      });
    }

    const primary = result.canceledIds?.[0] || subscriptionId || null;
    let periodEndIso = immediate ? new Date().toISOString() : null;
    if (!immediate && subscriptionId) {
      try {
        const updated = await stripe.subscriptions.retrieve(subscriptionId);
        if (updated.current_period_end) {
          periodEndIso = new Date(updated.current_period_end * 1000).toISOString();
        }
      } catch { /* keep fallback */ }
    }
    if (!periodEndIso) periodEndIso = new Date().toISOString();

    const nextMeta = immediate
      ? {
          ...meta,
          subscriptionStatus: "canceled",
          subscriptionCancelAt: periodEndIso || new Date().toISOString(),
          trialEndsAt: new Date().toISOString(),
        }
      : {
          ...meta,
          subscriptionStatus: "cancel_at_period_end",
          subscriptionCancelAt: periodEndIso,
        };

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: nextMeta,
    });

    return res.status(200).json({
      ok: true,
      immediate,
      cancelAt: nextMeta.subscriptionCancelAt,
      stripeSubscriptionId: primary,
      canceledCount: result.canceledCount,
    });
  } catch (err) {
    console.error("cancel-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
