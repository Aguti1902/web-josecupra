import { getStripe } from "./_stripeClient.js";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { syncCheckoutSession } from "./_stripeSync.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId, userId } = req.body || {};
  if (!sessionId || !userId) return res.status(400).json({ error: "Datos incompletos" });

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.type !== "addon") {
      return res.status(400).json({ error: "Sesión no válida" });
    }
    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: "Sesión no autorizada" });
    }
    const okStatuses = ["paid", "no_payment_required"];
    if (!okStatuses.includes(session.payment_status)) {
      return res.status(400).json({ error: "Pago no completado" });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const result = await syncCheckoutSession(supabaseAdmin, session);
    if (!result.ok) return res.status(400).json({ error: "No se pudo activar el extra" });

    return res.status(200).json({ ok: true, addonId: session.metadata.addonId });
  } catch (err) {
    console.error("complete-addon:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
