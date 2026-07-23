/** Límite de sustituciones de ejercicio por plan (~1 mes). */

export const MAX_PLAN_SWAPS = 3;
export const UNLIMITED_EXERCISES_ADDON = "addon-unlimited-exercises";

export const MAINTENANCE_MESSAGE =
  "Para obtener los mejores resultados te recomendamos mantener la misma planificación durante el periodo establecido (aproximadamente un mes). Cambiar constantemente los ejercicios puede dificultar la progresión y el seguimiento de tu rendimiento.";

function swapKey(userId) {
  return `depro_plan_swaps_${userId}`;
}

export function getSwapCount(userId) {
  if (!userId) return 0;
  try {
    const raw = localStorage.getItem(swapKey(userId));
    return raw ? JSON.parse(raw).count || 0 : 0;
  } catch {
    return 0;
  }
}

export function recordSwap(userId) {
  const count = getSwapCount(userId) + 1;
  localStorage.setItem(swapKey(userId), JSON.stringify({ count, updatedAt: Date.now() }));
  return count;
}

export function hasUnlimitedSwaps(user) {
  const purchased = user?.purchasedAddons || [];
  return purchased.includes(UNLIMITED_EXERCISES_ADDON);
}

export function canSwapExercise(user) {
  if (!user?.id) return false;
  if (hasUnlimitedSwaps(user)) return true;
  return getSwapCount(user.id) < MAX_PLAN_SWAPS;
}

export function swapsRemaining(user) {
  if (!user?.id) return 0;
  if (hasUnlimitedSwaps(user)) return null;
  return Math.max(0, MAX_PLAN_SWAPS - getSwapCount(user.id));
}
