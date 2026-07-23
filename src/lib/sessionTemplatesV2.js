/**
 * DEPRO v2.0 — Plantillas de sesión con slots por pool
 * Motor de selección: exerciseSelector.js
 */

export const SESSION_TEMPLATES = {
  
  // ═══════════════════════════════════════════════════════════════
  // FUERZA A - Tren Inferior (énfasis cuádriceps/rodilla)
  // ═══════════════════════════════════════════════════════════════
  
  "Fuerza A": {
    title: "Fuerza A - Tren Inferior",
    duration: "55-65 min",
    intensityLevel: "alta",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "8 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad articular" },
          { pool: "GLU-SIN", qty: 1, description: "Activación glúteo" }
        ]
      },
      {
        type: "principal",
        label: "Ejercicios Principales",
        duration: "25 min",
        slots: [
          {
            poolPattern: "rodilla_bilateral",
            qty: 1,
            description: "Sentadilla o variante bilateral",
            priority: 1
          },
          {
            poolPattern: "cadera_bilateral",
            qty: 1,
            description: "Bisagra de cadera bilateral",
            priority: 2
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Ejercicios Complementarios",
        duration: "18 min",
        slots: [
          {
            poolPattern: "rodilla_unilateral",
            qty: 1,
            description: "Zancada o variante unilateral"
          },
          {
            poolFamily: "gluteo",
            qty: 1,
            description: "Trabajo específico de glúteo"
          },
          {
            poolFamily: "gemelo",
            qty: 1,
            optional: true,
            description: "Gemelos (si hay tiempo/material)"
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "core",
        label: "Core",
        duration: "8 min",
        slots: [
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Antiextensión" },
          { pool: "CORE-ANTI-LAT", qty: 1, description: "Antiflexión lateral" }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Estiramientos/movilidad" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // FUERZA B - Tren Inferior (énfasis cadera/posterior)
  // ═══════════════════════════════════════════════════════════════
  
  "Fuerza B": {
    title: "Fuerza B - Tren Inferior",
    duration: "50-60 min",
    intensityLevel: "media",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "8 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad articular" },
          { pool: "GLU-GOM", qty: 1, fallback: "GLU-SIN", description: "Activación glúteo con banda" }
        ]
      },
      {
        type: "principal",
        label: "Ejercicios Principales",
        duration: "22 min",
        slots: [
          {
            poolPattern: "cadera_bilateral",
            qty: 1,
            description: "Peso muerto o variante",
            priority: 1
          },
          {
            poolPattern: "cadera_unilateral",
            qty: 1,
            description: "Bisagra unilateral",
            priority: 2
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Ejercicios Complementarios",
        duration: "15 min",
        slots: [
          {
            poolPattern: "rodilla_unilateral",
            qty: 1,
            description: "Zancada o variante"
          },
          {
            poolFamily: "gluteo",
            qty: 1,
            description: "Glúteo aislado"
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "core",
        label: "Core",
        duration: "8 min",
        slots: [
          { pool: "CORE-ANTI-ROT", qty: 1, fallback: "CORE-ANTI-EXT", description: "Antirotación" },
          { pool: "CORE-FLEX", qty: 1, description: "Core dinámico" }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { pool: "MOV-CADERA", qty: 1, description: "Movilidad cadera" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // FUERZA SUPERIOR A - Empuje
  // ═══════════════════════════════════════════════════════════════
  
  "Fuerza Superior A": {
    title: "Fuerza Superior A - Empuje",
    duration: "45-55 min",
    intensityLevel: "alta",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "8 min",
        slots: [
          { pool: "MOV-TORACICA", qty: 1, description: "Movilidad torácica" },
          { pool: "PREV-HOMBRO", qty: 1, description: "Activación manguito rotador" }
        ]
      },
      {
        type: "principal",
        label: "Ejercicios Principales",
        duration: "20 min",
        slots: [
          {
            poolPattern: "empuje_horizontal",
            qty: 1,
            description: "Empuje horizontal principal",
            priority: 1
          },
          {
            poolPattern: "empuje_vertical",
            qty: 1,
            description: "Empuje vertical",
            priority: 2
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Ejercicios Complementarios",
        duration: "15 min",
        slots: [
          {
            poolPattern: "empuje_horizontal",
            qty: 1,
            description: "Empuje horizontal secundario (diferente pool)"
          },
          {
            pool: "EMP-LAT-MAN",
            qty: 1,
            optional: true,
            description: "Elevación lateral"
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "core",
        label: "Core",
        duration: "6 min",
        slots: [
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Antiextensión" }
        ]
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { pool: "MOV-TORACICA", qty: 1, description: "Movilidad torácica" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // FUERZA SUPERIOR B - Tracción
  // ═══════════════════════════════════════════════════════════════
  
  "Fuerza Superior B": {
    title: "Fuerza Superior B - Tracción",
    duration: "45-55 min",
    intensityLevel: "media",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "8 min",
        slots: [
          { pool: "MOV-TORACICA", qty: 1, description: "Movilidad torácica" },
          { pool: "PREV-HOMBRO", qty: 1, description: "Activación escapular" }
        ]
      },
      {
        type: "principal",
        label: "Ejercicios Principales",
        duration: "20 min",
        slots: [
          {
            poolPattern: "traccion_vertical",
            qty: 1,
            description: "Tracción vertical",
            priority: 1
          },
          {
            poolPattern: "traccion_horizontal",
            qty: 1,
            description: "Tracción horizontal",
            priority: 2
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Ejercicios Complementarios",
        duration: "12 min",
        slots: [
          {
            poolPattern: "traccion_horizontal",
            qty: 1,
            description: "Remo variante"
          },
          {
            pool: "TRAC-PRONE-SIN",
            qty: 1,
            description: "Extensión dorsal"
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "core",
        label: "Core",
        duration: "6 min",
        slots: [
          { pool: "CORE-ANTI-LAT", qty: 1, description: "Antiflexión lateral" }
        ]
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad general" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD
  // ═══════════════════════════════════════════════════════════════
  
  "Velocidad": {
    title: "Velocidad y Aceleración",
    duration: "45-55 min",
    intensityLevel: "alta",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "12 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad dinámica" },
          { pool: "GLU-SIN", qty: 1, description: "Activación glúteo" },
          { pool: "PLIO-BAJO", qty: 1, description: "Saltos de activación" }
        ]
      },
      {
        type: "principal",
        label: "Bloque Principal",
        duration: "25 min",
        slots: [
          {
            pool: "VEL-ACEL",
            qty: 1,
            description: "Aceleraciones cortas",
            priority: 1
          },
          {
            pool: "VEL-SPRINT",
            qty: 1,
            description: "Sprints",
            priority: 2
          },
          {
            pool: "VEL-COD",
            qty: 1,
            description: "Cambios de dirección",
            priority: 3
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Trabajo Reactivo",
        duration: "10 min",
        slots: [
          {
            pool: "VEL-REAC",
            qty: 1,
            optional: true,
            description: "Reacción a estímulos"
          }
        ]
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Estiramientos" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // PREVENCIÓN
  // ═══════════════════════════════════════════════════════════════
  
  "Prevención": {
    title: "Prevención de Lesiones",
    duration: "35-45 min",
    intensityLevel: "baja",
    blocks: [
      {
        type: "calentamiento",
        label: "Movilidad Articular",
        duration: "8 min",
        slots: [
          { pool: "MOV-CADERA", qty: 1, description: "Movilidad cadera" },
          { pool: "MOV-TOBILLO", qty: 1, description: "Movilidad tobillo" },
          { pool: "MOV-TORACICA", qty: 1, description: "Movilidad torácica" }
        ]
      },
      {
        type: "principal",
        label: "Trabajo Preventivo",
        duration: "20 min",
        slots: [
          {
            pool: "PREV-RODILLA",
            qty: 2,
            description: "Estabilidad rodilla",
            rules: { noRepeatExercise: true }
          },
          {
            pool: "PREV-TOBILLO",
            qty: 1,
            description: "Estabilidad tobillo"
          },
          {
            pool: "PREV-HOMBRO",
            qty: 1,
            description: "Salud de hombro"
          }
        ],
        rules: {
          noRepeatSession: true
        }
      },
      {
        type: "core",
        label: "Core Estabilizador",
        duration: "10 min",
        slots: [
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Antiextensión" },
          { pool: "CORE-ANTI-LAT", qty: 1, description: "Antiflexión lateral" }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { pool: "MOV-FLOW", qty: 1, description: "Flow movilidad" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD
  // ═══════════════════════════════════════════════════════════════
  
  "Movilidad": {
    title: "Sesión de Movilidad",
    duration: "30-40 min",
    intensityLevel: "baja",
    blocks: [
      {
        type: "principal",
        label: "Movilidad Articular",
        duration: "25 min",
        slots: [
          { pool: "MOV-CADERA", qty: 2, description: "Movilidad cadera", rules: { noRepeatExercise: true } },
          { pool: "MOV-TOBILLO", qty: 1, description: "Movilidad tobillo" },
          { pool: "MOV-TORACICA", qty: 1, description: "Movilidad torácica" },
          { pool: "MOV-FLOW", qty: 1, description: "Flow integrador" }
        ]
      },
      {
        type: "complementario",
        label: "Activación Suave",
        duration: "10 min",
        slots: [
          { pool: "GLU-SIN", qty: 1, description: "Activación glúteo suave" },
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Core suave" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // PLIOMETRÍA
  // ═══════════════════════════════════════════════════════════════
  
  "Pliometría": {
    title: "Sesión de Pliometría",
    duration: "40-50 min",
    intensityLevel: "alta",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "12 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad dinámica" },
          { pool: "GLU-SIN", qty: 1, description: "Activación glúteo" },
          { pool: "PLIO-BAJO", qty: 1, description: "Saltos preparatorios" }
        ]
      },
      {
        type: "principal",
        label: "Bloque Pliométrico",
        duration: "20 min",
        slots: [
          {
            pool: "PLIO-BAJO",
            qty: 1,
            description: "Pliometría baja intensidad"
          },
          {
            pool: "PLIO-MEDIO",
            qty: 1,
            description: "Pliometría media intensidad",
            experienciaMinima: "intermedio"
          },
          {
            pool: "PLIO-ALTO",
            qty: 1,
            optional: true,
            description: "Pliometría alta intensidad",
            experienciaMinima: "avanzado",
            edadMinima: 16
          }
        ],
        rules: {
          distinctPools: true,
          noRepeatSession: true
        }
      },
      {
        type: "complementario",
        label: "Fuerza Reactiva",
        duration: "10 min",
        slots: [
          { pool: "VEL-ACEL", qty: 1, description: "Aceleraciones cortas" }
        ]
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Estiramientos" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // FULL BODY (para principiantes o baja frecuencia)
  // ═══════════════════════════════════════════════════════════════
  
  "Full Body": {
    title: "Sesión Full Body",
    duration: "50-60 min",
    intensityLevel: "media",
    blocks: [
      {
        type: "calentamiento",
        label: "Calentamiento",
        duration: "8 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Movilidad general" },
          { pool: "GLU-SIN", qty: 1, description: "Activación glúteo" }
        ]
      },
      {
        type: "principal",
        label: "Tren Inferior",
        duration: "15 min",
        slots: [
          {
            poolPattern: "rodilla_bilateral",
            qty: 1,
            description: "Ejercicio dominante rodilla"
          },
          {
            poolPattern: "cadera_bilateral",
            qty: 1,
            description: "Ejercicio dominante cadera"
          }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "principal",
        label: "Tren Superior",
        duration: "15 min",
        slots: [
          {
            poolPattern: "empuje_horizontal",
            qty: 1,
            description: "Empuje"
          },
          {
            poolPattern: "traccion_horizontal",
            qty: 1,
            description: "Tracción"
          }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "core",
        label: "Core",
        duration: "8 min",
        slots: [
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Antiextensión" },
          { pool: "CORE-ANTI-LAT", qty: 1, description: "Antiflexión lateral" }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { poolFamily: "movilidad", qty: 1, description: "Estiramientos" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════
  // ISOMÉTRICOS (recuperación o día de baja carga)
  // ═══════════════════════════════════════════════════════════════
  
  "Isométricos": {
    title: "Sesión Isométrica",
    duration: "30-40 min",
    intensityLevel: "baja",
    blocks: [
      {
        type: "calentamiento",
        label: "Movilidad",
        duration: "8 min",
        slots: [
          { poolFamily: "movilidad", qty: 2, description: "Movilidad articular" }
        ]
      },
      {
        type: "principal",
        label: "Isométricos Tren Inferior",
        duration: "15 min",
        slots: [
          {
            pool: "ISO-INFERIOR",
            qty: 3,
            description: "Isométricos piernas",
            rules: { noRepeatExercise: true }
          }
        ]
      },
      {
        type: "core",
        label: "Core Isométrico",
        duration: "10 min",
        slots: [
          { pool: "CORE-ANTI-EXT", qty: 1, description: "Plancha frontal o variante" },
          { pool: "CORE-ANTI-LAT", qty: 1, description: "Plancha lateral" }
        ],
        rules: {
          distinctPools: true
        }
      },
      {
        type: "vuelta_calma",
        label: "Vuelta a la calma",
        duration: "5 min",
        slots: [
          { pool: "MOV-FLOW", qty: 1, description: "Flow movilidad" }
        ]
      }
    ]
  }
};

export const WEEKLY_SESSION_CONFIG = {
  
  "Fuerza": {
    1: ["Fuerza A"],
    2: ["Fuerza A", "Fuerza B"],
    3: ["Fuerza A", "Fuerza B", "Velocidad"],
    4: ["Fuerza A", "Fuerza B", "Velocidad", "Prevención"]
  },
  
  "Velocidad": {
    1: ["Velocidad"],
    2: ["Velocidad", "Fuerza A"],
    3: ["Velocidad", "Fuerza A", "Pliometría"],
    4: ["Velocidad", "Fuerza A", "Pliometría", "Prevención"]
  },
  
  "Resistencia": {
    1: ["Full Body"],
    2: ["Full Body", "Velocidad"],
    3: ["Full Body", "Velocidad", "Fuerza A"],
    4: ["Full Body", "Velocidad", "Fuerza A", "Prevención"]
  },
  
  "Hipertrofia": {
    1: ["Full Body"],
    2: ["Fuerza Superior A", "Fuerza A"],
    3: ["Fuerza Superior A", "Fuerza Superior B", "Fuerza A"],
    4: ["Fuerza Superior A", "Fuerza Superior B", "Fuerza A", "Fuerza B"]
  },
  
  "Prevención": {
    1: ["Prevención"],
    2: ["Prevención", "Movilidad"],
    3: ["Prevención", "Movilidad", "Isométricos"],
    4: ["Prevención", "Movilidad", "Isométricos", "Fuerza B"]
  },
  
  "Movilidad": {
    1: ["Movilidad"],
    2: ["Movilidad", "Prevención"],
    3: ["Movilidad", "Prevención", "Isométricos"],
    4: ["Movilidad", "Prevención", "Isométricos", "Full Body"]
  }
};

export function isV2Template(template) {
  const slots = template?.blocks?.[0]?.slots;
  return Array.isArray(slots) && slots.length > 0 && typeof slots[0] === "object";
}

export default SESSION_TEMPLATES;
