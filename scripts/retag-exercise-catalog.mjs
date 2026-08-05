/**
 * Migración de taxonomía DEPRO: carpetas, grupo_principal, acción secundaria,
 * reglas de clasificación y 15 isométricos nuevos.
 * No toca playerPlanEngine ni coachEngine.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXERCISES } from "../src/lib/exerciseCatalog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/lib/exerciseCatalog.js");

const FOLDERS = [
  "fuerza_tren_inferior",
  "fuerza_tren_superior",
  "velocidad",
  "pliometria",
  "core",
  "prevencion",
  "movilidad",
];

const MUSCLE_MAP = {
  hombro_completo: "hombros",
  hombro: "hombros",
  rodilla: "cuadriceps", // rodilla no es grupo_principal válido; mapear a contexto
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

function mapMuscle(g) {
  if (!g) return g;
  return MUSCLE_MAP[g] || g;
}

/** Overrides explícitos por nombre (función real > músculo accesorio). */
const NAME_RULES = [
  {
    test: /isometr[ií]a de remo|remo.*isometr|isometr.*remo/i,
    patch: {
      carpeta: "fuerza_tren_superior",
      objetivo: ["fuerza"],
      segmento: "tren_superior",
      patron: ["traccion", "isometrico"],
      grupo_principal: "espalda",
      accion_secundaria: ["estabilidad_escapular"],
      rol: "complementario",
    },
  },
  {
    test: /^bird dog$/i,
    patch: {
      carpeta: "core",
      objetivo: ["core"],
      segmento: "core",
      patron: ["isometrico"],
      grupo_principal: "core",
      accion_secundaria: ["estabilidad_lumbopelvica"],
      rol: "core",
    },
  },
  {
    test: /^dead bug$/i,
    patch: {
      carpeta: "core",
      objetivo: ["core"],
      segmento: "core",
      patron: ["isometrico"],
      grupo_principal: "core",
      accion_secundaria: ["estabilidad_lumbopelvica", "control_motor"],
      rol: "core",
    },
  },
  {
    test: /plancha.*toque.*hombro|toque de hombro/i,
    patch: {
      carpeta: "core",
      objetivo: ["core"],
      segmento: "core",
      patron: ["isometrico"],
      grupo_principal: "core",
      accion_secundaria: ["estabilidad_hombro"],
      rol: "core",
    },
  },
  {
    test: /y-?t-?w/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_superior",
      patron: ["traccion", "isometrico"],
      grupo_principal: "escapular",
      accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
      rol: "complementario",
    },
  },
  {
    test: /rotadores externos/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_superior",
      patron: ["isometrico", "analitico"],
      grupo_principal: "hombros",
      accion_secundaria: ["estabilidad_hombro", "prevencion_hombro"],
      rol: "complementario",
    },
  },
  {
    test: /equilibrio unipodal|balance unipodal/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_inferior",
      patron: ["isometrico"],
      grupo_principal: "tobillo",
      accion_secundaria: ["equilibrio", "prevencion_tobillo"],
      rol: "complementario",
    },
  },
  {
    test: /talon.?punta|talón.?punta/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_inferior",
      patron: ["isometrico"],
      grupo_principal: "tobillo",
      accion_secundaria: ["equilibrio", "prevencion_tobillo"],
      rol: "complementario",
    },
  },
  {
    test: /apoyo monopodal.*alcance|unipodal.*alcance|alcance multidireccional/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_inferior",
      patron: ["isometrico"],
      grupo_principal: "tobillo",
      accion_secundaria: ["equilibrio", "control_motor", "prevencion_tobillo"],
      rol: "complementario",
    },
  },
  {
    test: /trap\s*3/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_superior",
      patron: ["traccion", "isometrico"],
      grupo_principal: "escapular",
      accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"],
      rol: "complementario",
    },
  },
  {
    test: /copenhagen/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion"],
      segmento: "tren_inferior",
      patron: ["isometrico"],
      grupo_principal: "aductores",
      accion_secundaria: ["prevencion_rodilla", "estabilidad_lumbopelvica"],
      rol: "complementario",
    },
  },
  {
    test: /monster walk/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion", "fuerza"],
      segmento: "tren_inferior",
      patron: ["analitico"],
      grupo_principal: "gluteos",
      accion_secundaria: ["prevencion_rodilla", "control_motor"],
      rol: "complementario",
    },
  },
  {
    test: /lateral walk/i,
    patch: {
      carpeta: "prevencion",
      objetivo: ["prevencion", "fuerza"],
      segmento: "tren_inferior",
      patron: ["analitico"],
      grupo_principal: "gluteos",
      accion_secundaria: ["prevencion_rodilla"],
      rol: "complementario",
    },
  },
  {
    test: /farmer walk|farmer carry/i,
    patch: {
      carpeta: "fuerza_tren_superior",
      objetivo: ["fuerza"],
      segmento: "full_body",
      patron: ["isometrico", "cadena_posterior"],
      grupo_principal: "core",
      accion_secundaria: ["estabilidad_lumbopelvica", "estabilidad_escapular"],
      rol: "complementario",
    },
  },
  {
    test: /marcha a\b|skipping a\b/i,
    patch: {
      carpeta: "velocidad",
      objetivo: ["velocidad"],
      segmento: "tren_inferior",
      patron: ["aceleracion"],
      grupo_principal: "cuadriceps",
      accion_secundaria: ["control_motor"],
      rol: "calentamiento",
    },
  },
  {
    test: /plancha frontal|plancha lateral|hollow hold|pallof|antiextensi[oó]n|antirotaci[oó]n|bear plank|dead bug|bird dog/i,
    patch: {
      carpeta: "core",
      objetivo: ["core"],
      segmento: "core",
      grupo_principal: "core",
      rol: "core",
    },
    soft: true, // no pisa si ya hay override más específico
  },
];

