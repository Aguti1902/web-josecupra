import { PALMEIRAS } from "./nexgentConfig.js";

export const PITCH_STATS = [
  { v: "20+", l: "Módulos integrados" },
  { v: "13", l: "Demos animadas en vivo" },
  { v: "IA", l: "Sesiones · Carga · Chat" },
  { v: "100%", l: "White-label club" },
  { v: "7%", l: "Comisión comercial" },
  { v: "€1M+", l: "Tier clubes élite" },
];

export const FEATURES = [
  { id: "dashboard", title: "Dashboard del club", summary: "Una pantalla para dirección, cuerpo técnico y médico.", bullets: ["Mesociclo y microciclo por equipo", "Próxima sesión y tests completados", "Cabecera con logo y colores del club"] },
  { id: "microcycle", title: "Periodización meso/microciclo", summary: "Planificación semanal con sesiones A/B/C/D y partido integrado.", bullets: ["Mesociclos y bloques configurables", "Microciclo visual por día", "Sincronizado con tests y carga GPS"] },
  { id: "sessions", title: "Sesiones con IA táctica", summary: "Describe el ejercicio en lenguaje natural → diagrama SVG.", bullets: ["Generación JSON estricta", "Task designer integrado", "PDF con branding del club"] },
  { id: "loads", title: "Control de carga GPS", summary: "Import Catapult, STATSports, Polar, WIMU…", bullets: ["Mapeo de columnas flexible", "Clasificación IA por jugador", "Semáforo óptima / alta / riesgo"] },
  { id: "tests", title: "Tests físicos", summary: "Ratings objetivos T1→T2→T3 vs media del equipo.", bullets: ["4 tests × 3 evaluaciones", "Gráficas automáticas", "Verde / ámbar / rojo"] },
  { id: "medical", title: "Departamento médico", summary: "Historial clínico, readaptación y alertas cruzadas con carga.", bullets: ["Fases de readaptación por jugador", "Alertas automáticas carga ↔ médico", "Sincronizado con chat del staff"] },
  { id: "academy", title: "Cantera y categorías", summary: "Seguimiento Sub-20 a Sub-13 sin hardware GPS obligatorio.", bullets: ["Proyección y promoción de talento", "Tests y ratings por categoría", "Familias ven el club, no un SaaS"] },
  { id: "chat", title: "Chat del staff + IA", summary: "Canales por rol con resumen inteligente.", bullets: ["Cuerpo técnico, médico, scouting", "Persistencia en tiempo real", "Resumen IA en 2-3 líneas"] },
  { id: "scouting", title: "Scouting integrado", summary: "Informes estructurados y seguimiento de objetivos.", bullets: ["Físico, técnico, táctico, actitudinal", "Notas libres", "Histórico por jugador"] },
  { id: "video", title: "Análisis de vídeo", summary: "Tags automáticos, clips y vinculación con sesiones.", bullets: ["Tags IA: pressing, transiciones, finalización", "Timeline sincronizada con GPS", "Export para informes scouting"] },
  { id: "direction", title: "Dirección deportiva", summary: "KPIs ejecutivos: adherencia, carga, lesiones y cantera.", bullets: ["Dashboard dirección en tiempo real", "Comparativa entre equipos", "Informes para junta directiva"] },
  { id: "pdf", title: "PDFs de sesión", summary: "Plan profesional listo para el campo.", bullets: ["Logo y colores del club", "Vídeos de calentamiento", "Export en un clic"] },
  { id: "brand", title: "White-label completo", summary: "Tu club en cada pantalla — no una app genérica.", bullets: ["Logo, colores, equipos", "Familias ven Palmeiras", "Multi-categoría"] },
];


export const MODULE_GROUPS = [
  { title: "Operativa DEPRO", items: ["Periodización meso/micro", "Task designer A/B/C/D", "Tests físicos T1→T3", "PDFs de sesión", "White-label completo"] },
  { title: "Rendimiento", items: ["Import GPS multi-marca", "Semáforo de carga", "Clasificación IA", "Match-day integration", "Histórico por jugador"] },
  { title: "IA NexGent", items: ["Diagramas tácticos SVG", "Resumen chat staff", "Tags vídeo automáticos", "Alertas inteligentes", "Recomendaciones de carga"] },
  { title: "Departamentos", items: ["Médico y readaptación", "Cantera Sub-20→Sub-13", "Scouting integrado", "Dirección deportiva", "Análisis de vídeo"] },
];

