/**
 * Construye el catálogo definitivo Depro 2.0 §9.6 + variantes con vídeo compartido.
 * Uso: node scripts/build-definitive-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXERCISES as PREV } from "../src/lib/exerciseCatalog.js";

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

/** Listado definitivo §9.6 (duplicados unificados; T-test marcado como test). */
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

/** Variantes extra que reutilizan el mismo vídeo de carrera continua. */
const RESISTENCIA_VARIANTS = [
  "Carrera continua zona 2",
  "Carrera continua regenerativa",
  "Series umbral controlado",
  "Intervalos anaeróbicos cortos",
  "Fartlek controlado",
  "Carrera continua en cinta",
];

/** Variantes de velocidad que reutilizan vídeo de aceleración / sprint / COD. */
const VELOCIDAD_VARIANTS = [
  { nombre: "Aceleraciones 20 m", videoGroup: "vel_acel" },
  { nombre: "Aceleraciones 30 m", videoGroup: "vel_acel" },
  { nombre: "Salidas desde pie", videoGroup: "vel_acel" },
  { nombre: "Sprint 10 m", videoGroup: "vel_sprint" },
  { nombre: "Sprint 15 m", videoGroup: "vel_sprint" },
  { nombre: "COD 5-10-5 reactivo", videoGroup: "vel_cod" },
  { nombre: "COD 4 conos", videoGroup: "vel_cod" },
  { nombre: "Zig-zag 4 conos", videoGroup: "vel_cod" },
];

/** Vídeos compartidos por familia (mismo URL = mismo recurso audiovisual). */
const SHARED_VIDEOS = {
  res_continua: "https://www.youtube.com/watch?v=6jU8nQ8x0yI",
  vel_acel: "https://www.youtube.com/watch?v=2L2W3nY4v8A",
  vel_sprint: "https://www.youtube.com/watch?v=n5Q5q9n7Q0E",
  vel_cod: "https://www.youtube.com/watch?v=cQqf8n-5bQ4",
  vel_reaccion: "https://www.youtube.com/watch?v=3PqgN9q_0ZQ",
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

const prevByName = new Map(PREV.map((e) => [norm(e.nombre), e]));

function inferMaterial(nombre) {
  const n = norm(nombre);
  if (/maquina|prensa|polea|multipower|rowerg|skierg|bikeerg|haka/.test(n)) return ["maquina"];
  if (/barra|hexagonal|multipower|press banca|press inclinado barra|press militar/.test(n)) return ["barra"];
  if (/mancuerna|goblet|arnold|fondos en banco \+/.test(n)) return ["mancuernas"];
  if (/goma|banda|elastica|pallof|monster walk|lateral walk/.test(n)) return ["gomas"];
  if (/bosu/.test(n)) return ["bosu"];
  if (/trineo/.test(n)) return ["trineo"];
  return ["sin_material"];
}

/** Overrides explícitos para nombres frágiles del listado §9.6. */
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
    patron: ["isometrico", "analitico"],
    rol: "complementario",
    grupo_principal: "hombros",
    material: ["gomas"],
    accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
    pool: "PREV-HOMBRO",
    intensidad: "baja",
  },
};

