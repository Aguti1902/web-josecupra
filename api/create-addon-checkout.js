import { getStripe, getSiteUrl } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { getAddonDef, buildAddonLineItem, resolveAddonId } from "./_addonCatalog.js";
import { resolveClubEconomy } from "./_clubReferrals.js";
import { centsAfterClubPct, clubCommissionPct } from "../src/lib/clubEconomy.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { addonId, userId, email, origin } = req.body || {};
  const def = getAddonDef(addonId);
  if (!def || !userId || !email) {
    return res.status(400).json({ error: "Datos de extra no válidos" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stripe = await getStripe();
    const site = origin || getSiteUrl();
    const resolvedId = resolveAddonId(addonId);

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const meta = userData?.user?.user_metadata || {};
    const customerId = meta.stripeCustomerId || null;

    let addonAmount = def.amount;
    if (meta.clubId || meta.clubCode) {
      try {
        const club = await resolveClubEconomy(supabaseAdmin, {
          clubId: meta.clubId,
          clubCode: meta.clubCode,
        });
        if (club?.id) addonAmount = centsAfterClubPct(def.amount, clubCommissionPct(club));
      } catch { /* precio de catálogo */ }
    }

    const lineItem = buildAddonLineItem(resolvedId, addonAmount);
    if (!lineItem) return res.status(400).json({ error: "Extra no disponible" });

    const clubMeta = {
      type: "addon",
      addonId: resolvedId,
      featureId: def.featureId,
      userId,
      email,
      audience: meta.audience || "player",
      clubId: meta.clubId || "",
      clubCode: meta.clubCode || "",
      nombre: meta.name || "",
      plan: meta.plan || "",
    };

    const sessionParams = {
      mode: "subscription",
      payment_method_collection: "always",
      line_items: [lineItem],
      metadata: clubMeta,
      subscription_data: { metadata: clubMeta },
      success_url: `${site}/dashboard/subscription?addon_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/dashboard/subscription?addon_cancel=1`,
      locale: "es",
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-addon-checkout:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
