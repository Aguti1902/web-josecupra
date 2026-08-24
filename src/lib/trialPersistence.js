import { isInTrial } from "./subscription.js";
import { TRIAL_LIMITED_MESSAGE } from "./trialMessages.js";

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

export { TRIAL_LIMITED_MESSAGE };

export function trialFeatureLimitedMessage() {
  return TRIAL_LIMITED_MESSAGE;
}

export function trialPersistBlockedMessage() {
  return TRIAL_LIMITED_MESSAGE;
}
