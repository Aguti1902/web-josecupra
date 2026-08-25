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

const LESION_INJECTION = {
  rodilla: [134, 137, 138, 139, 143],
  tobillo: [134, 135, 140, 141],
  hombro: [144, 145, 146, 148],
  espalda: [145, 147],
  pubalgia: [137, 138, 143],
};

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
  if (slot.material) {
    const needed = asArray(slot.material).map((m) => String(m).toLowerCase());
    const wantsBody = needed.some((m) => /sin.?material|peso.?corporal|bodyweight/.test(m));
    if (wantsBody) {
      if (!isBodyweightMaterial(et.material)) return false;
    } else if (!matchesAny(needed, et.material)) {
      return false;
    }
  }
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

    const contra = et.contraindicado || ex.lesionesContra || [];
    if (contra.some((c) => lesiones.includes(c) || lesiones.includes(c.replace(/^lesion_/, "")))) {
      return false;
    }
    if (lesiones.length && contra.some((c) => lesiones.some((l) => c.includes(l.replace(/^lesion_/, "")) || l.includes(c.replace(/^lesion_/, ""))))) {
      return false;
    }

    if (dayIntensity === "baja" && et.intensidad === "alta" && et.rol === "basico") {
      // se permite; la adaptación de cargas se aplica en el motor
    }

    if (ex.edadMinima && (userProfile.edad || 18) < ex.edadMinima) return false;
    return true;
  });
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
 * Relaja filtros menos críticos primero (grupo_muscular antes que patron).
 * El slot NUNCA debe quedar vacío: al final solo queda rol/patron mínimo.
 */
function relaxSlot(slot, step) {
  const next = { ...slot };

  // 1) Intensidad (menos crítica)
  if (step === 1 && next.intensidad) {
    delete next.intensidad;
    return next;
  }
  // 2) Objetivo
  if (step === 2 && next.objetivo) {
    delete next.objetivo;
    return next;
  }
  // 3) Segmento
  if (step === 3 && next.segmento) {
    delete next.segmento;
    return next;
  }
  // 4) Grupo muscular (antes que patrón — PDF §5.3)
  if (step === 4 && next.grupo_muscular) {
    delete next.grupo_muscular;
    return next;
  }
  // 5) Patrón (último filtro de etiqueta)
  if (step === 5 && (next.patron || next.patronOr)) {
    delete next.patron;
    delete next.patronOr;
    delete next.patronMode;
    return next;
  }
  return null;
}

