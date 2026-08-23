/**
 * Textos base reutilizables por tipo de sesión (Depro 2.0 §7).
 * Editables después desde admin; estos son los valores por defecto.
 */

export const SESSION_TYPES = ["extensiva", "intensiva", "reactiva"];

export const WARMUP_TEXT = {
  extensiva: {
    title: "Calentamiento · Extensiva",
    bullets: [
      "Enfoque en implicación metabólica general y activación del sistema nervioso",
      "Carácter progresivo",
      "Tareas alejadas de la situación real de juego",
      "Evitar sprints, acciones explosivas y contacto elevado",
      "Estructura: movilidad general + tarea alejada del juego real",
    ],
  },
  intensiva: {
    title: "Calentamiento · Intensiva",
    bullets: [
      "Enfoque en espacios reducidos y mayor participación",
      "Progresión hacia ritmos altos",
      "Coherencia con la carga que se va a aplicar después",
      "Estructura: movilidad general + tarea más cercana al juego real",
    ],
  },
  reactiva: {
    title: "Calentamiento · Reactiva (prepartido)",
    bullets: [
      "Enfoque en intensidad alta y volumen bajo",
      "Salidas, aceleraciones y acciones explosivas",
      "Insistir en calentar correctamente antes de trabajar velocidad",
      "Estructura: movilidad general + tarea corta de activación específica",
    ],
  },
};

export const MAIN_BLOCK_TEXT = {
  extensiva: {
    title: "Parte principal · Extensiva",
    bullets: [
      "Movilidad",
      "Propiocepción",
      "Trabajo compensatorio para reducir asimetrías propias del deporte",
    ],
  },
  intensiva: {
    title: "Parte principal · Intensiva",
    bullets: [
      "Velocidad máxima",
      "Aceleraciones máximas",
      "Fuerza",
      "Pliometría",
    ],
  },
  reactiva: {
    title: "Parte principal · Reactiva",
    bullets: [
      "Trabajo coordinativo",
      "Técnica de carrera",
      "Aceleraciones",
      "Alta intensidad con baja carga",
    ],
  },
};

export function sessionTextsFor(type = "extensiva") {
  const key = SESSION_TYPES.includes(type) ? type : "extensiva";
  return {
    type: key,
    warmup: WARMUP_TEXT[key],
    main: MAIN_BLOCK_TEXT[key],
  };
}
