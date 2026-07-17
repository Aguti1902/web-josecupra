/** Catálogo de precios Stripe compartido por create-checkout y update-subscription.
 * Debe mantenerse alineado con src/lib/checkoutPlans.js. */

export const TRIAL_PERIOD_DAYS = 15;

export const PRICES = {
  "coach-starter":    { amount: 1499,  name: "DEPRO Entrenador Starter",   description: "1 equipo · hasta 25 jugadores · microciclo IA" },
  "coach-pro":        { amount: 2999,  name: "DEPRO Entrenador Pro",       description: "3 equipos · hasta 60 jugadores · control de carga" },
  "coach-premium":    { amount: 4999,  name: "DEPRO Entrenador Premium",   description: "Equipos ilimitados · GPS · diagramas IA" },
  "club-inicial":     { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":         { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":       { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential": { amount: 1999,  name: "DEPRO Jugador Esencial",     description: "Plan mensual IA · panel privado · PDF" },
  "player-pro":       { amount: 3999,  name: "DEPRO Jugador Pro",          description: "Plan IA adaptativo · tests · alertas de carga" },
};
