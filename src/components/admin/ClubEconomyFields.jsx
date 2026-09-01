import {
  DEFAULT_CLUB_COMMISSION_PCT,
  clubDiscountCode,
  parseCommissionPct,
  formatCommissionPreview,
} from "../../lib/clubEconomy";

/** Campos que José edita a nivel de club: código de descuento, comisión, IBAN y titular. */
export default function ClubEconomyFields({
  discountCode,
  commissionPct,
  payoutIban,
  payoutAccountName,
  onChange,
  showCodeHint = true,
  compactCommission = false,
}) {
  const set = (patch) => onChange(patch);
  const pct = parseCommissionPct(commissionPct);
  const preview100 = formatCommissionPreview(100, pct);
  const preview90 = formatCommissionPreview(90, pct);

  return (
    <div className="space-y-4">
      {!compactCommission && (
      <div>
        <label className="block text-sm font-medium text-depro-dark mb-1">Código de descuento</label>
        <input
          className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
          placeholder="Ej. CDF2026"
          value={discountCode ?? ""}
          onChange={(e) => set({ discountCode: e.target.value.toUpperCase() })}
        />
        {showCodeHint && (
          <p className="text-xs text-depro-gray mt-1.5">
            Lo usan jugadores en una planificación individual. La comisión se calcula sobre el precio total final de esa compra (plan + extras del carrito), con el porcentaje de este club.
          </p>
        )}
      </div>
      )}
      <div>
        <label className="block text-sm font-medium text-depro-dark mb-1">Comisión del club (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          inputMode="decimal"
          className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
          placeholder={String(DEFAULT_CLUB_COMMISSION_PCT)}
          value={commissionPct ?? ""}
          onChange={(e) => set({ referralCommissionPct: e.target.value })}
        />
        <div className="mt-2 rounded-xl border border-depro-blue/20 bg-depro-blue/5 px-3 py-2.5 text-sm text-depro-dark">
          <p className="font-semibold">Comisión = total final de la compra × {pct}%</p>
          <p className="text-xs text-depro-gray mt-1">
            Incluye el plan y cualquier extra del carrito. No es un 10 % fijo ni se aplica solo al precio de catálogo.
          </p>
          <ul className="text-xs mt-1.5 space-y-0.5">
            <li>Si el total es 100 € → comisión <strong>{preview100.toLocaleString("es-ES", { minimumFractionDigits: preview100 % 1 ? 2 : 0, maximumFractionDigits: 2 })} €</strong></li>
            <li>Si el total es 90 € → comisión <strong>{preview90.toLocaleString("es-ES", { minimumFractionDigits: preview90 % 1 ? 2 : 0, maximumFractionDigits: 2 })} €</strong></li>
          </ul>
        </div>
      </div>
      {!compactCommission && (
      <>
      <div>
        <label className="block text-sm font-medium text-depro-dark mb-1">Titular de la cuenta</label>
        <input
          className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
          placeholder="Nombre de la cuenta / club"
          value={payoutAccountName ?? ""}
          onChange={(e) => set({ payoutAccountName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-depro-dark mb-1">IBAN</label>
        <input
          className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
          placeholder="ES00 ACCT-000003 0000"
          value={payoutIban ?? ""}
          onChange={(e) => set({ payoutIban: e.target.value.toUpperCase() })}
        />
        <p className="text-xs text-depro-gray mt-1.5">
          Cuenta a la que se transfiere la comisión de las planificaciones individuales.
        </p>
      </div>
      </>
      )}
    </div>
  );
}

export function economyPatchFromClub(club) {
  return {
    discountCode: clubDiscountCode(club),
    referralCommissionPct: parseCommissionPct(club?.referralCommissionPct),
    payoutIban: club?.payoutIban || "",
    payoutAccountName: club?.payoutAccountName || "",
  };
}
