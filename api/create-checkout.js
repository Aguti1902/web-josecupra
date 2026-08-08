import { createClient } from "@supabase/supabase-js";
import { PRICES, TRIAL_PERIOD_DAYS, buildCheckoutLineItem } from "./_planCatalog.js";
import { getStripe, getSiteUrl } from "./_stripeClient.js";
import { SUPABASE_SERVICE_ROLE_FALLBACK } from "./_serviceRoleKey.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_FALLBACK;

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function validateClubCode(code) {
  if (!code) return { valid: false };
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: clubs } = await sb.from("clubs").select("id, login_code").eq("login_code", code.toUpperCase()).limit(1);
    if (clubs?.length) return { valid: true, clubId: clubs[0].id };
    const { data: details } = await sb.from("clubs_detail").select("id, data");
    const found = (details || []).find((d) => {
      const lc = d.data?.loginCode || d.data?.login_code;
      return lc && String(lc).toUpperCase() === code.toUpperCase();
    });
    if (found) return { valid: true, clubId: found.id };
  } catch { /* ignore */ }
  return { valid: false };
}

function buildSessionBase({ planId, audience, formData, clubCode, clubId, tempPassword, finalAmount, lineItem }) {
  const lesionArr = formData?.lesion || [];
  const subArr = formData?.lesionSubtipo || [];
  const dispArr = formData?.disponibles || [];

  return {
    // Wallets (Apple Pay / Google Pay): Stripe los ofrece si el dominio está verificado
    // y el método está activo en el Dashboard. No usar automatic_payment_methods aquí
    // (es de PaymentIntents; Checkout Session lo rechaza).
    mode: "subscription",
    // Siempre pedir tarjeta aunque el trial sea 0 € hoy (no permitir checkout sin PM).
    payment_method_collection: "always",
    subscription_data: {
      trial_period_days: TRIAL_PERIOD_DAYS,
      metadata: {
        plan: planId,
        audience,
        clubCode: clubCode || "",
        clubId: clubId || "",
        teamId: formData?.clubTeamId || formData?.teamId || "",
        email: formData?.email || "",
        nombre: formData?.nombre || "",
      },
    },
    line_items: [lineItem],
    customer_email: formData?.email || undefined,
    metadata: {
      audience,
      plan: planId,
      nombre: formData?.nombre || "",
      email: formData?.email || "",
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
      teamId: formData?.clubTeamId || formData?.teamId || "",
      authUserId: formData?.authUserId || "",
      tempPassword,
      billingSource: "stripe",
      // Colores (hex cortos; el escudo va en localStorage, no cabe en metadata)
      primaryColor: formData?.primaryColor || "",
      secondaryColor: formData?.secondaryColor || "",
    },
    locale: "es",
  };
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
  const clubCode = (formData?.clubCode || "").trim().toUpperCase();
  let clubId = "";
  let hasDiscount = false;
  if (clubCode && audience === "player") {
    const v = await validateClubCode(clubCode);
    hasDiscount = v.valid;
    clubId = v.clubId || "";
  }

  const finalAmount = hasDiscount ? Math.round(price.amount * 0.90) : price.amount;
  const hasRegisteredUser = Boolean(formData?.authUserId);
  // Usuario se crea solo en complete-payment; aquí guardamos la contraseña elegida (o una temporal).
  const chosenPassword = formData?.password || formData?.pendingPassword || "";
  const tempPassword = hasRegisteredUser
    ? ""
    : (typeof chosenPassword === "string" && chosenPassword.length >= 8
      ? chosenPassword
      : generatePassword());

  try {
    const stripe = await getStripe();
    const lineItem = buildCheckoutLineItem(planId, finalAmount);
    if (!lineItem) {
      return res.status(400).json({ error: "Plan no válido" });
    }

    const session = await createCheckoutSession(
      stripe,
      buildSessionBase({ planId, audience, formData, clubCode, clubId, tempPassword, finalAmount, lineItem }),
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
