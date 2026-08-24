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

export function audienceGetsClubDiscount(audience) {
  const a = String(audience || "").toLowerCase();
  return a === "player" || a === "coach";
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
