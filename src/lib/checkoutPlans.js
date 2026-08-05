/** Planes de suscripción DEPRO — IDs alineados con landing y Stripe checkout */

export const AUDIENCES = {
  coach: { id: "coach", label: "Entrenador" },
  club: { id: "club", label: "Club" },
  player: { id: "player", label: "Jugador" },
};

export const PLANS = {
  "coach-starter": {
    id: "coach-starter",
    audience: "coach",
    name: "Starter",
    tagline: "1 equipo · hasta 25 jugadores",
    price: 14.99,
    period: "/ mes",
    limits: { maxTeams: 1, maxPlayers: 25 },
    features: [
      "Microciclo IA mensual",
      "Sesiones automáticas A/B/C",
      "Panel entrenador",
      "Export PDF básico",
      "Soporte por email",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "coach-pro": {
    id: "coach-pro",
    audience: "coach",
    name: "Pro",
    tagline: "3 equipos · hasta 60 jugadores",
    price: 29.99,
    period: "/ mes",
    limits: { maxTeams: 3, maxPlayers: 60 },
    features: [
      "Todo Starter +",
      "Control de carga manual",
      "Tests físicos T1→T3",
      "Chat staff básico",
      "Histórico por jugador",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
    highlight: true,
  },
  "coach-premium": {
    id: "coach-premium",
    audience: "coach",
    name: "Premium",
    tagline: "Equipos ilimitados · jugadores ilimitados",
    price: 49.99,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Todo Pro +",
      "Import GPS (Catapult, STATSports)",
      "Clasificación IA de carga",
      "Diagramas tácticos IA",
      "Soporte prioritario",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
  },
  "club-inicial": {
    id: "club-inicial",
    audience: "club",
    name: "Inicial",
    tagline: "Hasta 3 equipos · 80 jugadores",
    price: 199,
    period: "/ mes",
    limits: { maxTeams: 3, maxPlayers: 80 },
    features: [
      "Panel centralizado del club",
      "Periodización IA por categoría",
      "White-label (logo y colores)",
      "Programa de referidos",
      "2 cuentas staff incluidas",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "club-pro": {
    id: "club-pro",
    audience: "club",
    name: "Profesional",
    tagline: "Hasta 8 equipos · 200 jugadores",
    price: 399,
    period: "/ mes",
    limits: { maxTeams: 8, maxPlayers: 200 },
    features: [
      "Todo Inicial +",
      "Import GPS multi-equipo",
      "Módulo médico y readaptación",
      "KPIs dirección deportiva",
      "5 cuentas staff incluidas",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
    highlight: true,
  },
  "club-elite": {
    id: "club-elite",
    audience: "club",
    name: "Elite",
    tagline: "Equipos ilimitados · jugadores ilimitados",
    price: 699,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Todo Profesional +",
      "API e integraciones",
      "Scouting y cantera",
      "SLA dedicado",
      "Cuentas staff ilimitadas",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
  },
  "player-essential": {
    id: "player-essential",
    audience: "player",
    name: "Básico",
    tagline: "IA especializada · metodología DEPRO",
    price: 29,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Planificación con IA diseñada por un profesional CAFE (UB)",
      "Metodología propia adaptada a tus cuestionarios y datos",
      "Ranking interno y seguimiento de progreso",
      "Extras opcionales (+5€ c/u): PDF, Registro de cargas, Progresión y test, Ejercicios ilimitados + carpeta",
      "Código de club aplicable",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "player-pro": {
    id: "player-pro",
    audience: "player",
    name: "Premium",
    tagline: "Seguimiento humano · 40 plazas",
    price: 99,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Todo el plan Básico incluido",
      "Seguimiento 100% personalizado por profesional CAFE (UB)",
      "Videollamada inicial + contacto continuo (WhatsApp)",
      "Plan diseñado y revisado manualmente",
      "Ajustes ilimitados · plazas limitadas (40 jugadores)",
      "Todos los extras incluidos sin coste",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
    highlight: true,
  },
};

/** Orden ascendente de planes por audiencia — se usa para sugerir upgrades */
export const PLAN_ORDER = {
  coach: ["coach-starter", "coach-pro", "coach-premium"],
  club: ["club-inicial", "club-pro", "club-elite"],
  player: ["player-essential", "player-pro"],
};

const PLAN_SLUGS = {
  coach: { starter: "coach-starter", pro: "coach-pro", premium: "coach-premium" },
  club: { inicial: "club-inicial", pro: "club-pro", elite: "club-elite" },
  player: { essential: "player-essential", pro: "player-pro", basic: "player-essential", premium: "player-pro" },
};

export function resolvePlanId(audience, planSlug) {
  if (!audience || !planSlug) return "";
  return PLAN_SLUGS[audience]?.[planSlug] || "";
}

export function plansForAudience(audience) {
  return Object.values(PLANS).filter((p) => p.audience === audience);
}

export function formatPrice(price) {
  if (Number.isInteger(price)) return `${price}€`;
  return `${price.toFixed(2).replace(".", ",")}€`;
}

/** Descuento del código club en planificaciones individuales (10%). */
export const CLUB_DISCOUNT_PCT = 10;

export function applyClubDiscount(price, pct = CLUB_DISCOUNT_PCT) {
  const rate = 1 - (Number(pct) || CLUB_DISCOUNT_PCT) / 100;
  return Math.round(price * rate * 100) / 100;
}

/** Límites del plan. Si el plan no se reconoce, se devuelve ilimitado (fail-open). */
export function getPlanLimits(planId) {
  return PLANS[planId]?.limits || { maxTeams: null, maxPlayers: null };
}

/** Siguiente plan (superior) dentro de la misma audiencia, o null si ya es el más alto. */
export function getNextPlan(planId) {
  const plan = PLANS[planId];
  if (!plan) return null;
  const order = PLAN_ORDER[plan.audience] || [];
  const idx = order.indexOf(planId);
  if (idx === -1 || idx === order.length - 1) return null;
  return PLANS[order[idx + 1]] || null;
}

/**
 * Resuelve un plan "legacy" en texto libre (p.ej. lo que guarda el admin en club.plan:
 * "Activo", "Pro", "Premium"…) al plan más cercano dentro de una audiencia.
 * Si no hay match reconocible, devuelve el plan más alto (ilimitado) para no
 * restringir por error a un club/entrenador ya existente.
 */
export function resolvePlanForClub(planText, audience = "club") {
  const order = PLAN_ORDER[audience] || [];
  const topPlan = order.length ? PLANS[order[order.length - 1]] : null;
  if (!planText) return topPlan;
  if (PLANS[planText]) return PLANS[planText];

  const norm = String(planText).toLowerCase();
  if (norm.includes("elite") || norm.includes("premium")) return topPlan;
  if (norm.includes("pro") || norm.includes("profesional")) return PLANS[order[1]] || topPlan;
  if (norm.includes("inicial") || norm.includes("starter") || norm.includes("básico") || norm.includes("basico")) {
    return PLANS[order[0]] || topPlan;
  }
  return topPlan;
}
