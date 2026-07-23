import { useState, useEffect } from "react";
import { Lock, Save, Trash2, TrendingUp, TrendingDown, Minus, ChevronRight, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import FeatureGate from "../../components/private/FeatureGate";

// ── 4 tests oficiales ─────────────────────────────────────────
const TESTS = [
  {
    id: "resistencia",
    name: "Resistencia aeróbica",
    subtitle: "Rectas completadas en 5–6 min",
    unit: "rectas",
    color: "#3B82F6",
    higher_is_better: true,
    placeholder: "Ej: 14",
    tip: "Mantén un ritmo constante. Cada vuelta cuenta.",
    ranges: [
      { label: "Bajo",      max: 8,        color: "#EF4444" },
      { label: "Medio",     max: 15,       color: "#F59E0B" },
      { label: "Bueno",     max: 22,       color: "#3B82F6" },
      { label: "Excelente", max: Infinity, color: "#22C55E" },
    ],
  },
  {
    id: "sprint",
    name: "Sprint lineal",
    subtitle: "Tiempo en 10–20 m desde parado",
    unit: "seg",
    color: "#EF4444",
    higher_is_better: false,
    placeholder: "Ej: 2.85",
    tip: "Salida desde posición estática. Cronometrar al primer movimiento.",
    ranges: [
      { label: "Excelente", max: 2.6,      color: "#22C55E" },
      { label: "Bueno",     max: 3.0,      color: "#3B82F6" },
      { label: "Medio",     max: 3.5,      color: "#F59E0B" },
      { label: "Bajo",      max: Infinity, color: "#EF4444" },
    ],
  },
  {
    id: "cod",
    name: "Cambio de dirección",
    subtitle: "Test 5–10–5 (COD)",
    unit: "seg",
    color: "#8B5CF6",
    higher_is_better: false,
    placeholder: "Ej: 4.72",
    tip: "5 m derecha, 10 m izquierda, 5 m al inicio.",
    ranges: [
      { label: "Excelente", max: 4.4,      color: "#22C55E" },
      { label: "Bueno",     max: 5.0,      color: "#3B82F6" },
      { label: "Medio",     max: 5.6,      color: "#F59E0B" },
      { label: "Bajo",      max: Infinity, color: "#EF4444" },
    ],
  },
  {
    id: "cmj",
    name: "Salto vertical CMJ",
    subtitle: "Countermovement Jump",
    unit: "cm",
    color: "#22C55E",
    higher_is_better: true,
    placeholder: "Ej: 38",
    tip: "Flexiona rodillas y salta con máxima explosividad.",
    ranges: [
      { label: "Bajo",      max: 25,       color: "#EF4444" },
      { label: "Medio",     max: 35,       color: "#F59E0B" },
      { label: "Bueno",     max: 45,       color: "#3B82F6" },
      { label: "Excelente", max: Infinity, color: "#22C55E" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────
function storageKey(uid, tid) { return `depro_test_${uid}_${tid}`; }
function loadHistory(uid, tid) {
  try { return JSON.parse(localStorage.getItem(storageKey(uid, tid)) || "[]"); }
  catch { return []; }
}
function saveHistory(uid, tid, entries) {
  localStorage.setItem(storageKey(uid, tid), JSON.stringify(entries));
}
function getRange(test, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  for (const r of test.ranges) if (v <= r.max) return r;
  return null;
}
function iaText(test, history) {
  if (history.length < 2) return null;
  const last = parseFloat(history[history.length - 1].value);
  const prev = parseFloat(history[history.length - 2].value);
  const diff = last - prev;
  const abs  = Math.abs(diff).toFixed(2);
  const improved = test.higher_is_better ? diff > 0 : diff < 0;
  if (Math.abs(diff) < 0.001) return `Tu ${test.name} se mantiene estable.`;
  if (improved) return `Mejoraste ${abs} ${test.unit} respecto a la medición anterior.`;
  return `Bajaste ${abs} ${test.unit} respecto a la medición anterior.`;
}

// ── Mini gráfica SVG ──────────────────────────────────────────
function LineChart({ history, color }) {
  const vals = history.map((h) => parseFloat(h.value)).filter((v) => !isNaN(v));
  if (vals.length < 2) return (
    <div className="flex items-center justify-center h-32 text-depro-gray text-sm">
      Registra al menos 2 mediciones para ver la evolución
    </div>
  );
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 500, H = 120, PX = 24, PY = 16;
  const pts = vals.map((v, i) => ({
    x: PX + (i / (vals.length - 1)) * (W - PX * 2),
    y: H - PY - ((v - min) / range) * (H - PY * 2),
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${H} ` + pts.map((p) => `${p.x},${p.y}`).join(" ") + ` ${pts[pts.length-1].x},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 128 }}>
      <defs>
        <linearGradient id={`g_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PX} x2={W - PX} y1={PY + f * (H - PY * 2)} y2={PY + f * (H - PY * 2)}
          stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* Area */}
      <polygon points={area} fill={`url(#g_${color.replace("#","")})`} />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11" fill={color} fontWeight="600">
            {vals[i]}
          </text>
        </g>
      ))}
      {/* Dates */}
      {history.slice(-vals.length).map((h, i) => (
        <text key={i} x={pts[i].x} y={H - 2} textAnchor="middle" fontSize="10" fill="#9CA3AF">
          {h.date?.split(" ").slice(0, 2).join(" ")}
        </text>
      ))}
    </svg>
  );
}

// ── Panel de detalle (derecha) ────────────────────────────────
function DetailPanel({ test, userId }) {
  const [history, setHistory] = useState(() => loadHistory(userId, test.id));
  const [input,   setInput]   = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setHistory(loadHistory(userId, test.id));
    setInput("");
    setShowAll(false);
  }, [test.id, userId]);

  const last   = history[history.length - 1];
  const range  = getRange(test, last?.value);
  const ia     = iaText(test, history);
  const trend  = history.length >= 2
    ? (parseFloat(history[history.length-1].value) - parseFloat(history[history.length-2].value))
    : null;
  const TrendIcon = trend === null ? null : (
    test.higher_is_better
      ? (trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus)
      : (trend < 0 ? TrendingUp : trend > 0 ? TrendingDown : Minus)
  );
  const trendGood = trend === null ? false : (test.higher_is_better ? trend > 0 : trend < 0);

  const handleAdd = () => {
    const v = parseFloat(input);
    if (isNaN(v)) return;
    const entry = { value: v.toString(), date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) };
    const updated = [...history, entry];
    setHistory(updated);
    saveHistory(userId, test.id, updated);
    setInput("");
  };

  const handleDelete = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    saveHistory(userId, test.id, updated);
  };

  const displayHistory = showAll ? history : history.slice(-5);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header con valor actual */}
      <div className="bg-white rounded-2xl border border-depro-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-depro-dark">{test.name}</h2>
            <p className="text-sm text-depro-gray mt-0.5">{test.subtitle}</p>
          </div>
          {range && (
            <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: range.color + "18", color: range.color }}>
              {range.label}
            </span>
          )}
        </div>

        {last ? (
          <div className="flex items-end gap-4">
            <div>
              <span className="text-5xl font-black" style={{ color: range?.color || test.color }}>{last.value}</span>
              <span className="text-lg text-depro-gray ml-1.5">{test.unit}</span>
            </div>
            {TrendIcon && (
              <div className={`flex items-center gap-1 mb-2 text-sm font-bold ${trendGood ? "text-green-500" : "text-red-500"}`}>
                <TrendIcon size={16} />
                {Math.abs(trend).toFixed(2)} {test.unit}
              </div>
            )}
            <div className="text-xs text-depro-gray mb-2 ml-auto">{last.date}</div>
          </div>
        ) : (
          <div className="text-depro-gray text-sm py-2">Aún sin mediciones. Añade tu primera.</div>
        )}
      </div>

      {/* Gráfica */}
      <div className="bg-white rounded-2xl border border-depro-border p-6">
        <h3 className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-4">Evolución</h3>
        <LineChart history={history} color={range?.color || test.color} />
      </div>

      {/* Feedback IA */}
      {ia && (
        <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ backgroundColor: (trendGood ? "#22C55E" : "#EF4444") + "08", borderColor: (trendGood ? "#22C55E" : "#EF4444") + "25" }}>
          <span className="text-xl flex-shrink-0">{trendGood ? "✅" : "⚠️"}</span>
          <p className="text-sm text-depro-dark">{ia}</p>
        </div>
      )}

      {/* Añadir medición */}
      <div className="bg-white rounded-2xl border border-depro-border p-5">
        <h3 className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3">Nueva medición</h3>
        <div className="flex gap-2">
          <input
            type="number" step="0.01" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={test.placeholder}
            className="admin-input flex-1 font-mono text-center text-lg"
          />
          <button
            onClick={handleAdd} disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: test.color }}
          >
            <Save size={15} /> Guardar
          </button>
        </div>
        <p className="text-[11px] text-depro-gray mt-2">{test.tip}</p>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-depro-border overflow-hidden">
          <div className="px-5 py-3 border-b border-depro-border flex items-center justify-between">
            <h3 className="text-xs font-bold text-depro-gray uppercase tracking-wide">Histórico</h3>
            <span className="text-xs text-depro-gray">{history.length} mediciones</span>
          </div>
          <div className="divide-y divide-depro-border">
            {[...displayHistory].reverse().map((entry, ri) => {
              const idx = history.length - 1 - ri;
              const r2  = getRange(test, entry.value);
              return (
                <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-depro-gray-light/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r2?.color || "#9CA3AF" }} />
                    <span className="text-sm text-depro-gray">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm" style={{ color: r2?.color || "#374151" }}>
                      {entry.value} <span className="font-normal text-depro-gray">{test.unit}</span>
                    </span>
                    {r2 && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: r2.color + "15", color: r2.color }}>{r2.label}</span>}
                    <button onClick={() => handleDelete(displayHistory.length - 1 - ri)} className="p-1 text-depro-gray hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {history.length > 5 && (
            <button onClick={() => setShowAll(!showAll)} className="w-full py-2.5 text-xs font-bold text-depro-gray hover:text-depro-dark transition-colors border-t border-depro-border">
              {showAll ? "Mostrar menos" : `Ver todas (${history.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function PhysicalPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(TESTS[0].id);
  const activeTest = TESTS.find((t) => t.id === selected);

  // Carga rápida de último valor para la card
  function lastValue(testId) {
    const h = loadHistory(user?.id, testId);
    return h[h.length - 1]?.value ?? null;
  }

  return (
    <FeatureGate user={user} feature="physical_tests">
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-depro-blue uppercase tracking-wide mb-2">
          <Activity size={13} /> {t("physical.title")}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark">{t("physical.title")}</h1>
        <p className="text-depro-gray text-sm mt-1">{t("physical.select_test")}</p>
      </div>

      {/* Layout 2 columnas */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Columna izquierda — Cards seleccionables */}
        <div className="lg:w-72 flex-shrink-0 space-y-3">
          {TESTS.map((test) => {
            const lv = lastValue(test.id);
            const r  = getRange(test, lv);
            const isActive = selected === test.id;

            return (
              <button
                key={test.id}
                onClick={() => setSelected(test.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                  isActive
                    ? "shadow-md -translate-y-0.5"
                    : "bg-white border-depro-border hover:border-gray-300 hover:shadow-sm"
                }`}
                style={isActive ? { borderColor: test.color, backgroundColor: test.color + "05" } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Indicador de color en lugar de emoji */}
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: test.color }} />
                    <span className={`text-sm font-bold ${isActive ? "text-depro-dark" : "text-depro-dark"}`}>{test.name}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-transform ${isActive ? "rotate-90 text-depro-blue" : "text-depro-gray"}`} />
                </div>
                <p className="text-xs text-depro-gray ml-5.5 leading-snug">{test.subtitle}</p>
                {lv !== null ? (
                  <div className="flex items-center gap-2 mt-2 ml-5.5">
                    <span className="text-base font-black" style={{ color: r?.color || test.color }}>{lv}</span>
                    <span className="text-xs text-depro-gray">{test.unit}</span>
                    {r && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto" style={{ backgroundColor: r.color + "18", color: r.color }}>{r.label}</span>}
                  </div>
                ) : (
                  <div className="text-[11px] text-depro-gray mt-2 ml-5.5 italic">Sin mediciones</div>
                )}
              </button>
            );
          })}

          <p className="text-[11px] text-depro-gray px-1 text-center pt-1">
            Realiza los tests cada 3–4 semanas.
          </p>
        </div>

        {/* Columna derecha — Detalle del test seleccionado */}
        <div className="flex-1 min-w-0">
          <DetailPanel key={selected} test={activeTest} userId={user?.id} />
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
