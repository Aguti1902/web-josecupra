/**
 * Catálogo definitivo Depro 2.0 §9.6 — solo listado del documento.
 * Sin inventados, sin genéricos externos (Skipping A/B/C viven en EXTRA y se excluyen).
 * Uso: node scripts/build-definitive-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/lib/exerciseCatalog.js");

const FOLDERS = [
  "fuerza_tren_inferior",
  "fuerza_tren_superior",
  "velocidad",
  "resistencia",
  "pliometria",
  "core",
  "prevencion",
  "movilidad",
];

/**
 * Listado §9.6 (duplicados unificados; T-test excluido por ser test).
 * Nombres tal cual el documento salvo tipografías obvias (comillas tipográficas).
 */
const DEFINITIVE = [
  "Sentadilla clásica",
  "Sentadilla brazos arriba",
  "Sentadilla isométrica en pared (Wall sit)",
  "Zancada adelante",
  "Zancada atrás",
  "Zancada lateral",
  "Split squat (estático)",
  "Hip thrust unilateral (peso corporal)",
  "Step-up en banco",
  "Puente de glúteo 2 piernas",
  "Sentadilla con goma en rodillas",
  "Glute bridge con goma",
  "Lateral walk con banda elástica",
  "Monster walk",
  "Extensión isquios tumbado con banda",
  "Sentadilla con mancuernas",
  "Zancada con mancuernas",
  "Peso muerto rumano con mancuernas",
  "Peso muerto a 1 pierna (mancuerna)",
  "Step-up pesado con mancuernas",
  "Sentadilla goblet",
  "Hip thrust con mancuerna",
  "Sentadilla búlgara con mancuernas",
  "Buenos días con mancuernas",
  "Farmer walk corto (10-20 m)",
  "Sentadilla con barra trasera",
  "Peso muerto convencional con barra",
  "Prensa inclinada",
  "Curl femoral tumbado en máquina",
  "Elevación de gemelos en máquina",
  "Extensión de cuádriceps en máquina",
  "Curl femoral sentado",
  "Elevación de gemelos de pie",
  "Flexiones clásicas",
  "Flexiones estrechas (tríceps)",
  "Flexiones pica (hombros)",
  "Flexiones con apertura amplia",
  "Tríceps fondo en banco",
  "Dominadas asistidas",
  "Superman",
  "Y-T-W en suelo",
  "Remo con banda elástica",
  "Press con banda elástica",
  "Aperturas con banda",
  "Rotadores externos de hombro con goma",
  "Press con mancuernas",
  "Remo con mancuerna",
  "Elevaciones laterales",
  "Elevación frontal",
  "Press Arnold",
  "Fondos en banco + mancuerna",
  "Press banca con barra",
  "Remo con barra",
  "Aceleraciones 10 m",
  "Aceleraciones 15 m",
  "Salidas desde rodilla",
  "Salidas laterales",
  "Aceleración jogging → sprint",
  "Sprint progresivo 10-20-30",
  "Sprint 20 m",
  "Sprint 30 m",
  "Sprint 40 m",
  "Sprint 60 m",
  "COD 5-10-5",
  "COD 3 conos",
  "Zig-zag 6 conos",
  "COD reacción (start visual)",
  "COD planta-pivote derecha/izquierda",
  "Reacción visual (flechas/colores)",
  "Reacción auditiva",
  "Sprint + frenada",
  "Sprint curveado",
  "Saltos verticales simples",
  "Saltos laterales sobre línea",
  "Saltos adelante cortos",
  "Mini saltos pogos",
  "Caídas y saltos (drop jump)",
  "Saltos unipodales suaves",
  "Depth jumps",
  "Repeticiones salto a banco",
  "Saltos en escalera tipo quick feet",
  "Boundings (saltos largos)",
  "Lateral bounds (patinador)",
  "Sprint + salto reactivo",
  "Salto caja baja",
  "Salto caja alta (seguro)",
  "Drop jump desde cajón",
  "Isometría en sentadilla 90°",
  "Isometría zancada",
  "Isometría gemelo en punta",
  "Isometría puente de glúteo",
  "Isometría femoral Nordic hold",
  "Plancha frontal",
  "Plancha lateral",
  "Isometría de remo con banda",
  "Hollow hold",
  "Dead bug",
  "Bird dog",
  "Hollow rock",
  "Russian twist",
  "Elevación de piernas tumbado",
  "Anti-rotación con banda (Pallof)",
  "Equilibrio unipodal",
  "Pase pierna por encima",
  "Pase pierna por debajo",
  "Estabilidad rodilla + mini saltos",
  "Estabilidad tobillo",
  "Caminata talón-punta",
  "Trabajo multidireccional controlado",
  "Skipping técnico",
  "Rotación torácica",
  "Elevación escapular Y",
  "Antiextensión lumbar",
  "Movilidad de cadera",
  "Movilidad de tobillo",
  "Estiramiento flexores de cadera",
  "Jalón al pecho",
  "Cruces pecho de pie",
  "Elevaciones laterales en polea",
  "Dominadas",
  "Remo barra",
  "Remo agarre estrecho",
  "Extensión tríceps en polea",
  "Extensión tríceps tras nuca",
  "Curl bíceps en máquina",
  "Curl bíceps alterno sentado mancuerna",
  "Curl bíceps sentado mancuernas",
  "Curl bíceps sentado declinado mancuerna",
  "Press mancuernas inclinado",
  "Extensión tríceps mancuernas en banco",
  "Remo con mancuerna en banco",
  "Remo en máquina",
  "Elevación lateral en máquina",
  "Press inclinado en máquina",
  "Press plano en máquina",
  "Abducción pectoral en máquina",
  "Jalón al pecho máquina",
  "Sentadilla en máquina inclinada (tipo haka)",
  "Prensa en máquina plana",
  "Jalón al pecho agarre neutro ancho",
  "Jalón al pecho agarre neutro estrecho",
  "Press militar en máquina de discos",
  "Remo en máquina de discos",
  "Press inclinado barra",
  "RowErg",
  "Carrera continua",
  "SkiErg",
  "BikeErg",
  "Empuje trineo",
  "Peso muerto barra hexagonal",
  "Sentadilla en multipower",
  "Salto profundo + salto al cajón",
  "Salto cajón + caigo + salto profundo",
  "Step up + rodilla arriba",
  "Perro gato movilidad torácica",
  "Equilibrio unipodal ir a tocar conos",
  "Caminar sobre línea con los ojos cerrados",
  "Equilibrio sobre BOSU",
  "Coordinación 1 pie por espacio",
  "Coordinación Dos pies por espacio",
  "Coordinación Un pie (dentro-fuera)",
  "Coordinación Dos pies dentro, uno fuera",
  "Coordinación Lateral dos dentro, dos fuera",
  "Coordinación Salto pies juntos",
  "Inch worm + plancha",
  "Nordic hold",
  "Drill pared",
];

