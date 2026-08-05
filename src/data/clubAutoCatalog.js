/**
 * Catálogo de la rama automática clubs/entrenadores.
 * Capa separada: no modifica exerciseCatalog ni etiquetas del motor individual.
 */

/** Carpeta lógica: /calentamientos_generales */
export const CLUB_GENERAL_WARMUPS = [
  { id: "cgw_1", carpeta: "/calentamientos_generales", nombre: "Calentamiento general móvil 1", duracion: "8-10 min", descripcion: "Movilidad articular global + activación suave en círculo." },
  { id: "cgw_2", carpeta: "/calentamientos_generales", nombre: "Calentamiento general móvil 2", duracion: "8-10 min", descripcion: "Skipping suave, talones, apertura/cierre de cadera y movilidad de tobillo." },
  { id: "cgw_3", carpeta: "/calentamientos_generales", nombre: "Calentamiento general dinámico", duracion: "8-10 min", descripcion: "Desplazamientos + movilidad dinámica de cadera y hombro." },
  { id: "cgw_4", carpeta: "/calentamientos_generales", nombre: "Calentamiento general con balón integrado suave", duracion: "8-10 min", descripcion: "Activación sin oposición: conducción suave + movilidad." },
  { id: "cgw_5", carpeta: "/calentamientos_generales", nombre: "Calentamiento general pre-protocolo", duracion: "8-10 min", descripcion: "Secuencia estable: articulación → activación → elevación de pulso." },
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
  COD: ["COD 3 conos", "COD 5-10-5", "Sprint + frenada", "Zig-zag 6 conos", "T-test"],
  fuerza_principal_anterior: ["Sentadilla con barra trasera", "Sentadilla multipower", "Sentadilla máquina", "Sentadilla goblet", "Prensa inclinada"],
  fuerza_principal_posterior: ["Peso muerto convencional con barra", "Peso muerto rumano con mancuernas", "Hip thrust con mancuerna", "Curl femoral tumbado en máquina"],
  fuerza_rapida: ["Sentadilla goblet", "Sentadilla multipower", "Saltos verticales simples", "Aceleraciones 10 m"],
  locomocion_tecnica: ["Skipping técnico en sitio", "Farmer walk corto", "Aceleraciones 10 m", "Técnica de carrera"],
};

function task({ id, nombre, nivel, grupo, intensidad, gimnasio = false, descripcion, adaptaciones }) {
  return {
    id,
    carpeta: `/tareas/${nivel}/${grupo}`,
    nombre,
    nivel, // A | B | C
    grupo_microciclo: grupo, // regenerativo | carga_alta | prepartido
    intensidad,
    gimnasio,
    descripcion,
    adaptaciones: adaptaciones || {
      jugadores: "Si hay pocos → reducir comodines / bajar a formato menor. Si hay muchos → añadir apoyos exteriores o subir formato.",
      espacio: "Regenerativo → espacio amplio. Carga alta → espacio medio/reducido. Prepartido → espacio medio con ritmo alto y poca oposición prolongada.",
    },
  };
}

const REGEN_BASE = [
  ["Rondo conservación 4v2 / 5v2", "Conservación con 1-2 defensores. Ritmo conversacional."],
  ["Rueda de pases con apoyo y tercer hombre", "Circulación + apoyo. Sin oposición o presión blanda."],
  ["Circuito técnico pase-control-conducción", "Estaciones cortas técnicas, sin duelo."],
  ["Conservación por calles con comodines exteriores", "Mantener balón por zonas; comodines fijos."],
  ["Juego de posición suave 6v6 + apoyos", "Ocupación de espacios, pocos contactos, sin transición exigente."],
];

const CARGA_BASE = [
  ["Posesión competitiva 4v4 + 4 apoyos con transición", "Tras pérdida: 3\" para recuperar o transición a portería/meta."],
  ["Juego reducido 5v5 + porterías pequeñas", "Alta intensidad, duelos y cambios de ritmo."],
  ["Partido condicionado 6v6 / 7v7 con transición rápida", "Gol + transición inmediata al otro lado."],
  ["Oleadas de finalización 3v2 + repliegue", "Ataque rápido y repliegue obligatorio."],
  ["Juego de presión tras pérdida en espacio medio", "Presión coordinada 5\" tras pérdida."],
];

const PRE_BASE = [
  ["Rondo dinámico con estímulo de salida", "Tras señal: salida en conducción/pase profundo."],
  ["Circuito técnico con pase y desmarque corto", "Activación específica sin fatiga acumulada."],
  ["Finalización rápida 2v1 / 3v2", "Acciones cortas de definición."],
  ["Juego de posesión con pocos contactos", "Máx. 2-3 toques; ritmo alto y limpio."],
  ["Activación competitiva en superioridad ofensiva", "Ataques en superioridad con recuperación activa corta."],
];

function expandTasks() {
  const out = [];
  let n = 1;
  for (const nivel of ["A", "B", "C"]) {
    for (const [grupo, rows, inten] of [
      ["regenerativo", REGEN_BASE, "baja"],
      ["carga_alta", CARGA_BASE, "alta"],
      ["prepartido", PRE_BASE, "media"],
    ]) {
      rows.forEach(([nombre, desc], i) => {
        out.push(task({
          id: `ct_${nivel}_${grupo}_${i + 1}`,
          nombre: `${nombre} · ${nivel}`,
          nivel,
          grupo,
          intensidad: inten,
          descripcion: `${desc} (nivel ${nivel}).`,
        }));
        n += 1;
      });
    }
  }
  return out;
}

export const CLUB_MAIN_TASKS = expandTasks();

export const CLUB_AUTO_OBSERVACIONES = {
  A: "Día regenerativo/control: priorizar calidad de ejecución, bajo impacto y recuperación.",
  B: "Día de carga: estímulo de fuerza/potencia/aceleración. Vigilar volumen total.",
  C: "Día prepartido/activación: velocidad corta, coordinación y frescura neuromuscular.",
};
