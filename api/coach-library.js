import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

const ROW_ID = "global";

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const SQL_HINT =
  "Ejecuta en Supabase SQL Editor:\n\nCREATE TABLE IF NOT EXISTS coach_library (id text primary key, data jsonb not null default '{}', updated_at timestamptz default now());\nALTER TABLE coach_library DISABLE ROW LEVEL SECURITY;\nGRANT SELECT ON coach_library TO authenticated;";

async function upsertLibrary(admin, exercises) {
  const r1 = await admin.from("coach_library").upsert(
    { id: ROW_ID, data: { exercises }, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (!r1.error) return { ok: true };

  const r2 = await admin.from("coach_library").upsert(
    { id: ROW_ID, data: { exercises } },
    { onConflict: "id" }
  );
  if (!r2.error) return { ok: true };

  return { ok: false, error: r2.error.message };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getAdmin();

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("coach_library")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (error) {
      console.warn("[coach-library] GET error:", error.message);
      return res.status(200).json({ exercises: [], _error: error.message, hint: SQL_HINT });
    }
    return res.status(200).json({ exercises: data?.data?.exercises || [] });
  }

  if (req.method === "POST") {
    const { exercises } = req.body || {};
    if (!Array.isArray(exercises)) {
      return res.status(400).json({ error: "exercises (array) requerido" });
    }
    const result = await upsertLibrary(admin, exercises);
    if (!result.ok) {
      console.warn("[coach-library] POST upsert failed:", result.error);
      return res.status(400).json({ error: result.error, hint: SQL_HINT });
    }
    return res.status(200).json({ ok: true, count: exercises.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
