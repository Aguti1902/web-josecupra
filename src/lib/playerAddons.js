/**
 * Extras individuales — solo 4 productos (correcciones finales §9).
 * Algunos agrupan servicios que antes estaban separados.
 */
export const PLAYER_ADDONS = [
  {
    id: "addon-pdf",
    featureId: "pdf_export",
    featureIds: ["pdf_export"],
    name: "PDF",
    description: "Descarga sesiones y tu planificación mensual en PDF profesional.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-cargas",
    featureId: "cargas",
    featureIds: ["cargas"],
    name: "Registro de cargas",
    description: "Registra pesos, series, reps, tiempos, distancias y FC. Histórico visual en Control de cargas.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-progression",
    featureId: "progression",
    featureIds: ["progression", "physical_tests"],
    name: "Progresión y test",
    description: "Gráficos de evolución mensual, histórico de tests y comparativas de progreso.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-unlimited-exercises",
    featureId: "unlimited_exercises",
    featureIds: ["unlimited_exercises", "exercise_library"],
    name: "Ejercicios ilimitados + carpeta",
    description: "Sustituye ejercicios sin límite y accede a la biblioteca/carpeta de ejercicios incluida.",
    price: 5,
    period: "/ mes",
  },
];

/** Alias legacy → producto actual (compras antiguas siguen resolviendo). */
const LEGACY_ALIAS = {
  "addon-physical-tests": "addon-progression",
  "addon-library": "addon-unlimited-exercises",
};

export function addonById(id) {
  const resolved = LEGACY_ALIAS[id] || id;
  return PLAYER_ADDONS.find((a) => a.id === resolved) || null;
}

export function addonForFeature(featureId) {
  return PLAYER_ADDONS.find((a) =>
    a.featureId === featureId || (a.featureIds || []).includes(featureId)
  ) || null;
}

/** Features desbloqueadas por un addon (incluye agrupaciones). */
export function featuresForAddon(addonId) {
  const addon = addonById(addonId);
  if (!addon) return [];
  return addon.featureIds || [addon.featureId];
}
