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
    name: "Esencial",
    tagline: "Plan mensual IA · panel privado",
    price: 19.99,
    period: "/ mes",
    features: [
      "Plan de preparación física mensual",
      "Adaptado a posición y nivel",
      "Sesiones con iconografía de carga",
      "Descarga PDF",
      "Código referido de club aplicable",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  "player-pro": {
    id: "player-pro",
    audience: "player",
    name: "Pro",
    tagline: "Plan IA adaptativo + seguimiento",
    price: 39.99,
    period: "/ mes",
    features: [
      "Todo Esencial +",
      "Ajuste IA semanal según feedback",
      "Tests físicos con ratings",
      "Alertas de sobrecarga",
      "Sincronización con club (si aplica)",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
    highlight: true,
  },
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

export function applyClubDiscount(price) {
  return Math.round(price * 0.85 * 100) / 100;
}
