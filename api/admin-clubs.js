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

  // ── GET /api/admin-clubs → listar todos los clubs con detalles ──
  if (req.method === "GET") {
    const { data, error } = await admin
      .from("clubs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    // Cargar detalles (equipos, identidad) desde clubs_detail
    const ids = (data || []).map((c) => c.id);
    let details = [];
    if (ids.length > 0) {
      const { data: det } = await admin
        .from("clubs_detail")
        .select("*")
        .in("club_id", ids);
      details = det || [];
    }

    const merged = (data || []).map((club) => {
      const det = details.find((d) => d.club_id === club.id);
      return det
        ? { ...club, ...det.data, id: club.id }
        : club;
    });

    return res.status(200).json({ clubs: merged });
  }

  // ── POST /api/admin-clubs → crear o actualizar club ──
  if (req.method === "POST") {
    const { club, detail } = req.body || {};
    if (!club) return res.status(400).json({ error: "club requerido" });

    const { id, teams, users, mediaAssigned, ...row } = club;

    let savedId = id;

    if (id) {
      // Actualizar existente
      await admin.from("clubs").upsert({ id, ...row }, { onConflict: "id" });
    } else {
      // Insertar nuevo
      const { data, error } = await admin.from("clubs").insert([row]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      savedId = data.id;
    }

    // Guardar detalle (equipos, identidad, planes) en clubs_detail
    if (detail || teams || users) {
      const detailData = detail || { teams, users, mediaAssigned };
      await admin.from("clubs_detail").upsert(
        { club_id: savedId, data: detailData, updated_at: new Date().toISOString() },
        { onConflict: "club_id" }
      );
    }

    return res.status(200).json({ ok: true, id: savedId });
  }

  // ── DELETE /api/admin-clubs → eliminar club ──
  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id requerido" });
    await admin.from("clubs_detail").delete().eq("club_id", id);
    await admin.from("clubs").delete().eq("id", id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
