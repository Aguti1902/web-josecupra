/**
 * Límite de PDFs en prueba gratuita (máx. 3 descargas).
 */
const KEY = (userId) => `depro_trial_pdf_count_${userId || "anon"}`;
export const TRIAL_PDF_MAX = 3;

export function getTrialPdfCount(userId) {
  try {
    return Math.max(0, parseInt(localStorage.getItem(KEY(userId)) || "0", 10) || 0);
  } catch {
    return 0;
  }
}

export function canDownloadTrialPdf(userId) {
  return getTrialPdfCount(userId) < TRIAL_PDF_MAX;
}

export function recordTrialPdfDownload(userId) {
  const next = getTrialPdfCount(userId) + 1;
  try {
    localStorage.setItem(KEY(userId), String(next));
  } catch { /* ignore */ }
  return next;
}

export function trialPdfLimitMessage() {
  return `En la prueba gratuita puedes descargar hasta ${TRIAL_PDF_MAX} PDFs. Activa tu suscripción para descargas ilimitadas.`;
}
