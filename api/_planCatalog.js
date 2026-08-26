/** Catálogo de precios Stripe compartido por create-checkout y update-subscription.
 * Debe mantenerse alineado con src/lib/checkoutPlans.js. */

import stripePricesLive from "./stripe-prices.live.json" with { type: "json" };
import stripePricesTest from "./stripe-prices.test.json" with { type: "json" };
import { isStripeTestMode } from "./_stripeMode.js";
import { planHasCheckoutTrial } from "../src/lib/checkoutPlans.js";

export const TRIAL_PERIOD_DAYS = 15;
export { planHasCheckoutTrial };

/** Price IDs en stripe-prices.*.json pueden ser de importes antiguos (19,99 / 14,99…).
 * Solo se reutilizan si el JSON guarda `amount` y coincide con el catálogo. */
export const PRICES = {
  "coach-starter":    { amount: 3000,  name: "DEPRO Entrenador Standard",  description: "Sesiones automáticas · 1 equipo · extras +5€" },
  "coach-pro":        { amount: 3000,  name: "DEPRO Entrenador Standard",  description: "Sesiones automáticas · 1 equipo (plan legado Pro)" },
  "coach-premium":    { amount: 4500,  name: "DEPRO Entrenador Premium",   description: "Standard + extras con descuento · hasta 4 equipos" },
  "club-inicial":     { amount: 19900, name: "DEPRO Club Inicial",         description: "Hasta 3 equipos · white-label · referidos" },
  "club-pro":         { amount: 39900, name: "DEPRO Club Profesional",     description: "Hasta 8 equipos · GPS · módulo médico" },
  "club-elite":       { amount: 69900, name: "DEPRO Club Elite",           description: "Equipos ilimitados · API · SLA dedicado" },
  "player-essential": { amount: 2900,  name: "DEPRO Jugador Standard",    description: "IA especializada · metodología DEPRO · ranking · tests" },
  "player-pro":       { amount: 9900,  name: "DEPRO Jugador Premium",      description: "Seguimiento humano CAFE · videollamada · WhatsApp · 40 plazas" },
};

function stripePricesMap() {
  return isStripeTestMode() ? stripePricesTest : stripePricesLive;
}

export function getStripePriceRecord(planId) {
  const rec = stripePricesMap()[planId];
  if (!rec) return { priceId: null, amount: null };
  if (typeof rec === "string") return { priceId: rec, amount: null };
  return {
    priceId: rec.priceId || rec.id || null,
    amount: rec.amount != null ? Number(rec.amount) : null,
  };
}

export function getStripePriceId(planId) {
  return getStripePriceRecord(planId).priceId;
}

function canReuseStripePriceId(planId, finalAmountCents) {
  const price = PRICES[planId];
  if (!price) return false;
  const rec = getStripePriceRecord(planId);
  if (!rec.priceId) return false;
  if (Number(finalAmountCents) !== Number(price.amount)) return false;
  // Sin amount en el JSON no sabemos si Stripe sigue en 19,99 u otro importe viejo.
  if (rec.amount == null) return false;
  return Number(rec.amount) === Number(finalAmountCents);
}

function catalogPriceData(price, amountCents) {
  return {
    currency: "eur",
    unit_amount: amountCents,
    recurring: { interval: "month" },
    product_data: {
      name: price.name,
      description: price.description,
    },
  };
}

/** Line item para Checkout: Price ID fijo solo si el importe coincide; si hay descuento → price_data. */
export function buildCheckoutLineItem(planId, finalAmountCents) {
  const price = PRICES[planId];
  if (!price) return null;
  if (canReuseStripePriceId(planId, finalAmountCents)) {
    return { price: getStripePriceId(planId), quantity: 1 };
  }
  return {
    price_data: catalogPriceData(price, finalAmountCents),
    quantity: 1,
  };
}

/** Item de suscripción para update: Price ID o price_data. */
export function buildSubscriptionItemUpdate(planId, itemId) {
  const price = PRICES[planId];
  if (canReuseStripePriceId(planId, price?.amount)) {
    return { id: itemId, price: getStripePriceId(planId) };
  }
  return {
    id: itemId,
    price_data: catalogPriceData(price, price.amount),
  };
}

export { isStripeTestMode };
