import { useMemo, useState } from "react";
import {
  Activity, Moon, Scale, Ruler, Battery, Check,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { canPersistInTrial, trialPersistBlockedMessage } from "../../lib/trialPersistence";
import { isInTrial } from "../../lib/subscription";
import TrialLimitedNotice from "../../components/private/TrialLimitedNotice";
import {
  mondayOfDate,
  recentWeekKeys,
  formatWeekLabel,
  getWellnessEntry,
  getWellnessMap,
  saveWellnessEntry,
} from "../../lib/wellnessLogs";
import {
  buildWellnessFeedback,
  entryHasData,
} from "../../lib/wellnessAnalytics";

const FATIGUE_OPTIONS = [
  { value: "1", label: "Muy baja" },
  { value: "2", label: "Baja" },
  { value: "3", label: "Media" },
  { value: "4", label: "Alta" },
  { value: "5", label: "Muy alta" },
];

const SLEEP_OPTIONS = [
  { value: "1", label: "Muy mala" },
  { value: "2", label: "Mala" },
  { value: "3", label: "Regular" },
  { value: "4", label: "Buena" },
  { value: "5", label: "Excelente" },
];

const FATIGUE_LABELS = Object.fromEntries(FATIGUE_OPTIONS.map((o) => [o.value, o.label]));
const SLEEP_LABELS = Object.fromEntries(SLEEP_OPTIONS.map((o) => [o.value, o.label]));

function accentOf(user) {
  const raw = user?.club?.primaryColor || user?.primaryColor || "#0A36F7";
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : "#0A36F7";
}

function toneColor(tone) {
  if (tone === "positive") return "#16A34A";
  if (tone === "negative") return "#DC2626";
  if (tone === "mixed") return "#D97706";
  return "#6B7280";
}

function ToneIcon({ tone }) {
  if (tone === "positive") return <ArrowUpRight size={14} />;
  if (tone === "negative") return <ArrowDownRight size={14} />;
  return <Minus size={14} />;
}

function ScoreDots({ value, invert = false }) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return <span className="text-depro-gray">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5" title={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const on = i < n;
        const good = invert ? n <= 2 : n >= 4;
        const bad = invert ? n >= 4 : n <= 2;
        const color = !on
          ? "bg-slate-200"
          : good
            ? "bg-emerald-500"
            : bad
              ? "bg-rose-400"
              : "bg-amber-400";
        return <span key={i} className={`h-2 w-2 rounded-full ${color}`} />;
      })}
    </span>
  );
}

function FeedbackCard({ card }) {
  const color = toneColor(card.tone);
  return (
    <div className="rounded-2xl border border-depro-border p-4 hover:border-depro-blue/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-depro-gray">{card.label}</p>
          <p className="mt-1 text-sm font-semibold text-depro-dark leading-snug">{card.message}</p>
        </div>
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <ToneIcon tone={card.tone} />
        </span>
      </div>
      <p className="mt-2 text-xs tabular-nums text-depro-gray">
        {card.prev}
        {card.unit} → {card.curr}
        {card.unit}
      </p>
    </div>
  );
}

