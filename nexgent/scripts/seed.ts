/**
 * Seed script — npm run seed
 * Requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const chatMessages = [
  { channel_id: "tecnico", author: "Ancelotti", role: "Entrenador", content: "Mañana sesión técnico-táctica, intensidad media-alta." },
  { channel_id: "tecnico", author: "Davide", role: "Ayudante", content: "Confirmado rondo 4v2 + posesión 8v8." },
  { channel_id: "medico", author: "Dr. Nieto", role: "Médico", content: "Militão: progresión Fase 2 readaptación." },
  { channel_id: "scouting", author: "Juni", role: "Scouting", content: "Informe pendiente extremo izquierdo Sub-21." },
  { channel_id: "general", author: "Dirección", role: "Dirección", content: "Reunión staff viernes 10:00." },
];

const scouting = [
  { player_name: "João Silva", physical: 8, technical: 7, tactical: 6, attitudinal: 9, notes: "Extremo zurdo, buen 1v1." },
  { player_name: "Marco Rossi", physical: 7, technical: 8, tactical: 8, attitudinal: 7, notes: "Mediocentro organizador." },
];

const sessions = [
  {
    title: "Rondo 4v2 posicional",
    description: "Máximo 2 toques",
    diagram: {
      space: { width: 25, height: 20 },
      players: [{ team: "A", x: 12, y: 10 }, { team: "B", x: 10, y: 14 }],
      arrows: [],
    },
  },
];

const loads = [
  { player_name: "Vinícius", session_date: "2026-06-15", metrics: { distance: 10200, hsr: 980, sprints: 42 }, band: "riesgo", explanation: "HSR +22% vs media." },
  { player_name: "Bellingham", session_date: "2026-06-15", metrics: { distance: 9800, hsr: 720, sprints: 35 }, band: "alta", explanation: "Carga acumulada elevada." },
];

async function seed() {
  console.log("Limpiando tablas demo...");
  await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("scouting_reports").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("load_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("session_tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Insertando chat...");
  await supabase.from("chat_messages").insert(chatMessages);

  console.log("Insertando scouting...");
  await supabase.from("scouting_reports").insert(scouting);

  console.log("Insertando sesiones...");
  await supabase.from("session_tasks").insert(sessions);

  console.log("Insertando cargas...");
  await supabase.from("load_records").insert(loads);

  console.log("Seed completado.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
