import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Gauge, Calendar, Dumbbell, TrendingUp, Activity, Target,
  Timer, Route, Heart, BarChart2, CheckCircle2, ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import { getLoadLogs } from "../../lib/loadLogs";
import {
  getMaxWeightByWeek,
  getTopWeightedExercises,
  getImprovementSummary,
} from "../../lib/loadAnalytics";
import { loadProgressIds, weekKey } from "../../lib/sessionProgress";

const TEST_IDS = [
  { id: "resistencia", name: "Resistencia aeróbica", unit: "rectas" },
  { id: "sprint", name: "Sprint lineal", unit: "seg" },
  { id: "cod", name: "Cambio de dirección", unit: "seg" },
  { id: "cmj", name: "Salto vertical CMJ", unit: "cm" },
];

function accentOf(user) {
  const raw = user?.club?.primaryColor || user?.primaryColor || "#0A36F7";
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : "#0A36F7";
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function isoMonday(d) {
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(d.getDate() - day + 1);
  return mon;
}

function weeksOfMonth(ref = new Date()) {
  const { start, end } = monthBounds(ref);
  const weeks = [];
  let cur = isoMonday(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    const weekEnd = new Date(cur);
    weekEnd.setDate(cur.getDate() + 6);
    weeks.push({
      key,
      label: cur.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      start: new Date(cur),
      end: weekEnd,
    });
    cur = new Date(cur);
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

function parseNum(v) {
  const n = parseFloat(String(v ?? "").replace(",", ".").split("/")[0]);
  return Number.isFinite(n) ? n : null;
}

function volumeOf(log) {
  const w = parseNum(log.weight) || 0;
  const sets = parseNum(log.sets) || (Array.isArray(log.series) ? log.series.length : 1);
  const reps = parseNum(log.reps) || 1;
  if (w > 0) return w * sets * reps;
  return sets * reps;
}

function loadTestHistory(userId) {
  if (!userId) return [];
  return TEST_IDS.map((t) => {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(`depro_test_${userId}_${t.id}`) || "[]");
    } catch { /* ignore */ }
    return { ...t, history: Array.isArray(history) ? history : [] };
  }).filter((t) => t.history.length > 0);
}

function paceLabel(log) {
  const dist = parseNum(log.distance);
  const time = parseNum(log.time);
  if (dist && time && dist > 0) {
    const pace = time / dist;
    return `${pace.toFixed(2)} /u`;
  }
  if (log.intensity) return String(log.intensity);
  if (log.rpe) return `RPE ${log.rpe}`;
  return null;
}

function isSpeedOrEndurance(log) {
  const obj = String(log.objective || "").toLowerCase();
  return obj.includes("velocidad") || obj.includes("resistencia")
    || log.time || log.distance || log.heartRate;
}

function BarChart({ items, accent, valueKey = "value", labelKey = "label", height = 120 }) {
  const max = Math.max(...items.map((i) => i[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {items.map((item) => {
        const v = item[valueKey] || 0;
        const h = Math.max(8, Math.round((v / max) * (height - 28)));
        return (
          <div key={item[labelKey]} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
            <span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>
              {v ? (Number.isInteger(v) ? v : Number(v).toFixed(1)) : "—"}
            </span>
            <div
              className="w-full max-w-[48px] rounded-t-md transition-all"
              style={{ height: h, background: `linear-gradient(180deg, ${accent}, ${accent}99)` }}
              title={`${item[labelKey]}: ${v}`}
            />
            <span className="text-[10px] text-depro-gray truncate w-full text-center">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, accent, children, action }) {
  return (
    <section className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-depro-border flex items-start justify-between gap-3"
        style={{ background: `linear-gradient(135deg, ${accent}0d 0%, #fff 70%)` }}>
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accent}18`, color: accent }}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-depro-dark">{title}</h2>
            {subtitle && <p className="text-xs text-depro-gray mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyHint({ children }) {
  return (
    <p className="text-sm text-depro-gray text-center py-6">{children}</p>
  );
}

export default function PlayerLoadHistoryPage() {
  const { user } = useAuth();
  const accent = accentOf(user);
  const now = useMemo(() => new Date(), []);
  const monthLabel = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const { start: monthStart, end: monthEnd } = useMemo(() => monthBounds(now), [now]);
  const monthWeeks = useMemo(() => weeksOfMonth(now), [now]);

  const logs = useMemo(() => getLoadLogs(user?.id), [user?.id]);
  const monthLogs = useMemo(
    () => logs.filter((l) => {
      const d = new Date(l.recordedAt);
      return d >= monthStart && d <= monthEnd;
    }),
    [logs, monthStart, monthEnd],
  );

  const weightWeeks = useMemo(() => getMaxWeightByWeek(user?.id), [user?.id]);
  const topExercises = useMemo(() => getTopWeightedExercises(user?.id, 6), [user?.id]);
  const improvement = useMemo(() => getImprovementSummary(user?.id), [user?.id]);
  const testData = useMemo(() => loadTestHistory(user?.id), [user?.id]);

  const weekStats = useMemo(() => monthWeeks.map((w, idx) => {
    const weekLogs = monthLogs.filter((l) => {
      const d = new Date(l.recordedAt);
      return d >= w.start && d <= w.end;
    });
    const vol = weekLogs.reduce((a, l) => a + volumeOf(l), 0);
    const intensity = weekLogs.length
      ? weekLogs.reduce((a, l) => a + (parseNum(l.rpe) || 0), 0) / weekLogs.length
      : 0;
    const completedIds = user?.id ? loadProgressIds(user.id, w.key) : [];
    const sessions = new Set(weekLogs.map((l) => l.sessionId || l.sessionTitle).filter(Boolean)).size;
    return {
      ...w,
      weekNum: idx + 1,
      label: `S${idx + 1}`,
      volume: Math.round(vol),
      intensity: +intensity.toFixed(1),
      entries: weekLogs.length,
      sessions,
      completed: completedIds.length,
    };
  }), [monthWeeks, monthLogs, user?.id]);

  const currentWeekKey = weekKey(now);
  const adherence = useMemo(() => {
    const totalCompleted = weekStats.reduce((a, w) => a + w.completed, 0);
    const totalEntries = weekStats.reduce((a, w) => a + w.entries, 0);
    const weeksWithData = weekStats.filter((w) => w.entries > 0 || w.completed > 0).length;
    const trend = weekStats.length >= 2
      ? (weekStats[weekStats.length - 1].volume || 0) - (weekStats[0].volume || 0)
      : 0;
    return { totalCompleted, totalEntries, weeksWithData, trend };
  }, [weekStats]);

  const exerciseVolume = useMemo(() => {
    const map = {};
    monthLogs.forEach((l) => {
      const name = l.exerciseName || "Ejercicio";
      if (!map[name]) map[name] = { name, volume: 0, count: 0, maxWeight: 0 };
      map[name].volume += volumeOf(l);
      map[name].count += 1;
      map[name].maxWeight = Math.max(map[name].maxWeight, parseNum(l.weight) || 0);
    });
    return Object.values(map)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8)
      .map((e) => ({ ...e, volume: Math.round(e.volume) }));
  }, [monthLogs]);

  const speedLogs = useMemo(
    () => monthLogs.filter(isSpeedOrEndurance).slice(0, 12),
    [monthLogs],
  );

  const monthWeightWeeks = useMemo(() => {
    const keys = new Set(monthWeeks.map((w) => w.key));
    const filtered = weightWeeks.filter((w) => keys.has(w.week));
    return filtered.length ? filtered : weightWeeks.slice(-4);
  }, [weightWeeks, monthWeeks]);

  return (
    <FeatureGate user={user} feature="cargas">
      <div className="dash-page space-y-6">
        {/* Hero */}
        <header
          className="relative overflow-hidden rounded-3xl border border-depro-border px-6 py-8 sm:px-8 sm:py-10 text-white"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 45%, #0a1a4a 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 85% 20%, #fff 0%, transparent 40%), radial-gradient(circle at 10% 90%, #fff 0%, transparent 35%)",
            }}
          />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 mb-2">
              Mesociclo mensual · Control de cargas
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Control de cargas
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-xl">
              Seguimiento del mesociclo de{" "}
              <span className="font-semibold capitalize text-white">{monthLabel}</span>
              : volumen, intensidad, tests y evolución — no cambios de rutina semanal.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Calendar size={13} /> {monthLogs.length} registros este mes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <CheckCircle2 size={13} /> {adherence.totalCompleted} sesiones marcadas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <BarChart2 size={13} /> Semana actual · {currentWeekKey.slice(5)}
              </span>
            </div>
          </div>
        </header>

        {logs.length === 0 && testData.length === 0 ? (
          <div className="bg-white border border-depro-border rounded-2xl p-10 text-center shadow-card">
            <Gauge size={32} className="mx-auto mb-3" style={{ color: accent }} />
            <p className="text-depro-dark font-bold mb-1">Aún no hay registros este mesociclo</p>
            <p className="text-depro-gray text-sm max-w-md mx-auto">
              Guarda cargas desde tus sesiones de entrenamiento para ver progresión, volumen e intensidad del mes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Progresión */}
            <SectionCard
              title="Progresión"
              subtitle="Completado de sesiones · volumen e intensidad por semana del mes"
              icon={TrendingUp}
              accent={accent}
            >
              {weekStats.every((w) => !w.entries && !w.completed) ? (
                <EmptyHint>Registra entrenamientos para comparar las semanas del mesociclo.</EmptyHint>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">Volumen semanal</p>
                    <BarChart
                      items={weekStats.map((w) => ({ label: w.label, value: w.volume }))}
                      accent={accent}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">Intensidad media (RPE)</p>
                    <BarChart
                      items={weekStats.map((w) => ({ label: w.label, value: w.intensity }))}
                      accent="#F59E0B"
                      height={96}
                    />
                  </div>
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-depro-gray text-left">
                          <th className="py-2 pr-2 font-bold">Semana</th>
                          <th className="py-2 pr-2 font-bold">Sesiones</th>
                          <th className="py-2 pr-2 font-bold">Completadas</th>
                          <th className="py-2 pr-2 font-bold">Registros</th>
                          <th className="py-2 font-bold">vs. ant.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekStats.map((w, i) => {
                          const prev = i > 0 ? weekStats[i - 1].volume : null;
                          const delta = prev != null && prev > 0
                            ? Math.round(((w.volume - prev) / prev) * 100)
                            : null;
                          return (
                            <tr key={w.key} className="border-t border-depro-border">
                              <td className="py-2.5 pr-2 font-semibold text-depro-dark">
                                {w.label}{" "}
                                <span className="text-depro-gray font-normal">{monthWeeks[i]?.label}</span>
                              </td>
                              <td className="py-2.5 pr-2">{w.sessions || "—"}</td>
                              <td className="py-2.5 pr-2">{w.completed || "—"}</td>
                              <td className="py-2.5 pr-2">{w.entries || "—"}</td>
                              <td className="py-2.5 font-bold" style={{
                                color: delta == null ? "#9CA3AF" : delta >= 0 ? "#16A34A" : "#DC2626",
                              }}>
                                {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Cargas */}
            <SectionCard
              title="Cargas"
              subtitle="Volumen de pesos · series · reps · evolución por ejercicio"
              icon={Dumbbell}
              accent={accent}
            >
              {monthLogs.length === 0 && !topExercises.length ? (
                <EmptyHint>Cuando registres pesos y series, verás aquí el volumen del mes.</EmptyHint>
              ) : (
                <div className="space-y-5">
                  {monthWeightWeeks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">Peso máximo por semana</p>
                      <BarChart
                        items={monthWeightWeeks.map((w) => ({
                          label: w.label,
                          value: w.maxWeight,
                        }))}
                        accent={accent}
                      />
                    </div>
                  )}
                  {exerciseVolume.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-depro-gray mb-3">Volumen por ejercicio (mes)</p>
                      <div className="space-y-2">
                        {exerciseVolume.map((ex) => {
                          const maxV = exerciseVolume[0]?.volume || 1;
                          const pct = Math.round((ex.volume / maxV) * 100);
                          return (
                            <div key={ex.name}>
                              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                                <span className="font-semibold text-depro-dark truncate">{ex.name}</span>
                                <span className="text-depro-gray shrink-0 tabular-nums">
                                  {ex.volume} · {ex.count}×
                                  {ex.maxWeight ? ` · ${ex.maxWeight} kg` : ""}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-depro-gray-light overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {topExercises.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">Top pesos históricos</p>
                      <ul className="space-y-1.5">
                        {topExercises.slice(0, 4).map((ex) => (
                          <li key={ex.name} className="flex items-center justify-between text-sm gap-2">
                            <span className="text-depro-dark font-medium truncate">{ex.name}</span>
                            <span className="font-black tabular-nums" style={{ color: accent }}>{ex.max} kg</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {speedLogs.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">
                        Velocidad / resistencia
                      </p>
                      <div className="space-y-2">
                        {speedLogs.map((log) => {
                          const pace = paceLabel(log);
                          return (
                            <div key={log.id} className="rounded-xl border border-depro-border px-3 py-2.5 text-xs">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-semibold text-depro-dark truncate">{log.exerciseName}</span>
                                <span className="text-depro-gray shrink-0">
                                  {new Date(log.recordedAt).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-depro-gray">
                                {log.time && (
                                  <span className="inline-flex items-center gap-1 bg-depro-gray-light rounded-md px-2 py-0.5">
                                    <Timer size={11} style={{ color: accent }} /> {log.time}
                                  </span>
                                )}
                                {log.distance && (
                                  <span className="inline-flex items-center gap-1 bg-depro-gray-light rounded-md px-2 py-0.5">
                                    <Route size={11} style={{ color: accent }} /> {log.distance}
                                  </span>
                                )}
                                {pace && (
                                  <span className="inline-flex items-center gap-1 bg-depro-gray-light rounded-md px-2 py-0.5">
                                    <Gauge size={11} style={{ color: accent }} /> {pace}
                                  </span>
                                )}
                                {log.heartRate && (
                                  <span className="inline-flex items-center gap-1 bg-depro-gray-light rounded-md px-2 py-0.5">
                                    <Heart size={11} className="text-red-500" /> {log.heartRate} ppm
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Test */}
            <SectionCard
              title="Test"
              subtitle="Histórico de tests físicos del mesociclo"
              icon={Activity}
              accent={accent}
              action={
                <Link
                  to="/dashboard/physical"
                  className="text-xs font-bold inline-flex items-center gap-1 shrink-0 hover:underline"
                  style={{ color: accent }}
                >
                  Ir a Tests <ArrowRight size={12} />
                </Link>
              }
            >
              {testData.length === 0 ? (
                <div className="text-center py-8">
                  <Target size={28} className="mx-auto mb-3 text-depro-gray" />
                  <p className="text-sm font-semibold text-depro-dark mb-1">Sin tests registrados</p>
                  <p className="text-xs text-depro-gray mb-4 max-w-sm mx-auto">
                    Completa tus tests físicos para ver la evolución junto al control de cargas del mes.
                  </p>
                  <Link
                    to="/dashboard/physical"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    Abrir Tests <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {testData.map((t) => {
                    const last = t.history[t.history.length - 1];
                    const prev = t.history.length > 1 ? t.history[t.history.length - 2] : null;
                    const lastV = parseNum(last?.value);
                    const prevV = parseNum(prev?.value);
                    const delta = lastV != null && prevV != null ? +(lastV - prevV).toFixed(2) : null;
                    return (
                      <div key={t.id} className="rounded-xl border border-depro-border p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold text-depro-dark">{t.name}</p>
                            <p className="text-[10px] text-depro-gray">{t.history.length} mediciones</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black tabular-nums" style={{ color: accent }}>
                              {last?.value ?? "—"} <span className="text-xs font-semibold text-depro-gray">{t.unit}</span>
                            </p>
                            {delta != null && (
                              <p className="text-[10px] font-bold" style={{ color: delta === 0 ? "#9CA3AF" : "#16A34A" }}>
                                {delta > 0 ? "+" : ""}{delta} vs. ant.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-10">
                          {t.history.slice(-8).map((h, i, arr) => {
                            const vals = arr.map((x) => parseNum(x.value) || 0);
                            const max = Math.max(...vals, 1);
                            const v = parseNum(h.value) || 0;
                            return (
                              <div
                                key={`${t.id}-${i}`}
                                className="flex-1 rounded-t-sm"
                                style={{
                                  height: `${Math.max(12, (v / max) * 100)}%`,
                                  backgroundColor: `${accent}${i === arr.length - 1 ? "ff" : "66"}`,
                                }}
                                title={`${h.date || ""}: ${h.value}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Evolución general */}
            <SectionCard
              title="Evolución general"
              subtitle="Adherencia, tendencia y resumen del mesociclo mensual"
              icon={BarChart2}
              accent={accent}
            >
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Adherencia (sesiones)", value: adherence.totalCompleted, tip: "marcadas este mes" },
                  { label: "Registros de carga", value: adherence.totalEntries, tip: "en el mesociclo" },
                  { label: "Semanas activas", value: adherence.weeksWithData, tip: `de ${weekStats.length}` },
                  {
                    label: "Tendencia volumen",
                    value: adherence.trend === 0 ? "—" : `${adherence.trend > 0 ? "+" : ""}${Math.round(adherence.trend)}`,
                    tip: adherence.trend > 0 ? "al alza" : adherence.trend < 0 ? "a la baja" : "estable",
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-depro-border p-3"
                    style={{ background: `linear-gradient(160deg, ${accent}0a, #fff)` }}>
                    <p className="text-[10px] font-bold uppercase text-depro-gray">{s.label}</p>
                    <p className="text-2xl font-black mt-1 tabular-nums" style={{ color: accent }}>{s.value}</p>
                    <p className="text-[10px] text-depro-gray mt-0.5">{s.tip}</p>
                  </div>
                ))}
              </div>

              {improvement ? (
                <div className="rounded-xl border px-4 py-3 mb-4"
                  style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0c` }}>
                  <p className="text-[11px] font-bold uppercase mb-1" style={{ color: accent }}>Mejora destacada</p>
                  <p className="text-sm text-depro-dark">
                    <span className="font-bold">{improvement.exerciseName}</span>
                    {" · "}
                    {improvement.from} → {improvement.to} kg
                    {" "}
                    <span className="font-black" style={{ color: accent }}>(+{improvement.diff} kg)</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-depro-gray mb-4">
                  Registra más pesos en el tiempo para detectar mejoras automáticas.
                </p>
              )}

              <div>
                <p className="text-[11px] font-bold uppercase text-depro-gray mb-2">Últimos registros del mes</p>
                {monthLogs.length === 0 ? (
                  <EmptyHint>Sin registros en este mesociclo todavía.</EmptyHint>
                ) : (
                  <ul className="divide-y divide-depro-border border border-depro-border rounded-xl overflow-hidden">
                    {monthLogs.slice(0, 8).map((log) => (
                      <li key={log.id} className="px-3 py-2.5 text-xs bg-white flex items-start gap-2">
                        <Calendar size={12} className="text-depro-gray mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-depro-dark truncate">{log.exerciseName}</span>
                            <span className="text-depro-gray shrink-0">
                              {new Date(log.recordedAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <p className="text-depro-gray mt-0.5 truncate">
                            {[
                              log.weight && `${log.weight} kg`,
                              log.sets && `${log.sets} series`,
                              log.reps && `${log.reps} reps`,
                              log.rest && `Descanso ${log.rest}`,
                              log.time && `Tiempo ${log.time}`,
                              log.distance && `Dist. ${log.distance}`,
                              log.heartRate && `FC ${log.heartRate}`,
                              log.rpe && `RPE ${log.rpe}`,
                            ].filter(Boolean).join(" · ") || log.sessionTitle || "—"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
