/**
 * Extras del carrito DEPRO Coach (+5€/mes), mismo modelo que el jugador.
 * Standard: sesiones. Premium: todo incluido con descuento.
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
    id: "addon-progression",
    featureId: "team_tests",
    featureIds: ["team_tests", "physical_tests"],
    name: "Tests con registro",
    description: "Acceso a tests físicos de equipo con registro e histórico.",
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

export function coachAddonById(id) {
  return COACH_ADDONS.find((a) => a.id === id) || null;
}

export function coachFeaturesForAddon(addonId) {
  const addon = coachAddonById(addonId);
  if (!addon) return [];
  return addon.featureIds || [addon.featureId];
}
