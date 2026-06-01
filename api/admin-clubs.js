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

  // ── GET → listar todos los clubs ─────────────────────────────────────────
  if (req.method === "GET") {
    // Intentar primero clubs_detail (fuente principal con datos completos)
    const { data: details, error: detErr } = await admin
      .from("clubs_detail")
      .select("club_id, data");

    if (!detErr && details) {
      const clubs = details.map((d) => ({ ...(d.data || {}), id: d.club_id }));
      return res.status(200).json({ clubs });
    }

    // Fallback: tabla clubs básica (puede no tener teams/logo/colores pero al menos devuelve algo)
    console.warn("[admin-clubs] clubs_detail error, fallback to clubs table:", detErr?.message);
    const { data: basicClubs, error: basicErr } = await admin
      .from("clubs")
      .select("*");

    if (!basicErr && basicClubs?.length > 0) {
      const clubs = basicClubs.map((c) => ({
        id: c.id, name: c.name, abbreviation: c.abbreviation,
        city: c.city, country: c.country, status: c.status, plan: c.plan,
        login_code: c.login_code, coordinator: c.coordinator,
        created_at: c.created_at, teams: [], users: [], plans: [],
      }));
      return res.status(200).json({ clubs, _source: "clubs_table_fallback" });
    }

    return res.status(400).json({
      error: detErr?.message || basicErr?.message,
      hint: "Ejecuta el SQL de supabase_schema.sql en Supabase → SQL Editor para crear las tablas necesarias."
    });
  }

  // ── POST → crear o actualizar club ───────────────────────────────────────
  if (req.method === "POST") {
    const { club, detail } = req.body || {};
    if (!club) return res.status(400).json({ error: "club requerido" });

    const clubId = club.id;
    if (!clubId) return res.status(400).json({ error: "club.id requerido" });

    // 1. Upsert en clubs registry (solo columnas seguras del schema)
    const registryRow = {
      id:           clubId,
      name:         club.name         || "Sin nombre",
      abbreviation: club.abbreviation || null,
      city:         club.city         || null,
      status:       club.status       || "activo",
      plan:         club.plan         || "personalizado",
      login_code:   club.loginCode    || club.login_code || null,
      coordinator:  club.coordinator  || null,
      created_at:   club.created_at   || new Date().toISOString(),
    };
    try {
      await admin.from("clubs").upsert(registryRow, { onConflict: "id" });
    } catch (_) { /* non-fatal */ }

    // 2. Guardar el objeto COMPLETO en clubs_detail (JSONB flexible)
    const fullDetail = detail ? { ...club, ...detail } : club;
    const result = await upsertClubDetail(admin, clubId, fullDetail);

    if (!result.ok) {
      // clubs_detail no existe: el registro básico ya está en clubs, al menos
      console.warn("[admin-clubs] clubs_detail upsert failed:", result.error);
      return res.status(400).json({
        error: result.error,
        hint: "Ejecuta en Supabase SQL Editor:\n\nCREATE TABLE IF NOT EXISTS clubs_detail (club_id text primary key, data jsonb not null default '{}', updated_at timestamptz default now());\nALTER TABLE clubs_detail DISABLE ROW LEVEL SECURITY;\nGRANT SELECT ON clubs_detail TO authenticated;\nGRANT SELECT ON clubs TO authenticated;"
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
