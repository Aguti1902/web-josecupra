import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { mergePreferVideo } from "../src/lib/contentRestore.js";

const CLOUD_ID = "CATALOG_OVERRIDES";

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

async function requireAdmin(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };
  const meta = data.user.user_metadata || {};
  const isAdmin = meta.role === "admin" || data.user.email === "jose@depro.es";
  if (!isAdmin) return { error: "Solo administradores", status: 403 };
  return { user: data.user };
}

async function readOverrides(admin) {
  const { data, error } = await admin
    .from("clubs_detail")
    .select("data")
    .eq("club_id", CLOUD_ID)
    .maybeSingle();
  if (error) throw error;
  const overrides = data?.data?.overrides;
  return overrides && typeof overrides === "object" ? overrides : {};
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      const overrides = await readOverrides(admin);
      return res.status(200).json({ ok: true, overrides });
    } catch (err) {
      return res.status(500).json({ error: err.message || "No se pudieron leer los vídeos" });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const gate = await requireAdmin(req, admin);
  if (gate.error) return res.status(gate.status).json({ error: gate.error });

  try {
    const body = parseBody(req);
    const incoming = body.overrides && typeof body.overrides === "object" ? body.overrides : {};
    const existing = await readOverrides(admin);
    const merged = mergePreferVideo(incoming, existing);
    const payload = {
      id: CLOUD_ID,
      name: "Catalog Overrides",
      overrides: merged,
    };
    const { error } = await admin.from("clubs_detail").upsert(
      { club_id: CLOUD_ID, data: payload, updated_at: new Date().toISOString() },
      { onConflict: "club_id" },
    );
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true, count: Object.keys(merged).length });
  } catch (err) {
    return res.status(500).json({ error: err.message || "No se pudieron guardar los vídeos" });
  }
}
