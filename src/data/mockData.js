// Perfiles gestionados por Supabase — array vacío (fallback sin conexión)
export const clients = [];

// Ranking gestionado por Supabase — vacío hasta que haya jugadores reales
export const rankingData = {
  leaderboard: [],
  activityFeed: [],
};

export const weeklyPlan = [
  {
    day: "Monday",
    shortDay: "MON",
    date: "Apr 21",
    sessions: [
      {
        id: 1,
        title: "Technical Foundation",
        duration: "90 min",
        intensity: "Medium",
        type: "Technical",
        status: "completed",
        objective: "Improve first touch and ball control under pressure",
        exercises: [
          {
            name: "Rondo 4v2",
            duration: "15 min",
            sets: "3",
            reps: "5 min each",
            description: "Maintain possession in tight spaces. Focus on one-touch passes.",
            videoUrl: "#",
            tips: "Keep your body open to receive. Scan before the ball arrives.",
          },
          {
            name: "Triangle Passing",
            duration: "20 min",
            sets: "4",
            reps: "3 min each",
            description: "Three-player combination with movement after pass.",
            videoUrl: "#",
            tips: "Pass and move. Create angles. Don't stay static.",
          },
          {
            name: "1v1 Technical Duel",
            duration: "25 min",
            sets: "5",
            reps: "2 min each",
            description: "Beat your opponent in reduced space. Use body feints.",
            videoUrl: "#",
            tips: "Change of pace is key. Attack the space behind.",
          },
          {
            name: "Finishing Circuit",
            duration: "20 min",
            sets: "3",
            reps: "8 shots",
            description: "Shots after receiving, turns and volleys.",
            videoUrl: "#",
            tips: "First touch toward goal. Shoot with purpose.",
          },
        ],
      },
    ],
  },
  {
    day: "Tuesday",
    shortDay: "TUE",
    date: "Apr 22",
    sessions: [
      {
        id: 2,
        title: "Physical Conditioning",
        duration: "75 min",
        intensity: "High",
        type: "Physical",
        status: "today",
        objective: "Develop explosive speed and aerobic capacity",
        exercises: [
          {
            name: "Dynamic Warm-up",
            duration: "10 min",
            sets: "1",
            reps: "Full circuit",
            description: "Hip mobility, leg swings, dynamic stretching.",
            videoUrl: "#",
            tips: "Gradual intensity. Prepare joints for explosive work.",
          },
          {
            name: "Sprint Intervals 30m",
            duration: "20 min",
            sets: "6",
            reps: "30m sprints",
            description: "Maximum acceleration sprints with full recovery.",
            videoUrl: "#",
            tips: "Explosive start. Drive your arms. Full recovery between sets.",
          },
          {
            name: "SAQ Ladder Drills",
            duration: "15 min",
            sets: "4",
            reps: "3 patterns",
            description: "Agility ladder: Ickey shuffle, lateral, high knees.",
            videoUrl: "#",
            tips: "Speed is secondary to precision. Build up gradually.",
          },
          {
            name: "Plyometric Box Jumps",
            duration: "15 min",
            sets: "4",
            reps: "8 jumps",
            description: "Box jumps, depth jumps, lateral hops.",
            videoUrl: "#",
            tips: "Land softly. Full extension at top. Quality over quantity.",
          },
        ],
      },
    ],
  },
  {
    day: "Wednesday",
    shortDay: "WED",
    date: "Apr 23",
    sessions: [
      {
        id: 3,
        title: "Active Recovery",
        duration: "45 min",
        intensity: "Low",
        type: "Recovery",
        status: "upcoming",
        objective: "Active recovery + mobility work",
        exercises: [
          {
            name: "Light Jog",
            duration: "15 min",
            sets: "1",
            reps: "Continuous",
            description: "Easy pace jogging to flush metabolic waste.",
            videoUrl: "#",
            tips: "Conversational pace. This is recovery, not a workout.",
          },
          {
            name: "Yoga Flow",
            duration: "20 min",
            sets: "1",
            reps: "Full flow",
            description: "Hip flexors, hamstrings, thoracic rotation.",
            videoUrl: "#",
            tips: "Hold each position 30-45 seconds. Breathe deeply.",
          },
        ],
      },
    ],
  },
  {
    day: "Thursday",
    shortDay: "THU",
    date: "Apr 24",
    sessions: [
      {
        id: 4,
        title: "Tactical + Technical",
        duration: "90 min",
        intensity: "High",
        type: "Tactical",
        status: "upcoming",
        objective: "Positional play and pressing patterns",
        exercises: [
          {
            name: "Positional Game 8v8",
            duration: "30 min",
            sets: "3",
            reps: "10 min each",
            description: "Maintain structure with and without the ball.",
            videoUrl: "#",
            tips: "Compact shape defensively. Expand when in possession.",
          },
          {
            name: "High Press Trigger",
            duration: "25 min",
            sets: "4",
            reps: "5 min each",
            description: "Coordinated pressing from front to back.",
            videoUrl: "#",
            tips: "Press trigger is the backpass. Cut passing lanes.",
          },
        ],
      },
    ],
  },
  {
    day: "Friday",
    shortDay: "FRI",
    date: "Apr 25",
    sessions: [
      {
        id: 5,
        title: "Match Preparation",
        duration: "60 min",
        intensity: "Medium",
        type: "Technical",
        status: "upcoming",
        objective: "Pre-match activation and set pieces",
        exercises: [
          {
            name: "Team Activation",
            duration: "15 min",
            sets: "2",
            reps: "Circuit",
            description: "Light passing, dynamic movements, mental focus.",
            videoUrl: "#",
            tips: "Build confidence. Keep it light and positive.",
          },
          {
            name: "Set Pieces Review",
            duration: "25 min",
            sets: "3",
            reps: "Per situation",
            description: "Corner kick routines, free kicks, throw-ins.",
            videoUrl: "#",
            tips: "Know your role. Precision over power.",
          },
        ],
      },
    ],
  },
  {
    day: "Saturday",
    shortDay: "SAT",
    date: "Apr 26",
    sessions: [
      {
        id: 6,
        title: "MATCH DAY",
        duration: "120 min",
        intensity: "Maximum",
        type: "Match",
        status: "upcoming",
        objective: "Apply everything in a real game context",
        exercises: [],
      },
    ],
  },
  {
    day: "Sunday",
    shortDay: "SUN",
    date: "Apr 27",
    sessions: [],
  },
];