/** Mismo vídeo solo entre ejercicios reales de la misma familia del documento. */
const SHARED_VIDEOS = {
  res_continua: "",
  res_erg: "",
  vel_acel: "",
  vel_sprint: "",
  vel_cod: "",
  vel_reaccion: "",
};

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

const NAME_OVERRIDES = {
  "y t w en suelo": {
    carpeta: "prevencion",
    objetivo: ["prevencion"],
    segmento: "tren_superior",
    patron: ["isometrico"],
    rol: "complementario",
    grupo_principal: "escapular",
    accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
    pool: "PREV-ESCAP",
    intensidad: "baja",
  },
  "superman": {
    carpeta: "prevencion",
    objetivo: ["prevencion"],
    segmento: "tren_superior",
    patron: ["isometrico"],
    rol: "complementario",
    grupo_principal: "espalda",
    accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
    pool: "PREV-GEN",
    intensidad: "baja",
  },
  "isometria de remo con banda": {
    carpeta: "fuerza_tren_superior",
    objetivo: ["fuerza"],
    segmento: "tren_superior",
    patron: ["traccion", "isometrico"],
    rol: "complementario",
    grupo_principal: "espalda",
    material: ["gomas"],
    pool: "ISO-REMO",
    intensidad: "media",
  },
  "isometria femoral nordic hold": {
    carpeta: "fuerza_tren_inferior",
    objetivo: ["fuerza", "prevencion"],
    segmento: "tren_inferior",
    patron: ["cadena_posterior", "isometrico"],
    rol: "complementario",
    grupo_principal: "isquios",
    pool: "ISO-ISQ",
    intensidad: "alta",
  },
  "nordic hold": {
    carpeta: "fuerza_tren_inferior",
    objetivo: ["fuerza", "prevencion"],
    segmento: "tren_inferior",
    patron: ["cadena_posterior", "isometrico"],
    rol: "complementario",
    grupo_principal: "isquios",
    pool: "ISO-ISQ",
    intensidad: "alta",
  },
  "farmer walk corto 10 20 m": {
    carpeta: "fuerza_tren_superior",
    objetivo: ["fuerza"],
    segmento: "full_body",
    patron: ["isometrico", "cadena_posterior"],
    rol: "complementario",
    grupo_principal: "core",
    accion_secundaria: ["estabilidad_lumbopelvica"],
    material: ["mancuernas"],
    pool: "ISO-CARRY",
    intensidad: "media",
  },
  "anti rotacion con banda pallof": {
    carpeta: "core",
    objetivo: ["core"],
    segmento: "core",
    patron: ["anti_rotacion", "isometrico"],
    rol: "core",
    grupo_principal: "core",
    material: ["gomas"],
    accion_secundaria: ["estabilidad_lumbopelvica"],
    pool: "CORE-GEN",
  },
  "rotadores externos de hombro con goma": {
    carpeta: "prevencion",
    objetivo: ["prevencion"],
    segmento: "tren_superior",
    patron: ["analitico"],
    rol: "complementario",
    grupo_principal: "hombros",
    material: ["gomas"],
    accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
    pool: "PREV-HOMBRO",
    intensidad: "baja",
  },
  "elevacion escapular y": {
    carpeta: "prevencion",
    objetivo: ["prevencion"],
    segmento: "tren_superior",
    patron: ["isometrico"],
    rol: "complementario",
    grupo_principal: "escapular",
    accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
    pool: "PREV-ESCAP",
    intensidad: "baja",
  },
  "skipping tecnico": {
    carpeta: "velocidad",
    objetivo: ["velocidad"],
    segmento: "tren_inferior",
    patron: ["aceleracion"],
    rol: "basico",
    grupo_principal: "cuadriceps",
    pool: "VEL-ACEL",
    intensidad: "media",
    videoGroup: "vel_acel",
  },
  "drill pared": {
    carpeta: "velocidad",
    objetivo: ["velocidad"],
    segmento: "tren_inferior",
    patron: ["aceleracion"],
    rol: "basico",
    grupo_principal: "cuadriceps",
    pool: "VEL-ACEL",
    intensidad: "media",
    videoGroup: "vel_acel",
  },
  "rowerg": {
    carpeta: "resistencia",
    objetivo: ["resistencia"],
    segmento: "full_body",
    patron: ["aerobico"],
    rol: "basico",
    grupo_principal: "espalda",
    material: ["maquina"],
    pool: "RES-ERG",
    videoGroup: "res_erg",
  },
  "skierg": {
    carpeta: "resistencia",
    objetivo: ["resistencia"],
    segmento: "tren_superior",
    patron: ["aerobico"],
    rol: "basico",
    grupo_principal: "espalda",
    material: ["maquina"],
    pool: "RES-ERG",
    videoGroup: "res_erg",
  },
  "bikeerg": {
    carpeta: "resistencia",
    objetivo: ["resistencia"],
    segmento: "tren_inferior",
    patron: ["aerobico"],
    rol: "basico",
    grupo_principal: "cuadriceps",
    material: ["maquina"],
    pool: "RES-ERG",
    videoGroup: "res_erg",
  },
  "carrera continua": {
    carpeta: "resistencia",
    objetivo: ["resistencia"],
    segmento: "tren_inferior",
    patron: ["aerobico"],
    rol: "basico",
    grupo_principal: "cuadriceps",
    pool: "RES-GEN",
    videoGroup: "res_continua",
    intensidad: "baja",
  },
  "empuje trineo": {
    carpeta: "resistencia",
    objetivo: ["resistencia", "fuerza"],
    segmento: "tren_inferior",
    patron: ["anaerobico"],
    rol: "basico",
    grupo_principal: "cuadriceps",
    material: ["trineo"],
    pool: "RES-POT",
    intensidad: "alta",
  },
};

