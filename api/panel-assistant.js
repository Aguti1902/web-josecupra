const PANEL_ROUTES = {
  "/dashboard": "Panel principal con resumen del día, estadísticas y accesos rápidos.",
  "/dashboard/plan": "Microciclo / plan semanal con sesiones del día.",
  "/dashboard/mesocycle": "Mesociclo y periodización semanal.",
  "/dashboard/squad": "Plantilla del equipo.",
  "/dashboard/team-tests": "Tests físicos del equipo.",
  "/dashboard/cargas": "Control de carga RPE y alertas.",
  "/dashboard/club-settings": "Configuración del club: logo, equipos, staff.",
  "/dashboard/physical": "Tests físicos del jugador.",
  "/dashboard/feedback": "Feedback al entrenador.",
  "/dashboard/ranking": "Ranking del equipo.",
  "/admin/users": "Supervisión de usuarios y pagos.",
  "/admin/clubs": "Supervisión de clubs.",
};

const FAQ = [
  { keywords: ["microciclo", "sesión", "plan"], answer: "El Microciclo está en el menú lateral. Ahí ves la sesión del día generada por IA según tu mesociclo y material." },
  { keywords: ["plantilla", "jugador"], answer: "Ve a Plantilla (/dashboard/squad) para añadir jugadores o compartir el código del club." },
  { keywords: ["mesociclo", "periodización"], answer: "En Mesociclo configuras semanas de carga, descarga y competición." },
  { keywords: ["test", "físico"], answer: "Tests físicos: entrenadores en /dashboard/team-tests, jugadores en /dashboard/physical." },
  { keywords: ["carga", "rpe"], answer: "Cargas monitoriza RPE y alertas de sobrecarga (Sub-13 a Juvenil)." },
  { keywords: ["mi club", "configurar"], answer: "Mi Club (/dashboard/club-settings): logo, colores, equipos y staff." },
  { keywords: ["tutorial", "guía", "ayuda"], answer: "Pulsa el botón Guía en la barra superior para repetir el tutorial." },
];

function localAnswer(message, pathname) {
  const q = message.toLowerCase();
  if (/qu[eé] es esta|donde estoy/.test(q) && PANEL_ROUTES[pathname]) {
    return `Estás en ${pathname}. ${PANEL_ROUTES[pathname]}`;
  }
  let best = null, score = 0;
  for (const faq of FAQ) {
    let s = 0;
    for (const kw of faq.keywords) if (q.includes(kw)) s += kw.length;
    if (s > score) { score = s; best = faq; }
  }
  if (best && score >= 3) return best.answer;
  if (/hola|buenas/.test(q)) return "¡Hola! Soy el asistente DEPRO. Pregúntame sobre planificación, plantilla, tests o configuración.";
  return "Puedo ayudarte con planificación, plantilla, tests, cargas y navegación del panel. ¿Sobre qué sección quieres saber más?";
}

const KNOWLEDGE = `DEPRO: preparación física para fútbol. Perfiles: Jugador, Club (entrenador/coordinador), DEPRO Coach, Admin.
Sidebar izquierdo = navegación. Prueba 15 días gratis. Mi Club = configuración autogestionada.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, role = "player", pathname = "/dashboard", userName = "" } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: "message requerido" });

  const systemPrompt = `Eres el asistente virtual de DEPRO, plataforma de preparación física para fútbol.
Respondes SIEMPRE en español, de forma clara, amable y concisa (máximo 150 palabras).
Solo hablas del panel DEPRO y sus funcionalidades. No inventes features que no existen.

Contexto del usuario:
- Rol: ${role}
- Página actual: ${pathname}
- Nombre: ${userName || "Usuario"}

Conocimiento: ${KNOWLEDGE}
Rutas: ${Object.entries(PANEL_ROUTES).map(([k,v]) => k+": "+v).join("; ")}

Si no sabes algo, sugiere el botón Guía del header.`;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ ok: true, source: "local", reply: localAnswer(message, pathname) });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message.trim() },
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error OpenAI");

    const reply = data.choices?.[0]?.message?.content?.trim() || localAnswer(message, pathname);
    return res.status(200).json({ ok: true, source: "openai", reply });
  } catch (err) {
    return res.status(200).json({ ok: true, source: "local", reply: localAnswer(message, pathname), fallbackReason: err.message });
  }
}
