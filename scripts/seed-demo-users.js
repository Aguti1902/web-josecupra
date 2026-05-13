/**
 * seed-demo-users.js
 * Crea los dos usuarios de demo (Básico y Premium) en Supabase.
 *
 * Uso:
 *   node scripts/seed-demo-users.js <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Ejemplo:
 *   node scripts/seed-demo-users.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_KEY  = process.argv[2];

if (!SERVICE_KEY) {
  console.error("❌  Debes pasar la SUPABASE_SERVICE_ROLE_KEY como argumento.");
  console.error("   Encuéntrala en: supabase.com → Project Settings → API → service_role key");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    email:    "basico@depro.es",
    password: "Depro2026!",
    metadata: {
      name:       "Carlos Demo",
      role:       "player",
      plan:       "Básico",
      objetivo:   "Fuerza",
      deporte:    "Fútbol",
      frecuencia: "3 días / sem",
      material:   "Sin material",
      lesion:     [],
    },
    label: "Plan Básico",
  },
  {
    email:    "premium@depro.es",
    password: "Depro2026!",
    metadata: {
      name:       "Marta Premium",
      role:       "player",
      plan:       "Premium",
      objetivo:   "Velocidad",
      deporte:    "Fútbol",
      frecuencia: "4 días / sem",
      material:   "Sin material",
      lesion:     [],
    },
    label: "Plan Premium",
  },
];

async function createUser({ email, password, metadata, label }) {
  console.log(`\n🔧  Creando ${label}: ${email}…`);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: metadata,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already registered") || error.message?.includes("already been registered")) {
      console.log(`   ⚠️  El usuario ya existe. No se ha modificado.`);
    } else {
      console.error(`   ❌  Error: ${error.message}`);
    }
    return;
  }

  console.log(`   ✅  Creado con ID: ${data.user?.id}`);
  console.log(`       Email:    ${email}`);
  console.log(`       Password: ${password}`);
  console.log(`       Plan:     ${metadata.plan}`);
}

async function main() {
  console.log("🚀  DEPRO — Seed de usuarios de demo");
  console.log("=====================================");
  for (const u of DEMO_USERS) await createUser(u);
  console.log("\n✅  Proceso completado.\n");
  console.log("Credenciales de acceso:");
  console.log("  Plan Básico  →  basico@depro.es   /  Depro2026!");
  console.log("  Plan Premium →  premium@depro.es  /  Depro2026!");
}

main().catch(console.error);
