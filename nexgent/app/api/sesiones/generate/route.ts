/**
 * DEMO vs PRODUCCIÓN — API generación diagrama táctico IA
 */

import { NextRequest, NextResponse } from "next/server";
import { complete, parseJsonFromAI } from "@/lib/ai";
import { SessionDiagram } from "@/lib/seed-data";

const SCHEMA = `{
  "space": { "width": number (metros), "height": number (metros) },
  "players": [{ "team": "A"|"B", "x": number, "y": number }],
  "arrows": [{ "from": { "x": number, "y": number }, "to": { "x": number, "y": number } }]
}`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const raw = await complete(
    [
      {
        role: "system",
        content: `Eres un asistente táctico de fútbol. Responde ÚNICAMENTE con JSON válido, sin texto antes ni después, con este esquema exacto:\n${SCHEMA}\nCoordenadas x,y dentro del espacio definido. team A = atacantes/equipo con balón, team B = defensores.`,
      },
      { role: "user", content: prompt },
    ],
    { jsonMode: true, maxTokens: 1500, temperature: 0.2 }
  );

  try {
    const diagram = parseJsonFromAI<SessionDiagram>(raw);
    return NextResponse.json({ diagram });
  } catch {
    return NextResponse.json({ error: "Invalid AI JSON", raw }, { status: 422 });
  }
}
