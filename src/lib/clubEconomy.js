/** Economía del club: código de descuento, comisión y datos de transferencia. */

export const DEFAULT_CLUB_COMMISSION_PCT = 10;
export const DEFAULT_PLAYER_DISCOUNT_PCT = 10;

export function normalizeDiscountCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function clubDiscountCode(club) {
  return normalizeDiscountCode(
    club?.discountCode || club?.loginCode || club?.login_code || "",
  );
}

export function parseCommissionPct(value, fallback = DEFAULT_CLUB_COMMISSION_PCT) {
  if (value == null || value === "") return fallback;
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

export function clubCommissionPct(club) {
  return parseCommissionPct(club?.referralCommissionPct);
}

export function clubCommissionRate(club) {
  return clubCommissionPct(club) / 100;
}

export function commissionCents(amountPaidCents, pct) {
  const rate = parseCommissionPct(pct) / 100;
  return Math.round((Number(amountPaidCents) || 0) * rate);
}

/**
 * Importe real cobrado por Stripe (céntimos): total final de la compra
 * (plan + extras del carrito), no el precio de catálogo.
 */
export function stripePaidCents(source) {
  if (!source || typeof source !== "object") return 0;
  for (const key of ["amount_paid", "amount_total", "total"]) {
    const n = Number(source[key]);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  const lines = source.lines?.data;
  if (Array.isArray(lines) && lines.length) {
    const sum = lines.reduce((acc, line) => acc + (Number(line.amount) || 0), 0);
    if (sum > 0) return Math.round(sum);
  }
  return 0;
}

/** Comisión = total final pagado × % configurado del club. */
export function clubCommissionOnTotal(amountPaidCents, club) {
  return commissionCents(amountPaidCents, clubCommissionPct(club));
}

export function clubPayoutAccount(club) {
  return {
    iban: String(club?.payoutIban || "").trim(),
    accountName: String(club?.payoutAccountName || "").trim(),
  };
}

export function clubMatchesDiscountCode(club, code) {
  const needle = normalizeDiscountCode(code);
  if (!needle) return false;
  const candidates = [
    club?.discountCode,
    club?.loginCode,
    club?.login_code,
  ].map(normalizeDiscountCode).filter(Boolean);
  return candidates.includes(needle);
}

export function withSyncedDiscountCode(club, discountCode) {
  const code = normalizeDiscountCode(discountCode) || clubDiscountCode(club);
  return {
    ...club,
    discountCode: code,
    loginCode: code,
    login_code: code,
  };
}
