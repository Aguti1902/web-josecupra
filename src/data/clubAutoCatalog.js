/**
 * Catálogo de la rama automática clubs/entrenadores.
 * Capa separada: no modifica exerciseCatalog ni etiquetas del motor individual.
 */

/**
 * Carpeta lógica: /calentamientos_sin_balon
 * Solo enlaces a vídeo (YouTube). Selección aleatoria como calentamiento general.
 */
export const CLUB_GENERAL_WARMUPS = [
  {
    id: "cgw_1",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Movilidad articular global",
    duracion: "8-10 min",
    descripcion: "Movilidad articular global + activación suave en círculo.",
    videoUrl: "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
  },
  {
    id: "cgw_2",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Activación dinámica cadera-tobillo",
    duracion: "8-10 min",
    descripcion: "Skipping suave, talones, apertura/cierre de cadera y movilidad de tobillo.",
    videoUrl: "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
  },
  {
    id: "cgw_3",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Desplazamientos + movilidad dinámica",
    duracion: "8-10 min",
    descripcion: "Desplazamientos + movilidad dinámica de cadera y hombro.",
    videoUrl: "https://www.youtube.com/watch?v=3PqgN9q_0ZQ",
  },
  {
    id: "cgw_4",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Movilidad torácica y hombro",
    duracion: "8-10 min",
    descripcion: "Secuencia de movilidad torácica, escapular y hombro sin balón.",
    videoUrl: "https://www.youtube.com/watch?v=R0mMyIyLx_Q",
  },
  {
    id: "cgw_5",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Pre-protocolo sin balón",
    duracion: "8-10 min",
    descripcion: "Secuencia estable: articulación → activación → elevación de pulso.",
    videoUrl: "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
  },
  {
    id: "cgw_6",
    carpeta: "/calentamientos_sin_balon",
    nombre: "Movilidad + elevación de pulso",
    duracion: "8-10 min",
    descripcion: "Movilidad general seguida de activación neuromuscular suave.",
    videoUrl: "https://www.youtube.com/watch?v=2L2W3nY4v8A",
  },
];

const BALL_FOLDER = {
  rondo: "/calentamiento_balon/rondos",
  rueda_pases: "/calentamiento_balon/ruedas_pases",
  circuito: "/calentamiento_balon/circuitos",
  posiciones: "/calentamiento_balon/trabajo_posiciones",
  pases: "/calentamiento_balon/ejercicios_pases",
};

/** Carpetas lógicas: /calentamiento_balon/{rondos,ruedas_pases,circuitos,trabajo_posiciones,ejercicios_pases} */
export const CLUB_BALL_WARMUPS = [
  { id: "cbw_rondo_a", carpeta: BALL_FOLDER.rondo, nombre: "Rondo 4v1 suave", tipo: "rondo", nivel: ["A", "B", "C"], intensidad: "baja", descripcion: "Conservación simple, 1 toque opcional según nivel." },
  { id: "cbw_rondo_b", carpeta: BALL_FOLDER.rondo, nombre: "Rondo 5v2 activación", tipo: "rondo", nivel: ["B", "C"], intensidad: "media", descripcion: "Salida tras 5 pases; ritmo controlado." },
  { id: "cbw_rueda_a", carpeta: BALL_FOLDER.rueda_pases, nombre: "Rueda de pases con apoyo", tipo: "rueda_pases", nivel: ["A", "B", "C"], intensidad: "baja", descripcion: "Pase-control-pase con tercer hombre." },
  { id: "cbw_rueda_b", carpeta: BALL_FOLDER.rueda_pases, nombre: "Rueda de pases en triángulos", tipo: "rueda_pases", nivel: ["B", "C"], intensidad: "media", descripcion: "Orientación corporal y pase al espacio cercano." },
  { id: "cbw_circ_a", carpeta: BALL_FOLDER.circuito, nombre: "Circuito técnico pase-conducción", tipo: "circuito", nivel: ["A", "B"], intensidad: "baja", descripcion: "Estaciones cortas sin oposición." },
  { id: "cbw_circ_b", carpeta: BALL_FOLDER.circuito, nombre: "Circuito técnico con desmarque", tipo: "circuito", nivel: ["B", "C"], intensidad: "media", descripcion: "Pase + desmarque corto + recepción." },
  { id: "cbw_pos_a", carpeta: BALL_FOLDER.posiciones, nombre: "Trabajo de posiciones suave", tipo: "posiciones", nivel: ["A", "B", "C"], intensidad: "baja", descripcion: "Ocupación de espacios y orientación." },
  { id: "cbw_pos_b", carpeta: BALL_FOLDER.posiciones, nombre: "Posiciones con orientación corporal", tipo: "posiciones", nivel: ["B", "C"], intensidad: "media", descripcion: "Ocupación + orientación hacia el juego." },
  { id: "cbw_pases_a", carpeta: BALL_FOLDER.pases, nombre: "Ejercicios de pases en parejas", tipo: "pases", nivel: ["A", "B", "C"], intensidad: "baja", descripcion: "Pases cortos/medios con control orientado." },
  { id: "cbw_pases_b", carpeta: BALL_FOLDER.pases, nombre: "Pases en progresión 3 jugadores", tipo: "pases", nivel: ["B", "C"], intensidad: "media", descripcion: "Secuencia A→B→C con movilidad." },
];