export default function WellnessPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const accent = accentOf(user);
  const currentWeek = mondayOfDate();

  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState(null);
  const map = useMemo(() => getWellnessMap(userId), [userId, tick]);
  const currentEntry = useMemo(
    () => getWellnessEntry(userId, currentWeek),
    [userId, currentWeek, tick],
  );

  const [weightKg, setWeightKg] = useState(() => currentEntry.weightKg || "");
  const [waistCm, setWaistCm] = useState(() => currentEntry.waistCm || "");
  const [fatigue, setFatigue] = useState(() => currentEntry.fatigue || "3");
  const [sleep, setSleep] = useState(() => currentEntry.sleep || "3");

  const weekRows = useMemo(() => {
    const keys = recentWeekKeys(12);
    return keys
      .map((weekKey) => {
        const entry = map[weekKey] || null;
        return entry && entryHasData(entry) ? { weekKey, ...entry } : null;
      })
      .filter(Boolean);
  }, [map]);

  const feedback = useMemo(() => {
    if (weekRows.length < 2) return { cards: [], summary: null };
    return buildWellnessFeedback(weekRows[0], weekRows[1]);
  }, [weekRows]);

  const isSaved = entryHasData(currentEntry);

  const flash = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 2800);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!canPersistInTrial(user, "save_stats")) {
      flash(false, trialPersistBlockedMessage());
      return;
    }
    const w = weightKg.trim();
    const waist = waistCm.trim();
    const fat = fatigue;
    const sl = sleep;

    const wNum = w === "" ? null : Number(String(w).replace(",", "."));
    const waistNum = waist === "" ? null : Number(String(waist).replace(",", "."));

    if (wNum != null && (!Number.isFinite(wNum) || wNum < 30 || wNum > 250)) {
      flash(false, "Peso entre 30 y 250 kg.");
      return;
    }
    if (waistNum != null && (!Number.isFinite(waistNum) || waistNum < 40 || waistNum > 200)) {
      flash(false, "Perímetro abdominal entre 40 y 200 cm.");
      return;
    }
    if (!["1", "2", "3", "4", "5"].includes(String(fat)) || !["1", "2", "3", "4", "5"].includes(String(sl))) {
      flash(false, "Fatiga y sueño deben estar entre 1 y 5.");
      return;
    }
    if (wNum == null && waistNum == null) {
      flash(false, "Introduce al menos el peso o el perímetro abdominal.");
      return;
    }

    saveWellnessEntry(userId, {
      weekKey: currentWeek,
      weightKg: wNum == null ? "" : String(wNum),
      waistCm: waistNum == null ? "" : String(waistNum),
      fatigue: String(fat),
      sleep: String(sl),
    });
    setTick((t) => t + 1);
    flash(true, isSaved ? "Wellness de la semana actualizado." : "Wellness de la semana guardado.");
  };

  return (
    <div className="dash-page space-y-6">
      {isInTrial(user) && <TrialLimitedNotice />}
      <header
        className="relative overflow-hidden rounded-3xl border border-depro-border px-6 py-8 sm:px-8 sm:py-10 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 45%, #0a1a4a 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, #fff 0%, transparent 40%), radial-gradient(circle at 10% 90%, #fff 0%, transparent 35%)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 mb-2">
            Wellness · Check-in semanal
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Cómo estás esta semana</h1>
          <p className="text-sm sm:text-base text-white/85 max-w-xl">
            Cuatro datos clave: peso, cintura, fatiga y sueño. Feedback automático frente a la semana anterior.
          </p>
        </div>
      </header>

      {feedback.cards.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-depro-gray">
            Feedback semanal
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {feedback.cards.map((card) => (
              <FeedbackCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-depro-border bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-depro-dark">Esta semana</h2>
            <p className="text-sm text-depro-gray">{formatWeekLabel(currentWeek)}</p>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <Check className="h-3.5 w-3.5" />
              Guardado
            </span>
          )}
        </div>

        {msg && (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
              msg.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-depro-dark">
              <Scale className="h-4 w-4 text-depro-gray" />
              Peso (kg)
            </span>
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="ej. 78.5"
              className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-depro-blue"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-depro-dark">
              <Ruler className="h-4 w-4 text-depro-gray" />
              Perímetro abdominal (cm)
            </span>
            <input
              type="number"
              min="40"
              max="200"
              step="0.5"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              placeholder="ej. 82"
              className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-depro-blue"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-depro-dark">
              <Battery className="h-4 w-4 text-depro-gray" />
              Fatiga (1–5)
            </span>
            <select
              value={fatigue}
              onChange={(e) => setFatigue(e.target.value)}
              className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-depro-blue"
            >
              {FATIGUE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value} — {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-depro-dark">
              <Moon className="h-4 w-4 text-depro-gray" />
              Calidad del sueño (1–5)
            </span>
            <select
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-depro-blue"
            >
              {SLEEP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value} — {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-depro-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Activity className="h-4 w-4" />
              {isSaved ? "Actualizar semana" : "Guardar semana"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-depro-border bg-white shadow-card">
        <div className="border-b border-depro-border px-4 py-3 sm:px-5">
          <h2 className="text-lg font-black text-depro-dark">Historial</h2>
          <p className="text-xs text-depro-gray">Últimas semanas con datos (más reciente primero).</p>
        </div>

        {weekRows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-depro-gray">
            Aún no hay registros. Guarda el check-in de esta semana para empezar el seguimiento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-depro-gray">
                  <th className="px-4 py-3 font-semibold sm:px-5">Semana</th>
                  <th className="px-3 py-3 font-semibold">Peso</th>
                  <th className="px-3 py-3 font-semibold">Cintura</th>
                  <th className="px-3 py-3 font-semibold">Fatiga</th>
                  <th className="px-3 py-3 font-semibold">Sueño</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.map((row, idx) => {
                  const isCurrent = row.weekKey === currentWeek;
                  return (
                    <tr
                      key={row.weekKey}
                      className={`border-t border-depro-border ${
                        isCurrent ? "bg-sky-50/60" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="px-4 py-3.5 sm:px-5">
                        <p className="font-medium text-depro-dark">{formatWeekLabel(row.weekKey)}</p>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                            Actual
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-depro-dark">
                        {row.weightKg ? `${row.weightKg} kg` : "—"}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-depro-dark">
                        {row.waistCm ? `${row.waistCm} cm` : "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-1">
                          <ScoreDots value={row.fatigue} invert />
                          <span className="text-[11px] text-depro-gray">
                            {FATIGUE_LABELS[String(row.fatigue)] || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-1">
                          <ScoreDots value={row.sleep} />
                          <span className="text-[11px] text-depro-gray">
                            {SLEEP_LABELS[String(row.sleep)] || "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
