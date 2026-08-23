import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gauge, Calendar, Dumbbell, TrendingUp, Activity, Target,
  Timer, Heart, BarChart2, CheckCircle2, ArrowRight, Zap,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import { getLoadLogs } from "../../lib/loadLogs";
import {
  getPracticalImprovements,
  getImprovementSummary,
  getLogsByDomain,
} from "../../lib/loadAnalytics";
import { loadProgressIds, weekKey } from "../../lib/sessionProgress";

const TEST_IDS = [
  { id: "resistencia", name: "Resistencia aeróbica", unit: "rectas" },
  { id: "sprint", name: "Sprint lineal", unit: "seg" },
  { id: "cod", name: "Cambio de dirección", unit: "seg" },
  { id: "cmj", name: "Salto vertical CMJ", unit: "cm" },
];

const PROGRESSION_TABS = [
  { id: "fuerza", label: "Fuerza", Icon: Dumbbell },
  { id: "velocidad", label: "Velocidad", Icon: Zap },
  { id: "resistencia", label: "Resistencia", Icon: Heart },
];

function accentOf(user) {
  const raw = user?.club?.primaryColor || user?.primaryColor || "#0A36F7";
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : "#0A36F7";
}

function parseNum(v) {
  const n = parseFloat(String(v ?? "").replace(",", ".").split("/")[0]);
  return Number.isFinite(n) ? n : null;
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

function formatSec(sec) {
  if (sec == null) return "—";
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = +(sec % 60).toFixed(sec % 60 >= 10 ? 1 : 2);
    return `${m}:${String(s).padStart(4, "0")}`;
  }
  return `${Number(sec).toFixed(2)} s`;
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

function PctBadge({ pct, suffix = "", invert = false }) {
  if (pct == null) return null;
  const good = invert ? pct < -0.5 : pct > 0.5;
  const bad = invert ? pct > 0.5 : pct < -0.5;
  const color = good ? "#16A34A" : bad ? "#DC2626" : "#6B7280";
  const sign = pct > 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-black tabular-nums"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {sign}{pct}%{suffix}
    </span>
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
  return <p className="text-sm text-depro-gray text-center py-6">{children}</p>;
}

function FuerzaImproveCard({ row }) {
  const color = toneColor(row.tone);
  return (
    <div className="rounded-2xl border border-depro-border p-4 hover:border-depro-blue/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-depro-dark truncate">{row.exerciseName}</p>
          <p className="text-[11px] text-depro-gray mt-0.5">{row.sessions} sesiones registradas</p>
        </div>
        <PctBadge pct={row.primary?.pct} />
      </div>
      <p className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color }}>
        <ToneIcon tone={row.tone} /> {row.message}
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {row.prev?.maxWeight != null && row.curr?.maxWeight != null && (
          <div className="rounded-xl bg-depro-gray-light/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-depro-gray">Peso</p>
            <p className="font-black text-depro-dark tabular-nums mt-0.5">
              {row.prev.maxWeight} → {row.curr.maxWeight} <span className="text-depro-gray font-semibold">kg</span>
            </p>
            {row.weightPct != null && (
              <p className="text-[10px] font-bold mt-1" style={{ color: toneColor(row.weightPct > 0.5 ? "positive" : row.weightPct < -0.5 ? "negative" : "neutral") }}>
                {row.weightPct > 0 ? "+" : ""}{row.weightPct}%
              </p>
            )}
          </div>
        )}
        {(row.prev?.repsAtMax != null || row.prev?.totalReps != null) && (
          <div className="rounded-xl bg-depro-gray-light/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-depro-gray">Reps</p>
            <p className="font-black text-depro-dark tabular-nums mt-0.5">
              {row.prev.repsAtMax ?? row.prev.totalReps} → {row.curr.repsAtMax ?? row.curr.totalReps}
            </p>
            {row.repsPct != null && (
              <p className="text-[10px] font-bold mt-1" style={{ color: toneColor(row.repsPct > 0.5 ? "positive" : row.repsPct < -0.5 ? "negative" : "neutral") }}>
                {row.repsPct > 0 ? "+" : ""}{row.repsPct}%
              </p>
            )}
          </div>
        )}
      </div>
      {row.vsFirstWeight != null && Math.abs(row.vsFirstWeight - (row.weightPct || 0)) > 1 && (
        <p className="text-[11px] text-depro-gray mt-3">
          Desde el primer registro:{" "}
          <strong className="text-depro-dark">
            {row.vsFirstWeight > 0 ? "+" : ""}{row.vsFirstWeight}% peso
          </strong>
          {row.vsFirstReps != null && (
            <> · {row.vsFirstReps > 0 ? "+" : ""}{row.vsFirstReps}% reps</>
          )}
        </p>
      )}
    </div>
  );
}

