/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: capa de abstracción sobre Claude/OpenAI. Si no hay API key, devuelve
 * respuestas mock parseables para que la demo no falle en directo.
 * PRODUCCIÓN: añadir rate limiting, logging de costes, retry con backoff,
 * validación de esquema con Zod y rotación de claves por entorno.
 */

export type AIProvider = "anthropic" | "openai";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIOptions {
  provider?: AIProvider;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Forzar JSON puro en la respuesta (sesiones tácticas) */
  jsonMode?: boolean;
}

const DEFAULT_PROVIDER: AIProvider =
  (process.env.AI_PROVIDER as AIProvider) || "anthropic";

function getProvider(opts?: AIOptions): AIProvider {
  return opts?.provider || DEFAULT_PROVIDER;
}

async function callAnthropic(messages: AIMessage[], opts: AIOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const system = messages.find((m) => m.role === "system")?.content;
  const userMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.3,
      system,
      messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${err}`);
  }

  const data = await res.json();
  const block = data.content?.find((b: { type: string }) => b.type === "text");
  return block?.text ?? "";
}

async function callOpenAI(messages: AIMessage[], opts: AIOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const body: Record<string, unknown> = {
    model: opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.3,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Llamada unificada a IA — cambia de proveedor sin tocar el resto del código */
export async function complete(messages: AIMessage[], opts: AIOptions = {}): Promise<string> {
  const provider = getProvider(opts);
  try {
    if (provider === "openai") return await callOpenAI(messages, opts);
    return await callAnthropic(messages, opts);
  } catch (e) {
    if ((e as Error).message === "NO_API_KEY") return mockComplete(messages, opts);
    throw e;
  }
}

/** Respuestas mock para demo sin API key */
function mockComplete(messages: AIMessage[], opts: AIOptions): string {
  const last = messages[messages.length - 1]?.content ?? "";

  if (opts.jsonMode || last.includes("JSON")) {
    return JSON.stringify({
      space: { width: 30, height: 20 },
      players: [
        { team: "A", x: 15, y: 10 },
        { team: "A", x: 12, y: 8 },
        { team: "A", x: 18, y: 8 },
        { team: "B", x: 15, y: 14 },
        { team: "B", x: 12, y: 16 },
        { team: "B", x: 18, y: 16 },
      ],
      arrows: [{ from: { x: 15, y: 10 }, to: { x: 15, y: 14 } }],
    });
  }

  if (last.includes("resum") || last.includes("Resum")) {
    return "Resumen demo: el staff acordó intensidad media en la sesión de mañana. Dos jugadores en protocolo de readaptación. Scouting pendiente de informe del extremo izquierdo.";
  }

  if (last.includes("carga") || last.includes("load")) {
    return JSON.stringify({
      band: "alta",
      explanation: "Distancia a alta velocidad +18% vs media de las últimas 3 sesiones. Recomendación: reducir volumen de sprints mañana.",
    });
  }

  return "Respuesta demo de NexGent IA — configura ANTHROPIC_API_KEY para respuestas reales.";
}

export function parseJsonFromAI<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}
