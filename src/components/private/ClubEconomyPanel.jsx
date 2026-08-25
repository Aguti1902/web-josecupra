import { useState } from "react";
import { Wallet, Percent, Landmark, Copy, CheckCircle, CreditCard } from "lucide-react";
import ClubReferralPanel from "./ClubReferralPanel";
import { formatManualPrice, adminStatusLabel, normalizeAdminStatus } from "../../lib/adminAccountStatus";
import { clubDiscountCode, clubCommissionPct, clubPayoutAccount } from "../../lib/clubEconomy";
import { canSeeClubEconomy } from "../../lib/clubRoles";
import { useAuth } from "../../context/AuthContext";

function CopyChip({ value, label }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-depro-gray">—</span>;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 font-mono font-black text-depro-dark"
    >
      {value}
      {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={13} className="text-depro-gray" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** Panel económico del administrador del club: cuota, código, comisión e IBAN. */
export default function ClubEconomyPanel({ club, compact = false }) {
  const { user } = useAuth();
  if (!canSeeClubEconomy(user)) return null;

  const code = clubDiscountCode(club);
  const pct = clubCommissionPct(club);
  const { iban, accountName } = clubPayoutAccount(club);
  const fee = formatManualPrice(club?.manualPrice);
  const status = club?.subscriptionStatus || club?.status;

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className={compact ? "" : "dash-card-premium p-5 space-y-4"}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={18} className="text-depro-blue" />
            <h3 className="font-black text-depro-dark">Economía del club</h3>
          </div>
          <p className="text-sm text-depro-gray max-w-2xl">
            Cuota que paga el club, código de descuento para planificaciones individuales y comisión acordada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-depro-border bg-white p-3">
            <CreditCard size={14} className="text-depro-blue mb-1" />
            <p className="text-lg font-black text-depro-dark">{fee || "—"}</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">
              Cuota del club{status ? ` · ${adminStatusLabel(normalizeAdminStatus(status))}` : ""}
            </p>
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-3">
            <Percent size={14} className="text-depro-blue mb-1" />
            <p className="text-lg font-black text-depro-dark">{pct}%</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Comisión individuales</p>
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-3">
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide mb-1">Código de descuento</p>
            <CopyChip value={code} label="Copiar código" />
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-3">
            <Landmark size={14} className="text-depro-blue mb-1" />
            <p className="text-sm font-bold text-depro-dark truncate">{accountName || "Sin titular"}</p>
            <p className="text-[11px] font-mono text-depro-gray truncate">{iban || "IBAN no informado"}</p>
          </div>
        </div>
      </div>

      <ClubReferralPanel
        clubId={club?.id}
        loginCode={code}
        commissionPct={pct}
        payoutIban={iban}
        payoutAccountName={accountName}
        compact={compact}
      />
    </div>
  );
}
