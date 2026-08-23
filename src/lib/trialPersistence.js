import { isInTrial } from "./subscription";

/**
 * Acciones que la demo NO debe persistir.
 * En prueba (Standard, 15 días) se puede ver todo; los datos no se guardan.
 * PDF: 1 descarga en trial (ver trialPdfLimit).
 */
export const TRIAL_BLOCKED_ACTIONS = new Set([
  "save_progress",
  "save_loads",
  "save_stats",
  "export_data",
]);

export function canPersistInTrial(user, action) {
  if (!user || !isInTrial(user)) return true;
  return !TRIAL_BLOCKED_ACTIONS.has(action);
}

export function trialPersistBlockedMessage() {
  return "Durante la prueba gratuita (15 días, plan Standard) puedes verlo todo, pero los datos (cargas, progreso, estadísticas) no se guardan. Solo 1 descarga PDF en la prueba. Activa tu suscripción para conservar el progreso.";
}
