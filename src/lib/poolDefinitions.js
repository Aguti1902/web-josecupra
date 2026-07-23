/**
 * DEPRO - Definición de Pools de Ejercicios
 * 
 * Cada pool agrupa ejercicios INTERCAMBIABLES entre sí.
 * El motor SOLO permite sustituir ejercicios dentro del mismo pool.
 * 
 * Nomenclatura: FAMILIA-PATRON-MATERIAL
 */
export const POOLS = {
  
  // ═══════════════════════════════════════════════════════════════
  // TREN SUPERIOR - EMPUJE
  // ═══════════════════════════════════════════════════════════════
  
  "EMP-HOR-SIN": {
    nombre: "Empuje horizontal sin material",
    patron: "empuje_horizontal",
    musculos: ["pectoral", "deltoides_anterior", "triceps"],
    plano: "horizontal",
    material: "sin_material",
    familia: "empuje"
  },
  
  "EMP-HOR-TRI": {
    nombre: "Empuje horizontal énfasis tríceps",
    patron: "empuje_horizontal",
    musculos: ["triceps", "pectoral"],
    plano: "horizontal",
    material: "sin_material",
    familia: "empuje"
  },
  
  "EMP-HOR-GOM": {
    nombre: "Empuje horizontal con gomas",
    patron: "empuje_horizontal",
    musculos: ["pectoral", "deltoides_anterior", "triceps"],
    plano: "horizontal",
    material: "gomas",
    familia: "empuje"
  },
  
  "EMP-HOR-MAN": {
    nombre: "Empuje horizontal con mancuernas",
    patron: "empuje_horizontal",
    musculos: ["pectoral", "deltoides_anterior", "triceps"],
    plano: "horizontal",
    material: "mancuernas",
    familia: "empuje"
  },
  
  "EMP-HOR-BAR": {
    nombre: "Empuje horizontal con barra",
    patron: "empuje_horizontal",
    musculos: ["pectoral", "deltoides_anterior", "triceps"],
    plano: "horizontal",
    material: "barra",
    familia: "empuje"
  },
  
  "EMP-VER-SIN": {
    nombre: "Empuje vertical sin material",
    patron: "empuje_vertical",
    musculos: ["deltoides_anterior", "deltoides_medio", "triceps"],
    plano: "vertical",
    material: "sin_material",
    familia: "empuje"
  },
  
  "EMP-VER-MAN": {
    nombre: "Empuje vertical con mancuernas",
    patron: "empuje_vertical",
    musculos: ["deltoides_anterior", "deltoides_medio", "triceps"],
    plano: "vertical",
    material: "mancuernas",
    familia: "empuje"
  },
  
  "EMP-LAT-MAN": {
    nombre: "Elevación lateral con mancuernas",
    patron: "abduccion_hombro",
    musculos: ["deltoides_medio"],
    plano: "frontal",
    material: "mancuernas",
    familia: "empuje"
  },
  // ═══════════════════════════════════════════════════════════════
  // TREN SUPERIOR - TRACCIÓN
  // ═══════════════════════════════════════════════════════════════
  
  "TRAC-VER-SIN": {
    nombre: "Tracción vertical sin material",
    patron: "traccion_vertical",
    musculos: ["dorsal", "biceps", "romboides"],
    plano: "vertical",
    material: "sin_material",
    familia: "traccion"
  },
  
  "TRAC-HOR-GOM": {
    nombre: "Tracción horizontal con gomas",
    patron: "traccion_horizontal",
    musculos: ["dorsal", "biceps", "romboides", "trapecio"],
    plano: "horizontal",
    material: "gomas",
    familia: "traccion"
  },
  
  "TRAC-HOR-MAN": {
    nombre: "Tracción horizontal con mancuernas",
    patron: "traccion_horizontal",
    musculos: ["dorsal", "biceps", "romboides", "trapecio"],
    plano: "horizontal",
    material: "mancuernas",
    familia: "traccion"
  },
  
  "TRAC-HOR-BAR": {
    nombre: "Tracción horizontal con barra",
    patron: "traccion_horizontal",
    musculos: ["dorsal", "biceps", "romboides", "trapecio"],
    plano: "horizontal",
    material: "barra",
    familia: "traccion"
  },
  
  "TRAC-PRONE-SIN": {
    nombre: "Extensión dorsal en prono",
    patron: "extension_columna",
    musculos: ["erectores", "dorsal", "gluteo"],
    plano: "sagital",
    material: "sin_material",
    familia: "traccion"
  },
  // ═══════════════════════════════════════════════════════════════
  // TREN INFERIOR - DOMINANTE DE RODILLA (Cuádriceps)
  // ═══════════════════════════════════════════════════════════════
  
  "ROD-BI-SIN": {
    nombre: "Rodilla bilateral sin material",
    patron: "sentadilla",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "bilateral",
    dominancia: "rodilla",
    material: "sin_material",
    familia: "rodilla"
  },
  
  "ROD-BI-GOM": {
    nombre: "Rodilla bilateral con gomas",
    patron: "sentadilla",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "bilateral",
    dominancia: "rodilla",
    material: "gomas",
    familia: "rodilla"
  },
  
  "ROD-BI-MAN": {
    nombre: "Rodilla bilateral con mancuernas",
    patron: "sentadilla",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "bilateral",
    dominancia: "rodilla",
    material: "mancuernas",
    familia: "rodilla"
  },
  
  "ROD-BI-BAR": {
    nombre: "Rodilla bilateral con barra",
    patron: "sentadilla",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "bilateral",
    dominancia: "rodilla",
    material: "barra",
    familia: "rodilla"
  },
  
  "ROD-BI-MAQ": {
    nombre: "Rodilla bilateral en máquina",
    patron: "prensa",
    musculos: ["cuadriceps", "gluteo"],
    lateralidad: "bilateral",
    dominancia: "rodilla",
    material: "maquina",
    familia: "rodilla"
  },
  
  "ROD-UNI-SIN": {
    nombre: "Rodilla unilateral sin material",
    patron: "zancada",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "unilateral",
    dominancia: "rodilla",
    material: "sin_material",
    familia: "rodilla"
  },
  
  "ROD-UNI-MAN": {
    nombre: "Rodilla unilateral con mancuernas",
    patron: "zancada",
    musculos: ["cuadriceps", "gluteo", "isquios"],
    lateralidad: "unilateral",
    dominancia: "rodilla",
    material: "mancuernas",
    familia: "rodilla"
  },
  // ═══════════════════════════════════════════════════════════════
  // TREN INFERIOR - DOMINANTE DE CADERA (Isquios/Glúteo)
  // ═══════════════════════════════════════════════════════════════
  
  "CAD-BI-SIN": {
    nombre: "Cadera bilateral sin material",
    patron: "hip_hinge",
    musculos: ["isquios", "gluteo", "erectores"],
    lateralidad: "bilateral",
    dominancia: "cadera",
    material: "sin_material",
    familia: "cadera"
  },
  
  "CAD-BI-GOM": {
    nombre: "Cadera bilateral con gomas",
    patron: "hip_hinge",
    musculos: ["isquios", "gluteo"],
    lateralidad: "bilateral",
    dominancia: "cadera",
    material: "gomas",
    familia: "cadera"
  },
  
  "CAD-BI-MAN": {
    nombre: "Cadera bilateral con mancuernas",
    patron: "hip_hinge",
    musculos: ["isquios", "gluteo", "erectores"],
    lateralidad: "bilateral",
    dominancia: "cadera",
    material: "mancuernas",
    familia: "cadera"
  },
  
  "CAD-BI-BAR": {
    nombre: "Cadera bilateral con barra",
    patron: "hip_hinge",
    musculos: ["isquios", "gluteo", "erectores"],
    lateralidad: "bilateral",
    dominancia: "cadera",
    material: "barra",
    familia: "cadera"
  },
  
  "CAD-BI-MAQ": {
    nombre: "Cadera bilateral en máquina",
    patron: "curl_femoral",
    musculos: ["isquios"],
    lateralidad: "bilateral",
    dominancia: "cadera",
    material: "maquina",
    familia: "cadera"
  },
  
  "CAD-UNI-SIN": {
    nombre: "Cadera unilateral sin material",
    patron: "hip_hinge_unilateral",
    musculos: ["isquios", "gluteo"],
    lateralidad: "unilateral",
    dominancia: "cadera",
    material: "sin_material",
    familia: "cadera"
  },
  
  "CAD-UNI-MAN": {
    nombre: "Cadera unilateral con mancuernas",
    patron: "hip_hinge_unilateral",
    musculos: ["isquios", "gluteo"],
    lateralidad: "unilateral",
    dominancia: "cadera",
    material: "mancuernas",
    familia: "cadera"
  },
  // ═══════════════════════════════════════════════════════════════
  // TREN INFERIOR - GLÚTEO AISLADO
  // ═══════════════════════════════════════════════════════════════
  
  "GLU-SIN": {
    nombre: "Glúteo aislado sin material",
    patron: "extension_cadera",
    musculos: ["gluteo"],
    dominancia: "cadera",
    material: "sin_material",
    familia: "gluteo"
  },
  
  "GLU-GOM": {
    nombre: "Glúteo aislado con gomas",
    patron: "extension_cadera",
    musculos: ["gluteo"],
    dominancia: "cadera",
    material: "gomas",
    familia: "gluteo"
  },
  
  "GLU-MAN": {
    nombre: "Glúteo aislado con mancuernas",
    patron: "hip_thrust",
    musculos: ["gluteo"],
    dominancia: "cadera",
    material: "mancuernas",
    familia: "gluteo"
  },
  // ═══════════════════════════════════════════════════════════════
  // TREN INFERIOR - GEMELOS
  // ═══════════════════════════════════════════════════════════════
  
  "GEM-SIN": {
    nombre: "Gemelos sin material",
    patron: "flexion_plantar",
    musculos: ["gemelo", "soleo"],
    material: "sin_material",
    familia: "gemelo"
  },
  
  "GEM-MAQ": {
    nombre: "Gemelos en máquina",
    patron: "flexion_plantar",
    musculos: ["gemelo", "soleo"],
    material: "maquina",
    familia: "gemelo"
  },
  // ═══════════════════════════════════════════════════════════════
  // CORE - ANTIEXTENSIÓN (Plancha frontal, dead bug, etc.)
  // ═══════════════════════════════════════════════════════════════
  
  "CORE-ANTI-EXT": {
    nombre: "Core antiextensión",
    patron: "antiextension",
    musculos: ["recto_abdominal", "transverso"],
    funcion: "estabilizacion",
    material: "sin_material",
    familia: "core"
  },
  // ═══════════════════════════════════════════════════════════════
  // CORE - ANTIFLEXIÓN LATERAL (Plancha lateral)
  // ═══════════════════════════════════════════════════════════════
  
  "CORE-ANTI-LAT": {
    nombre: "Core antiflexión lateral",
    patron: "antiflexion_lateral",
    musculos: ["oblicuos", "cuadrado_lumbar"],
    funcion: "estabilizacion",
    material: "sin_material",
    familia: "core"
  },
  // ═══════════════════════════════════════════════════════════════
  // CORE - ANTIROTACIÓN (Pallof press)
  // ═══════════════════════════════════════════════════════════════
  
  "CORE-ANTI-ROT": {
    nombre: "Core antirotación",
    patron: "antirotacion",
    musculos: ["oblicuos", "transverso"],
    funcion: "estabilizacion",
    material: "gomas",
    familia: "core"
  },
  // ═══════════════════════════════════════════════════════════════
  // CORE - FLEXIÓN (Crunch, elevación piernas)
  // ═══════════════════════════════════════════════════════════════
  
  "CORE-FLEX": {
    nombre: "Core flexión",
    patron: "flexion_tronco",
    musculos: ["recto_abdominal"],
    funcion: "dinamico",
    material: "sin_material",
    familia: "core"
  },
  // ═══════════════════════════════════════════════════════════════
  // CORE - ROTACIÓN (Russian twist)
  // ═══════════════════════════════════════════════════════════════
  
  "CORE-ROT": {
    nombre: "Core rotación",
    patron: "rotacion",
    musculos: ["oblicuos"],
    funcion: "dinamico",
    material: "sin_material",
    familia: "core"
  },
  // ═══════════════════════════════════════════════════════════════
  // PREVENCIÓN - HOMBRO
  // ═══════════════════════════════════════════════════════════════
  
  "PREV-HOMBRO": {
    nombre: "Prevención hombro",
    zona: "hombro",
    musculos: ["manguito_rotador", "trapecio_inferior", "serrato"],
    funcion: "prevencion",
    material: "gomas",
    familia: "prevencion"
  },
  // ═══════════════════════════════════════════════════════════════
  // PREVENCIÓN - RODILLA
  // ═══════════════════════════════════════════════════════════════
  
  "PREV-RODILLA": {
    nombre: "Prevención rodilla",
    zona: "rodilla",
    musculos: ["vmo", "isquios", "gluteo_medio"],
    funcion: "prevencion",
    material: "sin_material",
    familia: "prevencion"
  },
  // ═══════════════════════════════════════════════════════════════
  // PREVENCIÓN - TOBILLO
  // ═══════════════════════════════════════════════════════════════
  
  "PREV-TOBILLO": {
    nombre: "Prevención tobillo",
    zona: "tobillo",
    musculos: ["peroneos", "tibial_anterior"],
    funcion: "prevencion",
    material: "sin_material",
    familia: "prevencion"
  },
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD - CADERA
  // ═══════════════════════════════════════════════════════════════
  
  "MOV-CADERA": {
    nombre: "Movilidad cadera",
    zona: "cadera",
    tipo: "movilidad",
    material: "sin_material",
    familia: "movilidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD - TOBILLO
  // ═══════════════════════════════════════════════════════════════
  
  "MOV-TOBILLO": {
    nombre: "Movilidad tobillo",
    zona: "tobillo",
    tipo: "movilidad",
    material: "sin_material",
    familia: "movilidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD - COLUMNA TORÁCICA
  // ═══════════════════════════════════════════════════════════════
  
  "MOV-TORACICA": {
    nombre: "Movilidad torácica",
    zona: "columna_toracica",
    tipo: "movilidad",
    material: "sin_material",
    familia: "movilidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // MOVILIDAD - FLOW GENERAL
  // ═══════════════════════════════════════════════════════════════
  
  "MOV-FLOW": {
    nombre: "Flow movilidad general",
    zona: "general",
    tipo: "movilidad",
    material: "sin_material",
    familia: "movilidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD - ACELERACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  "VEL-ACEL": {
    nombre: "Aceleración",
    patron: "aceleracion",
    distancia: "0-15m",
    intensidad: "alta",
    material: "sin_material",
    familia: "velocidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD - VELOCIDAD MÁXIMA (Sprints)
  // ═══════════════════════════════════════════════════════════════
  
  "VEL-SPRINT": {
    nombre: "Sprint velocidad máxima",
    patron: "velocidad_maxima",
    distancia: "20-60m",
    intensidad: "alta",
    material: "sin_material",
    familia: "velocidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD - CAMBIO DE DIRECCIÓN (COD)
  // ═══════════════════════════════════════════════════════════════
  
  "VEL-COD": {
    nombre: "Cambio de dirección",
    patron: "cod",
    intensidad: "alta",
    material: "sin_material",
    familia: "velocidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // VELOCIDAD - REACCIÓN
  // ═══════════════════════════════════════════════════════════════
  
  "VEL-REAC": {
    nombre: "Reacción",
    patron: "reaccion",
    intensidad: "media",
    material: "sin_material",
    familia: "velocidad"
  },
  // ═══════════════════════════════════════════════════════════════
  // PLIOMETRÍA - BAJA INTENSIDAD
  // ═══════════════════════════════════════════════════════════════
  
  "PLIO-BAJO": {
    nombre: "Pliometría baja intensidad",
    intensidad: "baja",
    tipo: "pliometria",
    edadMinima: 12,
    material: "sin_material",
    familia: "pliometria"
  },
  // ═══════════════════════════════════════════════════════════════
  // PLIOMETRÍA - MEDIA INTENSIDAD
  // ═══════════════════════════════════════════════════════════════
  
  "PLIO-MEDIO": {
    nombre: "Pliometría media intensidad",
    intensidad: "media",
    tipo: "pliometria",
    edadMinima: 14,
    experienciaMinima: "intermedio",
    material: "sin_material",
    familia: "pliometria"
  },
  // ═══════════════════════════════════════════════════════════════
  // PLIOMETRÍA - ALTA INTENSIDAD
  // ═══════════════════════════════════════════════════════════════
  
  "PLIO-ALTO": {
    nombre: "Pliometría alta intensidad",
    intensidad: "alta",
    tipo: "pliometria",
    edadMinima: 16,
    experienciaMinima: "avanzado",
    material: "sin_material",
    familia: "pliometria"
  },
  // ═══════════════════════════════════════════════════════════════
  // ISOMÉTRICOS - TREN INFERIOR
  // ═══════════════════════════════════════════════════════════════
  
  "ISO-INFERIOR": {
    nombre: "Isométrico tren inferior",
    patron: "isometrico",
    zona: "tren_inferior",
    material: "sin_material",
    familia: "isometrico"
  },
  // ═══════════════════════════════════════════════════════════════
  // ISOMÉTRICOS - TREN SUPERIOR
  // ═══════════════════════════════════════════════════════════════
  
  "ISO-SUPERIOR": {
    nombre: "Isométrico tren superior",
    patron: "isometrico",
    zona: "tren_superior",
    material: "gomas",
    familia: "isometrico"
  },
  // ═══════════════════════════════════════════════════════════════
  // FUNCIONAL - CARRY (Farmer walk, etc.)
  // ═══════════════════════════════════════════════════════════════
  
  "FUNC-CARRY": {
    nombre: "Loaded carry",
    patron: "carry",
    musculos: ["core", "trapecio", "antebrazo"],
    material: "mancuernas",
    familia: "funcional"
  }
};
// ═══════════════════════════════════════════════════════════════
// REGLAS DE COMPATIBILIDAD ENTRE POOLS
// ═══════════════════════════════════════════════════════════════
export const POOL_COMPATIBILITY = {
  // Pools del mismo patrón biomecánico que pueden sustituirse
  // si el material del usuario lo permite
  
  empuje_horizontal: ["EMP-HOR-SIN", "EMP-HOR-TRI", "EMP-HOR-GOM", "EMP-HOR-MAN", "EMP-HOR-BAR"],
  empuje_vertical: ["EMP-VER-SIN", "EMP-VER-MAN"],
  traccion_horizontal: ["TRAC-HOR-GOM", "TRAC-HOR-MAN", "TRAC-HOR-BAR"],
  traccion_vertical: ["TRAC-VER-SIN"],
  
  rodilla_bilateral: ["ROD-BI-SIN", "ROD-BI-GOM", "ROD-BI-MAN", "ROD-BI-BAR", "ROD-BI-MAQ"],
  rodilla_unilateral: ["ROD-UNI-SIN", "ROD-UNI-MAN"],
  
  cadera_bilateral: ["CAD-BI-SIN", "CAD-BI-GOM", "CAD-BI-MAN", "CAD-BI-BAR", "CAD-BI-MAQ"],
  cadera_unilateral: ["CAD-UNI-SIN", "CAD-UNI-MAN"],
  
  gluteo: ["GLU-SIN", "GLU-GOM", "GLU-MAN"],
  gemelo: ["GEM-SIN", "GEM-MAQ"],
  
  core_estabilizacion: ["CORE-ANTI-EXT", "CORE-ANTI-LAT", "CORE-ANTI-ROT"],
  core_dinamico: ["CORE-FLEX", "CORE-ROT"],
  
  pliometria: ["PLIO-BAJO", "PLIO-MEDIO", "PLIO-ALTO"]
};

export default POOLS;
