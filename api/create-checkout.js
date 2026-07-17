import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  "coach-starter":   { amount: 1499,  name: "DEPRO Entrenador Starter",   description: "1 equipo · hasta 25 jugadores · microciclo IA" },
  "coach-pro":       { amount: 2999,  name: "DEPRO Entrenador Pro",       description: "3 equipos · hasta 60 jugadores · control de carga" },
  "coach-premium":   { amount: 4999,  name: "DEPRO Entrenador Premium",   description: "Equipos ilimitados · GPS · diagramas IA" },
  "club-inicial":    { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":        { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":      { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential":{ amount: 1999,  name: "DEPRO Jugador Esencial",     description: "Plan mensual IA · panel privado · PDF" },
  "player-pro":      { amount: 3999,  name: "DEPRO Jugador Pro",          description: "Plan IA adaptativo · tests · alertas de carga" },
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
        lesion:       lesionArr.join("|"),
        lesionSubtipo: subArr.join("|"),
        disponibles:  dispArr.join("|"),
        clubName:     formData?.club        || "",
        equipos:      formData?.equipos     || "",
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
