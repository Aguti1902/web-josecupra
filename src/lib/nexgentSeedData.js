export const DEMO_PLAYERS = [
  { id: "p1", name: "Caio", position: "POR", avatar: "CM", loadBand: "optima", injuryRisk: "bajo", age: 19, num: 1, minutes: 1890, goals: 0, assists: 0, sprint: 28.4 },
  { id: "p2", name: "Vanderlan", position: "LI", avatar: "VN", loadBand: "alta", injuryRisk: "medio", age: 20, num: 6, minutes: 1620, goals: 2, assists: 4, sprint: 32.1 },
  { id: "p3", name: "Murilo", position: "DFC", avatar: "MU", loadBand: "optima", injuryRisk: "bajo", age: 21, num: 4, minutes: 2040, goals: 1, assists: 0, sprint: 29.8 },
  { id: "p4", name: "Luis Felipe", position: "DFC", avatar: "LF", loadBand: "riesgo", injuryRisk: "alto", age: 20, num: 3, minutes: 890, goals: 0, assists: 0, sprint: 0 },
  { id: "p5", name: "Mayke", position: "LD", avatar: "MY", loadBand: "optima", injuryRisk: "bajo", age: 20, num: 2, minutes: 1780, goals: 0, assists: 3, sprint: 31.2 },
  { id: "p6", name: "Fabinho", position: "MC", avatar: "FB", loadBand: "alta", injuryRisk: "medio", age: 19, num: 8, minutes: 1560, goals: 3, assists: 5, sprint: 30.5 },
  { id: "p7", name: "Jailson", position: "MC", avatar: "JL", loadBand: "optima", injuryRisk: "bajo", age: 20, num: 5, minutes: 1920, goals: 2, assists: 6, sprint: 29.1 },
  { id: "p8", name: "Luis Guilherme", position: "MP", avatar: "LG", loadBand: "alta", injuryRisk: "medio", age: 19, num: 10, minutes: 1710, goals: 7, assists: 8, sprint: 33.4 },
  { id: "p9", name: "Estêvão", position: "ED", avatar: "ES", loadBand: "optima", injuryRisk: "bajo", age: 18, num: 10, minutes: 1980, goals: 12, assists: 9, sprint: 34.8 },
  { id: "p10", name: "Kevin", position: "EI", avatar: "KV", loadBand: "riesgo", injuryRisk: "alto", age: 19, num: 11, minutes: 720, goals: 1, assists: 2, sprint: 0 },
  { id: "p11", name: "Luighi", position: "DC", avatar: "LH", loadBand: "alta", injuryRisk: "medio", age: 18, num: 9, minutes: 1450, goals: 9, assists: 2, sprint: 31.9 },
];

export const CHAT_CHANNELS = [
  { id: "tecnico", name: "Cuerpo técnico" },
  { id: "medico", name: "Médico" },
  { id: "scouting", name: "Scouting" },
  { id: "cantera", name: "Cantera" },
  { id: "general", name: "General" },
];

