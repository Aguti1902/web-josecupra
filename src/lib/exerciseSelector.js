/**
 * DEPRO - Motor de Selección de Ejercicios v2.0
 * Selección por pool, material, lesiones, edad y experiencia.
 */
import { POOLS, POOL_COMPATIBILITY } from "./poolDefinitions.js";
import { EXERCISES } from "./exerciseCatalog.js";

const EXP_LEVELS = { novato: 1, intermedio: 2, avanzado: 3 };

const LESION_ALIASES = {
  rodilla: "rodilla_aguda",
  tobillo: "tobillo_inestable",
  hombro: "hombro_agudo",
  espalda: "espalda_aguda",
  pubalgia: "pubalgia",
  isquios: "isquios_agudo",
  gemelo: "gemelo_agudo",
};

function normalizeLesionKey(l) {
  const key = String(l || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  return LESION_ALIASES[key] || key;
}

function normalizeMaterialList(material) {
  if (Array.isArray(material)) {
    return material.map((m) =>
      String(m || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s|\//g, "_")
        .replace("barra_gimnasio", "barra")
        .replace("gimnasio_completo", "barra")
        .replace("campo", "sin_material")
    );
  }
  const one = String(material || "sin_material")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s|\//g, "_");
  return [one || "sin_material"];
}

export function getExercisesByPool(poolId) {
  return EXERCISES.filter((ex) => ex.pool === poolId);
}

export function getExercisesByPoolFamily(family) {
  const familyPools = Object.keys(POOLS).filter((id) => POOLS[id].familia === family);
  return EXERCISES.filter((ex) => familyPools.includes(ex.pool));
}

export function getExercisesByPattern(pattern) {
  const patternPools = POOL_COMPATIBILITY[pattern] || [];
  return EXERCISES.filter((ex) => patternPools.includes(ex.pool));
}

export function filterExercisesForUser(exercises, userProfile = {}) {
  const {
    material = [],
    lesiones = [],
    edad = 18,
    experiencia = "intermedio",
  } = userProfile;

  const mats = normalizeMaterialList(material);
  const userLesions = lesiones.map(normalizeLesionKey);

  return exercises.filter((ex) => {
    const poolInfo = POOLS[ex.pool];
    if (
      poolInfo?.material
      && poolInfo.material !== "sin_material"
      && !mats.includes(poolInfo.material)
      && !mats.includes("barra") && poolInfo.material === "maquina"
    ) {
      // máquina solo si tiene barra/gimnasio
      if (!mats.some((m) => ["maquina", "barra", "gimnasio_completo"].includes(m))) return false;
    } else if (
      poolInfo?.material
      && poolInfo.material !== "sin_material"
      && !mats.includes(poolInfo.material)
    ) {
      return false;
    }

    if (ex.lesionesContra?.some((l) => userLesions.includes(normalizeLesionKey(l)))) {
      return false;
    }

    if (ex.edadMinima && edad < ex.edadMinima) return false;

    if (poolInfo?.experienciaMinima) {
      if ((EXP_LEVELS[experiencia] || 2) < (EXP_LEVELS[poolInfo.experienciaMinima] || 2)) {
        return false;
      }
    }

    if (poolInfo?.edadMinima && edad < poolInfo.edadMinima) return false;

    return true;
  });
}

export function selectExerciseForSlot(slot, userProfile, usedExerciseIds = [], usedPools = []) {
  let candidates = [];

  if (slot.pool) {
    candidates = getExercisesByPool(slot.pool);
  } else if (slot.poolFamily) {
    candidates = getExercisesByPoolFamily(slot.poolFamily);
  } else if (slot.poolPattern) {
    candidates = getExercisesByPattern(slot.poolPattern);
  }

  candidates = filterExercisesForUser(candidates, userProfile);

  const blockRules = slot.rules || {};
  if (blockRules.noRepeatSession || usedExerciseIds.length) {
    candidates = candidates.filter((ex) => !usedExerciseIds.includes(ex.id));
  }
  if (blockRules.distinctPools && usedPools.length) {
    candidates = candidates.filter((ex) => !usedPools.includes(ex.pool));
  }

  // Fallback: relajar material (priorizar sin_material del mismo pool)
  if (candidates.length === 0 && slot.pool) {
    const poolCandidates = getExercisesByPool(slot.pool).filter((ex) => !usedExerciseIds.includes(ex.id));
    const sinMat = poolCandidates.filter((ex) => {
      const m = POOLS[ex.pool]?.material;
      return !m || m === "sin_material";
    });
    candidates = filterExercisesForUser(sinMat, { ...userProfile, material: ["sin_material"] });
  }

  // Fallback: mismo patrón/familia con material relajado
  if (candidates.length === 0 && slot.poolPattern) {
    candidates = getExercisesByPattern(slot.poolPattern);
    candidates = filterExercisesForUser(candidates, { ...userProfile, material: ["sin_material"] });
    candidates = candidates.filter((ex) => !usedExerciseIds.includes(ex.id));
  }

  if (candidates.length === 0 && slot.poolFamily) {
    candidates = getExercisesByPoolFamily(slot.poolFamily);
    candidates = filterExercisesForUser(candidates, { ...userProfile, material: ["sin_material"] });
    candidates = candidates.filter((ex) => !usedExerciseIds.includes(ex.id));
  }

  if (candidates.length === 0 && slot.fallback) {
    candidates = getExercisesByPool(slot.fallback);
    candidates = filterExercisesForUser(candidates, userProfile);
    candidates = candidates.filter((ex) => !usedExerciseIds.includes(ex.id));
  }

  // Último recurso: pool sin filtro de lesión (evita sesión vacía)
  if (candidates.length === 0 && (slot.pool || slot.poolPattern || slot.poolFamily)) {
    let raw = [];
    if (slot.pool) raw = getExercisesByPool(slot.pool);
    else if (slot.poolPattern) raw = getExercisesByPattern(slot.poolPattern);
    else if (slot.poolFamily) raw = getExercisesByPoolFamily(slot.poolFamily);
    candidates = filterExercisesForUser(raw, { ...userProfile, lesiones: [] })
      .filter((ex) => !usedExerciseIds.includes(ex.id));
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getVolume(experiencia, blockType) {
  if (blockType === "calentamiento" || blockType === "vuelta_calma") {
    return { sets: 1, reps: "30–60\"", rest: "30\"" };
  }
  const volumes = {
    novato: { sets: 2, reps: "12-15", rest: "60\"" },
    intermedio: { sets: 3, reps: "8-12", rest: "60-90\"" },
    avanzado: { sets: "3-4", reps: "6-10", rest: "90-120\"" },
  };
  return volumes[experiencia] || volumes.intermedio;
}

export function fillBlockSlots(block, userProfile, sessionUsedIds = [], sessionUsedPools = []) {
  const exercises = [];
  const blockUsedIds = [...sessionUsedIds];
  const blockUsedPools = [...sessionUsedPools];

  for (const slot of block.slots || []) {
    const qty = slot.qty || 1;
    for (let i = 0; i < qty; i++) {
      const mergedRules = { ...block.rules, ...slot.rules };
      const exercise = selectExerciseForSlot(
        { ...slot, rules: mergedRules },
        userProfile,
        blockUsedIds,
        block.rules?.distinctPools ? blockUsedPools : [],
      );

      if (exercise) {
        const vol = slot.volume || getVolume(userProfile.experiencia, block.type);
        exercises.push({
          ...exercise,
          slotDescription: slot.description,
          sets: vol.sets,
          reps: vol.reps,
          rest: vol.rest,
        });
        blockUsedIds.push(exercise.id);
        blockUsedPools.push(exercise.pool);
      } else if (!slot.optional) {
        console.warn(`[DEPRO] Sin ejercicio para slot: ${slot.description || slot.pool || slot.poolPattern}`);
      }
    }
  }

  return { exercises, usedIds: blockUsedIds, usedPools: blockUsedPools };
}

/** Sustituye un ejercicio SOLO dentro del mismo pool */
export function refreshExercise(currentExercise, userProfile, excludeIds = []) {
  let candidates = getExercisesByPool(currentExercise.pool);
  candidates = filterExercisesForUser(candidates, userProfile);
  candidates = candidates.filter(
    (ex) => ex.id !== currentExercise.id && !excludeIds.includes(ex.id),
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
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

export default {
  getExercisesByPool,
  getExercisesByPoolFamily,
  getExercisesByPattern,
  filterExercisesForUser,
  selectExerciseForSlot,
  fillBlockSlots,
  refreshExercise,
  generateSession,
};
