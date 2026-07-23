import { createClient } from "@supabase/supabase-js";
import { PRICES, TRIAL_PERIOD_DAYS, buildCheckoutLineItem } from "./_planCatalog.js";
import { getStripe } from "./_stripeClient.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function validateClubCode(code) {
  if (!code || !SERVICE_ROLE_KEY) return { valid: false };
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { planId, formData, origin } = req.body;
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

  const finalAmount = hasDiscount ? Math.round(price.amount * 0.85) : price.amount;
  const tempPassword = generatePassword();
  const lesionArr = formData?.lesion || [];
  const subArr = formData?.lesionSubtipo || [];
  const dispArr = formData?.disponibles || [];

  try {
    const stripe = getStripe();
    const lineItem = buildCheckoutLineItem(planId, finalAmount);
    if (!lineItem) {
      return res.status(400).json({ error: "Plan no válido" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          plan: planId,
          audience,
        },
      },
      line_items: [lineItem],
      customer_email: formData?.email || undefined,
      metadata: {
        audience,
        plan:         planId,
        nombre:       formData?.nombre      || "",
        email:        formData?.email       || "",
        edad:         String(formData?.edad || ""),
        posicion:     formData?.posicion    || "",
        objetivo:     formData?.objetivo    || "",
        deporte:      formData?.deporte     || "",
        frecuencia:   formData?.frecuencia  || "",
        material:     formData?.material    || "",
        experiencia:  formData?.experiencia || "",
        diaCompeticion: formData?.diaCompeticion || "",
        lesion:       lesionArr.join("|"),
        lesionSubtipo: subArr.join("|"),
        disponibles:  dispArr.join("|"),
        clubName:     formData?.club        || "",
        equipos:      formData?.equipos     || "",
        clubCode:     clubCode,
        clubId:       clubId,
        tempPassword,
        billingSource: "stripe",
      },
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/comprar?cancelled=1`,
      locale: "es",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
