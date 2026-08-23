/**
 * Extras del carrito DEPRO Coach (+5€/mes), mismo modelo que el jugador.
 * Standard: sesiones + tests incluidos. Premium: todo incluido con descuento.
 */
export const COACH_ADDONS = [
  {
    id: "addon-coach-ball-refresh",
    featureId: "unlimited_ball_warmups",
    featureIds: ["unlimited_ball_warmups", "unlimited_exercises"],
    name: "Refresco ilimitado con balón",
    description: "Cambia las tareas de calentamiento con balón las veces que quieras.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-pdf",
    featureId: "pdf_export",
    featureIds: ["pdf_export"],
    name: "Descarga de sesiones en PDF",
    description: "Descarga las sesiones del microciclo en PDF profesional.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-cargas",
    featureId: "cargas",
    featureIds: ["cargas"],
    name: "Control de cargas",
    description: "Registro de cargas, histórico y gráficos del equipo.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-coach-teams",
    featureId: "extra_teams",
    featureIds: ["extra_teams"],
    name: "Tres equipos más",
    description: "Hasta 4 equipos (ideal si llevas varias categorías).",
    price: 5,
    period: "/ mes",
  },
];

export const COACH_EXTRA_TEAMS_ADDON = "addon-coach-teams";
export const COACH_STANDARD_MAX_TEAMS = 1;
export const COACH_TEAMS_WITH_ADDON = 4;

/** Compras antiguas de tests: los tests ahora van incluidos. */
const LEGACY_ALIAS = {
  "addon-progression": "addon-progression",
  "addon-physical-tests": "addon-progression",
};

export function coachAddonById(id) {
  const resolved = LEGACY_ALIAS[id] || id;
  return COACH_ADDONS.find((a) => a.id === resolved)
    || (resolved === "addon-progression" ? {
      id: "addon-progression",
      featureId: "team_tests",
      featureIds: ["team_tests", "physical_tests"],
      name: "Tests con registro",
      price: 5,
    } : null);
}

export function coachFeaturesForAddon(addonId) {
  const addon = coachAddonById(addonId);
  if (!addon) return [];
  return addon.featureIds || [addon.featureId];
}
