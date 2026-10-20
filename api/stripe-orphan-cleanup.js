/**
 * POST /api/stripe-orphan-cleanup
 * Cancela suscripciones Stripe activas/trialing sin usuario Auth válido.
 */
import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { getStripe } from "./_stripeClient.js";
import { cancelOrphanSubscriptions } from "./_stripeBillingCleanup.js";

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

async function resolveCaller(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };

  const meta = data.user.user_metadata || {};
  const role = meta.role || (data.user.email === "jose@depro.es" ? "admin" : null);
  const isAdmin = role === "admin" || data.user.email === "jose@depro.es";
  if (!isAdmin) return { error: "Solo administradores", status: 403 };
  return { user: data.user, isAdmin: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const admin = getSupabaseAdmin();
  const caller = await resolveCaller(req, admin);
  if (caller.error) return res.status(caller.status).json({ error: caller.error });

  const body = parseBody(req);
  const skipGrace = body.skipGrace === true || body.skipGrace === "true";

  try {
    const stripe = await getStripe();
    const result = await cancelOrphanSubscriptions(stripe, admin, { graceNew: !skipGrace });
    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("stripe-orphan-cleanup:", err.message);
    return res.status(500).json({ error: err.message || "No se pudo limpiar Stripe" });
  }
}
