/** Planes de suscripción DEPRO — IDs alineados con landing y Stripe checkout */

import { COACH_EXTRA_TEAMS_ADDON, COACH_STANDARD_MAX_TEAMS, COACH_TEAMS_WITH_ADDON } from "./coachAddons.js";

export const AUDIENCES = {
  coach: { id: "coach", label: "Entrenador" },
  club: { id: "club", label: "Club" },
  player: { id: "player", label: "Jugador" },
};

export const PLANS = {
  "coach-starter": {
    id: "coach-starter",
    audience: "coach",
    name: "Standard",
    tagline: "Sesiones automáticas · 1 equipo · extras +5€",
    price: 30,
    period: "/ mes",
    limits: { maxTeams: 1, maxPlayers: 25 },
    features: [
      "Microciclo y mesociclo automáticos según tu cuestionario",
      "Dos sesiones por tipo de entreno, repartidas en el mes",
      "Actualización automática al cambiar de mes",
      "1 equipo incluido",
      "Tests de equipo incluidos",
      "Extras opcionales (+5€/mes): refresco con balón, PDF de sesiones, cargas, +3 equipos",
      "Mismo flujo de compra que las planificaciones individuales",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "coach-pro": {
    id: "coach-pro",
    audience: "coach",
    name: "Standard (legado)",
    tagline: "Plan anterior Pro — se trata como Standard",
    price: 30,
    period: "/ mes",
    limits: { maxTeams: 1, maxPlayers: 25 },
    features: ["Sesiones automáticas", "1 equipo"],
    color: "#0A36F7",
    bg: "#EEF1FF",
    legacy: true,
  },
  "coach-premium": {
    id: "coach-premium",
    audience: "coach",
    name: "Premium",
    tagline: "Todo el Standard + extras · descuento sobre 50€",
    price: 45,
    period: "/ mes",
    limits: { maxTeams: 4, maxPlayers: 60 },
    features: [
      "Todo el plan Standard",
      "Refresco ilimitado de calentamientos con balón",
      "Descarga de sesiones en PDF",
      "Control de cargas",
      "Hasta 4 equipos (1 + 3 extra)",
      "Tests de equipo incluidos",
      "Pequeño descuento vs Standard 30€ + extras 20€ (50€ → 45€)",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
    highlight: true,
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
    name: "Standard",
    tagline: "IA especializada · metodología DEPRO · prueba 15 días",
    price: 29,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Planificación con IA diseñada por un profesional CAFE (UB)",
      "Metodología propia adaptada a tus cuestionarios y datos",
      "Ranking interno y seguimiento de progreso",
      "15 días de prueba: acceso a todo (datos no se guardan · 1 PDF)",
      "Extras opcionales (+5€/mes): PDF, Tests con registro, Mis cargas",
      "Feedback del preparador solo en Premium",
      "Código de club aplicable",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "player-pro": {
    id: "player-pro",
    audience: "player",
    name: "Premium",
    tagline: "Seguimiento humano · sin prueba gratis · 40 plazas",
    price: 99,
    period: "/ mes",
    limits: { maxTeams: null, maxPlayers: null },
    features: [
      "Todo el plan Standard incluido",
      "Sin prueba gratuita · cobro desde el primer día",
      "Feedback y seguimiento 100% personalizado (CAFE · UB)",
      "Videollamada inicial + contacto continuo (WhatsApp)",
      "Plan diseñado y revisado manualmente",
      "Todos los extras incluidos (PDF, tests, mis cargas)",
      "Ajustes ilimitados · plazas limitadas (40 jugadores)",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
    highlight: true,
  },
};

/** Orden ascendente de planes por audiencia — se usa para sugerir upgrades */
export const PLAN_ORDER = {
  coach: ["coach-starter", "coach-premium"],
  club: ["club-inicial", "club-pro", "club-elite"],
  player: ["player-essential", "player-pro"],
};

const PLAN_SLUGS = {
  coach: { starter: "coach-starter", pro: "coach-starter", premium: "coach-premium", essential: "coach-starter" },
  club: { inicial: "club-inicial", pro: "club-pro", elite: "club-elite" },
  player: { essential: "player-essential", pro: "player-pro", basic: "player-essential", premium: "player-pro" },
};

/** Trial de 15 días en checkout: Standard jugador y Standard entrenador. Premium y clubs se cobran al confirmar. */
export function planHasCheckoutTrial(planId) {
  return planId === "player-essential" || planId === "coach-starter" || planId === "coach-pro";
}

/** Trial en Stripe: el plan lo admite y el usuario no ha pedido saltarlo. */
export function checkoutUsesTrial(planId, skipTrial = false) {
  return planHasCheckoutTrial(planId) && !skipTrial;
}

export function resolvePlanId(audience, planSlug) {
  if (!audience || !planSlug) return "";
  return PLAN_SLUGS[audience]?.[planSlug] || "";
}

export function plansForAudience(audience) {
  return Object.values(PLANS).filter((p) => p.audience === audience && !p.legacy);
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
export function getPlanLimits(planId, { purchasedAddons = [] } = {}) {
  const plan = PLANS[planId];
  const base = plan?.limits || { maxTeams: null, maxPlayers: null };
  if (plan?.audience !== "coach") return { ...base };
  const extraTeams = planId === "coach-premium" || (purchasedAddons || []).includes(COACH_EXTRA_TEAMS_ADDON);
  return {
    ...base,
    maxTeams: extraTeams ? COACH_TEAMS_WITH_ADDON : (base.maxTeams ?? COACH_STANDARD_MAX_TEAMS),
  };
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
  if (norm.includes("pro") || norm.includes("profesional")) {
    if (audience === "coach") return PLANS[order[0]] || topPlan;
    return PLANS[order[1]] || topPlan;
  }
  if (norm.includes("inicial") || norm.includes("starter") || norm.includes("básico") || norm.includes("basico")) {
    return PLANS[order[0]] || topPlan;
  }
  return topPlan;
}
