import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: "sessionId requerido" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Con trial de 15 días, Stripe no cobra en el checkout: payment_status = "no_payment_required"
    const okStatuses = ["paid", "no_payment_required"];
    if (!okStatuses.includes(session.payment_status)) {
      return res.status(400).json({ error: "Pago no completado" });
    }

    const meta = session.metadata || {};
    const email = meta.email || session.customer_email;
    if (!email) return res.status(400).json({ error: "Email no encontrado en la sesión" });

    // Datos de la suscripción de Stripe (trial de 15 días incluido en create-checkout)
    let stripeSubscriptionId = null;
    let stripeCustomerId = null;
    let subscriptionStatus = "active";
    let trialEndsAt = null;
    if (session.subscription) {
      stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        subscriptionStatus = sub.status;
        trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
      } catch { /* ignore */ }
    }
    if (session.customer) {
      stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    }

    const password = meta.tempPassword || generatePassword();
    const name = meta.nombre || meta.name || email.split("@")[0];

    let userId = null;
    let created = false;

    if (SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const userMeta = {
        name,
        audience: meta.audience || "player",
        role: meta.audience === "club" ? "club" : meta.audience === "coach" ? "coach" : "player",
        plan: meta.plan || "player-essential",
        objetivo: meta.objetivo || "",
        deporte: meta.deporte || "",
        frecuencia: meta.frecuencia || "",
        material: meta.material || "",
        experiencia: meta.experiencia || "",
        edad: meta.edad || "",
        posicion: meta.posicion || "",
        lesion: meta.lesion ? meta.lesion.split("|") : [],
        lesionSubtipo: meta.lesionSubtipo ? meta.lesionSubtipo.split("|") : [],
        disponibles: meta.disponibles ? meta.disponibles.split("|") : [],
        clubCode: meta.clubCode || "",
        clubId: meta.clubId || "",
        subscriptionStatus,
        stripeSubscriptionId,
        stripeCustomerId,
        trialEndsAt,
      };

      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (found) {
        userId = found.id;
        await supabaseAdmin.auth.admin.updateUserById(found.id, {
          user_metadata: { ...found.user_metadata, ...userMeta },
        });
      } else {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: userMeta,
          email_confirm: true,
        });
        if (error) return res.status(400).json({ error: error.message });
        userId = data.user?.id;
        created = true;
      }
    }

    return res.status(200).json({
      ok: true,
      created,
      userId,
      email,
      password: created ? password : null,
      plan: meta.plan,
      trialEndsAt,
    });
  } catch (err) {
    console.error("complete-payment:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
