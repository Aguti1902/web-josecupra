export const CLUB_ADMIN_ROLE = "administrador";
export const CLUB_COORD_ROLE = "coordinador";
export const CLUB_COACH_ROLES = ["entrenador", "ayudante"];

export function isClubAdmin(user) {
  return user?.role === "club" && user?.team_role === CLUB_ADMIN_ROLE;
}

export function isClubCoordinator(user) {
  return user?.role === "club" && user?.team_role === CLUB_COORD_ROLE;
}

export function isWideClubRole(teamRole) {
  return teamRole === CLUB_ADMIN_ROLE || teamRole === CLUB_COORD_ROLE;
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
 * Catálogo Stripe / cambiar plan: solo admin DEPRO.
 * El administrador del club ve la cuota y comisiones en el panel Economía.
 */
export function canSeeClubPricing(user) {
  if (!user) return false;
  return user.role === "admin";
}

/** Cuota del club, código de descuento y comisiones de planificaciones individuales. */
export function canSeeClubEconomy(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return isClubAdmin(user);
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
