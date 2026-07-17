/**
 * Biblioteca de ejercicios de DEPRO Coach.
 *
 * Este catálogo es la ÚNICA fuente de ejercicios que puede usar el motor de
 * reglas (`src/lib/coachEngine.js`). La IA nunca inventa ejercicios: solo
 * filtra y selecciona de aquí. Cada ejercicio es una entidad independiente
 * con todos los campos definidos en la especificación del módulo.
 *
 * Es una biblioteca "seed" de partida (contenido de texto, sin vídeo/gif
 * reales todavía). Se amplía y se edita desde el CMS de administración
 * (`/admin/coach-library`), que persiste los cambios vía `api/coach-library.js`.
 */

export const BLOQUES = ["Bloque 1", "Bloque 2", "Bloque 3"];

export const PROTOCOLOS = ["A", "B", "C"];

/** Estructura fija de cada protocolo (nunca aleatoria) — orden de categorías por slot */
export const PROTOCOL_STRUCTURE = {
  A: {
    label: "Post partido",
    objetivos: ["movilidad", "compensatorio", "coordinacion", "recuperacion"],
    slots: ["Movilidad", "Movilidad", "Compensatorio", "Compensatorio", "Coordinación", "Respiración"],
  },
  B: {
    label: "Carga",
    objetivos: ["fuerza", "pliometria", "core"],
    slots: ["Activación", "Fuerza", "Fuerza", "Pliometría", "Core", "Coordinación"],
  },
  C: {
    label: "Precompetición",
    objetivos: ["velocidad", "aceleracion", "cambio_direccion", "reaccion"],
    slots: ["Activación", "Técnica carrera", "Aceleración", "COD", "Reacción", "Sprint"],
  },
};

/** A qué protocolo(s) pertenece cada categoría — determina el pool elegible */
export const CATEGORY_PROTOCOLS = {
  "Movilidad": ["A"],
  "Compensatorio": ["A"],
  "Respiración": ["A"],
  "Coordinación": ["A", "B"],
  "Activación": ["B", "C"],
  "Fuerza": ["B"],
  "Pliometría": ["B"],
  "Core": ["B"],
  "Técnica carrera": ["C"],
  "Aceleración": ["C"],
  "COD": ["C"],
  "Reacción": ["C"],
  "Sprint": ["C"],
};

export const MATERIALES = [
  "sin_material", "conos", "picas", "aros", "vallas", "gomas",
  "mancuernas", "balon_medicinal", "cajon", "escalera_coordinacion",
  "banda_resistencia", "gimnasio",
];

const TODOS_BLOQUES = BLOQUES;
const SIN_B1 = ["Bloque 2", "Bloque 3"]; // ejercicios de alta intensidad/complejidad, no aptos para U12 e inferiores

let _autoId = 1;
function ex({
  nombre, categoria, objetivo, descripcion, material = ["sin_material"],
  duracion = 6, complejidad = "media", bloques = TODOS_BLOQUES,
  etiquetas = [], gruposMusculares = [], capacidadFisica = "",
  espacioNecesario = "reducido", numeroJugadores = "individual", tiempoRecomendado = "",
  subcategoria = "", notas = "",
}) {
  const id = `coach_ex_${String(_autoId++).padStart(3, "0")}`;
  return {
    id,
    nombre,
    video: "",
    gif: "",
    descripcion,
    objetivo,
    categoria,
    subcategoria,
    bloquesPermitidos: bloques,
    protocolosPermitidos: CATEGORY_PROTOCOLS[categoria] || [],
    material,
    duracion,
    complejidad,
    progresion: null,
    regresion: null,
    etiquetas: [categoria.toLowerCase(), objetivo, ...etiquetas],
    gruposMusculares,
    capacidadFisica: capacidadFisica || objetivo,
    espacioNecesario,
    numeroJugadores,
    tiempoRecomendado: tiempoRecomendado || `${duracion} min`,
    notas,
    estado: "aprobado",
  };
}

