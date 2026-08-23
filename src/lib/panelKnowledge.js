/**
 * Base de conocimiento del panel DEPRO para el asistente IA.
 * Usada como fallback local y como contexto del system prompt en la API.
 */

export const PANEL_KNOWLEDGE = {
  general: `
DEPRO es una plataforma de preparación física para fútbol con tres perfiles:
- Jugador: plan semanal personalizado, tests físicos, feedback al entrenador, ranking.
- Club (entrenador/coordinador): microciclos, mesociclos, plantilla, tests de equipo, control de cargas (Bloque 2/3).
- DEPRO Coach: entrenador individual con planificación IA, sesiones automáticas y biblioteca de ejercicios.

Navegación principal en el sidebar izquierdo. El header muestra la sección activa.
Prueba gratuita: 15 días con tarjeta (0 € hoy). Configuración del club en "Mi Club" (coordinadores).
`,

  routes: {
    "/dashboard": "Panel principal con resumen del día, estadísticas y accesos rápidos.",
    "/dashboard/plan": "Microciclo / plan semanal. Sesiones del día con ejercicios. Marca sesiones completadas.",
    "/dashboard/mesocycle": "Mesociclo y periodización. Distribuye cargas por semanas del mes.",
    "/dashboard/squad": "Plantilla del equipo. Añade jugadores, datos físicos y códigos de acceso.",
    "/dashboard/team-tests": "Tests físicos del equipo. Registra resultados y evolución.",
    "/dashboard/cargas": "Control de carga (RPE, minutos, alertas). Solo equipos Sub-13 a Juvenil.",
    "/dashboard/club-settings": "Mi Club: identidad visual, equipos, staff y login_code del club.",
    "/dashboard/club-profile": "Perfil del entrenador/coordinador: foto, datos de contacto.",
    "/dashboard/physical": "Tests físicos del jugador. Historial y objetivos.",
    "/dashboard/feedback": "Envía feedback al entrenador sobre sesiones y sensaciones.",
    "/dashboard/ranking": "Ranking del equipo según adherencia y rendimiento.",
    "/dashboard/profile": "Perfil del jugador: datos personales, lesiones, objetivos.",
    "/admin": "Panel admin: resumen global de la plataforma.",
    "/admin/users": "Supervisión de usuarios, planes y pagos.",
    "/admin/clubs": "Supervisión de clubs (solo lectura, activar/desactivar).",
  },

  faqs: [
    {
      keywords: ["microciclo", "sesión", "sesiones", "plan semanal", "entrenamiento hoy"],
      roles: ["club", "coach"],
      answer: "El **Microciclo** está en el menú lateral → «Microciclo» o «Sesiones». Ahí ves la sesión del día generada por la IA según tu mesociclo, material disponible y plantilla. Puedes marcar ejercicios completados y revisar el protocolo (A/B/C) de intensidad.",
    },
    {
      keywords: ["mesociclo", "periodización", "planificación", "semanas"],
      roles: ["club", "coach"],
      answer: "En **Mesociclo** (/dashboard/mesocycle) configuras la periodización: semanas de carga, descarga y competición. DEPRO distribuye automáticamente las sesiones según el bloque de edad del equipo (Bloque 1/2/3).",
    },
    {
      keywords: ["plantilla", "jugador", "añadir jugador", "squad"],
      roles: ["club", "coach"],
      answer: "Ve a **Plantilla** (/dashboard/squad). Puedes añadir jugadores manualmente o compartir el código del club para que se registren. Cada jugador tiene datos físicos, posición y historial de tests.",
    },
    {
      keywords: ["test", "tests", "físico", "evaluación"],
      roles: ["club", "coach", "player"],
      answer: "Los **Tests físicos** registran métricas como sprint, salto, resistencia. Entrenadores: /dashboard/team-tests. Jugadores: /dashboard/physical. Los resultados alimentan el ranking y la personalización del plan.",
    },
    {
      keywords: ["carga", "cargas", "rpe", "fatiga", "sobrecarga"],
      roles: ["club", "coach"],
      answer: "**Cargas** (/dashboard/cargas) monitoriza RPE, minutos de entrenamiento y alertas de sobrecarga. Disponible para categorías Sub-13 a Juvenil (Bloques 2 y 3).",
    },
    {
      keywords: ["feedback", "comentario", "entrenador"],
      roles: ["player"],
      answer: "En **Feedback** (/dashboard/feedback) ves los mensajes de tu preparador. Solo está incluido en **Premium**; en Standard te pedirá actualizar el plan.",
    },
    {
      keywords: ["ranking", "clasificación", "puntos"],
      roles: ["player"],
      answer: "El **Ranking** (/dashboard/ranking) muestra la posición en el equipo según adherencia al plan y rendimiento en tests. Completa sesiones para subir posiciones.",
    },
    {
      keywords: ["mi club", "equipo", "logo", "color", "configurar club"],
      roles: ["club"],
      answer: "**Mi Club** (/dashboard/club-settings) permite editar nombre, logo, colores, slogan, crear equipos y gestionar staff (entrenadores/coordinadores). El login_code permite que jugadores se unan al club.",
    },
    {
      keywords: ["coordinador", "todos los equipos", "vista equipo"],
      roles: ["club"],
      answer: "Como **coordinador**, en el Dashboard ves todos los equipos del club. Haz clic en un equipo para entrar en su vista de entrenador (solo lectura/planificación). Usa «Todos los equipos» en el sidebar para volver.",
    },
    {
      keywords: ["ia", "inteligencia artificial", "generar", "automático"],
      roles: ["club", "coach", "player"],
      answer: "DEPRO usa IA para generar microciclos, adaptar ejercicios según lesiones/material y sugerir periodización. El motor considera bloque de edad, objetivos y tests recientes. Pregúntame sobre cualquier sección concreta.",
    },
    {
      keywords: ["prueba", "gratis", "15 días", "plan", "suscripción", "pago"],
      roles: ["club", "coach", "player"],
      answer: "Tienes **15 días de prueba gratis** con tarjeta (cargo 0 € al empezar). Al finalizar el trial se cobra el plan. Los límites (jugadores, equipos, IA) aparecen en la tarjeta de uso del dashboard.",
    },
    {
      keywords: ["perfil", "foto", "contraseña", "cuenta"],
      roles: ["club", "coach", "player"],
      answer: "Tu perfil está en «Mi perfil» del menú lateral. Puedes cambiar foto, nombre y datos de contacto. Para cambiar contraseña, usa la opción en ajustes de perfil o el enlace de recuperación en login.",
    },
    {
      keywords: ["admin", "usuarios", "supervisión"],
      roles: ["admin"],
      answer: "Como **administrador**, supervisas usuarios (/admin/users), clubs (/admin/clubs) y pagos. No creas clubs manualmente: los usuarios se autogestionan. Puedes activar/desactivar clubs y ver métricas globales.",
    },
    {
      keywords: ["tutorial", "guía", "ayuda", "cómo funciona", "empezar"],
      roles: ["club", "coach", "player", "admin"],
      answer: "Pulsa el botón **«Guía»** (icono ?) en la barra superior para repetir el tutorial interactivo. También puedes preguntarme aquí cualquier duda sobre el panel.",
    },
  ],
};

