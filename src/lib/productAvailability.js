/**
 * Disponibilidad pública de productos.
 * El código de DEPRO Club (panel, motor, admin) se conserva;
 * la autocontratación queda cerrada hasta que se reactive.
 */
export const CLUB_SELF_SERVE_OPEN = false;

export function isClubSelfServeOpen() {
  return CLUB_SELF_SERVE_OPEN === true;
}

export const CLUB_COMING_SOON_COPY =
  "DEPRO Club estará disponible próximamente. El panel, el motor y el alta desde admin se conservan para acabarlo más adelante.";

export function isClubCheckoutPlan(planId, audience) {
  return audience === "club" || String(planId || "").startsWith("club-");
}