const RENAME = {
  // v2 no tenía genéricos graves; renombres de claridad
  "Y-T-W (hombro) en suelo": "Y-T-W escapular en suelo",
  "Movilidad de hombro Y-T-W con banda": "Y-T-W con banda (movilidad escapular)",
  "Antiextensión lumbar (dead bug controlado)": "Dead bug controlado (antiextensión)",
  "Skipping técnico en sitio": "Skipping técnico A en sitio",
  "Técnica de carrera": "Técnica de carrera (marcha A / drills)",
};

function inferCarpeta(et, nombre) {
  const obj = et.objetivo || [];
  const pat = et.patron || [];
  const seg = et.segmento;
  const n = norm(nombre);

  if (obj.includes("movilidad") || /movilidad|90\/90|rock back|wall slides/.test(n)) return "movilidad";
  if (obj.includes("core") || seg === "core" || /plancha|dead bug|bird dog|pallof|hollow|bear plank/.test(n)) return "core";
  if (obj.includes("prevencion") || /equilibrio|copenhagen|trap 3|y-?t-?w|rotadores/.test(n)) return "prevencion";
  if (obj.includes("pliometria") || pat.includes("pliometria") || /pogo|salto|drop jump|bound/.test(n)) return "pliometria";
  if (obj.includes("velocidad") || pat.some((p) => ["aceleracion", "velocidad_pura", "COD", "reaccion"].includes(p))) {
    return "velocidad";
  }
  if (seg === "tren_superior" || pat.some((p) => ["empuje", "traccion"].includes(p))) return "fuerza_tren_superior";
  if (seg === "tren_inferior" || pat.some((p) => ["cadena_anterior", "cadena_posterior"].includes(p))) {
    return "fuerza_tren_inferior";
  }
  if (seg === "full_body") return "fuerza_tren_inferior";
  return "fuerza_tren_inferior";
}

function normalizeObjetivo(obj, carpeta, patron) {
  let o = uniq(obj).filter((x) => x !== "isometrico"); // isometrico es patrón, no objetivo
  // pliometria como objetivo → fuerza + carpeta pliometria; mantener si carpeta es pliometria
  if (o.includes("pliometria")) {
    o = o.filter((x) => x !== "pliometria");
    if (!o.includes("fuerza")) o.push("fuerza");
  }
  if (carpeta === "core" && !o.includes("core")) o = uniq(["core", ...o.filter((x) => x !== "fuerza")]);
  if (carpeta === "prevencion" && !o.includes("prevencion")) o = uniq(["prevencion", ...o]);
  if (carpeta === "movilidad" && !o.includes("movilidad")) o = ["movilidad"];
  if (carpeta === "velocidad" && !o.includes("velocidad")) o = uniq(["velocidad", ...o.filter((x) => x !== "fuerza")]);
  if (carpeta === "pliometria" && !o.includes("fuerza")) o.push("fuerza");
  if (!o.length) o = ["fuerza"];
  return o;
}

