import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, deleteAccount = true } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId requerido" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.authorization || req.headers.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    let caller = null;
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      caller = data?.user || null;
    }
    const callerMeta = caller?.user_metadata || {};
    const callerIsAdmin = callerMeta.role === "admin" || caller?.email === "jose@depro.es";
    if (!caller || (caller.id !== userId && !callerIsAdmin)) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) return res.status(404).json({ error: "Usuario no encontrado" });

    const target = userData.user;
    const meta = target.user_metadata || {};
    const email = String(target.email || "").toLowerCase();
    if (email === "jose@depro.es" || meta.role === "admin") {
      return res.status(403).json({ error: "No se puede cancelar un administrador" });
    }

    const subscriptionId = meta.stripeSubscriptionId;
    let cancelAt = new Date().toISOString();
    if (subscriptionId) {
      try {
        const stripe = await getStripe();
        const cancelled = await stripe.subscriptions.cancel(subscriptionId);
        cancelAt = cancelled.ended_at
          ? new Date(cancelled.ended_at * 1000).toISOString()
          : cancelAt;
      } catch (err) {
        console.warn("cancel-subscription stripe:", err.message);
      }
    }

    const isClubStaff = ["coordinador", "administrador", "entrenador", "ayudante"].includes(meta.teamRole)
      && !meta.isSoloCoach
      && !String(meta.clubId || "").startsWith("coach_");
    const shouldDelete = deleteAccount !== false && !isClubStaff;

    if (shouldDelete) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return res.status(400).json({ error: error.message });
      try {
        await supabaseAdmin.from("clubs_detail").delete().eq("club_id", `PLAYER_PLAN_${userId}`);
      } catch { /* el plan personal puede no existir */ }
      return res.status(200).json({
        ok: true,
        deleted: true,
        cancelAt,
        stripeSubscriptionId: subscriptionId || null,
      });
    }

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        subscriptionStatus: "canceled",
        subscriptionCancelAt: cancelAt,
      },
    });

    return res.status(200).json({
      ok: true,
      deleted: false,
      cancelAt,
      stripeSubscriptionId: subscriptionId || null,
    });
  } catch (err) {
    console.error("cancel-subscription:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