function inferTags(nombre) {
  const n = norm(nombre);
  const material = inferMaterial(nombre);
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
  let esTest = false;

  const ov = NAME_OVERRIDES[n];
  if (ov) {
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
        intensidad: ov.intensidad || intensidad,
        experiencia,
        contraindicado: ov.contraindicado || [],
      },
      pool: ov.pool || "GEN",
      videoGroup: ov.videoGroup || null,
      esTest: false,
      lesionesContra: ov.contraindicado || [],
      edadMinima: 10,
    };
  }

  // ── Resistencia ──
  if (/carrera continua|rowerg|skierg|bikeerg|umbral|intervalo|fartlek|trineo/.test(n) && !/salto|sprint|acelera/.test(n)) {
    carpeta = "resistencia";
    objetivo = ["resistencia"];
    segmento = "tren_inferior";
    patron = [/umbral|intervalo|fartlek|trineo/.test(n) ? "anaerobico" : "aerobico"];
    if (/umbral/.test(n)) patron = ["umbral"];
    if (/intervalo|anaerob/.test(n)) patron = ["anaerobico"];
    rol = "basico";
    grupo_principal = "cuadriceps";
    intensidad = /regenerativa|zona 2|continua(?!.*umbral)/.test(n) ? "baja" : "media";
    pool = "RES-GEN";
    if (/carrera continua|umbral|intervalo|fartlek|cinta/.test(n)) videoGroup = "res_continua";
  }
  // ── Velocidad / COD / reacción ──
  else if (/acelera|sprint|salida|cod |zig.?zag|reacci[oó]n|drill pared|skipping|curveado|frenada/.test(n) && !/salto|bound|pogo|caja|depth|drop jump/.test(n)) {
    carpeta = "velocidad";
    objetivo = ["velocidad"];
    segmento = "tren_inferior";
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
    rol = "basico";
    grupo_principal = "cuadriceps";
    contraindicado = ["lesion_tobillo", "lesion_rodilla"];
  }
  // ── Pliometría ──
  else if (/salto|pogo|bound|depth|drop jump|ca[ií]das y saltos|quick feet|coordinaci[oó]n/.test(n)) {
    carpeta = /coordinaci[oó]n/.test(n) ? "velocidad" : "pliometria";
    objetivo = /coordinaci[oó]n/.test(n) ? ["velocidad"] : ["fuerza"];
    segmento = "tren_inferior";
    patron = /coordinaci[oó]n/.test(n) ? ["aceleracion"] : ["pliometria"];
    rol = "complementario";
    grupo_principal = "cuadriceps";
    intensidad = "alta";
    pool = /coordinaci[oó]n/.test(n) ? "VEL-COORD" : "PLIO-GEN";
    contraindicado = ["lesion_rodilla", "lesion_tobillo"];
    if (/coordinaci[oó]n/.test(n)) accion_secundaria = ["control_motor"];
  }
  // ── Core ──
  else if (/plancha|dead bug|bird dog|hollow|russian|pallof|anti.?rotaci|antiextensi|elevaci[oó]n de piernas|inch worm|nordic hold|isometr[ií]a femoral/.test(n)) {
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
  }
  // ── Movilidad ──
  else if (/movilidad|rotaci[oó]n tor[aá]cica|perro gato|estiramiento flexores|pase pierna/.test(n)) {
    carpeta = "movilidad";
    objetivo = ["movilidad"];
    segmento = /tor[aá]cica|escapular|perro gato/.test(n) ? "tren_superior" : "tren_inferior";
    patron = ["movilidad"];
    rol = "calentamiento";
    grupo_principal = /cadera|flexores|pase pierna/.test(n) ? "cadera"
      : /tobillo/.test(n) ? "tobillo"
      : /tor[aá]cica|perro gato|escapular/.test(n) ? "espalda"
      : "cadera";
    pool = "MOV-GEN";
    intensidad = "baja";
  }
  // ── Prevención / equilibrio ──
  else if (/equilibrio|estabilidad|caminata tal[oó]n|multidireccional|y[\s\-]?t[\s\-]?w|rotadores externos|elevaci[oó]n escapular|superman/.test(n)) {
    carpeta = "prevencion";
    objetivo = ["prevencion"];
    segmento = /y[\s\-]?t[\s\-]?w|rotadores|escapular|superman/.test(n) ? "tren_superior" : "tren_inferior";
    patron = ["isometrico"];
    rol = "complementario";
    grupo_principal = /y[\s\-]?t[\s\-]?w|escapular/.test(n) ? "escapular"
      : /rotadores|hombro/.test(n) ? "hombros"
      : /rodilla/.test(n) ? "cuadriceps"
      : "tobillo";
    accion_secundaria = /equilibrio|caminata|bosu|l[ií]nea/.test(n)
      ? ["equilibrio", "prevencion_tobillo"]
      : /y[\s\-]?t[\s\-]?w|rotadores|escapular/.test(n)
        ? ["estabilidad_escapular", "prevencion_hombro"]
        : ["prevencion_rodilla"];
    pool = "PREV-GEN";
    intensidad = "baja";
  }
  // ── Isometría de remo (antes del branch genérico remo/press) ──
  else if (/isometr.*remo|remo.*isometr/.test(n)) {
    carpeta = "fuerza_tren_superior";
    objetivo = ["fuerza"];
    segmento = "tren_superior";
    patron = ["traccion", "isometrico"];
    rol = "complementario";
    grupo_principal = "espalda";
    pool = "ISO-REMO";
    intensidad = "media";
  }
  // ── Analíticos bíceps / tríceps / gemelos ──
  else if (/curl b[ií]ceps/.test(n)) {
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
    patron = ["analitico"];
    rol = "complementario";
    grupo_principal = "gemelos";
    pool = "AN-GEMELOS";
  }
  // ── Tren superior empuje/tracción ──
  else if (/flexiones|press|jal[oó]n|remo|dominadas|aperturas|elevaciones laterales|elevaci[oó]n frontal|abducci[oó]n pectoral|cruces pecho/.test(n)) {
    carpeta = "fuerza_tren_superior";
    objetivo = ["fuerza"];
    segmento = "tren_superior";
    if (/remo|jal[oó]n|dominadas/.test(n)) {
      patron = ["traccion"];
      grupo_principal = "espalda";
      pool = "TS-TRACCION";
    } else if (/elevaciones laterales|elevaci[oó]n frontal|arnold|pica|hombros/.test(n)) {
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
  }
  // ── Tren inferior fuerza ──
  else {
    carpeta = "fuerza_tren_inferior";
    objetivo = ["fuerza"];
    segmento = "tren_inferior";
    if (/isometr|wall sit/.test(n)) {
      patron = uniq([...(patron.includes("cadena_posterior") ? ["cadena_posterior"] : /puente|glute/.test(n) ? ["cadena_posterior"] : ["cadena_anterior"]), "isometrico"]);
      if (/gemelo/.test(n)) grupo_principal = "gemelos";
      else if (/glute|puente/.test(n)) grupo_principal = "gluteos";
      else if (!/farmer/.test(n)) grupo_principal = grupo_principal || "cuadriceps";
      rol = "complementario";
      pool = pool.startsWith("ISO") ? pool : "ISO-INF";
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
    } else if (/farmer/.test(n)) {
      carpeta = "fuerza_tren_superior";
      segmento = "full_body";
      patron = ["isometrico", "cadena_posterior"];
      grupo_principal = "core";
      accion_secundaria = ["estabilidad_lumbopelvica"];
      rol = "complementario";
      pool = "ISO-CARRY";
    } else {
      patron = ["cadena_anterior"];
      grupo_principal = "cuadriceps";
      pool = "TI-ANT";
    }
    if (/sentadilla|zancada|prensa|step/.test(n)) contraindicado = uniq([...contraindicado, "lesion_rodilla"]);
    if (/peso muerto|barra/.test(n)) contraindicado = uniq([...contraindicado, "lesion_espalda"]);
    intensidad = /isometr|wall sit/.test(n) ? "media" : "alta";
  }

  // Overrides desde catálogo previo si existe match
  const prev = prevByName.get(norm(nombre));
  if (prev?.etiquetas) {
    // Preferir inferencia nueva para carpeta resistencia/velocidad; conservar pool útil
    if (prev.pool && pool === "GEN") pool = prev.pool;
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
    esTest,
    lesionesContra: contraindicado,
    edadMinima: carpeta === "pliometria" || /sprint|acelera|barra/.test(n) ? 14 : 10,
  };
}

