import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  basic:   { amount: 4900,  name: "DEPRO Plan Básico",   description: "Plan mensual completo + acceso al panel privado" },
  premium: { amount: 11900, name: "DEPRO Plan Premium",  description: "Plan revisado por el preparador + seguimiento continuo" },
};

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

  const clubCode = (formData?.clubCode || "").trim().toUpperCase();
  let clubId = "";
  let hasDiscount = false;
  if (clubCode) {
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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: finalAmount,
            recurring: { interval: "month" },
            product_data: {
              name: price.name,
              description: price.description,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: formData?.email || undefined,
      metadata: {
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
        lesion:       lesionArr.join("|"),
        lesionSubtipo: subArr.join("|"),
        disponibles:  dispArr.join("|"),
        clubCode:     clubCode,
        clubId:       clubId,
        tempPassword,
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
