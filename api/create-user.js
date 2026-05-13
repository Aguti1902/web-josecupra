import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY no configurada en Vercel" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { email, password, name, role = "club", clubId, teamId, teamRole } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email y password son obligatorios" });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role, clubId, teamId, teamRole },
    email_confirm: true,
  });

  if (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, userId: data.user?.id });
}
