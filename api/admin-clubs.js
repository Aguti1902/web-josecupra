import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getAdmin();
  if (!admin) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY no configurada" });

  // ── GET → listar todos los clubs ─────────────────────────────────────────
  if (req.method === "GET") {
    // Primary source: clubs_detail (contains the full club object as JSONB)
    const { data: details, error: detErr } = await admin
      .from("clubs_detail")
      .select("club_id, data, updated_at")
      .order("updated_at", { ascending: false });

    if (!detErr && details && details.length > 0) {
      const clubs = details.map((d) => ({
        ...(d.data || {}),
        id: d.club_id,
      }));
      return res.status(200).json({ clubs });
    }

    // Fallback: read from clubs table (minimal data)
    const { data, error } = await admin
      .from("clubs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ clubs: data || [] });
  }

  // ── POST → crear o actualizar club ───────────────────────────────────────
  if (req.method === "POST") {
    const { club, detail } = req.body || {};
    if (!club) return res.status(400).json({ error: "club requerido" });

    const clubId = club.id;
    if (!clubId) return res.status(400).json({ error: "club.id requerido" });

    // 1. Minimal row for the clubs registry table
    const registryRow = {
      id:         clubId,
      name:       club.name       || "Sin nombre",
      city:       club.city       || null,
      status:     club.status     || "Activo",
      plan:       club.plan       || "personalizado",
      created_at: club.created_at || new Date().toISOString(),
    };

    // Try to upsert to clubs registry (ignore extra-column errors gracefully)
    try {
      await admin.from("clubs").upsert(registryRow, { onConflict: "id" });
    } catch (_) { /* non-fatal */ }

    // 2. Always store the FULL club object + optional detail in clubs_detail
    const fullDetail = detail
      ? { ...club, ...detail }  // merge club base + explicit detail
      : club;                   // full club object is the detail

    const { error: detailErr } = await admin.from("clubs_detail").upsert(
      {
        club_id:    clubId,
        data:       fullDetail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "club_id" }
    );

    if (detailErr) {
      return res.status(400).json({ error: detailErr.message });
    }

    return res.status(200).json({ ok: true, id: clubId });
  }

  // ── DELETE → eliminar club ───────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id requerido" });
    await admin.from("clubs_detail").delete().eq("club_id", id);
    await admin.from("clubs").delete().eq("id", id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
