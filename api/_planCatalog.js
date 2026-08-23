/** Catálogo de precios Stripe compartido por create-checkout y update-subscription.
 * Debe mantenerse alineado con src/lib/checkoutPlans.js. */

import stripePricesLive from "./stripe-prices.live.json" with { type: "json" };
import stripePricesTest from "./stripe-prices.test.json" with { type: "json" };
import { isStripeTestMode } from "./_stripeMode.js";

export const TRIAL_PERIOD_DAYS = 15;

export const PRICES = {
  "coach-starter":    { amount: 3000,  name: "DEPRO Entrenador Standard",  description: "Sesiones automáticas · 1 equipo · extras +5€" },
  "coach-pro":        { amount: 3000,  name: "DEPRO Entrenador Standard",  description: "Sesiones automáticas · 1 equipo (plan legado Pro)" },
  "coach-premium":    { amount: 4500,  name: "DEPRO Entrenador Premium",   description: "Standard + extras con descuento · hasta 4 equipos" },
  "club-inicial":     { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":         { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":       { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential": { amount: 2900,  name: "DEPRO Jugador Básico",       description: "IA especializada · metodología DEPRO · ranking · tests" },
  "player-pro":       { amount: 9900,  name: "DEPRO Jugador Premium",      description: "Seguimiento humano CAFE · videollamada · WhatsApp · 40 plazas" },
};

function stripePricesMap() {
  return isStripeTestMode() ? stripePricesTest : stripePricesLive;
}

export function getStripePriceId(planId) {
  return stripePricesMap()[planId] || null;
}

/** Line item para Checkout: Price ID fijo solo si el importe coincide; si hay descuento → price_data. */
export function buildCheckoutLineItem(planId, finalAmountCents) {
  const price = PRICES[planId];
  if (!price) return null;
  const priceId = getStripePriceId(planId);
  // Si el importe final difiere del catálogo (p. ej. −10% club), ignorar Price ID fijo
  if (priceId && Number(finalAmountCents) === Number(price.amount)) {
    return { price: priceId, quantity: 1 };
  }
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
