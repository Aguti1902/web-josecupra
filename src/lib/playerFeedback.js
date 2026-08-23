/**
 * Feedback del preparador físico → jugador.
 * Solo mensajes realmente enviados (sin mocks). Persistencia localStorage.
 */

export function playerFeedbackKey(userId) {
  return `depro_feedback_${userId}`;
}

export function getPlayerFeedback(userId) {
  if (!userId) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(playerFeedbackKey(userId)) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function getActivePlayerFeedback(userId) {
  return getPlayerFeedback(userId).filter((f) => !f.archivedAt);
}

export function getArchivedPlayerFeedback(userId) {
  return getPlayerFeedback(userId).filter((f) => !!f.archivedAt);
}

function persist(userId, list) {
  localStorage.setItem(playerFeedbackKey(userId), JSON.stringify(list.slice(0, 200)));
  return list;
}

/**
 * @param {string} userId
 * @param {object} entry
 * @param {{ coachName?: string }} [meta]
 */
export function addPlayerFeedback(userId, entry, meta = {}) {
  if (!userId || !entry?.message?.trim()) return null;
  const record = {
    id: entry.id || `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: entry.date || new Date().toLocaleDateString("es-ES", {
      day: "numeric", month: "short", year: "numeric",
    }),
    createdAt: entry.createdAt || new Date().toISOString(),
    week: entry.week || "",
    coach: entry.coach || meta.coachName || "Preparador",
    message: String(entry.message).trim(),
    rating: Number.isFinite(Number(entry.rating)) ? Number(entry.rating) : null,
    // Ajustes de carga física (opcional)
    adjustments: Array.isArray(entry.adjustments)
      ? entry.adjustments.filter(Boolean)
      : [],
    // Foco físico próximo (opcional) — no técnico-táctico
    nextFocus: entry.nextFocus ? String(entry.nextFocus).trim() : "",
    archivedAt: null,
  };
  const next = [record, ...getPlayerFeedback(userId)];
  persist(userId, next);
  return record;
}

export function archivePlayerFeedback(userId, feedbackId) {
  if (!userId || !feedbackId) return null;
  const next = getPlayerFeedback(userId).map((f) =>
    String(f.id) === String(feedbackId)
      ? { ...f, archivedAt: new Date().toISOString() }
      : f,
  );
  persist(userId, next);
  return next.find((f) => String(f.id) === String(feedbackId)) || null;
}

export function unarchivePlayerFeedback(userId, feedbackId) {
  if (!userId || !feedbackId) return null;
  const next = getPlayerFeedback(userId).map((f) =>
    String(f.id) === String(feedbackId)
      ? { ...f, archivedAt: null }
      : f,
  );
  persist(userId, next);
  return next.find((f) => String(f.id) === String(feedbackId)) || null;
}

export function deletePlayerFeedback(userId, feedbackId) {
  if (!userId || !feedbackId) return [];
  const next = getPlayerFeedback(userId).filter((f) => String(f.id) !== String(feedbackId));
  return persist(userId, next);
}

/** Último feedback activo (para dashboard). */
export function getLatestPlayerFeedback(userId) {
  const active = getActivePlayerFeedback(userId);
  return active[0] || null;
}