function inferMaterial(nombre) {
  const n = norm(nombre);
  if (/maquina|prensa|polea|multipower|rowerg|skierg|bikeerg|haka/.test(n)) return ["maquina"];
  if (/barra|hexagonal|press banca|press inclinado barra|press militar/.test(n)) return ["barra"];
  if (/mancuerna|goblet|arnold|fondos en banco \+/.test(n)) return ["mancuernas"];
  if (/goma|banda|elastica|pallof|monster walk|lateral walk/.test(n)) return ["gomas"];
  if (/bosu/.test(n)) return ["bosu"];
  if (/trineo/.test(n)) return ["trineo"];
  return ["sin_material"];
}

function baseFromOverride(ov, material) {
  return {
    carpeta: ov.carpeta,
    etiquetas: {
      material: ov.material || material,
      objetivo: uniq(ov.objetivo),
      segmento: ov.segmento,
      patron: uniq(ov.patron),
      rol: ov.rol,
      grupo_principal: ov.grupo_principal,
      grupo_muscular: [ov.grupo_principal],
      ...(ov.accion_secundaria?.length ? { accion_secundaria: uniq(ov.accion_secundaria) } : {}),
      intensidad: ov.intensidad || "media",
      experiencia: ["novato", "intermedio", "avanzado"],
      contraindicado: ov.contraindicado || [],
    },
    pool: ov.pool || "GEN",
    videoGroup: ov.videoGroup || null,
    esTest: false,
    lesionesContra: ov.contraindicado || [],
    edadMinima: 10,
  };
}

