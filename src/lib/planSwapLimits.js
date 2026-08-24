/**
 * Límites del mesociclo de planificación individual (~28 días).
 * - Regeneración automática mensual
 * - Máx. 1 cambio de perfil que regenere el plan
 * - Máx. 5 refrescos de ejercicio (propagados a todo el plan)
 */
export const MAX_PLAN_SWAPS = 5;
export const MAX_PROFILE_REGENS_PER_CYCLE = 1;
export const PLAN_CYCLE_DAYS = 28;
export const UNLIMITED_EXERCISES_ADDON = "addon-unlimited-exercises";

export const MAINTENANCE_MESSAGE =
  "Te recomendamos seguir con el entrenamiento indicado. Solo refresca un ejercicio si, por el motivo que sea, no puedes hacerlo. Cambiar ejercicios sin necesidad dificulta la progresión.";

export const SWAP_TOOLTIP =
  "Recomendamos seguir el ejercicio indicado. Refresca solo si no puedes hacerlo. El cambio se aplica en todas las sesiones del plan (máx. 5 por mesociclo).";

function mondayOfDateLocal(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function resolveStart(plan, fallbackDate = new Date()) {
  if (plan?.startDate) return plan.startDate;
  if (plan?._meta?.startDate) return plan._meta.startDate;
  return mondayOfDateLocal(fallbackDate);
}

function swapKey(userId) {
  return `depro_plan_swaps_${userId}`;
}

function profileRegenKey(userId) {
  return `depro_profile_regen_${userId}`;
}

export function planCycleKey(plan) {
  return resolveStart(plan) || mondayOfDateLocal();
}

export function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function cycleEndDate(startDateISO) {
  if (!startDateISO) return null;
  return addDaysISO(startDateISO, PLAN_CYCLE_DAYS);
}

/** True si el mesociclo (startDate + 28 días) ya venció. */
export function needsMonthlyPlanRefresh(plan, now = new Date()) {
  if (!plan || plan.premiumPending || plan.planPendingManual || plan.planError) return false;
  if (plan.source === "admin_manual" || plan.assignment) return false;
  const start = resolveStart(plan);
  if (!start) return false;
  const end = cycleEndDate(start);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const endDate = new Date(`${end}T12:00:00`);
  return today >= endDate;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function alignPeriod(stored, periodKey) {
  if (!stored || stored.periodKey !== periodKey) {
    return { count: 0, periodKey, updatedAt: Date.now() };
  }
  return stored;
}

export function getSwapCount(userId, plan = null) {
  if (!userId) return 0;
  const periodKey = plan ? planCycleKey(plan) : null;
  const stored = readJson(swapKey(userId), { count: 0 });
  if (periodKey) {
    return alignPeriod(stored, periodKey).count || 0;
  }
  return stored.count || 0;
}

export function resetSwapsForCycle(userId, periodKey) {
  if (!userId) return;
  localStorage.setItem(swapKey(userId), JSON.stringify({
    count: 0,
    periodKey: periodKey || mondayOfDateLocal(),
    updatedAt: Date.now(),
  }));
}

export function recordSwap(userId, plan = null) {
  if (!userId) return 0;
  const periodKey = plan ? planCycleKey(plan) : mondayOfDateLocal();
  const aligned = alignPeriod(readJson(swapKey(userId), { count: 0 }), periodKey);
  const count = (aligned.count || 0) + 1;
  localStorage.setItem(swapKey(userId), JSON.stringify({
    count,
    periodKey,
    updatedAt: Date.now(),
  }));
  return count;
}

export function hasUnlimitedSwaps(user) {
  const purchased = user?.purchasedAddons || [];
  return purchased.includes(UNLIMITED_EXERCISES_ADDON);
}

/** Trial sin importar subscription.js (evita supabase en tests Node). */
function userIsInTrial(user) {
  if (!user) return false;
  if (String(user.billingSource || "").toLowerCase() === "manual") return false;
  const status = String(user.subscriptionStatus || "").toLowerCase();
  const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const trialActive = trialEnd ? trialEnd > new Date() : false;
  if (status === "trialing") return trialActive || !trialEnd;
  return trialActive;
}

export function canSwapExercise(user, plan = null) {
  if (!user?.id) return false;
  if (userIsInTrial(user)) return false;
  if (hasUnlimitedSwaps(user)) return true;
  return getSwapCount(user.id, plan) < MAX_PLAN_SWAPS;
}

export function swapsRemaining(user, plan = null) {
  if (!user?.id) return 0;
  if (hasUnlimitedSwaps(user)) return null;
  return Math.max(0, MAX_PLAN_SWAPS - getSwapCount(user.id, plan));
}

/** Fingerprint de campos que regeneran el plan (todo lo editable de entrenamiento). */
export function profileTrainingFingerprint(data = {}) {
  const days = [...(data.disponibles || [])].map(String).sort().join(",");
  const mat = Array.isArray(data.material)
    ? [...data.material].map(String).sort().join(",")
    : String(data.material || "");
  const objetivos = Array.isArray(data.objetivos)
    ? [...data.objetivos].map(String).sort().join(",")
    : String(data.objetivo || data.objetivos || "");
  const lesionesRaw = Array.isArray(data.lesion)
    ? [...data.lesion].map(String)
    : String(data.lesion || "").split(",").map((s) => s.trim()).filter(Boolean);
  const lesiones = lesionesRaw
    .filter((l) => l && !/^ninguna$/i.test(l))
    .sort()
    .join(",");
  const subtipos = Array.isArray(data.lesionSubtipo)
    ? [...data.lesionSubtipo].map(String).sort().join(",")
    : String(data.lesionSubtipo || "");
  const freqRaw = String(data.frecuencia || "");
  const freqN = parseInt(freqRaw.replace(/\D/g, ""), 10);
  const frecuencia = Number.isFinite(freqN) && freqN > 0
    ? `${Math.min(5, freqN)}d`
    : freqRaw;
  return [
    days,
    mat,
    String(data.experiencia || ""),
    String(data.edad || ""),
    String(data.deporte || ""),
    frecuencia,
    objetivos,
    lesiones,
    subtipos,
    String(data.diaCompeticion || data.dia_competicion || ""),
  ].join("|");
}

export function getProfileRegenCount(userId, plan = null) {
  if (!userId) return 0;
  const periodKey = plan ? planCycleKey(plan) : null;
  const stored = readJson(profileRegenKey(userId), { count: 0 });
  if (periodKey) return alignPeriod(stored, periodKey).count || 0;
  return stored.count || 0;
}

export function canRegenerateFromProfile(userId, plan = null, user = null) {
  if (!userId) return false;
  if (user && userIsInTrial(user)) return false;
  const count = getProfileRegenCount(userId, plan);
  if (count < MAX_PROFILE_REGENS_PER_CYCLE) return true;
  // Gracia: el cupo se marcó sin evidencia de regeneración exitosa desde perfil
  // (p. ej. intento incompleto / bug previo). Permite reintentar una vez.
  if (plan && !plan.profileRegenAt && plan.source !== "profile_regen") {
    return true;
  }
  return false;
}

export function recordProfileRegen(userId, plan = null) {
  if (!userId) return 0;
  const periodKey = plan ? planCycleKey(plan) : mondayOfDateLocal();
  const aligned = alignPeriod(readJson(profileRegenKey(userId), { count: 0 }), periodKey);
  const count = (aligned.count || 0) + 1;
  localStorage.setItem(profileRegenKey(userId), JSON.stringify({
    count,
    periodKey,
    at: new Date().toISOString(),
    updatedAt: Date.now(),
  }));
  return count;
}

export function resetProfileRegenForCycle(userId, periodKey) {
  if (!userId) return;
  localStorage.setItem(profileRegenKey(userId), JSON.stringify({
    count: 0,
    periodKey: periodKey || mondayOfDateLocal(),
    updatedAt: Date.now(),
  }));
}

/** Tras regenerar mesociclo (auto o perfil): resetear contadores del nuevo ciclo. */
export function resetCycleCounters(userId, newStartDate) {
  const key = newStartDate || mondayOfDateLocal();
  resetSwapsForCycle(userId, key);
  resetProfileRegenForCycle(userId, key);
}

/** True solo si el plan generado es usable (cupo de regeneración). */
export function isSuccessfulGeneratedPlan(plan) {
  if (!plan || plan.planError || plan.hardBlock || plan.premiumPending || plan.planPendingManual) {
    return false;
  }
  const dayList = Array.isArray(plan) ? plan : (Array.isArray(plan.days) ? plan.days : []);
  const dayHasWork = (d) =>
    (d.sessions || []).some((s) =>
      (s.exercises || []).length > 0
      || (s.blocks || []).some((b) => (b.exercises || []).length > 0),
    );
  if (dayList.some(dayHasWork)) return true;
  if (Array.isArray(plan.weeks)) {
    return plan.weeks.some((w) => {
      if (Array.isArray(w.days) && w.days.some(dayHasWork)) return true;
      return (w.sessions || []).some((s) =>
        (s.exercises || []).length > 0
        || (s.blocks || []).some((b) => (b.exercises || []).length > 0),
      );
    });
  }
  return false;
}
