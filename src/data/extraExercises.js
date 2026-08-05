/**
 * +80 ejercicios adicionales del PDF (carpetas nuevas)
 * Se fusionan con EXERCISES en exercises.js
 */

const mk = (id, nombre, etiquetas, material, contraindicado = []) => ({
  id, nombre, etiquetas, material, contraindicado,
});

export const EXTRA_EXERCISES = [
  // resistencia_aerobica
  ...["Carrera continua 20 min", "Carrera continua 30 min", "Trote suave 15 min", "Bici estática 25 min", "Elíptica 20 min", "Remo ergómetro 15 min", "Skipping ligero 3×2 min", "Carrera en cinta 20 min", "Senderismo ritmo medio 40 min", "Natación estilo libre 20 min"].map((n, i) =>
    mk(`ra${i + 1}`, n, ["resistencia", "resistencia_aerobica"], i % 2 ? "campo" : "sin_material", ["tobillo"])
  ),
  // resistencia_anaerobica
  ...["Sprint 15s / pausa 45s ×8", "400m ×4 recuperación 2 min", "Tabata 20/10 ×8", "Fartlek 5 min", "Series 200m ×6", "1 min ON / 1 min OFF ×10", "Escaleras 30s ×8", "Burpees intervalo 30s", "Mountain climbers 40s ×6", "Sprint cuesta 20m ×6"].map((n, i) =>
    mk(`ran${i + 1}`, n, ["resistencia", "resistencia_anaerobica", "velocidad"], "campo", ["rodilla", "tobillo"])
  ),
  // resistencia_umbral
  ...["Tempo run 12 min", "Carrera umbral 20 min", "Series 3 min ritmo umbral ×4", "Bici umbral 15 min", "Remo umbral 10 min", "Carrera progresiva 25 min", "2×10 min umbral", "Circuito umbral tren inferior", "Zona 3 continua 18 min", "Test Cooper adaptado"].map((n, i) =>
    mk(`ru${i + 1}`, n, ["resistencia", "resistencia_umbral"], "campo", ["tobillo"])
  ),
  // pliometria_basica
  ...["Saltos al cajón bajo", "Saltos en el sitio", "Zancada con salto", "Skipping A", "Skipping B", "Skipping C", "Rebotes en dos piernas", "Salto lateral conos", "Hop 20m", "Pogo jumps"].map((n, i) =>
    mk(`pb${i + 1}`, n, ["pliometria", "fuerza_explosiva"], "sin_material", ["rodilla", "tobillo"])
  ),
  // pliometria_avanzada
  ...["Depth jump", "Saltos al cajón medio", "Triple salto", "Salto unilateral", "Reactive jump", "Bounding 30m", "Hurdle hops", "Drop jump", "Salto con giro", "Pliometría reactiva 2 piernas"].map((n, i) =>
    mk(`pa${i + 1}`, n, ["pliometria", "fuerza_explosiva"], "campo", ["rodilla", "tobillo"])
  ),
  // lesion_rodilla
  ...["Terminal knee extension banda", "Isométrico cuádriceps", "Puente glúteo isométrico", "Step-down controlado", "Monster walk suave", "Sentadilla parcial pared", "Copenhagen plank corto", "Balance unipodal", "Mini sentadilla isométrica", "Activación VMO"].map((n, i) =>
    mk(`lr${i + 1}`, n, ["prevencion", "lesion_rodilla"], i % 2 ? "gomas" : "sin_material", [])
  ),
  // lesion_tobillo
  ...["Alfabeto tobillo", "Equilibrio unipodal ojos cerrados", "Elevación gemelos isométrico", "Caminata talón-punta", "Banda dorsiflexión", "Saltos suaves en el sitio", "Propiocepción disco", "Single leg balance", "Movilidad tobillo pared", "Calf raise excéntrico"].map((n, i) =>
    mk(`lt${i + 1}`, n, ["prevencion", "lesion_tobillo"], "sin_material", [])
  ),
  // lesion_hombro
  ...["Pendular Codman", "Rotadores externos banda", "Y-T-W en suelo", "Wall slide", "Scapular push-up", "Face pull banda", "Isométrico rotación externa", "Movilidad hombro banda", "Band pull apart", "Dead bug hombro"].map((n, i) =>
    mk(`lh${i + 1}`, n, ["prevencion", "lesion_hombro", "hombro"], i % 2 ? "gomas" : "sin_material", [])
  ),
  // lesion_espalda
  ...["Cat-camel", "Bird dog", "Dead bug", "Puente glúteo", "Superman alterno", "Rotación torácica", "Respiración diafragmática", "Plancha modificada", "Side plank corto", "Movilidad cadera 90/90"].map((n, i) =>
    mk(`le${i + 1}`, n, ["prevencion", "lesion_espalda", "movilidad"], "sin_material", [])
  ),
  // core_avanzado
  ...["Pallof press", "Rollout con rueda", "Dragon flag asistido", "Hollow hold", "Ab wheel parcial", "Plancha RKC", "Anti-rotación banda", "Turkish get-up asistido", "Farmer carry", "Suitcase carry"].map((n, i) =>
    mk(`ca${i + 1}`, n, ["core", "core_avanzado"], i % 3 === 0 ? "mancuernas" : "sin_material", [])
  ),
];

/** Carpetas funcionales visibles (taxonomía DEPRO). La clasificación fina va por etiquetas. */
export const CATALOG_FOLDERS = [
  { id: "fuerza_tren_inferior", label: "Fuerza · Tren inferior" },
  { id: "fuerza_tren_superior", label: "Fuerza · Tren superior" },
  { id: "velocidad", label: "Velocidad" },
  { id: "pliometria", label: "Pliometría" },
  { id: "core", label: "Core" },
  { id: "prevencion", label: "Prevención" },
  { id: "movilidad", label: "Movilidad" },
  // Vistas legacy por lesión (filtro secundario)
  { id: "lesion_rodilla", label: "Lesión rodilla (filtro)" },
  { id: "lesion_tobillo", label: "Lesión tobillo (filtro)" },
  { id: "lesion_hombro", label: "Lesión hombro (filtro)" },
  { id: "lesion_espalda", label: "Lesión espalda (filtro)" },
];
