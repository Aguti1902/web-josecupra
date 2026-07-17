/**
 * seed-test-accounts.js
 * Crea un juego completo de usuarios y clubs de prueba en Supabase para poder
 * entrar a cada uno de los dashboards de DEPRO (admin, club coordinador,
 * entrenador de equipo, jugador individual y DEPRO Coach individual).
 *
 * Uso:
 *   node scripts/seed-test-accounts.js [SUPABASE_SERVICE_ROLE_KEY]
 *
 * Si no se pasa la service role key como argumento, usa la misma que ya
 * está hardcodeada como fallback en api/create-user.js / api/admin-clubs.js.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_KEY =
  process.argv[2] ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Depro2026!";

/* ── Clubs a crear (tablas clubs + clubs_detail, igual que api/admin-clubs.js) ── */
const CLUBS = [
  {
    id: "club_demo_test",
    name: "CD Demo Fútbol",
    abbreviation: "CDF",
    city: "Madrid",
    country: "España",
    status: "activo",
    plan: "club-pro",
    login_code: "DEMO2026",
    coordinator: { name: "Coordinador Test", email: "coordinador.test@depro.es" },
    primaryColor: "#0A36F7",
    secondaryColor: "#FFFFFF",
    teams: [
      {
        id: "team_demo_alevin",
        name: "Alevín A",
        category: "Sub-12",
        season: "2025/2026",
        trainingDays: ["Martes", "Jueves"],
        coach: { name: "Entrenador Test", email: "entrenador.test@depro.es" },
        squad: [],
      },
      {
        id: "team_demo_cadete",
        name: "Cadete A",
        category: "Sub-14",
        season: "2025/2026",
        trainingDays: ["Lunes", "Miércoles", "Viernes"],
        coach: { name: "Entrenador Test", email: "entrenador.test@depro.es" },
        squad: [],
      },
    ],
    plans: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "coach_demo_test",
    name: "Coach Test · DEPRO Coach",
    abbreviation: "CT",
    city: "", country: "",
    status: "activo",
    plan: "coach-pro",
    isSoloCoach: true,
    coachConfig: {
      ageBlock: "Bloque 3",
      trainingsPerWeek: 3,
      sessionDuration: 75,
      phaseObjective: "mantenimiento",
      competitiveLevel: "amateur",
      numPlayers: "15–20",
      gymAccess: true,
      material: ["sin_material", "conos", "picas"],
      mode: "depro",
    },
    primaryColor: "#0A36F7",
    secondaryColor: "#FFFFFF",
    coordinator: null,
    teams: [
      {
        id: "team_coach_demo",
        name: "Amateur FC",
        category: "Sub-16",
        season: "2025/2026",
        trainingDays: ["Lunes", "Miércoles", "Viernes"],
        coach: { name: "Coach Test", email: "coach.test@depro.es" },
        squad: [],
      },
    ],
    plans: [],
    created_at: new Date().toISOString(),
  },
];

