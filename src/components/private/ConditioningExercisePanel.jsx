import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Route, Timer, Zap, Activity, Trophy } from "lucide-react";
import { LineChart, BarChart } from "./SparkCharts";
import {
  listLoggedExercises,
  getConditioningExerciseDetail,
  formatPace,
  formatMinutes,
  formatSeconds,
  formatSpeedKmh,
  formatSpeedMps,
} from "../../lib/loadAnalytics";

function formatKm(km) {
  if (km == null || !Number.isFinite(km)) return "—";
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(km)} km`;
}

function formatNum(value, digits = 0, suffix = "") {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)}${suffix}`;
}

function shortDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function Pct({ value, invert, caption }) {
  if (value == null) return <span className="text-[11px] text-neutral-400">{caption}</span>;
  const good = value === 0 ? null : (invert ? value < 0 : value > 0);
  const tone = good == null ? "bg-neutral-100 text-neutral-600" : good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
  return (
    <span className="text-[11px] text-neutral-500">
      <span className={`font-black mr-1 px-1.5 py-0.5 rounded-full ${tone}`}>{value > 0 ? "+" : ""}{value}%</span>
      {caption}
    </span>
  );
}

function MetricCard({ icon, label, value, delta, invert, caption }) {
  const Glyph = icon;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 inline-flex items-center gap-1.5">
        <Glyph size={13} className="text-[#FB2C39]" /> {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#111] tabular-nums truncate">{value}</p>
      <div className="mt-1"><Pct value={delta} invert={invert} caption={caption} /></div>
    </div>
  );
}

const RES_METRICS = [
  { id: "load", label: "Carga" },
  { id: "distance", label: "Distancia (km)" },
  { id: "time", label: "Tiempo (min)" },
  { id: "speed", label: "Velocidad (km/h)" },
  { id: "pace", label: "Ritmo" },
  { id: "heartRate", label: "FC (ppm)" },
  { id: "rpe", label: "RPE" },
];

const SPEED_METRICS = [
  { id: "time", label: "Tiempo (s)" },
  { id: "speed", label: "Velocidad (m/s)" },
];

