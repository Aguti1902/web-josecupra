/**
 * DEPRO — Catálogo multi-eje de ejercicios (fuente de verdad del motor individual).
 *
 * Taxonomía:
 * - carpeta: fuerza_tren_inferior | fuerza_tren_superior | velocidad | resistencia | pliometria | core | prevencion | movilidad
 * - etiquetas base: material, objetivo, segmento, patron, rol, grupo_principal, grupo_muscular, accion_secundaria?
 * - grupo_muscular = [grupo_principal] (sin músculos accesorios) para no romper el selector AND
 * - Etiquetas club_* viven en capa paralela (clubExerciseTags) y NO se usan aquí
 * - Listado alineado a Prompt final Depro 2.0 §9.6 + variantes con vídeo compartido
 *
 * Generado por scripts/build-definitive-catalog.mjs
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 3,
    "nombre": "Sentadilla isométrica en pared (Wall sit)",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-INF",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
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
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
    "videoUrl": "",
    "lesionesContra": [],
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
      "rol": "basico",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
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
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gluteos. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
      "rol": "basico",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gluteos. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: gomas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
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
      "rol": "basico",
      "grupo_principal": "gluteos",
      "grupo_muscular": [
        "gluteos"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gluteos. Material: gomas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: gomas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: gomas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
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
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: gomas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gluteos. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
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
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: mancuernas. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
    "videoUrl": "",
    "lesionesContra": [],
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
        "estabilidad_lumbopelvica"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a core. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "ISO-CARRY",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: barra. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_espalda"
    ],
    "edadMinima": 14,
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
        "cadena_posterior"
      ],
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: barra. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 14,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
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
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
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
      "grupo_principal": "gemelos",
      "grupo_muscular": [
        "gemelos"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gemelos. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "AN-GEMELOS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 31,
    "nombre": "Extensión de cuádriceps en máquina",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 32,
    "nombre": "Curl femoral sentado",
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
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 33,
    "nombre": "Elevación de gemelos de pie",
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
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "gemelos",
      "grupo_muscular": [
        "gemelos"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gemelos. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "AN-GEMELOS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 34,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 35,
    "nombre": "Flexiones estrechas (tríceps)",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 36,
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
        "empuje",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a hombros. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 37,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 38,
    "nombre": "Tríceps fondo en banco",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 39,
    "nombre": "Dominadas asistidas",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 40,
    "nombre": "Superman",
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
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
      ],
      "accion_secundaria": [
        "estabilidad_escapular",
        "prevencion_hombro"
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
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en espalda. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 41,
    "nombre": "Y-T-W en suelo",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en escapular. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-ESCAP",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 42,
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 43,
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
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 44,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 45,
    "nombre": "Rotadores externos de hombro con goma",
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
        "estabilidad_escapular",
        "prevencion_hombro"
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
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en hombros. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 46,
    "nombre": "Press con mancuernas",
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
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 47,
    "nombre": "Remo con mancuerna",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 48,
    "nombre": "Elevaciones laterales",
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
        "empuje",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a hombros. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 49,
    "nombre": "Elevación frontal",
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
        "empuje",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a hombros. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 50,
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
        "empuje",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a hombros. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 51,
    "nombre": "Fondos en banco + mancuerna",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 52,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: barra. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 14,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 53,
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: barra. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 14,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 54,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 55,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 56,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 57,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 58,
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
        "velocidad_pura"
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 59,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 60,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 61,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 62,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 63,
    "nombre": "Sprint 60 m",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 64,
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 65,
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 66,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 67,
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
        "COD"
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 68,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 69,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en reaccion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-REAC",
    "videoUrl": "https://www.youtube.com/watch?v=3PqgN9q_0ZQ",
    "videoGroup": "vel_reaccion",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 70,
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en reaccion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-REAC",
    "videoUrl": "https://www.youtube.com/watch?v=3PqgN9q_0ZQ",
    "videoGroup": "vel_reaccion",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 71,
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
        "velocidad_pura"
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 72,
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
        "velocidad_pura"
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 73,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 74,
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
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 75,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 76,
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
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 77,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 78,
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
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 79,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 80,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 81,
    "nombre": "Saltos en escalera tipo quick feet",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 82,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 83,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 84,
    "nombre": "Sprint + salto reactivo",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 85,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 86,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 87,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 88,
    "nombre": "Isometría en sentadilla 90°",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-INF",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 89,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-INF",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 90,
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
        "cadena_anterior",
        "isometrico"
      ],
      "rol": "complementario",
      "grupo_principal": "gemelos",
      "grupo_muscular": [
        "gemelos"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gemelos. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-INF",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 91,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a gluteos. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-INF",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 92,
    "nombre": "Isometría femoral Nordic hold",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 93,
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
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
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
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 94,
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
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
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
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 95,
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "ISO-REMO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 96,
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
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
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
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 97,
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
        "anti_extension",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 98,
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 99,
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
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
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
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 100,
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
        "anti_rotacion"
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (anti_rotacion). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 101,
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
      "accion_secundaria": [
        "estabilidad_lumbopelvica"
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
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 102,
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
        "anti_rotacion",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (anti_rotacion). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 103,
    "nombre": "Equilibrio unipodal",
    "nuevo": false,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 104,
    "nombre": "Pase pierna por encima",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cadera",
      "grupo_muscular": [
        "cadera"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 105,
    "nombre": "Pase pierna por debajo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cadera",
      "grupo_muscular": [
        "cadera"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 106,
    "nombre": "Estabilidad rodilla + mini saltos",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 107,
    "nombre": "Estabilidad tobillo",
    "nuevo": false,
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
        "prevencion_rodilla"
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
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 108,
    "nombre": "Caminata talón-punta",
    "nuevo": false,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 109,
    "nombre": "Trabajo multidireccional controlado",
    "nuevo": false,
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
        "prevencion_rodilla"
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
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 110,
    "nombre": "Skipping técnico",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 111,
    "nombre": "Rotación torácica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en espalda. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 112,
    "nombre": "Elevación escapular Y",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en escapular. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 113,
    "nombre": "Antiextensión lumbar",
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
        "anti_extension",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 114,
    "nombre": "Movilidad de cadera",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cadera",
      "grupo_muscular": [
        "cadera"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 115,
    "nombre": "Movilidad de tobillo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "movilidad"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en tobillo. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 116,
    "nombre": "Estiramiento flexores de cadera",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_inferior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "cadera",
      "grupo_muscular": [
        "cadera"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 117,
    "nombre": "Jalón al pecho",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 118,
    "nombre": "Cruces pecho de pie",
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 119,
    "nombre": "Elevaciones laterales en polea",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "empuje",
        "analitico"
      ],
      "rol": "complementario",
      "grupo_principal": "hombros",
      "grupo_muscular": [
        "hombros"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a hombros. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 120,
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 121,
    "nombre": "Remo barra",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: barra. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 14,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 122,
    "nombre": "Remo agarre estrecho",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 123,
    "nombre": "Extensión tríceps en polea",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 124,
    "nombre": "Extensión tríceps tras nuca",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 125,
    "nombre": "Curl bíceps en máquina",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a biceps. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-BICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 126,
    "nombre": "Curl bíceps alterno sentado mancuerna",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a biceps. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-BICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 127,
    "nombre": "Curl bíceps sentado mancuernas",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a biceps. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-BICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 128,
    "nombre": "Curl bíceps sentado declinado mancuerna",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
      ],
      "segmento": "tren_superior",
      "patron": [
        "analitico",
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "biceps",
      "grupo_muscular": [
        "biceps"
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
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a biceps. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-BICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 129,
    "nombre": "Press mancuernas inclinado",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 130,
    "nombre": "Extensión tríceps mancuernas en banco",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "mancuernas"
      ],
      "objetivo": [
        "fuerza",
        "estetica"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Aísla el músculo objetivo sin balanceo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige un peso que permita técnica limpia",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a triceps. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "AN-TRICEPS",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 131,
    "nombre": "Remo con mancuerna en banco",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 132,
    "nombre": "Remo en máquina",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 133,
    "nombre": "Elevación lateral en máquina",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 134,
    "nombre": "Press inclinado en máquina",
    "nuevo": false,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 135,
    "nombre": "Press plano en máquina",
    "nuevo": false,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 136,
    "nombre": "Abducción pectoral en máquina",
    "nuevo": false,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 137,
    "nombre": "Jalón al pecho máquina",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 138,
    "nombre": "Sentadilla en máquina inclinada (tipo haka)",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 139,
    "nombre": "Prensa en máquina plana",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 140,
    "nombre": "Jalón al pecho agarre neutro ancho",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 141,
    "nombre": "Jalón al pecho agarre neutro estrecho",
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
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 142,
    "nombre": "Press militar en máquina de discos",
    "nuevo": false,
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 143,
    "nombre": "Remo en máquina de discos",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "fuerza"
      ],
      "segmento": "tren_superior",
      "patron": [
        "traccion"
      ],
      "rol": "complementario",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a espalda. Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-TRACCION",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 144,
    "nombre": "Press inclinado barra",
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
      "rol": "complementario",
      "grupo_principal": "pecho",
      "grupo_muscular": [
        "pecho"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_hombro"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren superior orientado a pecho. Material: barra. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-EMPUJE",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_hombro"
    ],
    "edadMinima": 14,
    "carpeta": "fuerza_tren_superior"
  },
  {
    "id": 145,
    "nombre": "RowErg",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 146,
    "nombre": "Carrera continua",
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
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 147,
    "nombre": "SkiErg",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 148,
    "nombre": "BikeErg",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 149,
    "nombre": "Empuje trineo",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "trineo"
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (anaerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 150,
    "nombre": "Peso muerto barra hexagonal",
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
        "cadena_posterior"
      ],
      "rol": "basico",
      "grupo_principal": "isquios",
      "grupo_muscular": [
        "isquios"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_espalda"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga",
      "Calienta la articulación principal antes de series pesadas"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a isquios. Material: barra. Ejecuta con control y rango completo seguro.",
    "pool": "TI-POST",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_espalda"
    ],
    "edadMinima": 14,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 151,
    "nombre": "Sentadilla en multipower",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: maquina. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 152,
    "nombre": "Salto profundo + salto al cajón",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 153,
    "nombre": "Salto cajón + caigo + salto profundo",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Aterriza suave, rodillas alineadas con los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Si aparece dolor articular, reduce altura o volumen"
    ],
    "descripcion": "Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
    "pool": "PLIO-GEN",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 14,
    "carpeta": "pliometria"
  },
  {
    "id": 154,
    "nombre": "Step up + rodilla arriba",
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
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-UNI",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 155,
    "nombre": "Perro gato movilidad torácica",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "sin_material"
      ],
      "objetivo": [
        "movilidad"
      ],
      "segmento": "tren_superior",
      "patron": [
        "movilidad"
      ],
      "rol": "calentamiento",
      "grupo_principal": "espalda",
      "grupo_muscular": [
        "espalda"
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
      "Rango cómodo: no fuerces hasta el dolor",
      "Movimiento lento y controlado en ambas direcciones",
      "Combina con respiración profunda"
    ],
    "descripcion": "Movilidad articular enfocada en espalda. Usa rangos cómodos y respiración constante.",
    "pool": "MOV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "movilidad"
  },
  {
    "id": 156,
    "nombre": "Equilibrio unipodal ir a tocar conos",
    "nuevo": false,
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 157,
    "nombre": "Caminar sobre línea con los ojos cerrados",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén la columna neutra y el core activo",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Ejercicio de fuerza de tren inferior orientado a cuadriceps. Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "TI-ANT",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
  },
  {
    "id": 158,
    "nombre": "Equilibrio sobre BOSU",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "bosu"
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Controla el equilibrio antes de aumentar dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Ejercicio preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
  },
  {
    "id": 159,
    "nombre": "Coordinación 1 pie por espacio",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 160,
    "nombre": "Coordinación Dos pies por espacio",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 161,
    "nombre": "Coordinación Un pie (dentro-fuera)",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 162,
    "nombre": "Coordinación Dos pies dentro, uno fuera",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 163,
    "nombre": "Coordinación Lateral dos dentro, dos fuera",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 164,
    "nombre": "Coordinación Salto pies juntos",
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
      "rol": "complementario",
      "grupo_principal": "cuadriceps",
      "grupo_muscular": [
        "cuadriceps"
      ],
      "accion_secundaria": [
        "control_motor"
      ],
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_rodilla",
        "lesion_tobillo"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [
      "lesion_rodilla",
      "lesion_tobillo"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 165,
    "nombre": "Inch worm + plancha",
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
        "anti_extension",
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
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 166,
    "nombre": "Nordic hold",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Neutraliza la lumbar: no arquees ni hundas la cadera",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Ejercicio de core para estabilidad del tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
    "pool": "CORE-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "core"
  },
  {
    "id": 167,
    "nombre": "Drill pared",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 168,
    "nombre": "Carrera continua zona 2",
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
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 169,
    "nombre": "Carrera continua regenerativa",
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
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 170,
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
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (umbral). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 171,
    "nombre": "Intervalos anaeróbicos cortos",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (anaerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 172,
    "nombre": "Fartlek controlado",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (anaerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 173,
    "nombre": "Carrera continua en cinta",
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
      "Mantén un ritmo sostenible y respiración controlada",
      "Postura erguida, mirada al frente y zancada eficiente",
      "Ajusta la intensidad según la zona prevista (no aceleres de más)"
    ],
    "descripcion": "Trabajo de resistencia (aerobico). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.",
    "pool": "RES-GEN",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 174,
    "nombre": "Aceleraciones 20 m",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 175,
    "nombre": "Aceleraciones 30 m",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 176,
    "nombre": "Salidas desde pie",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 177,
    "nombre": "Sprint 10 m",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 178,
    "nombre": "Sprint 15 m",
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-SPRINT",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "vel_sprint",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "velocidad"
  },
  {
    "id": 179,
    "nombre": "COD 5-10-5 reactivo",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 180,
    "nombre": "COD 4 conos",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 181,
    "nombre": "Zig-zag 4 conos",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Salida explosiva con apoyo completo del pie",
      "Tronco estable y brazos activos en oposición",
      "Prioriza calidad técnica antes que volumen"
    ],
    "descripcion": "Drill de velocidad/agilidad. Enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COD",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "vel_cod",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "velocidad"
  }
];

export const CATALOG_CARPETAS = [
  "fuerza_tren_inferior",
  "fuerza_tren_superior",
  "velocidad",
  "resistencia",
  "pliometria",
  "core",
  "prevencion",
  "movilidad"
];

export default EXERCISES;