function buildTips(nombre, tags) {
  const n = norm(nombre);
  const tips = [];
  if (tags.carpeta === "resistencia") {
    tips.push("Mantén un ritmo sostenible y respiración controlada");
    tips.push("Postura erguida, mirada al frente y zancada eficiente");
    tips.push("Ajusta la intensidad según la zona prevista (no aceleres de más)");
  } else if (tags.carpeta === "velocidad") {
    tips.push("Salida explosiva con apoyo completo del pie");
    tips.push("Tronco estable y brazos activos en oposición");
    tips.push("Prioriza calidad técnica antes que volumen");
  } else if (tags.carpeta === "pliometria") {
    tips.push("Aterriza suave, rodillas alineadas con los pies");
    tips.push("Contacto breve con el suelo; rebote reactivo");
    tips.push("Si aparece dolor articular, reduce altura o volumen");
  } else if (tags.carpeta === "core") {
    tips.push("Neutraliza la lumbar: no arquees ni hundas la cadera");
    tips.push("Respira sin perder la tensión del tronco");
    tips.push("Calidad de posición por encima del tiempo o las reps");
  } else if (tags.carpeta === "movilidad") {
    tips.push("Rango cómodo: no fuerces hasta el dolor");
    tips.push("Movimiento lento y controlado en ambas direcciones");
    tips.push("Combina con respiración profunda");
  } else if (tags.carpeta === "prevencion") {
    tips.push("Controla el equilibrio antes de aumentar dificultad");
    tips.push("Mantén alineación rodilla-tobillo-cadera");
    tips.push("Si pierdes la postura, reduce el estímulo");
  } else if (/biceps|triceps|gemelos/.test(tags.etiquetas.grupo_principal)) {
    tips.push("Aísla el músculo objetivo sin balanceo");
    tips.push("Controla la fase excéntrica 2–3 segundos");
    tips.push("Elige un peso que permita técnica limpia");
  } else {
    tips.push("Mantén la columna neutra y el core activo");
    tips.push("Controla el movimiento en ambas fases");
    tips.push("No sacrifiques técnica por carga");
  }
  if (/unilateral|1 pierna|split|b[uú]lgara|zancada/.test(n)) {
    tips[1] = "Equilibra ambos lados; empieza por el más débil";
  }
  if (/barra|mancuerna|maquina/.test(n)) {
    tips.push("Calienta la articulación principal antes de series pesadas");
  }
  return tips.slice(0, 4);
}

