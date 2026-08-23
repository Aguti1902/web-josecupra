/**
 * Selección de ejercicios para slots de protocolo club automático.
 * Prioriza etiquetas club_* (capa paralela) y cae a nombres del catálogo club.
 * No muta etiquetas del motor individual.
 */
import { EXERCISES } from "../exerciseCatalog.js";
import { CLUB_SLOT_EXERCISE_NAMES } from "../../data/clubAutoCatalog.js";
import { getProtocolTemplate } from "./clubAutoTemplates.js";
import { getClubTagsForExercise } from "./clubExerciseTags.js";
import { isExerciseAllowedForMaterials, normalizeMaterialList } from "../exerciseSelector.js";

function stableIndex(seed, length) {
  if (length <= 0) return 0;
  let hash = 5381;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clubSlotTag(slotKey) {
  return `club_slot_${slotKey}`;
}

function findExercisesForSlot(slotKey, { gymAccess, protocolo } = {}) {
  const tag = clubSlotTag(slotKey);
  const byTag = [];
  for (const ex of EXERCISES) {
    if (ex.esTest || /\btest\b/i.test(ex.nombre || "")) continue;
    const clubTags = getClubTagsForExercise(ex.id);
    if (!clubTags?.club_slot?.includes(tag)) continue;
    if (protocolo) {
      const want = `club_protocolo_${protocolo}`;
      const protos = clubTags.club_protocolo || [];
      // Soft filter: prefer matching protocol; keep if untagged or multi-tagged including want
      if (protos.length === 1 && !protos.includes(want)) continue;
    }
    if (gymAccess === false && clubTags.club_entorno?.length && !clubTags.club_entorno.includes("club_campo")) {
      continue;
    }
    byTag.push(ex);
  }
  if (byTag.length) return byTag;

  const names = CLUB_SLOT_EXERCISE_NAMES[slotKey] || [];
  const found = [];
  for (const name of names) {
    const target = normalizeName(name);
    const match = EXERCISES.find((ex) => {
      const n = normalizeName(ex.nombre);
      return n.includes(target) || target.includes(n) || n.startsWith(target.slice(0, 12));
    });
    if (match && !found.find((f) => f.id === match.id)) found.push(match);
  }
  // Fallback: patrón/rol aproximado desde etiquetas multi-eje
  if (!found.length) {
    const hint = slotKey.replace(/_/g, " ");
    for (const ex of EXERCISES) {
      const blob = `${ex.nombre} ${(ex.etiquetas?.patron || []).join(" ")} ${(ex.etiquetas?.grupo_muscular || []).join(" ")}`.toLowerCase();
      if (hint.split(" ").some((w) => w.length > 4 && blob.includes(w))) {
        found.push(ex);
        if (found.length >= 6) break;
      }
    }
  }
  return found;
}

function materialOk(ex, gymAccess, materials = []) {
  const mats = normalizeMaterialList(materials);
  const hasGymKit = mats.includes("gym_completo") || gymAccess;
  if (hasGymKit && mats.includes("gym_completo")) {
    return isExerciseAllowedForMaterials(ex.etiquetas?.material || [], materials.length ? materials : ["gym_completo"]);
  }
  if (!hasGymKit) {
    const exMats = ex.etiquetas?.material || [];
    if (exMats.some((m) => String(m).startsWith("maquina") || m === "barra" || m === "gym_completo")) {
      return false;
    }
  }
  if (!materials.length) {
    return isExerciseAllowedForMaterials(ex.etiquetas?.material || [], gymAccess ? ["gym_completo"] : ["sin_material"]);
  }
  return isExerciseAllowedForMaterials(ex.etiquetas?.material || [], materials);
}

/**
 * Rellena los 6 slots del protocolo A/B/C (campo o gym).
 */
export function selectProtocolExercises({ protocolo, gymAccess, seed = "", usedIds = [], materials = [] }) {
  const template = getProtocolTemplate(protocolo, gymAccess);
  const used = new Set(usedIds);
  const exercises = [];

  template.slots.forEach((slotDef, idx) => {
    const keys = [slotDef.slot, ...(slotDef.alt || [])];
    let candidates = [];
    for (const key of keys) {
      candidates = findExercisesForSlot(key, { gymAccess, protocolo }).filter(
        (ex) => materialOk(ex, gymAccess, materials) && !used.has(ex.id),
      );
      if (candidates.length) break;
    }
    if (!candidates.length) {
      candidates = findExercisesForSlot(slotDef.slot, { gymAccess, protocolo }).filter(
        (ex) => materialOk(ex, gymAccess, materials) && !used.has(ex.id),
      );
    }
    if (!candidates.length) {
      // §4.4: no renderizar bloques sin ejercicios etiquetados
      return;
    }
    const picked = candidates[stableIndex(`${seed}|${protocolo}|${slotDef.slot}|${idx}`, candidates.length)];
    used.add(picked.id);
    exercises.push({
      slot: slotDef.slot,
      label: slotDef.label,
      club_slot: slotDef.slot,
      club_protocolo: protocolo,
      club_entorno: gymAccess ? "gym" : "campo",
      nombre: picked.nombre,
      catalogId: picked.id,
      videoUrl: picked.videoUrl || "",
      descripcion: Array.isArray(picked.tips) ? picked.tips.join(" · ") : (picked.descripcion || ""),
      description: Array.isArray(picked.tips) ? picked.tips.join(" · ") : (picked.descripcion || ""),
      tips: picked.tips || [],
      sets: gymAccess && String(slotDef.slot).includes("fuerza") ? "3×8-10" : "45\"",
      rest: gymAccess && String(slotDef.slot).includes("fuerza") ? "60-90\"" : "15\"",
      etiquetas: picked.etiquetas,
    });
  });

  return { template, exercises, usedIds: [...used] };
}
