export const CLUB_ADMIN_ROLE = "administrador";
export const CLUB_COORD_ROLE = "coordinador";
export const CLUB_COACH_ROLES = ["entrenador", "ayudante"];

function normEmail(value) {
  return String(value || "").trim().toLowerCase();
}

/** Rol de staff: el del listado del club (si existe) manda sobre metadata suelta. */
export function resolveClubTeamRole(user) {
  if (!user) return null;
  const email = normEmail(user.email);
  const roster = user.club?.users || [];
  const staff = email || user.id
    ? roster.find((u) =>
      (email && normEmail(u.email) === email)
      || (user.id && String(u.id) === String(user.id))
    )
    : null;
  const fromRoster = staff?.role || staff?.teamRole || staff?.team_role;
  if (fromRoster) return String(fromRoster).toLowerCase();
  const declared = user.team_role || user.teamRole;
  return declared ? String(declared).toLowerCase() : null;
}

export function isClubAdmin(user) {
  return user?.role === "club" && resolveClubTeamRole(user) === CLUB_ADMIN_ROLE;
}

export function isClubCoordinator(user) {
  return user?.role === "club" && resolveClubTeamRole(user) === CLUB_COORD_ROLE;
}

export function isClubCoachStaff(user) {
  return user?.role === "club" && CLUB_COACH_ROLES.includes(resolveClubTeamRole(user));
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
  if (!user) return false;
  if (user.role === "player" || user.role === "coach") return true;
  if (user.isSoloCoach || user.club?.isSoloCoach) return true;
  if (user.role !== "club") return false;
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
  // Entrenador / ayudante nunca ven cuota, IBAN ni comisiones.
  if (isClubCoachStaff(user)) return false;
  if (user.role === "admin") return true;
  if (user.isSoloCoach || user.club?.isSoloCoach) return false;
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
