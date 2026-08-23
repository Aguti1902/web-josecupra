import { useEffect, useState } from "react";
import {
  Wallet, Landmark, Copy, CheckCircle, RefreshCw, Loader2, Users, Gift, Banknote,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  fetchClubReferrals,
  requestClubPayout,
  formatEuros,
} from "../../lib/clubReferrals";
import { clubDiscountCode, clubCommissionPct, clubPayoutAccount } from "../../lib/clubEconomy";

function CopyRow({ label, value, mono = false }) {
  const [copied, setCopied] = useState(false);
  if (!value) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">{label}</p>
        <p className="text-sm text-depro-gray">No informado</p>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">{label}</p>
        <p className={`text-sm font-bold text-depro-dark break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue shrink-0"
        title={`Copiar ${label}`}
      >
        {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

/** Panel admin: lo generado con el código de descuento y marcar la transferencia manual. */
export default function AdminClubCommissionPanel({ club }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const clubId = club?.id;
  const code = clubDiscountCode(club);
  const pct = clubCommissionPct(club);
  const { iban, accountName } = clubPayoutAccount(club);

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

  const stats = data || {
    pending: 0,
    monthPending: 0,
    totalEarned: 0,
    totalPaid: 0,
    activePlayers: 0,
    referrals: [],
    payouts: [],
  };

  const handleMarkPaid = async () => {
    if (!stats.pending) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      await requestClubPayout({
        clubId,
        amount: stats.pending,
        note,
        iban,
        markPaid: true,
        accessToken: token,
      });
      setMsg({ ok: true, text: `Transferencia de ${formatEuros(stats.pending)} marcada como hecha.` });
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
      <div className="flex items-center justify-center py-16 text-depro-gray">
        <Loader2 size={20} className="animate-spin mr-2" /> Cargando comisiones…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-depro-dark flex items-center gap-2">
              <Wallet size={16} className="text-depro-blue" /> Generado con el código de descuento
            </h3>
            <p className="text-sm text-depro-gray mt-1">
              Comisión del <strong>{pct}%</strong> sobre planificaciones individuales que usaron{" "}
              <span className="font-mono font-bold text-depro-dark">{code || "—"}</span>.
              Transfiere a mano y márcalo aquí cuando lo hayas enviado.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-depro-blue border border-depro-border rounded-lg px-3 py-2 hover:border-depro-blue"
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <Banknote size={14} className="text-amber-700 mb-1" />
            <p className="text-xl font-black text-depro-dark">{formatEuros(stats.pending)}</p>
            <p className="text-[10px] font-bold uppercase text-amber-800 tracking-wide">Pendiente de transferir</p>
          </div>
          <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-3">
            <Gift size={14} className="text-depro-blue mb-1" />
            <p className="text-xl font-black text-depro-dark">{formatEuros(stats.totalEarned)}</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Total generado</p>
          </div>
          <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-3">
            <CheckCircle size={14} className="text-green-600 mb-1" />
            <p className="text-xl font-black text-depro-dark">{formatEuros(stats.totalPaid)}</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Ya transferido</p>
          </div>
          <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-3">
            <Users size={14} className="text-depro-blue mb-1" />
            <p className="text-xl font-black text-depro-dark">{stats.activePlayers}</p>
            <p className="text-[10px] font-bold uppercase text-depro-gray tracking-wide">Jugadores con código</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-depro-dark flex items-center gap-2">
          <Landmark size={15} className="text-depro-blue" /> Cuenta para la transferencia
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CopyRow label="Titular" value={accountName} />
          <CopyRow label="IBAN" value={iban} mono />
        </div>

        {stats.pending > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <p className="text-sm font-bold text-depro-dark">
              A transferir ahora: {formatEuros(stats.pending)}
            </p>
            <input
              type="text"
              placeholder="Nota (opcional): referencia del banco, mes…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm bg-white"
            />
            <button
              type="button"
              onClick={handleMarkPaid}
              disabled={submitting || !iban}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Ya he hecho la transferencia
            </button>
            {!iban && (
              <p className="text-xs text-amber-800">
                Falta el IBAN. Guárdalo en Identidad → código de descuento y transferencia.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-depro-gray">No hay comisión pendiente de transferir.</p>
        )}

        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm border ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-3">
        <h4 className="font-semibold text-depro-dark">Compras con el código</h4>
        {(stats.referrals || []).length === 0 ? (
          <p className="text-sm text-depro-gray py-6 text-center">
            Todavía no hay planificaciones individuales con este código.
          </p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {stats.referrals.map((r) => (
                <div key={r.id} className="rounded-xl border border-depro-border p-3 text-sm">
                  <p className="font-semibold text-depro-dark">{r.playerName || r.playerEmail}</p>
                  <p className="text-xs text-depro-gray mt-0.5">{r.plan || "—"} · {r.month}</p>
                  <p className="text-sm mt-1">
                    Pagó {formatEuros(r.amountPaid)} → comisión <strong>{formatEuros(r.commission)}</strong>
                    {r.payoutStatus === "paid" ? " · transferido" : " · pendiente"}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto rounded-xl border border-depro-border">
              <table className="w-full text-sm">
                <thead className="bg-depro-gray-light text-xs uppercase text-depro-gray">
                  <tr>
                    <th className="text-left px-4 py-2">Jugador</th>
                    <th className="text-left px-4 py-2">Plan</th>
                    <th className="text-right px-4 py-2">Pagó</th>
                    <th className="text-right px-4 py-2">Comisión</th>
                    <th className="text-right px-4 py-2">Mes</th>
                    <th className="text-right px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.referrals.map((r) => (
                    <tr key={r.id} className="border-t border-depro-border">
                      <td className="px-4 py-2">{r.playerName || r.playerEmail}</td>
                      <td className="px-4 py-2 text-depro-gray">{r.plan || "—"}</td>
                      <td className="px-4 py-2 text-right">{formatEuros(r.amountPaid)}</td>
                      <td className="px-4 py-2 text-right font-bold">{formatEuros(r.commission)}</td>
                      <td className="px-4 py-2 text-right text-depro-gray">{r.month}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`text-[11px] font-bold ${r.payoutStatus === "paid" ? "text-green-700" : "text-amber-800"}`}>
                          {r.payoutStatus === "paid" ? "Transferido" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {(stats.payouts || []).length > 0 && (
        <div className="bg-white border border-depro-border rounded-2xl p-5">
          <h4 className="font-semibold text-depro-dark mb-3">Historial de transferencias</h4>
          <ul className="space-y-2 text-sm">
            {stats.payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-depro-border pb-2 last:border-0">
                <span className="font-bold text-depro-dark">{formatEuros(p.amount)}</span>
                <span className="text-depro-gray">{p.month} · {p.status === "paid" ? "hecha" : "pendiente"}</span>
                {p.note && <span className="text-xs text-depro-gray w-full">{p.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