/** Mapeo paralelo club_* → nombres del catálogo individual (sin mutar etiquetas base). */
export const CLUB_SLOT_EXERCISE_NAMES = {
  movilidad_cadera: ["Movilidad de cadera 90/90", "Movilidad de cadera en círculos", "Movilidad de cadera maripeda", "Movilidad de cadera estocada + rotación torácica", "Pase pierna por encima"],
  movilidad_tobillo: ["Movilidad de tobillo en flexión", "Movilidad de tobillo en círculos", "Movilidad de tobillo dorsiflexión con banda"],
  movilidad_toracica: ["Rotación torácica en cuadrupedia", "Rotación torácica en decúbito lateral", "Movilidad de hombro Y-T-W con banda"],
  activacion_gluteo: ["Puente de glúteo 2 piernas", "Glute bridge con goma", "Hip thrust unilateral", "Isometría puente de glúteo"],
  core_control: ["Dead bug", "Bird dog", "Antiextensión lumbar", "Hollow hold"],
  equilibrio: ["Equilibrio unipodal en línea", "Equilibrio unipodal con ojos cerrados", "Estabilidad tobillo", "Caminata talón-punta línea recta"],
  desplazamiento_controlado: ["Lateral walk con banda elástica", "Monster walk", "Zancada lateral", "Skipping técnico en sitio"],
  fuerza_bilateral_anterior: ["Sentadilla clásica", "Sentadilla goblet", "Sentadilla con mancuernas", "Sentadilla brazos arriba", "Split squat"],
  fuerza_unilateral: ["Zancada atrás", "Zancada adelante", "Step-up en banco", "Sentadilla búlgara con mancuernas", "Zancada con mancuernas"],
  cadena_posterior: ["Puente de glúteo 2 piernas", "Peso muerto rumano con mancuernas", "Hip thrust con mancuerna", "Buenos días con mancuernas", "Extensión isquios tumbado con banda"],
  core_estabilidad: ["Plancha frontal", "Plancha lateral", "Anti-rotación con banda", "Pallof press con banda", "Bird dog"],
  pliometria: ["Mini saltos pogos", "Saltos verticales simples", "Saltos laterales sobre línea", "Saltos adelante cortos", "Salto caja baja"],
  aceleracion: ["Aceleraciones 10 m", "Aceleraciones 15 m", "Aceleración jogging → sprint", "Salidas desde rodilla"],
  coordinacion_pies: ["Saltos en escalera tipo quick feet", "Skipping técnico en sitio", "Mini saltos pogos"],
  reaccion: ["Reacción visual", "Reacción auditiva", "COD reacción"],
  COD: ["COD 3 conos", "COD 5-10-5", "Sprint + frenada", "Zig-zag 6 conos", "COD planta-pivote"],
  fuerza_principal_anterior: ["Sentadilla con barra trasera", "Sentadilla multipower", "Sentadilla máquina", "Sentadilla goblet", "Prensa inclinada"],
  fuerza_principal_posterior: ["Peso muerto convencional con barra", "Peso muerto rumano con mancuernas", "Hip thrust con mancuerna", "Curl femoral tumbado en máquina"],
  fuerza_rapida: ["Sentadilla goblet", "Sentadilla multipower", "Saltos verticales simples", "Aceleraciones 10 m"],
  locomocion_tecnica: ["Skipping técnico en sitio", "Farmer walk corto", "Aceleraciones 10 m", "Técnica de carrera"],
};

