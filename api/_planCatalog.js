/** Catálogo de precios Stripe compartido por create-checkout y update-subscription.
 * Debe mantenerse alineado con src/lib/checkoutPlans.js. */

import stripePricesLive from "./stripe-prices.live.json" with { type: "json" };
import stripePricesTest from "./stripe-prices.test.json" with { type: "json" };
import { isStripeTestMode } from "./_stripeMode.js";

export const TRIAL_PERIOD_DAYS = 15;

export const PRICES = {
  "coach-starter":    { amount: 1499,  name: "DEPRO Entrenador Starter",   description: "1 equipo · hasta 25 jugadores · microciclo IA" },
  "coach-pro":        { amount: 2999,  name: "DEPRO Entrenador Pro",       description: "3 equipos · hasta 60 jugadores · control de carga" },
  "coach-premium":    { amount: 4999,  name: "DEPRO Entrenador Premium",   description: "Equipos ilimitados · GPS · diagramas IA" },
  "club-inicial":     { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":         { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":       { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential": { amount: 2900,  name: "DEPRO Jugador Básico",       description: "Plan IA · ranking · tests · panel privado" },
  "player-pro":       { amount: 9900,  name: "DEPRO Jugador Premium",      description: "Seguimiento humano · videollamada · WhatsApp · 30 plazas" },
};

function stripePricesMap() {
  return isStripeTestMode() ? stripePricesTest : stripePricesLive;
}

export function getStripePriceId(planId) {
  return stripePricesMap()[planId] || null;
}

/** Line item para Checkout: usa Price ID fijo si existe, si no price_data dinámico. */
export function buildCheckoutLineItem(planId, finalAmountCents) {
  const priceId = getStripePriceId(planId);
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }
  const price = PRICES[planId];
  if (!price) return null;
  return {
    price_data: {
      currency: "eur",
      unit_amount: finalAmountCents,
      recurring: { interval: "month" },
      product_data: {
        name: price.name,
        description: price.description,
      },
    },
    quantity: 1,
  };
}

/** Item de suscripción para update: Price ID o price_data. */
export function buildSubscriptionItemUpdate(planId, itemId) {
  const priceId = getStripePriceId(planId);
  const price = PRICES[planId];
  if (priceId) {
    return { id: itemId, price: priceId };
  }
  return {
    id: itemId,
    price_data: {
      currency: "eur",
      unit_amount: price.amount,
      recurring: { interval: "month" },
      product_data: { name: price.name, description: price.description },
    },
  };
}

export { isStripeTestMode };
