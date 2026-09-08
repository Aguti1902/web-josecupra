/**
 * Datos personales cross-device (cargas individuales, wellness, tests).
 * Blob clubs_detail USER_DATA_{userId}.
 * GET/POST: el propio usuario o un admin.
 */
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

function blobId(userId) {
  return `USER_DATA_${String(userId || "").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
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

function mergeField(current, incoming, key) {
  if (incoming[key] !== undefined) return incoming[key];
  return current[key];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getSupabaseAdmin();
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
      .eq("club_id", blobId(userId))
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data: data?.data || null, updatedAt: data?.updated_at || null });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const userId = String(body.userId || "").trim();
    if (!userId) return res.status(400).json({ error: "userId requerido" });
    if (!caller.isAdmin && caller.user.id !== userId) {
      return res.status(403).json({ error: "Sin permiso" });
    }

    const { data: existingRow } = await admin
      .from("clubs_detail")
      .select("data")
      .eq("club_id", blobId(userId))
      .maybeSingle();
    const current = existingRow?.data && typeof existingRow.data === "object" ? existingRow.data : {};
    const payload = {
      loadLogs: mergeField(current, body, "loadLogs") ?? current.loadLogs ?? [],
      wellness: mergeField(current, body, "wellness") ?? current.wellness ?? {},
      playerTests: mergeField(current, body, "playerTests") ?? current.playerTests ?? {},
      updatedAt: new Date().toISOString(),
      updatedBy: caller.user.id,
    };

    const row = { club_id: blobId(userId), data: payload, updated_at: new Date().toISOString() };
    const r1 = await admin.from("clubs_detail").upsert(row, { onConflict: "club_id" });
    if (r1.error) {
      const r2 = await admin.from("clubs_detail").upsert(
        { club_id: blobId(userId), data: payload },
        { onConflict: "club_id" },
      );
      if (r2.error) return res.status(400).json({ error: r2.error.message });
    }
    return res.status(200).json({ ok: true, userId, data: payload });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