/* ── Usuarios a crear ─────────────────────────────────────────────────── */
const USERS = [
  {
    email: "admin.test@depro.es",
    label: "Admin",
    metadata: { name: "Admin Test", role: "admin" },
    hint: "Panel /admin completo",
  },
  {
    email: "coordinador.test@depro.es",
    label: "Club · Coordinador",
    metadata: {
      name: "Coordinador Test", role: "club", teamRole: "coordinador",
      clubId: "club_demo_test", managedTeamIds: ["team_demo_alevin", "team_demo_cadete"],
    },
    hint: "Ve los 2 equipos del club, sin edición (solo lectura de equipos ajenos según módulo)",
  },
  {
    email: "entrenador.test@depro.es",
    label: "Club · Entrenador (Cadete A)",
    metadata: {
      name: "Entrenador Test", role: "club", teamRole: "entrenador",
      clubId: "club_demo_test", teamId: "team_demo_cadete",
    },
    hint: "Gestiona solo el equipo Cadete A (Sub-14, Bloque 2 → módulo Cargas visible)",
  },
  {
    email: "jugador.test@depro.es",
    label: "Jugador individual",
    metadata: {
      name: "Jugador Test", role: "player", plan: "player-essential",
      deporte: "Fútbol", objetivo: "Rendimiento", frecuencia: "3 días / sem",
      material: "Sin material", edad: 22, posicion: "Centrocampista",
      experiencia: "Intermedio", disponibles: ["Lunes", "Miércoles", "Viernes"], lesion: [],
    },
    hint: "Plan individual generado automáticamente al entrar",
  },
  {
    email: "coach.test@depro.es",
    label: "DEPRO Coach (ya dado de alta)",
    metadata: {
      name: "Coach Test", role: "club", teamRole: "entrenador",
      clubId: "coach_demo_test", teamId: "team_coach_demo",
    },
    hint: "Entra directo al dashboard de entrenador individual, sin pasar por el wizard",
  },
  {
    email: "coach.nuevo.test@depro.es",
    label: "DEPRO Coach (recién comprado, sin onboarding)",
    metadata: { name: "Coach Nuevo Test", role: "coach", plan: "coach-starter" },
    hint: "Requiere migración SQL profiles_role_check para permitir role=coach. Mientras, usa coach.test@depro.es",
  },
  {
    email: "club.nuevo.test@depro.es",
    label: "Club (recién comprado, sin onboarding)",
    metadata: {
      name: "Club Nuevo Test", role: "club", plan: "club-inicial",
      clubName: "CD Nuevo Demo",
    },
    hint: "Al entrar, la app le redirige al wizard /dashboard/club-setup",
  },
];

async function upsertClub(club) {
  console.log(`\n🏟️   Club: ${club.name} (${club.id})`);
  const registryRow = {
    id: club.id, name: club.name, abbreviation: club.abbreviation || null,
    city: club.city || null, status: club.status || "activo", plan: club.plan || "personalizado",
    login_code: club.login_code || null, coordinator: club.coordinator || null,
    created_at: club.created_at,
  };
  const { error: e1 } = await admin.from("clubs").upsert(registryRow, { onConflict: "id" });
  if (e1) console.log(`   ⚠️  tabla clubs: ${e1.message}`);

  const { error: e2 } = await admin.from("clubs_detail").upsert(
    { club_id: club.id, data: club, updated_at: new Date().toISOString() },
    { onConflict: "club_id" }
  );
  if (e2) { console.log(`   ❌  clubs_detail: ${e2.message}`); return false; }
  console.log(`   ✅  Guardado (clubs + clubs_detail)`);
  return true;
}

async function createOrUpdateUser({ email, label, metadata, hint }) {
  console.log(`\n👤  ${label}: ${email}`);
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, user_metadata: metadata, email_confirm: true,
  });

  if (!error) {
    console.log(`   ✅  Creado · ID: ${data.user?.id}`);
    console.log(`   💡  ${hint}`);
    return;
  }

  if (error.message?.includes("already registered") || error.message?.includes("already been registered")) {
    console.log(`   ↻  Ya existe, actualizando metadata y contraseña…`);
    let page = 1;
    let found = null;
    while (!found) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (listErr || !list?.users?.length) break;
      found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found || list.users.length < 200) break;
      page += 1;
    }
    if (!found) { console.log(`   ❌  No se pudo localizar el usuario existente para actualizarlo.`); return; }
    const { error: updErr } = await admin.auth.admin.updateUserById(found.id, {
      password: PASSWORD, user_metadata: metadata, email_confirm: true,
    });
    if (updErr) console.log(`   ❌  Error actualizando: ${updErr.message}`);
    else { console.log(`   ✅  Actualizado · ID: ${found.id}`); console.log(`   💡  ${hint}`); }
    return;
  }

  console.log(`   ❌  Error: ${error.message}`);
}

async function main() {
  console.log("🚀  DEPRO — Seed de cuentas de prueba");
  console.log("======================================");

  for (const club of CLUBS) await upsertClub(club);
  for (const user of USERS) await createOrUpdateUser(user);

  console.log("\n\n✅  Proceso completado. Credenciales (todas con la misma contraseña):\n");
  console.log(`   Contraseña única: ${PASSWORD}\n`);
  for (const u of USERS) console.log(`   ${u.label.padEnd(38)} → ${u.email}`);
  console.log("");
}

main().catch((e) => { console.error(e); process.exit(1); });