export const sessionLibrary = [
  {
    id: 1,
    title: "Ball Control Mastery",
    category: "Technical",
    subcategory: "Control",
    age: "U15-U21",
    intensity: "Medium",
    duration: "75 min",
    exercises: 5,
    description: "Comprehensive session focused on first touch quality and close control.",
    tags: ["Control", "Technique", "Individual"],
  },
  {
    id: 2,
    title: "Speed & Agility Circuit",
    category: "Physical",
    subcategory: "Speed",
    age: "U17-Senior",
    intensity: "High",
    duration: "60 min",
    exercises: 6,
    description: "Explosive speed development with ladder drills and sprint intervals.",
    tags: ["Speed", "Agility", "Fitness"],
  },
  {
    id: 3,
    title: "Passing Combinations",
    category: "Technical",
    subcategory: "Passing",
    age: "U13-Senior",
    intensity: "Low",
    duration: "90 min",
    exercises: 4,
    description: "Systematic approach to building passing patterns and combinations.",
    tags: ["Passing", "Combination", "Team"],
  },
  {
    id: 4,
    title: "Finishing Under Pressure",
    category: "Technical",
    subcategory: "Finishing",
    age: "U15-Senior",
    intensity: "High",
    duration: "60 min",
    exercises: 5,
    description: "Goal-scoring scenarios with defensive pressure and time constraints.",
    tags: ["Finishing", "Shooting", "Goals"],
  },
  {
    id: 5,
    title: "High Intensity Pressing",
    category: "Tactical",
    subcategory: "Pressing",
    age: "U17-Senior",
    intensity: "Maximum",
    duration: "75 min",
    exercises: 4,
    description: "Coordinated team pressing with trigger points and press recovery.",
    tags: ["Pressing", "Tactical", "Team"],
  },
  {
    id: 6,
    title: "Injury Prevention Protocol",
    category: "Physical",
    subcategory: "Prevention",
    age: "All Ages",
    intensity: "Low",
    duration: "45 min",
    exercises: 8,
    description: "FIFA 11+ inspired protocol for reducing injury risk in players.",
    tags: ["Prevention", "Mobility", "Health"],
  },
  {
    id: 7,
    title: "1v1 Defensive Duels",
    category: "Tactical",
    subcategory: "Defense",
    age: "U15-Senior",
    intensity: "High",
    duration: "60 min",
    exercises: 4,
    description: "Defensive positioning, jockeying and winning the ball in 1v1 situations.",
    tags: ["Defense", "1v1", "Tactical"],
  },
  {
    id: 8,
    title: "Coordination & Balance",
    category: "Physical",
    subcategory: "Coordination",
    age: "U13-U17",
    intensity: "Low",
    duration: "45 min",
    exercises: 6,
    description: "Proprioception and balance work to build athletic base.",
    tags: ["Coordination", "Balance", "Foundation"],
  },
];

