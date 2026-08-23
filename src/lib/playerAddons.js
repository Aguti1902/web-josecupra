/**
 * Extras individuales del carrito (+5€/mes).
 * Standard: PDF, tests con registro y mis cargas se compran aparte.
 * Premium: todos incluidos.
 */
export const PLAYER_ADDONS = [
  {
    id: "addon-pdf",
    featureId: "pdf_export",
    featureIds: ["pdf_export"],
    name: "Descarga en PDF",
    description: "Descarga sesiones y tu planificación mensual en PDF profesional.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-progression",
    featureId: "physical_tests",
    featureIds: ["physical_tests", "progression"],
    name: "Tests con registro",
    description: "Acceso a tests físicos con registro, histórico y comparativas de progreso.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-cargas",
    featureId: "cargas",
    featureIds: ["cargas"],
    name: "Mis cargas",
    description: "Registro de pesos, series, reps, tiempos y FC. Histórico en Mis cargas.",
    price: 5,
    period: "/ mes",
  },
];

/** Productos legacy (compras antiguas siguen resolviendo). */
const LEGACY_ADDONS = [
  {
    id: "addon-unlimited-exercises",
    featureId: "unlimited_exercises",
    featureIds: ["unlimited_exercises", "exercise_library"],
    name: "Ejercicios ilimitados + carpeta",
    description: "Sustituye ejercicios sin límite y accede a la biblioteca de ejercicios.",
    price: 5,
    period: "/ mes",
  },
];

const LEGACY_ALIAS = {
  "addon-physical-tests": "addon-progression",
  "addon-library": "addon-unlimited-exercises",
};

function allAddons() {
  return [...PLAYER_ADDONS, ...LEGACY_ADDONS];
}

export function addonById(id) {
  const resolved = LEGACY_ALIAS[id] || id;
  return allAddons().find((a) => a.id === resolved) || null;
}

export function addonForFeature(featureId) {
  return allAddons().find((a) =>
    a.featureId === featureId || (a.featureIds || []).includes(featureId)
  ) || null;
}

/** Features desbloqueadas por un addon (incluye agrupaciones). */
export function featuresForAddon(addonId) {
  const addon = addonById(addonId);
  if (!addon) return [];
  return addon.featureIds || [addon.featureId];
}
