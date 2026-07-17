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
    teamRole: meta.teamRole || null,
    clubId: meta.clubId || null,
    isAdmin: role === "admin" || data.user.email === "jose@depro.es",
    isCoordinator: role === "club" && meta.teamRole === "coordinador" && !!meta.clubId,
    isClubUser: role === "club" && !!meta.clubId,
  };
}

async function upsertClubDetail(admin, clubId, data) {
  const r1 = await admin.from("clubs_detail").upsert(
    { club_id: clubId, data, updated_at: new Date().toISOString() },
    { onConflict: "club_id" }
  );
  if (!r1.error) return { ok: true };

  const r2 = await admin.from("clubs_detail").upsert(
    { club_id: clubId, data },
    { onConflict: "club_id" }
  );
  if (!r2.error) return { ok: true };
  return { ok: false, error: r2.error.message };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getAdmin();
  const caller = await resolveCaller(req, admin);

  // GET → listar clubs (lectura abierta para usuarios autenticados de la app;
  // AuthContext y dashboards la usan para sincronizar). Sin token: también
  // permitido para no romper la carga inicial, pero POST/DELETE sí exigen auth.
  if (req.method === "GET") {
    const { data: details, error: detErr } = await admin
      .from("clubs_detail")
      .select("club_id, data");

    if (!detErr && details) {
      const clubs = details.map((d) => ({ ...(d.data || {}), id: d.club_id }));
      return res.status(200).json({ clubs });
    }

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

  // POST → crear/actualizar club
  if (req.method === "POST") {
    if (!caller) return res.status(401).json({ error: "No autorizado" });

    const { club, detail } = req.body || {};
    if (!club) return res.status(400).json({ error: "club requerido" });
    const clubId = club.id;
    if (!clubId) return res.status(400).json({ error: "club.id requerido" });

    // Admin puede todo. Coordinador solo su propio club. Club user (onboarding)
    // puede crear su club la primera vez si clubId coincidirá tras updateUser —
    // durante onboarding el clubId aún no está en metadata, así que permitimos
    // a cualquier role=club crear un club nuevo (POST) o actualizar el suyo.
    if (!caller.isAdmin) {
      if (caller.role !== "club") {
        return res.status(403).json({ error: "Sin permiso" });
      }
      // Si ya tiene clubId, solo puede tocar el suyo
      if (caller.clubId && caller.clubId !== clubId) {
        return res.status(403).json({ error: "Solo puedes gestionar tu club" });
      }
      // Coordinadores o usuarios en onboarding (sin clubId aún) pueden escribir
      if (caller.clubId && !caller.isCoordinator && caller.teamRole !== "entrenador") {
        // entrenadores pueden persistir datos de su club (plantilla, etc.)
        // ayudantes también si tienen clubId
      }
    }

    const registryRow = {
      id:           clubId,
      name:         club.name         || "Sin nombre",
      abbreviation: club.abbreviation || null,
      city:         club.city         || null,
      status:       club.status       || "activo",
      plan:         club.plan         || "personalizado",
      login_code:   club.loginCode    || club.login_code || null,
      created_at:   club.created_at   || new Date().toISOString(),
    };
    try {
      await admin.from("clubs").upsert(registryRow, { onConflict: "id" });
    } catch (_) { /* non-fatal */ }

    const fullDetail = detail ? { ...club, ...detail } : club;
    const result = await upsertClubDetail(admin, clubId, fullDetail);

    if (!result.ok) {
      console.warn("[admin-clubs] clubs_detail upsert failed:", result.error);
      return res.status(400).json({
        error: result.error,
        hint: "Ejecuta en Supabase SQL Editor:\n\nCREATE TABLE IF NOT EXISTS clubs_detail (club_id text primary key, data jsonb not null default '{}', updated_at timestamptz default now());\nALTER TABLE clubs_detail DISABLE ROW LEVEL SECURITY;\nGRANT SELECT ON clubs_detail TO authenticated;\nGRANT SELECT ON clubs TO authenticated;"
      });
    }

    return res.status(200).json({ ok: true, id: clubId });
  }

  // DELETE → solo admin
  if (req.method === "DELETE") {
    if (!caller?.isAdmin) return res.status(403).json({ error: "Solo el admin puede eliminar clubs" });
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id requerido" });
    await admin.from("clubs_detail").delete().eq("club_id", id);
    await admin.from("clubs").delete().eq("id", id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
