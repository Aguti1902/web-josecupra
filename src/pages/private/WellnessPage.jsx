import { useMemo, useState } from "react";
import {
  Activity, Moon, Scale, Ruler, Battery, Check, HeartPulse,
  ArrowUpRight, ArrowDownRight, Minus, Dumbbell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  wellnessChartSeries,
} from "../../lib/wellnessAnalytics";
import { BodyChart, RecoverChart } from "../../components/private/SparkCharts";

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
const PAIN_OPTIONS = [
  { value: "1", label: "Muy bajo" },
  { value: "2", label: "Bajo" },
  { value: "3", label: "Medio" },
  { value: "4", label: "Alto" },
  { value: "5", label: "Muy alto" },
];

const FATIGUE_LABELS = Object.fromEntries(FATIGUE_OPTIONS.map((o) => [o.value, o.label]));
const SLEEP_LABELS = Object.fromEntries(SLEEP_OPTIONS.map((o) => [o.value, o.label]));
const PAIN_LABELS = Object.fromEntries(PAIN_OPTIONS.map((o) => [o.value, o.label]));

function parseNum(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
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
        const color = !on ? "bg-slate-200" : good ? "bg-emerald-500" : bad ? "bg-rose-400" : "bg-amber-400";
        return <span key={i} className={`h-2 w-2 rounded-full ${color}`} />;
      })}
    </span>
  );
}

function MiniSpark({ series, color }) {
  const pts = (series || []).map((p) => Number(p.value)).map((v) => (Number.isFinite(v) ? v : null));
  if (pts.every((v) => v == null)) return null;
  const known = pts.filter((v) => v != null);
  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min || 1;
  const w = 72;
  const h = 28;
  const coords = pts.map((v, i) => {
    const x = pts.length <= 1 ? w / 2 : (i / (pts.length - 1)) * w;
    const y = v == null ? null : h - 3 - ((v - min) / span) * (h - 6);
    return { x, y };
  });
  const d = coords.filter((c) => c.y != null).map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[72px] h-7">
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function DeltaLine({ delta, unit, invert = false, fallback = "vs. semana anterior" }) {
  if (delta == null) return <p className="text-[11px] text-depro-gray mt-1">{fallback}</p>;
  const good = invert ? delta < 0 : delta > 0;
  const bad = invert ? delta > 0 : delta < 0;
  const color = Math.abs(delta) < 0.05 ? "text-depro-gray" : good ? "text-emerald-600" : bad ? "text-rose-600" : "text-depro-gray";
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const sign = delta > 0 ? "+" : "";
  return (
    <p className={`text-[11px] font-semibold mt-1 inline-flex items-center gap-0.5 ${color}`}>
      <Icon size={12} /> {sign}{delta} {unit}
      <span className="font-normal text-depro-gray ml-1">vs. semana anterior</span>
    </p>
  );
}

function formatDelta(delta) {
  const n = Number(delta);
  if (!Number.isFinite(n)) return "";
  const sign = n > 0 ? "+" : "";
  return `${sign}${String(n).replace(".", ",")}`;
}

function TrendRow({ label, Icon, delta, invert, stableLabel = "Estable", unit = "" }) {
  let text = stableLabel;
  let color = "text-depro-gray";
  let Arrow = Minus;
  if (delta != null && Math.abs(delta) >= 0.15) {
    if ((invert && delta < 0) || (!invert && delta > 0)) {
      color = "text-emerald-600";
      Arrow = invert ? ArrowDownRight : ArrowUpRight;
    } else {
      color = "text-rose-600";
      Arrow = invert ? ArrowUpRight : ArrowDownRight;
    }
    const suffix = unit === "punto"
      ? ` ${Math.abs(delta) === 1 ? "punto" : "puntos"}`
      : unit ? ` ${unit}` : "";
    text = `${formatDelta(delta)}${suffix}`;
  }
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-depro-dark inline-flex items-center gap-2">
        <Icon size={14} className="text-depro-gray" /> {label}
      </span>
      <span className={`text-sm font-semibold inline-flex items-center gap-1 ${color}`}>
        <Arrow size={14} /> {delta == null || Math.abs(delta) < 0.15 ? stableLabel : text}
      </span>
    </div>
  );
}

