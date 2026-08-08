/**
 * DEPRO — Catálogo multi-eje de ejercicios (fuente de verdad del motor individual).
 *
 * Taxonomía:
 * - carpeta: fuerza_tren_inferior | fuerza_tren_superior | velocidad | pliometria | core | prevencion | movilidad
 * - etiquetas base: material, objetivo, segmento, patron, rol, grupo_principal, grupo_muscular, accion_secundaria?
 * - grupo_muscular = [grupo_principal] (sin músculos accesorios) para no romper el selector AND
 * - Etiquetas club_* viven en capa paralela (clubExerciseTags) y NO se usan aquí
 *
 * Generado/actualizado por scripts/retag-exercise-catalog.mjs
 */
export const EXERCISES = [
  {
    "id": 1,
    "nombre": "Sentadilla clásica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 2,
    "nombre": "Sentadilla brazos arriba",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 3,
    "nombre": "Sentadilla isométrica en pared (wall sit)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 4,
    "nombre": "Zancada adelante",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 5,
    "nombre": "Zancada atrás",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 6,
    "nombre": "Zancada lateral",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 7,
    "nombre": "Split squat (estático)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 8,
    "nombre": "Hip thrust unilateral (peso corporal)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 9,
    "nombre": "Step-up en banco",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-SIN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 10,
    "nombre": "Puente de glúteo 2 piernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 11,
    "nombre": "Sentadilla con goma en rodillas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 12,
    "nombre": "Glute bridge con goma",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 13,
    "nombre": "Lateral walk con banda elástica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion",
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "accion_secundaria": [
        "prevencion_rodilla"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 14,
    "nombre": "Monster walk",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion",
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "accion_secundaria": [
        "prevencion_rodilla",
        "control_motor"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 15,
    "nombre": "Extensión isquios tumbado con banda",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 16,
    "nombre": "Sentadilla con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 17,
    "nombre": "Zancada con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 18,
    "nombre": "Peso muerto rumano con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 19,
    "nombre": "Peso muerto a 1 pierna (mancuerna)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 20,
    "nombre": "Step-up pesado con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 21,
    "nombre": "Sentadilla goblet",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 22,
    "nombre": "Hip thrust con mancuerna",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "basico",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 23,
    "nombre": "Sentadilla búlgara con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 24,
    "nombre": "Buenos días con mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 25,
    "nombre": "Farmer walk corto (10-20 m)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "full_body",
      "patron": [
        "isometrico",
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica",
        "estabilidad_escapular"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "FUNC-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 26,
    "nombre": "Sentadilla con barra trasera",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "barra"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 27,
    "nombre": "Peso muerto convencional con barra",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "barra"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_maxima",
        "cadena_posterior"
      ],
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 28,
    "nombre": "Prensa inclinada",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 29,
    "nombre": "Curl femoral tumbado en máquina",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CAD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 30,
    "nombre": "Elevación de gemelos en máquina",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "gemelo",
      "grupo_muscular": [
        "gemelo"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 31,
    "nombre": "Sentadilla multipower",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "barra",
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 32,
    "nombre": "Extensión de cuádriceps",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 33,
    "nombre": "Curl de isquios sentado",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 34,
    "nombre": "Sentadilla máquina (tipo hack)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ROD-BI-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 35,
    "nombre": "Adductores máquina",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "aductores",
      "grupo_muscular": [
        "aductores"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_pubalgia"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "INF-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_pubalgia"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 36,
    "nombre": "Flexiones clásicas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 37,
    "nombre": "Flexiones estrechas (tríceps)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 38,
    "nombre": "Flexiones pica (hombros)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 39,
    "nombre": "Flexiones con apertura amplia",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 40,
    "nombre": "Tríceps fondo en banco",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "triceps",
      "grupo_muscular": [
        "triceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 41,
    "nombre": "Dominadas asistidas (barra baja o ayuda)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 42,
    "nombre": "Superman",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza",
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda_baja",
      "grupo_muscular": [
        "espalda_baja"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 43,
    "nombre": "Y-T-W escapular en suelo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "escapular",
      "grupo_muscular": [
        "escapular"
      ],
      "accion_secundaria": [
        "estabilidad_escapular",
        "prevencion_hombro"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 44,
    "nombre": "Remo con banda elástica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 45,
    "nombre": "Press con banda elástica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 46,
    "nombre": "Aperturas con banda",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 47,
    "nombre": "Rotadores externos hombro con goma",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "isometrico",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "accion_secundaria": [
        "estabilidad_hombro",
        "prevencion_hombro"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 48,
    "nombre": "Press mancuernas (banca o suelo)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 49,
    "nombre": "Remo con mancuerna (un brazo)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 50,
    "nombre": "Elevaciones laterales",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 51,
    "nombre": "Elevación frontal",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 52,
    "nombre": "Press Arnold",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 53,
    "nombre": "Fondos apoyado banco + mancuerna (tríceps)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "triceps",
      "grupo_muscular": [
        "triceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 54,
    "nombre": "Press banca con barra",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "barra"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 55,
    "nombre": "Remo con barra",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "barra"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 56,
    "nombre": "Dominadas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 57,
    "nombre": "Press inclinado con barra",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "barra"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 58,
    "nombre": "Press plano con mancuernas",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 59,
    "nombre": "Press francés con mancuernas",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "triceps",
      "grupo_muscular": [
        "triceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 60,
    "nombre": "Curl de bíceps alterno sentado",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "SUP-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 61,
    "nombre": "Curl de bíceps a la vez",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "SUP-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 62,
    "nombre": "Press en máquina (máquina de polea)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 63,
    "nombre": "Press de hombro en máquina 1 (polea)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 64,
    "nombre": "Press de hombro en máquina 2 (disco)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_disco"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 65,
    "nombre": "Remo en máquina (polea)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 66,
    "nombre": "Jalón en máquina (polea)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 67,
    "nombre": "Remo en polea normal (multistación, agarre estrecho)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 68,
    "nombre": "Remo en polea normal (agarre ancho)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 69,
    "nombre": "Jalón en polea normal (agarre normal)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 70,
    "nombre": "Jalón en polea normal (agarre neutro)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro",
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 71,
    "nombre": "Cruces de pecho en polea de pie",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 72,
    "nombre": "Elevaciones laterales sentado",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 73,
    "nombre": "Remo en banco con mancuerna",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 74,
    "nombre": "Máquina de pecho (aperturas)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 75,
    "nombre": "Máquina de elevación lateral",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 76,
    "nombre": "Bíceps en máquina",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "SUP-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 77,
    "nombre": "Extensión de tríceps en polea normal (de pie)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "triceps",
      "grupo_muscular": [
        "triceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 78,
    "nombre": "Extensión de tríceps en polea trasnuca",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_polea"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "triceps",
      "grupo_muscular": [
        "triceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 79,
    "nombre": "Remo en máquina de discos",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_disco"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "basico",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "TRAC-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 80,
    "nombre": "Press en máquina de discos",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "maquina_disco"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje"
      ],
      "rol": "basico",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "EMP-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 81,
    "nombre": "Aceleraciones 10 m",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 82,
    "nombre": "Aceleraciones 15 m",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 83,
    "nombre": "Salidas desde rodilla",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 84,
    "nombre": "Salidas laterales",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion",
        "COD"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 85,
    "nombre": "Aceleración jogging → sprint",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 86,
    "nombre": "Sprint progresivo 10-20-30",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 87,
    "nombre": "Sprint 20 m",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 88,
    "nombre": "Sprint 30 m",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 89,
    "nombre": "Sprint 40 m",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 90,
    "nombre": "Sprint 60 m (según edad)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad",
        "resistencia"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 91,
    "nombre": "COD 5-10-5",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 92,
    "nombre": "COD 3 conos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 93,
    "nombre": "Zig-zag 6 conos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 94,
    "nombre": "T-test",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 95,
    "nombre": "COD reacción (start visual)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD",
        "reaccion"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 96,
    "nombre": "COD planta-pivote derecha/izquierda",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 97,
    "nombre": "Reacción visual (flechas/colores)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "reaccion"
      ],
      "rol": "complementario",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 98,
    "nombre": "Reacción auditiva",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "reaccion"
      ],
      "rol": "complementario",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 99,
    "nombre": "Sprint + frenada",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD",
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 100,
    "nombre": "Sprint curveado",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD",
        "velocidad_pura"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 101,
    "nombre": "Saltos verticales simples",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 102,
    "nombre": "Saltos laterales sobre línea",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 103,
    "nombre": "Saltos adelante cortos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 104,
    "nombre": "Mini saltos pogos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "gemelo",
      "grupo_muscular": [
        "gemelo"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 105,
    "nombre": "Caídas y saltos (drop jump)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 106,
    "nombre": "Saltos unipodales suaves",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 107,
    "nombre": "Depth jumps",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 108,
    "nombre": "Repeticiones salto a banco",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 109,
    "nombre": "Saltos en escalera tipo quick feet",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad",
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 110,
    "nombre": "Boundings (saltos largos)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 111,
    "nombre": "Lateral bounds (patinador)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "COD",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 112,
    "nombre": "Sprint + salto reactivo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad",
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria",
        "velocidad_pura"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 113,
    "nombre": "Salto caja baja",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 114,
    "nombre": "Salto caja alta (seguro)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria",
        "fuerza_explosiva"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 115,
    "nombre": "Drop jump desde cajón",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 116,
    "nombre": "Salto largo + subida al cajón",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 117,
    "nombre": "Salto al cajón + caída + salto largo",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "fuerza_explosiva",
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "pliometria"
  },
  {
    "id": 118,
    "nombre": "Wall sit",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 119,
    "nombre": "Isometría en sentadilla 90º",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 120,
    "nombre": "Isometría zancada",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 121,
    "nombre": "Isometría gemelo en punta",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "gemelo",
      "grupo_muscular": [
        "gemelo"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 122,
    "nombre": "Isometría puente de glúteo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 123,
    "nombre": "Isometría femoral Nordic hold",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza",
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico",
        "cadena_posterior"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 124,
    "nombre": "Plancha frontal",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 125,
    "nombre": "Plancha lateral",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 126,
    "nombre": "Isometría de remo con banda",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "accion_secundaria": [
        "estabilidad_escapular"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "ISO-SUPERIOR",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 127,
    "nombre": "Hollow hold",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 128,
    "nombre": "Dead bug",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica",
        "control_motor"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 129,
    "nombre": "Bird dog",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 130,
    "nombre": "Hollow rock",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 131,
    "nombre": "Russian twist",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 132,
    "nombre": "Elevación de piernas tumbado",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 133,
    "nombre": "Anti-rotación con banda (Pallof)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 134,
    "nombre": "Equilibrio unipodal en línea (talón-punta)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "accion_secundaria": [
        "equilibrio",
        "prevencion_tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 135,
    "nombre": "Equilibrio unipodal con ojos cerrados",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "accion_secundaria": [
        "equilibrio",
        "prevencion_tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 136,
    "nombre": "Equilibrio unipodal plano inestable (toalla doblada)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "accion_secundaria": [
        "equilibrio",
        "prevencion_tobillo"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 137,
    "nombre": "Pase pierna por encima (cadera móvil)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 138,
    "nombre": "Pase pierna por debajo (cadera móvil)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 139,
    "nombre": "Estabilidad rodilla + mini saltos laterales controlados",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 140,
    "nombre": "Estabilidad tobillo (apoyo monopodal + alcance multidireccional)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "accion_secundaria": [
        "equilibrio",
        "control_motor",
        "prevencion_tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 141,
    "nombre": "Caminata talón-punta línea recta (10 m)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "accion_secundaria": [
        "equilibrio",
        "prevencion_tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 142,
    "nombre": "Skipping técnico en sitio (rodilla alta controlada)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion",
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 143,
    "nombre": "Nordic hold excéntrico (3 segundos bajada)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 144,
    "nombre": "Trap 3 con banda (elevación escapular)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "escapular",
      "grupo_muscular": [
        "escapular"
      ],
      "accion_secundaria": [
        "estabilidad_escapular",
        "prevencion_hombro"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 145,
    "nombre": "Rotación torácica en cuadrupedia",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 146,
    "nombre": "Elevación escapular en Y con banda",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 147,
    "nombre": "Dead bug controlado (antiextensión)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 148,
    "nombre": "Pallof press con banda (anti-rotación)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 149,
    "nombre": "Movilidad de tobillo en círculos (10 por sentido)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 150,
    "nombre": "Movilidad de tobillo en flexión (peso sobre pared)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "gemelo",
      "grupo_muscular": [
        "gemelo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 151,
    "nombre": "Movilidad de tobillo dorsiflexión con banda",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "tobillo",
      "grupo_muscular": [
        "tobillo"
      ],
      "intensidad": "baja",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 152,
    "nombre": "Movilidad de cadera en círculos (8 por sentido, bipedal)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 153,
    "nombre": "Movilidad de cadera maripeda (rodillas abiertas en suelo)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "aductores",
      "grupo_muscular": [
        "aductores"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 154,
    "nombre": "Movilidad de cadera 90/90 (rotación interna y externa)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "media",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 155,
    "nombre": "Movilidad de cadera estocada + rotación torácica",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "full_body",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 156,
    "nombre": "Movilidad de hombro en círculos (10 por sentido)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 157,
    "nombre": "Movilidad de hombro con bastón (circunducción)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "baja",
      "experiencia": [
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 158,
    "nombre": "Y-T-W con banda (movilidad escapular)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "escapular",
      "grupo_muscular": [
        "escapular"
      ],
      "accion_secundaria": [
        "estabilidad_escapular",
        "prevencion_hombro"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 159,
    "nombre": "Movilidad de hombro en pared (wall slides)",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 160,
    "nombre": "Rotación torácica en decúbito lateral",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico"
      ],
      "rol": "calentamiento",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 161,
    "nombre": "Estiramiento flexores de cadera en cuadrupedia",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "vuelta_calma",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 162,
    "nombre": "Estiramiento isquios sentado",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "vuelta_calma",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 163,
    "nombre": "Estiramiento cuádriceps de pie",
    "nuevo": true,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "analitico"
      ],
      "rol": "vuelta_calma",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 164,
    "nombre": "Carrera continua aeróbica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aerobico"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 165,
    "nombre": "Series umbral controlado",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "umbral"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 166,
    "nombre": "Intervalos anaeróbicos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "anaerobico"
      ],
      "rol": "basico",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "alta",
      "experiencia": [
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 167,
    "nombre": "Técnica de carrera (marcha A / drills)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 168,
    "nombre": "Split squat hold",
    "nuevo": true,
    "carpeta": "fuerza_tren_inferior",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 169,
    "nombre": "Puente de glúteo unilateral isométrico",
    "nuevo": true,
    "carpeta": "fuerza_tren_inferior",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 170,
    "nombre": "Wall sit unilateral",
    "nuevo": true,
    "carpeta": "fuerza_tren_inferior",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_anterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 171,
    "nombre": "Isometría aductores con balón",
    "nuevo": true,
    "carpeta": "prevencion",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "aductores",
      "grupo_muscular": [
        "aductores"
      ],
      "accion_secundaria": [
        "prevencion_rodilla"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 172,
    "nombre": "Copenhagen hold básico",
    "nuevo": true,
    "carpeta": "prevencion",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "aductores",
      "grupo_muscular": [
        "aductores"
      ],
      "accion_secundaria": [
        "prevencion_rodilla"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 173,
    "nombre": "Copenhagen hold medio",
    "nuevo": true,
    "carpeta": "prevencion",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "aductores",
      "grupo_muscular": [
        "aductores"
      ],
      "accion_secundaria": [
        "prevencion_rodilla"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 174,
    "nombre": "Isometría isquios supino talones en banco",
    "nuevo": true,
    "carpeta": "fuerza_tren_inferior",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "cadena_posterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 175,
    "nombre": "Press isométrico pared unilateral",
    "nuevo": true,
    "carpeta": "fuerza_tren_superior",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "accion_secundaria": [
        "estabilidad_hombro"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-SUPERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 176,
    "nombre": "Rotación externa isométrica con banda",
    "nuevo": true,
    "carpeta": "prevencion",
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "isometrico",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "accion_secundaria": [
        "prevencion_hombro",
        "estabilidad_hombro"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 177,
    "nombre": "Serrato wall hold",
    "nuevo": true,
    "carpeta": "prevencion",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "prevencion"
      ],
      "segmento": "tren_superior",
      "patron": [
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "escapular",
      "grupo_muscular": [
        "escapular"
      ],
      "accion_secundaria": [
        "estabilidad_escapular",
        "prevencion_hombro"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 178,
    "nombre": "Dead bug hold",
    "nuevo": true,
    "carpeta": "core",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 179,
    "nombre": "Bear plank hold",
    "nuevo": true,
    "carpeta": "core",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 180,
    "nombre": "Pallof hold",
    "nuevo": true,
    "carpeta": "core",
    "etiquetas": {
      "material": [
        "gomas"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 181,
    "nombre": "Drop landing + hold",
    "nuevo": true,
    "carpeta": "pliometria",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "prevencion_rodilla",
        "control_motor"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 182,
    "nombre": "Skater landing hold",
    "nuevo": true,
    "carpeta": "pliometria",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "pliometria",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
      ],
      "accion_secundaria": [
        "prevencion_rodilla",
        "equilibrio"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "ISO-INFERIOR",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 183,
    "nombre": "Plancha con toque de hombro",
    "nuevo": true,
    "carpeta": "core",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "core"
      ],
      "segmento": "core",
      "patron": [
        "isometrico"
      ],
      "rol": "core",
      "grupo_principal": "core",
      "grupo_muscular": [
        "core"
      ],
      "accion_secundaria": [
        "estabilidad_hombro"
      ],
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo"
    ],
    "pool": "CORE-ANTI-EXT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 12
  },
  {
    "id": 184,
    "nombre": "Marcha A",
    "nuevo": true,
    "carpeta": "velocidad",
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "velocidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "aceleracion"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "baja",
      "experiencia": [
        "novato",
        "intermedio"
      ],
      "contraindicado": []
    },
    "tips": [
      "Ritmo controlado",
      "Rodilla alta y pie activo",
      "Tronco estable"
    ],
    "pool": "VEL-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10
  }
];

export const CATALOG_CARPETAS = [
  "fuerza_tren_inferior",
  "fuerza_tren_superior",
  "velocidad",
  "pliometria",
  "core",
  "prevencion",
  "movilidad"
];

export default EXERCISES;