export const technicalContent = [
  {
    id: 1,
    category: "Passing",
    title: "Short Pass Technique",
    level: "Foundation",
    duration: "8 min",
    description: "Correct foot positioning, body orientation and follow-through for accurate short passes.",
    keyPoints: ["Inside of foot contact", "Non-kicking foot placement", "Body over ball", "Follow through to target"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 2,
    category: "Passing",
    title: "Long Ball Mastery",
    level: "Advanced",
    duration: "10 min",
    description: "Generate power and accuracy for switches of play and long diagonal passes.",
    keyPoints: ["Laces contact point", "Hip rotation", "Contact point below ball", "Lock ankle on contact"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 3,
    category: "Control",
    title: "First Touch Under Pressure",
    level: "Intermediate",
    duration: "12 min",
    description: "Control the ball quickly to protect it and prepare for next action under defensive pressure.",
    keyPoints: ["Scan before receiving", "Open body position", "Cushion the ball", "Move away from pressure"],
    videoUrl: "#",
    hasPdf: false,
  },
  {
    id: 4,
    category: "Control",
    title: "Chest and Thigh Control",
    level: "Foundation",
    duration: "7 min",
    description: "Use upper body to control aerial balls and distribute quickly.",
    keyPoints: ["Puff chest out", "Withdraw on contact", "Direct to feet", "Stay balanced"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 5,
    category: "Finishing",
    title: "Placement Shooting",
    level: "Intermediate",
    duration: "15 min",
    description: "Accurate finishing to corners using inside of foot and side-foot technique.",
    keyPoints: ["Pick your corner early", "Non-kicking foot beside ball", "Head down on contact", "Follow through"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 6,
    category: "Finishing",
    title: "Volley Technique",
    level: "Advanced",
    duration: "12 min",
    description: "Strike first-time shots from crosses and rebounds with power and accuracy.",
    keyPoints: ["Eyes on ball", "Side-on body shape", "Strike through the ball", "Balanced landing"],
    videoUrl: "#",
    hasPdf: false,
  },
];

export const physicalContent = [
  {
    id: 1,
    category: "Speed",
    title: "Acceleration Mechanics",
    level: "Intermediate",
    duration: "10 min",
    description: "Proper sprint mechanics for the first 10 meters. Drive phase and transition.",
    keyPoints: ["Forward lean at start", "High knee drive", "Arm drive", "Heel to glute on recovery"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 2,
    category: "Speed",
    title: "Change of Direction",
    level: "Intermediate",
    duration: "8 min",
    description: "Decelerate, plant and re-accelerate efficiently to beat defenders.",
    keyPoints: ["Low center of gravity", "Penultimate step plant", "Drive off outside leg", "Head up for vision"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 3,
    category: "Coordination",
    title: "Ladder Drills Progression",
    level: "Foundation",
    duration: "12 min",
    description: "10-drill ladder progression from basic to complex footwork patterns.",
    keyPoints: ["Start slow, build speed", "High foot contacts", "Arms active throughout", "Focus not on ladder, but posture"],
    videoUrl: "#",
    hasPdf: false,
  },
  {
    id: 4,
    category: "Prevention",
    title: "Hamstring Protocol",
    level: "Foundation",
    duration: "15 min",
    description: "Nordic curls and eccentric loading to build hamstring resilience and prevent tears.",
    keyPoints: ["Controlled eccentric phase", "Anchor feet securely", "Full range of motion", "3x per week minimum"],
    videoUrl: "#",
    hasPdf: true,
  },
  {
    id: 5,
    category: "Prevention",
    title: "Ankle Stability Training",
    level: "Foundation",
    duration: "10 min",
    description: "Proprioception exercises to build ankle stability and reduce sprain risk.",
    keyPoints: ["Single leg balance", "Eyes closed progression", "Unstable surface", "Reactive drills"],
    videoUrl: "#",
    hasPdf: true,
  },
];

/** @deprecated Ya no se usan mocks de feedback. Persistencia en playerFeedback.js */
export const coachFeedback = [];

export const testimonials = [
  {
    name: "Alejandro Torres",
    role: "Midfielder, U21",
    club: "Valencia CF Academy",
    text: "In 6 months with Jose's system I went from U18 to U21. The personalized approach made all the difference — this isn't generic YouTube content, it's a real training system designed for me.",
    rating: 5,
    initials: "AT",
    color: "#FF7A00",
  },
  {
    name: "FC Almeria Youth",
    role: "U17 Club",
    club: "Almeria, Spain",
    text: "We hired Jose to create our seasonal structure and individual player programs. The level of detail and professionalism is something we hadn't seen from any other methodology consultant.",
    rating: 5,
    initials: "FA",
    color: "#DC143C",
  },
  {
    name: "Pedro Delgado",
    role: "Winger, Professional",
    club: "Segunda División",
    text: "I was struggling with injuries and consistency. The physical preparation program eliminated my recurring hamstring problems and my stats improved dramatically in the second half of the season.",
    rating: 5,
    initials: "PD",
    color: "#00A86B",
  },
  {
    name: "Coach Marco Silva",
    role: "Head Coach",
    club: "Club Deportivo U19",
    text: "The annual planning system gave our staff a professional structure we previously couldn't afford. Our players have individualized programs and our retention rate is up 40%.",
    rating: 5,
    initials: "MS",
    color: "#4169E1",
  },
];

// Plan de club gestionado por Supabase
export const clubWeeklyPlan = [];

/* Plantilla del club (registro básico de jugadores) */
// Plantilla gestionada por Supabase
export const clubSquad = [];

/* Guía técnico-táctica (ayuda pedagógica, no se guarda) */
export const tacticalGuides = [
  {
    key: "posesion",
    label: "Posesión",
    objective: "Mejorar la circulación del balón y la calidad del último pase.",
    conditions: { space: "30 × 25 m", players: "10–14", time: "15–20 min", intensity: "Media" },
    orientations: [
      "Cambiar de orientación tras 5 pases consecutivos.",
      "Recibir siempre con el cuerpo abierto.",
      "Buscar el tercer hombre como salida segura.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "juego-posicion",
    label: "Juego de posición",
    objective: "Ocupar zonas con criterio para generar superioridad numérica.",
    conditions: { space: "30 × 30 m", players: "9–13", time: "20 min", intensity: "Media-alta" },
    orientations: [
      "Líneas siempre escalonadas, evitar misma altura.",
      "El receptor decide el ritmo: una o dos toques.",
      "Limitar toques en zona central.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "ruedas",
    label: "Ruedas de pase",
    objective: "Automatismos de pase, control y orientación corporal.",
    conditions: { space: "Cuadrado 20 × 20 m", players: "6–8", time: "10–15 min", intensity: "Baja-media" },
    orientations: [
      "Velocidad de ejecución por encima de la velocidad del balón.",
      "Cambiar la dirección del giro cada minuto.",
      "Variar tipo de pase: interior, exterior, raso, picado.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "circuito",
    label: "Circuito técnico",
    objective: "Repetir acciones individuales con alta calidad técnica.",
    conditions: { space: "Medio campo", players: "Estaciones de 3–4", time: "12 min", intensity: "Media" },
    orientations: [
      "Cada estación con objetivo concreto y medible.",
      "Rotar cada 2–3 minutos.",
      "Aumentar dificultad cada vuelta.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "oleadas",
    label: "Oleadas",
    objective: "Trabajar finalización y transiciones desde campo propio.",
    conditions: { space: "Campo completo", players: "8 + portero", time: "15 min", intensity: "Alta" },
    orientations: [
      "Tres pases mínimos antes de finalizar.",
      "Alternar lado de inicio para trabajar ambas bandas.",
      "Cronometrar duración del ataque (< 12 s).",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "partidos-condicionados",
    label: "Partidos condicionados",
    objective: "Aplicar principios concretos en situación real de juego.",
    conditions: { space: "60 × 40 m", players: "16 (8v8)", time: "3 × 8 min", intensity: "Alta" },
    orientations: [
      "Regla específica por condición (ej. gol vale doble tras 5 pases).",
      "Cambiar condición cada serie.",
      "Premiar el principio buscado, no solo el gol.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "automatismos",
    label: "Automatismos",
    objective: "Repetición de patrones colectivos en zonas concretas.",
    conditions: { space: "Medio campo", players: "11", time: "15 min", intensity: "Media" },
    orientations: [
      "Sin oposición primero, luego oposición pasiva, luego activa.",
      "Centrarse en una acción por bloque (ej. salida desde portero).",
      "Repetir y corregir antes de competir.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
  {
    key: "tareas-globales",
    label: "Tareas globales",
    objective: "Integrar todos los principios del mesociclo en un partido.",
    conditions: { space: "Campo completo", players: "22", time: "25 min", intensity: "Alta" },
    orientations: [
      "Sin condiciones, juego libre con feedback al final.",
      "Grabar y revisar acciones clave.",
      "Valorar coherencia con la idea de juego semanal.",
    ],
    icons: ["space", "players", "time", "intensity"],
  },
];

/* Valoraciones de mesociclo (formulario breve) */
export const mesocycleAssessments = [
  {
    id: 1,
    code: "S.1",
    label: "Microciclo 1 · Adaptación general",
    completedAt: "27 abr 2025",
    sessionsCompleted: 4,
    sessionsPlanned: 4,
    rating: 8,
    achievements: ["Adaptación rápida del bloque", "Mejora en circulación de balón"],
    issues: ["Bajón el último día por carga acumulada"],
    nextFocus: "Subir intensidad en zona de finalización",
  },
];

/* ──────────────────────────────────────────────────────────────
   ADMIN — Biblioteca de medios global
────────────────────────────────────────────────────────────── */
// Biblioteca de medios gestionada por Supabase
export const mediaLibrary = [];

/* ──────────────────────────────────────────────────────────────
   ADMIN — Bloques del motor de planes (gestionados por Supabase)
────────────────────────────────────────────────────────────── */
export const planBlocks = [];

/* ──────────────────────────────────────────────────────────────
   ADMIN — Clubs y planes gestionados por Supabase
────────────────────────────────────────────────────────────── */
export const adminClubPlans = {};

export const adminClubs = [];
