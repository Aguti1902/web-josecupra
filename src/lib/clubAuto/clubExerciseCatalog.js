/**
 * Catálogo de ejercicios para clubs: mismos ejercicios que el motor individual,
 * con etiquetas de plantilla club (movilidad de cadera, bisagra, glúteo, etc.).
 * No muta exerciseCatalog ni las etiquetas del jugador.
 */
import { EXERCISES } from "../exerciseCatalog.js";
import { getClubTagsForExercise, CLUB_SLOT_LABELS, SLOT_RULES } from "./clubExerciseTags.js";
import { CLUB_AUTO_PROTOCOL_TEMPLATES, PROTOCOL_DAY_META } from "./clubAutoTemplates.js";
import { AGE_BLOCK_LABELS } from "../../data/clubAutoCatalog.js";

export { CLUB_SLOT_LABELS, SLOT_RULES, AGE_BLOCK_LABELS };

export function clubSlotLabel(slotId) {
  if (CLUB_SLOT_LABELS[slotId]) return CLUB_SLOT_LABELS[slotId];
  const key = String(slotId || "").replace(/^club_slot_/, "");
  return CLUB_SLOT_LABELS[`club_slot_${key}`] || key.replace(/_/g, " ");
}

/** Plantillas Campo/Gym A·B·C que usan este slot (para que la IA sepa dónde va). */
export function protocolsUsingClubSlot(slotId) {
  const key = String(slotId || "").replace(/^club_slot_/, "");
  const out = [];
  for (const t of Object.values(CLUB_AUTO_PROTOCOL_TEMPLATES)) {
    const hit = (t.slots || []).some((s) => s.slot === key || (s.alt || []).includes(key));
    if (!hit) continue;
    const env = t.entorno === "gym" ? "Gym" : "Campo";
    const day = PROTOCOL_DAY_META[t.protocolo]?.label || t.protocolo;
    out.push({
      id: t.id,
      short: `${env} ${t.protocolo}`,
      title: t.title,
      day,
    });
  }
  return out;
}

/** Ejercicios individuales duplicados a la vista club, con etiquetas de plantilla. */
export function getClubExerciseCatalog() {
  return EXERCISES.filter((ex) => !ex.esTest && !/\btest\b/i.test(ex.nombre || "")).map((ex) => {
    const tags = getClubTagsForExercise(ex.id);
    const slots = tags?.club_slot || [];
    return {
      ...ex,
      clubTags: tags,
      clubSlots: slots.map((id) => ({ id, label: clubSlotLabel(id) })),
    };
  });
}

export function exercisesForClubSlot(slotKey) {
  const tag = String(slotKey).startsWith("club_slot_") ? slotKey : `club_slot_${slotKey}`;
  return getClubExerciseCatalog().filter((ex) => ex.clubTags?.club_slot?.includes(tag));
}
