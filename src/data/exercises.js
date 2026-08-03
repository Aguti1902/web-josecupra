// ═══════════════════════════════════════════════════════
// CATÁLOGO OFICIAL DE EJERCICIOS — DEPRO (doc técnico)
// Etiquetas, material y contraindicaciones según spec.
// ═══════════════════════════════════════════════════════
import { EXTRA_EXERCISES } from "./extraExercises.js";
import { getLegacyCatalogFromV2 } from "../lib/catalogAdapter.js";

const BASE_EXERCISES = [
  // ── 1. FUERZA – TREN INFERIOR ──────────────────────────
  // Sin material
  { id:"fi01", nombre:"Sentadilla clásica",          etiquetas:["fuerza","tren_inferior"],          material:"sin_material", contraindicado:["rodilla"] },
  { id:"fi02", nombre:"Sentadilla brazos arriba",    etiquetas:["fuerza","tren_inferior","movilidad"],material:"sin_material",contraindicado:["rodilla"] },
  { id:"fi03", nombre:"Sentadilla isométrica (pared)",etiquetas:["fuerza","tren_inferior","isometrico"],material:"sin_material",contraindicado:["rodilla"] },
  { id:"fi04", nombre:"Zancada adelante",            etiquetas:["fuerza","tren_inferior","gluteo"], material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"fi05", nombre:"Zancada atrás",               etiquetas:["fuerza","tren_inferior","gluteo"], material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"fi06", nombre:"Zancada lateral",             etiquetas:["fuerza","tren_inferior","movilidad"],material:"sin_material",contraindicado:["rodilla","tobillo"] },
  { id:"fi07", nombre:"Split squat (estático)",      etiquetas:["fuerza","tren_inferior","gluteo"], material:"sin_material", contraindicado:["rodilla"] },
  { id:"fi08", nombre:"Hip thrust unilateral",       etiquetas:["fuerza","gluteo"],                 material:"sin_material", contraindicado:[] },
  { id:"fi09", nombre:"Step-up en banco",            etiquetas:["fuerza","tren_inferior"],          material:"sin_material", contraindicado:["rodilla"] },
  { id:"fi10", nombre:"Puente de glúteo 2 piernas",  etiquetas:["fuerza","gluteo"],                 material:"sin_material", contraindicado:[] },
  // Gomas
  { id:"fi11", nombre:"Sentadilla con goma a rodillas",etiquetas:["fuerza","tren_inferior"],        material:"gomas",        contraindicado:["rodilla"] },
  { id:"fi12", nombre:"Glute bridge con goma",       etiquetas:["fuerza","gluteo","prevencion"],    material:"gomas",        contraindicado:[] },
  { id:"fi13", nombre:"Lateral walk banda elástica", etiquetas:["fuerza","gluteo","prevencion"],    material:"gomas",        contraindicado:[] },
  { id:"fi14", nombre:"Monster walk",                etiquetas:["fuerza","gluteo","prevencion"],    material:"gomas",        contraindicado:[] },
  { id:"fi15", nombre:"Extensión isquios en banda tumbado",etiquetas:["fuerza","tren_inferior","prevencion"],material:"gomas",contraindicado:["rodilla"] },
  // Mancuernas
  { id:"fi16", nombre:"Sentadilla con mancuernas",   etiquetas:["fuerza","tren_inferior"],          material:"mancuernas",   contraindicado:["rodilla"] },
  { id:"fi17", nombre:"Zancada con mancuernas",      etiquetas:["fuerza","tren_inferior","gluteo"], material:"mancuernas",   contraindicado:["rodilla","tobillo"] },
  { id:"fi18", nombre:"Peso muerto rumano",          etiquetas:["fuerza","tren_inferior","gluteo"], material:"mancuernas",   contraindicado:[] },
  { id:"fi19", nombre:"Peso muerto a 1 pierna",      etiquetas:["fuerza","tren_inferior","prevencion"],material:"mancuernas",contraindicado:[] },
  { id:"fi20", nombre:"Step-up pesado",              etiquetas:["fuerza","tren_inferior"],          material:"mancuernas",   contraindicado:["rodilla"] },
  { id:"fi21", nombre:"Sentadilla goblet",           etiquetas:["fuerza","tren_inferior","estetica"],material:"mancuernas",  contraindicado:["rodilla"] },
  { id:"fi22", nombre:"Hip thrust con mancuerna",    etiquetas:["fuerza","gluteo","estetica"],      material:"mancuernas",   contraindicado:[] },
  { id:"fi23", nombre:"Sentadilla búlgara",          etiquetas:["fuerza","tren_inferior","gluteo"], material:"mancuernas",   contraindicado:["rodilla","tobillo"] },
  { id:"fi24", nombre:"Buenos días con mancuernas",  etiquetas:["fuerza","tren_inferior"],          material:"mancuernas",   contraindicado:[] },
  { id:"fi25", nombre:"Farmer walk corto (10–20m)",  etiquetas:["fuerza","core"],                   material:"mancuernas",   contraindicado:[] },
  // Barra/Máquina
  { id:"fi26", nombre:"Sentadilla con barra trasera",etiquetas:["fuerza_maxima","tren_inferior"],   material:"barra",        contraindicado:["rodilla"] },
  { id:"fi27", nombre:"Peso muerto convencional",    etiquetas:["fuerza_maxima","tren_inferior"],   material:"barra",        contraindicado:[] },
  { id:"fi28", nombre:"Prensa inclinada",            etiquetas:["fuerza","tren_inferior"],          material:"maquina",      contraindicado:["rodilla"] },
  { id:"fi29", nombre:"Curl femoral tumbado",        etiquetas:["fuerza","tren_inferior","prevencion"],material:"maquina",   contraindicado:["rodilla"] },
  { id:"fi30", nombre:"Elevación gemelos máquina",   etiquetas:["fuerza","tren_inferior"],          material:"maquina",      contraindicado:["tobillo"] },

  // ── 2. FUERZA – TREN SUPERIOR ──────────────────────────
  // Sin material
  { id:"fs31", nombre:"Flexiones clásicas",          etiquetas:["fuerza","tren_superior","empuje"], material:"sin_material", contraindicado:["hombro"] },
  { id:"fs32", nombre:"Flexiones estrechas (tríceps)",etiquetas:["fuerza","tren_superior","empuje"],material:"sin_material", contraindicado:["hombro"] },
  { id:"fs33", nombre:"Flexiones pica (hombros)",    etiquetas:["fuerza","tren_superior","hombro"], material:"sin_material", contraindicado:["hombro"] },
  { id:"fs34", nombre:"Flexiones apertura wide",     etiquetas:["fuerza","tren_superior","empuje"], material:"sin_material", contraindicado:["hombro"] },
  { id:"fs35", nombre:"Tríceps fondo en banco",      etiquetas:["fuerza","tren_superior"],          material:"sin_material", contraindicado:["hombro"] },
  { id:"fs36", nombre:"Dominadas asistidas",         etiquetas:["fuerza","tren_superior","traccion"],material:"sin_material",contraindicado:["hombro"] },
  { id:"fs37", nombre:"Superman",                    etiquetas:["fuerza","tren_superior","prevencion"],material:"sin_material",contraindicado:[] },
  { id:"fs38", nombre:"Y-T-W para hombro",           etiquetas:["prevencion","hombro"],             material:"sin_material", contraindicado:[] },
  // Gomas
  { id:"fs39", nombre:"Remo banda",                  etiquetas:["fuerza","tren_superior","traccion"],material:"gomas",       contraindicado:["hombro"] },
  { id:"fs40", nombre:"Press banda",                 etiquetas:["fuerza","tren_superior","empuje"], material:"gomas",        contraindicado:["hombro"] },
  { id:"fs41", nombre:"Aperturas banda",             etiquetas:["fuerza","tren_superior"],          material:"gomas",        contraindicado:["hombro"] },
  { id:"fs42", nombre:"Rotadores externos hombro",   etiquetas:["prevencion","hombro"],             material:"gomas",        contraindicado:[] },
  // Mancuernas
  { id:"fs43", nombre:"Press mancuernas",            etiquetas:["fuerza","tren_superior","estetica","empuje"],material:"mancuernas",contraindicado:["hombro"] },
  { id:"fs44", nombre:"Remo mancuerna",              etiquetas:["fuerza","tren_superior","estetica","traccion"],material:"mancuernas",contraindicado:["hombro"] },
  { id:"fs45", nombre:"Elevaciones laterales",       etiquetas:["fuerza","tren_superior","estetica","hombro"],material:"mancuernas",contraindicado:["hombro"] },
  { id:"fs46", nombre:"Elevación frontal",           etiquetas:["fuerza","tren_superior","hombro"], material:"mancuernas",   contraindicado:["hombro"] },
  { id:"fs47", nombre:"Press Arnold",                etiquetas:["fuerza","tren_superior","estetica","hombro"],material:"mancuernas",contraindicado:["hombro"] },
  { id:"fs48", nombre:"Fondos en banco + mancuerna", etiquetas:["fuerza","tren_superior","estetica"],material:"mancuernas",  contraindicado:["hombro"] },
  // Barra/Máquina
  { id:"fs49", nombre:"Press banca",                 etiquetas:["fuerza_maxima","tren_superior","empuje"],material:"barra",   contraindicado:["hombro"] },
  { id:"fs50", nombre:"Remo barra",                  etiquetas:["fuerza_maxima","tren_superior","traccion"],material:"barra",contraindicado:["hombro"] },

  // ── 3. VELOCIDAD / ACELERACIÓN / COD ───────────────────
  // Aceleración
  { id:"v51",  nombre:"Aceleraciones 10m",            etiquetas:["velocidad","fuerza_explosiva"],   material:"campo",        contraindicado:["tobillo"] },
  { id:"v52",  nombre:"Aceleraciones 15m",            etiquetas:["velocidad","fuerza_explosiva"],   material:"campo",        contraindicado:["tobillo"] },
  { id:"v53",  nombre:"Salidas desde rodilla",        etiquetas:["velocidad","fuerza_explosiva"],   material:"campo",        contraindicado:[] },
  { id:"v54",  nombre:"Salidas laterales",            etiquetas:["velocidad"],                      material:"campo",        contraindicado:[] },
  { id:"v55",  nombre:"Aceleración desde jogging a sprint",etiquetas:["velocidad","resistencia"],   material:"campo",        contraindicado:["tobillo"] },
  { id:"v56",  nombre:"Sprint progresivo 10–20–30m",  etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },
  // Velocidad máxima
  { id:"v57",  nombre:"Sprint 20m",                   etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },
  { id:"v58",  nombre:"Sprint 30m",                   etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },
  { id:"v59",  nombre:"Sprint 40m",                   etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },
  { id:"v60",  nombre:"Sprint 60m",                   etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },
  // Cambios de dirección
  { id:"v61",  nombre:"COD 5–10–5",                   etiquetas:["velocidad","fuerza_explosiva"],   material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"v62",  nombre:"COD 3 conos",                  etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"v63",  nombre:"Zig-zag 6 conos",              etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"v64",  nombre:"T-test",                       etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"v65",  nombre:"COD reacción (start visual)",  etiquetas:["velocidad"],                      material:"campo",        contraindicado:[] },
  { id:"v66",  nombre:"COD planta-pivote D/I",        etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo","rodilla"] },
  // Reacción
  { id:"v67",  nombre:"Reacción visual (flechas)",    etiquetas:["velocidad"],                      material:"campo",        contraindicado:[] },
  { id:"v68",  nombre:"Reacción auditiva",            etiquetas:["velocidad"],                      material:"campo",        contraindicado:[] },
  { id:"v69",  nombre:"Sprint + frenada",             etiquetas:["velocidad","prevencion"],         material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"v70",  nombre:"Sprint curveado",              etiquetas:["velocidad"],                      material:"campo",        contraindicado:["tobillo"] },

  // ── 4. PLIOMETRÍA ───────────────────────────────────────
  // Básica
  { id:"p71",  nombre:"Saltos verticales simples",    etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"p72",  nombre:"Saltos laterales sobre línea", etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["tobillo"] },
  { id:"p73",  nombre:"Saltos adelante cortos",       etiquetas:["pliometria"],                     material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"p74",  nombre:"Mini saltos pogos",            etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["tobillo"] },
  { id:"p75",  nombre:"Caídas y saltos (drop jump)",  etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"p76",  nombre:"Saltos unipodales suaves",     etiquetas:["pliometria","prevencion"],        material:"sin_material", contraindicado:["tobillo"] },
  // Intermedia/avanzada
  { id:"p77",  nombre:"Depth jumps",                  etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"p78",  nombre:"Saltos a banco repetidos",     etiquetas:["pliometria","fuerza_explosiva"],  material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"p79",  nombre:"Quick feet en escalera",       etiquetas:["pliometria","velocidad"],         material:"campo",        contraindicado:["tobillo"] },
  { id:"p80",  nombre:"Boundings (saltos largos)",    etiquetas:["pliometria","velocidad"],         material:"campo",        contraindicado:["tobillo","rodilla"] },
  { id:"p81",  nombre:"Lateral bounds (patinador)",   etiquetas:["pliometria","velocidad"],         material:"campo",        contraindicado:["tobillo"] },
  { id:"p82",  nombre:"Sprint + salto reactivo",      etiquetas:["pliometria","velocidad"],         material:"campo",        contraindicado:["tobillo","rodilla"] },
  // Con material
  { id:"p83",  nombre:"Salto caja baja",              etiquetas:["pliometria","fuerza_explosiva"],  material:"casa",         contraindicado:["rodilla","tobillo"] },
  { id:"p84",  nombre:"Salto caja alta (seguro)",     etiquetas:["pliometria","fuerza_explosiva"],  material:"casa",         contraindicado:["rodilla","tobillo"] },
  { id:"p85",  nombre:"Drop jump desde cajón",        etiquetas:["pliometria","fuerza_explosiva"],  material:"casa",         contraindicado:["rodilla","tobillo"] },

  // ── 5. ISOMÉTRICOS ──────────────────────────────────────
  // Tren inferior
  { id:"i86",  nombre:"Wall sit",                     etiquetas:["isometrico","tren_inferior"],     material:"sin_material", contraindicado:["rodilla"] },
  { id:"i87",  nombre:"Isometría sentadilla 90°",     etiquetas:["isometrico","tren_inferior"],     material:"sin_material", contraindicado:["rodilla"] },
  { id:"i88",  nombre:"Isometría zancada",            etiquetas:["isometrico","tren_inferior"],     material:"sin_material", contraindicado:["rodilla","tobillo"] },
  { id:"i89",  nombre:"Isometría gemelo (punta)",     etiquetas:["isometrico","tren_inferior","prevencion"],material:"sin_material",contraindicado:["tobillo"] },
  { id:"i90",  nombre:"Isometría puente de glúteo",   etiquetas:["isometrico","gluteo","prevencion"],material:"sin_material", contraindicado:[] },
  { id:"i91",  nombre:"Isometría femoral Nordic hold",etiquetas:["isometrico","tren_inferior","prevencion"],material:"sin_material",contraindicado:["rodilla"] },
  // Tren superior/core
  { id:"i92",  nombre:"Plancha frontal",              etiquetas:["isometrico","core"],              material:"sin_material", contraindicado:[] },
  { id:"i93",  nombre:"Plancha lateral",              etiquetas:["isometrico","core"],              material:"sin_material", contraindicado:[] },
  { id:"i94",  nombre:"Isometría de remo banda",      etiquetas:["isometrico","tren_superior","traccion"],material:"gomas",   contraindicado:["hombro"] },
  { id:"i95",  nombre:"Hollow hold",                  etiquetas:["isometrico","core"],              material:"sin_material", contraindicado:[] },

  // ── 6. CORE / ESTABILIDAD / PREVENCIÓN ──────────────────
  // Core
  { id:"c96",  nombre:"Plancha frontal",              etiquetas:["core"],                           material:"sin_material", contraindicado:[] },
  { id:"c97",  nombre:"Plancha lateral",              etiquetas:["core"],                           material:"sin_material", contraindicado:[] },
  { id:"c98",  nombre:"Dead bug",                     etiquetas:["core","prevencion"],              material:"sin_material", contraindicado:[] },
  { id:"c99",  nombre:"Bird dog",                     etiquetas:["core","prevencion"],              material:"sin_material", contraindicado:[] },
  { id:"c100", nombre:"Hollow rock",                  etiquetas:["core"],                           material:"sin_material", contraindicado:[] },
  { id:"c101", nombre:"Russian twist",                etiquetas:["core"],                           material:"sin_material", contraindicado:[] },
  { id:"c102", nombre:"Elevación de piernas",         etiquetas:["core"],                           material:"sin_material", contraindicado:[] },
  { id:"c103", nombre:"Anti-rotación con banda",      etiquetas:["core","prevencion"],              material:"gomas",        contraindicado:[] },
  // Estabilidad/prevención
  { id:"c104", nombre:"Equilibrio unipodal",          etiquetas:["prevencion","tobillo"],           material:"sin_material", contraindicado:[] },
  { id:"c105", nombre:"Pase pierna por encima (cadera)",etiquetas:["movilidad","prevencion"],       material:"sin_material", contraindicado:[] },
  { id:"c106", nombre:"Pase pierna por debajo",       etiquetas:["movilidad","prevencion"],         material:"sin_material", contraindicado:[] },
  { id:"c107", nombre:"Estabilidad rodilla + mini saltos",etiquetas:["prevencion","rodilla"],       material:"sin_material", contraindicado:["rodilla"] },
  { id:"c108", nombre:"Estabilidad tobillo (alfombra)",etiquetas:["prevencion","tobillo"],          material:"casa",         contraindicado:[] },
  { id:"c109", nombre:"Caminata talón-punta",         etiquetas:["prevencion","tobillo"],           material:"sin_material", contraindicado:[] },
  { id:"c110", nombre:"Multidireccional controlado",  etiquetas:["prevencion"],                     material:"campo",        contraindicado:[] },
  { id:"c111", nombre:"Skipping técnico",             etiquetas:["prevencion","velocidad"],         material:"campo",        contraindicado:[] },
  // Compensatorio por deporte
  { id:"c112", nombre:"Trap 3",                       etiquetas:["prevencion","hombro"],            material:"sin_material", contraindicado:[] },
  { id:"c113", nombre:"Rotación torácica",            etiquetas:["movilidad","prevencion"],         material:"sin_material", contraindicado:[] },
  { id:"c114", nombre:"Elevación escapular Y",        etiquetas:["prevencion","hombro"],            material:"sin_material", contraindicado:[] },
  { id:"c115", nombre:"Antiextensión lumbar",         etiquetas:["core","prevencion"],              material:"sin_material", contraindicado:[] },

  // ── 7. MOVILIDAD ─────────────────────────────────────────
  { id:"m116", nombre:"Movilidad de cadera",          etiquetas:["movilidad"],                      material:"sin_material", contraindicado:[] },
  { id:"m117", nombre:"Movilidad de tobillo",         etiquetas:["movilidad","prevencion"],         material:"sin_material", contraindicado:["tobillo"] },
  { id:"m118", nombre:"Rotación torácica",            etiquetas:["movilidad"],                      material:"sin_material", contraindicado:[] },
  { id:"m119", nombre:"Estiramiento flexores",        etiquetas:["movilidad"],                      material:"sin_material", contraindicado:[] },
  { id:"m120", nombre:"Flow movilidad completa 5'",   etiquetas:["movilidad"],                      material:"sin_material", contraindicado:[] },
];

export const EXERCISES = [...getLegacyCatalogFromV2(), ...EXTRA_EXERCISES];

// ── Etiquetas oficiales ───────────────────────────────────
export const TAGS = {
  objetivo:  ["fuerza","fuerza_maxima","fuerza_explosiva","resistencia","resistencia_aerobica","resistencia_anaerobica","resistencia_umbral","velocidad","pliometria","core","core_avanzado","prevencion","movilidad","estetica","isometrico","lesion_rodilla","lesion_tobillo","lesion_hombro","lesion_espalda"],
  zona:      ["tren_inferior","tren_superior","core","gluteo","rodilla","tobillo","hombro","empuje","traccion"],
  material:  ["sin_material","gomas","mancuernas","barra","maquina","maquina_polea","maquina_disco","gym_completo"],
};

// ── Tags extra que añade el deporte al pool de búsqueda ──
const SPORT_EXTRA_TAGS = {
  fútbol:   ["velocidad","cod","fuerza_explosiva","pliometria"],
  futbol:   ["velocidad","cod","fuerza_explosiva","pliometria"],
  basket:   ["pliometria","fuerza_explosiva","saltos"],
  natación: ["hombro","core","traccion"],
  natacion: ["hombro","core","traccion"],
  tenis:    ["hombro","cod","fuerza_explosiva"],
  fitness:  ["fuerza","estetica"],
};

// ── Motor: filtrar ejercicios para un perfil ─────────────
// Parámetros:
//   etiquetas  — tags del objetivo del día
//   material   — material disponible del usuario
//   lesiones   — array de lesiones (strings)
//   edad       — número (aplica reglas <14, 14-17, +30)
//   deporte    — string (añade tags extra según el deporte)
export function filterExercises({ etiquetas = [], material, lesiones = [], edad, deporte }) {
  const edadNum = parseInt(edad) || 20;

  // Tags adicionales por deporte
  const sportKey  = (deporte || "").toLowerCase().trim();
  const extraTags = SPORT_EXTRA_TAGS[sportKey] || [];
  const allTags   = extraTags.length > 0
    ? [...new Set([...etiquetas, ...extraTags])]
    : etiquetas;

  // Etiquetas excluidas por edad
  const excludeByAge = [];
  if (edadNum < 14)  excludeByAge.push("fuerza_maxima", "barra", "pliometria");
  if (edadNum < 18)  excludeByAge.push("fuerza_maxima");

  // Material normalizado
  const mat = material
    ? material.toLowerCase().replace(/\s/g,"_").replace("/","_").replace("barra_gimnasio","barra")
    : null;

  let results = EXERCISES.filter((ex) => {
    // Excluir contraindicaciones activas
    if (lesiones.some((l) => ex.contraindicado.includes(l.toLowerCase()))) return false;
    // Excluir etiquetas peligrosas por edad
    if (excludeByAge.some((t) => ex.etiquetas.includes(t))) return false;
    // Material compatible (sin_material siempre pasa)
    if (mat && ex.material !== "sin_material" && ex.material !== mat) return false;
    // Al menos una etiqueta coincide
    if (allTags.length > 0 && !allTags.some((t) => ex.etiquetas.includes(t))) return false;
    return true;
  });

  // +30 años: añadir ejercicios de movilidad extra si hay pocos resultados o siempre
  if (edadNum >= 30) {
    const movilidad = EXERCISES.filter(
      (ex) =>
        ex.etiquetas.includes("movilidad") &&
        !lesiones.some((l) => ex.contraindicado.includes(l.toLowerCase())) &&
        !results.find((r) => r.id === ex.id)
    ).slice(0, 3);
    results = [...results, ...movilidad];
  }

  return results;
}

// ── Motor: reglas de frecuencia (doc técnico) ─────────────
// Devuelve los objetivos de cada día según frecuencia y objetivo principal
export function getDayObjectives(objetivo, frecuencia) {
  const n = parseInt(String(frecuencia).replace(/\D/g, "")) || 3;
  const obj = objetivo?.toLowerCase();

  // Caso especial estética / hipertrofia
  if (obj === "estética" || obj === "estetica" || obj === "hipertrofia") {
    if (n === 1) return [{ tipo: "Full Body",       etiquetas: ["fuerza","estetica","tren_inferior","tren_superior"] }];
    if (n === 2) return [
      { tipo: "Cadena Anterior",  etiquetas: ["fuerza","estetica","tren_inferior","empuje"] },
      { tipo: "Cadena Posterior", etiquetas: ["fuerza","estetica","gluteo","traccion"] },
    ];
    if (n === 3) return [
      { tipo: "Push",  etiquetas: ["fuerza","estetica","empuje","tren_superior"] },
      { tipo: "Pull",  etiquetas: ["fuerza","estetica","traccion","tren_superior"] },
      { tipo: "Legs",  etiquetas: ["fuerza","estetica","tren_inferior","gluteo"] },
    ];
    if (n >= 4) return [
      { tipo: "Tren Superior A", etiquetas: ["fuerza","estetica","empuje","traccion","hombro"] },
      { tipo: "Tren Inferior",   etiquetas: ["fuerza","estetica","tren_inferior","gluteo"] },
      { tipo: "Tren Superior B", etiquetas: ["fuerza","estetica","empuje","traccion"] },
      { tipo: "Brazos + Core",   etiquetas: ["fuerza","estetica","core"] },
    ];
  }

  // Reglas generales
  const MAP = {
    fuerza:     ["fuerza","tren_inferior","tren_superior"],
    velocidad:  ["velocidad","fuerza_explosiva","pliometria"],
    resistencia:["resistencia"],
    hipertrofia: ["fuerza","estetica","tren_inferior","tren_superior"],
    prevención: ["prevencion","movilidad"],
    movilidad:  ["movilidad","prevencion"],
  };

  const primary  = MAP[obj] || MAP["fuerza"];
  const sequence = [
    { tipo: objetivo,    etiquetas: primary },
    { tipo: "Fuerza",    etiquetas: MAP.fuerza },
    { tipo: "Velocidad", etiquetas: MAP.velocidad },
    { tipo: "Prevención",etiquetas: MAP["prevención"] },
  ];

  return sequence.slice(0, n);
}

// ── Fusionar ejercicios con overrides del admin (videoUrl, description, tips) ──
export function getExercisesWithOverrides() {
  try {
    const raw = localStorage.getItem("depro_catalog_overrides");
    const overrides = raw ? JSON.parse(raw) : {};
    return EXERCISES.map((e) => ({ ...e, ...(overrides[e.id] || {}) }));
  } catch {
    return EXERCISES;
  }
}

// ── Versión enriquecida de filterExercises (con overrides) ──
export function filterExercisesEnriched(params) {
  const enriched = getExercisesWithOverrides();
  const { etiquetas = [], material, lesiones = [], edad, deporte } = params;
  const edadNum = parseInt(edad) || 20;
  const sportKey = (deporte || "").toLowerCase().trim();
  const SPORT_EXTRA = { fútbol:["velocidad","cod","fuerza_explosiva","pliometria"], futbol:["velocidad","cod","fuerza_explosiva","pliometria"], basket:["pliometria","fuerza_explosiva","saltos"], natación:["hombro","core","traccion"], natacion:["hombro","core","traccion"], tenis:["hombro","cod","fuerza_explosiva"], fitness:["fuerza","estetica"] };
  const extraTags = SPORT_EXTRA[sportKey] || [];
  const allTags = extraTags.length > 0 ? [...new Set([...etiquetas, ...extraTags])] : etiquetas;
  const excludeByAge = [];
  if (edadNum < 14) excludeByAge.push("fuerza_maxima","barra","pliometria");
  if (edadNum < 18) excludeByAge.push("fuerza_maxima");
  const mat = material ? material.toLowerCase().replace(/\s/g,"_").replace("/","_").replace("barra_gimnasio","barra") : null;
  let results = enriched.filter((ex) => {
    if (lesiones.some((l) => ex.contraindicado.includes(l.toLowerCase()))) return false;
    if (excludeByAge.some((t) => ex.etiquetas.includes(t))) return false;
    if (params.experiencia === "novato" && (ex.etiquetas.includes("pliometria") || ex.etiquetas.includes("fuerza_maxima"))) return false;
    if (mat && ex.material !== "sin_material" && ex.material !== mat) return false;
    if (allTags.length > 0 && !allTags.some((t) => ex.etiquetas.includes(t))) return false;
    return true;
  });
  if (edadNum >= 30) {
    const movilidad = enriched.filter((ex) => ex.etiquetas.includes("movilidad") && !lesiones.some((l) => ex.contraindicado.includes(l.toLowerCase())) && !results.find((r) => r.id === ex.id)).slice(0, 3);
    results = [...results, ...movilidad];
  }
  return results;
}

// ── Motor: generar prompt para IA ────────────────────────
export function buildAIPrompt({ edad, objetivo, deporte, frecuencia, material, lesion, exercises, plantilla }) {
  const lesionStr = (lesion?.length > 0 ? lesion.join(", ") : "ninguna");
  const exList = exercises.map((e) => `- ${e.nombre} [${e.etiquetas.join(", ")}]`).join("\n");

  return {
    system: `Eres un generador de rutinas profesionales. No inventas ejercicios. Solo organizas los ejercicios enviados por el sistema en sesiones completas usando la plantilla indicada. Adapta el volumen a la edad, objetivo, lesiones y frecuencia. Usa un tono claro, profesional y simple. Nunca añadas ejercicios ajenos a la lista proporcionada.`,
    user: `Genera una semana de entrenamiento personalizada con los siguientes datos del usuario:
Edad: ${edad}
Objetivo principal: ${objetivo}
Deporte: ${deporte}
Frecuencia semanal: ${frecuencia} días
Material disponible: ${material}
Lesiones: ${lesionStr}

Usa exclusivamente estos ejercicios:
${exList}

Plantilla base:
${plantilla}

Incluye: Calentamiento (con duración), Bloque principal, Complementario, Vuelta a la calma. Adapta intensidad según nivel y edad, no inventes ejercicios.`,
  };
}