export const ROADMAP_PHASES = [
  { phase: "Fase 0", period: "Semanas 1–2", duration: "Discovery", title: "Reunión de requisitos", subtitle: "Workshops con dirección, staff, médico y cantera.", items: ["Kick-off stakeholders", "Mapa de procesos actuales", "Priorización por departamento", "Documento funcional"] },
  { phase: "Fase 1", period: "Semanas 3–6", duration: "Diseño", title: "Arquitectura y prototipo", subtitle: "Design system white-label validado con usuarios.", items: ["Arquitectura multi-tenant", "Prototipo por rol", "Validación con staff real", "Plan de integraciones"] },
  { phase: "Fase 2", period: "Mes 2–4", duration: "MVP", title: "Núcleo operativo DEPRO", subtitle: "Dashboard, periodización, tests, GPS.", items: ["Microciclo y tests T1→T3", "Import Catapult/STATSports", "White-label Palmeiras", "Plantilla multi-equipo"] },
  { phase: "Fase 3", period: "Mes 5–7", duration: "IA", title: "Capa NexGent", subtitle: "Sesiones IA, carga inteligente, chat staff.", items: ["Texto → diagrama SVG", "Clasificación IA de carga", "Resumen IA del chat", "PDF con branding"] },
  { phase: "Fase 4", period: "Mes 8–10", duration: "Pro", title: "Médico, cantera, vídeo", subtitle: "Módulos que diferencian clubes de élite.", items: ["Readaptación completa", "Cantera sin GPS obligatorio", "Scouting + vídeo", "KPIs dirección"] },
  { phase: "Fase 5", period: "Mes 11–12", duration: "Go-live", title: "QA, formación y despliegue", subtitle: "Producción con SLA dedicado.", items: ["Testing carga y seguridad", "Formación presencial", "Migración históricos", "Soporte 24/7"] },
];

export const COMPARE_ROWS = [
  { label: "White-label con logo y colores del club", us: true, sheets: false, generic: false },
  { label: "Periodización meso/microciclo", us: true, sheets: "partial", generic: false },
  { label: "Task designer frameworks A/B/C/D", us: true, sheets: false, generic: false },
  { label: "Import GPS + clasificación IA", us: true, sheets: false, generic: false },
  { label: "Tests T1→T2→T3 con ratings", us: true, sheets: false, generic: "addon" },
  { label: "Sesiones con diagrama IA (SVG)", us: true, sheets: false, generic: false },
  { label: "Chat staff + resumen IA", us: true, sheets: false, generic: false },
  { label: "Módulo médico y readaptación", us: true, sheets: false, generic: "addon" },
  { label: "Cantera multi-categoría", us: true, sheets: false, generic: "limited" },
  { label: "Análisis de vídeo con tags IA", us: true, sheets: false, generic: "limited" },
  { label: "KPIs dirección deportiva", us: true, sheets: false, generic: false },
  { label: "SLA dedicado clubes pro", us: true, sheets: false, generic: "limited" },
];

export const COMMISSION_TIERS = [
  { name: "Segunda / Semi-pro", range: "€150K – €350K", example: "€440K contrato 3 años → €30.800 comisión" },
  { name: "Primera División", range: "€400K – €900K", example: "€1.14M contrato 3 años → €79.800 comisión" },
  { name: "Top 5 Europa / Libertadores", range: "€1M – €3M+", example: "€2.75M contrato 3 años → €192.500 comisión" },
];

export const WORKFLOW_STEPS = [
  { title: "Planificar", desc: "Mesociclo y microciclo por equipo." },
  { title: "Preparar", desc: "Sesiones IA, PDF, tests y calentamientos." },
  { title: "Monitorizar", desc: "GPS, semáforo de carga, chat y alertas médicas." },
  { title: "Decidir", desc: "Scouting, KPIs dirección y readaptación." },
];