function pickFrom(candidates, userProfile, slot, usedExerciseIds, seedExtra) {
  if (!candidates.length) return null;
  const seed = [
    userProfile?.userId || "",
    userProfile?.week || "",
    slot.slotId || slot.description || "",
    slot.rol || "",
    slot.patron || "",
    slot.segmento || "",
    (slot.grupo_muscular || []).toString?.() || slot.grupo_muscular || "",
    usedExerciseIds.join(","),
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

  let candidates = filterPool(EXERCISES.filter((ex) => matchSlotTags(ex, slot)));

  for (let step = 1; candidates.length === 0 && step <= 5; step++) {
    const relaxed = relaxSlot(slot, step);
    if (!relaxed) break;
    // Evitar bucles sin progreso (misma restricción)
    const same =
      JSON.stringify({
        g: slot.grupo_muscular,
        i: slot.intensidad,
        o: slot.objetivo,
        s: slot.segmento,
        p: slot.patron,
      }) ===
      JSON.stringify({
        g: relaxed.grupo_muscular,
        i: relaxed.intensidad,
        o: relaxed.objetivo,
        s: relaxed.segmento,
        p: relaxed.patron,
      });
    if (same) continue;
    candidates = filterPool(EXERCISES.filter((ex) => matchSlotTags(ex, relaxed)));
  }

  // Reutilizar ejercicio ya usado en la sesión si el pool se agotó (antes que dejar el slot vacío)
  if (!candidates.length) {
    candidates = filterPool(EXERCISES.filter((ex) => matchSlotTags(ex, slot)), true);
    for (let step = 1; candidates.length === 0 && step <= 5; step++) {
      const relaxed = relaxSlot(slot, step);
      if (!relaxed) break;
      candidates = filterPool(EXERCISES.filter((ex) => matchSlotTags(ex, relaxed)), true);
    }
  }

  // Último recurso: mismo rol (mantiene estructura de plantilla)
  if (!candidates.length && slot.rol) {
    candidates = filterPool(
      EXERCISES.filter((ex) => tagsOf(ex).rol === slot.rol),
      true,
    );
  }

  // Calentamiento / core: pool amplio
  if (!candidates.length && (slot.rol === "calentamiento" || slot.rol === "core")) {
    candidates = filterPool(
      EXERCISES.filter((ex) => matchSlotTags(ex, { rol: slot.rol }) || tagsOf(ex).rol === slot.rol),
      true,
    );
  }

  if (!candidates.length) return null;
  const ranked = rankByMaterialPreference(candidates, userProfile);
  // Prioridad: material del perfil → solo peso corporal (nunca otro equipo)
  const mats = normalizeMaterialList(userProfile.material);
  const preferMatched = ranked.filter((ex) => materialMatches(tagsOf(ex).material, mats));
  const bodyFallback = ranked.filter((ex) => isBodyweightMaterial(tagsOf(ex).material));
  const pool = preferMatched.length ? preferMatched : bodyFallback;
  if (!pool.length) return null;
  return pickFrom(pool, userProfile, slot, usedExerciseIds, seedExtra);
}

export function getVolume(experiencia, blockType, objective = "fuerza", adaptedIntensity = null) {
  if (blockType === "calentamiento" || blockType === "vuelta_calma" || blockType === "activacion") {
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
        const fallback = getVolume(userProfile.experiencia, block.type, objective, adapted);
        const vol = slot.volume ? { ...fallback, ...slot.volume } : fallback;
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

  let candidates = EXERCISES.filter((ex) => matchSlotTags(ex, constraints));
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
  const ids = new Set();
  for (const l of lesiones) {
    const key = String(l || "").toLowerCase().replace(/^lesion_/, "");
    (LESION_INJECTION[key] || []).forEach((id) => ids.add(id));
  }
  return [...ids];
}

export function injectPreventionExercises(sessionExercises, userProfile, max = 2) {
  const ids = getPreventionInjectionIds(userProfile.lesiones || []);
  if (!ids.length) return sessionExercises;

  const used = new Set(sessionExercises.map((e) => e.id));
  const pool = filterExercisesForUser(
    EXERCISES.filter((ex) => ids.includes(ex.id) && !used.has(ex.id)),
    userProfile,
  );
  if (!pool.length) return sessionExercises;

  const injections = [];
  for (let i = 0; i < max && i < pool.length; i++) {
    const picked = pickDeterministic(pool.filter((p) => !injections.find((x) => x.id === p.id)), `${userProfile.userId}|prev|${i}`);
    if (picked) injections.push(picked);
  }
  if (!injections.length) return sessionExercises;

  // Sustituye complementarios estándar
  let replaced = 0;
  return sessionExercises.map((ex) => {
    if (replaced >= injections.length) return ex;
    const rol = ex.etiquetas?.rol || ex.slotConstraints?.rol;
    if (rol === "complementario") {
      const inj = injections[replaced++];
      return {
        ...ex,
        ...inj,
        catalogId: inj.id,
        name: inj.nombre,
        slotDescription: "Prevención por lesión",
      };
    }
    return ex;
  });
}

/** Compat: APIs antiguas basadas en pool. */
export function getExercisesByPool(poolId) {
  return EXERCISES.filter((ex) => ex.pool === poolId);
}

export function getExercisesByPoolFamily(family) {
  return EXERCISES.filter((ex) => {
    const et = tagsOf(ex);
    return et.objetivo?.includes(family) || et.segmento === family || ex.pool?.toLowerCase().includes(family);
  });
}

export function getExercisesByPattern(pattern) {
  return EXERCISES.filter((ex) => tagsOf(ex).patron?.includes(pattern));
}

export function generateSession(template, userProfile) {
  const session = {
    type: template.title || template.id,
    title: template.title || template.id,
    duration: template.duration,
    intensityLevel: template.intensityLevel || template.intensity,
    blocks: [],
  };
  let sessionUsedIds = [];
  let sessionUsedPools = [];
  for (const blockTemplate of template.blocks || []) {
    const { exercises, usedIds, usedPools } = fillBlockSlots(
      blockTemplate,
      userProfile,
      sessionUsedIds,
      sessionUsedPools,
    );
    session.blocks.push({
      type: blockTemplate.type,
      label: blockTemplate.label,
      duration: blockTemplate.duration,
      exercises,
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
  getVolume,
};