function inferTags(nombre) {
  const n = norm(nombre);
  const material = inferMaterial(nombre);
  const ov = NAME_OVERRIDES[n];
  if (ov) return baseFromOverride(ov, material);

  let carpeta = "fuerza_tren_inferior";
  let objetivo = ["fuerza"];
  let segmento = "tren_inferior";
  let patron = ["cadena_anterior"];
  let rol = "basico";
  let grupo_principal = "cuadriceps";
  let accion_secundaria = [];
  let intensidad = "media";
  let experiencia = ["novato", "intermedio", "avanzado"];
  let contraindicado = [];
  let pool = "GEN";
  let videoGroup = null;

  if (/rowerg|skierg|bikeerg|carrera continua|empuje trineo/.test(n)) {
    carpeta = "resistencia";
    objetivo = ["resistencia"];
    patron = ["aerobico"];
    pool = "RES-GEN";
    if (/carrera continua/.test(n)) videoGroup = "res_continua";
  } else if (/acelera|sprint|salida|cod |zig.?zag|reacci|drill pared|skipping|curveado|frenada/.test(n) && !/salto|bound|pogo|caja|depth|drop jump/.test(n)) {
    carpeta = "velocidad";
    objetivo = ["velocidad"];
    if (/cod |zig|pivote|conos/.test(n)) {
      patron = ["COD"];
      videoGroup = "vel_cod";
      pool = "VEL-COD";
    } else if (/reacci/.test(n)) {
      patron = ["reaccion"];
      videoGroup = "vel_reaccion";
      pool = "VEL-REAC";
    } else if (/sprint/.test(n)) {
      patron = ["velocidad_pura"];
      videoGroup = "vel_sprint";
      pool = "VEL-SPRINT";
      intensidad = "alta";
    } else {
      patron = ["aceleracion"];
      videoGroup = "vel_acel";
      pool = "VEL-ACEL";
      intensidad = "alta";
    }
    grupo_principal = "cuadriceps";
    contraindicado = ["lesion_tobillo", "lesion_rodilla"];
  } else if (/salto|pogo|bound|depth|drop jump|ca[ií]das y saltos|quick feet/.test(n)) {
    carpeta = "pliometria";
    objetivo = ["fuerza"];
    patron = ["pliometria"];
    rol = "complementario";
    intensidad = "alta";
    pool = "PLIO-GEN";
    contraindicado = ["lesion_rodilla", "lesion_tobillo"];
  } else if (/coordinaci/.test(n)) {
    carpeta = "velocidad";
    objetivo = ["velocidad"];
    patron = ["aceleracion"];
    rol = "complementario";
    pool = "VEL-COORD";
    accion_secundaria = ["control_motor"];
  } else if (/plancha|dead bug|bird dog|hollow|russian|pallof|anti.?rotaci|antiextensi|elevaci[oó]n de piernas|inch worm/.test(n)) {
    carpeta = "core";
    objetivo = ["core"];
    segmento = "core";
    patron = /russian|twist/.test(n) ? ["anti_rotacion"] : ["isometrico"];
    if (/pallof|anti.?rotaci/.test(n)) patron = ["anti_rotacion", "isometrico"];
    if (/antiextensi|dead bug|inch worm/.test(n)) patron = ["anti_extension", "isometrico"];
    rol = "core";
    grupo_principal = "core";
    pool = "CORE-GEN";
    accion_secundaria = ["estabilidad_lumbopelvica"];
  } else if (/movilidad|rotaci[oó]n tor[aá]cica|perro gato|estiramiento flexores|pase pierna/.test(n)) {
    carpeta = "movilidad";
    objetivo = ["movilidad"];
    segmento = /tor[aá]cica|perro gato/.test(n) ? "tren_superior" : "tren_inferior";
    patron = ["movilidad"];
    rol = "calentamiento";
    grupo_principal = /cadera|flexores|pase pierna/.test(n) ? "cadera"
      : /tobillo/.test(n) ? "tobillo"
      : /tor[aá]cica|perro gato/.test(n) ? "espalda"
      : "cadera";
    pool = "MOV-GEN";
    intensidad = "baja";
  } else if (/equilibrio|estabilidad|caminata tal[oó]n|multidireccional|y[\s\-]?t[\s\-]?w|rotadores externos|elevaci[oó]n escapular|superman|caminar sobre l[ií]nea/.test(n)) {
    carpeta = "prevencion";
    objetivo = ["prevencion"];
    segmento = /y[\s\-]?t[\s\-]?w|rotadores|escapular|superman/.test(n) ? "tren_superior" : "tren_inferior";
    patron = ["isometrico"];
    rol = "complementario";
    grupo_principal = /y[\s\-]?t[\s\-]?w|escapular/.test(n) ? "escapular"
      : /rotadores|hombro/.test(n) ? "hombros"
      : /rodilla/.test(n) ? "cuadriceps"
      : "tobillo";
    accion_secundaria = /equilibrio|caminata|bosu|l[ií]nea|multidireccional/.test(n)
      ? ["equilibrio", "prevencion_tobillo"]
      : /y[\s\-]?t[\s\-]?w|rotadores|escapular/.test(n)
        ? ["estabilidad_escapular", "prevencion_hombro"]
        : ["prevencion_rodilla"];
    pool = "PREV-GEN";
    intensidad = "baja";
  } else if (/curl b[ií]ceps/.test(n)) {
    carpeta = "fuerza_tren_superior";
    objetivo = ["fuerza", "estetica"];
    segmento = "tren_superior";
    patron = ["analitico", "traccion"];
    rol = "complementario";
    grupo_principal = "biceps";
    pool = "AN-BICEPS";
  } else if (/tr[ií]ceps|fondos en banco|flexiones estrechas/.test(n)) {
    carpeta = "fuerza_tren_superior";
    objetivo = ["fuerza", "estetica"];
    segmento = "tren_superior";
    patron = ["analitico", "empuje"];
    rol = "complementario";
    grupo_principal = "triceps";
    pool = "AN-TRICEPS";
  } else if (/gemelos/.test(n)) {
    carpeta = "fuerza_tren_inferior";
    objetivo = ["fuerza"];
    segmento = "tren_inferior";
    patron = /isometr/.test(n) ? ["analitico", "isometrico"] : ["analitico"];
    rol = "complementario";
    grupo_principal = "gemelos";
    pool = "AN-GEMELOS";
  } else if (/flexiones|press|jal[oó]n|remo|dominadas|aperturas|elevaciones laterales|elevaci[oó]n frontal|abducci[oó]n pectoral|cruces pecho|elevaci[oó]n lateral/.test(n)) {
    carpeta = "fuerza_tren_superior";
    objetivo = ["fuerza"];
    segmento = "tren_superior";
    if (/remo|jal[oó]n|dominadas/.test(n)) {
      patron = /isometr/.test(n) ? ["traccion", "isometrico"] : ["traccion"];
      grupo_principal = "espalda";
      pool = "TS-TRACCION";
    } else if (/elevaciones laterales|elevaci[oó]n lateral|elevaci[oó]n frontal|arnold|pica|hombros|militar/.test(n)) {
      patron = ["empuje", "analitico"];
      grupo_principal = "hombros";
      pool = "TS-HOMBRO";
    } else {
      patron = ["empuje"];
      grupo_principal = "pecho";
      pool = "TS-EMPUJE";
    }
    rol = /flexiones cl[aá]sicas|press banca|press mancuernas|dominadas(?! asistidas)|jal[oó]n al pecho$/.test(n) ? "basico" : "complementario";
    intensidad = "alta";
    if (/hombro|press|flexiones/.test(n)) contraindicado = ["lesion_hombro"];
  } else {
    carpeta = "fuerza_tren_inferior";
    objetivo = ["fuerza"];
    segmento = "tren_inferior";
    if (/isometr|wall sit/.test(n)) {
      patron = /puente|glute|femoral|nordic|isquios/.test(n)
        ? ["cadena_posterior", "isometrico"]
        : ["cadena_anterior", "isometrico"];
      grupo_principal = /gemelo/.test(n) ? "gemelos" : /glute|puente/.test(n) ? "gluteos" : /femoral|nordic|isquios/.test(n) ? "isquios" : "cuadriceps";
      rol = "complementario";
      pool = "ISO-INF";
      intensidad = "media";
    } else if (/peso muerto|buenos d[ií]as|hip thrust|puente|glute|isquios|femoral|nordic|hexagonal/.test(n)) {
      patron = ["cadena_posterior"];
      grupo_principal = /glute|hip thrust|puente/.test(n) ? "gluteos" : "isquios";
      pool = "TI-POST";
    } else if (/zancada|split|step|b[uú]lgara|unilateral|1 pierna/.test(n)) {
      patron = ["cadena_anterior"];
      grupo_principal = "cuadriceps";
      accion_secundaria = ["control_motor"];
      rol = "complementario";
      pool = "TI-UNI";
    } else {
      patron = ["cadena_anterior"];
      grupo_principal = "cuadriceps";
      pool = "TI-ANT";
    }
    if (/sentadilla|zancada|prensa|step/.test(n)) contraindicado = uniq([...contraindicado, "lesion_rodilla"]);
    if (/peso muerto|barra/.test(n)) contraindicado = uniq([...contraindicado, "lesion_espalda"]);
    intensidad = /isometr|wall sit/.test(n) ? "media" : "alta";
  }

  return {
    carpeta,
    etiquetas: {
      material,
      objetivo: uniq(objetivo),
      segmento,
      patron: uniq(patron),
      rol,
      grupo_principal,
      grupo_muscular: [grupo_principal],
      ...(accion_secundaria.length ? { accion_secundaria: uniq(accion_secundaria) } : {}),
      intensidad,
      experiencia,
      contraindicado,
    },
    pool,
    videoGroup,
    esTest: false,
    lesionesContra: contraindicado,
    edadMinima: carpeta === "pliometria" || /sprint|acelera|barra/.test(n) ? 14 : 10,
  };
}