function inferGrupoPrincipal(et, carpeta) {
  const muscles = (et.grupo_muscular || []).map(mapMuscle);
  if (et.grupo_principal) return mapMuscle(et.grupo_principal);
  if (carpeta === "core") return "core";
  if (muscles.length) {
    // Prefer non-accessory: espalda over biceps, core over others when core carpeta
    const preferred = ["espalda", "pecho", "cuadriceps", "isquios", "gluteos", "core", "escapular", "hombros", "aductores", "gemelo", "tobillo", "cadera", "espalda_baja"];
    for (const p of preferred) {
      if (muscles.includes(p)) return p;
    }
    return muscles[0];
  }
  if (carpeta === "movilidad") return "cadera";
  if (carpeta === "velocidad") return "cuadriceps";
  if (carpeta === "pliometria") return "gluteos";
  return carpeta === "fuerza_tren_superior" ? "espalda" : "cuadriceps";
}

function applySoftCore(ex, patch) {
  const n = norm(ex.nombre);
  if (!/plancha|dead bug|bird dog|pallof|hollow|antiextensi|antirotaci|bear plank/.test(n)) return null;
  return patch;
}

function transformExercise(ex) {
  const renamed = RENAME[ex.nombre] || ex.nombre;
  let et = { ...ex.etiquetas };
  let carpeta = null;
  let accion = [];
  let hard = false;

  for (const rule of NAME_RULES) {
    if (!rule.test.test(renamed) && !rule.test.test(ex.nombre)) continue;
    if (rule.soft) {
      const soft = applySoftCore({ nombre: renamed }, rule.patch);
      if (!soft || hard) continue;
      carpeta = carpeta || soft.carpeta;
      et = {
        ...et,
        objetivo: soft.objetivo || et.objetivo,
        segmento: soft.segmento || et.segmento,
        grupo_principal: soft.grupo_principal || et.grupo_principal,
        rol: soft.rol || et.rol,
        patron: et.patron?.includes("isometrico") || /hold|isometr|plancha|dead bug|bird dog|pallof/i.test(renamed)
          ? uniq([...(et.patron || []), "isometrico"])
          : et.patron,
      };
      if (soft.accion_secundaria) accion = uniq([...accion, ...soft.accion_secundaria]);
      continue;
    }
    hard = true;
    const p = rule.patch;
    carpeta = p.carpeta;
    et = {
      ...et,
      objetivo: p.objetivo || et.objetivo,
      segmento: p.segmento || et.segmento,
      patron: p.patron || et.patron,
      rol: p.rol || et.rol,
      grupo_principal: p.grupo_principal,
      material: et.material,
      intensidad: et.intensidad,
      experiencia: et.experiencia,
      contraindicado: et.contraindicado,
    };
    accion = uniq([...(p.accion_secundaria || [])]);
    break;
  }

  if (!carpeta) carpeta = inferCarpeta(et, renamed);
  et.objetivo = normalizeObjetivo(et.objetivo, carpeta, et.patron);
  const grupoPrincipal = inferGrupoPrincipal(et, carpeta);

  // Isométricos: asegurar patrón
  if (/isometr|hold|plancha|wall sit|dead bug|bird dog|pallof|equilibrio/i.test(renamed)) {
    et.patron = uniq([...(et.patron || []), "isometrico"]);
  }

  // grupo_muscular solo primario (evita remo→bíceps)
  et.grupo_principal = grupoPrincipal;
  et.grupo_muscular = [grupoPrincipal];
  if (accion.length) et.accion_secundaria = accion;

  // Limpiar objetivo duplicado con carpeta
  if (carpeta === "pliometria") {
    et.patron = uniq([...(et.patron || []), "pliometria"]);
  }

  return {
    ...ex,
    nombre: renamed,
    carpeta,
    etiquetas: {
      material: et.material || ["sin_material"],
      objetivo: et.objetivo,
      segmento: et.segmento || (carpeta === "core" ? "core" : carpeta.startsWith("fuerza_tren_superior") ? "tren_superior" : carpeta === "movilidad" ? "full_body" : "tren_inferior"),
      patron: uniq(et.patron || []),
      rol: et.rol || "complementario",
      grupo_principal: grupoPrincipal,
      grupo_muscular: [grupoPrincipal],
      ...(et.accion_secundaria?.length ? { accion_secundaria: et.accion_secundaria } : {}),
      intensidad: et.intensidad || "media",
      experiencia: et.experiencia || ["intermedio"],
      material: et.material || ["sin_material"],
      contraindicado: et.contraindicado || [],
    },
  };
}

