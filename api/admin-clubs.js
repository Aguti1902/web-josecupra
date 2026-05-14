import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";

function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Intenta upsert en clubs_detail con y sin updated_at */
async function upsertClubDetail(admin, clubId, data) {
  // Intento 1: con updated_at
  const r1 = await admin.from("clubs_detail").upsert(
    { club_id: clubId, data, updated_at: new Date().toISOString() },
    { onConflict: "club_id" }
  );
  if (!r1.error) return { ok: true };

  // Intento 2: sin updated_at (por si la columna no existe)
  const r2 = await admin.from("clubs_detail").upsert(
    { club_id: clubId, data },
    { onConflict: "club_id" }
  );
  if (!r2.error) return { ok: true };

  // Intento 3: INSERT + ON CONFLICT UPDATE via rpc si los upserts fallan
  // (puede fallar si la tabla no existe)
  return { ok: false, error: r2.error.message };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getAdmin();
  if (!admin) {
    return res.status(500).json({
      error: "SUPABASE_SERVICE_ROLE_KEY no configurada en las variables de entorno de Vercel"
    });
  }

  // ── GET → listar todos los clubs ─────────────────────────────────────────
  if (req.method === "GET") {
    // Primary: clubs_detail (full object)
    const { data: details, error: detErr } = await admin
      .from("clubs_detail")
      .select("club_id, data");

    if (!detErr && details && details.length > 0) {
      const clubs = details.map((d) => ({ ...(d.data || {}), id: d.club_id }));
      return res.status(200).json({ clubs });
    }

    // Fallback: clubs table
    const { data, error } = await admin.from("clubs").select("*");
    if (error) return res.status(400).json({ error: error.message, detailError: detErr?.message });
    return res.status(200).json({ clubs: data || [] });
  }

  // ── POST → crear o actualizar club ───────────────────────────────────────
  if (req.method === "POST") {
    const { club, detail } = req.body || {};
    if (!club) return res.status(400).json({ error: "club requerido" });

    const clubId = club.id;
    if (!clubId) return res.status(400).json({ error: "club.id requerido" });

    // 1. Intento de upsert en clubs registry (solo columnas seguras)
    const registryRow = {
      id:         clubId,
      name:       club.name       || "Sin nombre",
      city:       club.city       || null,
      status:     club.status     || "Activo",
      plan:       club.plan       || "personalizado",
      created_at: club.created_at || new Date().toISOString(),
    };
    try {
      await admin.from("clubs").upsert(registryRow, { onConflict: "id" });
    } catch (_) { /* non-fatal — tabla puede tener schema diferente */ }

    // 2. Guardar el objeto COMPLETO en clubs_detail (JSONB flexible)
    const fullDetail = detail ? { ...club, ...detail } : club;
    const result = await upsertClubDetail(admin, clubId, fullDetail);

    if (!result.ok) {
      return res.status(400).json({
        error: result.error,
        hint: "Ejecuta en Supabase SQL Editor: CREATE TABLE IF NOT EXISTS clubs_detail (club_id text primary key, data jsonb not null default \\'{}\\', updated_at timestamptz default now()); ALTER TABLE clubs_detail DISABLE ROW LEVEL SECURITY;"
      });
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