function buildTips(nombre, tags) {
  const n = norm(nombre);
  const tips = [];

  if (tags.carpeta === "resistencia") {
    tips.push("Mantén un ritmo sostenible según el objetivo de la sesión");
    tips.push("Postura erguida y respiración rítmica");
    tips.push("No conviertas el estímulo en sprint salvo que la sesión lo pida");
  } else if (tags.carpeta === "velocidad") {
    tips.push("Prioriza calidad técnica sobre volumen");
    tips.push("Recupera completo entre repeticiones para conservar velocidad");
    tips.push("Tronco estable y apoyos activos");
  } else if (tags.carpeta === "pliometria") {
    tips.push("Aterriza suave con rodillas alineadas sobre los pies");
    tips.push("Contacto breve con el suelo; rebote reactivo");
    tips.push("Reduce altura o volumen si aparece molestia articular");
  } else if (tags.carpeta === "core") {
    tips.push("Pelvis neutra: no arquees ni hundas la lumbar");
    tips.push("Respira sin perder la tensión del tronco");
    tips.push("Calidad de posición por encima del tiempo o las reps");
  } else if (tags.carpeta === "movilidad") {
    tips.push("Rango cómodo: no fuerces hasta el dolor");
    tips.push("Movimiento lento y controlado en ambas direcciones");
    tips.push("Combina con respiración profunda");
  } else if (tags.carpeta === "prevencion") {
    tips.push("Controla el equilibrio antes de subir dificultad");
    tips.push("Mantén alineación rodilla-tobillo-cadera");
    tips.push("Si pierdes la postura, reduce el estímulo");
  } else if (/biceps|triceps|gemelos/.test(tags.etiquetas.grupo_principal)) {
    tips.push("Aísla el músculo objetivo sin balancear el cuerpo");
    tips.push("Controla la fase excéntrica 2–3 segundos");
    tips.push("Elige una carga que permita técnica limpia");
  } else {
    tips.push("Mantén la columna neutra y el core activo");
    tips.push("Controla el movimiento en ambas fases");
    tips.push("No sacrifiques técnica por carga");
  }

  if (/sentadilla|zancada|split|prensa/.test(n)) {
    tips[0] = "Rodillas alineadas con la punta de los pies; no colapses hacia dentro";
  }
  if (/peso muerto|buenos d[ií]as|rumano|hexagonal/.test(n)) {
    tips[0] = "Cadera atrás, barra/mancuernas cerca del cuerpo, espalda neutra";
  }
  if (/remo|jal[oó]n|dominadas/.test(n)) {
    tips[0] = "Escápulas atrás y abajo; tira con la espalda, no solo con los brazos";
  }
  if (/press|flexiones/.test(n)) {
    tips[0] = "Escápulas estables; no abras en exceso los codos";
  }
  if (/plancha|hollow|pallof|dead bug|bird dog/.test(n)) {
    tips[0] = "Bloquea costillas y pelvis; evita arquear la lumbar";
  }
  if (/nordic|isometr[ií]a femoral/.test(n)) {
    tips[0] = "Desciende controlado con isquios activos; no arquees la lumbar";
    tips[1] = "Usa asistencia de compañero o anclaje seguro";
  }
  if (/carrera continua|rowerg|skierg|bikeerg/.test(n)) {
    tips[0] = "Ritmo conversacional salvo indicación contraria";
  }
  if (/cod |zig|conos|reacci/.test(n)) {
    tips[0] = "Frena con el pie exterior y mantén el centro de masa bajo";
  }
  if (/unilateral|1 pierna|split|b[uú]lgara|zancada/.test(n)) {
    tips[1] = "Equilibra ambos lados; empieza por el más débil";
  }

  return uniq(tips).slice(0, 4);
}