/** Mapeo grupo microciclo → tipo de sesión (filtros IA §3.1 / §4.2). */
const GRUPO_TO_SESION = {
  regenerativo: "extensiva",
  carga_alta: "intensiva",
  prepartido: "reactiva",
};

/** Nivel A/B/C → bloque de edad 1/2/3. */
const NIVEL_TO_BLOQUE = { A: "1", B: "2", C: "3" };

function task({ id, nombre, nivel, grupo, intensidad, gimnasio = false, descripcion, adaptaciones, tipo_tarea, tipo_sesion, bloques_edad, video }) {
  return {
    id,
    carpeta: `/calentamiento_con_balon/${nivel}/${grupo}`,
    nombre,
    nivel, // A | B | C
    grupo_microciclo: grupo, // regenerativo | carga_alta | prepartido
    intensidad,
    gimnasio,
    tipo_tarea: tipo_tarea || "Posesión",
    tipo_sesion: tipo_sesion || GRUPO_TO_SESION[grupo] || "extensiva",
    bloques_edad: bloques_edad || [NIVEL_TO_BLOQUE[nivel] || "2"],
    video: video || "",
    videoUrl: video || "",
    descripcion,
    adaptaciones: adaptaciones || {
      jugadores: "Si hay pocos → reducir comodines / bajar a formato menor. Si hay muchos → añadir apoyos exteriores o subir formato.",
      espacio: "Regenerativo → espacio amplio. Carga alta → espacio medio/reducido. Prepartido → espacio medio con ritmo alto y poca oposición prolongada.",
    },
  };
}

export { GRUPO_TO_SESION, NIVEL_TO_BLOQUE };

/**
 * 45 tareas únicas: 5 por carpeta /tareas/{A,B,C}/{regenerativo,carga_alta,prepartido}.
 * Adaptaciones de jugadores/espacio van en el texto (no como filtros del motor).
 */
