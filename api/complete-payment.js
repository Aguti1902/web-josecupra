import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin, findUserByEmail } from "./_supabaseAdmin.js";
import { recordClubCodeSignup } from "./_clubReferrals.js";
import { buildSoloCoachClub } from "../src/lib/provisionSoloCoach.js";

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
    let clubIdOut = meta.clubId || "";
    let teamIdOut = meta.clubCode ? "" : (meta.teamId || "");

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
        teamId: meta.clubCode ? "" : (meta.teamId || ""),
        clubName: meta.clubName || meta.club || "",
        primaryColor: meta.primaryColor || "",
        secondaryColor: meta.secondaryColor || "",
        subscriptionStatus,
        stripeSubscriptionId,
        stripeCustomerId,
        trialEndsAt,
        billingSource: "stripe",
        coachAuto: meta.coachAuto || "",
        pendingPayment: false,
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
          password,
          user_metadata: {
            ...byId.user.user_metadata,
            ...userMeta,
            ...(purchasedAddons ? { purchasedAddons } : {}),
          },
        });
      } else {
        const found = await findUserByEmail(supabaseAdmin, email);

        if (found) {
          userId = found.id;
          const purchasedAddons = mergeAddons(found.user_metadata?.purchasedAddons);
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            password,
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
      clubIdOut = userMeta.clubId || clubIdOut;
      teamIdOut = userMeta.teamId || teamIdOut;
    } catch (adminErr) {
      console.error("complete-payment supabase:", adminErr.message);
      return res.status(500).json({ error: adminErr.message || "Error al activar la cuenta" });
    }

    if (meta.clubId && meta.clubCode) {
      try {
        await recordClubCodeSignup(getSupabaseAdmin(), {
          clubId: meta.clubId,
          clubCode: meta.clubCode,
          playerEmail: email,
          playerName: name,
          playerId: userId,
          plan: meta.plan,
          status: subscriptionStatus === "trialing" ? "trialing" : "active",
          stripeSessionId: sessionId,
        });
      } catch { /* trazabilidad best-effort */ }
    }

    let coachClub = null;
    const isCoachAudience = meta.audience === "coach" || String(meta.plan || "").startsWith("coach-");
    if (isCoachAudience && userId) {
      try {
        const built = buildSoloCoachClub({
          userId,
          name,
          email,
          plan: meta.plan || "coach-starter",
          coachAuto: meta.coachAuto || "",
          primaryColor: meta.primaryColor || "",
          secondaryColor: meta.secondaryColor || "",
          clubName: meta.clubName || meta.club || "",
        });
        coachClub = built.club;
        const supabaseAdmin = getSupabaseAdmin();
        const now = new Date().toISOString();
        const { data: existingRow } = await supabaseAdmin
          .from("clubs_detail")
          .select("data")
          .eq("club_id", built.clubId)
          .maybeSingle();
        const existing = existingRow?.data && typeof existingRow.data === "object" ? existingRow.data : {};
        const payload = {
          ...existing,
          ...built.club,
          id: built.clubId,
          coachConfig: existing.coachConfig?.nivel ? existing.coachConfig : built.club.coachConfig,
          teams: (existing.teams?.length ? existing.teams : built.club.teams),
        };
        await supabaseAdmin.from("clubs_detail").upsert(
          { club_id: built.clubId, data: payload, updated_at: now },
          { onConflict: "club_id" },
        );
        try {
          await supabaseAdmin.from("clubs").upsert({
            id: built.clubId,
            name: payload.name,
            abbreviation: payload.abbreviation,
            status: payload.status || "activo",
            plan: payload.plan,
            created_at: payload.created_at || now,
          }, { onConflict: "id" });
        } catch { /* tabla clubs opcional */ }

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            clubId: built.clubId,
            teamId: built.teamId,
            isSoloCoach: true,
            pendingPayment: false,
            clubName: payload.name,
          },
        });
        clubIdOut = built.clubId;
        teamIdOut = built.teamId;
      } catch (provisionErr) {
        console.error("complete-payment coach provision:", provisionErr.message);
      }
    }

    return res.status(200).json({
      ok: true,
      created,
      userId,
      email,
      password,
      plan: meta.plan,
      clubId: clubIdOut,
      teamId: teamIdOut,
      name,
      subscriptionStatus,
      trialEndsAt,
      coachClub,
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