function makeIso({ id, nombre, carpeta, segmento, patron, grupo_principal, accion_secundaria, material, rol, pool, objetivo }) {
  return {
    id,
    nombre,
    nuevo: true,
    carpeta,
    etiquetas: {
      material: material || ["sin_material"],
      objetivo: objetivo || (carpeta === "core" ? ["core"] : carpeta === "prevencion" ? ["prevencion"] : ["fuerza"]),
      segmento,
      patron: uniq([...(patron || []), "isometrico"]),
      rol: rol || "complementario",
      grupo_principal,
      grupo_muscular: [grupo_principal],
      ...(accion_secundaria ? { accion_secundaria } : {}),
      intensidad: "media",
      experiencia: ["novato", "intermedio"],
      material: material || ["sin_material"],
      contraindicado: [],
    },
    tips: [
      "Mantén la postura durante toda la serie",
      "Controla la respiración sin perder la tensión",
      "Calidad de posición por encima del tiempo",
    ],
    pool: pool || (carpeta === "core" ? "CORE-ANTI-EXT" : carpeta.includes("superior") ? "ISO-SUPERIOR" : "ISO-INFERIOR"),
    videoUrl: "",
    lesionesContra: [],
    edadMinima: 12,
  };
}

const NEW_ISOS = [
  makeIso({ id: 168, nombre: "Split squat hold", carpeta: "fuerza_tren_inferior", segmento: "tren_inferior", patron: ["cadena_anterior", "isometrico"], grupo_principal: "cuadriceps", accion_secundaria: ["control_motor"] }),
  makeIso({ id: 169, nombre: "Puente de glúteo unilateral isométrico", carpeta: "fuerza_tren_inferior", segmento: "tren_inferior", patron: ["cadena_posterior", "isometrico"], grupo_principal: "gluteos" }),
  makeIso({ id: 170, nombre: "Wall sit unilateral", carpeta: "fuerza_tren_inferior", segmento: "tren_inferior", patron: ["cadena_anterior", "isometrico"], grupo_principal: "cuadriceps" }),
  makeIso({ id: 171, nombre: "Isometría aductores con balón", carpeta: "prevencion", segmento: "tren_inferior", patron: ["isometrico"], grupo_principal: "aductores", accion_secundaria: ["prevencion_rodilla"], objetivo: ["prevencion"] }),
  makeIso({ id: 172, nombre: "Copenhagen hold básico", carpeta: "prevencion", segmento: "tren_inferior", patron: ["isometrico"], grupo_principal: "aductores", accion_secundaria: ["prevencion_rodilla"], objetivo: ["prevencion"] }),
  makeIso({ id: 173, nombre: "Copenhagen hold medio", carpeta: "prevencion", segmento: "tren_inferior", patron: ["isometrico"], grupo_principal: "aductores", accion_secundaria: ["prevencion_rodilla"], objetivo: ["prevencion"] }),
  makeIso({ id: 174, nombre: "Isometría isquios supino talones en banco", carpeta: "fuerza_tren_inferior", segmento: "tren_inferior", patron: ["cadena_posterior", "isometrico"], grupo_principal: "isquios" }),
  makeIso({ id: 175, nombre: "Press isométrico pared unilateral", carpeta: "fuerza_tren_superior", segmento: "tren_superior", patron: ["empuje", "isometrico"], grupo_principal: "pecho", accion_secundaria: ["estabilidad_hombro"] }),
  makeIso({ id: 176, nombre: "Rotación externa isométrica con banda", carpeta: "prevencion", segmento: "tren_superior", patron: ["isometrico", "analitico"], grupo_principal: "hombros", material: ["gomas"], accion_secundaria: ["prevencion_hombro", "estabilidad_hombro"], objetivo: ["prevencion"] }),
  makeIso({ id: 177, nombre: "Serrato wall hold", carpeta: "prevencion", segmento: "tren_superior", patron: ["isometrico"], grupo_principal: "escapular", accion_secundaria: ["estabilidad_escapular", "prevencion_hombro"], objetivo: ["prevencion"] }),
  makeIso({ id: 178, nombre: "Dead bug hold", carpeta: "core", segmento: "core", patron: ["isometrico"], grupo_principal: "core", accion_secundaria: ["estabilidad_lumbopelvica"], rol: "core", objetivo: ["core"] }),
  makeIso({ id: 179, nombre: "Bear plank hold", carpeta: "core", segmento: "core", patron: ["isometrico"], grupo_principal: "core", accion_secundaria: ["estabilidad_lumbopelvica"], rol: "core", objetivo: ["core"] }),
  makeIso({ id: 180, nombre: "Pallof hold", carpeta: "core", segmento: "core", patron: ["isometrico"], grupo_principal: "core", material: ["gomas"], accion_secundaria: ["estabilidad_lumbopelvica"], rol: "core", objetivo: ["core"] }),
  makeIso({ id: 181, nombre: "Drop landing + hold", carpeta: "pliometria", segmento: "tren_inferior", patron: ["pliometria", "isometrico"], grupo_principal: "cuadriceps", accion_secundaria: ["prevencion_rodilla", "control_motor"], objetivo: ["fuerza"] }),
  makeIso({ id: 182, nombre: "Skater landing hold", carpeta: "pliometria", segmento: "tren_inferior", patron: ["pliometria", "isometrico"], grupo_principal: "gluteos", accion_secundaria: ["prevencion_rodilla", "equilibrio"], objetivo: ["fuerza"] }),
];

