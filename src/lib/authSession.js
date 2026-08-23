/** Eventos de Supabase Auth que confirman o actualizan una sesión viva. */
export function isSessionPresenceEvent(event) {
  return event === "INITIAL_SESSION"
    || event === "SIGNED_IN"
    || event === "TOKEN_REFRESHED"
    || event === "USER_UPDATED";
}

export function isSignedOutEvent(event) {
  return event === "SIGNED_OUT";
}
