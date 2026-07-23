import { isInTrial } from "./subscription";

/** Acciones que la demo NO debe persistir (PDF §6). */
export const TRIAL_BLOCKED_ACTIONS = new Set([
  "pdf_export",
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
  return "Durante la prueba gratuita puedes explorar esta función, pero los datos no se guardarán al cerrar sesión. Activa tu suscripción para conservar tu progreso.";
}
