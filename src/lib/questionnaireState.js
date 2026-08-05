/**
 * Estados del cuestionario / onboarding (correcciones finales §4).
 * Persiste en localStorage para evitar estados fantasma al reentrar.
 */

export const Q_STATUS = {
  NOT_STARTED: "no_iniciado",
  IN_PROGRESS: "en_proceso",
  COMPLETED: "completado",
  CANCELLED: "cancelado",
};

const KEY = (audience, userKey) => `depro_qstate_${audience}_${userKey || "anon"}`;

export function loadQuestionnaireState(audience, userKey) {
  try {
    const raw = localStorage.getItem(KEY(audience, userKey));
    if (!raw) return { status: Q_STATUS.NOT_STARTED, step: 1, form: null, updatedAt: null };
    return JSON.parse(raw);
  } catch {
    return { status: Q_STATUS.NOT_STARTED, step: 1, form: null, updatedAt: null };
  }
}

export function saveQuestionnaireState(audience, userKey, patch) {
  const prev = loadQuestionnaireState(audience, userKey);
  const next = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY(audience, userKey), JSON.stringify(next));
  } catch { /* ignore */ }
  return next;
}

export function markQuestionnaireInProgress(audience, userKey, { step, form } = {}) {
  return saveQuestionnaireState(audience, userKey, {
    status: Q_STATUS.IN_PROGRESS,
    ...(step != null ? { step } : {}),
    ...(form != null ? { form } : {}),
  });
}

export function markQuestionnaireCompleted(audience, userKey) {
  return saveQuestionnaireState(audience, userKey, {
    status: Q_STATUS.COMPLETED,
    form: null,
  });
}

export function cancelQuestionnaire(audience, userKey) {
  return saveQuestionnaireState(audience, userKey, {
    status: Q_STATUS.CANCELLED,
    step: 1,
    form: null,
  });
}

export function resetQuestionnaire(audience, userKey) {
  try {
    localStorage.removeItem(KEY(audience, userKey));
  } catch { /* ignore */ }
  return { status: Q_STATUS.NOT_STARTED, step: 1, form: null, updatedAt: null };
}

/** ¿Debe forzarse al usuario a completar el setup? */
export function shouldForceSetup(audience, userKey, { hasClubId } = {}) {
  if (hasClubId) return false;
  const st = loadQuestionnaireState(audience, userKey);
  if (st.status === Q_STATUS.CANCELLED) return false;
  if (st.status === Q_STATUS.COMPLETED) return false;
  return true;
}
