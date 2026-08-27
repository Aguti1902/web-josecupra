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

async function resolveCaller(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };

  const meta = data.user.user_metadata || {};
  const role = meta.role || (data.user.email === "jose@depro.es" ? "admin" : null);
  return {
    user: data.user,
    isAdmin: role === "admin" || data.user.email === "jose@depro.es",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = getAdmin();
  const caller = await resolveCaller(req, admin);
  if (caller.error) return res.status(caller.status).json({ error: caller.error });
  if (!caller.isAdmin) return res.status(403).json({ error: "Solo administradores" });

  const userId = String(req.body?.userId || req.query?.userId || "").trim();
  if (!userId) return res.status(400).json({ error: "userId requerido" });
  if (userId === caller.user.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }

  try {
    const { data: target, error: getErr } = await admin.auth.admin.getUserById(userId);
    if (getErr || !target?.user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const email = String(target.user.email || "").toLowerCase();
    const role = target.user.user_metadata?.role;
    if (email === "jose@depro.es" || role === "admin") {
      return res.status(403).json({ error: "No se puede eliminar un administrador" });
    }

    try {
      await admin.from("clubs_detail").delete().eq("club_id", `PLAYER_PLAN_${userId}`);
    } catch { /* el plan puede no existir */ }

    try {
      await admin.from("player_team_links").delete().eq("player_id", userId);
    } catch { /* tabla opcional */ }
    if (email) {
      try {
        await admin.from("player_team_links").delete().eq("email", email);
      } catch { /* ignore */ }
    }
    try {
      await admin.from("profiles").delete().eq("id", userId);
    } catch { /* ignore */ }

    // Quitar de plantillas/usuarios de cada club ANTES de borrar auth.
    // Las comisiones pendientes se conservan en CLUB_REFERRAL_REGISTRY.
    try {
      const { data: details } = await admin.from("clubs_detail").select("club_id, data");
      for (const row of details || []) {
        const clubId = row.club_id;
        if (!clubId || clubId === "CLUB_REFERRAL_REGISTRY" || clubId.startsWith("GLOBAL_") || clubId.startsWith("PLAYER_PLAN_")) {
          continue;
        }
        const data = row.data && typeof row.data === "object" ? row.data : {};
        let changed = false;
        const next = { ...data };
        const drop = (list) => {
          if (!Array.isArray(list)) return list;
          const filtered = list.filter((p) => {
            if (!p || typeof p !== "object") return true;
            const id = String(p.id || p.userId || p.player_id || "");
            const em = String(p.email || "").toLowerCase();
            if (id && id === userId) return false;
            if (email && em && em === email) return false;
            return true;
          });
          if (filtered.length !== list.length) changed = true;
          return filtered;
        };
        next.users = drop(next.users);
        if (Array.isArray(next.teams)) {
          next.teams = next.teams.map((t) => ({
            ...t,
            squad: drop(t.squad),
            players: drop(t.players),
          }));
        }
        if (changed) {
          await admin.from("clubs_detail").upsert(
            { club_id: clubId, data: next, updated_at: new Date().toISOString() },
            { onConflict: "club_id" },
          );
        }
      }
    } catch (stripErr) {
      console.warn("delete-user strip clubs:", stripErr.message);
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ ok: true, userId, email });
  } catch (err) {
    return res.status(500).json({ error: err.message || "No se pudo eliminar" });
  }
}