const TASKS_BY_FOLDER = {
  A: {
    regenerativo: [
      {
        nombre: "Rondo 4v2 blando (nivel A)",
        descripcion: "Conservación simple, 1–2 toques opcionales. Ritmo conversacional.",
        adaptaciones: {
          jugadores: "Pocos → 3v1. Muchos → 5v2 con comodín exterior.",
          espacio: "Ampliar cuadrado para bajar carga; reducir solo si hay calidad técnica.",
        },
      },
      {
        nombre: "Rueda de pases con apoyo (nivel A)",
        descripcion: "Pase-control-pase y tercer hombre sin oposición.",
        adaptaciones: {
          jugadores: "Pocos → parejas rotativas. Muchos → dos ruedas en paralelo.",
          espacio: "Espacio amplio; si se quiere más carga, acortar distancias de pase.",
        },
      },
      {
        nombre: "Circuito técnico pase-conducción (nivel A)",
        descripcion: "Estaciones cortas sin duelo: control, conducción y pase.",
        adaptaciones: {
          jugadores: "Pocos → menos estaciones. Muchos → doble circuito.",
          espacio: "Versión amplia regenerativa; no comprimir en día A.",
        },
      },
      {
        nombre: "Conservación por calles con comodines (nivel A)",
        descripcion: "Mantener balón por zonas; comodines fijos y poca presión.",
        adaptaciones: {
          jugadores: "Pocos → quitar un comodín. Muchos → añadir apoyos laterales.",
          espacio: "Calles anchas; estrechar solo si el ritmo es demasiado bajo.",
        },
      },
      {
        nombre: "Juego de posición 5v5 + apoyos (nivel A)",
        descripcion: "Ocupación de espacios, pocos contactos, sin transición exigente.",
        adaptaciones: {
          jugadores: "Pocos → 4v4 + 2. Muchos → 6v6 + apoyos exteriores.",
          espacio: "Campo amplio regenerativo; media si el grupo está muy activo.",
        },
      },
    ],
    carga_alta: [
      {
        nombre: "Posesión 3v3 + 3 apoyos con transición (nivel A)",
        descripcion: "Tras pérdida: 3\" para recuperar o salir a meta/portería pequeña.",
        adaptaciones: {
          jugadores: "Pocos → 3v3 sin apoyos. Muchos → 4v4 + 4 apoyos.",
          espacio: "Espacio medio/reducido para subir intensidad.",
        },
      },
      {
        nombre: "Juego reducido 4v4 + porterías pequeñas (nivel A)",
        descripcion: "Duelos cortos, cambios de ritmo y finalización simple.",
        adaptaciones: {
          jugadores: "Pocos → 3v3. Muchos → 5v5 o dos campos.",
          espacio: "Reducir para más carga; ampliar si aparece fatiga técnica.",
        },
      },
      {
        nombre: "Partido condicionado 5v5 con transición (nivel A)",
        descripcion: "Gol + transición inmediata al otro lado; reglas simples.",
        adaptaciones: {
          jugadores: "Pocos → 4v4. Muchos → 6v6.",
          espacio: "Espacio medio; no usar versión amplia en carga alta.",
        },
      },
      {
        nombre: "Oleadas de finalización 2v1 + repliegue (nivel A)",
        descripcion: "Ataque rápido y repliegue obligatorio tras remate.",
        adaptaciones: {
          jugadores: "Pocos → líneas cortas. Muchos → varias oleadas en paralelo.",
          espacio: "Pasillo medio; acortar para aumentar densidad de acciones.",
        },
      },
      {
        nombre: "Presión tras pérdida en espacio medio (nivel A)",
        descripcion: "Presión coordinada 4–5\" tras pérdida, sin sobreexigir.",
        adaptaciones: {
          jugadores: "Pocos → 4v4. Muchos → 5v5 + comodín.",
          espacio: "Espacio medio; reducir si no aparece la presión.",
        },
      },
    ],
    prepartido: [
      {
        nombre: "Rondo dinámico con estímulo de salida (nivel A)",
        descripcion: "Tras señal: salida en conducción o pase profundo corto.",
        adaptaciones: {
          jugadores: "Pocos → 4v1. Muchos → dos rondos.",
          espacio: "Espacio medio; evitar versión muy reducida prepartido.",
        },
      },
      {
        nombre: "Circuito técnico pase y desmarque corto (nivel A)",
        descripcion: "Activación específica sin fatiga acumulada.",
        adaptaciones: {
          jugadores: "Pocos → circuito único. Muchos → doble circuito.",
          espacio: "Espacio medio con ritmo alto y poca oposición.",
        },
      },
      {
        nombre: "Finalización rápida 2v1 (nivel A)",
        descripcion: "Acciones cortas de definición con recuperación activa breve.",
        adaptaciones: {
          jugadores: "Pocos → 2v1 continuo. Muchos → dos porterías.",
          espacio: "Pasillo corto; no alargar distancias.",
        },
      },
      {
        nombre: "Posesión con pocos contactos (nivel A)",
        descripcion: "Máx. 3 toques; ritmo limpio y activación competitiva suave.",
        adaptaciones: {
          jugadores: "Pocos → 4v4. Muchos → 5v5 + apoyos.",
          espacio: "Espacio medio; ampliar si hay demasiados errores.",
        },
      },
      {
        nombre: "Activación en superioridad ofensiva (nivel A)",
        descripcion: "Ataques 3v2 / 4v3 con recuperación activa corta.",
        adaptaciones: {
          jugadores: "Pocos → 3v2. Muchos → oleadas 4v3.",
          espacio: "Media superficie; mantener frescura neuromuscular.",
        },
      },
    ],
  },
  B: {
    regenerativo: [
      {
        nombre: "Rondo conservación 5v2 (nivel B)",
        descripcion: "Conservación con presión blanda y orientación corporal.",
        adaptaciones: {
          jugadores: "Pocos → 4v2. Muchos → 6v2 + comodín.",
          espacio: "Ampliar para regenerar; no comprimir.",
        },
      },
      {
        nombre: "Rueda de pases tercer hombre (nivel B)",
        descripcion: "Circulación + apoyo; oposición blanda opcional.",
        adaptaciones: {
          jugadores: "Pocos → triángulos. Muchos → dos ruedas.",
          espacio: "Versión amplia regenerativa.",
        },
      },
      {
        nombre: "Circuito técnico con control orientado (nivel B)",
        descripcion: "Estaciones de pase-control-conducción sin duelo intenso.",
        adaptaciones: {
          jugadores: "Pocos → menos estaciones. Muchos → estaciones dobles.",
          espacio: "Amplio; reducir solo si el ritmo es demasiado bajo.",
        },
      },
      {
        nombre: "Conservación por calles (nivel B)",
        descripcion: "Mantener balón por zonas con comodines exteriores fijos.",
        adaptaciones: {
          jugadores: "Pocos → quitar comodín. Muchos → añadir apoyos.",
          espacio: "Calles anchas en día regenerativo.",
        },
      },
      {
        nombre: "Juego de posición 6v6 + apoyos (nivel B)",
        descripcion: "Ocupación de espacios, pocos contactos, sin transición dura.",
        adaptaciones: {
          jugadores: "Pocos → 5v5 + 2. Muchos → 7v7 + apoyos.",
          espacio: "Campo amplio; media si el grupo está muy activo.",
        },
      },
    ],
    carga_alta: [
      {
        nombre: "Posesión 4v4 + 4 apoyos con transición (nivel B)",
        descripcion: "Tras pérdida: 3\" para recuperar o transición a portería/meta.",
        adaptaciones: {
          jugadores: "Pocos → 4v4 + 2. Muchos → 5v5 + 4.",
          espacio: "Espacio medio/reducido para carga alta.",
        },
      },
      {
        nombre: "Juego reducido 5v5 + porterías pequeñas (nivel B)",
        descripcion: "Alta intensidad, duelos y cambios de ritmo.",
        adaptaciones: {
          jugadores: "Pocos → 4v4. Muchos → 6v6 o dos campos.",
          espacio: "Reducido/medio; ampliar solo por fatiga técnica.",
        },
      },
      {
        nombre: "Partido condicionado 6v6 / 7v7 (nivel B)",
        descripcion: "Gol + transición inmediata al otro lado.",
        adaptaciones: {
          jugadores: "Pocos → 5v5. Muchos → 7v7.",
          espacio: "Espacio medio; no versión amplia.",
        },
      },
      {
        nombre: "Oleadas de finalización 3v2 + repliegue (nivel B)",
        descripcion: "Ataque rápido y repliegue obligatorio.",
        adaptaciones: {
          jugadores: "Pocos → 2v1/3v2. Muchos → varias oleadas.",
          espacio: "Pasillo medio; acortar para densidad.",
        },
      },
      {
        nombre: "Presión tras pérdida (nivel B)",
        descripcion: "Presión coordinada 5\" tras pérdida en espacio medio.",
        adaptaciones: {
          jugadores: "Pocos → 5v5. Muchos → 6v6 + comodín.",
          espacio: "Medio; reducir si no aparece la presión.",
        },
      },
    ],
    prepartido: [
      {
        nombre: "Rondo dinámico con salida (nivel B)",
        descripcion: "Tras señal: salida en conducción/pase profundo.",
        adaptaciones: {
          jugadores: "Pocos → 5v2. Muchos → dos rondos.",
          espacio: "Medio; ritmo alto y limpio.",
        },
      },
      {
        nombre: "Circuito pase y desmarque corto (nivel B)",
        descripcion: "Activación específica sin fatiga acumulada.",
        adaptaciones: {
          jugadores: "Pocos → un circuito. Muchos → doble.",
          espacio: "Medio con poca oposición prolongada.",
        },
      },
      {
        nombre: "Finalización rápida 2v1 / 3v2 (nivel B)",
        descripcion: "Acciones cortas de definición.",
        adaptaciones: {
          jugadores: "Pocos → 2v1. Muchos → dos porterías.",
          espacio: "Pasillo corto.",
        },
      },
      {
        nombre: "Posesión con pocos contactos (nivel B)",
        descripcion: "Máx. 2–3 toques; ritmo alto y limpio.",
        adaptaciones: {
          jugadores: "Pocos → 5v5. Muchos → 6v6 + apoyos.",
          espacio: "Medio; ampliar si hay errores técnicos.",
        },
      },
      {
        nombre: "Activación competitiva en superioridad (nivel B)",
        descripcion: "Ataques en superioridad con recuperación activa corta.",
        adaptaciones: {
          jugadores: "Pocos → 3v2. Muchos → 4v3 en oleadas.",
          espacio: "Media superficie; priorizar frescura.",
        },
      },
    ],
  },
  C: {
    regenerativo: [
      {
        nombre: "Rondo 5v2 / 6v2 controlado (nivel C)",
        descripcion: "Conservación con presión blanda y calidad de pase.",
        adaptaciones: {
          jugadores: "Pocos → 5v2. Muchos → 6v2 + comodín.",
          espacio: "Amplio regenerativo.",
        },
      },
      {
        nombre: "Rueda de pases con tercer hombre (nivel C)",
        descripcion: "Circulación avanzada + apoyo; oposición blanda puntual.",
        adaptaciones: {
          jugadores: "Pocos → una rueda. Muchos → dos ruedas.",
          espacio: "Amplio; no comprimir.",
        },
      },
      {
        nombre: "Circuito técnico de activación (nivel C)",
        descripcion: "Pase-control-conducción y orientación sin duelo intenso.",
        adaptaciones: {
          jugadores: "Pocos → circuito corto. Muchos → estaciones dobles.",
          espacio: "Amplio en día regenerativo.",
        },
      },
      {
        nombre: "Conservación por calles + comodines (nivel C)",
        descripcion: "Mantener balón por zonas; comodines fijos y ritmo controlado.",
        adaptaciones: {
          jugadores: "Pocos → menos comodines. Muchos → más apoyos exteriores.",
          espacio: "Calles anchas.",
        },
      },
      {
        nombre: "Juego de posición 6v6 / 7v7 + apoyos (nivel C)",
        descripcion: "Ocupación, pocos contactos, sin transición exigente.",
        adaptaciones: {
          jugadores: "Pocos → 6v6. Muchos → 8v8 + apoyos.",
          espacio: "Campo amplio regenerativo.",
        },
      },
    ],
    carga_alta: [
      {
        nombre: "Posesión competitiva 4v4 + 4 con transición (nivel C)",
        descripcion: "Tras pérdida: 3\" recuperar o transición vertical.",
        adaptaciones: {
          jugadores: "Pocos → 4v4 + 2. Muchos → 5v5 + 4.",
          espacio: "Medio/reducido.",
        },
      },
      {
        nombre: "Juego reducido 5v5 / 6v6 porterías pequeñas (nivel C)",
        descripcion: "Alta intensidad, duelos y cambios de ritmo.",
        adaptaciones: {
          jugadores: "Pocos → 5v5. Muchos → dos campos 4v4.",
          espacio: "Reducido para carga.",
        },
      },
      {
        nombre: "Partido condicionado 7v7 con transición rápida (nivel C)",
        descripcion: "Gol + transición inmediata al otro lado.",
        adaptaciones: {
          jugadores: "Pocos → 6v6. Muchos → 8v8.",
          espacio: "Medio; no amplia.",
        },
      },
      {
        nombre: "Oleadas de finalización 3v2 + repliegue (nivel C)",
        descripcion: "Ataque rápido, definición y repliegue obligatorio.",
        adaptaciones: {
          jugadores: "Pocos → 3v2. Muchos → oleadas paralelas.",
          espacio: "Pasillo medio/corto.",
        },
      },
      {
        nombre: "Presión tras pérdida en espacio medio (nivel C)",
        descripcion: "Presión coordinada 5\" tras pérdida; alta exigencia táctica simple.",
        adaptaciones: {
          jugadores: "Pocos → 6v6. Muchos → 7v7 + comodín.",
          espacio: "Medio; reducir si falta presión.",
        },
      },
    ],
    prepartido: [
      {
        nombre: "Rondo dinámico con estímulo de salida (nivel C)",
        descripcion: "Tras señal: salida en conducción/pase profundo.",
        adaptaciones: {
          jugadores: "Pocos → 5v2. Muchos → dos rondos.",
          espacio: "Medio; ritmo alto limpio.",
        },
      },
      {
        nombre: "Circuito técnico prepartido (nivel C)",
        descripcion: "Pase y desmarque corto; activación sin fatiga acumulada.",
        adaptaciones: {
          jugadores: "Pocos → un circuito. Muchos → doble.",
          espacio: "Medio.",
        },
      },
      {
        nombre: "Finalización rápida 2v1 / 3v2 (nivel C)",
        descripcion: "Acciones cortas de definición con recuperación activa.",
        adaptaciones: {
          jugadores: "Pocos → 2v1. Muchos → dos porterías.",
          espacio: "Pasillo corto.",
        },
      },
      {
        nombre: "Posesión con pocos contactos (nivel C)",
        descripcion: "Máx. 2 toques; ritmo alto y limpio.",
        adaptaciones: {
          jugadores: "Pocos → 6v6. Muchos → 7v7 + apoyos.",
          espacio: "Medio.",
        },
      },
      {
        nombre: "Activación competitiva en superioridad (nivel C)",
        descripcion: "Ataques en superioridad ofensiva con recuperación corta.",
        adaptaciones: {
          jugadores: "Pocos → 3v2/4v3. Muchos → oleadas.",
          espacio: "Media superficie; priorizar frescura.",
        },
      },
    ],
  },
};

