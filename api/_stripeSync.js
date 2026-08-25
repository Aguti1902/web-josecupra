import { findUserByStripeCustomer } from "./_supabaseAdmin.js";
import { addonIdsFromSubscriptionItems } from "./_addonCatalog.js";

function planIdFromSubscription(sub) {
  const metaPlan = sub.metadata?.plan;
  if (metaPlan) return metaPlan;
  return null;
}

function subscriptionPayload(sub, extra = {}) {
  const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const cancelAt = sub.cancel_at
    ? new Date(sub.cancel_at * 1000).toISOString()
    : sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

  let subscriptionStatus = sub.status;
  if (sub.cancel_at_period_end && sub.status === "active") {
    subscriptionStatus = "cancel_at_period_end";
  }

  const payload = {
    subscriptionStatus,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    trialEndsAt,
    billingSource: "stripe",
    pendingPayment: false,
    ...extra,
  };

  if (sub.cancel_at_period_end) {
    payload.subscriptionCancelAt = cancelAt;
  } else if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    payload.subscriptionCancelAt = null;
  }

  const planId = planIdFromSubscription(sub);
  if (planId) payload.plan = planId;

  return payload;
}

export async function syncSubscriptionToUser(supabaseAdmin, subscription, emailHint) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  const user = await findUserByStripeCustomer(supabaseAdmin, customerId, emailHint);
  if (!user) return { ok: false, reason: "user_not_found" };

  const meta = user.user_metadata || {};
  const payload = subscriptionPayload(subscription, {});

  const fromItems = addonIdsFromSubscriptionItems(subscription.items?.data || []);
  if (meta.billingSource === "stripe" || meta.stripeSubscriptionId) {
    payload.purchasedAddons = fromItems;
  } else if (fromItems.length) {
    payload.purchasedAddons = Array.from(new Set([...(meta.purchasedAddons || []), ...fromItems]));
  }

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...meta, ...payload },
  });

  return { ok: true, userId: user.id };
}

export async function syncCheckoutSession(supabaseAdmin, session) {
  const meta = session.metadata || {};

  if (meta.type === "addon" && meta.addonId && meta.userId) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(meta.userId);
    if (!userData?.user) return { ok: false, reason: "user_not_found" };
    const existing = userData.user.user_metadata?.purchasedAddons || [];
    const purchasedAddons = existing.includes(meta.addonId)
      ? existing
      : [...existing, meta.addonId];
    await supabaseAdmin.auth.admin.updateUserById(meta.userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        purchasedAddons,
        stripeCustomerId: typeof session.customer === "string"
          ? session.customer
          : userData.user.user_metadata?.stripeCustomerId,
      },
    });
    return { ok: true, userId: meta.userId, addon: meta.addonId };
  }

  const email = meta.email || session.customer_email;
  if (!email) return { ok: false, reason: "no_email" };

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  let subscriptionStatus = "active";
  let trialEndsAt = null;
  let stripeSubscriptionId = null;

  if (session.subscription) {
    stripeSubscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  }

  const payload = {
    name: meta.nombre || meta.name || email.split("@")[0],
    audience: meta.audience || "player",
    role: meta.audience === "club" ? "club" : meta.audience === "coach" ? "coach" : "player",
    plan: meta.plan || "player-essential",
    subscriptionStatus,
    stripeSubscriptionId,
    stripeCustomerId: customerId,
    trialEndsAt,
    billingSource: "stripe",
    pendingPayment: false,
    objetivo: meta.objetivo || "",
    objetivoSecundario: meta.objetivoSecundario || "",
    objetivos: meta.objetivos ? meta.objetivos.split("|") : (meta.objetivoSecundario ? [meta.objetivo, meta.objetivoSecundario].filter(Boolean) : meta.objetivo ? [meta.objetivo] : []),
    deporte: meta.deporte || "",
    frecuencia: meta.frecuencia || "",
    material: meta.material || "",
    experiencia: meta.experiencia || "",
    diaCompeticion: meta.diaCompeticion || "",
    edad: meta.edad || "",
    lesion: meta.lesion ? meta.lesion.split("|") : [],
    lesionSubtipo: meta.lesionSubtipo ? meta.lesionSubtipo.split("|") : [],
    disponibles: meta.disponibles ? meta.disponibles.split("|") : [],
    clubCode: meta.clubCode || "",
    clubId: meta.clubId || "",
    clubName: meta.clubName || meta.club || "",
    primaryColor: meta.primaryColor || "",
    secondaryColor: meta.secondaryColor || "",
  };

  const selectedAddons = meta.selectedAddons
    ? meta.selectedAddons.split("|").map((s) => s.trim()).filter(Boolean)
    : [];

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const found = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (found) {
    const prev = found.user_metadata?.purchasedAddons || [];
    const purchasedAddons = selectedAddons.length
      ? Array.from(new Set([...prev, ...selectedAddons]))
      : undefined;
    await supabaseAdmin.auth.admin.updateUserById(found.id, {
      user_metadata: {
        ...found.user_metadata,
        ...payload,
        ...(purchasedAddons ? { purchasedAddons } : {}),
      },
    });
    return { ok: true, userId: found.id, created: false };
  }

  return { ok: false, reason: "user_not_found_checkout" };
}
