/**
 * DEPRO - Catálogo de Ejercicios v2.0
 * 
 * Cada ejercicio pertenece a UN ÚNICO pool.
 * Solo puede intercambiarse por otro ejercicio del MISMO pool.
 */
export const EXERCISES = [
  
  // ═══════════════════════════════════════════════════════════════
  // TREN INFERIOR - FUERZA (1-30)
  // ═══════════════════════════════════════════════════════════════
  
  // --- ROD-BI-SIN: Sentadillas sin material ---
  {
    id: 1,
    nombre: "Sentadilla clásica",
    pool: "ROD-BI-SIN",
    tips: [
      "Pies a anchura de hombros, puntas ligeramente hacia fuera",
      "Rodillas siguen la línea del pie, espalda neutra"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 2,
    nombre: "Sentadilla brazos arriba",
    pool: "ROD-BI-SIN",
    tips: [
      "Brazos estirados encima de la cabeza todo el movimiento",
      "No arquees la zona lumbar para 'sacar pecho'"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "rodilla_aguda"],
    edadMinima: 10
  },
  
  // --- ISO-INFERIOR: Isométricos tren inferior ---
  {
    id: 3,
    nombre: "Sentadilla isométrica en pared (wall sit)",
    pool: "ISO-INFERIOR",
    tips: [
      "Rodillas ~90º, espalda apoyada en la pared",
      "Peso repartido en ambos pies, no te apoyes con las manos en las piernas"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // --- ROD-UNI-SIN: Zancadas sin material ---
  {
    id: 4,
    nombre: "Zancada adelante",
    pool: "ROD-UNI-SIN",
    tips: [
      "Paso largo y controlado, tronco ligeramente inclinado",
      "Rodilla delantera no se mete hacia dentro"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 5,
    nombre: "Zancada atrás",
    pool: "ROD-UNI-SIN",
    tips: [
      "Paso hacia atrás, baja recto sin desplazar demasiado el cuerpo",
      "Mantén peso en la pierna delantera"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 6,
    nombre: "Zancada lateral",
    pool: "ROD-UNI-SIN",
    tips: [
      "Paso lateral, flexiona la pierna de apoyo y mantén la otra extendida",
      "Pies completamente apoyados, rodilla alineada con el pie"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "pubalgia"],
    edadMinima: 10
  },
  {
    id: 7,
    nombre: "Split squat (estático)",
    pool: "ROD-UNI-SIN",
    tips: [
      "Pies en 'vía de tren', no en línea, para más estabilidad",
      "Baja recto, pensando en rodilla trasera hacia el suelo"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  
  // --- CAD-UNI-SIN: Cadera unilateral sin material ---
  {
    id: 8,
    nombre: "Hip thrust unilateral (peso corporal)",
    pool: "CAD-UNI-SIN",
    tips: [
      "Apoya escápulas en banco, una pierna extendida",
      "Sube hasta alinear hombro–cadera–rodilla de la pierna de apoyo"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 12
  },
  
  // --- ROD-UNI-SIN: Step-up ---
  {
    id: 9,
    nombre: "Step-up en banco",
    pool: "ROD-UNI-SIN",
    tips: [
      "Subes empujando fuerte con la pierna de arriba, la de abajo solo acompaña",
      "Controla la bajada, sin 'dejarte caer'"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  
  // --- GLU-SIN: Glúteo sin material ---
  {
    id: 10,
    nombre: "Puente de glúteo 2 piernas",
    pool: "GLU-SIN",
    tips: [
      "Empuja con talones, no con puntas",
      "No arquees lumbar, aprieta glúteos arriba"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // --- ROD-BI-GOM: Sentadilla con gomas ---
  {
    id: 11,
    nombre: "Sentadilla con goma en rodillas",
    pool: "ROD-BI-GOM",
    tips: [
      "Mantén tensión hacia fuera con las rodillas durante todo el gesto",
      "No dejes que la goma 'meta' las rodillas hacia dentro"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  
  // --- GLU-GOM: Glúteo con gomas ---
  {
    id: 12,
    nombre: "Glute bridge con goma",
    pool: "GLU-GOM",
    tips: [
      "Goma por encima de las rodillas, empuja rodillas hacia fuera",
      "Sube cadera hasta línea hombro–cadera–rodilla"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 13,
    nombre: "Lateral walk con banda elástica",
    pool: "GLU-GOM",
    tips: [
      "Rodillas semiflexionadas, pies paralelos",
      "Pasos cortos manteniendo tensión en la goma"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 14,
    nombre: "Monster walk",
    pool: "GLU-GOM",
    tips: [
      "Posición baja, pasos diagonales manteniendo tensión de goma",
      "No dejes que las rodillas colapsen hacia dentro"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // --- CAD-BI-GOM: Cadera bilateral con gomas ---
  {
    id: 15,
    nombre: "Extensión isquios tumbado con banda",
    pool: "CAD-BI-GOM",
    tips: [
      "Boca abajo, talón hacia glúteo contra resistencia de la goma",
      "Controla subida y bajada, no rebotes"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo"],
    edadMinima: 10
  },
  
  // --- ROD-BI-MAN: Sentadilla con mancuernas ---
  {
    id: 16,
    nombre: "Sentadilla con mancuernas",
    pool: "ROD-BI-MAN",
    tips: [
      "Mancuernas a los lados del cuerpo, brazos relajados",
      "Mantén espalda neutra, rodillas alineadas"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  
  // --- ROD-UNI-MAN: Zancada con mancuernas ---
  {
    id: 17,
    nombre: "Zancada con mancuernas",
    pool: "ROD-UNI-MAN",
    tips: [
      "Mancuernas a los lados, paso largo y controlado",
      "Tronco estable, mira al frente"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  
  // --- CAD-BI-MAN: Peso muerto con mancuernas ---
  {
    id: 18,
    nombre: "Peso muerto rumano con mancuernas",
    pool: "CAD-BI-MAN",
    tips: [
      "Bisagra de cadera, rodillas ligeramente flexionadas",
      "Mancuernas cerca de las piernas, espalda neutra"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda", "isquios_agudo"],
    edadMinima: 14
  },
  
  // --- CAD-UNI-MAN: Peso muerto unilateral ---
  {
    id: 19,
    nombre: "Peso muerto a 1 pierna (mancuerna)",
    pool: "CAD-UNI-MAN",
    tips: [
      "Pie de apoyo firme, la otra pierna se extiende atrás",
      "Mantén cadera 'cerrada', que no rote hacia fuera"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda", "isquios_agudo", "tobillo_inestable"],
    edadMinima: 14
  },
  
  // --- ROD-UNI-MAN: Step-up pesado ---
  {
    id: 20,
    nombre: "Step-up pesado con mancuernas",
    pool: "ROD-UNI-MAN",
    tips: [
      "Igual que step-up normal, pero con carga en manos",
      "Control extremo de la rodilla de apoyo"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 14
  },
  
  // --- ROD-BI-MAN: Sentadilla goblet ---
  {
    id: 21,
    nombre: "Sentadilla goblet",
    pool: "ROD-BI-MAN",
    tips: [
      "Mancuerna o kettlebell pegada al pecho",
      "Torso erguido, rodillas abiertas siguiendo pies"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  
  // --- GLU-MAN: Hip thrust con mancuerna ---
  {
    id: 22,
    nombre: "Hip thrust con mancuerna",
    pool: "GLU-MAN",
    tips: [
      "Mancuerna apoyada sobre la cadera, sujétala con ambas manos",
      "Sube explosivo, baja controlado"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 14
  },
  
  // --- ROD-UNI-MAN: Búlgara ---
  {
    id: 23,
    nombre: "Sentadilla búlgara con mancuernas",
    pool: "ROD-UNI-MAN",
    tips: [
      "Pie trasero en banco, delante a buena distancia",
      "No te dejes caer, baja controlando"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "tobillo_inestable"],
    edadMinima: 14
  },
  
  // --- CAD-BI-MAN: Buenos días ---
  {
    id: 24,
    nombre: "Buenos días con mancuernas",
    pool: "CAD-BI-MAN",
    tips: [
      "Mancuernas en manos o apoyadas en hombros, bisagra de cadera",
      "Rodillas ligeramente flexionadas, espalda neutra"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 14
  },
  
  // --- FUNC-CARRY: Farmer walk ---
  {
    id: 25,
    nombre: "Farmer walk corto (10–20 m)",
    pool: "FUNC-CARRY",
    tips: [
      "Caminas con mancuernas pesadas, tronco erguido",
      "No balancees el tronco, pasos cortos y firmes"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 14
  },
  
  // --- ROD-BI-BAR: Sentadilla con barra ---
  {
    id: 26,
    nombre: "Sentadilla con barra trasera",
    pool: "ROD-BI-BAR",
    tips: [
      "Barra sobre trapecios, no sobre cuello",
      "Bajada controlada, rodillas en línea con pies"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "espalda_aguda"],
    edadMinima: 16
  },
  
  // --- CAD-BI-BAR: Peso muerto con barra ---
  {
    id: 27,
    nombre: "Peso muerto convencional con barra",
    pool: "CAD-BI-BAR",
    tips: [
      "Barra pegada a las piernas, espalda neutra",
      "Empuja el suelo con los pies, no tires solo de espalda"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda", "isquios_agudo"],
    edadMinima: 16
  },
  
  // --- ROD-BI-MAQ: Prensa ---
  {
    id: 28,
    nombre: "Prensa inclinada",
    pool: "ROD-BI-MAQ",
    tips: [
      "No bloquees rodillas del todo arriba",
      "Baja hasta donde puedas sin que la pelvis se redondee"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 14
  },
  
  // --- CAD-BI-MAQ: Curl femoral ---
  {
    id: 29,
    nombre: "Curl femoral tumbado en máquina",
    pool: "CAD-BI-MAQ",
    tips: [
      "Cadera pegada al banco, no arquees lumbar",
      "Movimiento completo y controlado, sin rebote"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo"],
    edadMinima: 14
  },
  
  // --- GEM-MAQ: Gemelos ---
  {
    id: 30,
    nombre: "Elevación de gemelos en máquina",
    pool: "GEM-MAQ",
    tips: [
      "Recorre todo el rango: talón bajo y subida máxima",
      "Pausa 1 segundo arriba, baja lento"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_agudo"],
    edadMinima: 12
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TREN SUPERIOR - FUERZA (31-50)
  // ═══════════════════════════════════════════════════════════════
  
  // --- EMP-HOR-SIN: Flexiones clásicas ---
  {
    id: 31,
    nombre: "Flexiones clásicas",
    pool: "EMP-HOR-SIN",
    tips: [
      "Manos bajo hombros o ligeramente más abiertas",
      "Cuerpo en línea recta, no hundas cadera"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "muneca_aguda"],
    edadMinima: 10
  },
  
  // --- EMP-HOR-TRI: Flexiones énfasis tríceps ---
  {
    id: 32,
    nombre: "Flexiones estrechas (tríceps)",
    pool: "EMP-HOR-TRI",
    tips: [
      "Manos más juntas, codos pegados al cuerpo",
      "Baja controlando, sube empujando fuerte"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "muneca_aguda", "codo_agudo"],
    edadMinima: 12
  },
  
  // --- EMP-VER-SIN: Empuje vertical sin material ---
  {
    id: 33,
    nombre: "Flexiones pica (hombros)",
    pool: "EMP-VER-SIN",
    tips: [
      "Cadera alta, forma de 'v invertida'",
      "Cabeza va hacia el suelo entre las manos"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "muneca_aguda"],
    edadMinima: 12
  },
  
  // --- EMP-HOR-SIN: Flexiones apertura ---
  {
    id: 34,
    nombre: "Flexiones con apertura amplia",
    pool: "EMP-HOR-SIN",
    tips: [
      "Manos más abiertas que hombros",
      "No dejes que hombros se vayan hacia las orejas"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "muneca_aguda"],
    edadMinima: 10
  },
  
  // --- EMP-HOR-TRI: Fondos banco ---
  {
    id: 35,
    nombre: "Tríceps fondo en banco",
    pool: "EMP-HOR-TRI",
    tips: [
      "Manos en el borde del banco, dedos hacia delante",
      "Codos hacia atrás, baja hasta ~90º"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "codo_agudo"],
    edadMinima: 12
  },
  
  // --- TRAC-VER-SIN: Dominadas ---
  {
    id: 36,
    nombre: "Dominadas asistidas (barra baja o ayuda)",
    pool: "TRAC-VER-SIN",
    tips: [
      "Pecho hacia la barra, no mentón hacia arriba",
      "Controla tanto subida como bajada"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "codo_agudo"],
    edadMinima: 12
  },
  
  // --- TRAC-PRONE-SIN: Superman ---
  {
    id: 37,
    nombre: "Superman",
    pool: "TRAC-PRONE-SIN",
    tips: [
      "Boca abajo, elevas brazos y piernas a la vez",
      "Mantén 1–2'' arriba sin tensar cuello"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 10
  },
  
  // --- PREV-HOMBRO: Y-T-W ---
  {
    id: 38,
    nombre: "Y-T-W (hombro) en suelo",
    pool: "PREV-HOMBRO",
    tips: [
      "Formar letras Y, T, W con brazos sin encoger hombros",
      "Movimiento lento y controlado"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // --- TRAC-HOR-GOM: Remo con banda ---
  {
    id: 39,
    nombre: "Remo con banda elástica",
    pool: "TRAC-HOR-GOM",
    tips: [
      "Fija la goma al frente, tira de ella hacia el abdomen",
      "No eches hombros hacia delante al soltar"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  
  // --- EMP-HOR-GOM: Press con banda ---
  {
    id: 40,
    nombre: "Press con banda elástica",
    pool: "EMP-HOR-GOM",
    tips: [
      "Goma fijada detrás, empuja al frente",
      "Mantén core activo, no arquees la espalda"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  
  // --- EMP-HOR-GOM: Aperturas banda ---
  {
    id: 41,
    nombre: "Aperturas con banda",
    pool: "EMP-HOR-GOM",
    tips: [
      "Goma delante del pecho, abres brazos hacia fuera",
      "No eleves hombros hacia las orejas"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  
  // --- PREV-HOMBRO: Rotadores externos ---
  {
    id: 42,
    nombre: "Rotadores externos hombro con goma",
    pool: "PREV-HOMBRO",
    tips: [
      "Codo pegado al costado, 90º de flexión",
      "Rota antebrazo hacia fuera sin mover el brazo"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // --- EMP-HOR-MAN: Press mancuernas ---
  {
    id: 43,
    nombre: "Press mancuernas (banca o suelo)",
    pool: "EMP-HOR-MAN",
    tips: [
      "Pies apoyados, hombros estables",
      "Baja mancuernas hasta línea de pecho, sube controlando"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 14
  },
  
  // --- TRAC-HOR-MAN: Remo mancuerna ---
  {
    id: 44,
    nombre: "Remo con mancuerna (un brazo)",
    pool: "TRAC-HOR-MAN",
    tips: [
      "Tronco inclinado, espalda neutra",
      "Tira de la mancuerna hacia la cadera"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "espalda_aguda"],
    edadMinima: 12
  },
  
  // --- EMP-LAT-MAN: Elevaciones laterales ---
  {
    id: 45,
    nombre: "Elevaciones laterales",
    pool: "EMP-LAT-MAN",
    tips: [
      "Codos ligeramente flexionados",
      "Hasta altura de hombros, sin balancear tronco"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 12
  },
  
  // --- EMP-VER-MAN: Elevación frontal ---
  {
    id: 46,
    nombre: "Elevación frontal",
    pool: "EMP-VER-MAN",
    tips: [
      "Brazos estirados o casi, sube hasta altura de hombros",
      "No arquees la espalda"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 12
  },
  
  // --- EMP-VER-MAN: Press Arnold ---
  {
    id: 47,
    nombre: "Press Arnold",
    pool: "EMP-VER-MAN",
    tips: [
      "Giras mancuernas mientras subes (palmas hacia ti → hacia fuera)",
      "Controla el movimiento, no pegues tirones"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 14
  },
  
  // --- EMP-HOR-TRI: Fondos con peso ---
  {
    id: 48,
    nombre: "Fondos apoyado banco + mancuerna (tríceps)",
    pool: "EMP-HOR-TRI",
    tips: [
      "Como fondo en banco, pero con mancuerna apoyada en piernas si quieres más carga",
      "Codos atrás, no se abren hacia los lados"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "codo_agudo"],
    edadMinima: 14
  },
  
  // --- EMP-HOR-BAR: Press banca ---
  {
    id: 49,
    nombre: "Press banca con barra",
    pool: "EMP-HOR-BAR",
    tips: [
      "Pies firmes, espalda estable",
      "Barra baja al esternón, codos ~45º"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 16
  },
  
  // --- TRAC-HOR-BAR: Remo barra ---
  {
    id: 50,
    nombre: "Remo con barra",
    pool: "TRAC-HOR-BAR",
    tips: [
      "Tronco inclinado, espalda neutra",
      "Tira la barra hacia abdomen, no hacia el pecho"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo", "espalda_aguda"],
    edadMinima: 16
  },
  
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD / ACELERACIÓN / COD (51-70)
  // ═══════════════════════════════════════════════════════════════
  
  // --- VEL-ACEL: Aceleraciones ---
  {
    id: 51,
    nombre: "Aceleraciones 10 m",
    pool: "VEL-ACEL",
    tips: [
      "Posición inicial inclinada, primeros pasos potentes",
      "Mira hacia delante unos 2–3 m, no al suelo"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 10
  },
  {
    id: 52,
    nombre: "Aceleraciones 15 m",
    pool: "VEL-ACEL",
    tips: [
      "Igual que 10 m, pero mantén impulso un poco más"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 10
  },
  {
    id: 53,
    nombre: "Salidas desde rodilla",
    pool: "VEL-ACEL",
    tips: [
      "Sales desde posición de rodilla en suelo, te incorporas y aceleras",
      "Coordina brazos fuerte para ayudar a la salida"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 55,
    nombre: "Aceleración jogging → sprint",
    pool: "VEL-ACEL",
    tips: [
      "Empiezas corriendo suave y, a señal, cambias a sprint",
      "Transición limpia sin frenada entre fases"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 10
  },
  
  // --- VEL-COD: Cambios de dirección ---
  {
    id: 54,
    nombre: "Salidas laterales",
    pool: "VEL-COD",
    tips: [
      "Pie más cercano en ligera carga, sales con paso cruzado o lateral",
      "No te levantes vertical, empuja hacia el lado"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 61,
    nombre: "COD 5–10–5",
    pool: "VEL-COD",
    tips: [
      "Salida, cambios de dirección cortos con buena base de apoyo",
      "Baja centro de gravedad antes del giro"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 62,
    nombre: "COD 3 conos",
    pool: "VEL-COD",
    tips: [
      "Cambios rápidos entre conos, mantén postura baja"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 63,
    nombre: "Zig-zag 6 conos",
    pool: "VEL-COD",
    tips: [
      "Patrón diagonal, controla el centro de gravedad"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 64,
    nombre: "T-test",
    pool: "VEL-COD",
    tips: [
      "Sprint adelante, lateral, lateral, atrás formando T"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 66,
    nombre: "COD planta-pivote derecha/izquierda",
    pool: "VEL-COD",
    tips: [
      "Planta el pie y pivota explosivamente"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 69,
    nombre: "Sprint + frenada",
    pool: "VEL-COD",
    tips: [
      "Sprint corto y frenada controlada"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 70,
    nombre: "Sprint curveado",
    pool: "VEL-COD",
    tips: [
      "Sprint siguiendo curva, inclina el cuerpo hacia dentro"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable"],
    edadMinima: 12
  },
  
  // --- VEL-SPRINT: Sprints ---
  {
    id: 56,
    nombre: "Sprint progresivo 10–20–30",
    pool: "VEL-SPRINT",
    tips: [
      "Incrementa velocidad en cada tramo, no salgas al máximo de golpe"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 12
  },
  {
    id: 57,
    nombre: "Sprint 20 m",
    pool: "VEL-SPRINT",
    tips: [
      "Máxima velocidad controlada, buena postura"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 12
  },
  {
    id: 58,
    nombre: "Sprint 30 m",
    pool: "VEL-SPRINT",
    tips: [
      "Mantén aceleración progresiva hasta velocidad máxima"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 12
  },
  {
    id: 59,
    nombre: "Sprint 40 m",
    pool: "VEL-SPRINT",
    tips: [
      "Fase de aceleración + fase de velocidad máxima"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 14
  },
  {
    id: 60,
    nombre: "Sprint 60 m (según edad)",
    pool: "VEL-SPRINT",
    tips: [
      "Distancia larga, controla la técnica durante toda la carrera"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "gemelo_agudo"],
    edadMinima: 16
  },
  
  // --- VEL-REAC: Reacción ---
  {
    id: 65,
    nombre: "COD reacción (start visual)",
    pool: "VEL-REAC",
    tips: [
      "Reacciona a estímulo visual y cambia de dirección"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 67,
    nombre: "Reacción visual (flechas/colores)",
    pool: "VEL-REAC",
    tips: [
      "Responde al estímulo visual correcto"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 68,
    nombre: "Reacción auditiva",
    pool: "VEL-REAC",
    tips: [
      "Reacciona a señal sonora"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PLIOMETRÍA (71-85)
  // ═══════════════════════════════════════════════════════════════
  
  // --- PLIO-BAJO: Baja intensidad ---
  {
    id: 71,
    nombre: "Saltos verticales simples",
    pool: "PLIO-BAJO",
    tips: [
      "Carga rápido y salta hacia arriba, brazos ayudan",
      "Aterriza con rodillas flexionadas, suave"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "tobillo_agudo"],
    edadMinima: 12
  },
  {
    id: 72,
    nombre: "Saltos laterales sobre línea",
    pool: "PLIO-BAJO",
    tips: [
      "Saltos pequeños y rápidos de lado a lado"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable"],
    edadMinima: 12
  },
  {
    id: 73,
    nombre: "Saltos adelante cortos",
    pool: "PLIO-BAJO",
    tips: [
      "Impulso horizontal controlado, aterriza estable"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 74,
    nombre: "Mini saltos pogos",
    pool: "PLIO-BAJO",
    tips: [
      "Saltos muy cortos desde los tobillos, mínima flexión de rodilla"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_agudo"],
    edadMinima: 12
  },
  {
    id: 79,
    nombre: "Saltos en escalera tipo 'quick feet'",
    pool: "PLIO-BAJO",
    tips: [
      "Pies rápidos a través de la escalera"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 83,
    nombre: "Salto caja baja",
    pool: "PLIO-BAJO",
    tips: [
      "Salta a caja baja, aterriza suave con dos pies"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  
  // --- PLIO-MEDIO: Media intensidad ---
  {
    id: 76,
    nombre: "Saltos unipodales suaves",
    pool: "PLIO-MEDIO",
    tips: [
      "Saltos sobre una pierna, aterriza controlado"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 14
  },
  {
    id: 78,
    nombre: "Repeticiones salto a banco",
    pool: "PLIO-MEDIO",
    tips: [
      "Saltos consecutivos al banco, minimiza tiempo de contacto"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 14
  },
  {
    id: 80,
    nombre: "Boundings (saltos largos)",
    pool: "PLIO-MEDIO",
    tips: [
      "Zancadas saltadas largas alternando piernas"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "rodilla_aguda"],
    edadMinima: 14
  },
  {
    id: 81,
    nombre: "Lateral bounds (patinador)",
    pool: "PLIO-MEDIO",
    tips: [
      "Saltos laterales amplios de pierna a pierna"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_inestable", "rodilla_aguda"],
    edadMinima: 14
  },
  {
    id: 82,
    nombre: "Sprint + salto reactivo",
    pool: "PLIO-MEDIO",
    tips: [
      "Sprint corto terminando en salto explosivo"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo", "rodilla_aguda"],
    edadMinima: 14
  },
  
  // --- PLIO-ALTO: Alta intensidad ---
  {
    id: 75,
    nombre: "Caídas y saltos (drop jump)",
    pool: "PLIO-ALTO",
    tips: [
      "Cae desde altura baja, rebota inmediatamente al tocar suelo"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "tobillo_agudo"],
    edadMinima: 16
  },
  {
    id: 77,
    nombre: "Depth jumps",
    pool: "PLIO-ALTO",
    tips: [
      "Caída desde cajón + salto máximo inmediato"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "tobillo_agudo"],
    edadMinima: 16
  },
  {
    id: 84,
    nombre: "Salto caja alta (seguro)",
    pool: "PLIO-ALTO",
    tips: [
      "Salta a caja alta, aterriza con dos pies arriba"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 16
  },
  {
    id: 85,
    nombre: "Drop jump desde cajón",
    pool: "PLIO-ALTO",
    tips: [
      "Caída controlada desde cajón + salto vertical máximo"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda", "tobillo_agudo"],
    edadMinima: 16
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ISOMÉTRICOS (86-95)
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 86,
    nombre: "Wall sit",
    pool: "ISO-INFERIOR",
    tips: [
      "Espalda contra pared, rodillas 90º, aguanta posición"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 87,
    nombre: "Isometría en sentadilla 90º",
    pool: "ISO-INFERIOR",
    tips: [
      "Mantén posición baja de sentadilla sin apoyo"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 88,
    nombre: "Isometría zancada",
    pool: "ISO-INFERIOR",
    tips: [
      "Mantén posición baja de zancada sin movimiento"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 10
  },
  {
    id: 89,
    nombre: "Isometría gemelo en punta",
    pool: "ISO-INFERIOR",
    tips: [
      "De puntillas, mantén la posición elevada"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_agudo"],
    edadMinima: 10
  },
  {
    id: 90,
    nombre: "Isometría puente de glúteo",
    pool: "ISO-INFERIOR",
    tips: [
      "Puente de glúteo arriba, mantén posición"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 91,
    nombre: "Isometría femoral 'Nordic hold'",
    pool: "ISO-INFERIOR",
    tips: [
      "Posición de nordic curl, aguanta en ángulo intermedio"
    ],
    videoUrl: null,
    lesionesContra: ["isquios_agudo"],
    edadMinima: 14
  },
  {
    id: 92,
    nombre: "Plancha frontal",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Cuerpo recto de cabeza a talones, no hundas cadera"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 93,
    nombre: "Plancha lateral",
    pool: "CORE-ANTI-LAT",
    tips: [
      "Cadera elevada, cuerpo en línea recta lateral"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  {
    id: 94,
    nombre: "Isometría de remo con banda",
    pool: "ISO-SUPERIOR",
    tips: [
      "Tira de la banda y mantén la posición de remo"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  {
    id: 95,
    nombre: "Hollow hold",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Lumbar pegada al suelo, piernas y brazos extendidos"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 12
  },
  
  // ═══════════════════════════════════════════════════════════════
  // CORE / ESTABILIDAD / PREVENCIÓN (96-115)
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 96,
    nombre: "Plancha frontal",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Mantén línea recta, activa glúteos y abdomen"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 97,
    nombre: "Plancha lateral",
    pool: "CORE-ANTI-LAT",
    tips: [
      "Apilado de hombro-cadera-tobillo"
    ],
    videoUrl: null,
    lesionesContra: ["hombro_agudo"],
    edadMinima: 10
  },
  {
    id: 98,
    nombre: "Dead bug",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Lumbar siempre pegada al suelo, movimiento controlado"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 99,
    nombre: "Bird dog",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Extiende brazo y pierna contrarios manteniendo estabilidad"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 100,
    nombre: "Hollow rock",
    pool: "CORE-FLEX",
    tips: [
      "Balancea manteniendo posición hollow"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 12
  },
  {
    id: 101,
    nombre: "Russian twist",
    pool: "CORE-ROT",
    tips: [
      "Rotación controlada del tronco, pies pueden estar elevados"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 12
  },
  {
    id: 102,
    nombre: "Elevación de piernas tumbado",
    pool: "CORE-FLEX",
    tips: [
      "Lumbar pegada al suelo, baja piernas sin arquear espalda"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 12
  },
  {
    id: 103,
    nombre: "Anti-rotación con banda (Pallof)",
    pool: "CORE-ANTI-ROT",
    tips: [
      "Resiste la rotación que genera la banda"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 12
  },
  {
    id: 104,
    nombre: "Equilibrio unipodal",
    pool: "PREV-RODILLA",
    tips: [
      "Mantén equilibrio sobre una pierna, rodilla ligeramente flexionada"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 105,
    nombre: "Pase pierna por encima",
    pool: "PREV-RODILLA",
    tips: [
      "Control de cadera y rodilla al pasar obstáculo"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 106,
    nombre: "Pase pierna por debajo",
    pool: "PREV-RODILLA",
    tips: [
      "Control de flexión de cadera y rodilla"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 107,
    nombre: "Estabilidad rodilla + mini saltos",
    pool: "PREV-RODILLA",
    tips: [
      "Pequeños saltos manteniendo alineación de rodilla"
    ],
    videoUrl: null,
    lesionesContra: ["rodilla_aguda"],
    edadMinima: 12
  },
  {
    id: 108,
    nombre: "Estabilidad tobillo",
    pool: "PREV-TOBILLO",
    tips: [
      "Trabajo propioceptivo en superficies inestables si es posible"
    ],
    videoUrl: null,
    lesionesContra: ["tobillo_agudo"],
    edadMinima: 10
  },
  {
    id: 109,
    nombre: "Caminata talón-punta",
    pool: "PREV-TOBILLO",
    tips: [
      "Camina colocando talón contra punta del otro pie"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 110,
    nombre: "Trabajo multidireccional controlado",
    pool: "PREV-RODILLA",
    tips: [
      "Desplazamientos en todas direcciones a baja intensidad"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 111,
    nombre: "Skipping técnico",
    pool: "VEL-ACEL",
    tips: [
      "Skipping controlado enfatizando técnica de carrera"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 112,
    nombre: "Trap 3",
    pool: "PREV-HOMBRO",
    tips: [
      "Elevación en Y boca abajo, activa trapecio inferior"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 113,
    nombre: "Rotación torácica",
    pool: "MOV-TORACICA",
    tips: [
      "Rota la columna torácica manteniendo cadera estable"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 114,
    nombre: "Elevación escapular Y",
    pool: "PREV-HOMBRO",
    tips: [
      "Brazos en Y, eleva activando trapecio inferior y serrato"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 115,
    nombre: "Antiextensión lumbar",
    pool: "CORE-ANTI-EXT",
    tips: [
      "Resiste la extensión lumbar manteniendo core activo"
    ],
    videoUrl: null,
    lesionesContra: ["espalda_aguda"],
    edadMinima: 10
  },
  
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD (116-120)
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 116,
    nombre: "Movilidad de cadera",
    pool: "MOV-CADERA",
    tips: [
      "Rotaciones internas/externas, flexión profunda"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 117,
    nombre: "Movilidad de tobillo",
    pool: "MOV-TOBILLO",
    tips: [
      "Rodilla hacia delante manteniendo talón en suelo"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 118,
    nombre: "Rotación torácica",
    pool: "MOV-TORACICA",
    tips: [
      "Abre el pecho rotando la columna torácica"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 119,
    nombre: "Estiramiento flexores de cadera",
    pool: "MOV-CADERA",
    tips: [
      "Posición de zancada, empuja cadera hacia delante"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  },
  {
    id: 120,
    nombre: "Flow de movilidad 5'",
    pool: "MOV-FLOW",
    tips: [
      "Secuencia fluida de movimientos de movilidad general"
    ],
    videoUrl: null,
    lesionesContra: [],
    edadMinima: 10
  }
];

export default EXERCISES;
