export const CLUB_ADMIN_ROLE = "administrador";
export const CLUB_COORD_ROLE = "coordinador";
export const CLUB_COACH_ROLES = ["entrenador", "ayudante"];

export function isClubAdmin(user) {
  return user?.role === "club" && user?.team_role === CLUB_ADMIN_ROLE;
}

export function isClubCoordinator(user) {
  return user?.role === "club" && user?.team_role === CLUB_COORD_ROLE;
}

/** Al entrar en un equipo, coordinador/admin editan igual que el entrenador. */
export function canEditClubTeam(user, viewingTeam) {
  if (!user) return false;
  const role = user.team_role;
  if (role === "entrenador" || role === "ayudante") return true;
  if (isWideClubRole(role) && viewingTeam) return true;
  return false;
}

export function isWideClubRole(teamRole) {
  return teamRole === CLUB_ADMIN_ROLE || teamRole === CLUB_COORD_ROLE;
}

/** ProCoach con varios equipos: vista global tipo coordinador. */
export function isProCoachOverview(user, viewingTeam) {
  const solo = !!(
    user?.isSoloCoach
    || user?.club?.isSoloCoach
    || String(user?.clubId || user?.club?.id || "").startsWith("coach_")
  );
  if (!solo) return false;
  if (viewingTeam) return false;
  return (user?.club?.teams?.length || 0) > 1;
}

export function isClubGlobalView(user, viewingTeam) {
  if (viewingTeam) return false;
  if (isProCoachOverview(user, viewingTeam)) return true;
  if (user?.role !== "club" || user?.club?.isSoloCoach) return false;
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
