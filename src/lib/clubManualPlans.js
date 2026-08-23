/**
 * Planificación de clubs «llevados por mí»:
 * - Admin /planificacion (GLOBAL_PLANS) se copia a todos los clubs manuales.
 * - Editar en la ficha de un club solo cambia ese club.
 * - El panel del club manual lee club.plans (con fallback a global).
 */
import { isManualPlanningClub } from "./clubAuto/clubAutoCoachBridge.js";

export const GLOBAL_PLANS_CLUB_ID = "GLOBAL_PLANS";

export function clonePlans(plans) {
  try {
    return JSON.parse(JSON.stringify(Array.isArray(plans) ? plans : []));
  } catch {
    return [];
  }
}

/** Clubs academia en modo manual. Excluye ProCoach y el blob global. */
export function isBroadcastTargetClub(club) {
  if (!club?.id || club.id === GLOBAL_PLANS_CLUB_ID) return false;
  if (club.isSoloCoach || String(club.id).startsWith("coach_")) return false;
  return isManualPlanningClub(club);
}

/**
 * Qué planes ve el panel del club.
 * Manual con copia propia → esa copia. Si aún no hay, GLOBAL_PLANS.
 * Automático / ProCoach → GLOBAL_PLANS (ProCoach no usa esta vía).
 */
export function resolveClubPanelPlans(club, globalPlans = []) {
  const global = Array.isArray(globalPlans) ? globalPlans : [];
  if (isManualPlanningClub(club) && !club?.isSoloCoach) {
    const own = Array.isArray(club?.plans) ? club.plans : [];
    if (own.length) return own;
    return global;
  }
  return global;
}

/** Elige planes desde la respuesta de /api/admin-clubs para el panel del club. */
export function pickPlansFromAdminClubsResponse(clubs, club, fallbackGlobal = []) {
  const list = Array.isArray(clubs) ? clubs : [];
  const globalEntry = list.find((c) => c.id === GLOBAL_PLANS_CLUB_ID);
  const global = globalEntry?.plans?.length ? globalEntry.plans : fallbackGlobal;
  if (isManualPlanningClub(club) && !club?.isSoloCoach && club?.id) {
    const mine = list.find((c) => c.id === club.id);
    return resolveClubPanelPlans({ ...club, plans: mine?.plans ?? club.plans }, global);
  }
  return global;
}

export async function broadcastGlobalPlansToManualClubs(plans) {
  const { loadClubs, loadClubDetail, saveClubDetail } = await import("./adminStorage.js");
  const cloned = clonePlans(plans);
  const clubs = await loadClubs();
  const targets = (clubs || []).filter(isBroadcastTargetClub);
  const at = new Date().toISOString();
  for (const club of targets) {
    const detail = loadClubDetail(club.id) || club;
    await saveClubDetail(club.id, {
      ...detail,
      plans: clonePlans(cloned),
      plansSource: "global",
      plansInheritedAt: at,
    });
  }
  return targets.length;
}
