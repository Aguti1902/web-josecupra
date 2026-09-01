import { PRICES, TRIAL_PERIOD_DAYS, buildCheckoutLineItem, planHasCheckoutTrial } from "./_planCatalog.js";
import { buildAddonLineItem, getAddonDef } from "./_addonCatalog.js";
import { getStripe, getSiteUrl } from "./_stripeClient.js";
import { centsAfterClubPct, clubCommissionPct } from "../src/lib/clubEconomy.js";
import { serializeCoachAutoForMeta } from "../src/lib/clubAuto/clubAutoCoachBridge.js";
import { isClubSelfServeOpen, isClubCheckoutPlan, CLUB_COMING_SOON_COPY } from "../src/lib/productAvailability.js";
import { lookupClubByDiscountCode } from "./_clubReferrals.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function validateClubCode(code) {
  if (!code) return { valid: false };
  try {
    const admin = getSupabaseAdmin();
    const found = await lookupClubByDiscountCode(admin, code);
    if (found?.valid) return found;
  } catch { /* ignore */ }
  return { valid: false };
}

function buildSessionBase({ planId, audience, formData, clubCode, clubId, tempPassword, lineItems, clubCommissionPct: pct }) {
  const lesionArr = formData?.lesion || [];
  const subArr = formData?.lesionSubtipo || [];
  const dispArr = formData?.disponibles || [];
  // Prueba gratis 15 días: Standard jugador y Standard entrenador. Premium y clubs se cobran al confirmar.
  const withTrial = planHasCheckoutTrial(planId);

  const subscriptionData = {
    metadata: {
      plan: planId,
      audience,
      clubCode: clubCode || "",
      clubId: clubId || "",
      teamId: "",
      email: formData?.email || "",
      nombre: formData?.nombre || "",
      phone: String(formData?.phone || formData?.telefono || "").trim(),
      selectedAddons: (formData?.selectedAddons || []).join("|"),
      clubCommissionPct: pct != null && pct !== "" ? String(pct) : "",
    },
  };
  if (withTrial) {
    subscriptionData.trial_period_days = TRIAL_PERIOD_DAYS;
  }

  return {
    // Wallets (Apple Pay / Google Pay): Stripe los ofrece si el dominio está verificado
    // y el método está activo en el Dashboard. No usar automatic_payment_methods aquí
    // (es de PaymentIntents; Checkout Session lo rechaza).
    mode: "subscription",
    // Siempre pedir tarjeta aunque el trial sea 0 € hoy (no permitir checkout sin PM).
    payment_method_collection: "always",
    subscription_data: subscriptionData,
    line_items: lineItems,
    customer_email: formData?.email || undefined,
    metadata: {
      audience,
      plan: planId,
      nombre: formData?.nombre || "",
      email: formData?.email || "",
      phone: String(formData?.phone || formData?.telefono || "").trim(),
      telefono: String(formData?.phone || formData?.telefono || "").trim(),
      edad: String(formData?.edad || ""),
      objetivo: formData?.objetivo || (formData?.objetivos?.[0] || ""),
      objetivoSecundario: formData?.objetivoSecundario || (formData?.objetivos?.[1] || ""),
      objetivos: (formData?.objetivos || [formData?.objetivo, formData?.objetivoSecundario].filter(Boolean)).join("|"),
      deporte: formData?.deporte || "",
      frecuencia: formData?.frecuencia || "",
      material: formData?.material || "",
      experiencia: formData?.experiencia || "",
      diaCompeticion: formData?.diaCompeticion || "",
      lesion: lesionArr.join("|"),
      lesionSubtipo: subArr.join("|"),
      disponibles: dispArr.join("|"),
      selectedAddons: (formData?.selectedAddons || []).join("|"),
      clubName: formData?.club || "",
      equipos: formData?.equipos || "",
      clubCode,
      clubId,
      clubCommissionPct: pct != null && pct !== "" ? String(pct) : "",
      teamId: "",
      authUserId: formData?.authUserId || "",
      tempPassword,
      billingSource: "stripe",
      // Colores (hex cortos; el escudo va en localStorage, no cabe en metadata)
      primaryColor: formData?.primaryColor || "",
      secondaryColor: formData?.secondaryColor || "",
      coachAuto: serializeCoachAutoForMeta(formData?.coachAuto),
    },
    locale: "es",
  };
}