export const COACH_EXERCISE_LIBRARY = [
  // ── Movilidad (Protocolo A) ──────────────────────────────
  ex({ nombre: "Movilidad de tobillo en pared", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Rodilla hacia la pared manteniendo el talón en el suelo, series por pierna.", gruposMusculares: ["tobillo"], complejidad: "baja" }),
  ex({ nombre: "Movilidad de cadera 90/90", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Cambios de cadera sentado en el suelo con ambas piernas a 90 grados.", gruposMusculares: ["cadera"], complejidad: "baja" }),
  ex({ nombre: "Círculos de cadera de pie", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Círculos amplios de cadera en ambas direcciones, apoyo en una pierna.", gruposMusculares: ["cadera"], complejidad: "baja" }),
  ex({ nombre: "Movilidad torácica en cuadrupedia", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Rotación de tronco con apoyo de manos y rodillas, hilo y aguja.", gruposMusculares: ["torax"], complejidad: "baja" }),
  ex({ nombre: "Movilidad de rodilla asistida", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Flexo-extensión controlada de rodilla en banco o suelo.", gruposMusculares: ["rodilla"], complejidad: "baja" }),
  ex({ nombre: "Gato-camello", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Flexión y extensión de columna en cuadrupedia, ritmo respiratorio.", gruposMusculares: ["columna"], complejidad: "baja" }),
  ex({ nombre: "Movilidad de hombro con goma", categoria: "Movilidad", objetivo: "movilidad", descripcion: "Elevaciones y rotaciones de hombro con banda elástica de baja resistencia.", material: ["gomas"], gruposMusculares: ["hombro"], complejidad: "baja" }),

  // ── Compensatorio (Protocolo A) ──────────────────────────
  ex({ nombre: "Plancha lateral", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Isométrico lateral apoyado en antebrazo, cadera elevada y alineada.", gruposMusculares: ["core", "oblicuos"], complejidad: "media" }),
  ex({ nombre: "Puente de glúteo", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Elevación de cadera desde el suelo, activación de glúteo.", gruposMusculares: ["gluteo"], complejidad: "baja" }),
  ex({ nombre: "Pájaro-perro", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Extensión contralateral de brazo y pierna en cuadrupedia, control de tronco.", gruposMusculares: ["core", "espalda"], complejidad: "baja" }),
  ex({ nombre: "Clamshell con goma", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Abducción de cadera tumbado de lado con banda elástica en rodillas.", material: ["gomas"], gruposMusculares: ["gluteo_medio"], complejidad: "baja" }),
  ex({ nombre: "Face pull con goma", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Tirón hacia la cara con banda elástica, foco en rotadores externos.", material: ["gomas"], gruposMusculares: ["hombro", "espalda"], complejidad: "media" }),
  ex({ nombre: "Remo invertido con goma", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Remo horizontal con banda anclada, escápulas retraídas.", material: ["gomas"], gruposMusculares: ["espalda"], complejidad: "media" }),
  ex({ nombre: "Rotación externa de hombro con goma", categoria: "Compensatorio", objetivo: "compensatorio", descripcion: "Rotación externa de hombro con codo fijo al cuerpo, banda de baja resistencia.", material: ["gomas"], gruposMusculares: ["hombro"], complejidad: "baja" }),

  // ── Coordinación (Protocolo A y B) ───────────────────────
  ex({ nombre: "Escalera de coordinación básica", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Patrón de pies simple (in-in-out-out) en escalera de coordinación.", material: ["escalera_coordinacion"], numeroJugadores: "individual", complejidad: "baja" }),
  ex({ nombre: "Skipping bajo entre aros", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Skipping de baja amplitud pasando por el centro de aros colocados en línea.", material: ["aros"], complejidad: "baja" }),
  ex({ nombre: "Zigzag entre conos con balón", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Conducción de balón en zigzag entre conos a ritmo controlado.", material: ["conos"], complejidad: "media" }),
  ex({ nombre: "Coordinación óculo-manual con balón", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Lanzamiento y recepción de balón con cambios de mano/pie.", complejidad: "media" }),
  ex({ nombre: "Escalera lateral de coordinación", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Desplazamiento lateral con patrón de pies en escalera de coordinación.", material: ["escalera_coordinacion"], complejidad: "media" }),
  ex({ nombre: "Saltos a pies juntos entre aros", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Saltos coordinados a pies juntos entrando y saliendo de aros en el suelo.", material: ["aros"], complejidad: "baja" }),
  ex({ nombre: "Bote y desplazamiento con balón", categoria: "Coordinación", objetivo: "coordinacion", descripcion: "Bote de balón con mano mientras se desplaza en distintas direcciones.", complejidad: "media" }),

  // ── Respiración (Protocolo A) ────────────────────────────
  ex({ nombre: "Respiración diafragmática tumbado", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Inspiración nasal profunda con expansión abdominal, tumbado boca arriba.", complejidad: "baja" }),
  ex({ nombre: "Respiración 4-7-8", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Inspirar 4s, retener 7s, exhalar 8s. Repetir en calma.", complejidad: "baja" }),
  ex({ nombre: "Respiración nasal en marcha suave", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Desplazamiento suave manteniendo respiración exclusivamente nasal.", complejidad: "baja" }),
  ex({ nombre: "Box breathing", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Inspirar-retener-exhalar-retener en ciclos iguales de 4 segundos.", complejidad: "baja" }),
  ex({ nombre: "Estiramiento con respiración guiada", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Estiramientos suaves sincronizados con la exhalación.", complejidad: "baja" }),
  ex({ nombre: "Relajación progresiva", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Tensión y relajación progresiva de grupos musculares, foco respiratorio.", complejidad: "baja" }),
  ex({ nombre: "Respiración con banda torácica", categoria: "Respiración", objetivo: "recuperacion", descripcion: "Respiración profunda con banda elástica rodeando el tórax para dar feedback.", material: ["gomas"], complejidad: "baja" }),

  // ── Activación (Protocolo B y C) ─────────────────────────
  ex({ nombre: "Activación de glúteo con goma", categoria: "Activación", objetivo: "activacion", descripcion: "Marcha lateral en semisentadilla con banda elástica en tobillos.", material: ["gomas"], complejidad: "media" }),
  ex({ nombre: "Skipping alto", categoria: "Activación", objetivo: "activacion", descripcion: "Elevación de rodilla alta con apoyo activo y brazos coordinados.", complejidad: "media" }),
  ex({ nombre: "Talón-glúteo", categoria: "Activación", objetivo: "activacion", descripcion: "Flexión de rodilla llevando el talón al glúteo en desplazamiento.", complejidad: "baja" }),
  ex({ nombre: "Zancada dinámica con giro", categoria: "Activación", objetivo: "activacion", descripcion: "Zancada avanzando con rotación de tronco hacia la pierna adelantada.", complejidad: "media" }),
  ex({ nombre: "Rotaciones de tobillo activas", categoria: "Activación", objetivo: "activacion", descripcion: "Movilización activa de tobillo en apoyo unipodal antes de esfuerzo.", complejidad: "baja" }),
  ex({ nombre: "Saltos verticales suaves", categoria: "Activación", objetivo: "activacion", descripcion: "Series cortas de saltos verticales de baja intensidad, aterrizaje controlado.", complejidad: "media" }),
  ex({ nombre: "Activación de core dinámica", categoria: "Activación", objetivo: "activacion", descripcion: "Plancha dinámica con toques alternos de hombro, ritmo moderado.", gruposMusculares: ["core"], complejidad: "media" }),

  // ── Fuerza (Protocolo B) ──────────────────────────────────
  ex({ nombre: "Sentadilla goblet", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Sentadilla sujetando una mancuerna o disco a la altura del pecho.", material: ["mancuernas"], gruposMusculares: ["cuadriceps", "gluteo"], complejidad: "media" }),
  ex({ nombre: "Zancada búlgara", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Zancada con pie trasero elevado sobre banco o cajón.", material: ["cajon"], gruposMusculares: ["cuadriceps", "gluteo"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Peso muerto rumano con mancuernas", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Bisagra de cadera con mancuernas, foco en isquiotibiales.", material: ["mancuernas"], gruposMusculares: ["isquiotibiales"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Hip thrust", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Elevación de cadera con espalda apoyada en banco, carga progresiva.", material: ["gimnasio"], gruposMusculares: ["gluteo"], complejidad: "media" }),
  ex({ nombre: "Sentadilla búlgara a una pierna", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Sentadilla unilateral con apoyo trasero elevado, control de rodilla.", material: ["cajon"], gruposMusculares: ["cuadriceps"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Press de banca con mancuernas", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Press horizontal con mancuernas en banco de gimnasio.", material: ["gimnasio", "mancuernas"], gruposMusculares: ["pecho"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Remo con banda elástica", categoria: "Fuerza", objetivo: "fuerza", descripcion: "Remo horizontal con banda anclada a un punto fijo, carga progresiva.", material: ["gomas"], gruposMusculares: ["espalda"], complejidad: "media" }),

  // ── Pliometría (Protocolo B) ─────────────────────────────
  ex({ nombre: "Salto al cajón", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Salto vertical con ambas piernas hacia un cajón de altura moderada.", material: ["cajon"], gruposMusculares: ["tren_inferior"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Salto con contramovimiento (CMJ)", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Salto vertical máximo con contramovimiento de piernas y brazos.", complejidad: "media" }),
  ex({ nombre: "Saltos laterales sobre valla baja", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Saltos laterales a pies juntos sobre una valla o pica baja.", material: ["vallas"], complejidad: "media" }),
  ex({ nombre: "Skipping con salto", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Skipping alto seguido de salto vertical cada 3 apoyos.", complejidad: "media" }),
  ex({ nombre: "Saltos a una pierna (bounds)", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Saltos horizontales encadenados alternando pierna de impulso.", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Salto profundo (drop jump)", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Caída desde cajón bajo con salto vertical inmediato al contacto.", material: ["cajon"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Saltos en zigzag sobre conos", categoria: "Pliometría", objetivo: "pliometria", descripcion: "Saltos a pies juntos en zigzag sobre una línea de conos bajos.", material: ["conos"], complejidad: "media" }),

  // ── Core (Protocolo B) ───────────────────────────────────
  ex({ nombre: "Plancha frontal", categoria: "Core", objetivo: "core", descripcion: "Isométrico frontal apoyado en antebrazos, línea recta cabeza-talón.", gruposMusculares: ["core"], complejidad: "baja" }),
  ex({ nombre: "Plancha lateral con elevación", categoria: "Core", objetivo: "core", descripcion: "Plancha lateral con elevación y descenso controlado de cadera.", gruposMusculares: ["oblicuos"], complejidad: "media" }),
  ex({ nombre: "Dead bug", categoria: "Core", objetivo: "core", descripcion: "Extensión contralateral de brazo y pierna tumbado boca arriba, control lumbar.", gruposMusculares: ["core"], complejidad: "baja" }),
  ex({ nombre: "Rueda abdominal", categoria: "Core", objetivo: "core", descripcion: "Extensión y flexión de tronco con rueda abdominal, control excéntrico.", material: ["gimnasio"], gruposMusculares: ["core"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Giro ruso con balón medicinal", categoria: "Core", objetivo: "core", descripcion: "Rotación de tronco sentado con balón medicinal, pies elevados opcional.", material: ["balon_medicinal"], gruposMusculares: ["oblicuos"], complejidad: "media" }),
  ex({ nombre: "Elevación de piernas colgado", categoria: "Core", objetivo: "core", descripcion: "Elevación de piernas colgado de una barra, control de balanceo.", material: ["gimnasio"], gruposMusculares: ["core"], complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Plancha con toque de hombro", categoria: "Core", objetivo: "core", descripcion: "Plancha frontal alternando toques de hombro contrario, control de cadera.", gruposMusculares: ["core"], complejidad: "media" }),

  // ── Técnica de carrera (Protocolo C) ─────────────────────
  ex({ nombre: "Skipping técnico A", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Elevación de rodilla con apoyo activo y tobillo en flexión dorsal.", complejidad: "media" }),
  ex({ nombre: "Skipping técnico B", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Skipping con extensión de pierna hacia adelante, ritmo controlado.", complejidad: "media" }),
  ex({ nombre: "Talón-glúteo técnico", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Flexión rápida de rodilla en desplazamiento, foco en recobro.", complejidad: "media" }),
  ex({ nombre: "Técnica de brazos en carrera", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Trabajo de braceo estático y en movimiento, codos a 90 grados.", complejidad: "baja" }),
  ex({ nombre: "Zancada amplia técnica", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Carrera con amplitud de zancada exagerada a ritmo submáximo.", complejidad: "media" }),
  ex({ nombre: "Carrera resistida con banda", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Carrera con banda de resistencia sujeta por un compañero, foco técnico.", material: ["banda_resistencia"], numeroJugadores: "parejas", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Frecuencia de piernas en escalera", categoria: "Técnica carrera", objetivo: "tecnica_carrera", descripcion: "Contactos rápidos de pies en escalera de coordinación, foco en frecuencia.", material: ["escalera_coordinacion"], complejidad: "media" }),

  // ── Aceleración (Protocolo C) ─────────────────────────────
  ex({ nombre: "Aceleración 10 metros", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Aceleración máxima desde parado en distancia corta.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Aceleración desde posición baja", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Salida desde posición de sprint en 3 puntos de apoyo.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Salidas con cambio de estímulo", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Aceleración iniciada al recibir un estímulo visual o auditivo variable.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Aceleración resistida con arnés", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Aceleración con resistencia de arnés/paracaídas sujeto por compañero.", material: ["banda_resistencia"], numeroJugadores: "parejas", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Aceleración en cuesta corta", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Aceleración en pendiente suave para sobrecargar la fase de impulso.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Salida con paso cruzado", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Salida lateral con paso cruzado seguida de aceleración frontal.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Aceleración desde sentado", categoria: "Aceleración", objetivo: "aceleracion", descripcion: "Salida desde posición sentada en el suelo hacia aceleración rápida.", espacioNecesario: "amplio", complejidad: "media" }),

  // ── Cambio de dirección / COD (Protocolo C) ──────────────
  ex({ nombre: "Zigzag entre conos", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Cambios de dirección a 45 y 90 grados entre conos separados 3-4 metros.", material: ["conos"], espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Cambio de dirección a 45 grados", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Carrera con corte a 45 grados en punto marcado, foco en apoyo.", material: ["conos"], espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Drill en T (T-test adaptado)", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Desplazamientos frontales y laterales en forma de T entre conos.", material: ["conos"], espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Cambio de dirección con balón", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Conducción de balón con cambio de dirección brusco en cono central.", material: ["conos"], espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Slalom con conos", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Desplazamiento en slalom continuo entre conos en línea.", material: ["conos"], espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "505 drill adaptado", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Aceleración, giro de 180 grados en línea marcada y nueva aceleración.", material: ["conos"], espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Cambio de dirección reactivo", categoria: "COD", objetivo: "cambio_direccion", descripcion: "Cambio de dirección decidido en el momento según estímulo del entrenador.", material: ["conos"], espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),

  // ── Reacción (Protocolo C) ────────────────────────────────
  ex({ nombre: "Salida reactiva a silbato", categoria: "Reacción", objetivo: "reaccion", descripcion: "Aceleración iniciada al oír el silbato desde distintas posiciones de partida.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Reacción a color de cono", categoria: "Reacción", objetivo: "reaccion", descripcion: "El jugador reacciona corriendo hacia el cono del color indicado por el entrenador.", material: ["conos"], espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Espejo con compañero", categoria: "Reacción", objetivo: "reaccion", descripcion: "Un jugador reproduce en espejo los movimientos laterales del compañero guía.", numeroJugadores: "parejas", complejidad: "media" }),
  ex({ nombre: "Reacción a balón soltado", categoria: "Reacción", objetivo: "reaccion", descripcion: "Sprint corto para recuperar un balón soltado por el entrenador sin previo aviso.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Reacción a estímulo visual", categoria: "Reacción", objetivo: "reaccion", descripcion: "Salida en la dirección señalada por el entrenador con la mano en el último instante.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Salida reactiva desde distintas posiciones", categoria: "Reacción", objetivo: "reaccion", descripcion: "Salida reactiva partiendo tumbado, sentado o de espaldas al estímulo.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "1v1 reactivo en espacio reducido", categoria: "Reacción", objetivo: "reaccion", descripcion: "Duelo 1v1 en espacio reducido con salida simultánea al estímulo.", numeroJugadores: "parejas", espacioNecesario: "reducido", complejidad: "alta", bloques: SIN_B1 }),

  // ── Sprint (Protocolo C) ──────────────────────────────────
  ex({ nombre: "Sprint 20 metros", categoria: "Sprint", objetivo: "velocidad", descripcion: "Sprint máximo en línea recta de 20 metros con recuperación completa.", espacioNecesario: "amplio", complejidad: "media" }),
  ex({ nombre: "Sprint 30 metros", categoria: "Sprint", objetivo: "velocidad", descripcion: "Sprint máximo en línea recta de 30 metros con recuperación completa.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Sprint lanzado", categoria: "Sprint", objetivo: "velocidad", descripcion: "Entrada progresiva a velocidad máxima seguida de tramo lanzado cronometrado.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Sprint con resistencia (paracaídas)", categoria: "Sprint", objetivo: "velocidad", descripcion: "Sprint con paracaídas de resistencia para sobrecargar la fase de aceleración.", material: ["banda_resistencia"], espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Repeticiones de sprint (RSA)", categoria: "Sprint", objetivo: "velocidad", descripcion: "Series repetidas de sprints cortos con recuperación incompleta.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Sprint en cuesta corta", categoria: "Sprint", objetivo: "velocidad", descripcion: "Sprint en pendiente suave para sobrecarga de potencia horizontal.", espacioNecesario: "amplio", complejidad: "alta", bloques: SIN_B1 }),
  ex({ nombre: "Sprint con cambio de ritmo", categoria: "Sprint", objetivo: "velocidad", descripcion: "Sprint alternando tramos de ritmo submáximo y máximo dentro del mismo recorrido.", espacioNecesario: "amplio", complejidad: "media" }),
];

export function exercisesByCategory(categoria) {
  return COACH_EXERCISE_LIBRARY.filter((e) => e.categoria === categoria);
}

export function exercisesByProtocol(protocolo) {
  return COACH_EXERCISE_LIBRARY.filter((e) => e.protocolosPermitidos.includes(protocolo));
}
