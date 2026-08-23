import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import {
  getAddonDef,
  getStripeAddonPriceId,
  buildAddonLineItem,
  addonIdsFromSubscriptionItems,
  resolveAddonId,
} from "./_addonCatalog.js";

function mergePurchasedAddons(existing = [], addonId) {
  const id = resolveAddonId(addonId);
  const set = new Set(Array.isArray(existing) ? existing : []);
  set.add(id);
  return [...set];
}

/**
 * Añade un extra a la suscripción Stripe existente del jugador (prorrateo).
 * POST { userId, addonId }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, addonId } = req.body || {};
  const def = getAddonDef(addonId);
  if (!userId || !def) {
    return res.status(400).json({ error: "Datos de extra no válidos" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stripe = await getStripe();
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const meta = userData.user.user_metadata || {};
    const resolvedId = resolveAddonId(addonId);
    const owned = meta.purchasedAddons || [];
    if (owned.includes(resolvedId)) {
      return res.status(200).json({ ok: true, addonId: resolvedId, alreadyOwned: true });
    }

    const subscriptionId = meta.stripeSubscriptionId;
    if (!subscriptionId) {
      return res.status(409).json({
        error: "no_subscription",
        message: "Sin suscripción Stripe activa. Usa checkout de extra.",
      });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const existingAddonIds = addonIdsFromSubscriptionItems(subscription.items?.data || []);
    if (existingAddonIds.includes(resolvedId)) {
      const purchasedAddons = mergePurchasedAddons(owned, resolvedId);
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...meta, purchasedAddons },
      });
      return res.status(200).json({ ok: true, addonId: resolvedId, synced: true });
    }

    const priceId = getStripeAddonPriceId(resolvedId);
    const lineItem = buildAddonLineItem(resolvedId);
    if (!lineItem) return res.status(400).json({ error: "Extra no configurado en Stripe" });

    const extraItem = lineItem.price
      ? { price: lineItem.price, quantity: 1 }
      : lineItem;

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        ...subscription.items.data.map((item) => ({ id: item.id })),
        extraItem,
      ],
      proration_behavior: "create_prorations",
      expand: ["items.data.price.product"],
    });

    const purchasedAddons = addonIdsFromSubscriptionItems(updated.items?.data || []);
    // Conservar extras legacy/metadata no reflejados en items
    const merged = Array.from(new Set([...(owned || []), ...purchasedAddons]));

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        purchasedAddons: merged,
        stripeCustomerId: typeof updated.customer === "string"
          ? updated.customer
          : meta.stripeCustomerId,
        stripeSubscriptionId: updated.id,
      },
    });

    return res.status(200).json({ ok: true, addonId: resolvedId, mode: "subscription_item" });
  } catch (err) {
    console.error("add-addon-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
