/** Conocimiento del sitio público DEPRO para el asistente web */

export const WEBSITE_QUICK_QUESTIONS = [
  "¿Qué incluye la prueba gratis?",
  "¿Cuánto cuesta DEPRO?",
  "¿Para quién es DEPRO?",
  "¿Cómo funciona la IA?",
];

export const WEBSITE_FAQ = [
  {
    keywords: ["prueba", "gratis", "15 días", "tarjeta"],
    answer: "Puedes probar DEPRO **15 días gratis** sin tarjeta. Regístrate en «Prueba gratis» o con Google y tendrás acceso a planificación IA, cargas y tests.",
  },
  {
    keywords: ["precio", "precios", "cuesta", "plan", "€", "euro"],
    answer: "Los planes empiezan desde **14,99 €/mes** (Coach Pro). Hay opciones para entrenadores individuales y clubs. Consulta la página de [Precios](/precios) para comparar funcionalidades.",
  },
  {
    keywords: ["club", "clubs", "coordinador", "multi-equipo"],
    answer: "**DEPRO Club** permite gestionar varios equipos, white-label y panel de coordinador. Ideal para academias y clubs con varias categorías.",
  },
  {
    keywords: ["entrenador", "coach", "individual"],
    answer: "**DEPRO Coach** es para entrenadores individuales: microciclos automáticos, biblioteca de 90+ ejercicios, control de carga y tests físicos.",
  },
  {
    keywords: ["jugador", "player", "app", "móvil"],
    answer: "Los **jugadores** ven su plan semanal, registran feedback, consultan tests y ranking desde su panel. Todo sincronizado con el entrenador.",
  },
  {
    keywords: ["ia", "inteligencia", "motor", "automático"],
    answer: "La **IA deportiva** de DEPRO genera microciclos y sesiones A/B/C con motores de reglas validados — no es una caja negra. Cada sesión es trazable y editable.",
  },
  {
    keywords: ["carga", "rpe", "wellness", "fatiga"],
    answer: "El **control de carga** monitoriza RPE, wellness y alertas de sobrecarga por jugador. Concilia lo planificado con lo ejecutado.",
  },
  {
    keywords: ["test", "tests", "físico", "evaluación"],
    answer: "La batería de **tests físicos** cubre sprint, salto, resistencia y más, con seguimiento T1→T3 y evolución por temporada.",
  },
  {
    keywords: ["planificación", "microciclo", "sesión", "periodización"],
    answer: "DEPRO genera **microciclos y mesociclos** automáticos con sesiones A/B/C adaptadas a categoría, fase y material disponible.",
  },
  {
    keywords: ["registr", "empezar", "login", "google", "cuenta"],
    answer: "Pulsa **«Prueba gratis 15 días»** o **«Empezar con Google»** en la home. En 2 minutos tendrás tu cuenta activa.",
  },
  {
    keywords: ["contacto", "ventas", "soporte", "email"],
    answer: "Escríbenos a **ventas@depro.es** o usa el formulario en [Recursos → Contacto](/recursos#contacto). Respondemos en menos de 24h.",
  },
];

export function resolveWebsiteAnswer(message, pathname = "/") {
  const q = message.toLowerCase();

  if (/hola|buenas|hey|saludos/.test(q)) {
    return "¡Hola! Soy el asistente de DEPRO. Puedo ayudarte con precios, prueba gratis, funcionalidades y perfiles (entrenador, club o jugador). ¿Qué te gustaría saber?";
  }

  let best = null;
  let score = 0;
  for (const faq of WEBSITE_FAQ) {
    let s = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw)) s += kw.length;
    }
    if (s > score) {
      score = s;
      best = faq;
    }
  }
  if (best && score >= 3) return best.answer;

  if (/funcionalidad|feature|qué hace|que hace/.test(q)) {
    return "DEPRO incluye **planificación IA**, **control de carga**, **tests físicos**, **plantilla**, **periodización** y **panel club**. Explora [/funcionalidades](/funcionalidades) para ver cada módulo.";
  }

  return "Puedo ayudarte con la prueba gratis, precios, planificación IA, cargas, tests y perfiles de DEPRO. ¿Sobre qué quieres saber más?";
}
