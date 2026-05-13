import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { teamId, clubId } = req.query;
  if (!teamId && !clubId) return res.status(400).json({ error: "teamId or clubId required" });

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Listar todos los usuarios de Supabase Auth y filtrar por metadata
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const filtered = users.filter((u) => {
      const meta = u.user_metadata || {};
      if (meta.role !== "player") return false; // solo jugadores
      if (teamId && meta.teamId !== teamId) return false;
      if (clubId && meta.clubId !== clubId) return false;
      return true;
    });

    const players = filtered.map((u) => ({
      id:       u.id,
      email:    u.email,
      name:     u.user_metadata?.name || u.email?.split("@")[0],
      plan:     u.user_metadata?.plan || null,
      position: u.user_metadata?.position || null,
      teamId:   u.user_metadata?.teamId || null,
      clubId:   u.user_metadata?.clubId || null,
      joinedAt: u.created_at,
    }));

    return res.status(200).json({ players });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
