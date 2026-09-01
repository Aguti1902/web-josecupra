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

/** Precios de catálogo (céntimos) con y sin el −10 % del código club. */
export const CATALOG_PLAN_CENTS = new Set([
  2900, 2610,
  9900, 8910,
  3000, 2700,
  4500, 4050,
]);

export function looksLikeCatalogPlanAmount(cents) {
  return CATALOG_PLAN_CENTS.has(Math.round(Number(cents) || 0));
}

export function parseAddonIdList(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[|,]/)
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Importe real cobrado por Stripe (céntimos): total final de la compra
 * (plan + extras del carrito), no el precio de catálogo.
 * Si no se ha cobrado (trial / no_payment_required) → 0.
 */
export function stripePaidCents(source) {
  if (!source || typeof source !== "object") return 0;

  const paymentStatus = String(source.payment_status || "");
  if (paymentStatus === "no_payment_required" || paymentStatus === "unpaid") return 0;

  const amountPaid = Number(source.amount_paid);
  const amountTotal = Number(source.amount_total);
  const total = Number(source.total);

  if (Number.isFinite(amountPaid) && amountPaid > 0) return Math.round(amountPaid);
  if (Number.isFinite(amountTotal) && amountTotal > 0) return Math.round(amountTotal);
  if (Number.isFinite(total) && total > 0) return Math.round(total);

  // amount_total=0 en trial: no usar las líneas recurrentes como si estuvieran cobradas.
  if (amountPaid === 0 || amountTotal === 0) return 0;

  const lineItems = source.line_items?.data || source.lines?.data;
  if (Array.isArray(lineItems) && lineItems.length) {
    const sum = lineItems.reduce((acc, line) => {
      const n = Number(line.amount_total ?? line.amount ?? line.amount_subtotal ?? 0);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    if (sum > 0) return Math.round(sum);
  }
  return 0;
}

/** Comisión = total final pagado × % configurado del club. */
export function clubCommissionOnTotal(amountPaidCents, club) {
  return commissionCents(amountPaidCents, clubCommissionPct(club));
}

/** Importe en céntimos tras aplicar el % del club (plan o extra). */
export function centsAfterClubPct(cents, pct) {
  const p = parseCommissionPct(pct);
  return Math.round((Number(cents) || 0) * (1 - p / 100));
}

/** Totales del carrito (euros): el % se aplica al plan + extras, no solo al catálogo. */
export function clubCartTotals({ planPrice = 0, addonsTotal = 0, pct, hasDiscount = false } = {}) {
  const subtotal = Math.round((Number(planPrice) + Number(addonsTotal)) * 100) / 100;
  if (!hasDiscount) {
    return { subtotal, total: subtotal, discount: 0, pct: 0 };
  }
  const p = parseCommissionPct(pct);
  const subCents = Math.round(subtotal * 100);
  const totalCents = centsAfterClubPct(subCents, p);
  return {
    subtotal,
    total: totalCents / 100,
    discount: (subCents - totalCents) / 100,
    pct: p,
  };
}

export function formatCommissionPreview(euros, pct) {
  const rate = parseCommissionPct(pct) / 100;
  const n = Number(euros) || 0;
  return Math.round(n * rate * 100) / 100;
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