export const QUICK_QUESTIONS = {
  player: [
    "¿Cómo veo mi plan de hoy?",
    "¿Cómo envío feedback al entrenador?",
    "¿Qué es el ranking?",
    "¿Cómo registro mis tests?",
  ],
  club: [
    "¿Cómo creo un microciclo?",
    "¿Cómo añado jugadores a la plantilla?",
    "¿Qué son las cargas de entrenamiento?",
    "¿Cómo configuro mi club?",
  ],
  coach: [
    "¿Cómo funciona la planificación IA?",
    "¿Dónde veo la sesión de hoy?",
    "¿Cómo gestiono mi plantilla?",
    "¿Qué tests puedo hacer?",
  ],
  admin: [
    "¿Cómo superviso usuarios?",
    "¿Cómo activo o desactivo un club?",
    "¿Dónde veo los pagos?",
    "¿Qué hace el motor de planes?",
  ],
};

/** Resuelve respuesta local por keywords (sin API). */
export function resolveLocalAnswer(message, role = "player", pathname = "/dashboard") {
  const q = message.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  // Ruta actual
  if (/qu[eé] es esta|esta p[aá]gina|donde estoy|secci[oó]n actual/.test(q)) {
    const routeInfo = PANEL_KNOWLEDGE.routes[pathname];
    if (routeInfo) {
      return `Estás en **${pathname}**. ${routeInfo}`;
    }
  }

  let best = null;
  let bestScore = 0;

  for (const faq of PANEL_KNOWLEDGE.faqs) {
    if (faq.roles && !faq.roles.includes(role) && role !== "admin") {
      if (role === "club" && faq.roles.includes("club")) { /* ok */ }
      else if (role === "coach" && faq.roles.includes("coach")) { /* ok */ }
      else if (!faq.roles.includes(role) && role !== "club" && role !== "coach") continue;
    }

    let score = 0;
    for (const kw of faq.keywords) {
      const normalized = kw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (q.includes(normalized)) score += normalized.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (best && bestScore >= 3) return best.answer;

  if (/hola|buenas|hey|saludos/.test(q)) {
    return "¡Hola! Soy el asistente de DEPRO. Pregúntame sobre planificación, plantilla, tests, cargas, configuración del club o cualquier sección del panel.";
  }

  return `Puedo ayudarte con el panel DEPRO. Prueba preguntar sobre:\n\n• Planificación y sesiones\n• Plantilla y jugadores\n• Tests y cargas\n• Configuración del club\n• Tu plan y prueba gratuita\n\nTambién usa el botón **Guía** en la barra superior para un tour interactivo.`;
}

export function getAssistantRole(user) {
  if (!user) return "player";
  if (user.role === "admin") return "admin";
  if (user.club?.isSoloCoach) return "coach";
  if (user.role === "club") return "club";
  return "player";
}
