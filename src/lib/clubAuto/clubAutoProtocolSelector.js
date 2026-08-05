/**
 * Selección de ejercicios para slots de protocolo club automático.
 * Usa capa paralela de nombres (clubAutoCatalog) + exerciseCatalog base.
 * No muta etiquetas del motor individual.
 */
import { EXERCISES } from "../exerciseCatalog.js";
import { CLUB_SLOT_EXERCISE_NAMES } from "../../data/clubAutoCatalog.js";
import { getProtocolTemplate } from "./clubAutoTemplates.js";

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

function findExercisesForSlot(slotKey) {
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

function materialOk(ex, gymAccess) {
  const mats = ex.etiquetas?.material || [];
  if (gymAccess) return true;
  // sin gym: evitar máquinas
  return !mats.some((m) => String(m).startsWith("maquina") || m === "barra" || m === "gym_completo");
}

/**
 * Rellena los 6 slots del protocolo A/B/C (campo o gym).
 */
export function selectProtocolExercises({ protocolo, gymAccess, seed = "", usedIds = [] }) {
  const template = getProtocolTemplate(protocolo, gymAccess);
  const used = new Set(usedIds);
  const exercises = [];

  template.slots.forEach((slotDef, idx) => {
    const keys = [slotDef.slot, ...(slotDef.alt || [])];
    let candidates = [];
    for (const key of keys) {
      candidates = findExercisesForSlot(key).filter((ex) => materialOk(ex, gymAccess) && !used.has(ex.id));
      if (candidates.length) break;
    }
    if (!candidates.length) {
      candidates = findExercisesForSlot(slotDef.slot).filter((ex) => !used.has(ex.id));
    }
    if (!candidates.length) {
      exercises.push({
        slot: slotDef.slot,
        label: slotDef.label,
        nombre: `Slot ${slotDef.label} (sin candidato)`,
        catalogId: null,
        sets: "45\"",
        rest: "15\"",
        missing: true,
      });
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
      sets: gymAccess && String(slotDef.slot).includes("fuerza") ? "3×8-10" : "45\"",
      rest: gymAccess && String(slotDef.slot).includes("fuerza") ? "60-90\"" : "15\"",
      etiquetas: picked.etiquetas,
    });
  });

  return { template, exercises, usedIds: [...used] };
}
