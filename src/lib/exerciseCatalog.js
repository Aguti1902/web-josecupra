/**
 * DEPRO — Catálogo multi-eje de ejercicios (fuente de verdad del motor individual).
 *
 * Taxonomía:
 * - carpeta: fuerza_tren_inferior | fuerza_tren_superior | velocidad | resistencia | pliometria | core | prevencion | movilidad
 * - etiquetas base: material, objetivo, segmento, patron, rol, grupo_principal, grupo_muscular, accion_secundaria?
 * - grupo_muscular = [grupo_principal] (sin músculos accesorios) para no romper el selector AND
 * - Etiquetas club_* viven en capa paralela (clubExerciseTags) y NO se usan aquí
 * - Listado §9.6 + protocolos de resistencia para plantillas aeróbica/umbral/anaeróbica
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla clásica: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla brazos arriba: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla isométrica en pared (Wall sit): isometría de cuadriceps. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Zancada adelante: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Zancada atrás: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Zancada lateral: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Split squat (estático): fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Hip thrust unilateral (peso corporal): fuerza de tren inferior orientada a gluteos (cadena_posterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Step-up en banco: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Puente de glúteo 2 piernas: fuerza de tren inferior orientada a gluteos (cadena_posterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla con goma en rodillas: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: gomas. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Glute bridge con goma: fuerza de tren inferior orientada a gluteos (cadena_posterior). Material: gomas. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Lateral walk con banda elástica: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: gomas. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Monster walk: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: gomas. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Extensión isquios tumbado con banda: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: gomas. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla con mancuernas: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Zancada con mancuernas: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Peso muerto rumano con mancuernas: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Peso muerto a 1 pierna (mancuerna): fuerza de tren inferior orientada a isquios (cadena_posterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Step-up pesado con mancuernas: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla goblet: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Hip thrust con mancuerna: fuerza de tren inferior orientada a gluteos (cadena_posterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla búlgara con mancuernas: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
      "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Buenos días con mancuernas: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: mancuernas. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Farmer walk corto (10-20 m): fuerza de tren superior orientada a core (isometrico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla con barra trasera: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: barra. Ejecuta con control y rango completo seguro.",
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
      "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Peso muerto convencional con barra: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: barra. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Prensa inclinada: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Curl femoral tumbado en máquina: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Elevación de gemelos en máquina: fuerza de tren inferior orientada a gemelos (analitico). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Extensión de cuádriceps en máquina: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Curl femoral sentado: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Elevación de gemelos de pie: fuerza de tren inferior orientada a gemelos (analitico). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Flexiones clásicas: fuerza de tren superior orientada a pecho (empuje). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Flexiones estrechas (tríceps): fuerza de tren superior orientada a triceps (analitico). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Flexiones pica (hombros): fuerza de tren superior orientada a hombros (empuje). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Flexiones con apertura amplia: fuerza de tren superior orientada a pecho (empuje). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Tríceps fondo en banco: fuerza de tren superior orientada a triceps (analitico). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Dominadas asistidas: fuerza de tren superior orientada a espalda (traccion). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Superman: trabajo preventivo/propioceptivo centrado en espalda. Mejora control motor y reduce riesgo de lesión.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Y-T-W en suelo: trabajo preventivo/propioceptivo centrado en escapular. Mejora control motor y reduce riesgo de lesión.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo con banda elástica: fuerza de tren superior orientada a espalda (traccion). Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press con banda elástica: fuerza de tren superior orientada a pecho (empuje). Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
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
    "descripcion": "Aperturas con banda: fuerza de tren superior orientada a pecho (empuje). Material: gomas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Rotadores externos de hombro con goma: trabajo preventivo/propioceptivo centrado en hombros. Mejora control motor y reduce riesgo de lesión.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press con mancuernas: fuerza de tren superior orientada a pecho (empuje). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo con mancuerna: fuerza de tren superior orientada a espalda (traccion). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
    "descripcion": "Elevaciones laterales: fuerza de tren superior orientada a hombros (empuje). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
    "descripcion": "Elevación frontal: fuerza de tren superior orientada a hombros (empuje). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press Arnold: fuerza de tren superior orientada a hombros (empuje). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Fondos en banco + mancuerna: fuerza de tren superior orientada a triceps (analitico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press banca con barra: fuerza de tren superior orientada a pecho (empuje). Material: barra. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo con barra: fuerza de tren superior orientada a espalda (traccion). Material: barra. Prioriza trayectoria estable y escápulas controladas.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Aceleraciones 10 m: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Aceleraciones 15 m: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Salidas desde rodilla: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Salidas laterales: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Aceleración jogging → sprint: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint progresivo 10-20-30: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint 20 m: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint 30 m: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint 40 m: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint 60 m: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "COD 5-10-5: drill de velocidad/agilidad enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "COD 3 conos: drill de velocidad/agilidad enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Zig-zag 6 conos: drill de velocidad/agilidad enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "COD reacción (start visual): drill de velocidad/agilidad enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "COD planta-pivote derecha/izquierda: drill de velocidad/agilidad enfocado en COD. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Reacción visual (flechas/colores): drill de velocidad/agilidad enfocado en reaccion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Reacción auditiva: drill de velocidad/agilidad enfocado en reaccion. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint + frenada: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Sprint curveado: drill de velocidad/agilidad enfocado en velocidad_pura. Recupera bien entre repeticiones para mantener calidad.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Saltos verticales simples: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Saltos laterales sobre línea: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Saltos adelante cortos: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Mini saltos pogos: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Caídas y saltos (drop jump): ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Saltos unipodales suaves: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Depth jumps: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Repeticiones salto a banco: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Saltos en escalera tipo quick feet: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Boundings (saltos largos): ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Lateral bounds (patinador): ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Sprint + salto reactivo: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Salto caja baja: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Salto caja alta (seguro): ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Drop jump desde cajón: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Isometría en sentadilla 90°: isometría de cuadriceps. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Equilibra ambos lados; empieza por el más débil",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Isometría zancada: isometría de cuadriceps. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Isometría gemelo en punta: isometría de gemelos. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
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
    "descripcion": "Isometría puente de glúteo: isometría de gluteos. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
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
        "fuerza",
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Desciende controlado con isquios activos; no arquees la lumbar",
      "Usa asistencia de compañero o anclaje seguro",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Isometría femoral Nordic hold: isometría de isquios. Mantén la posición con tensión controlada sin compensaciones. Material: sin_material.",
    "pool": "ISO-ISQ",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Plancha frontal: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Plancha lateral: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Isometría de remo con banda: isometría de espalda. Mantén la posición con tensión controlada sin compensaciones. Material: gomas.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Hollow hold: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Dead bug: estabilidad de tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Bird dog: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Hollow rock: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Pelvis neutra: no arquees ni hundas la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Russian twist: estabilidad de tronco (anti_rotacion). Mantén pelvis neutra durante todo el estímulo.",
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
      "Pelvis neutra: no arquees ni hundas la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Elevación de piernas tumbado: estabilidad de tronco (isometrico). Mantén pelvis neutra durante todo el estímulo.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Anti-rotación con banda (Pallof): estabilidad de tronco (anti_rotacion). Mantén pelvis neutra durante todo el estímulo.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Equilibrio unipodal: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
    "descripcion": "Pase pierna por encima: movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
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
    "descripcion": "Pase pierna por debajo: movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Estabilidad rodilla + mini saltos: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Estabilidad tobillo: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Caminata talón-punta: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Trabajo multidireccional controlado: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Skipping técnico: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [],
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
    "descripcion": "Rotación torácica: movilidad articular enfocada en espalda. Usa rangos cómodos y respiración constante.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Elevación escapular Y: trabajo preventivo/propioceptivo centrado en escapular. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-ESCAP",
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
      "Pelvis neutra: no arquees ni hundas la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Antiextensión lumbar: estabilidad de tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
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
    "descripcion": "Movilidad de cadera: movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
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
    "descripcion": "Movilidad de tobillo: movilidad articular enfocada en tobillo. Usa rangos cómodos y respiración constante.",
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
    "descripcion": "Estiramiento flexores de cadera: movilidad articular enfocada en cadera. Usa rangos cómodos y respiración constante.",
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
        "maquina"
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Jalón al pecho: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Cruces pecho de pie: fuerza de tren superior orientada a pecho (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
    "descripcion": "Elevaciones laterales en polea: fuerza de tren superior orientada a hombros (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Dominadas: fuerza de tren superior orientada a espalda (traccion). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo barra: fuerza de tren superior orientada a espalda (traccion). Material: barra. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo agarre estrecho: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Extensión tríceps en polea: fuerza de tren superior orientada a triceps (analitico). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Extensión tríceps tras nuca: fuerza de tren superior orientada a triceps (analitico). Material: sin_material. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Curl bíceps en máquina: fuerza de tren superior orientada a biceps (analitico). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Curl bíceps alterno sentado mancuerna: fuerza de tren superior orientada a biceps (analitico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Curl bíceps sentado mancuernas: fuerza de tren superior orientada a biceps (analitico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Curl bíceps sentado declinado mancuerna: fuerza de tren superior orientada a biceps (analitico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press mancuernas inclinado: fuerza de tren superior orientada a pecho (empuje). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Aísla el músculo objetivo sin balancear el cuerpo",
      "Controla la fase excéntrica 2–3 segundos",
      "Elige una carga que permita técnica limpia"
    ],
    "descripcion": "Extensión tríceps mancuernas en banco: fuerza de tren superior orientada a triceps (analitico). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo con mancuerna en banco: fuerza de tren superior orientada a espalda (traccion). Material: mancuernas. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo en máquina: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
    "descripcion": "Elevación lateral en máquina: fuerza de tren superior orientada a hombros (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_superior"
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press inclinado en máquina: fuerza de tren superior orientada a pecho (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press plano en máquina: fuerza de tren superior orientada a pecho (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Abducción pectoral en máquina: fuerza de tren superior orientada a pecho (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Jalón al pecho máquina: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla en máquina inclinada (tipo haka): fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Prensa en máquina plana: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Jalón al pecho agarre neutro ancho: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Jalón al pecho agarre neutro estrecho: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press militar en máquina de discos: fuerza de tren superior orientada a hombros (empuje). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
    "pool": "TS-HOMBRO",
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
      "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Remo en máquina de discos: fuerza de tren superior orientada a espalda (traccion). Material: maquina. Prioriza trayectoria estable y escápulas controladas.",
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
      "Escápulas estables; no abras en exceso los codos",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Press inclinado barra: fuerza de tren superior orientada a pecho (empuje). Material: barra. Prioriza trayectoria estable y escápulas controladas.",
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
      "segmento": "full_body",
      "patron": [
        "aerobico"
      ],
      "rol": "basico",
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
      "Ritmo conversacional salvo indicación contraria",
      "Postura erguida y respiración rítmica",
      "No conviertas el estímulo en sprint salvo que la sesión lo pida"
    ],
    "descripcion": "RowErg: trabajo de resistencia (aerobico) centrado en espalda. Material: maquina. Regula la intensidad según el objetivo de la sesión.",
    "pool": "RES-ERG",
    "videoUrl": "",
    "videoGroup": "res_erg",
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
      "Ritmo conversacional salvo indicación contraria",
      "Postura erguida y respiración rítmica",
      "No conviertas el estímulo en sprint salvo que la sesión lo pida"
    ],
    "descripcion": "Carrera continua: trabajo de resistencia (aerobico) centrado en cuadriceps. Material: sin_material. Regula la intensidad según el objetivo de la sesión.",
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
      "segmento": "tren_superior",
      "patron": [
        "aerobico"
      ],
      "rol": "basico",
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
      "Ritmo conversacional salvo indicación contraria",
      "Postura erguida y respiración rítmica",
      "No conviertas el estímulo en sprint salvo que la sesión lo pida"
    ],
    "descripcion": "SkiErg: trabajo de resistencia (aerobico) centrado en espalda. Material: maquina. Regula la intensidad según el objetivo de la sesión.",
    "pool": "RES-ERG",
    "videoUrl": "",
    "videoGroup": "res_erg",
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
      "Ritmo conversacional salvo indicación contraria",
      "Postura erguida y respiración rítmica",
      "No conviertas el estímulo en sprint salvo que la sesión lo pida"
    ],
    "descripcion": "BikeErg: trabajo de resistencia (aerobico) centrado en cuadriceps. Material: maquina. Regula la intensidad según el objetivo de la sesión.",
    "pool": "RES-ERG",
    "videoUrl": "",
    "videoGroup": "res_erg",
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
        "resistencia",
        "fuerza"
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
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Mantén un ritmo sostenible según el objetivo de la sesión",
      "Postura erguida y respiración rítmica",
      "No conviertas el estímulo en sprint salvo que la sesión lo pida"
    ],
    "descripcion": "Empuje trineo: trabajo de resistencia (anaerobico) centrado en cuadriceps. Material: trineo. Regula la intensidad según el objetivo de la sesión.",
    "pool": "RES-POT",
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
      "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Peso muerto barra hexagonal: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: barra. Ejecuta con control y rango completo seguro.",
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
      "Rodillas alineadas con la punta de los pies; no colapses hacia dentro",
      "Controla el movimiento en ambas fases",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Sentadilla en multipower: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: maquina. Ejecuta con control y rango completo seguro.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Salto profundo + salto al cajón: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Salto cajón + caigo + salto profundo: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
    "descripcion": "Step up + rodilla arriba: fuerza de tren inferior orientada a cuadriceps (cadena_anterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
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
    "descripcion": "Perro gato movilidad torácica: movilidad articular enfocada en espalda. Usa rangos cómodos y respiración constante.",
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
      "Frena con el pie exterior y mantén el centro de masa bajo",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Equilibrio unipodal ir a tocar conos: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Caminar sobre línea con los ojos cerrados: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
    "pool": "PREV-GEN",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "prevencion"
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
      "Controla el equilibrio antes de subir dificultad",
      "Mantén alineación rodilla-tobillo-cadera",
      "Si pierdes la postura, reduce el estímulo"
    ],
    "descripcion": "Equilibrio sobre BOSU: trabajo preventivo/propioceptivo centrado en tobillo. Mejora control motor y reduce riesgo de lesión.",
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Coordinación 1 pie por espacio: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [],
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Coordinación Dos pies por espacio: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [],
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Coordinación Un pie (dentro-fuera): drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [],
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Coordinación Dos pies dentro, uno fuera: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [],
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Coordinación Lateral dos dentro, dos fuera: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-COORD",
    "videoUrl": "",
    "lesionesContra": [],
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
      "Aterriza suave con rodillas alineadas sobre los pies",
      "Contacto breve con el suelo; rebote reactivo",
      "Reduce altura o volumen si aparece molestia articular"
    ],
    "descripcion": "Coordinación Salto pies juntos: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: sin_material.",
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
      "Bloquea costillas y pelvis; evita arquear la lumbar",
      "Respira sin perder la tensión del tronco",
      "Calidad de posición por encima del tiempo o las reps"
    ],
    "descripcion": "Inch worm + plancha: estabilidad de tronco (anti_extension). Mantén pelvis neutra durante todo el estímulo.",
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
        "fuerza",
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
      "intensidad": "alta",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Desciende controlado con isquios activos; no arquees la lumbar",
      "Usa asistencia de compañero o anclaje seguro",
      "No sacrifiques técnica por carga"
    ],
    "descripcion": "Nordic hold: fuerza de tren inferior orientada a isquios (cadena_posterior). Material: sin_material. Ejecuta con control y rango completo seguro.",
    "pool": "ISO-ISQ",
    "videoUrl": "",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "fuerza_tren_inferior"
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
      "intensidad": "media",
      "experiencia": [
        "novato",
        "intermedio",
        "avanzado"
      ],
      "contraindicado": []
    },
    "tips": [
      "Prioriza calidad técnica sobre volumen",
      "Recupera completo entre repeticiones para conservar velocidad",
      "Tronco estable y apoyos activos"
    ],
    "descripcion": "Drill pared: drill de velocidad/agilidad enfocado en aceleracion. Recupera bien entre repeticiones para mantener calidad.",
    "pool": "VEL-ACEL",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "vel_acel",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "velocidad"
  },
  {
    "id": 168,
    "nombre": "Series VAM 3×3' al 90%",
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
      "Calcula tu VAM con un test reciente antes de programar el ritmo",
      "Las 3 series deben mantenerse cerca del 90%; si caes mucho, acorta la siguiente",
      "Recupera de pie o trote muy suave en los 2 minutos de descanso",
      "Hidratación y calentamiento previo de al menos 10 minutos"
    ],
    "descripcion": "Resistencia anaeróbica: 3 series de 3 minutos al 90% de la VAM con 2 minutos de descanso entre series. Mantén el ritmo objetivo en cada bloque.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "sets": "3",
    "reps": "3 min",
    "rest": "2 min",
    "duration": "3×3' + descansos",
    "load": "90% VAM",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 169,
    "nombre": "Intervalos 30/30 carrera ×10",
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
      "El tramo ON debe ser rápido pero sostenible las 10 series",
      "En OFF no te pares: trote muy suave",
      "Mantén la misma zancada; evita tensar hombros"
    ],
    "descripcion": "Resistencia anaeróbica intermitente: 10 repeticiones de 30 segundos rápidos y 30 segundos de recuperación activa trotando.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "sets": "10",
    "reps": "30\" ON / 30\" OFF",
    "rest": "incluido",
    "duration": "10 min trabajo",
    "load": "≈95–100% VAM en ON",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 170,
    "nombre": "Series 400 m ×6",
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
      "Salidas controladas: no quemes la primera serie",
      "Recupera caminando o trote suave",
      "Si el tiempo cae >8% respecto a la mejor serie, termina la sesión"
    ],
    "descripcion": "Series de 400 m a ritmo alto con recuperación incompleta. Desarrolla capacidad anaeróbica láctica y tolerancia al ritmo.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "sets": "6",
    "reps": "400 m",
    "rest": "90–120\"",
    "duration": "6×400 m",
    "load": "ritmo 3.000–5.000 m",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 171,
    "nombre": "Intervalos 15/15 ×12",
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
      "Máxima calidad en cada ON; no alargues el paso en OFF",
      "Útil tras buen calentamiento neuromuscular",
      "Para si aparece dolor articular o pérdida clara de técnica"
    ],
    "descripcion": "Estímulo anaeróbico corto: 12 intervalos de 15 segundos intensos con 15 segundos de recuperación activa.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "sets": "12",
    "reps": "15\" ON / 15\" OFF",
    "rest": "incluido",
    "duration": "6 min densos",
    "load": "alta / casi máxima",
    "lesionesContra": [],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 172,
    "nombre": "BikeErg 5×2' anaeróbico",
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
        "anaerobico"
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
      "Cadencia estable; no solo subas resistencia de golpe",
      "En el descanso baja a zona fácil sin parar del todo",
      "Mantén tronco estable y agarre relajado"
    ],
    "descripcion": "Series anaeróbicas en BikeErg: 5 bloques de 2 minutos a alta intensidad con 2 minutos de pedaleo suave.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_erg",
    "sets": "5",
    "reps": "2 min",
    "rest": "2 min",
    "duration": "5×2'",
    "load": "alta (≈90% esfuerzo)",
    "lesionesContra": [],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 173,
    "nombre": "Fartlek intenso 20'",
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
      "Alterna tramos fuertes y suaves sin parar",
      "Los picos no deben ser sprints máximos al inicio",
      "Termina con 3–5 minutos suaves"
    ],
    "descripcion": "Fartlek de 20 minutos con cambios de ritmo espontáneos o marcados (p. ej. 1' fuerte / 1' suave). Combina aeróbico alto y picos anaeróbicos.",
    "pool": "RES-ANA",
    "videoUrl": "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
    "videoGroup": "res_continua",
    "sets": "1",
    "reps": "20 min",
    "rest": "—",
    "duration": "20 min",
    "load": "cambios de ritmo",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 14,
    "carpeta": "resistencia"
  },
  {
    "id": 174,
    "nombre": "Tempo run umbral 20'",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "El ritmo debe ser exigente pero estable de principio a fin",
      "Si te pasas, reduce 5–10\"/km en la siguiente sesión",
      "Calienta 10' y enfría 5' suaves"
    ],
    "descripcion": "Carrera continua a ritmo de umbral durante 20 minutos. Debes poder hablar solo frases cortas.",
    "pool": "RES-UMB",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "res_continua",
    "sets": "1",
    "reps": "20 min",
    "rest": "—",
    "duration": "20 min",
    "load": "umbral (≈85–90% FCmáx)",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 175,
    "nombre": "Series umbral 4×5'",
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
      "Todas las series al mismo ritmo objetivo",
      "En el descanso no te sientes: trote regenerativo",
      "Útil para subir el umbral sin saturar como un anaeróbico puro"
    ],
    "descripcion": "4 series de 5 minutos a ritmo de umbral con 2 minutos de trote suave entre series.",
    "pool": "RES-UMB",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "res_continua",
    "sets": "4",
    "reps": "5 min",
    "rest": "2 min",
    "duration": "4×5'",
    "load": "ritmo umbral",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 176,
    "nombre": "Carrera umbral continua 25'",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Controla el ritmo cada 5 minutos",
      "Respira profundo y mantén zancada económica",
      "Si la FC se dispara, baja ligeramente el pace"
    ],
    "descripcion": "Bloque continuo de 25 minutos en zona umbral. Prioriza constancia de ritmo sobre picos de velocidad.",
    "pool": "RES-UMB",
    "videoUrl": "https://www.youtube.com/watch?v=2L2W3nY4v8A",
    "videoGroup": "res_continua",
    "sets": "1",
    "reps": "25 min",
    "rest": "—",
    "duration": "25 min",
    "load": "umbral",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 177,
    "nombre": "RowErg umbral 4×4'",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "full_body",
      "patron": [
        "umbral"
      ],
      "rol": "basico",
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
      "Cadencia 24–28 spm según nivel",
      "Tracción con piernas → tronco → brazos",
      "Mantén el split homogéneo en las 4 series"
    ],
    "descripcion": "Series de umbral en remoergómetro: 4×4 minutos a intensidad umbral con 2 minutos suaves.",
    "pool": "RES-UMB",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "res_erg",
    "sets": "4",
    "reps": "4 min",
    "rest": "2 min",
    "duration": "4×4'",
    "load": "umbral (split estable)",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 178,
    "nombre": "BikeErg umbral 3×8'",
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
      "Elige una resistencia que puedas sostener los 8 minutos",
      "No te levantes del sillín salvo técnica concreta",
      "Hidratación entre bloques"
    ],
    "descripcion": "3 bloques de 8 minutos en BikeErg a intensidad umbral con 3 minutos de recuperación activa.",
    "pool": "RES-UMB",
    "videoUrl": "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
    "videoGroup": "res_erg",
    "sets": "3",
    "reps": "8 min",
    "rest": "3 min",
    "duration": "3×8'",
    "load": "umbral",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 179,
    "nombre": "Carrera continua zona 2 30'",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Debes poder hablar en frases completas",
      "Prioriza volumen y técnica sobre velocidad",
      "Ideal en días de carga baja o regenerativos activos"
    ],
    "descripcion": "Carrera continua aeróbica en zona 2 durante 30 minutos. Ritmo conversacional; base aeróbica.",
    "pool": "RES-AER",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "res_continua",
    "sets": "1",
    "reps": "30 min",
    "rest": "—",
    "duration": "30 min",
    "load": "zona 2",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 180,
    "nombre": "Carrera regenerativa 25'",
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
      "contraindicado": [
        "lesion_tobillo",
        "lesion_rodilla"
      ]
    },
    "tips": [
      "Ritmo muy cómodo; si dudas, ve más despacio",
      "Respira por nariz si te resulta natural",
      "Úsalo el día después de sesiones duras"
    ],
    "descripcion": "Trote regenerativo de 25 minutos a intensidad baja. Facilita recuperación sin estímulo anaeróbico.",
    "pool": "RES-AER",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "res_continua",
    "sets": "1",
    "reps": "25 min",
    "rest": "—",
    "duration": "25 min",
    "load": "baja",
    "lesionesContra": [
      "lesion_tobillo",
      "lesion_rodilla"
    ],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 181,
    "nombre": "RowErg aeróbico continuo 20'",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "full_body",
      "patron": [
        "aerobico"
      ],
      "rol": "basico",
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
      "Cadencia cómoda y split sostenible",
      "No tires solo de brazos",
      "Mantén lumbar neutra todo el bloque"
    ],
    "descripcion": "Remo continuo aeróbico 20 minutos a intensidad conversacional. Buena opción indoor para base aeróbica.",
    "pool": "RES-AER",
    "videoUrl": "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
    "videoGroup": "res_erg",
    "sets": "1",
    "reps": "20 min",
    "rest": "—",
    "duration": "20 min",
    "load": "zona 2",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
  },
  {
    "id": 182,
    "nombre": "SkiErg aeróbico continuo 15'",
    "nuevo": false,
    "etiquetas": {
      "material": [
        "maquina"
      ],
      "objetivo": [
        "resistencia"
      ],
      "segmento": "tren_superior",
      "patron": [
        "aerobico"
      ],
      "rol": "basico",
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
      "Tracción larga y controlada; no rebotes",
      "Core activo y cadera estable",
      "Empieza suave los primeros 3 minutos"
    ],
    "descripcion": "SkiErg continuo 15 minutos en zona aeróbica. Trabaja tren superior y tronco sin impacto.",
    "pool": "RES-AER",
    "videoUrl": "",
    "videoGroup": "res_erg",
    "sets": "1",
    "reps": "15 min",
    "rest": "—",
    "duration": "15 min",
    "load": "zona 2",
    "lesionesContra": [],
    "edadMinima": 10,
    "carpeta": "resistencia"
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