function expandTasks() {
  const out = [];
  for (const nivel of ["A", "B", "C"]) {
    for (const grupo of ["regenerativo", "carga_alta", "prepartido"]) {
      const inten = grupo === "regenerativo" ? "baja" : grupo === "carga_alta" ? "alta" : "media";
      (TASKS_BY_FOLDER[nivel][grupo] || []).forEach((row, i) => {
        out.push(task({
          id: `ct_${nivel}_${grupo}_${i + 1}`,
          nombre: row.nombre,
          nivel,
          grupo,
          intensidad: inten,
          descripcion: row.descripcion,
          adaptaciones: row.adaptaciones,
        }));
      });
    }
  }
  return out;
}

export const CLUB_MAIN_TASKS = expandTasks();

/** Sanity: 45 tareas (5 × 3 niveles × 3 grupos). */
export const CLUB_MAIN_TASKS_COUNT = CLUB_MAIN_TASKS.length;

export const CLUB_AUTO_OBSERVACIONES = {
  A: "Día regenerativo/control: priorizar calidad de ejecución, bajo impacto y recuperación.",
  B: "Día de carga: estímulo de fuerza/potencia/aceleración. Vigilar volumen total.",
  C: "Día prepartido/activación: velocidad corta, coordinación y frescura neuromuscular.",
};
