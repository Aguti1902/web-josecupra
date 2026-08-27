/**
 * DEPRO — Selección de ejercicios por etiquetas multi-eje (AND) + pickDeterministic.
 */
import { EXERCISES } from "./exerciseCatalog.js";
import { pickDeterministic } from "./deterministicPick.js";

const EXP_LEVELS = { novato: 1, intermedio: 2, avanzado: 3 };

const MACHINE_MATERIALS = new Set(["maquina", "maquina_polea", "maquina_disco"]);
const GYM_UNLOCK = new Set([
  "sin_material", "gomas", "mancuernas", "barra",
  "maquina", "maquina_polea", "maquina_disco", "gym_completo",
]);

const HIDDEN_KEY = "depro_catalog_hidden_ids";
const CUSTOM_KEY = "depro_catalog_custom_exercises";

/** Prevención real (carpeta prevencion), nunca resistencia. */
const LESION_PREV_TAGS = {
  rodilla: ["prevencion_rodilla"],
  tobillo: ["prevencion_tobillo"],
  hombro: ["prevencion_hombro", "estabilidad_escapular"],
  espalda: ["estabilidad_escapular"],
  pubalgia: ["prevencion_rodilla"],
};

function loadJsonLs(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getHiddenCatalogIds() {
  return new Set((loadJsonLs(HIDDEN_KEY, []) || []).map(String));
}

export function hideCatalogExercise(id) {
  if (id == null || id === "") return;
  const next = [...getHiddenCatalogIds(), String(id)];
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...new Set(next)])); } catch { /* ignore */ }
}

export function getActiveCatalog() {
  const hidden = getHiddenCatalogIds();
  const custom = loadJsonLs(CUSTOM_KEY, []);
  const extra = Array.isArray(custom) ? custom : [];
  return [...EXERCISES, ...extra].filter((ex) => !hidden.has(String(ex.id)));
}

function catalogPool() {
  return getActiveCatalog();
}

export function normalizeMaterialList(material) {
  let raw = material;
  if (typeof raw === "string" && raw.includes("|")) raw = raw.split("|");
  if (typeof raw === "string" && raw.includes(",")) {
    // "Gomas, Mancuernas" desde UI antigua
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) raw = parts;
  }
  raw = Array.isArray(raw) ? raw : [raw || "sin_material"];
  const out = new Set();
  for (const m of raw) {
    const key = String(m || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s|\//g, "_")
      .replace("barra_gimnasio", "barra")
      .replace("gimnasio_completo", "gym_completo")
      .replace("gym_completo", "gym_completo")
      .replace("gymcompleto", "gym_completo")
      .replace("campo", "sin_material");
    if (!key || key === "ninguno") continue;
    out.add(key);
  }
  if (!out.size) out.add("sin_material");
  return [...out];
}

export function materialMatches(exerciseMaterials = [], playerMaterials = []) {
  const mats = normalizeMaterialList(playerMaterials);
  if (mats.includes("gym_completo")) return true;
  const unlocked = new Set(mats);
  // Variantes de máquina se desbloquean con "maquina" o gym completo
  if (mats.includes("maquina") || mats.includes("maquina_polea") || mats.includes("maquina_disco")) {
    MACHINE_MATERIALS.forEach((m) => unlocked.add(m));
  }
  if (mats.includes("barra") && mats.includes("maquina")) {
    MACHINE_MATERIALS.forEach((m) => unlocked.add(m));
  }
  return asArray(exerciseMaterials).some(
    (m) => unlocked.has(String(m).toLowerCase()) || (m === "gym_completo" && mats.includes("gym_completo")),
  );
}

/** Peso corporal / sin material (único fallback permitido). */
export function isBodyweightMaterial(exerciseMaterials = []) {
  const em = asArray(exerciseMaterials).map((x) => String(x).toLowerCase());
  if (!em.length) return true;
  return em.every((m) => /sin.?material|peso.?corporal|bodyweight|ninguno|campo/.test(m));
}

