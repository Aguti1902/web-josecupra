/**
 * Astra IP allowlist (payments / webhooks hardening).
 * Configure via env ASTRA_ALLOWED_IPS as comma-separated IPv4/IPv6.
 * Empty list = no IP filter (default until credentials are provisioned).
 */
export function getAstraAllowedIps() {
  const raw = process.env.ASTRA_ALLOWED_IPS || "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function isAstraIpAllowed(ip) {
  const list = getAstraAllowedIps();
  if (!list.length) return true;
  if (!ip) return false;
  const normalized = String(ip).replace(/^::ffff:/, "");
  return list.includes(normalized) || list.includes(ip);
}
