/**
 * Estados de cuentas creadas desde el panel admin.
 * - borrador: solo visible/usable por admin
 * - demo: colaboración (el usuario puede entrar)
 * - activo: usuario normal
 */

export const ADMIN_ACCOUNT_STATUSES = [
  {
    id: "borrador",
    label: "Borrador",
    hint: "Solo lo ves tú en el panel admin. El usuario no puede entrar.",
  },
  {
    id: "demo",
    label: "Demo",
    hint: "Colaboración: el usuario entra y usa el producto sin cobro Stripe.",
  },
  {
    id: "activo",
    label: "Activo",
    hint: "Usuario normal con acceso completo.",
  },
];

const ALIASES = {
  active: "activo",
  trialing: "activo",
  comp: "demo",
  pendiente: "borrador",
  draft: "borrador",
  inactivo: "borrador",
};

/** Normaliza cualquier estado legado al trío admin. */
export function normalizeAdminStatus(raw) {
  const s = String(raw || "").toLowerCase().trim();
  if (ADMIN_ACCOUNT_STATUSES.some((x) => x.id === s)) return s;
  return ALIASES[s] || "activo";
}

export function adminStatusLabel(raw) {
  const id = normalizeAdminStatus(raw);
  return ADMIN_ACCOUNT_STATUSES.find((x) => x.id === id)?.label || id;
}

/** Estados propios del panel admin (no confundir con Stripe). */
const ADMIN_MANAGED = new Set([
  "borrador", "demo", "activo", "comp", "pendiente", "draft", "inactivo",
]);

export function isAdminManagedStatus(raw) {
  return ADMIN_MANAGED.has(String(raw || "").toLowerCase().trim());
}

/** El usuario final puede iniciar sesión (demo o activo). Borrador no. */
export function canUserLogin(raw) {
  const id = normalizeAdminStatus(raw);
  return id === "demo" || id === "activo";
}

/** Bloquea login solo si el estado es explícitamente borrador (o alias). Vacío no bloquea. */
export function isDraftLoginBlocked(raw) {
  if (raw == null || String(raw).trim() === "") return false;
  return normalizeAdminStatus(raw) === "borrador";
}

export function clubRecordStatus(club) {
  if (!club) return null;
  return club.subscriptionStatus || club.status || null;
}

export function shouldBlockAccountLogin(userLike = {}, club = null) {
  if (userLike.role === "admin" || userLike.email === "jose@depro.es") return false;
  if (isDraftLoginBlocked(userLike.subscriptionStatus)) return true;
  if (club && isDraftLoginBlocked(clubRecordStatus(club))) return true;
  return false;
}

/** Cuenta como cobro mensual (no demo ni borrador). */
export function countsAsPaying(raw) {
  const s = String(raw || "").toLowerCase().trim();
  return s === "activo" || s === "active" || s === "trialing";
}

export function monthlyBilledAmount(user, catalogPrice = 0) {
  if (!countsAsPaying(user?.subscriptionStatus)) return 0;
  const manual = parseManualPrice(user?.manualPrice);
  if (manual != null) return manual;
  return Number(catalogPrice) || 0;
}

/** Acceso de producto (sin paywall). Incluye demo. */
export function isAdminGrantedAccess(raw) {
  const id = normalizeAdminStatus(raw);
  return id === "demo" || id === "activo";
}

export const ADMIN_STATUS_STYLES = {
  activo: "bg-green-50 text-green-700 border-green-200",
  demo: "bg-sky-50 text-sky-700 border-sky-200",
  borrador: "bg-amber-50 text-amber-800 border-amber-200",
};

/** Precio cobrado a mano (club/entrenador/jugador). */
export function parseManualPrice(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function formatManualPrice(value) {
  const n = parseManualPrice(value);
  if (n == null) return null;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}
