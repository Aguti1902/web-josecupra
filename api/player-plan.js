/**
 * API de planes de jugador individuales.
 * Persistencia en clubs_detail con id PLAYER_PLAN_{userId} (mismo patrón que GLOBAL_PLANS).
 * GET: el propio jugador o un admin.
 * POST: admin asigna / actualiza; el propio jugador puede guardar progreso.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function planKey(userId) {
  return `PLAYER_PLAN_${userId}`;
}

async function resolveCaller(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;

  const meta = data.user.user_metadata || {};
  const role = meta.role || (data.user.email === "jose@depro.es" ? "admin" : null);
  return {
    user: data.user,
    role,
    isAdmin: role === "admin" || data.user.email === "jose@depro.es",
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getAdmin();
  const caller = await resolveCaller(req, admin);
  if (!caller) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const userId = String(req.query?.userId || "").trim();
    if (!userId) return res.status(400).json({ error: "userId requerido" });
    if (!caller.isAdmin && caller.user.id !== userId) {
      return res.status(403).json({ error: "Sin permiso" });
    }

    const { data, error } = await admin
      .from("clubs_detail")
      .select("data, updated_at")
      .eq("club_id", planKey(userId))
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data?.data) return res.status(200).json({ plan: null });
    return res.status(200).json({ plan: data.data, updatedAt: data.updated_at });
  }

  if (req.method === "POST") {
    const { userId, plan } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId requerido" });
    if (!plan) return res.status(400).json({ error: "plan requerido" });
    if (!caller.isAdmin && caller.user.id !== userId) {
      return res.status(403).json({ error: "Sin permiso" });
    }

    const payload = {
      ...plan,
      assignedTo: userId,
      updatedAt: new Date().toISOString(),
      updatedBy: caller.user.id,
    };

    const r1 = await admin.from("clubs_detail").upsert(
      { club_id: planKey(userId), data: payload, updated_at: new Date().toISOString() },
      { onConflict: "club_id" },
    );
    if (r1.error) {
      const r2 = await admin.from("clubs_detail").upsert(
        { club_id: planKey(userId), data: payload },
        { onConflict: "club_id" },
      );
      if (r2.error) return res.status(400).json({ error: r2.error.message });
    }

    // Marca en metadata del jugador para que el cliente sepa que hay plan asignado
    try {
      const { data: userData } = await admin.auth.admin.getUserById(userId);
      if (userData?.user) {
        await admin.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...(userData.user.user_metadata || {}),
            hasAssignedPlan: true,
            assignedPlanAt: new Date().toISOString(),
            planPendingManual: false,
          },
        });
      }
    } catch (_) { /* non-fatal */ }

    return res.status(200).json({ ok: true, userId });
  }

  if (req.method === "DELETE") {
    if (!caller.isAdmin) return res.status(403).json({ error: "Solo administradores" });
    const userId = String(req.body?.userId || req.query?.userId || "").trim();
    if (!userId) return res.status(400).json({ error: "userId requerido" });
    await admin.from("clubs_detail").delete().eq("club_id", planKey(userId));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