export const ADVANTAGES = [
  { title: "IA que entiende fútbol", desc: "Diagramas tácticos, carga y resúmenes en lenguaje natural." },
  { title: "Cero fricción GPS", desc: "Catapult, STATSports, Polar, WIMU — import CSV automático." },
  { title: "White-label real", desc: "Palmeiras en cada pantalla — no SaaS genérico." },
  { title: "Un cerebro de datos", desc: "Rendimiento, salud, planificación y scouting conectados." },
  { title: "Periodización DEPRO", desc: "Mesociclos, tests y adherencia — base operativa probada." },
  { title: "NexGent encima", desc: "Capa IA y módulos pro de élite." },
];

export const PALMEIRAS_STATS = [
  { label: "Jugadores", value: String(PALMEIRAS.players) },
  { label: "Equipos", value: String(PALMEIRAS.teams) },
  { label: "Entrenadores", value: String(PALMEIRAS.coaches) },
  { label: "Categorías", value: "Sub-20 → Pro" },
];

export const UI = {
  clubName: "Palmeiras · Sub-20",
  dashboard: "Dashboard",
  microcycle: "Microciclo",
  squad: "Plantilla",
  tests: "Tests",
  loads: "Cargas",
  players: "Jugadores",
  sessionsCount: "Sesiones",
  testsDone: "Tests",
  nextSession: "Próxima sesión",
  nextSessionValue: "Hoy 09:30 · Técnico-táctico",
  weekTeam: "Semana 24 · Mesociclo 3",
  weeklyLoad: "Carga semanal",
  loadOptimal: "Óptima",
  loadHigh: "Alta",
  loadRisk: "Riesgo",
  aiSummary: "Resumen IA generado",
  exportPdf: "Exportar PDF",
  ratedVsAvg: "Valorado vs media equipo",
  excellentRating: "Rating excelente · +9% vs media",
  importGps: "Import GPS completado",
  scoutingReport: "Informe scouting guardado",
  playerCol: "Jugador",
  endurance: "Resistencia",
  sprint: "Sprint 30m",
  aiPrompt: "Generador IA táctica",
  promptText: "Posesión 3v3 en espacio reducido, 2 toques, presión alta tras pérdida",
  diagramReady: "Diagrama SVG generado · listo para PDF",
  channelCoach: "Cuerpo técnico",
  channelMed: "Médico",
  channelScout: "Scouting",
  chatMsg1: "Sesión técnica mañana 09:30 — intensidad media",
  chatMsg2: "Luis Felipe Fase 2 readaptación — parcial jueves",
  chatMsg3: "Matheus Cunha destacó Sub-20 — informe pendiente",
  aiSummaryText: "3 temas: sesión mañana, readaptación LF, informe MC.",
  attrPhysical: "Físico",
  attrTechnical: "Técnico",
  attrTactical: "Táctico",
  attrAttitude: "Actitudinal",
  scoutTarget: "Informe · Matheus Cunha",
  pdfLine1: "Calentamiento: movilidad + rondo 8v2 (12 min)",
  pdfLine2: "Bloque principal: posesión 3v3 + transiciones (25 min)",
  pdfLine3: "Task designer: finalización + pressing (20 min)",
  sessionTitle: "Sesión B · Técnico-táctico",
  pdfReady: "PDF listo · logo Palmeiras",
  brandPreview: "Vista previa white-label",
  brandApplied: "Branding aplicado a todos los módulos",
  medicalTitle: "Departamento médico",
  medStatus_readapt: "Readaptación",
  medStatus_available: "Disponible",
  medStatus_alert: "Alerta médica",
  medAlertSync: "Alerta sincronizada con GPS y chat",
  academyLabel: "Cantera Palmeiras",
  prospect: "Prospectos",
  promoted: "Promovidos",
  academyNoGps: "Cantera sin GPS obligatorio",
  tagPress: "Pressing",
  tagTransition: "Transición",
  tagFinish: "Finalización",
  videoAiTags: "Tags IA · clip exportado",
  directionTitle: "Panel dirección deportiva",
  kpiAdherence: "Adherencia plan",
  kpiLoad: "Carga plantilla",
  kpiInjuries: "Lesiones vs LY",
  kpiProspects: "Promociones cantera",
  microSynced: "Microciclo sincronizado con tests y GPS",
};
