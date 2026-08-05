/** Cliente para estadísticas de referidos del club */

/** Comisión del club sobre planificaciones individuales con su código. */
export const REFERRAL_COMMISSION_PCT = 10;

export function formatEuros(cents) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format((cents || 0) / 100);
}

export async function fetchClubReferrals(clubId) {
  if (!clubId) return null;
  try {
    const res = await fetch(`/api/club-referrals?clubId=${encodeURIComponent(clubId)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function requestClubPayout({ clubId, amount, month, note, iban, markPaid = false }) {
  const res = await fetch("/api/club-referrals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: markPaid ? "mark_paid" : "request_payout",
      clubId,
      amount,
      month,
      note,
      iban,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "No se pudo registrar la transferencia");
  return data;
}