function buildDescripcion(nombre, tags) {
  const carpeta = tags.carpeta;
  const musculo = tags.etiquetas.grupo_principal;
  const material = (tags.etiquetas.material || []).join(", ");
  const map = {
    fuerza_tren_inferior: `Ejercicio de fuerza de tren inferior orientado a ${musculo}. Material: ${material}. Ejecuta con control y rango completo seguro.`,
    fuerza_tren_superior: `Ejercicio de fuerza de tren superior orientado a ${musculo}. Material: ${material}. Prioriza trayectoria estable y escápulas controladas.`,
    velocidad: `Drill de velocidad/agilidad. Enfocado en ${tags.etiquetas.patron?.[0] || "aceleración"}. Recupera bien entre repeticiones para mantener calidad.`,
    resistencia: `Trabajo de resistencia (${tags.etiquetas.patron?.[0] || "aeróbico"}). Regula la intensidad según el objetivo de la sesión; el vídeo de carrera continua aplica a esta familia.`,
    pliometria: `Ejercicio pliométrico para potencia y reactividad. Aterrizaje suave y alineación de rodilla. Material: ${material}.`,
    core: `Ejercicio de core para estabilidad del tronco (${tags.etiquetas.patron?.[0] || "control"}). Mantén pelvis neutra durante todo el estímulo.`,
    prevencion: `Ejercicio preventivo/propioceptivo centrado en ${musculo}. Mejora control motor y reduce riesgo de lesión.`,
    movilidad: `Movilidad articular enfocada en ${musculo}. Usa rangos cómodos y respiración constante.`,
  };
  return map[carpeta] || `Ejercicio: ${nombre}.`;
}

function makeExercise(id, nombre, extra = {}) {
  const inferred = inferTags(nombre);
  const videoGroup = extra.videoGroup || inferred.videoGroup;
  const videoUrl = videoGroup && SHARED_VIDEOS[videoGroup] ? SHARED_VIDEOS[videoGroup] : (extra.videoUrl || "");
  const tags = { ...inferred, ...extra };
  if (extra.etiquetas) tags.etiquetas = { ...inferred.etiquetas, ...extra.etiquetas };
  if (extra.carpeta) tags.carpeta = extra.carpeta;

  const tips = buildTips(nombre, tags);
  const descripcion = buildDescripcion(nombre, tags);

  return {
    id,
    nombre,
    nuevo: false,
    etiquetas: tags.etiquetas,
    tips,
    descripcion,
    pool: tags.pool || "GEN",
    videoUrl,
    ...(videoGroup ? { videoGroup } : {}),
    lesionesContra: tags.lesionesContra || tags.etiquetas.contraindicado || [],
    edadMinima: tags.edadMinima ?? 10,
    carpeta: tags.carpeta,
    ...(tags.esTest || extra.esTest ? { esTest: true } : {}),
  };
}

// Build list
const names = [];
const seen = new Set();
for (const n of DEFINITIVE) {
  const k = norm(n);
  if (seen.has(k)) continue;
  seen.add(k);
  names.push(n);
}
for (const n of RESISTENCIA_VARIANTS) {
  const k = norm(n);
  if (seen.has(k)) continue;
  seen.add(k);
  names.push(n);
}
for (const v of VELOCIDAD_VARIANTS) {
  const k = norm(v.nombre);
  if (seen.has(k)) continue;
  seen.add(k);
  names.push(v.nombre);
}

const velocityExtraMap = Object.fromEntries(VELOCIDAD_VARIANTS.map((v) => [norm(v.nombre), v.videoGroup]));

const exercises = names.map((nombre, i) => {
  const id = i + 1;
  const extra = {};
  if (velocityExtraMap[norm(nombre)]) extra.videoGroup = velocityExtraMap[norm(nombre)];
  // T-test no está en DEFINITIVE ya; si aparece como COD test legacy:
  if (/^t.?test$/i.test(nombre)) extra.esTest = true;
  return makeExercise(id, nombre, extra);
});

// Ensure carrera continua family all share video
for (const ex of exercises) {
  if (ex.videoGroup === "res_continua" || /carrera continua|umbral|intervalo anaerob|fartlek/.test(norm(ex.nombre))) {
    ex.videoGroup = "res_continua";
    ex.videoUrl = SHARED_VIDEOS.res_continua;
    ex.carpeta = "resistencia";
    if (!ex.etiquetas.objetivo.includes("resistencia")) {
      ex.etiquetas.objetivo = ["resistencia"];
    }
  }
}

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
 * - Listado alineado a Prompt final Depro 2.0 §9.6 + variantes con vídeo compartido
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
console.log("With shared video:", exercises.filter((e) => e.videoUrl).length);
console.log("With descripcion:", exercises.filter((e) => e.descripcion).length);
