/**
 * Catálogo de extras jugador (+5€/mes) — alineado con src/lib/playerAddons.js
 */
import stripePricesLive from "./stripe-prices.live.json" with { type: "json" };
import stripePricesTest from "./stripe-prices.test.json" with { type: "json" };
import { isStripeTestMode } from "./_stripeMode.js";

export const ADDON_CATALOG = {
  "addon-pdf": {
    id: "addon-pdf",
    amount: 500,
    name: "DEPRO · Descarga en PDF",
    description: "Descarga sesiones y planificación mensual en PDF.",
    featureId: "pdf_export",
  },
  "addon-cargas": {
    id: "addon-cargas",
    amount: 500,
    name: "DEPRO · Mis cargas",
    description: "Registro de cargas, histórico y gráficos.",
    featureId: "cargas",
  },
  "addon-progression": {
    id: "addon-progression",
    amount: 500,
    name: "DEPRO · Tests con registro",
    description: "Tests físicos con registro e histórico.",
    featureId: "physical_tests",
  },
  // Legacy (compras antiguas)
  "addon-unlimited-exercises": {
    id: "addon-unlimited-exercises",
    amount: 500,
    name: "DEPRO · Ejercicios ilimitados",
    description: "Cambios de ejercicio ilimitados.",
    featureId: "unlimited_exercises",
  },
  "addon-library": {
    id: "addon-library",
    amount: 500,
    name: "DEPRO · Biblioteca ampliada",
    description: "Biblioteca de ejercicios ampliada.",
    featureId: "exercise_library",
  },
  "addon-physical-tests": {
    id: "addon-physical-tests",
    amount: 500,
    name: "DEPRO · Tests físicos",
    description: "Tests físicos con registro.",
    featureId: "physical_tests",
  },
  "addon-coach-ball-refresh": {
    id: "addon-coach-ball-refresh",
    amount: 500,
    name: "DEPRO Coach · Refresco ilimitado con balón",
    description: "Cambios ilimitados de calentamientos con balón.",
    featureId: "unlimited_ball_warmups",
  },
  "addon-coach-teams": {
    id: "addon-coach-teams",
    amount: 500,
    name: "DEPRO Coach · Tres equipos más",
    description: "Hasta 4 equipos (1 incluido + 3 extra).",
    featureId: "extra_teams",
  },
};

const LEGACY_ALIAS = {
  "addon-physical-tests": "addon-progression",
  "addon-library": "addon-unlimited-exercises",
};

function pricesMap() {
  return isStripeTestMode() ? stripePricesTest : stripePricesLive;
}

export function resolveAddonId(addonId) {
  return LEGACY_ALIAS[addonId] || addonId;
}

export function getAddonDef(addonId) {
  const id = resolveAddonId(addonId);
  return ADDON_CATALOG[id] || ADDON_CATALOG[addonId] || null;
}

/** Price ID Stripe del extra (stripe-prices.*.json). */
export function getStripeAddonPriceId(addonId) {
  const id = resolveAddonId(addonId);
  return pricesMap()[id] || null;
}

export function buildAddonLineItem(addonId, amountCents) {
  const def = getAddonDef(addonId);
  if (!def) return null;
  const amount = amountCents != null ? Math.round(Number(amountCents)) : def.amount;
  if (!Number.isFinite(amount) || amount < 0) return null;
  const priceId = getStripeAddonPriceId(def.id);
  if (priceId && amount === def.amount) {
    return { price: priceId, quantity: 1 };
  }
  return {
    price_data: {
      currency: "eur",
      unit_amount: amount,
      recurring: { interval: "month" },
      product_data: {
        name: def.name,
        description: def.description,
        metadata: { depro_addon_id: def.id },
      },
    },
    quantity: 1,
  };
}

/** Extrae ids DEPRO de los items de una suscripción Stripe. */
export function addonIdsFromSubscriptionItems(items = []) {
  const ids = new Set();
  for (const item of items) {
    const price = item.price || {};
    const metaId = price.metadata?.depro_addon_id || price.product?.metadata?.depro_addon_id;
    if (metaId && ADDON_CATALOG[metaId]) {
      ids.add(metaId);
      continue;
    }
    // Fallback: mapear por price id del catálogo
    const priceId = price.id;
    if (priceId) {
      const map = pricesMap();
      for (const [addonKey, mappedPriceId] of Object.entries(map)) {
        if (mappedPriceId === priceId && ADDON_CATALOG[addonKey]) {
          ids.add(addonKey);
        }
      }
    }
  }
  return [...ids];
}