// Añadir plancha con toque hombro si no existe
const EXTRA_IF_MISSING = [
  makeIso({
    id: 183,
    nombre: "Plancha con toque de hombro",
    carpeta: "core",
    segmento: "core",
    patron: ["isometrico"],
    grupo_principal: "core",
    accion_secundaria: ["estabilidad_hombro"],
    rol: "core",
    objetivo: ["core"],
  }),
  {
    id: 184,
    nombre: "Marcha A",
    nuevo: true,
    carpeta: "velocidad",
    etiquetas: {
      material: ["sin_material"],
      objetivo: ["velocidad"],
      segmento: "tren_inferior",
      patron: ["aceleracion"],
      rol: "calentamiento",
      grupo_principal: "cuadriceps",
      grupo_muscular: ["cuadriceps"],
      accion_secundaria: ["control_motor"],
      intensidad: "baja",
      experiencia: ["novato", "intermedio"],
      contraindicado: [],
    },
    tips: ["Ritmo controlado", "Rodilla alta y pie activo", "Tronco estable"],
    pool: "VEL-GEN",
    videoUrl: "",
    lesionesContra: [],
    edadMinima: 10,
  },
];

const transformed = EXERCISES.map(transformExercise);
const names = new Set(transformed.map((e) => norm(e.nombre)));
const toAdd = [...NEW_ISOS];
for (const ex of EXTRA_IF_MISSING) {
  if (!names.has(norm(ex.nombre))) toAdd.push(ex);
}
// Avoid duplicate new isos by name
const finalAdd = toAdd.filter((e) => !names.has(norm(e.nombre)));
const all = [...transformed, ...finalAdd];

// Stats
const byFolder = {};
for (const e of all) byFolder[e.carpeta] = (byFolder[e.carpeta] || 0) + 1;
const renamed = EXERCISES.filter((e) => RENAME[e.nombre]).map((e) => ({ from: e.nombre, to: RENAME[e.nombre] }));

const header = `/**
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
`;

const body = `${header}export const EXERCISES = ${JSON.stringify(all, null, 2)};

export const CATALOG_CARPETAS = ${JSON.stringify(FOLDERS, null, 2)};

export default EXERCISES;
`;

fs.writeFileSync(OUT, body);
fs.writeFileSync(
  path.join(__dirname, "../src/data/catalogRetagReport.json"),
  JSON.stringify(
    {
      total: all.length,
      previous: EXERCISES.length,
      added: finalAdd.map((e) => e.nombre),
      renamed,
      deleted: [],
      byFolder,
      folders: FOLDERS,
    },
    null,
    2,
  ),
);

console.log("Wrote", all.length, "exercises");
console.log("byFolder", byFolder);
console.log("added", finalAdd.map((e) => e.nombre));
console.log("renamed", renamed.length);