function buildDescripcion(nombre, tags) {
  const musculo = tags.etiquetas.grupo_principal;
  const material = (tags.etiquetas.material || []).join(", ");
  const patron = tags.etiquetas.patron?.[0] || "";
  const n = norm(nombre);

  if (tags.carpeta === "resistencia") {
    return `${nombre}: trabajo de resistencia (${patron || "aeróbico"}) centrado en ${musculo}. Material: ${material}. Regula la intensidad según el objetivo de la sesión.`;
  }
  if (tags.carpeta === "velocidad") {
    return `${nombre}: drill de velocidad/agilidad enfocado en ${patron || "aceleración"}. Recupera bien entre repeticiones para mantener calidad.`;
  }
  if (tags.carpeta === "pliometria") {
    return `${nombre}: ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: ${material}.`;
  }
  if (tags.carpeta === "core") {
    return `${nombre}: estabilidad de tronco (${patron || "control"}). Mantén pelvis neutra durante todo el estímulo.`;
  }
  if (tags.carpeta === "prevencion") {
    return `${nombre}: trabajo preventivo/propioceptivo centrado en ${musculo}. Mejora control motor y reduce riesgo de lesión.`;
  }
  if (tags.carpeta === "movilidad") {
    return `${nombre}: movilidad articular enfocada en ${musculo}. Usa rangos cómodos y respiración constante.`;
  }
  if (/isometr/.test(n)) {
    return `${nombre}: isometría de ${musculo}. Mantén la posición con tensión controlada sin compensaciones. Material: ${material}.`;
  }
  if (tags.carpeta === "fuerza_tren_superior") {
    return `${nombre}: fuerza de tren superior orientada a ${musculo} (${patron}). Material: ${material}. Prioriza trayectoria estable y escápulas controladas.`;
  }
  return `${nombre}: fuerza de tren inferior orientada a ${musculo} (${patron}). Material: ${material}. Ejecuta con control y rango completo seguro.`;
}

