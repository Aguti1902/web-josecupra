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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const admin = getAdmin();
  const caller = await resolveCaller(req, admin);
  if (caller.error) return res.status(caller.status).json({ error: caller.error });
  if (!caller.isAdmin) return res.status(403).json({ error: "Solo administradores" });

  const { email, password, name, teamRole, clubId, teamId, managedTeamIds, plan, subscriptionStatus, billingSource, purchasedAddons } = req.body || {};
  if (!email) return res.status(400).json({ error: "email requerido" });

  try {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const meta = {
      ...user.user_metadata,
      ...(name !== undefined && { name }),
      ...(teamRole !== undefined && { teamRole }),
      ...(clubId !== undefined && { clubId }),
      ...(teamId !== undefined && { teamId }),
      ...(managedTeamIds !== undefined && { managedTeamIds }),
      ...(plan !== undefined && { plan }),
      ...(subscriptionStatus !== undefined && { subscriptionStatus }),
      ...(billingSource !== undefined && { billingSource }),
      ...(purchasedAddons !== undefined && {
        purchasedAddons: Array.isArray(purchasedAddons) ? purchasedAddons : [],
      }),
    };

    const payload = { user_metadata: meta };
    if (password && password.length >= 6) payload.password = password;

    const { error } = await admin.auth.admin.updateUserById(user.id, payload);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ ok: true, userId: user.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