/**
 * ¿Puede usarse este ejercicio con el material del jugador?
 * Regla dura: solo material disponible del usuario O peso corporal.
 * Nunca máquina/barra/gomas/etc. si el usuario no las tiene.
 */
export function isExerciseAllowedForMaterials(exerciseMaterials = [], playerMaterials = []) {
  const mats = normalizeMaterialList(playerMaterials);
  if (mats.includes("gym_completo")) return true;
  if (isBodyweightMaterial(exerciseMaterials)) return true;
  return materialMatches(exerciseMaterials, mats);
}

/**
 * True si el ejercicio exige equipo que el jugador no tiene.
 * El peso corporal nunca se considera "equipo faltante".
 */
export function requiresUnavailableEquipment(exerciseMaterials = [], playerMaterials = []) {
  return !isExerciseAllowedForMaterials(exerciseMaterials, playerMaterials);
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function tagsOf(ex) {
  return ex?.etiquetas || {};
}

function matchesAny(needed, available) {
  if (!needed?.length) return true;
  const set = new Set(asArray(available));
  return needed.some((n) => set.has(n));
}

function matchesAllScalars(slotValue, exerciseValue) {
  if (slotValue == null || slotValue === "") return true;
  if (Array.isArray(slotValue)) {
    return slotValue.some((v) => asArray(exerciseValue).includes(v));
  }
  return asArray(exerciseValue).includes(slotValue) || exerciseValue === slotValue;
}

/** Filtra catálogo por restricciones AND del slot. */
export function matchSlotTags(ex, slot = {}) {
  if (ex?.esTest) return false;
  const nombre = String(ex?.nombre || "");
  if (/\btest\b|cooper adaptado/i.test(nombre)) return false;
  const et = tagsOf(ex);
  if (slot.objetivo && !matchesAny(asArray(slot.objetivo), et.objetivo)) return false;
  if (slot.segmento && !matchesAllScalars(slot.segmento, et.segmento)) return false;
  if (slot.patron) {
    const needed = asArray(slot.patron);
    const orMode = slot.patronMode === "or" || needed.length > 1 && slot.patronOr;
    if (orMode) {
      if (!matchesAny(needed, et.patron)) return false;
    } else if (!matchesAny(needed, et.patron)) {
      return false;
    }
  }
  if (slot.patronOr && !matchesAny(asArray(slot.patronOr), et.patron)) return false;
  if (slot.grupo_muscular) {
    // grupo_principal manda (función dominante); fallback a grupo_muscular
    const primary = et.grupo_principal ? [et.grupo_principal] : asArray(et.grupo_muscular);
    if (!matchesAny(asArray(slot.grupo_muscular), primary)) return false;
  }
  if (slot.rol && !matchesAllScalars(slot.rol, et.rol)) return false;
  if (slot.intensidad && !matchesAllScalars(slot.intensidad, et.intensidad)) return false;
  return true;
}

export function filterExercisesForUser(exercises, userProfile = {}) {
  const mats = normalizeMaterialList(userProfile.material);
  const lesiones = asArray(userProfile.lesiones || userProfile.lesion).map((l) => {
    const k = String(l || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (k.startsWith("lesion_")) return k;
    return `lesion_${k.replace(/\s+/g, "_")}`;
  });
  const exp = userProfile.experiencia || "intermedio";
  const expLevel = EXP_LEVELS[exp] || 2;
  const dayIntensity = userProfile.dayIntensity || null;

  return exercises.filter((ex) => {
    const et = tagsOf(ex);
    // REGLA DURA: nunca equipo que el usuario no tiene (fallback = peso corporal)
    if (!isExerciseAllowedForMaterials(et.material, mats)) return false;

    const exExp = et.experiencia || [];
    if (exExp.length) {
      if (!exExp.includes(exp)) {
        const minEx = Math.min(...exExp.map((e) => EXP_LEVELS[e] || 2));
        if (minEx > expLevel) return false;
      }
    }

    if (isExerciseContraindicated(ex, lesiones)) return false;

    if (dayIntensity === "baja" && et.intensidad === "alta" && et.rol === "basico") {
      // se permite; la adaptación de cargas se aplica en el motor
    }

    if (ex.edadMinima && (userProfile.edad || 18) < ex.edadMinima) return false;
    return true;
  });
}

/**
 * Misma naturaleza de trabajo: no mezclar resistencia con fuerza,
 * ni tren inferior con tren superior, ni carpetas distintas sin sentido.
 * Un slot de velocidad/pliometría nunca acepta un curl de bíceps (fuerza superior).
 */
function inferredSlotFolder(slot = {}, original = null) {
  if (slot.carpeta) return slot.carpeta;
  if (original?.carpeta) return original.carpeta;
  const obj = asArray(slot.objetivo || original?.slotConstraints?.objetivo).map((o) => String(o).toLowerCase());
  const patrons = [
    ...asArray(slot.patron),
    ...asArray(slot.patronOr),
    ...asArray(original?.slotConstraints?.patron),
  ].map((p) => String(p).toLowerCase());
  if (obj.includes("velocidad") || patrons.some((p) => ["aceleracion", "velocidad_pura", "reaccion", "cod"].includes(p))) {
    return "velocidad";
  }
  if (patrons.includes("pliometria") || obj.includes("pliometria")) return "pliometria";
  if (obj.includes("resistencia")) return "resistencia";
  if (slot.segmento === "tren_superior") return "fuerza_tren_superior";
  if (slot.segmento === "tren_inferior") return "fuerza_tren_inferior";
  return "";
}

export function sameTrainingNature(ex, slot = {}, original = null) {
  if (!ex) return false;
  const et = tagsOf(ex);
  const origEt = tagsOf(original);
  const objetivo = slot.objetivo || original?.slotConstraints?.objetivo || origEt.objetivo?.[0];
  const segmento = slot.segmento || original?.slotConstraints?.segmento || origEt.segmento;
  const carpeta = inferredSlotFolder(slot, original);

  const exObj = asArray(et.objetivo).map((o) => String(o).toLowerCase());
  const slotObj = asArray(objetivo).map((o) => String(o).toLowerCase());
  const isEnduranceEx = ex.carpeta === "resistencia"
    || (exObj.includes("resistencia") && !exObj.some((o) => ["fuerza", "hipertrofia", "velocidad", "prevencion", "pliometria"].includes(o)));
  const slotWantsEndurance = slotObj.includes("resistencia") || carpeta === "resistencia";
  if (isEnduranceEx && !slotWantsEndurance) return false;

  if (carpeta === "velocidad" || carpeta === "pliometria") {
    if (ex.carpeta === "fuerza_tren_superior") return false;
    if (ex.carpeta === "resistencia") return false;
    const wantsSpeed = slotObj.includes("velocidad") || carpeta === "velocidad";
    if (wantsSpeed && ex.carpeta !== "velocidad" && ex.carpeta !== "pliometria" && !exObj.includes("velocidad")) {
      // Fuerza de tren inferior sí entra en el bloque de fuerza máxima de la plantilla Velocidad
      if (!(slotObj.includes("fuerza") && (ex.carpeta === "fuerza_tren_inferior" || et.segmento === "tren_inferior"))) {
        if (ex.carpeta === "fuerza_tren_superior" || et.segmento === "tren_superior") return false;
      }
    }
  }

  if (segmento && et.segmento && segmento !== "full" && et.segmento !== "full" && et.segmento !== segmento) {
    if (ex.carpeta !== "prevencion" && ex.carpeta !== "core" && ex.carpeta !== "movilidad") return false;
    if (ex.carpeta === "prevencion" && origEt.segmento && origEt.segmento !== et.segmento && origEt.segmento !== "full") {
      return false;
    }
  }

  if (carpeta && carpeta.startsWith("fuerza_") && ex.carpeta === "resistencia") return false;
  if (carpeta === "fuerza_tren_superior" && (ex.carpeta === "fuerza_tren_inferior" || et.segmento === "tren_inferior")) return false;
  if (carpeta === "fuerza_tren_inferior" && (ex.carpeta === "fuerza_tren_superior" || et.segmento === "tren_superior")) return false;
  return true;
}

/** Prioriza material del perfil; fallback a peso corporal / sin material. */
export function rankByMaterialPreference(candidates, userProfile = {}) {
  const mats = normalizeMaterialList(userProfile.material);
  const fullGym = mats.includes("gym_completo") || mats.some((m) => /gimnasio|gym|completo/i.test(String(m)));
  const preferFree = fullGym || mats.some((m) => /barra|mancuern/i.test(String(m)));

  const score = (ex) => {
    const et = tagsOf(ex);
    const em = asArray(et.material).map((x) => String(x).toLowerCase());
    const body = isBodyweightMaterial(et.material);
    // Solo puntuar candidatos ya permitidos
    if (!isExerciseAllowedForMaterials(et.material, mats)) return -1;
    if (mats.length && materialMatches(et.material, mats)) {
      if (preferFree && em.some((m) => /barra|mancuern/.test(m))) return 300;
      if (preferFree && em.some((m) => /maquina|máquina|polea/.test(m))) return 180;
      if (em.some((m) => mats.includes(m))) return 260;
      return 250;
    }
    if (body) return 100;
    return 0;
  };

  return [...candidates].sort((a, b) => score(b) - score(a));
}

/**
 * Relaja filtros menos críticos. NUNCA suelta objetivo ni segmento:
 * eso mezclaba resistencia en fuerza y tren inferior en superior.
 */
function relaxSlot(slot, step) {
  const next = { ...slot };

  if (step === 1 && next.intensidad) {
    delete next.intensidad;
    return next;
  }
  if (step === 2 && next.grupo_muscular) {
    delete next.grupo_muscular;
    return next;
  }
  if (step === 3 && (next.patron || next.patronOr)) {
    delete next.patron;
    delete next.patronOr;
    delete next.patronMode;
    return next;
  }
  return null;
}

function pickFrom(candidates, userProfile, slot, _usedExerciseIds, seedExtra) {
  if (!candidates.length) return null;
  // No incluir usedIds en la semilla: un swap local no debe reescribir el resto de slots.
  const seed = [
    userProfile?.userId || "",
    userProfile?.week || "",
    slot.slotId || slot.description || "",
    slot.rol || "",
    slot.patron || "",
    slot.segmento || "",
    (slot.grupo_muscular || []).toString?.() || slot.grupo_muscular || "",
    seedExtra,
  ].join("|");
  return pickDeterministic(candidates, seed);
}

export function selectExerciseForSlot(slot, userProfile, usedExerciseIds = [], seedExtra = "") {
  const filterPool = (pool, allowReuse = false) => {
    let candidates = filterExercisesForUser(pool, userProfile);
    if (!allowReuse) candidates = candidates.filter((ex) => !usedExerciseIds.includes(ex.id));
    return candidates;
  };

  const pool = catalogPool();
  const natureOk = (ex) => sameTrainingNature(ex, slot);
  let candidates = filterPool(pool.filter((ex) => matchSlotTags(ex, slot) && natureOk(ex)));

  for (let step = 1; candidates.length === 0 && step <= 3; step++) {
    const relaxed = relaxSlot(slot, step);
    if (!relaxed) break;
    const same =
      JSON.stringify({
        g: slot.grupo_muscular,
        i: slot.intensidad,
        p: slot.patron,
      }) ===
      JSON.stringify({
        g: relaxed.grupo_muscular,
        i: relaxed.intensidad,
        p: relaxed.patron,
      });
    if (same) continue;
    candidates = filterPool(pool.filter((ex) => matchSlotTags(ex, relaxed) && natureOk(ex)));
  }

  // Reutilizar ejercicio ya usado en la sesión si el pool se agotó (antes que dejar el slot vacío)
  if (!candidates.length) {
    candidates = filterPool(pool.filter((ex) => matchSlotTags(ex, slot) && natureOk(ex)), true);
    for (let step = 1; candidates.length === 0 && step <= 3; step++) {
      const relaxed = relaxSlot(slot, step);
      if (!relaxed) break;
      candidates = filterPool(pool.filter((ex) => matchSlotTags(ex, relaxed) && natureOk(ex)), true);
    }
  }

  // Último recurso: mismo rol + objetivo/segmento si existen. Nunca solo el rol
  // (eso metía curls de bíceps en velocidad o tren inferior en superior).
  if (!candidates.length && slot.rol) {
    const constrained = {
      rol: slot.rol,
      ...(slot.objetivo ? { objetivo: slot.objetivo } : {}),
      ...(slot.segmento ? { segmento: slot.segmento } : {}),
    };
    candidates = filterPool(
      pool.filter((ex) => matchSlotTags(ex, constrained) && natureOk(ex)),
      true,
    );
  }

  // Calentamiento / core: pool amplio pero sin cambiar de categoría
  if (!candidates.length && (slot.rol === "calentamiento" || slot.rol === "core")) {
    candidates = filterPool(
      pool.filter((ex) => (matchSlotTags(ex, { rol: slot.rol }) || tagsOf(ex).rol === slot.rol) && natureOk(ex)),
      true,
    );
  }

  if (!candidates.length) return null;
  const ranked = rankByMaterialPreference(candidates, userProfile);
  // Prioridad: material del perfil → solo peso corporal (nunca otro equipo)
  const mats = normalizeMaterialList(userProfile.material);
  const preferMatched = ranked.filter((ex) => materialMatches(tagsOf(ex).material, mats));
  const bodyFallback = ranked.filter((ex) => isBodyweightMaterial(tagsOf(ex).material));
  const rankedPool = preferMatched.length ? preferMatched : bodyFallback;
  if (!rankedPool.length) return null;
  return pickFrom(rankedPool, userProfile, slot, usedExerciseIds, seedExtra);
}

function getVolume(experiencia, blockType, objective = "fuerza", adaptedIntensity = null) {
  if (blockType === "calentamiento" || blockType === "vuelta_calma") {
    return { sets: 1, reps: "30–60\"", rest: "30\"", load: null };
  }
  if (adaptedIntensity === "media" && objective === "fuerza") {
    return { sets: 3, reps: "10", rest: "90\"", load: "60-65% RM" };
  }
  if (adaptedIntensity === "baja" && objective === "fuerza") {
    return { sets: 2, reps: "15", rest: "60\"", load: "peso corporal / gomas" };
  }
  if (adaptedIntensity === "media" && objective === "hipertrofia") {
    return { sets: 3, reps: "15-20", rest: "60\"", load: "ligero" };
  }
  if (adaptedIntensity === "baja" && (objective === "hipertrofia" || objective === "velocidad")) {
    return { sets: 2, reps: "12-15", rest: "45\"", load: "técnica / movilidad" };
  }

  const tables = {
    fuerza: {
      novato: { sets: "2-3", reps: "8-10", rest: "2-3 min", load: "80-90% RM" },
      intermedio: { sets: 3, reps: "6-8", rest: "2-3 min", load: "80-90% RM" },
      avanzado: { sets: "3-4", reps: "4-6", rest: "2-3 min", load: "80-90% RM" },
    },
    hipertrofia: {
      novato: { sets: "2-3", reps: "10-12", rest: "60-90 s", load: "65-75% RM" },
      intermedio: { sets: 3, reps: "10-12-10", rest: "60-90 s", load: "65-75% RM" },
      avanzado: { sets: "3-4", reps: "10-12-10", rest: "60-90 s", load: "65-75% RM" },
    },
    velocidad: {
      novato: { sets: 3, reps: "3-5", rest: "3-4 min", load: "técnica" },
      intermedio: { sets: "3-4", reps: "3-5", rest: "3-4 min", load: "85-95% RM / máx" },
      avanzado: { sets: "3-4", reps: "3-5", rest: "3-4 min", load: "85-95% RM / máx" },
    },
  };
  const obj = tables[objective] || tables.fuerza;
  return obj[experiencia] || obj.intermedio;
}

export function expectedSlotCount(block) {
  return (block.slots || []).reduce((n, s) => {
    if (s?.optional) return n;
    return n + (s.qty || 1);
  }, 0);
}

export function fillBlockSlots(block, userProfile, sessionUsedIds = [], sessionUsedPools = []) {
  const exercises = [];
  const blockUsedIds = [...sessionUsedIds];
  const blockUsedPools = [...sessionUsedPools];
  const objective = userProfile.sessionObjective || userProfile.objetivo || "fuerza";
  const adapted = userProfile.adaptedIntensity || null;
  let missing = 0;
  const expected = expectedSlotCount(block);

  for (const slot of block.slots || []) {
    const qty = slot.qty || 1;
    for (let i = 0; i < qty; i++) {
      const exercise = selectExerciseForSlot(
        { ...slot, slotId: slot.slotId || `${block.type}_${slot.rol || ""}_${i}` },
        userProfile,
        blockUsedIds,
        String(i),
      );

      if (exercise) {
        const vol = slot.volume || getVolume(userProfile.experiencia, block.type, objective, adapted);
        exercises.push({
          ...exercise,
          slotDescription: slot.description,
          slotConstraints: {
            rol: slot.rol,
            patron: slot.patron || slot.patronOr,
            segmento: slot.segmento,
            grupo_muscular: slot.grupo_muscular,
            objetivo: slot.objetivo,
          },
          sets: vol.sets,
          reps: vol.reps,
          rest: vol.rest,
          load: vol.load,
        });
        blockUsedIds.push(exercise.id);
        if (exercise.pool) blockUsedPools.push(exercise.pool);
      } else if (!slot.optional) {
        missing += 1;
        console.warn(`[DEPRO] Sin ejercicio para slot: ${slot.description || slot.rol || slot.patron}`);
      }
    }
  }

  return {
    exercises,
    usedIds: blockUsedIds,
    usedPools: blockUsedPools,
    incomplete: missing > 0 || exercises.length < expected,
    expectedSlots: expected,
    filledSlots: exercises.length,
  };
}

/** Refresco: mismo slot (mismas restricciones de etiqueta). */
export function refreshExercise(currentExercise, userProfile, excludeIds = [], seed = "") {
  const constraints = currentExercise.slotConstraints || {
    rol: tagsOf(currentExercise).rol,
    patron: tagsOf(currentExercise).patron?.[0],
    segmento: tagsOf(currentExercise).segmento,
    grupo_muscular: tagsOf(currentExercise).grupo_muscular,
    objetivo: tagsOf(currentExercise).objetivo?.[0],
  };

  let candidates = catalogPool().filter((ex) => matchSlotTags(ex, constraints) && sameTrainingNature(ex, constraints, currentExercise));
  candidates = filterExercisesForUser(candidates, userProfile);
  candidates = candidates.filter(
    (ex) => ex.id !== currentExercise.id && ex.id !== currentExercise.catalogId && !excludeIds.includes(ex.id),
  );
  if (!candidates.length) return null;
  const ranked = rankByMaterialPreference(candidates, userProfile);
  const mats = normalizeMaterialList(userProfile.material);
  const preferMatched = ranked.filter((ex) => materialMatches(tagsOf(ex).material, mats));
  const bodyFallback = ranked.filter((ex) => isBodyweightMaterial(tagsOf(ex).material));
  const pool = preferMatched.length ? preferMatched : bodyFallback;
  if (!pool.length) return null;
  return pickDeterministic(pool, seed || `${Date.now()}|${currentExercise.id}`);
}

export function getPreventionInjectionIds(lesiones = []) {
  const tags = new Set();
  for (const l of lesiones) {
    const key = String(l || "").toLowerCase().replace(/^lesion_/, "");
    (LESION_PREV_TAGS[key] || []).forEach((t) => tags.add(t));
  }
  if (!tags.size) return [];
  return catalogPool()
    .filter((ex) => {
      if (ex.carpeta !== "prevencion") return false;
      const sec = asArray(ex.etiquetas?.accion_secundaria);
      const gp = ex.etiquetas?.grupo_principal;
      return sec.some((s) => tags.has(s))
        || tags.has(`prevencion_${gp}`)
        || (tags.has("estabilidad_escapular") && (gp === "espalda" || gp === "escapular"));
    })
    .map((ex) => ex.id);
}

function lesionKeySet(lesiones = []) {
  const keys = new Set();
  for (const l of asArray(lesiones)) {
    const k = String(l || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!k || k === "ninguna") continue;
    const tag = k.startsWith("lesion_") ? k : `lesion_${k}`;
    keys.add(tag);
    keys.add(tag.replace(/^lesion_/, ""));
  }
  return keys;
}

/** Solo ejercicios etiquetados como contraindicados para esa lesión (p. ej. Press militar → hombro). */
export function isExerciseContraindicated(ex, lesiones = []) {
  const keys = lesionKeySet(lesiones);
  if (!keys.size) return false;
  const contra = asArray(ex?.etiquetas?.contraindicado || ex?.lesionesContra);
  return contra.some((c) => {
    const raw = String(c || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!raw) return false;
    const tag = raw.startsWith("lesion_") ? raw : `lesion_${raw}`;
    return keys.has(tag) || keys.has(raw) || keys.has(tag.replace(/^lesion_/, ""));
  });
}

function exerciseContraindicated(ex, lesiones = []) {
  return isExerciseContraindicated(ex, lesiones);
}

/**
 * Conserva la sesión original y sustituye SOLO los ejercicios contraindicados
 * cuando hay una alternativa del mismo slot. Si no hay recambio, se deja el original.
 */
export function applyContraindicationSwaps(exercises, userProfile = {}, extraExcludeIds = []) {
  const lesiones = userProfile.lesiones || [];
  if (!lesiones.length || !Array.isArray(exercises) || !exercises.length) return exercises;

  const used = new Set(
    [...extraExcludeIds, ...exercises.map((e) => e.id)].filter((id) => id != null),
  );

  return exercises.map((ex) => {
    if (!isExerciseContraindicated(ex, lesiones)) return ex;
    const exclude = [...used].filter((id) => id !== ex.id && id !== ex.catalogId);
    const slot = ex.slotConstraints || {
      rol: tagsOf(ex).rol,
      patron: asArray(tagsOf(ex).patron)[0],
      segmento: tagsOf(ex).segmento,
      grupo_muscular: tagsOf(ex).grupo_muscular,
      objetivo: asArray(tagsOf(ex).objetivo)[0],
    };
    const seed = `${userProfile.userId || ""}|injury|${ex.id}|${slot.rol || ""}`;
    let replacement = refreshExercise(ex, userProfile, exclude, seed);
    if (!replacement) {
      replacement = selectExerciseForSlot(
        { ...slot, slotId: `injury_${ex.id}` },
        userProfile,
        exclude,
        seed,
      );
    }
    if (!replacement || isExerciseContraindicated(replacement, lesiones)) return ex;
    used.delete(ex.id);
    used.add(replacement.id);
    return {
      ...ex,
      ...replacement,
      catalogId: replacement.id,
      slotDescription: ex.slotDescription,
      slotConstraints: ex.slotConstraints || slot,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      load: ex.load,
      blockType: ex.blockType,
    };
  });
}

export function injectPreventionExercises(sessionExercises, userProfile, max = 2) {
  const lesiones = userProfile.lesiones || [];
  const ids = getPreventionInjectionIds(lesiones);
  if (!ids.length) return sessionExercises;

  const used = new Set(sessionExercises.map((e) => e.id));
  const pool = filterExercisesForUser(
    catalogPool().filter((ex) => ids.includes(ex.id) && !used.has(ex.id)),
    userProfile,
  );
  if (!pool.length) return sessionExercises;

  let replaced = 0;
  return sessionExercises.map((ex) => {
    if (replaced >= max) return ex;
    const rol = ex.etiquetas?.rol || ex.slotConstraints?.rol;
    if (rol !== "complementario") return ex;
    // Solo sustituir si el ejercicio actual choca con la lesión.
    // Si encaja, se deja: mejor un error razonable que romper el bloque.
    if (!exerciseContraindicated(ex, lesiones)) return ex;
    const slot = ex.slotConstraints || {
      segmento: tagsOf(ex).segmento,
      objetivo: asArray(tagsOf(ex).objetivo)[0],
      rol,
    };
    const cand = pool.filter((p) => sameTrainingNature(p, slot, ex) && p.id !== ex.id && p.id !== ex.catalogId);
    if (!cand.length) return ex;
    const inj = pickDeterministic(cand, `${userProfile.userId}|prev|${replaced}`);
    if (!inj) return ex;
    replaced += 1;
    return {
      ...ex,
      ...inj,
      catalogId: inj.id,
      name: inj.nombre,
      slotDescription: ex.slotDescription || "Prevención por lesión",
      slotConstraints: slot,
      blockType: ex.blockType,
    };
  });
}

/** Compat: APIs antiguas basadas en pool. */
export function getExercisesByPool(poolId) {
  return catalogPool().filter((ex) => ex.pool === poolId);
}

export function getExercisesByPoolFamily(family) {
  return catalogPool().filter((ex) => {
    const et = tagsOf(ex);
    return et.objetivo?.includes(family) || et.segmento === family || ex.pool?.toLowerCase().includes(family);
  });
}

export function getExercisesByPattern(pattern) {
  return catalogPool().filter((ex) => tagsOf(ex).patron?.includes(pattern));
}

export function generateSession(template, userProfile) {
  const session = {
    type: template.title || template.id,
    title: template.title || template.id,
    duration: template.duration,
    intensityLevel: template.intensityLevel || template.intensity,
    blocks: [],
  };
  const fillProfile = { ...userProfile, lesiones: [] };
  let sessionUsedIds = [];
  let sessionUsedPools = [];
  for (const blockTemplate of template.blocks || []) {
    const { exercises, usedIds, usedPools } = fillBlockSlots(
      blockTemplate,
      fillProfile,
      sessionUsedIds,
      sessionUsedPools,
    );
    const swapped = applyContraindicationSwaps(exercises, userProfile, sessionUsedIds);
    session.blocks.push({
      type: blockTemplate.type,
      label: blockTemplate.label,
      duration: blockTemplate.duration,
      exercises: swapped,
    });
    sessionUsedIds = usedIds;
    sessionUsedPools = usedPools;
  }
  return session;
}

export { GYM_UNLOCK, MACHINE_MATERIALS };

export default {
  filterExercisesForUser,
  rankByMaterialPreference,
  isBodyweightMaterial,
  requiresUnavailableEquipment,
  isExerciseAllowedForMaterials,
  selectExerciseForSlot,
  fillBlockSlots,
  refreshExercise,
  generateSession,
  matchSlotTags,
  normalizeMaterialList,
  materialMatches,
  getExercisesByPattern,
};
