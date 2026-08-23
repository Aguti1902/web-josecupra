const WEBSITE_FAQ = [
  { keywords: ["prueba", "gratis", "15 días", "tarjeta"], answer: "El plan **Standard** (jugador) tiene **15 días de prueba** (0 € hoy con tarjeta). **Premium** jugador **no tiene prueba gratis**: cobro desde el día 1." },
  { keywords: ["premium", "sin prueba"], answer: "**Premium** jugador no incluye prueba gratuita. Plazas limitadas y cobro desde el primer día. La prueba de 15 días es solo para **Standard**." },
  { keywords: ["precio", "precios", "cuesta", "plan", "€"], answer: "Los planes de entrenador empiezan desde **30 €/mes**. Consulta /precios para comparar." },
  { keywords: ["club", "clubs", "coordinador"], answer: "**DEPRO Club**: multi-equipo, white-label y panel coordinador." },
  { keywords: ["entrenador", "coach"], answer: "**DEPRO Coach** para entrenadores: microciclos, 90+ ejercicios, cargas y tests." },
  { keywords: ["jugador", "player", "móvil"], answer: "Los jugadores ven plan semanal, feedback, tests y ranking sincronizados con el entrenador." },
  { keywords: ["ia", "inteligencia", "motor"], answer: "IA deportiva con motores validados: microciclos y sesiones A/B/C trazables y editables." },
  { keywords: ["carga", "rpe", "wellness"], answer: "Control de carga: RPE, wellness y alertas de sobrecarga." },
  { keywords: ["test", "tests", "físico"], answer: "Tests físicos con seguimiento T1→T3 y evolución por temporada." },
  { keywords: ["planificación", "microciclo", "sesión"], answer: "Microciclos y mesociclos automáticos con sesiones A/B/C." },
  { keywords: ["contacto", "ventas", "email"], answer: "Escríbenos a **ventas@depro.es** o usa el formulario en /recursos#contacto." },
];

function resolveWebsiteAnswer(message) {
  const q = message.toLowerCase();
  if (/hola|buenas|hey/.test(q)) return "¡Hola! Soy el asistente de DEPRO. Pregúntame sobre precios, prueba gratis o funcionalidades.";
  let best = null, score = 0;
  for (const faq of WEBSITE_FAQ) {
    let s = 0;
    for (const kw of faq.keywords) if (q.includes(kw)) s += kw.length;
    if (s > score) { score = s; best = faq; }
  }
  if (best && score >= 3) return best.answer.replace(/\*\*(.*?)\*\*/g, "$1");
  return "Puedo ayudarte con prueba gratis, precios, planificación IA, cargas y tests. ¿Qué te interesa?";
}

const KNOWLEDGE = `DEPRO es una plataforma de preparación física para fútbol.
Perfiles: Entrenador (DEPRO Coach), Club/Coordinador (DEPRO Club), Jugador.
Funcionalidades: planificación IA con microciclos, control de carga RPE, tests físicos T1→T3, plantilla, periodización.
Prueba gratis 15 días sin tarjeta (jugador Standard). Entrenador desde 30 €/mes.
Contacto: ventas@depro.es`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, pathname = "/" } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: "message requerido" });

  const local = resolveWebsiteAnswer(message);

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ reply: local });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 220,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `Eres el asistente virtual del sitio web de DEPRO (preparación física para fútbol).
Respondes SIEMPRE en español, claro y conciso (máx. 120 palabras).
Solo hablas de DEPRO y sus funcionalidades públicas. No inventes features.
Página actual: ${pathname}
Conocimiento: ${KNOWLEDGE}`,
          },
          { role: "user", content: message.trim() },
        ],
      }),
    });

    if (!response.ok) throw new Error("OpenAI error");
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply: reply || local });
  } catch {
    return res.status(200).json({ reply: local });
  }
}
