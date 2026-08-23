import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId, authUserId: bodyAuthUserId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: "sessionId requerido" });

  try {
    const stripe = await getStripe();
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
        if (meta.skipTrial === "1" || !sub.trial_end) {
          subscriptionStatus = subscriptionStatus === "trialing" ? "active" : subscriptionStatus;
          trialEndsAt = null;
        }
      } catch { /* ignore */ }
    }
    if (session.customer) {
      stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    }

    const authUserId = bodyAuthUserId || meta.authUserId || null;
    const password = meta.tempPassword || generatePassword();
    const name = meta.nombre || meta.name || email.split("@")[0];

    let userId = null;
    let created = false;

    try {
      const supabaseAdmin = getSupabaseAdmin();

      const userMeta = {
        name,
        audience: meta.audience || "player",
        role: meta.audience === "club" ? "club" : meta.audience === "coach" ? "coach" : "player",
        plan: meta.plan || "player-essential",
        objetivo: meta.objetivo || "",
        objetivoSecundario: meta.objetivoSecundario || "",
        objetivos: meta.objetivos
          ? meta.objetivos.split("|")
          : (meta.objetivoSecundario ? [meta.objetivo, meta.objetivoSecundario].filter(Boolean) : meta.objetivo ? [meta.objetivo] : []),
        deporte: meta.deporte || "",
        frecuencia: meta.frecuencia || "",
        material: meta.material || "",
        experiencia: meta.experiencia || "",
        diaCompeticion: meta.diaCompeticion || "",
        edad: meta.edad || "",
        phone: meta.phone || meta.telefono || "",
        telefono: meta.phone || meta.telefono || "",
        lesion: meta.lesion ? meta.lesion.split("|") : [],
        lesionSubtipo: meta.lesionSubtipo ? meta.lesionSubtipo.split("|") : [],
        disponibles: meta.disponibles ? meta.disponibles.split("|") : [],
        clubCode: meta.clubCode || "",
        clubId: meta.clubId || "",
        teamId: meta.teamId || "",
        clubName: meta.clubName || meta.club || "",
        primaryColor: meta.primaryColor || "",
        secondaryColor: meta.secondaryColor || "",
        subscriptionStatus,
        stripeSubscriptionId,
        stripeCustomerId,
        trialEndsAt,
        skippedTrial: !trialEndsAt && subscriptionStatus !== "trialing",
        billingSource: "stripe",
        coachAuto: meta.coachAuto || "",
        // Premium: rutina pendiente de intervención humana
        planPendingManual: meta.plan === "player-pro" || meta.plan === "premium",
      };

      const selectedAddons = meta.selectedAddons
        ? meta.selectedAddons.split("|").map((s) => s.trim()).filter(Boolean)
        : [];

      const mergeAddons = (prev = []) => {
        if (!selectedAddons.length) return undefined;
        return Array.from(new Set([...(Array.isArray(prev) ? prev : []), ...selectedAddons]));
      };

      if (authUserId) {
        const { data: byId, error: getErr } = await supabaseAdmin.auth.admin.getUserById(authUserId);
        if (getErr) return res.status(400).json({ error: getErr.message });
        if (!byId?.user) return res.status(404).json({ error: "Usuario no encontrado" });
        userId = byId.user.id;
        const purchasedAddons = mergeAddons(byId.user.user_metadata?.purchasedAddons);
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...byId.user.user_metadata,
            ...userMeta,
            ...(purchasedAddons ? { purchasedAddons } : {}),
          },
        });
      } else {
        const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
        const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        if (found) {
          userId = found.id;
          const purchasedAddons = mergeAddons(found.user_metadata?.purchasedAddons);
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            user_metadata: {
              ...found.user_metadata,
              ...userMeta,
              ...(purchasedAddons ? { purchasedAddons } : {}),
            },
          });
        } else {
          const purchasedAddons = mergeAddons([]);
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: {
              ...userMeta,
              ...(purchasedAddons ? { purchasedAddons } : {}),
            },
            email_confirm: true,
          });
          if (error) return res.status(400).json({ error: error.message });
          userId = data.user?.id;
          created = true;
        }
      }
    } catch (adminErr) {
      console.error("complete-payment supabase:", adminErr.message);
      return res.status(500).json({ error: adminErr.message || "Error al activar la cuenta" });
    }

    return res.status(200).json({
      ok: true,
      created,
      userId,
      email,
      password: created ? password : null,
      plan: meta.plan,
      clubId: meta.clubId || "",
      teamId: meta.teamId || "",
      name,
      subscriptionStatus,
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