function buildLineItems(planId, finalAmount, formData, discountPct = 0) {
  const planItem = buildCheckoutLineItem(planId, finalAmount);
  if (!planItem) return null;
  const items = [planItem];
  const selected = Array.isArray(formData?.selectedAddons) ? formData.selectedAddons : [];
  const pct = Number(discountPct) || 0;
  for (const addonId of selected) {
    const def = getAddonDef(addonId);
    if (!def) continue;
    const addonAmount = pct > 0 ? centsAfterClubPct(def.amount, pct) : def.amount;
    const addonItem = buildAddonLineItem(addonId, addonAmount);
    if (addonItem) items.push(addonItem);
  }
  return items;
}

async function createCheckoutSession(stripe, params, embedded, origin) {
  const site = origin || getSiteUrl();

  if (embedded) {
    // Stripe 2026: ui_mode "embedded_page" (pares con createEmbeddedCheckoutPage).
    // Fallback a "embedded" por si la cuenta/API aún usa el valor antiguo.
    const returnUrl = `${site}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`;
    try {
      return await stripe.checkout.sessions.create({
        ...params,
        ui_mode: "embedded_page",
        return_url: returnUrl,
      });
    } catch (err) {
      if (!String(err.message).includes("ui_mode")) throw err;
      return stripe.checkout.sessions.create({
        ...params,
        ui_mode: "embedded",
        return_url: returnUrl,
      });
    }
  }

  return stripe.checkout.sessions.create({
    ...params,
    success_url: `${site}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/comprar?cancelled=1`,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { planId, formData, origin, embedded = true } = req.body;
  const price = PRICES[planId];

  if (!price) {
    return res.status(400).json({ error: "Plan no válido" });
  }

  const audience = formData?.audience || planId.split("-")[0] || "player";
  if (!isClubSelfServeOpen() && isClubCheckoutPlan(planId, audience)) {
    return res.status(403).json({ error: CLUB_COMING_SOON_COPY });
  }
  const clubCode = (formData?.clubCode || "").trim().toUpperCase();
  let clubId = "";
  let hasDiscount = false;
  let discountPct = 0;
  if (clubCode && audience === "player") {
    const v = await validateClubCode(clubCode);
    hasDiscount = v.valid;
    clubId = v.clubId || "";
    discountPct = hasDiscount ? clubCommissionPct({ referralCommissionPct: v.commissionPct }) : 0;
  }

  const finalAmount = hasDiscount ? centsAfterClubPct(price.amount, discountPct) : price.amount;
  const chosenPassword = formData?.password || formData?.pendingPassword || "";
  const tempPassword = typeof chosenPassword === "string" && chosenPassword.length >= 8
    ? chosenPassword
    : generatePassword();

  try {
    const stripe = await getStripe();
    const lineItems = buildLineItems(planId, finalAmount, formData, hasDiscount ? discountPct : 0);
    if (!lineItems?.length) {
      return res.status(400).json({ error: "Plan no válido" });
    }

    const session = await createCheckoutSession(
      stripe,
      buildSessionBase({
        planId, audience, formData, clubCode, clubId, tempPassword, lineItems,
        clubCommissionPct: hasDiscount ? discountPct : "",
      }),
      embedded,
      origin,
    );

    if (embedded) {
      if (!session.client_secret) {
        return res.status(500).json({ error: "Stripe no devolvió client_secret para checkout embebido" });
      }
      return res.status(200).json({ clientSecret: session.client_secret });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
