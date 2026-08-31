/** Errores de cuota de Safari/WebKit y Chrome cuando localStorage/sessionStorage está lleno. */
export function isQuotaError(err) {
  const name = String(err?.name || "");
  const msg = String(err?.message || err || "");
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || /quota/i.test(msg);
}

const AUTH_KEY = /^(sb-|-auth-token|supabase)/i;
const HEAVY_PREFIXES = [
  "depro_player_logo_",
  "depro_player_banner_",
];
const AGGRESSIVE_PREFIXES = [
  "depro_plan_",
  "depro_player_plan_",
  "depro_onboarding",
  "depro_catalog",
  "depro_global_plans",
  "depro_player_logo_",
  "depro_player_banner_",
];

function allKeys(storage) {
  const keys = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k) keys.push(k);
    }
  } catch { /* ignore */ }
  return keys;
}

function shouldReclaim(key, aggressive) {
  if (HEAVY_PREFIXES.some((p) => key.startsWith(p))) return true;
  if (!aggressive) return false;
  return AGGRESSIVE_PREFIXES.some((p) => key.startsWith(p))
    || key === "depro_onboarding_draft_v1"
    || key === "depro_onboarding_draft";
}

/**
 * Libera espacio de branding/caché para que el token de sesión quepa.
 * No toca claves de autenticación.
 * @param {boolean|{aggressive?: boolean}} [opts]
 */
export function reclaimLocalStorage(opts = {}) {
  if (typeof localStorage === "undefined") return 0;
  const aggressive = opts === true || opts?.aggressive === true;
  let removed = 0;
  const keys = allKeys(localStorage);
  for (const key of keys) {
    if (AUTH_KEY.test(key)) continue;
    let drop = shouldReclaim(key, aggressive);
    if (!drop && aggressive) {
      try {
        const val = localStorage.getItem(key);
        if (typeof val === "string" && val.length > 80000) drop = true;
      } catch { /* ignore */ }
    }
    if (!drop) continue;
    try {
      localStorage.removeItem(key);
      removed += 1;
    } catch { /* ignore */ }
  }
  return removed;
}

export function safeSetItem(storage, key, value) {
  if (!storage || !key) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch (err) {
    if (!isQuotaError(err)) return false;
    reclaimLocalStorage();
    try {
      storage.setItem(key, value);
      return true;
    } catch {
      reclaimLocalStorage({ aggressive: true });
      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
  }
}
