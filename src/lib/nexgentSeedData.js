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
      players: [
        { team: "A", x: 15, y: 10 }, { team: "A", x: 10, y: 8 }, { team: "A", x: 20, y: 8 },
        { team: "B", x: 15, y: 14 }, { team: "B", x: 12, y: 16 }, { team: "B", x: 18, y: 16 },
      ],
      arrows: [{ from: { x: 15, y: 10 }, to: { x: 15, y: 14 } }],
    },
  },
];

export const MICROCYCLE = [
  { day: "Lun", label: "Recuperación activa", type: "recovery", rpe: 3, duration: "45 min" },
  { day: "Mar", label: "Fuerza + técnico", type: "strength", rpe: 6, duration: "75 min" },
  { day: "Mié", label: "Técnico-táctico", type: "tactical", rpe: 7, duration: "90 min" },
  { day: "Jue", label: "Velocidad", type: "speed", rpe: 8, duration: "60 min" },
  { day: "Vie", label: "Activación pre-partido", type: "activation", rpe: 5, duration: "50 min" },
  { day: "Sáb", label: "Partido · Paulistão", type: "match", rpe: 9, duration: "90 min" },
  { day: "Dom", label: "Descanso", type: "rest", rpe: 0, duration: "—" },
];

export const MESO_PHASES = [
  { name: "Pretemporada", weeks: "1–4", focus: "Base aeróbica y adaptación táctica" },
  { name: "Acumulación", weeks: "5–12", focus: "Volumen e intensidad progresiva" },
  { name: "Competición", weeks: "13–24", active: true, focus: "Mantenimiento + gestión carga" },
  { name: "Descarga", weeks: "25–26", focus: "Recuperación y microciclo tapering" },
];

export const SEASON_BLOCKS = [
  { month: "Ene", block: "Pretemporada", load: 65 },
  { month: "Feb", block: "Acumulación", load: 78 },
  { month: "Mar", block: "Acumulación", load: 82 },
  { month: "Abr", block: "Competición", load: 88 },
  { month: "May", block: "Competición", load: 85 },
  { month: "Jun", block: "Competición", load: 90 },
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
  { id: "v2", title: "SAK vs Palmeiras — transiciones", duration: "1:15", tags: ["Contraataque", "Finalización"] },
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
    space: { width: 20, height: 15 },
    players: [
      { team: "A", x: 10, y: 7 }, { team: "A", x: 7, y: 5 }, { team: "A", x: 13, y: 5 },
      { team: "B", x: 10, y: 11 }, { team: "B", x: 7, y: 13 }, { team: "B", x: 13, y: 13 },
    ],
    arrows: [],
  },
  "rondo 4v2": {
    space: { width: 25, height: 20 },
    players: [
      { team: "A", x: 12, y: 10 }, { team: "A", x: 8, y: 8 }, { team: "A", x: 16, y: 8 }, { team: "A", x: 12, y: 6 },
      { team: "B", x: 10, y: 14 }, { team: "B", x: 14, y: 14 },
    ],
    arrows: [{ from: { x: 12, y: 10 }, to: { x: 16, y: 8 } }],
  },
};

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