export default function ConditioningExercisePanel({ userId, domain, tick }) {
  const [picked, setPicked] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [metric, setMetric] = useState(domain === "velocidad" ? "time" : "load");
  const speed = domain === "velocidad";

  const exercises = useMemo(() => {
    void tick;
    return listLoggedExercises(userId).filter((exercise) => exercise.tipo === domain);
  }, [userId, tick, domain]);
  const exerciseName = exercises.some((exercise) => exercise.name === picked) ? picked : (exercises[0]?.name || "");

  const detail = useMemo(() => {
    void tick;
    return exerciseName ? getConditioningExerciseDetail(userId, exerciseName, domain, { weeks }) : null;
  }, [userId, exerciseName, domain, weeks, tick]);

  const caption = weeks > 0 ? "vs. periodo anterior" : "vs. sesión anterior";
  const chartMetric = speed && metric !== "time" && metric !== "speed" ? "time" : metric;
  const chart = detail?.charts?.[chartMetric] || [];
  const series = chart.map((point) => {
    if (point.value == null) return point;
    if (chartMetric === "time" && !speed) return { ...point, value: point.value / 60 };
    if (chartMetric === "distance") return { ...point, value: Math.round(point.value * 10) / 10 };
    return point;
  });
  const formatTick = chartMetric === "pace"
    ? (value) => formatPace(value)?.replace("/km", "") || ""
    : chartMetric === "time" && !speed
      ? (value) => `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value)} min`
      : chartMetric === "time"
        ? (value) => `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value)} s`
        : chartMetric === "speed"
          ? (value) => `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: speed ? 2 : 1 }).format(speed ? value : value * 3.6)}`
          : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Ejercicio</span>
          <select
            value={exerciseName}
            onChange={(event) => setPicked(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#111] outline-none focus:border-[#FB2C39]"
          >
            {exercises.length === 0 && <option value="">Sin ejercicios de {domain}</option>}
            {exercises.map((exercise) => (
              <option key={exercise.name} value={exercise.name}>{exercise.name}</option>
            ))}
          </select>
        </label>
        <select
          aria-label="Periodo"
          value={String(weeks)}
          onChange={(event) => setWeeks(Number(event.target.value))}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#111] outline-none"
        >
          <option value="4">Últimas 4 semanas</option>
          <option value="8">Últimas 8 semanas</option>
          <option value="0">Todo el historial</option>
        </select>
      </div>

      {exercises.length === 0 || detail?.empty ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Registra este tipo de ejercicio en una sesión para ver su historial. Cada ejercicio se sigue aparte.
          <div className="mt-3">
            <Link to="/dashboard/plan" className="text-[#FB2C39] font-bold hover:underline">Ir al plan semanal</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {speed ? (
              <>
                <MetricCard icon={Trophy} label="Mejor tiempo" value={formatSeconds(detail.best.timeSec) || "—"} caption="marca personal" />
                <MetricCard icon={Timer} label="Último tiempo" value={formatSeconds(detail.last?.timeSec) || "—"} delta={detail.deltas.time} invert caption={caption} />
                <MetricCard icon={Zap} label="Velocidad media" value={formatSpeedMps(detail.totals.speedMps) || "—"} delta={detail.deltas.speed} caption={caption} />
                <MetricCard icon={Heart} label="FC media" value={formatNum(detail.totals.heartRate, 0, " ppm")} delta={detail.deltas.heartRate} invert caption={caption} />
              </>
            ) : (
              <>
                <MetricCard icon={Route} label="Distancia total" value={formatKm(detail.totals.distanceKm)} delta={detail.deltas.distance} caption={caption} />
                <MetricCard icon={Timer} label="Tiempo total" value={formatMinutes(detail.totals.timeSec) || "—"} delta={detail.deltas.time} caption={caption} />
                <MetricCard icon={Zap} label="Velocidad media" value={formatSpeedKmh(detail.totals.speedKmh) || "—"} delta={detail.deltas.speed} caption={caption} />
                <MetricCard icon={Activity} label="Ritmo medio" value={formatPace(detail.totals.paceSec) || "—"} delta={detail.deltas.pace} invert caption={caption} />
                <MetricCard icon={Heart} label="FC media" value={formatNum(detail.totals.heartRate, 0, " ppm")} delta={detail.deltas.heartRate} invert caption={caption} />
                <MetricCard icon={Zap} label="Carga interna" value={detail.totals.load != null ? `${formatNum(detail.totals.load)} u.a.` : "—"} delta={detail.deltas.load} caption={caption} />
              </>
            )}
          </div>

          <div className="inline-flex rounded-full bg-neutral-100 p-1 flex-wrap">
            {(speed ? SPEED_METRICS : RES_METRICS).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMetric(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${metric === item.id ? "bg-[#FB2C39] text-white" : "text-neutral-600"}`}
                >
                  {item.label}
                </button>
              ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
              <h2 className="font-black text-[#111]">
                {chartMetric === "speed"
                  ? "Evolución de la velocidad"
                  : speed || chartMetric === "time"
                    ? `Evolución del tiempo (${speed ? "s" : "min"})`
                    : chartMetric === "distance"
                      ? "Evolución de la distancia"
                      : chartMetric === "pace"
                        ? "Evolución del ritmo"
                        : chartMetric === "heartRate"
                          ? "Evolución de la FC"
                          : chartMetric === "rpe"
                            ? "Evolución del RPE"
                            : "Evolución de la carga"}
              </h2>
              <p className="text-xs text-neutral-500 mb-2">
                {exerciseName}. {chartMetric === "time" || chartMetric === "pace" ? "Una línea que baja es una mejora." : "Solo las sesiones de este ejercicio."}
              </p>
              <LineChart series={series} color="#FB2C39" formatTick={formatTick} />
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
              {speed ? (
                <>
                  <h2 className="font-black text-[#111] mb-3">Mejores marcas</h2>
                  <p className="text-3xl font-black text-[#111]">{formatSeconds(detail.best.timeSec) || "—"}</p>
                  <p className="text-xs text-neutral-500 mb-1">Mejor tiempo de {exerciseName}</p>
                  <p className="text-sm text-neutral-600 mb-4">Velocidad de esa marca: <span className="font-black text-[#111]">{formatSpeedMps(detail.best.speedMps) || "—"}</span></p>
                  <p className="text-sm text-neutral-600">Último descanso: <span className="font-black text-[#111]">{detail.last?.rest || "—"}</span></p>
                  <p className="text-sm text-neutral-600 mt-1">Últimas repeticiones: <span className="font-black text-[#111]">{detail.last?.repsLabel || detail.last?.reps || "—"}</span></p>
                </>
              ) : (
                <>
                  <h2 className="font-black text-[#111]">Volumen semanal</h2>
                  <p className="text-xs text-neutral-500 mb-2">Distancia de {exerciseName}</p>
                  <BarChart
                    series={detail.weekly.map((week) => ({ label: week.label, value: week.distanceKm }))}
                    color="#FB2C39"
                    formatValue={(value) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
            <h2 className="font-black text-[#111] px-4 py-3 border-b border-neutral-100">Sesiones de {exerciseName}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase text-neutral-400">
                    <th className="text-left font-bold px-4 py-2">Fecha</th>
                    {speed ? (
                      <>
                        <th className="text-right font-bold px-2 py-2">Tiempo (s)</th>
                        <th className="text-right font-bold px-2 py-2">Velocidad</th>
                        <th className="text-right font-bold px-2 py-2">Reps</th>
                        <th className="text-right font-bold px-2 py-2">Descanso (s)</th>
                        <th className="text-right font-bold px-4 py-2">FC (ppm)</th>
                      </>
                    ) : (
                      <>
                        <th className="text-right font-bold px-2 py-2">Distancia</th>
                        <th className="text-right font-bold px-2 py-2">Tiempo (min)</th>
                        <th className="text-right font-bold px-2 py-2">Velocidad</th>
                        <th className="text-right font-bold px-2 py-2">Ritmo</th>
                        <th className="text-right font-bold px-2 py-2">FC (ppm)</th>
                        <th className="text-right font-bold px-2 py-2">RPE</th>
                        <th className="text-right font-bold px-4 py-2">Carga</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.sessions.map((session) => (
                    <tr key={session.date} className="border-t border-neutral-100">
                      <td className="px-4 py-2.5 font-semibold text-[#111] whitespace-nowrap">{shortDate(session.date)}</td>
                      {speed ? (
                        <>
                          <td className="px-2 py-2.5 text-right font-black tabular-nums">{formatSeconds(session.timeSec) || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{formatSpeedMps(session.speedMps) || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{session.repsLabel || session.reps || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{session.rest || "—"}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{session.heartRate != null ? `${Math.round(session.heartRate)} ppm` : "—"}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-2.5 text-right tabular-nums">{formatKm(session.distanceKm)}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{formatMinutes(session.timeSec) || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{formatSpeedKmh(session.speedKmh) || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{formatPace(session.paceSec) || "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{session.heartRate != null ? `${Math.round(session.heartRate)}` : "—"}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{session.rpe ?? "—"}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{session.load != null ? `${session.load} u.a.` : "—"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
