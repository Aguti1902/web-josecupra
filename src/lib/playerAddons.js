/** Extras opcionales para jugadores (5€/mes cada uno en plan Básico). */
export const PLAYER_ADDONS = [
  {
    id: "addon-pdf",
    featureId: "pdf_export",
    name: "Export PDF",
    description: "Descarga sesiones y planes en PDF profesional.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-cargas",
    featureId: "cargas",
    name: "Registro de cargas",
    description: "Registra peso, series, RPE e histórico por ejercicio.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-physical-tests",
    featureId: "physical_tests",
    name: "Tests físicos",
    description: "Batería de tests físicos con seguimiento.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-unlimited-exercises",
    featureId: "unlimited_exercises",
    name: "Ejercicios ilimitados",
    description: "Sustituye ejercicios sin límite manteniendo tu plan base.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-progression",
    featureId: "progression",
    name: "Progresión avanzada",
    description: "Gráficos de evolución y histórico de cargas.",
    price: 5,
    period: "/ mes",
  },
  {
    id: "addon-library",
    featureId: "exercise_library",
    name: "Biblioteca ampliada",
    description: "Acceso completo a la biblioteca de ejercicios.",
    price: 5,
    period: "/ mes",
  },
];

export function addonById(id) {
  return PLAYER_ADDONS.find((a) => a.id === id) || null;
}

export function addonForFeature(featureId) {
  return PLAYER_ADDONS.find((a) => a.featureId === featureId) || null;
}