function TimeHrImproveCard({ row }) {
  const color = toneColor(row.tone);
  return (
    <div className="rounded-2xl border border-depro-border p-4 hover:border-depro-blue/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-depro-dark truncate">{row.exerciseName}</p>
          <p className="text-[11px] text-depro-gray mt-0.5">{row.sessions} sesiones · vs anterior</p>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {row.timePctBetter != null && <PctBadge pct={row.timePctBetter} suffix=" tiempo" />}
          {row.hrPctBetter != null && <PctBadge pct={row.hrPctBetter} suffix=" FC" />}
        </div>
      </div>
      <p className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color }}>
        <ToneIcon tone={row.tone} /> {row.message}
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {row.fromTime != null && row.toTime != null && (
          <div className="rounded-xl bg-depro-gray-light/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-depro-gray inline-flex items-center gap-1">
              <Timer size={10} /> Tiempo
            </p>
            <p className="font-black text-depro-dark tabular-nums mt-0.5">
              {formatSec(row.fromTime)} → {formatSec(row.toTime)}
            </p>
          </div>
        )}
        {row.fromHr != null && row.toHr != null && (
          <div className="rounded-xl bg-depro-gray-light/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-depro-gray inline-flex items-center gap-1">
              <Heart size={10} className="text-red-500" /> FC media
            </p>
            <p className="font-black text-depro-dark tabular-nums mt-0.5">
              {row.fromHr} → {row.toHr} <span className="text-depro-gray font-semibold">ppm</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayerLoadHistoryPage() {
  const { user } = useAuth();
  const accent = accentOf(user);
  const [tab, setTab] = useState("fuerza");
  const now = useMemo(() => new Date(), []);
  const monthLabel = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const logs = useMemo(() => getLoadLogs(user?.id), [user?.id]);
  const domainBuckets = useMemo(() => getLogsByDomain(user?.id), [user?.id]);
  const improvements = useMemo(() => getPracticalImprovements(user?.id), [user?.id]);
  const highlight = useMemo(() => getImprovementSummary(user?.id), [user?.id]);
  const testData = useMemo(() => loadTestHistory(user?.id), [user?.id]);
  const currentWeekKey = weekKey(now);

  const tabRows = improvements[tab] || [];
  const positiveCount = useMemo(() => {
    const all = [...improvements.fuerza, ...improvements.velocidad, ...improvements.resistencia];
    return all.filter((r) => r.tone === "positive").length;
  }, [improvements]);

  const weekCompleted = user?.id ? loadProgressIds(user.id, currentWeekKey).length : 0;
  const needsMoreData = tabRows.length === 0;
  const domainCount = (domainBuckets[tab] || []).length;

  return (
    <FeatureGate user={user} feature="cargas">
      <div className="dash-page space-y-6">
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
              Mis cargas · Progresión real
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              ¿Estás mejorando?
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-xl">
              Compara peso, reps, tiempos y FC media entre sesiones — no solo el volumen acumulado.
              Mesociclo de <span className="font-semibold capitalize text-white">{monthLabel}</span>.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <TrendingUp size={13} /> {positiveCount} mejoras detectadas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Calendar size={13} /> {logs.length} registros
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <CheckCircle2 size={13} /> {weekCompleted} sesiones esta semana
              </span>
            </div>
          </div>
        </header>

        {highlight && (
          <div
            className="rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ borderColor: `${accent}35`, background: `linear-gradient(120deg, ${accent}12, #fff)` }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}20`, color: accent }}>
              <TrendingUp size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                Mejora destacada
              </p>
              <p className="text-sm sm:text-base text-depro-dark font-bold truncate">
                {highlight.exerciseName}
              </p>
              <p className="text-xs text-depro-gray mt-0.5">
                {highlight.message
                  || `${highlight.from} → ${highlight.to} ${highlight.unit || "kg"}`}
                {highlight.pct != null && (
                  <span className="font-black ml-1" style={{ color: accent }}>
                    ({highlight.pct > 0 ? "+" : ""}{highlight.pct}%)
                  </span>
                )}
              </p>
            </div>
            {highlight.pct != null && <PctBadge pct={highlight.pct} />}
          </div>
        )}

        <section className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-depro-border">
            <h2 className="text-base font-black text-depro-dark flex items-center gap-2">
              <Gauge size={18} style={{ color: accent }} /> Comparativa por ejercicio
            </h2>
            <p className="text-xs text-depro-gray mt-0.5">
              Fuerza: % peso y reps · Velocidad/resistencia: tiempo y FC media entre la última y la anterior sesión
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {PROGRESSION_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    tab === id
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  <Icon size={12} /> {label}
                  <span className="opacity-70">({(improvements[id] || []).length})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {needsMoreData ? (
              <div className="text-center py-8 px-4">
                <div className="w-14 h-14 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
                  {tab === "fuerza" ? <Dumbbell size={24} className="text-depro-gray" />
                    : tab === "velocidad" ? <Zap size={24} className="text-depro-gray" />
                      : <Heart size={24} className="text-depro-gray" />}
                </div>
                <p className="font-bold text-depro-dark mb-1">
                  {domainCount === 0
                    ? `Sin registros de ${tab} todavía`
                    : `Necesitas al menos 2 sesiones del mismo ejercicio`}
                </p>
                <p className="text-sm text-depro-gray max-w-md mx-auto mb-5">
                  {tab === "fuerza"
                    ? "Registra peso y reps en tu plan. Aquí verás el % de subida (o bajada) respecto a la sesión anterior."
                    : "Registra tiempo y FC media. Te diremos si bajaste tiempo, si la FC mejoró aunque el tiempo no, o ambos."}
                </p>
                <Link
                  to="/dashboard/plan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  Ir al plan <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tab === "fuerza"
                  ? tabRows.map((row) => <FuerzaImproveCard key={row.exerciseName} row={row} />)
                  : tabRows.map((row) => <TimeHrImproveCard key={row.exerciseName} row={row} />)}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <SectionCard
            title="Test físicos"
            subtitle="Evolución de tus tests junto a las cargas"
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
              <div className="text-center py-6">
                <Target size={28} className="mx-auto mb-3 text-depro-gray" />
                <p className="text-sm font-semibold text-depro-dark mb-1">Sin tests registrados</p>
                <p className="text-xs text-depro-gray mb-4 max-w-sm mx-auto">
                  Los tests aportan otra lectura de progresión (sprint, COD, CMJ, resistencia).
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
              <div className="space-y-3">
                {testData.map((t) => {
                  const last = t.history[t.history.length - 1];
                  const prev = t.history.length > 1 ? t.history[t.history.length - 2] : null;
                  const lastV = parseNum(last?.value);
                  const prevV = parseNum(prev?.value);
                  const delta = lastV != null && prevV != null && prevV !== 0
                    ? +(((lastV - prevV) / Math.abs(prevV)) * 100).toFixed(1)
                    : null;
                  return (
                    <div key={t.id} className="rounded-xl border border-depro-border p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-depro-dark">{t.name}</p>
                        <p className="text-[10px] text-depro-gray">{t.history.length} mediciones</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black tabular-nums" style={{ color: accent }}>
                          {last?.value ?? "—"}{" "}
                          <span className="text-xs font-semibold text-depro-gray">{t.unit}</span>
                        </p>
                        {delta != null && <PctBadge pct={delta} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Actividad reciente"
            subtitle="Últimos registros para contexto — la mejora está arriba"
            icon={BarChart2}
            accent={accent}
          >
            {logs.length === 0 ? (
              <EmptyHint>Guarda cargas desde tus sesiones para empezar a medir progreso.</EmptyHint>
            ) : (
              <ul className="divide-y divide-depro-border border border-depro-border rounded-xl overflow-hidden">
                {logs.slice(0, 8).map((log) => (
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
                          log.tipoRegistro && String(log.tipoRegistro),
                          log.weight && `${log.weight} kg`,
                          log.reps && `${log.reps} reps`,
                          log.time && `Tiempo ${log.time}`,
                          log.heartRate && `FC ${log.heartRate}`,
                          log.rpe && `RPE ${log.rpe}`,
                        ].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </FeatureGate>
  );
}