function makeExercise(id, nombre) {
  const tags = inferTags(nombre);
  const videoGroup = tags.videoGroup;
  const videoUrl = videoGroup && SHARED_VIDEOS[videoGroup] ? SHARED_VIDEOS[videoGroup] : "";
  return {
    id,
    nombre,
    nuevo: false,
    etiquetas: tags.etiquetas,
    tips: buildTips(nombre, tags),
    descripcion: buildDescripcion(nombre, tags),
    pool: tags.pool || "GEN",
    videoUrl,
    ...(videoGroup ? { videoGroup } : {}),
    lesionesContra: tags.lesionesContra || tags.etiquetas.contraindicado || [],
    edadMinima: tags.edadMinima ?? 10,
    carpeta: tags.carpeta,
  };
}

const seen = new Set();
const names = [];
for (const n of DEFINITIVE) {
  const k = norm(n);
  if (seen.has(k)) continue;
  seen.add(k);
  names.push(n);
}

const exercises = names.map((nombre, i) => makeExercise(i + 1, nombre));

const byFolder = {};
for (const e of exercises) byFolder[e.carpeta] = (byFolder[e.carpeta] || 0) + 1;

const header = `/**
 * DEPRO — Catálogo multi-eje de ejercicios (fuente de verdad del motor individual).
 *
 * Taxonomía:
 * - carpeta: ${FOLDERS.join(" | ")}
 * - etiquetas base: material, objetivo, segmento, patron, rol, grupo_principal, grupo_muscular, accion_secundaria?
 * - grupo_muscular = [grupo_principal] (sin músculos accesorios) para no romper el selector AND
 * - Etiquetas club_* viven en capa paralela (clubExerciseTags) y NO se usan aquí
 * - Listado alineado a Prompt final Depro 2.0 §9.6 (sin inventados; tests fuera del catálogo)
 *
 * Generado por scripts/build-definitive-catalog.mjs
 */
export const EXERCISES = ${JSON.stringify(exercises, null, 2)};

export const CATALOG_CARPETAS = ${JSON.stringify(FOLDERS, null, 2)};

export default EXERCISES;
`;

fs.writeFileSync(OUT, header);
console.log(`Wrote ${exercises.length} exercises → ${OUT}`);
console.log("By folder:", byFolder);
console.log("With tips:", exercises.filter((e) => e.tips?.length).length);
console.log("With descripcion:", exercises.filter((e) => e.descripcion).length);
console.log("Banned generics present?", exercises.some((e) => /skipping [abc]$/i.test(e.nombre)));
