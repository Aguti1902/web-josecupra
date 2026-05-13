/**
 * Actualiza metadata de los usuarios demo con todos los campos del formulario.
 * node scripts/update-demo-users.js <SERVICE_ROLE_KEY>
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_KEY  = process.argv[2];

if (!SERVICE_KEY) { console.error("Falta SERVICE_ROLE_KEY"); process.exit(1); }

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UPDATES = [
  {
    email: "basico@depro.es",
    label: "Plan Básico (Carlos Demo)",
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
  },
  {
    email: "premium@depro.es",
    label: "Plan Premium (Marta Premium)",
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
  },
];

async function updateUser({ email, label, metadata }) {
  console.log(`\n🔧  Actualizando ${label}…`);

  // Buscar usuario por email
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) { console.error("  ❌ Error listando usuarios:", listErr.message); return; }

  const user = listData.users.find((u) => u.email === email);
  if (!user) { console.error(`  ❌ No se encontró el usuario ${email}`); return; }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: metadata,
  });

  if (error) { console.error("  ❌ Error:", error.message); return; }
  console.log(`  ✅ Actualizado: ${email}`);
  console.log(`     Plan: ${metadata.plan} | Objetivo: ${metadata.objetivo} | Frecuencia: ${metadata.frecuencia}`);
}

async function main() {
  console.log("🚀  DEPRO — Actualizar datos de usuarios demo");
  for (const u of UPDATES) await updateUser(u);
  console.log("\n✅  Listo. Los usuarios ya tienen todos los datos del formulario.\n");
}

main().catch(console.error);
