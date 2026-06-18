/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: datos de ejemplo para módulos MAQUETA y fallback de módulos REAL.
 * PRODUCCIÓN: seed solo para entornos de staging; prod usa datos del club.
 */

export type LoadBand = "optima" | "alta" | "riesgo";
export type InjuryRisk = "bajo" | "medio" | "alto";

export interface Player {
  id: string;
  name: string;
  position: string;
  avatar: string;
  loadBand: LoadBand;
  injuryRisk: InjuryRisk;
}

export interface ChatChannel {
  id: string;
  name: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  author: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ScoutingReport {
  id: string;
  player_name: string;
  physical: number;
  technical: number;
  tactical: number;
  attitudinal: number;
  notes: string;
  created_at: string;
}

export interface SessionDiagram {
  space: { width: number; height: number };
  players: { team: string; x: number; y: number }[];
  arrows: { from: { x: number; y: number }; to: { x: number; y: number } }[];
}

export interface SavedSession {
  id: string;
  title: string;
  description: string;
  diagram: SessionDiagram;
  created_at: string;
}

export const DEMO_CLUB = {
  name: "Real Madrid C.F.",
  shortName: "RMCF",
  accent: "#FEBE10",
  accentDark: "#00529F",
};

export const DEMO_PLAYERS: Player[] = [
  { id: "p1", name: "Courtois", position: "POR", avatar: "TC", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p2", name: "Carvajal", position: "LD", avatar: "DC", loadBand: "alta", injuryRisk: "medio" },
  { id: "p3", name: "Rüdiger", position: "DFC", avatar: "AR", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p4", name: "Militão", position: "DFC", avatar: "EM", loadBand: "riesgo", injuryRisk: "alto" },
  { id: "p5", name: "Mendy", position: "LI", avatar: "FM", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p6", name: "Tchouaméni", position: "MC", avatar: "AT", loadBand: "alta", injuryRisk: "medio" },
  { id: "p7", name: "Valverde", position: "MC", avatar: "FV", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p8", name: "Bellingham", position: "MP", avatar: "JB", loadBand: "alta", injuryRisk: "medio" },
  { id: "p9", name: "Rodrygo", position: "ED", avatar: "RO", loadBand: "optima", injuryRisk: "bajo" },
  { id: "p10", name: "Vinícius", position: "EI", avatar: "VJ", loadBand: "riesgo", injuryRisk: "alto" },
  { id: "p11", name: "Mbappé", position: "DC", avatar: "KM", loadBand: "alta", injuryRisk: "medio" },
];

export const CHAT_CHANNELS: ChatChannel[] = [
  { id: "tecnico", name: "Cuerpo técnico", role: "tecnico" },
  { id: "medico", name: "Médico", role: "medico" },
  { id: "scouting", name: "Scouting", role: "scouting" },
  { id: "cantera", name: "Cantera", role: "cantera" },
  { id: "general", name: "General", role: "general" },
];

export const SEED_CHAT_MESSAGES: ChatMessage[] = [
  { id: "m1", channel_id: "tecnico", author: "Ancelotti", role: "Entrenador", content: "Mañana sesión técnico-táctica, intensidad media-alta. Vinícius en gestión de carga.", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "m2", channel_id: "tecnico", author: "Davide", role: "Ayudante", content: "Confirmado rondo 4v2 + posesión 8v8 en espacio reducido.", created_at: new Date(Date.now() - 3000000).toISOString() },
  { id: "m3", channel_id: "medico", author: "Dr. Nieto", role: "Médico", content: "Militão: progresión a Fase 2 readaptación. No contacto todavía.", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "m4", channel_id: "scouting", author: "Juni", role: "Scouting", content: "Informe pendiente extremo izquierdo Sub-21 liga portuguesa.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "m5", channel_id: "general", author: "Dirección", role: "Dirección", content: "Reunión staff viernes 10:00 — revisión microciclo pre-partido.", created_at: new Date(Date.now() - 172800000).toISOString() },
];

export const SEED_SCOUTING: ScoutingReport[] = [
  { id: "s1", player_name: "João Silva", physical: 8, technical: 7, tactical: 6, attitudinal: 9, notes: "Extremo zurdo, buen 1v1. Necesita mejorar lectura defensiva.", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "s2", player_name: "Marco Rossi", physical: 7, technical: 8, tactical: 8, attitudinal: 7, notes: "Mediocentro organizador. Encaja en perfil de rotación UCL.", created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
];

export const SEED_SESSIONS: SavedSession[] = [
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
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const MICROCYCLE = [
  { day: "Lun", label: "Recuperación activa", type: "recovery" },
  { day: "Mar", label: "Fuerza + técnico", type: "strength" },
  { day: "Mié", label: "Técnico-táctico", type: "tactical" },
  { day: "Jue", label: "Velocidad", type: "speed" },
  { day: "Vie", label: "Activación pre-partido", type: "activation" },
  { day: "Sáb", label: "Partido · La Liga", type: "match" },
  { day: "Dom", label: "Descanso", type: "rest" },
];

export const MESO_PHASES = ["Pretemporada", "Acumulación", "Competición", "Descarga"];

export const VIDEO_EVENTS = [
  { time: "12:34", label: "Presión alta recuperada", type: "positive" },
  { time: "23:08", label: "Pérdida en zona de salida", type: "negative" },
  { time: "31:45", label: "Transición rápida 4v3", type: "positive" },
  { time: "44:12", label: "Línea defensiva rota", type: "negative" },
  { time: "67:03", label: "Presión tras saque de banda", type: "positive" },
];

export const MEDICAL_PLAYERS = [
  { name: "Militão", status: "Readaptación", phase: 2, progress: 55 },
  { name: "Alaba", status: "Tratamiento", phase: 1, progress: 25 },
  { name: "Camavinga", status: "Disponible", phase: 4, progress: 100 },
];

export const YOUTH_SQUAD = [
  { name: "Gonzalo", position: "DC", load: "Media", risk: "bajo" },
  { name: "Yánez", position: "POR", load: "Baja", risk: "bajo" },
  { name: "Franco", position: "MC", load: "Alta", risk: "medio" },
];

export const EXEC_KPIS = [
  { label: "Jugadores en seguimiento", value: "12" },
  { label: "Días de baja evitados (est.)", value: "18" },
  { label: "Informes scouting nuevos", value: "4" },
  { label: "Adherencia planificación", value: "94%" },
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

export function loadBandColor(band: LoadBand): string {
  return { optima: "#22C55E", alta: "#F59E0B", riesgo: "#EF4444" }[band];
}

export function riskColor(risk: InjuryRisk): string {
  return { bajo: "#22C55E", medio: "#F59E0B", alto: "#EF4444" }[risk];
}
