import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY no configurada" });

  const { email, password, name, teamRole, clubId, teamId, managedTeamIds } = req.body || {};
  if (!email) return res.status(400).json({ error: "email requerido" });

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
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
    };

    const payload = { user_metadata: meta };
    if (password && password.length >= 6) payload.password = password;

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, payload);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ ok: true, userId: user.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
