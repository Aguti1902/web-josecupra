import { isInTrial } from "./subscription";

/**
 * Acciones que la demo NO debe persistir (PDF §6).
 * PDF de sesión: permitido en trial con límite de 3 (ver trialPdfLimit).
 * Cargas UI: se puede explorar; save_loads sigue bloqueado.
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
  return "Durante la prueba gratuita puedes explorar esta función, pero los datos (cargas, progreso, estadísticas) no se guardarán al cerrar sesión. Los PDF tienen un límite de 3 descargas en la prueba. Activa tu suscripción para conservar tu progreso y descargas ilimitadas.";
}
