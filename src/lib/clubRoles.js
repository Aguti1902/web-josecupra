export const CLUB_ADMIN_ROLE = "administrador";
export const CLUB_COORD_ROLE = "coordinador";
export const CLUB_COACH_ROLES = ["entrenador", "ayudante"];

export function isClubAdmin(user) {
  return user?.role === "club" && user?.team_role === CLUB_ADMIN_ROLE;
}

export function isClubCoordinator(user) {
  return user?.role === "club" && user?.team_role === CLUB_COORD_ROLE;
}

export function isClubGlobalView(user, viewingTeam) {
  if (user?.role !== "club" || user?.club?.isSoloCoach) return false;
  if (viewingTeam) return false;
  return isClubAdmin(user) || isClubCoordinator(user);
}

export function canManageClubBilling(user) {
  if (!user || user.role !== "club") return user?.role === "player";
  if (user.club?.isSoloCoach) return true;
  return isClubAdmin(user);
}

/**
 * Visibilidad de precios / plan / suscripción en clubs.
 * En clubs «Llevado por mí» (planningMode manual), el staff no-admin
 * (coordinador / entrenador / ayudante) no ve precios ni upsells.
 * Administrador, solo coach, player y admin sí.
 */
export function canSeeClubPricing(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "player" || user.role === "coach") return true;
  if (user.role !== "club") return true;
  if (user.club?.isSoloCoach) return true;
  if (isClubAdmin(user) || user.team_role === CLUB_ADMIN_ROLE) return true;
  if (user.club?.planningMode === "manual") {
    const staffHidden = [CLUB_COORD_ROLE, ...CLUB_COACH_ROLES];
    if (staffHidden.includes(user.team_role)) return false;
  }
  return true;
}

export function canEditClubBranding(user) {
  return isClubAdmin(user);
}

export function canAccessClubSettings(user) {
  return isClubAdmin(user);
}

export function canViewClubReferrals(user) {
  return isClubAdmin(user);
}

export function clubRoleLabel(teamRole) {
  const map = {
    administrador: "Administrador",
    coordinador: "Coordinador",
    entrenador: "Entrenador",
    ayudante: "Ayudante",
  };
  return map[teamRole] || teamRole || "Club";
}
