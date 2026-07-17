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

async function requireAdmin(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };

  const meta = data.user.user_metadata || {};
  const isAdmin = meta.role === "admin" || data.user.email === "jose@depro.es";
  if (!isAdmin) return { error: "Solo admin", status: 403 };
  return { user: data.user };
}

function classifyUser(meta = {}, email) {
  const role = meta.role || (email === "jose@depro.es" ? "admin" : "player");
  if (role === "admin") return { type: "admin", label: "Admin" };
  if (role === "coach") return { type: "coach_pending", label: "Coach (alta pendiente)" };
  if (role === "player") return { type: "player", label: "Jugador" };
  if (role === "club") {
    // Detectar DEPRO Coach: clubId empieza por coach_ o metadata isSoloCoach
    if (meta.isSoloCoach || String(meta.clubId || "").startsWith("coach_")) {
      return { type: "coach", label: "DEPRO Coach" };
    }
    if (!meta.clubId) return { type: "club_pending", label: "Club (alta pendiente)" };
    const tr = meta.teamRole || "coordinador";
    if (tr === "entrenador") return { type: "club_entrenador", label: "Club · Entrenador" };
    if (tr === "ayudante") return { type: "club_ayudante", label: "Club · Ayudante" };
    return { type: "club_coordinador", label: "Club · Coordinador" };
  }
  return { type: role, label: role };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const admin = getAdmin();
  const gate = await requireAdmin(req, admin);
  if (gate.error) return res.status(gate.status).json({ error: gate.error });

  // Mapa clubId → nombre
  const clubNames = {};
  try {
    const { data: details } = await admin.from("clubs_detail").select("club_id, data");
    (details || []).forEach((d) => {
      clubNames[d.club_id] = d.data?.name || d.club_id;
    });
  } catch { /* ignore */ }

  const users = [];
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return res.status(400).json({ error: error.message });
    const batch = data?.users || [];
    for (const u of batch) {
      const meta = u.user_metadata || {};
      const classified = classifyUser(meta, u.email);
      users.push({
        id: u.id,
        email: u.email,
        name: meta.name || u.email?.split("@")[0] || "—",
        role: meta.role || null,
        teamRole: meta.teamRole || null,
        type: classified.type,
        typeLabel: classified.label,
        clubId: meta.clubId || null,
        clubName: meta.clubId ? (clubNames[meta.clubId] || meta.clubName || meta.clubId) : (meta.clubName || null),
        plan: meta.plan || null,
        subscriptionStatus: meta.subscriptionStatus || null,
        trialEndsAt: meta.trialEndsAt || null,
        stripeCustomerId: meta.stripeCustomerId || null,
        stripeSubscriptionId: meta.stripeSubscriptionId || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      });
    }
    if (batch.length < 200) break;
    page += 1;
  }

  users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return res.status(200).json({ users, total: users.length });
}
