/**
 * Pasos del tutorial interactivo por rol.
 * target: selector CSS o data-tour attribute
 * placement: top | bottom | left | right | center
 */

export function getTutorialKey(user) {
  if (!user?.id) return null;
  const role = user.role === "admin"
    ? "admin"
    : user.club?.isSoloCoach
    ? "coach"
    : user.role === "club"
    ? (user.team_role === "coordinador" ? "coordinador" : "entrenador")
    : "player";
  return `depro_tutorial_v1_${user.id}_${role}`;
}

export function getTutorialSteps(user) {
  if (!user) return [];

  if (user.role === "admin") {
    return [
      {
        target: "center",
        placement: "center",
        title: "Bienvenido al panel Admin",
        body: "Desde aquí supervisas toda la plataforma DEPRO: usuarios, clubs, pagos y configuración del sistema.",
      },
      {
        target: '[data-tour="sidebar-nav"]',
        placement: "right",
        title: "Navegación principal",
        body: "El menú lateral agrupa las secciones: General, Clubs, Individuales, DEPRO Coach y Sistema. Cada grupo tiene su color identificativo.",
      },
      {
        target: '[data-tour="nav-users"]',
        placement: "right",
        title: "Usuarios y pagos",
        body: "En Usuarios ves todos los registros, tipos de plan, estado de pago y fechas de alta. Ideal para supervisión sin intervenir en la operativa diaria.",
      },
      {
        target: '[data-tour="nav-clubs"]',
        placement: "right",
        title: "Supervisión de clubs",
        body: "Los clubs se autogestionan. Aquí puedes ver detalles, activar o desactivar acceso y revisar equipos en modo solo lectura.",
      },
      {
        target: '[data-tour="header-actions"]',
        placement: "bottom",
        title: "Guía y asistente IA",
        body: "Pulsa «Guía» para repetir este tutorial. El asistente IA (abajo a la derecha) resuelve dudas sobre cualquier funcionalidad del panel.",
      },
      {
        target: '[data-tour="ai-assistant"]',
        placement: "top",
        title: "Asistente DEPRO IA",
        body: "Pregunta lo que necesites: usuarios, clubs, motor de planes, catálogo… Respuestas instantáneas sobre el panel.",
      },
    ];
  }

  if (user.club?.isSoloCoach) {
    return [
      {
        target: "center",
        placement: "center",
        title: "¡Bienvenido a DEPRO Coach!",
        body: "Tu panel personal para planificar, generar sesiones con IA y gestionar tu plantilla. Empezamos con un tour rápido.",
      },
      {
        target: '[data-tour="sidebar-nav"]',
        placement: "right",
        title: "Tu menú de trabajo",
        body: "Dashboard, Planificación, Sesiones, Plantilla, Tests y Carga. Todo lo que necesitas como entrenador individual.",
      },
      {
        target: '[data-tour="nav-dashboard"]',
        placement: "right",
        title: "Dashboard",
        body: "Resumen del día: sesión de hoy, accesos rápidos y límites de tu plan. Empieza aquí cada mañana.",
      },
      {
        target: '[data-tour="nav-mesocycle"]',
        placement: "right",
        title: "Planificación IA",
        body: "Configura meso y microciclos. La IA genera sesiones adaptadas a tu material, objetivos y bloque de edad.",
      },
      {
        target: '[data-tour="nav-plan"]',
        placement: "right",
        title: "Sesiones del día",
        body: "Aquí ejecutas la sesión: ejercicios, series, descansos y marcado de completado.",
      },
      {
        target: '[data-tour="nav-squad"]',
        placement: "right",
        title: "Plantilla",
        body: "Gestiona jugadores, datos físicos y evolución. Añade miembros manualmente o comparte tu código.",
      },
      {
        target: '[data-tour="ai-assistant"]',
        placement: "top",
        title: "Asistente IA",
        body: "¿Dudas? Pregúntame en cualquier momento. Conozco todo el panel y te guío paso a paso.",
      },
    ];
  }

  if (user.role === "club" && user.team_role === "coordinador") {
    return [
      {
        target: "center",
        placement: "center",
        title: "Bienvenido, coordinador",
        body: "Gestiona todo el club desde aquí: equipos, identidad visual, staff y supervisión de planificación.",
      },
      {
        target: '[data-tour="sidebar-nav"]',
        placement: "right",
        title: "Menú del coordinador",
        body: "Dashboard, Plantilla, Mi Club y Mi perfil. Accede a la vista de entrenador haciendo clic en cualquier equipo.",
      },
      {
        target: '[data-tour="nav-dashboard"]',
        placement: "right",
        title: "Vista general del club",
        body: "Estadísticas globales y tarjetas de cada equipo. Haz clic en un equipo para ver su planificación.",
      },
      {
        target: '[data-tour="nav-club-settings"]',
        placement: "right",
        title: "Mi Club",
        body: "Logo, colores, equipos, entrenadores y código de acceso para jugadores. Todo autogestionable.",
      },
      {
        target: '[data-tour="nav-squad"]',
        placement: "right",
        title: "Plantilla global",
        body: "Consulta jugadores de todos los equipos y gestiona altas desde un solo lugar.",
      },
      {
        target: '[data-tour="ai-assistant"]',
        placement: "top",
        title: "Asistente IA",
        body: "Pregunta sobre configuración del club, equipos, staff o cualquier funcionalidad.",
      },
    ];
  }

  if (user.role === "club") {
    return [
      {
        target: "center",
        placement: "center",
        title: "Bienvenido al panel del entrenador",
        body: "Planifica microciclos, gestiona tu plantilla, registra tests y controla cargas. Te enseñamos lo esencial en 1 minuto.",
      },
      {
        target: '[data-tour="sidebar-nav"]',
        placement: "right",
        title: "Navegación",
        body: "Microciclo, Mesociclo, Plantilla, Tests y Cargas (según categoría). Tu centro de operaciones diario.",
      },
      {
        target: '[data-tour="nav-plan"]',
        placement: "right",
        title: "Microciclo / Sesiones",
        body: "La sesión del día generada por IA. Revisa ejercicios, intensidad (A/B/C) y marca completados.",
      },
      {
        target: '[data-tour="nav-mesocycle"]',
        placement: "right",
        title: "Mesociclo",
        body: "Periodización semanal: carga, descarga y competición distribuidas automáticamente.",
      },
      {
        target: '[data-tour="nav-squad"]',
        placement: "right",
        title: "Plantilla",
        body: "Añade jugadores, edita datos y comparte el código del club para registros automáticos.",
      },
      {
        target: '[data-tour="nav-tests"]',
        placement: "right",
        title: "Tests físicos",
        body: "Registra evaluaciones del equipo. Los datos alimentan planes personalizados y alertas.",
      },
      {
        target: '[data-tour="ai-assistant"]',
        placement: "top",
        title: "Asistente IA DEPRO",
        body: "Pregúntame sobre planificación, cargas, plantilla o cualquier duda del panel.",
      },
    ];
  }

  // Jugador
  return [
    {
      target: "center",
      placement: "center",
      title: "¡Hola! Este es tu panel de jugador",
      body: "Aquí ves tu plan de entrenamiento, tests, feedback y ranking del equipo. Te guiamos en unos segundos.",
    },
    {
      target: '[data-tour="sidebar-nav"]',
      placement: "right",
      title: "Tu menú",
      body: "Dashboard, Plan semanal, Tests, Feedback, Ranking y Mi perfil.",
    },
    {
      target: '[data-tour="nav-dashboard"]',
      placement: "right",
      title: "Dashboard",
      body: "Resumen de hoy: sesión pendiente, adherencia de la semana y mensajes del entrenador.",
    },
    {
      target: '[data-tour="nav-plan"]',
      placement: "right",
      title: "Plan semanal",
      body: "Tu microciclo personalizado. Marca cada sesión completada para mejorar tu ranking.",
    },
    {
      target: '[data-tour="nav-physical"]',
      placement: "right",
      title: "Tests físicos",
      body: "Registra tus resultados y sigue tu evolución sprint, salto, resistencia…",
    },
    {
      target: '[data-tour="nav-feedback"]',
      placement: "right",
      title: "Feedback",
      body: "Comunica sensaciones, molestias e intensidad percibida a tu entrenador.",
    },
    {
      target: '[data-tour="ai-assistant"]',
      placement: "top",
      title: "Asistente IA",
      body: "¿No sabes cómo hacer algo? Pregúntame y te explico paso a paso.",
    },
  ];
}