export default function WellnessPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const currentWeek = mondayOfDate();

  const [tick, setTick] = useState(0);
  const [historyCount, setHistoryCount] = useState(8);
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
  const [musclePain, setMusclePain] = useState(() => currentEntry.musclePain || "2");

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
    const curr = map[currentWeek] || weekRows[0] || {};
    const prev = weekRows.find((r) => r.weekKey !== (curr.weekKey || currentWeek)) || {};
    return buildWellnessFeedback(curr, prev);
  }, [map, weekRows, currentWeek]);

  const isSaved = entryHasData(currentEntry);
  const cardsById = Object.fromEntries((feedback.cards || []).map((c) => [c.id, c]));
  const overview = feedback.overview;

  const weightSeries = useMemo(() => wellnessChartSeries(map, "weightKg", 4), [map]);
  const waistSeries = useMemo(() => wellnessChartSeries(map, "waistCm", 4), [map]);
  const fatigueSeries = useMemo(() => wellnessChartSeries(map, "fatigue", 4), [map]);
  const sleepSeries = useMemo(() => wellnessChartSeries(map, "sleep", 4), [map]);
  const painSeries = useMemo(() => wellnessChartSeries(map, "musclePain", 4), [map]);

  const flash = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 2800);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const w = weightKg.trim();
    const waist = waistCm.trim();
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
    const scales = [fatigue, sleep, musclePain];
    if (scales.some((v) => !["1", "2", "3", "4", "5"].includes(String(v)))) {
      flash(false, "Fatiga, sueño y dolor muscular deben estar entre 1 y 5.");
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
      fatigue: String(fatigue),
      sleep: String(sleep),
      musclePain: String(musclePain),
    });
    setTick((t) => t + 1);
    flash(true, isSaved ? "Wellness de la semana actualizado." : "Wellness de la semana guardado.");
  };

  const wCurr = parseNum(currentEntry.weightKg);
  const aCurr = parseNum(currentEntry.waistCm);
  const fCurr = parseNum(currentEntry.fatigue);
  const sCurr = parseNum(currentEntry.sleep);
  const pCurr = parseNum(currentEntry.musclePain);

  const statusTone = overview?.tone === "negative"
    ? "bg-amber-50 text-amber-800"
    : overview?.tone === "positive"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-white/20 text-white";

  return (
    <div className="dash-page space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <HeartPulse size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-depro-dark tracking-tight">Wellness</h1>
            <p className="text-sm text-depro-gray">Seguimiento de tu estado físico y recuperación</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-depro-border bg-white px-3 py-2 text-sm font-semibold text-depro-dark">
          Semana {formatWeekLabel(currentWeek)}
        </div>
      </header>

      <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white p-5 sm:p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1 inline-flex items-center gap-1.5">
              <Activity size={13} /> Resumen semanal
            </p>
            <p className="text-base sm:text-lg font-semibold leading-snug max-w-2xl">
              {overview?.message || "Registra peso, cintura, fatiga, sueño y dolor muscular para ver tu tendencia."}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusTone}`}>
            Estado: {overview?.status || "Sin datos"}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {[
          { id: "weight", label: "Peso", Icon: Scale, value: wCurr != null ? `${wCurr.toFixed(1).replace(".", ",")} kg` : "—", series: weightSeries, color: "#7C3AED", unit: "kg", invert: true },
          { id: "waist", label: "Cintura", Icon: Ruler, value: aCurr != null ? `${aCurr} cm` : "—", series: waistSeries, color: "#2563EB", unit: "cm", invert: true },
          { id: "fatigue", label: "Fatiga", Icon: Battery, value: fCurr != null ? `${fCurr}/5` : "—", series: fatigueSeries, color: "#F59E0B", unit: "", invert: true, word: FATIGUE_LABELS[String(currentEntry.fatigue)] },
          { id: "sleep", label: "Sueño", Icon: Moon, value: sCurr != null ? `${sCurr}/5` : "—", series: sleepSeries, color: "#22C55E", unit: "", invert: false, word: SLEEP_LABELS[String(currentEntry.sleep)] },
          { id: "musclePain", label: "Dolor muscular", Icon: Dumbbell, value: pCurr != null ? `${pCurr}/5` : "—", series: painSeries, color: "#A78BFA", unit: "", invert: true, word: PAIN_LABELS[String(currentEntry.musclePain)] },
        ].map((m) => (
          <div key={m.id} className="rounded-2xl border border-depro-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-depro-gray inline-flex items-center gap-1.5">
                <m.Icon size={13} /> {m.label}
              </span>
            </div>
            <p className="text-2xl font-black text-depro-dark tabular-nums">{m.value}</p>
            {m.word && <p className="text-[11px] text-depro-gray">{m.word}</p>}
            <div className="mt-2 flex items-end justify-between gap-2">
              <DeltaLine delta={cardsById[m.id]?.delta} unit={m.unit} invert={m.invert} />
              <MiniSpark series={m.series} color={m.color} />
            </div>
            {(m.id === "fatigue" || m.id === "sleep" || m.id === "musclePain") && (
              <div className="mt-2">
                <ScoreDots value={m.id === "fatigue" ? fCurr : m.id === "sleep" ? sCurr : pCurr} invert={m.invert} />
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-depro-border bg-white p-5 shadow-card">
          <h2 className="font-black text-depro-dark">Evolución corporal</h2>
          <p className="text-xs text-depro-gray mb-2">Peso y perímetro abdominal</p>
          <BodyChart weight={weightSeries} waist={waistSeries} />
        </div>
        <div className="rounded-2xl border border-depro-border bg-white p-5 shadow-card">
          <h2 className="font-black text-depro-dark">Recuperación</h2>
          <p className="text-xs text-depro-gray mb-2">Fatiga, sueño y dolor muscular (1–5)</p>
          <RecoverChart fatigue={fatigueSeries} sleep={sleepSeries} pain={painSeries} />
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-4">
        <form onSubmit={handleSave} className="lg:col-span-3 rounded-2xl border border-depro-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-black text-depro-dark">Registrar semana</h2>
              <p className="text-xs text-depro-gray">Actualiza tus datos de esta semana.</p>
            </div>
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <Check className="h-3.5 w-3.5" /> Guardado
              </span>
            )}
          </div>
          {msg && (
            <div className={`rounded-xl border px-3 py-2 text-sm ${msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
              {msg.text}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-depro-dark inline-flex items-center gap-1.5"><Scale size={13} /> Peso (kg)</span>
              <input type="number" min="30" max="250" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-depro-dark inline-flex items-center gap-1.5"><Ruler size={13} /> Perímetro abdominal (cm)</span>
              <input type="number" min="40" max="200" step="0.5" value={waistCm} onChange={(e) => setWaistCm(e.target.value)}
                className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-depro-dark inline-flex items-center gap-1.5"><Battery size={13} /> Fatiga (1–5)</span>
              <select value={fatigue} onChange={(e) => setFatigue(e.target.value)}
                className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-violet-500">
                {FATIGUE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value} — {o.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-depro-dark inline-flex items-center gap-1.5"><Moon size={13} /> Sueño (1–5)</span>
              <select value={sleep} onChange={(e) => setSleep(e.target.value)}
                className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-violet-500">
                {SLEEP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value} — {o.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold text-depro-dark inline-flex items-center gap-1.5"><Dumbbell size={13} /> Dolor muscular percibido (1–5)</span>
              <select value={musclePain} onChange={(e) => setMusclePain(e.target.value)}
                className="w-full rounded-xl border border-depro-border px-3 py-2.5 text-sm outline-none focus:border-violet-500">
                {PAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value} — {o.label}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-depro-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            <Activity className="h-4 w-4" /> {isSaved ? "Actualizar semana" : "Guardar semana"}
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl border border-depro-border bg-white p-5 shadow-card">
          <h2 className="font-black text-depro-dark mb-1">Tendencia general</h2>
          <p className="text-xs text-depro-gray mb-3">Comparado con la semana anterior</p>
          <div className="divide-y divide-depro-border">
            <TrendRow label="Peso" Icon={Scale} delta={cardsById.weight?.delta} invert unit="kg" />
            <TrendRow label="Cintura" Icon={Ruler} delta={cardsById.waist?.delta} invert unit="cm" />
            <TrendRow label="Fatiga" Icon={Battery} delta={cardsById.fatigue?.delta} invert stableLabel="Estable" unit="punto" />
            <TrendRow label="Sueño" Icon={Moon} delta={cardsById.sleep?.delta} stableLabel="Estable" unit="punto" />
            <TrendRow label="Dolor muscular" Icon={Dumbbell} delta={cardsById.musclePain?.delta} invert stableLabel="Estable" unit="punto" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-depro-border bg-white shadow-card">
        <div className="border-b border-depro-border px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-depro-dark">Historial</h2>
            <p className="text-xs text-depro-gray">Todas tus semanas registradas.</p>
          </div>
          <select
            value={historyCount}
            onChange={(e) => setHistoryCount(Number(e.target.value))}
            className="rounded-xl border border-depro-border px-3 py-1.5 text-xs font-semibold text-depro-dark"
          >
            <option value={4}>Últimas 4 semanas</option>
            <option value={8}>Últimas 8 semanas</option>
            <option value={12}>Últimas 12 semanas</option>
          </select>
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
                  <th className="px-3 py-3 font-semibold">Dolor</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.slice(0, historyCount).map((row, idx) => {
                  const isCurrent = row.weekKey === currentWeek;
                  return (
                    <tr key={row.weekKey} className={`border-t border-depro-border ${isCurrent ? "bg-violet-50/70" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                      <td className="px-4 py-3.5 sm:px-5">
                        <p className="font-medium text-depro-dark">{formatWeekLabel(row.weekKey)}</p>
                        {isCurrent && <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">Actual</span>}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-depro-dark">{row.weightKg ? `${row.weightKg} kg` : "—"}</td>
                      <td className="px-3 py-3.5 tabular-nums text-depro-dark">{row.waistCm ? `${row.waistCm} cm` : "—"}</td>
                      <td className="px-3 py-3.5">
                        <ScoreDots value={row.fatigue} invert />
                        <div className="text-[11px] text-depro-gray">{FATIGUE_LABELS[String(row.fatigue)] || "—"}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <ScoreDots value={row.sleep} />
                        <div className="text-[11px] text-depro-gray">{SLEEP_LABELS[String(row.sleep)] || "—"}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <ScoreDots value={row.musclePain} invert />
                        <div className="text-[11px] text-depro-gray">{PAIN_LABELS[String(row.musclePain)] || "—"}</div>
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