export const SEED_CHAT_MESSAGES = [
  { id: "m1", channel_id: "tecnico", author: "Abel Ferreira", role: "Entrenador", content: "Mañana sesión técnico-táctica Sub-20, intensidad media. Kevin en gestión de carga.", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "m2", channel_id: "tecnico", author: "Vitor", role: "Ayudante", content: "Confirmado rondo 4v2 + posesión 8v8 en espacio reducido.", created_at: new Date(Date.now() - 3000000).toISOString() },
  { id: "m3", channel_id: "medico", author: "Dr. Chefe", role: "Médico", content: "Luis Felipe: progresión a Fase 2 readaptación. No contacto todavía.", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "m4", channel_id: "scouting", author: "André", role: "Scouting", content: "Informe pendiente extremo izquierdo Sub-21 liga portuguesa.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "m5", channel_id: "general", author: "Dirección", role: "Dirección", content: "Reunión staff viernes 10:00 — revisión microciclo pre-temporada.", created_at: new Date(Date.now() - 172800000).toISOString() },
];

export const SEED_SCOUTING = [
  { id: "s1", player_name: "João Silva", physical: 8, technical: 7, tactical: 6, attitudinal: 9, notes: "Extremo zurdo, buen 1v1. Necesita mejorar lectura defensiva.", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "s2", player_name: "Marco Rossi", physical: 7, technical: 8, tactical: 8, attitudinal: 7, notes: "Mediocentro organizador. Encaja en perfil de rotación UCL.", created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: "s3", player_name: "Pedro Henrique", physical: 9, technical: 6, tactical: 7, attitudinal: 8, notes: "Central rápido, buen juego aéreo. Seguimiento activo.", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export const SEED_SESSIONS = [
  {
    id: "sess1",
    title: "Rondo 4v2 posicional",
    description: "Máximo 2 toques, amplitud en bandas",
    diagram: {
      space: { width: 25, height: 20 },
      workZone: { x: 4, y: 4, width: 17, height: 12 },
      players: [
        { team: "A", x: 12, y: 10 }, { team: "A", x: 8, y: 8 }, { team: "A", x: 16, y: 8 }, { team: "A", x: 12, y: 6 },
        { team: "B", x: 10, y: 14 }, { team: "B", x: 14, y: 14 },
      ],
      arrows: [{ from: { x: 12, y: 10 }, to: { x: 16, y: 8 } }],
    },
  },
  {
    id: "sess2",
    title: "Posesión 3v3 reducida",
    description: "Espacio 20x15m, trigger pressing tras pérdida",
    diagram: {
      space: { width: 20, height: 15 },
      workZone: { x: 0, y: 0, width: 20, height: 15 },
      players: [
        { team: "A", x: 10, y: 7 }, { team: "A", x: 7, y: 5 }, { team: "A", x: 13, y: 5 },
        { team: "B", x: 10, y: 11 }, { team: "B", x: 7, y: 13 }, { team: "B", x: 13, y: 13 },
      ],
      arrows: [],
    },
  },
  {
    id: "sess3",
    title: "Pressing triggers 8v8",
    description: "Presión alta tras pérdida en zona alta",
    diagram: {
      space: { width: 30, height: 20 },
      workZone: { x: 3, y: 5, width: 24, height: 12 },
      players: [
        { team: "A", x: 15, y: 10 }, { team: "A", x: 10, y: 8 }, { team: "A", x: 20, y: 8 },
        { team: "B", x: 15, y: 14 }, { team: "B", x: 12, y: 16 }, { team: "B", x: 18, y: 16 },
      ],
      arrows: [{ from: { x: 15, y: 10 }, to: { x: 15, y: 14 } }],
    },
  },
];

export const MESO_PHASES = [
  { name: "Pretemporada", weeks: "1–4", weekStart: 1, weekEnd: 4, focus: "Base aeróbica y adaptación táctica", volume: 72, intensity: 55, sessions: 16, objectives: ["Adaptación al modelo de juego", "Base aeróbica general", "Integración nuevos fichajes"] },
  { name: "Acumulación", weeks: "5–12", weekStart: 5, weekEnd: 12, focus: "Volumen e intensidad progresiva", volume: 85, intensity: 68, sessions: 32, objectives: ["Incremento HSR progresivo", "Consolidación pressing alto", "Doble jornada semanal"] },
  { name: "Competición", weeks: "13–24", weekStart: 13, weekEnd: 24, active: true, focus: "Mantenimiento + gestión carga", volume: 78, intensity: 74, sessions: 28, objectives: ["Gestión rotaciones", "Mantenimiento rendimiento", "Prevención lesiones"] },
  { name: "Descarga", weeks: "25–26", weekStart: 25, weekEnd: 26, focus: "Recuperación y microciclo tapering", volume: 55, intensity: 45, sessions: 6, objectives: ["Tapering pre-playoffs", "Recuperación neuromuscular", "Ajuste táctico final"] },
];

export const SEASON_BLOCKS = [
  { month: "Ene", block: "Pretemporada", load: 65, intensity: 52, matches: 2 },
  { month: "Feb", block: "Acumulación", load: 78, intensity: 62, matches: 4 },
  { month: "Mar", block: "Acumulación", load: 82, intensity: 68, matches: 5 },
  { month: "Abr", block: "Competición", load: 88, intensity: 72, matches: 6 },
  { month: "May", block: "Competición", load: 85, intensity: 75, matches: 5 },
  { month: "Jun", block: "Competición", load: 90, intensity: 78, matches: 4 },
  { month: "Jul", block: "Descarga", load: 58, intensity: 48, matches: 2 },
];

export const PLANNING_OVERVIEW = {
  season: "2026",
  competition: "NBA Regular Season + Playoffs",
  currentWeek: 24,
  totalWeeks: 26,
  matchesPlayed: 18,
  wins: 12,
  draws: 3,
  losses: 3,
  avgRpe: 6.4,
  adherence: 94,
  avgWeeklyLoad: 28900,
  injured: 2,
  nextMatch: { opponent: "Boston Celtics", date: "Vie 21 Jun · 22:00", venue: "Crypto.com Arena", round: "J42 NBA" },
};

export const SEASON_MATCHES = [
  { id: "m1", date: "14 Jun", opponent: "Golden State Warriors", result: "W 112-108", venue: "Chase Center", round: "J41", played: true },
  { id: "m2", date: "21 Jun", opponent: "Boston Celtics", result: null, venue: "Crypto.com Arena", round: "J42", played: false, highlight: true },
  { id: "m3", date: "24 Jun", opponent: "Denver Nuggets", result: null, venue: "Ball Arena", round: "J43", played: false },
  { id: "m4", date: "28 Jun", opponent: "Phoenix Suns", result: null, venue: "Crypto.com Arena", round: "J44", played: false },
  { id: "m5", date: "2 Jul", opponent: "LA Clippers", result: null, venue: "Intuit Dome", round: "J45", played: false },
];

export const MICROCYCLE = [
  {
    id: "mon", day: "Lun", date: "16 Jun", label: "Recuperación activa", type: "recovery", sessionType: "A",
    rpe: 3, duration: "45 min", load: 3200, players: 22,
    objectives: ["Recuperación post-partido", "Movilidad articular", "Feedback individual"],
    blocks: ["Bici 10 min", "Piscina 15 min", "Estiramientos 12 min", "Charla táctica 8 min"],
    notes: "Luis Felipe y Kevin en protocolo adaptado. Resto plantilla completa.",
  },
  {
    id: "tue", day: "Mar", date: "17 Jun", label: "Fuerza + técnico", type: "strength", sessionType: "B",
    rpe: 6, duration: "75 min", load: 4100, players: 20,
    objectives: ["Fuerza máxima tren inferior", "Técnica individual", "Core y estabilidad"],
    blocks: ["Activación 10 min", "Gimnasio 25 min", "Rondos 4v2 15 min", "Finalización 15 min", "Vuelta calma 10 min"],
    notes: "Estêvão carga controlada (90 min partido previo). Vanderlan HSR monitorizado.",
  },
  {
    id: "wed", day: "Mié", date: "18 Jun", label: "Técnico-táctico", type: "tactical", sessionType: "B",
    rpe: 7, duration: "90 min", load: 5800, players: 21,
    objectives: ["Pressing alto zona alta", "Posesión en espacio reducido", "Transiciones 4v4"],
    blocks: ["Rondo 5v2 12 min", "Pressing triggers 8v8 25 min", "Posesión 3v3+3 20 min", "Partido condicionado 25 min"],
    notes: "Sesión principal del microciclo. Objetivo: intensidad >85% HSR en bloque 2.",
  },
  {
    id: "thu", day: "Jue", date: "19 Jun", label: "Velocidad", type: "speed", sessionType: "C",
    rpe: 8, duration: "60 min", load: 3900, players: 19,
    objectives: ["Sprints máximos", "Reacción y cambio de dirección", "Activación neuromuscular"],
    blocks: ["Movilidad 8 min", "Sprints 20 m × 8 20 min", "Transiciones 4v4 20 min", "Core 12 min"],
    notes: "Kevin excluido. Luighi y Estêvão prioridad en sprints.",
  },
  {
    id: "fri", day: "Vie", date: "20 Jun", label: "Activación pre-partido", type: "activation", sessionType: "C",
    rpe: 5, duration: "50 min", load: 2900, players: 20,
    objectives: ["Activación neuromuscular", "Set pieces ofensivos", "Ajuste táctico rival"],
    blocks: ["Activación 10 min", "Rondo 8 min", "SP corners 15 min", "Partido reducido 12 min", "Charla rival 5 min"],
    notes: "Celtics: pick-and-roll + spacing exterior. Repaso vídeo 09:00.",
  },
  {
    id: "sat", day: "Sáb", date: "21 Jun", label: "Partido · NBA", type: "match", sessionType: "—",
    rpe: 9, duration: "90 min", load: 7200, players: 18,
    objectives: ["Victoria J19", "Presión alta sostenida", "Control transiciones"],
    blocks: ["Calentamiento 25 min", "Partido 90 min", "Recuperación inmediata 15 min"],
    notes: "Convocatoria activa: 15 jugadores. LeBron titular.",
  },
  {
    id: "sun", day: "Dom", date: "22 Jun", label: "Descanso", type: "rest", sessionType: "—",
    rpe: 0, duration: "—", load: 800, players: 0,
    objectives: ["Recuperación completa"],
    blocks: [],
    notes: "Día libre. Opcional movilidad en casa.",
  },
];

export const WEEKLY_OBJECTIVES = [
  { area: "Físico", target: "Carga semanal 28.500–30.000 AU", status: "on_track", detail: "Proyección actual: 29.100 AU" },
  { area: "Táctico", target: "Pressing alto >12 recuperaciones/partido", status: "on_track", detail: "Media últimos 3 partidos: 14.3" },
  { area: "Técnico", target: "Posesión en campo rival >42%", status: "attention", detail: "Media 38% — ajustar salida de balón" },
  { area: "Médico", target: "0 nuevas lesiones musculares", status: "on_track", detail: "Kevin en gestión, Luis Felipe readaptación" },
];

export const TACTICAL_PRIORITIES = [
  { title: "Presión tras pérdida", desc: "Trigger inmediato en zona alta cuando rival recibe de espaldas", progress: 82 },
  { title: "Amplitud en bandas", desc: "Extremos fijando laterales para abrir central", progress: 75 },
  { title: "Salida 3+2", desc: "Portero + 3 + pivote en construcción vs bloque medio", progress: 68 },
];

export const VIDEO_EVENTS = [
  { time: "12:34", label: "Presión alta recuperada", type: "positive" },
  { time: "23:08", label: "Pérdida en zona de salida", type: "negative" },
  { time: "31:45", label: "Transición rápida 4v3", type: "positive" },
  { time: "44:12", label: "Línea defensiva rota", type: "negative" },
  { time: "67:03", label: "Presión tras saque de banda", type: "positive" },
  { time: "78:22", label: "Estêvão — regate + pase filtrado", type: "positive" },
];

export const VIDEO_CLIPS = [
  { id: "v1", title: "Presión alta J24", duration: "0:42", tags: ["Pressing", "Transición"] },
  { id: "v2", title: "Lakers vs Celtics — transiciones", duration: "1:15", tags: ["Contraataque", "Finalización"] },
  { id: "v3", title: "Microciclo táctico — rondo 4v2", duration: "0:28", tags: ["Entrenamiento", "Posesión"] },
];

export const MEDICAL_PLAYERS = [
  { name: "Luis Felipe", status: "Readaptación", injury: "Esguince tobillo", phase: 2, progress: 55 },
  { name: "Kevin", status: "Tratamiento", injury: "Sobrecarga isquio", phase: 1, progress: 25 },
  { name: "Estêvão", status: "Disponible", injury: "—", phase: 4, progress: 100 },
  { name: "Vanderlan", status: "Disponible", injury: "—", phase: 4, progress: 100 },
];

export const YOUTH_CATEGORIES = [
  {
    id: "sub20",
    name: "Sub-20",
    players: DEMO_PLAYERS.length,
    coach: "Abel Ferreira Jr.",
    nextMatch: "Sáb 15:00 vs Corinthians",
  },
  {
    id: "sub17",
    name: "Sub-17",
    players: 22,
    coach: "Marcos Silva",
    nextMatch: "Dom 10:00 vs São Paulo",
  },
  {
    id: "sub15",
    name: "Sub-15",
    players: 20,
    coach: "Ricardo Nunes",
    nextMatch: "Sáb 09:00 vs Santos",
  },
];

export const YOUTH_SQUAD = [
  { name: "Luighi", position: "DC", load: "Media", risk: "bajo", age: 15 },
  { name: "Caio", position: "POR", load: "Baja", risk: "bajo", age: 15 },
  { name: "Fabinho", position: "MC", load: "Alta", risk: "medio", age: 16 },
  { name: "Rafael", position: "ED", load: "Media", risk: "bajo", age: 15 },
  { name: "Thiago", position: "DFC", load: "Baja", risk: "bajo", age: 16 },
];

export const EXEC_KPIS = [
  { label: "Jugadores en seguimiento", value: "142", trend: "+4" },
  { label: "Días de baja evitados (est.)", value: "18", trend: "+3" },
  { label: "Informes scouting nuevos", value: "4", trend: "+2" },
  { label: "Adherencia planificación", value: "94%", trend: "+2%" },
];

export const GPS_DEMO_ROWS = [
  { name: "Estêvão", distance: 8420, hsr: 1240, sprints: 18, load: 2850, band: "optima" },
  { name: "Vanderlan", distance: 9100, hsr: 1380, sprints: 22, load: 3200, band: "alta" },
  { name: "Luis Guilherme", distance: 7800, hsr: 980, sprints: 14, load: 2650, band: "optima" },
  { name: "Kevin", distance: 4200, hsr: 520, sprints: 8, load: 1800, band: "riesgo" },
  { name: "Fabinho", distance: 8600, hsr: 1150, sprints: 16, load: 2980, band: "alta" },
  { name: "Murilo", distance: 7200, hsr: 680, sprints: 10, load: 2400, band: "optima" },
];

export const WEEKLY_LOAD = [
  { day: "L", load: 3200 },
  { day: "M", load: 4100 },
  { day: "X", load: 5800 },
  { day: "J", load: 3900 },
  { day: "V", load: 2900 },
  { day: "S", load: 7200 },
  { day: "D", load: 800 },
];

export const PLAYER_TESTS = {
  p9: { endurance: 8.4, sprint: 3.92, agility: 4.12, rating: "Excelente" },
  p8: { endurance: 8.1, sprint: 3.98, agility: 4.22, rating: "Bueno" },
  p11: { endurance: 7.9, sprint: 4.05, agility: 4.35, rating: "Bueno" },
};

export function loadBandColor(band) {
  return { optima: "#22C55E", alta: "#F59E0B", riesgo: "#EF4444" }[band] ?? "#9CA3AF";
}

export function riskColor(risk) {
  return { bajo: "#22C55E", medio: "#F59E0B", alto: "#EF4444" }[risk] ?? "#9CA3AF";
}

export const EMPTY_DIAGRAM = {
  space: { width: 30, height: 20 },
  players: [],
  arrows: [],
};

export const PRESET_PROMPTS = {
  "posesión 3 contra 3": {
    space: { width: 30, height: 20 },
    workZone: { x: 5, y: 2.5, width: 20, height: 15 },
    players: [
      { team: "A", x: 15, y: 10 }, { team: "A", x: 12, y: 8 }, { team: "A", x: 18, y: 8 },
      { team: "B", x: 15, y: 14 }, { team: "B", x: 12, y: 16 }, { team: "B", x: 18, y: 16 },
    ],
    arrows: [],
  },
  "rondo 4v2": {
    space: { width: 25, height: 20 },
    workZone: { x: 4, y: 4, width: 17, height: 12 },
    players: [
      { team: "A", x: 12, y: 10 }, { team: "A", x: 8, y: 8 }, { team: "A", x: 16, y: 8 }, { team: "A", x: 12, y: 6 },
      { team: "B", x: 10, y: 14 }, { team: "B", x: 14, y: 14 },
    ],
    arrows: [{ from: { x: 12, y: 10 }, to: { x: 16, y: 8 } }],
  },
  "pressing 8v8": {
    space: { width: 30, height: 20 },
    workZone: { x: 3, y: 5, width: 24, height: 12 },
    players: [
      { team: "A", x: 15, y: 10 }, { team: "A", x: 10, y: 8 }, { team: "A", x: 20, y: 8 },
      { team: "A", x: 12, y: 12 }, { team: "B", x: 15, y: 14 }, { team: "B", x: 12, y: 16 },
      { team: "B", x: 18, y: 16 }, { team: "B", x: 20, y: 14 },
    ],
    arrows: [{ from: { x: 15, y: 10 }, to: { x: 15, y: 14 } }],
  },
  "cuadrado 20x20": {
    space: { width: 30, height: 20 },
    workZone: { x: 5, y: 0, width: 20, height: 20 },
    players: [
      { team: "A", x: 15, y: 10 }, { team: "A", x: 10, y: 10 }, { team: "A", x: 20, y: 10 },
      { team: "B", x: 15, y: 15 }, { team: "B", x: 10, y: 15 }, { team: "B", x: 20, y: 15 },
    ],
    arrows: [],
  },
};

/** Genera diagrama desde prompt — detecta tipo de ejercicio y zona de trabajo */
export function generateDiagramFromPrompt(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("rondo") || p.includes("4v2") || p.includes("4 contra 2")) {
    return JSON.parse(JSON.stringify(PRESET_PROMPTS["rondo 4v2"]));
  }
  if ((p.includes("3") && p.includes("contra")) || p.includes("3v3") || p.includes("3 contra 3")) {
    return JSON.parse(JSON.stringify(PRESET_PROMPTS["posesión 3 contra 3"]));
  }
  if (p.includes("8v8") || p.includes("8 contra 8") || p.includes("pressing")) {
    return JSON.parse(JSON.stringify(PRESET_PROMPTS["pressing 8v8"]));
  }
  if (p.includes("cuadrado") || p.includes("20x20") || p.includes("20 x 20")) {
    return JSON.parse(JSON.stringify(PRESET_PROMPTS["cuadrado 20x20"]));
  }
  if (p.includes("reducido") || p.includes("espacio")) {
    const d = JSON.parse(JSON.stringify(PRESET_PROMPTS["posesión 3 contra 3"]));
    d.workZone = { x: 8, y: 4, width: 14, height: 12 };
    return d;
  }
  return JSON.parse(JSON.stringify(SEED_SESSIONS[0].diagram));
}

export const TRAINING_SESSIONS = [
  {
    id: "ts1",
    day: "Miércoles 18 Jun",
    type: "B",
    title: "Sesión B · Intensivo",
    duration: "75 min",
    rpe: 7,
    focus: "Presión alta · recuperación en zona alta · estímulo anaeróbico",
    tasks: [
      { block: "Calentamiento", name: "Activación + sprints", duration: "10 min", detail: "4×15 m aceleraciones progresivas" },
      { block: "Calentamiento", name: "Rondo 5v2 alto tempo", duration: "12 min", detail: "1 toque cuando sea posible · pressing inmediato" },
      { block: "Principal", name: "Pressing triggers 8v8", duration: "25 min", detail: "Zona 24×12 m · trigger tras pérdida en campo rival" },
      { block: "Principal", name: "Posesión 3v3+3", duration: "15 min", detail: "Cuadrado 20×15 m · máx. 2 toques" },
      { block: "Vuelta calma", name: "Estiramientos + foam", duration: "8 min", detail: "Isquios · aductores · gemelos" },
    ],
  },
  {
    id: "ts2",
    day: "Viernes 20 Jun",
    type: "C",
    title: "Sesión C · Reactivo",
    duration: "60 min",
    rpe: 5,
    focus: "Velocidad de reacción · transiciones · activación neuromuscular",
    tasks: [
      { block: "Calentamiento", name: "Movilidad articular", duration: "8 min", detail: "Cadera · tobillo · columna" },
      { block: "Principal", name: "Sprints 20 m reactivos", duration: "15 min", detail: "6×20 m · 90 s recuperación" },
      { block: "Principal", name: "Transiciones 4v4+2", duration: "20 min", detail: "Campo 30×20 m · 2 jokers en bandas" },
      { block: "Complementario", name: "Core + estabilidad", duration: "10 min", detail: "Planchas · pallof · bird-dog" },
    ],
  },
  {
    id: "ts3",
    day: "Lunes 16 Jun",
    type: "A",
    title: "Sesión A · Extensivo",
    duration: "45 min",
    rpe: 3,
    focus: "Recuperación activa post-partido · movilidad · baja intensidad",
    tasks: [
      { block: "Calentamiento", name: "Bici estática", duration: "10 min", detail: "RPE 3 · 60 rpm" },
      { block: "Principal", name: "Piscina / hidroterapia", duration: "20 min", detail: "Marcha acuática · movilidad" },
      { block: "Vuelta calma", name: "Yoga / estiramientos", duration: "15 min", detail: "Cadena posterior completa" },
    ],
  },
];

export const SCOUTING_PROFILES = [
  { id: "s1", player_name: "João Silva", age: 19, position: "EI", club: "Sporting CP Sub-23", league: "Liga Revelação", nationality: "Portugal", height: "1.78 m", foot: "Zurdo", marketValue: "€1.2M", contract: "Jun 2027", scout: "André Costa", scoutedAt: "2026-05-12", status: "Seguimiento activo", physical: 8, technical: 7, tactical: 6, attitudinal: 9, strengths: ["1v1", "Velocidad", "Regate"], weaknesses: ["Lectura defensiva", "Juego aéreo"], notes: "Extremo zurdo con gran capacidad de desborde. Necesita mejorar lectura defensiva en transiciones." },
  { id: "s2", player_name: "Marco Rossi", age: 21, position: "MC", club: "Empoli Primavera", league: "Primavera 1", nationality: "Italia", height: "1.82 m", foot: "Diestro", marketValue: "€800K", contract: "Jun 2026", scout: "André Costa", scoutedAt: "2026-04-28", status: "Informe enviado", physical: 7, technical: 8, tactical: 8, attitudinal: 7, strengths: ["Pase largo", "Visión", "Anticipación"], weaknesses: ["Velocidad", "Duels físicos"], notes: "Mediocentro organizador. Encaja en perfil de rotación para competiciones internacionales." },
  { id: "s3", player_name: "Pedro Henrique", age: 20, position: "DFC", club: "Fluminense Sub-20", league: "Copa SP", nationality: "Brasil", height: "1.89 m", foot: "Diestro", marketValue: "€600K", contract: "Dic 2026", scout: "Ricardo Lima", scoutedAt: "2026-06-02", status: "Seguimiento activo", physical: 9, technical: 6, tactical: 7, attitudinal: 8, strengths: ["Juego aéreo", "Salida de balón", "Ritmo"], weaknesses: ["Velocidad lateral", "Marcaje 1v1"], notes: "Central rápido con buen juego aéreo. Proyección a primer equipo en 12-18 meses." },
  { id: "s4", player_name: "Lucas Mendes", age: 18, position: "ED", club: "Benfica Sub-23", league: "Liga Revelação", nationality: "Portugal", height: "1.75 m", foot: "Diestro", marketValue: "€2.5M", contract: "Jun 2028", scout: "André Costa", scoutedAt: "2026-06-10", status: "Prioridad alta", physical: 8, technical: 9, tactical: 7, attitudinal: 8, strengths: ["Finalización", "Desmarque", "Ambidextrismo"], weaknesses: ["Defensa posicional", "Experiencia"], notes: "Perfil similar a Estêvão. Comparativa directa en informe adjunto. Recomendación: seguimiento mensual." },
  { id: "s5", player_name: "Felipe Costa", age: 22, position: "POR", club: "Grêmio Sub-20", league: "Brasileiro Sub-20", nationality: "Brasil", height: "1.91 m", foot: "Diestro", marketValue: "€400K", contract: "Dic 2027", scout: "Ricardo Lima", scoutedAt: "2026-05-20", status: "En observación", physical: 8, technical: 7, tactical: 8, attitudinal: 9, strengths: ["Reflejos", "Juego con pies", "Comunicación"], weaknesses: ["Salidas altas", "1v1"], notes: "Portero con buen juego de pies. Perfil para cantera como 2.º portero." },
  { id: "s6", player_name: "Matías Álvarez", age: 20, position: "MP", club: "River Plate Reserva", league: "LPF Reserva", nationality: "Argentina", height: "1.77 m", foot: "Zurdo", marketValue: "€1.8M", contract: "Dic 2028", scout: "Carlos Méndez", scoutedAt: "2026-06-08", status: "Seguimiento activo", physical: 7, technical: 9, tactical: 8, attitudinal: 7, strengths: ["Creatividad", "Pase filtrado", "Tiro lejano"], weaknesses: ["Intensidad defensiva", "Consistencia"], notes: "Enganche clásico con gran calidad técnica. Evaluar adaptación al ritmo brasileño." },
  { id: "s7", player_name: "Thiago Santos", age: 19, position: "LI", club: "Santos FC Sub-20", league: "Copa SP", nationality: "Brasil", height: "1.80 m", foot: "Zurdo", marketValue: "€550K", contract: "Jun 2027", scout: "Ricardo Lima", scoutedAt: "2026-05-30", status: "Informe pendiente", physical: 8, technical: 7, tactical: 7, attitudinal: 8, strengths: ["Proyección", "Centros", "Resistencia"], weaknesses: ["Marcaje", "Decisiones bajo presión"], notes: "Lateral ofensivo con buena proyección. Comparar con Vanderlan en plantilla." },
  { id: "s8", player_name: "Gabriel Oliveira", age: 17, position: "DC", club: "Corinthians Sub-17", league: "Copa SP Sub-17", nationality: "Brasil", height: "1.84 m", foot: "Diestro", marketValue: "€300K", contract: "Jun 2029", scout: "Marcos Silva", scoutedAt: "2026-06-14", status: "Cantera · Proyección", physical: 7, technical: 6, tactical: 6, attitudinal: 9, strengths: ["Actitud", "Juego aéreo", "Instinto goleador"], weaknesses: ["Técnica bajo presión", "Físico"], notes: "Delantero joven con instinto goleador. Proyección Sub-20 en 2 temporadas." },
];

export const MEDICAL_RECORDS = [
  {
    id: "m1", name: "Luis Felipe", status: "Readaptación", injury: "Esguince grado II tobillo derecho",
    date: "2026-05-28", phase: 2, progress: 55, doctor: "Dr. Roberto Chefe",
    history: [
      { date: "2026-05-28", event: "Lesión en entrenamiento — giro forzado", type: "incident" },
      { date: "2026-05-29", event: "RM tobillo — esguince LTI grado II", type: "imaging" },
      { date: "2026-06-02", event: "Inicio Fase 1 — descarga + crioterapia", type: "treatment" },
      { date: "2026-06-10", event: "Progresión Fase 2 — carrera en piscina", type: "treatment" },
      { date: "2026-06-18", event: "Inicio carrera en campo — 50% intensidad", type: "milestone" },
    ],
    imaging: [
      { type: "RM", label: "Tobillo derecho · RM", date: "2026-05-29", finding: "Edema óseo navicular. LTI parcial grado II." },
      { type: "RX", label: "Tobillo AP/Lateral", date: "2026-05-28", finding: "Sin fractura. Alineación conservada." },
    ],
    restrictions: "Sin contacto · Sin cambios de dirección · Carga GPS limitada 60%",
  },
  {
    id: "m2", name: "Kevin", status: "Tratamiento", injury: "Sobrecarga isquiosurales izquierdo",
    date: "2026-06-12", phase: 1, progress: 25, doctor: "Dr. Ana Paula",
    history: [
      { date: "2026-06-12", event: "Molestia post-partido — isquio izquierdo", type: "incident" },
      { date: "2026-06-13", event: "Ecografía — microdesgarro fibras isquio", type: "imaging" },
      { date: "2026-06-14", event: "Inicio tratamiento conservador", type: "treatment" },
    ],
    imaging: [
      { type: "ECO", label: "Ecografía isquio izq.", date: "2026-06-13", finding: "Microdesgarro 8 mm zona media. Sin hematoma." },
    ],
    restrictions: "Entrenamiento adaptado · Sin sprints · RPE máx. 4",
  },
  {
    id: "m3", name: "Estêvão", status: "Disponible", injury: "—",
    date: "—", phase: 4, progress: 100, doctor: "Dr. Roberto Chefe",
    history: [
      { date: "2026-06-01", event: "Revisión preventiva — OK", type: "checkup" },
      { date: "2026-06-15", event: "Test isocinético — simetría 98%", type: "milestone" },
    ],
    imaging: [],
    restrictions: "Sin restricciones",
  },
  {
    id: "m4", name: "Vanderlan", status: "Disponible", injury: "—",
    date: "—", phase: 4, progress: 100, doctor: "Dr. Ana Paula",
    history: [
      { date: "2026-05-15", event: "Alta tras contractura gemelo", type: "milestone" },
      { date: "2026-06-10", event: "Control carga — dentro de parámetros", type: "checkup" },
    ],
    imaging: [
      { type: "RX", label: "Control gemelo", date: "2026-05-10", finding: "Sin calcificaciones. Tejidos blandos normales." },
    ],
    restrictions: "Sin restricciones · Monitorizar carga HSR",
  },
];

export const KEY_MOMENTS = [
  { id: "k1", time: "12:34", label: "Presión alta recuperada", type: "positive", tags: ["pressing", "transición", "recuperación"] },
  { id: "k2", time: "23:08", label: "Pérdida en zona de salida", type: "negative", tags: ["pérdida", "salida", "error"] },
  { id: "k3", time: "31:45", label: "Transición rápida 4v3", type: "positive", tags: ["transición", "contraataque", "4v3"] },
  { id: "k4", time: "44:12", label: "Línea defensiva rota", type: "negative", tags: ["defensa", "línea", "error"] },
  { id: "k5", time: "67:03", label: "Presión tras saque de banda", type: "positive", tags: ["pressing", "banda", "recuperación"] },
  { id: "k6", time: "78:22", label: "Estêvão — regate + pase filtrado", type: "positive", tags: ["estêvão", "regate", "pase", "1v1"] },
  { id: "k7", time: "82:15", label: "Corner corto — gol anulado", type: "negative", tags: ["corner", "gol", "anulado"] },
  { id: "k8", time: "85:40", label: "Luighi — remate de cabeza", type: "positive", tags: ["luighi", "remate", "cabeza", "gol"] },
];

export function mockAiSummary(messages) {
  if (!messages.length) return "No hay mensajes en este canal.";
  const authors = [...new Set(messages.map((m) => m.author))];
  return `Resumen: ${authors.join(", ")} han coordinado ${messages.length} mensajes. Puntos clave: gestión de carga de Kevin, readaptación de Luis Felipe en Fase 2, y confirmación de sesión técnico-táctica con rondo + posesión 8v8.`;
}

export function mockClassifyLoad(row) {
  const explanations = {
    optima: "Carga dentro del rango óptimo para la fase competitiva. Mantener planificación actual.",
    alta: "Carga elevada — monitorizar HSR en próxima sesión. Valorar reducción de volumen.",
    riesgo: "Riesgo de sobrecarga — protocolo de descarga recomendado. Revisión médica.",
  };
  return explanations[row.band] ?? explanations.alta;
}
