/**
 * Enriquecimiento de etiquetas del catálogo vivo (PDF etiquetas jugadores).
 * No crea, borra, renombra ni mueve ejercicios. Conserva IDs, carpeta, descripción y tags usados por el selector.
 */

const ANALYTIC_RE = /curl femoral|extensi[oó]n de cu[aá]driceps|extensi[oó]n isquios|elevaci[oó]n de gemelos|tr[ií]ceps fondo|extensi[oó]n tr[ií]ceps|curl b[ií]ceps|aperturas? con|elevaciones laterales|elevaci[oó]n frontal|elevaci[oó]n lateral|cruces pecho/i;
const ISO_RE = /isometr|wall sit|nordic hold|plancha|hollow hold|pallof|dead bug|bird dog/i;
const PLIO_RE = /salto|drop jump|depth jump|bounding|pogo|patinador/i;
const SQUAT_RE = /sentadilla|split squat|prensa|zancada|step-?up|b[uú]lgara/i;
const HINGE_RE = /peso muerto|hip thrust|puente de gl[uú]teo|glute bridge|buenos d[ií]as|nordic/i;
const PRESS_RE = /press |flexiones|fondos/i;
const ROW_RE = /remo /i;
const LAT_RE = /jal[oó]n|dominadas/i;
const SPRINT_RE = /sprint|aceleraci|salidas |cod |zig-zag|reacci[oó]n|skipping|coordinaci[oó]n|drill pared/i;
const COMPENS_RE = /lateral walk|monster walk/i;

function asArr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? [...v] : [v];
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function familiaFrom(ex) {
  const n = norm(ex.nombre);
  if (/sentadilla|prensa|haka|multipower/.test(n)) return "sentadilla";
  if (/prensa/.test(n)) return "prensa";
  if (/peso muerto|buenos d[ií]as/.test(n)) return "bisagra";
  if (/hip thrust|puente|glute bridge/.test(n)) return "puente";
  if (/zancada|split squat|step-?up|bulgara/.test(n)) return "zancada";
  if (/curl femoral|nordic/.test(n)) return "curl_femoral";
  if (/gemelo/.test(n)) return "gemelos";
  if (/extensi[oó]n de cu[aá]driceps|extensi[oó]n isquios/.test(n)) return "extension_rodilla";
  if (/remo/.test(n)) return "remo";
  if (/jal[oó]n|dominadas/.test(n)) return "jalon";
  if (/press|flexiones/.test(n)) return /inclin/.test(n) ? "press_inclinado" : "press_horizontal";
  if (/tr[ií]ceps|fondos/.test(n)) return "triceps";
  if (/b[ií]ceps|curl b/.test(n)) return "curl_biceps";
  if (/plancha|hollow|dead bug|bird dog|pallof|russian|inch worm/.test(n)) return "core";
  if (/salto|drop|bounding|pogo/.test(n)) return "salto";
  if (/cod |zig-zag|conos|pivote/.test(n)) return "COD";
  if (/reacci/.test(n)) return "reaccion";
  if (/sprint|aceler|salida|skipping|drill/.test(n)) return "sprint";
  if (/rowerg|carrera|skierg|bikeerg|trineo|vam|intervalo|fartlek|tempo|umbral/.test(n)) return "resistencia";
  if (/movilidad|estiramiento|rotaci[oó]n tor|perro gato/.test(n)) return "movilidad";
  if (/superman|y-t-w|rotadores|equilibrio|tobillo|bosu|escapular/.test(n)) return "prevencion";
  return ex.etiquetas?.grupo_principal || ex.carpeta || "otro";
}

