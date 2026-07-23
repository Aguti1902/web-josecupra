/** Lectura/escritura del plan del jugador en localStorage (admin ↔ jugador). */

export function playerPlanKey(userId) {
  return `depro_plan_${userId}`;
}

export function loadPlayerPlan(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(playerPlanKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlayerPlan(userId, plan) {
  if (!userId || !plan) return;
  try {
    localStorage.setItem(playerPlanKey(userId), JSON.stringify(plan));
  } catch { /* ignore quota */ }
}

export function clearPlayerPlan(userId) {
  if (!userId) return;
  localStorage.removeItem(playerPlanKey(userId));
}
