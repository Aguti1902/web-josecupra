/**
 * DEMO vs PRODUCCIÓN — API resumen IA del chat
 */

import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const text = messages
    .slice(-20)
    .map((m: { author: string; content: string }) => `${m.author}: ${m.content}`)
    .join("\n");

  const summary = await complete(
    [
      { role: "system", content: "Resume en 2-3 líneas en español el hilo de conversación del staff de un club de fútbol. Sé conciso y accionable." },
      { role: "user", content: text },
    ],
    { maxTokens: 200 }
  );

  return NextResponse.json({ summary });
}
