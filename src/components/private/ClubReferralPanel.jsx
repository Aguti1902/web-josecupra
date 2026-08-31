import { useEffect, useState } from "react";
import {
  Copy, CheckCircle, Users, Wallet, TrendingUp, RefreshCw, Loader2, Gift, ArrowRight,
} from "lucide-react";
import {
  fetchClubReferrals,
  requestClubPayout,
  formatEuros,
  REFERRAL_COMMISSION_PCT,
} from "../../lib/clubReferrals";

export default function ClubReferralPanel({
  clubId,
  loginCode,
  compact = false,
  commissionPct,
  payoutIban,
  payoutAccountName,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [iban, setIban] = useState(payoutIban || "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const code = loginCode || "—";

  const load = async () => {
    if (!clubId) return;
    setLoading(true);
    const result = await fetchClubReferrals(clubId);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [clubId]);

  useEffect(() => {
    if (payoutIban) setIban(payoutIban);
  }, [payoutIban]);

  const copyCode = () => {
    if (!code || code === "—") return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePayout = async () => {
    if (!data?.monthPending) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await requestClubPayout({
        clubId,
        amount: data.monthPending,
        note,
        iban,
      });
      setMsg({ ok: true, text: "Solicitud registrada. Te contactaremos para la transferencia mensual." });
      setNote("");
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-depro-gray">
        <Loader2 size={20} className="animate-spin mr-2" /> Cargando comisiones…
      </div>
    );
  }

  const stats = data || {
    pending: 0,
    monthPending: 0,
    totalEarned: 0,
    activePlayers: 0,
    referralCount: 0,
    referrals: [],
    payouts: [],
  };

  return (
    <div className={`space-y-4 ${compact ? "" : "dash-card-premium p-5"}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={18} className="text-depro-blue" />
            <h3 className="font-black text-depro-dark">Código de descuento</h3>
          </div>
          <p className="text-sm text-depro-gray max-w-xl">
            Cuando un jugador compra una planificación individual con este código, el club recibe el{" "}
            <strong>{commissionPct ?? data?.commissionPct ?? REFERRAL_COMMISSION_PCT}%</strong>{" "}
            sobre el precio total final (plan + extras del carrito).
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-depro-border bg-white px-3 py-2 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Código de descuento</p>
            <p className="font-mono font-black text-depro-dark">{code}</p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue"
          >
            {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Jugadores con código", value: stats.codeUsers ?? stats.activePlayers, icon: Users },
          { label: "Comisión pendiente", value: formatEuros(stats.pending), icon: Wallet },
          { label: "Este mes", value: formatEuros(stats.monthPending), icon: TrendingUp },
          { label: "Total generado", value: formatEuros(stats.totalEarned), icon: Gift },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-3">
            <Icon size={14} className="text-depro-blue mb-1" />
            <p className="text-lg font-black text-depro-dark">{value}</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {!compact && stats.monthPending > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
          <p className="text-sm font-bold text-depro-dark">
            Transferencia mensual · {formatEuros(stats.monthPending)} pendientes
          </p>
          {payoutAccountName && (
            <p className="text-xs text-depro-gray">Titular: <strong className="text-depro-dark">{payoutAccountName}</strong></p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="IBAN"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              readOnly={!!payoutIban}
              className="border border-depro-border rounded-xl px-3 py-2.5 text-sm bg-white font-mono uppercase disabled:bg-depro-gray-light"
            />
            <input
              type="text"
              placeholder="Nota para administración"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border border-depro-border rounded-xl px-3 py-2.5 text-sm bg-white"
            />
          </div>
          <button
            type="button"
            onClick={handlePayout}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Solicitar transferencia del mes
          </button>
        </div>
      )}

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm border ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {!compact && stats.referrals?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-depro-dark">Últimos referidos</h4>
            <button type="button" onClick={load} className="text-xs font-bold text-depro-blue flex items-center gap-1">
              <RefreshCw size={12} /> Actualizar
            </button>
          </div>
          <div className="space-y-2 md:hidden">
            {stats.referrals.slice(0, 8).map((r) => (
              <div key={r.id} className="rounded-xl border border-depro-border bg-white p-3 text-sm">
                <div className="font-semibold text-depro-dark">{r.playerName || r.playerEmail}</div>
                <div className="text-xs text-depro-gray mt-0.5">{r.plan} · {formatEuros(r.commission)}</div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-depro-border">
            <table className="w-full text-sm">
              <thead className="bg-depro-gray-light text-xs uppercase text-depro-gray">
                <tr>
                  <th className="text-left px-4 py-2">Jugador</th>
                  <th className="text-left px-4 py-2">Plan</th>
                  <th className="text-right px-4 py-2">Comisión</th>
                  <th className="text-right px-4 py-2">Mes</th>
                </tr>
              </thead>
              <tbody>
                {stats.referrals.slice(0, 12).map((r) => (
                  <tr key={r.id} className="border-t border-depro-border">
                    <td className="px-4 py-2">{r.playerName || r.playerEmail}</td>
                    <td className="px-4 py-2 text-depro-gray">{r.plan || "—"}</td>
                    <td className="px-4 py-2 text-right font-bold">{formatEuros(r.commission)}</td>
                    <td className="px-4 py-2 text-right text-depro-gray">{r.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!compact && stats.payouts?.length > 0 && (
        <div className="text-xs text-depro-gray">
          Últimas solicitudes: {stats.payouts.slice(0, 3).map((p) => `${formatEuros(p.amount)} (${p.status})`).join(" · ")}
        </div>
      )}
    </div>
  );
}
