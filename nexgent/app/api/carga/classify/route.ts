/**
 * DEMO vs PRODUCCIÓN — API clasificación de carga IA
 */

import { NextRequest, NextResponse } from "next/server";
import { complete, parseJsonFromAI } from "@/lib/ai";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { playerName, metrics, history } = await req.json();

  const raw = await complete(
    [
      {
        role: "system",
        content: `Clasifica la carga del jugador en banda: "optima", "alta" o "riesgo". Responde SOLO JSON: {"band":"optima|alta|riesgo","explanation":"frase en español explicando el motivo"}`,
      },
      {
        role: "user",
        content: `Jugador: ${playerName}\nMétricas sesión: ${JSON.stringify(metrics)}\nHistórico reciente: ${JSON.stringify(history || [])}`,
      },
    ],
    { jsonMode: true, maxTokens: 300 }
  );

  let result: { band: string; explanation: string };
  try {
    result = parseJsonFromAI(raw);
  } catch {
    result = { band: "alta", explanation: "Clasificación demo — configura API key para análisis real." };
  }

  const supabase = getSupabaseServer();
  if (supabase && playerName) {
    await supabase.from("load_records").insert({
      player_name: playerName,
      metrics,
      band: result.band,
      explanation: result.explanation,
    });
  }

  return NextResponse.json(result);
}
