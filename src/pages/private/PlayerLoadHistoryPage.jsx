import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gauge, Calendar, Dumbbell, TrendingUp, Activity, Trophy,
  Timer, BarChart2, ArrowUpRight, ArrowDownRight, Minus, Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import { hydrateUserPersonalData } from "../../lib/userDataSync";
import {
  listLoggedExercises,
  getExerciseProgressDetail,
  getWeeklyLoadControl,
} from "../../lib/loadAnalytics";
import { mondayOfDate, formatWeekLabel } from "../../lib/wellnessLogs";
import { LineChart, BarChart, DonutChart } from "../../components/private/SparkCharts";

function deltaClass(delta, invert = false) {
  if (delta == null || Math.abs(delta) < 0.05) return "text-depro-gray";
  const good = invert ? delta < 0 : delta > 0;
  return good ? "text-emerald-600" : "text-rose-600";
}

function Delta({ value, unit = "", invert = false }) {
  if (value == null) return <span className="text-depro-gray text-sm">—</span>;
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${deltaClass(value, invert)}`}>
      <Icon size={16} /> {sign}{value}{unit}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon, accent = "text-depro-red" }) {
  return (
    <div className="rounded-2xl border border-depro-border bg-white p-4 shadow-card">
      <p className="text-[11px] font-bold uppercase tracking-wide text-depro-gray inline-flex items-center gap-1.5 mb-2">
        <Icon size={13} className={accent} /> {label}
      </p>
      <p className="text-2xl font-black text-depro-dark tabular-nums">{value}</p>
      {sub && <div className="mt-1 text-sm">{sub}</div>}
    </div>
  );
}

export default function PlayerLoadHistoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("ejercicio");
  const [metric, setMetric] = useState("peso");
  const [tick, setTick] = useState(0);
  const [exerciseName, setExerciseName] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    hydrateUserPersonalData(user.id).then(() => setTick((n) => n + 1)).catch(() => {});
  }, [user?.id]);

  const exercises = useMemo(() => listLoggedExercises(user?.id), [user?.id, tick]);
  useEffect(() => {
    if (!exerciseName && exercises[0]?.name) setExerciseName(exercises[0].name);
  }, [exercises, exerciseName]);

  const detail = useMemo(
    () => (exerciseName ? getExerciseProgressDetail(user?.id, exerciseName) : null),
    [user?.id, exerciseName, tick],
  );
  const control = useMemo(() => getWeeklyLoadControl(user?.id, { weeks: 4 }), [user?.id, tick]);

  const chartSeries = metric === "volumen"
    ? detail?.chartVolume
    : metric === "1rm"
      ? detail?.chart1rm
      : detail?.chartWeight;

  const last = detail?.last;
  const sessionsChrono = [...(detail?.sessions || [])].reverse();

  const unitsDelta = control.prev?.units != null && control.current.units
    ? Math.round(((control.current.units - control.prev.units) / Math.max(control.prev.units, 1)) * 100)
    : null;
  const timeDelta = control.prev?.minutes != null && control.current.minutes
    ? Math.round(((control.current.minutes - control.prev.minutes) / Math.max(control.prev.minutes, 1)) * 100)
    : null;
  const sessionGoal = 5;
  const sessionPct = sessionGoal ? Math.round((control.current.sessions / sessionGoal) * 100) : 0;

  const formatMin = (m) => {
    if (!m) return "—";
    const h = Math.floor(m / 60);
    const min = Math.round(m % 60);
    return h ? `${h} h ${min} min` : `${min} min`;
  };

  return (
    <FeatureGate user={user} feature="cargas">
      <div className="dash-page space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-depro-red-light text-depro-red flex items-center justify-center shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-depro-dark tracking-tight">Mis cargas</h1>
              <p className="text-sm text-depro-gray">Seguimiento de tu progresión en ejercicios y control de la carga de entrenamiento.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-depro-border bg-white px-3 py-2 text-sm font-semibold text-depro-dark">
            <Calendar size={14} /> Semana {formatWeekLabel(mondayOfDate())}
          </div>
        </header>

        <div className="inline-flex rounded-xl border border-depro-border bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("ejercicio")}
            className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${tab === "ejercicio" ? "bg-depro-red text-white" : "text-depro-gray hover:text-depro-dark"}`}
          >
            <Dumbbell size={14} /> Progresión por ejercicio
          </button>
          <button
            type="button"
            onClick={() => setTab("carga")}
            className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${tab === "carga" ? "bg-depro-red text-white" : "text-depro-gray hover:text-depro-dark"}`}
          >
            <Activity size={14} /> Control de carga
          </button>
        </div>

        {tab === "ejercicio" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Ejercicio</span>
                <select
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full rounded-xl border border-depro-border bg-white px-4 py-2.5 text-sm font-semibold text-depro-dark outline-none focus:border-depro-red"
                >
                  {exercises.length === 0 && <option value="">Sin ejercicios registrados</option>}
                  {exercises.map((ex) => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </select>
              </label>
              <div className="inline-flex rounded-xl border border-depro-border bg-white p-1 self-start">
                {[
                  { id: "peso", label: "Carga (kg)" },
                  { id: "volumen", label: "Volumen (kg)" },
                  { id: "1rm", label: "1RM est." },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetric(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${metric === m.id ? "bg-depro-red text-white" : "text-depro-gray"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {exercises.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-depro-border bg-white p-10 text-center text-sm text-depro-gray">
                Guarda series desde una sesión para ver la progresión de cada ejercicio.
                <div className="mt-3">
                  <Link to="/dashboard/plan" className="text-depro-red font-bold hover:underline">Ir al plan semanal</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <MetricCard
                    label="Última carga"
                    icon={Dumbbell}
                    value={last?.maxWeight != null ? `${last.maxWeight} kg` : "—"}
                  />
                  <MetricCard
                    label="Progresión"
                    icon={TrendingUp}
                    value={<Delta value={detail?.deltaWeight} unit=" kg" />}
                    sub={<span className="text-[11px] text-depro-gray">vs. sesión anterior</span>}
                  />
                  <MetricCard
                    label="Récord personal"
                    icon={Trophy}
                    value={detail?.record?.maxWeight != null ? `${detail.record.maxWeight} kg` : "—"}
                  />
                  <MetricCard
                    label="1RM estimado"
                    icon={Gauge}
                    value={detail?.epley != null ? `≈ ${detail.epley} kg` : "—"}
                    sub={<span className="text-[11px] text-depro-gray">Fórmula de Epley</span>}
                  />
                </div>

                <div className="grid lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3 rounded-2xl border border-depro-border bg-white p-5 shadow-card">
                    <h2 className="font-black text-depro-dark mb-1">
                      {metric === "volumen" ? "Volumen de entrenamiento" : metric === "1rm" ? "1RM estimado" : "Evolución de la carga"}
                    </h2>
                    <LineChart series={chartSeries || []} color="#FB2C39" />
                  </div>
                  <div className="lg:col-span-2 rounded-2xl border border-depro-border bg-white p-5 shadow-card">
                    <h2 className="font-black text-depro-dark mb-3 inline-flex items-center gap-2">
                      <Calendar size={16} className="text-depro-red" /> Últimas sesiones
                    </h2>
                    {sessionsChrono.length === 0 ? (
                      <p className="text-sm text-depro-gray">Sin sesiones.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase text-depro-gray">
                            <th className="text-left pb-2 font-bold">Sesión</th>
                            <th className="text-right pb-2 font-bold">Carga</th>
                            <th className="text-right pb-2 font-bold">Series × rep</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionsChrono.slice(0, 6).map((s, i) => {
                            const sets = s.series?.length || Number(s.log?.sets) || 1;
                            const reps = s.series?.find((row) => row.reps)?.reps || s.repsAtMax || "—";
                            return (
                              <tr key={s.date || i} className="border-t border-depro-border/70">
                                <td className="py-2.5 font-semibold text-depro-dark">
                                  {i === 0 ? "Actual" : `S−${i}`}
                                </td>
                                <td className="py-2.5 text-right tabular-nums font-black text-depro-dark">
                                  {s.maxWeight != null ? `${s.maxWeight} kg` : "—"}
                                </td>
                                <td className="py-2.5 text-right tabular-nums text-depro-gray">
                                  {sets} × {reps}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "carga" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="Carga total"
                icon={Activity}
                value={`${(control.current.units || 0).toLocaleString("es-ES")} UA`}
                sub={<Delta value={unitsDelta} unit="%" invert={false} />}
              />
              <MetricCard
                label="Tiempo total"
                icon={Timer}
                value={formatMin(control.current.minutes)}
                sub={<Delta value={timeDelta} unit="%" invert />}
              />
              <MetricCard
                label="Sesiones"
                icon={Calendar}
                value={`${control.current.sessions} / ${sessionGoal}`}
                sub={<span className="text-[11px] text-depro-gray">{sessionPct}% del objetivo</span>}
              />
              <MetricCard
                label="RPE medio"
                icon={Gauge}
                value={control.current.avgRpe != null ? `${control.current.avgRpe} / 10` : "—"}
              />
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 rounded-2xl border border-depro-border bg-white p-5 shadow-card">
                <h2 className="font-black text-depro-dark mb-1">Evolución de la carga (UA)</h2>
                <BarChart series={control.series.map((s) => ({ label: s.label, value: s.units }))} />
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-depro-border bg-white p-5 shadow-card">
                <h2 className="font-black text-depro-dark mb-1 inline-flex items-center gap-2">
                  ACWR <span className="text-[11px] font-semibold text-depro-gray">(carga aguda/crónica)</span>
                  <span title="Indicador descriptivo de la relación entre la carga de esta semana y la habitual. No predice lesiones.">
                    <Info size={13} className="text-depro-gray" />
                  </span>
                </h2>
                {control.acwr == null ? (
                  <p className="text-sm text-depro-gray mt-6">
                    Hacen falta al menos 3 semanas con registros para calcular el ACWR. Es un indicador descriptivo, no un predictor de lesiones.
                  </p>
                ) : (
                  <div className="mt-4">
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-black text-depro-dark tabular-nums">{control.acwr.toFixed(2).replace(".", ",")}</p>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        control.acwrBand?.tone === "positive" ? "bg-emerald-50 text-emerald-700"
                          : control.acwrBand?.tone === "mixed" ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {control.acwrBand?.label}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-sky-300 via-emerald-400 to-rose-400 relative">
                      <span
                        className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-depro-dark border-2 border-white shadow"
                        style={{ left: `${Math.min(100, Math.max(0, (control.acwr / 2) * 100))}%`, transform: "translateX(-50%)" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-depro-gray mt-1.5">
                      <span>&lt; 0,8 Baja</span>
                      <span>0,8 – 1,3 Óptima</span>
                      <span>&gt; 1,3 Alta</span>
                    </div>
                    <p className="text-[11px] text-depro-gray mt-3 leading-relaxed">
                      Describe si esta semana está por debajo, en línea o por encima de tu carga habitual. No se usa para predecir lesiones.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-depro-border bg-white p-5 shadow-card">
              <h2 className="font-black text-depro-dark mb-3">Distribución de la carga</h2>
              <DonutChart
                slices={control.distribution.map((d) => ({ key: d.key, label: d.label, value: d.units, pct: d.pct }))}
                totalValue={(control.current.units || 0).toLocaleString("es-ES")}
                totalLabel="UA"
              />
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