function direccionFrom(ex) {
  const n = norm(ex.nombre);
  const pats = asArr(ex.etiquetas?.patron).map(norm);
  if (/lateral|patinador|zig-zag|cod /.test(n) || pats.includes("cod")) return "lateral";
  if (/adelante|horizontal|boundings|bounding \(/.test(n) || pats.includes("empuje") && /press banca|press plano|remo /.test(n)) {
    if (/press militar|press arnold|flexiones pica|jal[oó]n|dominadas/.test(n)) return "vertical";
    return "horizontal";
  }
  if (/vertical|caja|cajon|depth|drop jump|pogos/.test(n)) return "vertical";
  if (/jal[oó]n|dominadas|press militar|press arnold|flexiones pica/.test(n)) return "vertical";
  if (/remo |press banca|press plano|press mancuernas|press inclinado|flexiones/.test(n)) return "horizontal";
  if (pats.includes("aceleracion")) return "horizontal";
  return null;
}

function sobrecargaFrom(material) {
  const m = asArr(material).map(norm).join(" ");
  if (/barra|maquina|prensa/.test(m)) return 3;
  if (/mancuern/.test(m)) return 2;
  return 1;
}

function rolFuncional(ex) {
  const n = norm(ex.nombre);
  const carpeta = ex.carpeta;
  if (carpeta === "core") return "core";
  if (carpeta === "movilidad") return "movilidad";
  if (carpeta === "prevencion" || COMPENS_RE.test(n)) return /isometr|equilibrio|hold/.test(n) ? "control_motor" : "compensatorio";
  if (carpeta === "pliometria" || PLIO_RE.test(n)) return "pliometrico";
  if (carpeta === "velocidad" || SPRINT_RE.test(n)) return "sprint";
  if (carpeta === "resistencia") return "resistencia";
  if (ISO_RE.test(n) || asArr(ex.etiquetas?.patron).includes("isometrico")) return "isometrico";
  if (ANALYTIC_RE.test(n) || asArr(ex.etiquetas?.patron).includes("analitico")) return "analitico";
  return "multiarticular_principal";
}

function articulacionesFrom(ex) {
  const n = norm(ex.nombre);
  const contra = asArr(ex.etiquetas?.contraindicado).map(norm);
  const out = new Set();
  if (contra.some((c) => /rodilla/.test(c)) || SQUAT_RE.test(n) || /extension de cuadriceps|zancada|prensa/.test(n)) out.add("rodilla");
  if (contra.some((c) => /hombro/.test(c)) || /press |flexiones|dominadas|jal[oó]n|elevaci[oó]n|hombro/.test(n)) out.add("hombro");
  if (contra.some((c) => /tobillo/.test(c)) || /gemelo|sprint|salto|cod /.test(n)) out.add("tobillo");
  if (/peso muerto|puente|hip thrust|buenos d|remo |plancha|hollow/.test(n) || contra.some((c) => /espalda|lumbar/.test(c))) out.add("cadera");
  if (/codo|curl|triceps/.test(n)) out.add("codo");
  return [...out];
}

function lesionAuto(ex) {
  const map = {};
  for (const raw of asArr(ex.etiquetas?.contraindicado)) {
    const k = norm(raw).replace(/^lesion_/, "");
    if (k) map[k] = "no_seleccionar_automaticamente";
  }
  return map;
}

function afinidad(ex, rol, sobrecarga) {
  const carpeta = ex.carpeta;
  const scores = {
    fuerza_maxima: 0,
    hipertrofia: 0,
    velocidad: 0,
    resistencia_aerobica: 0,
    resistencia_umbral: 0,
    resistencia_anaerobica: 0,
    prevencion: 0,
    movilidad: 0,
  };
  if (carpeta === "velocidad") scores.velocidad = 3;
  if (carpeta === "pliometria") scores.velocidad = 2;
  if (carpeta === "movilidad") scores.movilidad = 3;
  if (carpeta === "prevencion" || rol === "isometrico") scores.prevencion = 3;
  if (carpeta === "core") scores.prevencion = 2;
  if (carpeta === "resistencia") {
    const pats = asArr(ex.etiquetas?.patron);
    if (pats.includes("aerobico")) scores.resistencia_aerobica = 3;
    else if (pats.includes("umbral")) scores.resistencia_umbral = 3;
    else if (pats.includes("anaerobico")) scores.resistencia_anaerobica = 3;
  }
  if (carpeta?.startsWith("fuerza_")) {
    scores.hipertrofia = rol === "analitico" ? 3 : 2;
    scores.fuerza_maxima = rol === "multiarticular_principal" ? Math.min(3, sobrecarga) : (rol === "analitico" ? 2 : 1);
  }
  return scores;
}

/**
 * Completa etiquetas funcionales sobre el ejercicio real. Mutación acotada a `etiquetas`.
 */
export function enrichExerciseTags(ex) {
  if (!ex?.etiquetas) return ex;
  const et = ex.etiquetas;
  const n = norm(ex.nombre);
  const patron = unique([...asArr(et.patron)]);
  const objetivo = unique([...asArr(et.objetivo)]);
  const rolFn = rolFuncional(ex);

  if (rolFn === "analitico" && !patron.includes("analitico")) patron.push("analitico");
  if (rolFn === "isometrico" && !patron.includes("isometrico")) patron.push("isometrico");
  if (rolFn === "pliometrico" && !patron.includes("pliometria")) patron.push("pliometria");
  if (SQUAT_RE.test(n) && !patron.includes("dominante_rodilla") && et.segmento === "tren_inferior") {
    patron.push("dominante_rodilla");
  }
  if (HINGE_RE.test(n) && !patron.includes("dominante_cadera") && et.segmento === "tren_inferior") {
    patron.push("dominante_cadera");
  }
  if (PRESS_RE.test(n) && !patron.includes("empuje")) patron.push("empuje");
  if ((ROW_RE.test(n) || LAT_RE.test(n)) && !patron.includes("traccion")) patron.push("traccion");

  if (ex.carpeta?.startsWith("fuerza_") && !objetivo.includes("hipertrofia")) objetivo.push("hipertrofia");
  if (ex.carpeta === "velocidad" && !objetivo.includes("velocidad")) objetivo.push("velocidad");

  let rol = et.rol;
  if (rolFn === "analitico" && rol === "basico") rol = "complementario";
  if (COMPENS_RE.test(n) && rol === "basico") rol = "complementario";

  const sobrecarga = sobrecargaFrom(et.material);
  const familia = familiaFrom(ex);
  const direccion = direccionFrom(ex);

  et.patron = patron;
  et.objetivo = objetivo;
  et.rol = rol;
  et.familia = familia;
  et.rol_funcional = rolFn;
  et.sobrecarga = sobrecarga;
  et.afinidad = afinidad(ex, rolFn, sobrecarga);
  et.articulaciones = articulacionesFrom(ex);
  et.lesion_auto = lesionAuto(ex);
  et.dificultad_tecnica = /barra|nordic|dominadas(?! asist)/i.test(ex.nombre) ? 3 : (rolFn === "multiarticular_principal" ? 2 : 1);
  et.impacto = ex.carpeta === "pliometria" || /sprint|salto/.test(n) ? 3 : (ex.carpeta === "velocidad" ? 2 : 0);
  if (direccion) et.direccion = direccion;
  return ex;
}

export function enrichCatalog(exercises) {
  for (const ex of exercises) enrichExerciseTags(ex);
  return exercises;
}
