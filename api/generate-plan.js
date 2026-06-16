export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { user, sessionType, exercises = [], plantilla } = req.body || {};
  if (!user || !sessionType) return res.status(400).json({ error: "user y sessionType requeridos" });

  const lesionStr = (user.lesion?.length > 0 ? user.lesion.join(", ") : "ninguna");
  const exList = exercises.map((e) => `- ${e.nombre || e.name} [${(e.etiquetas || []).join(", ")}]`).join("\n");

  const prompt = {
    system: `Eres un generador de rutinas profesionales. No inventas ejercicios. Solo organizas los ejercicios enviados por el sistema en sesiones completas usando la plantilla indicada.`,
    user: `Genera sesión "${sessionType}" para:
Edad: ${user.edad}
Objetivo: ${user.objetivo}
Deporte: ${user.deporte}
Frecuencia: ${user.frecuencia}
Material: ${user.material}
Lesiones: ${lesionStr}

Ejercicios disponibles:
${exList}

Plantilla:
${plantilla || sessionType}`,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: true, source: "local", message: "IA no configurada", prompt });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: prompt.system }, { role: "user", content: prompt.user }],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error OpenAI");
    return res.status(200).json({ ok: true, source: "openai", text: data.choices?.[0]?.message?.content || "", prompt });
  } catch (err) {
    return res.status(200).json({ ok: true, source: "local", error: err.message, prompt });
  }
}
