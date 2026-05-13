import { useState, useEffect } from "react";
import { Activity, Lock, TrendingUp, TrendingDown, Minus, Plus, Save, Trash2, ChevronDown, ChevronUp, Play } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ── Definición de los 4 tests (doc técnico) ─────────────────
const TESTS = [
  {
    id: "resistencia",
    name: "Resistencia aeróbica",
    description: "Rectas completadas en 5–6 minutos (yo-yo o similar).",
    unit: "rectas",
    icon: "🫀",
    higher_is_better: true,
    placeholder: "Ej: 12",
    video_url: null,
    tip: "Mantén un ritmo constante. Cada vuelta cuenta.",
    ranges: [
      { label: "Bajo", max: 8, color: "#ef4444" },
      { label: "Medio", max: 15, color: "#f59e0b" },
      { label: "Bueno", max: 22, color: "#3b82f6" },
      { label: "Excelente", max: Infinity, color: "#22c55e" },
    ],
  },
  {
    id: "sprint",
    name: "Sprint lineal",
    description: "Tiempo en recorrer 10–20 metros desde parado.",
    unit: "seg",
    icon: "⚡",
    higher_is_better: false,
    placeholder: "Ej: 2.85",
    video_url: null,
    tip: "Salida desde posición estática. Cronometrar al primer movimiento.",
    ranges: [
      { label: "Excelente", max: 2.6, color: "#22c55e" },
      { label: "Bueno", max: 3.0, color: "#3b82f6" },
      { label: "Medio", max: 3.5, color: "#f59e0b" },
      { label: "Bajo", max: Infinity, color: "#ef4444" },
    ],
  },
  {
    id: "cod",
    name: "Cambio de dirección (5–10–5)",
    description: "Tiempo total del test 5-10-5 (COD).",
    unit: "seg",
    icon: "🔄",
    higher_is_better: false,
    placeholder: "Ej: 4.72",
    video_url: null,
    tip: "5 metros derecha, 10 metros izquierda, 5 metros al inicio. Mide el total.",
    ranges: [
      { label: "Excelente", max: 4.4, color: "#22c55e" },
      { label: "Bueno", max: 5.0, color: "#3b82f6" },
      { label: "Medio", max: 5.6, color: "#f59e0b" },
      { label: "Bajo", max: Infinity, color: "#ef4444" },
    ],
  },
  {
    id: "cmj",
    name: "Salto vertical CMJ",
    description: "Altura máxima en el Countermovement Jump (CMJ).",
    unit: "cm",
    icon: "🦘",
    higher_is_better: true,
    placeholder: "Ej: 38",
    video_url: null,
    tip: "Flexiona las rodillas y salta con máxima explosividad. Mide desde la posición inicial hasta el punto más alto.",
    ranges: [
      { label: "Bajo", max: 25, color: "#ef4444" },
      { label: "Medio", max: 35, color: "#f59e0b" },
      { label: "Bueno", max: 45, color: "#3b82f6" },
      { label: "Excelente", max: Infinity, color: "#22c55e" },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────
function storageKey(userId, testId) { return `depro_test_${userId}_${testId}`; }

function loadHistory(userId, testId) {
  try { return JSON.parse(localStorage.getItem(storageKey(userId, testId)) || "[]"); }
  catch { return []; }
}

function saveHistory(userId, testId, entries) {
  localStorage.setItem(storageKey(userId, testId), JSON.stringify(entries));
}

function getLevelColor(test, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return "#9ca3af";
  for (const r of test.ranges) {
    if (v <= r.max) return r.color;
  }
  return "#9ca3af";
}

function getLevelLabel(test, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return "—";
  for (const r of test.ranges) {
    if (v <= r.max) return r.label;
  }
  return "—";
}

function generateIaText(test, history) {
  if (history.length < 2) return null;
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const diff = parseFloat(last.value) - parseFloat(prev.value);
  const abs  = Math.abs(diff).toFixed(2);
  const improved = test.higher_is_better ? diff > 0 : diff < 0;

  if (diff === 0) return `Tu ${test.name} se mantiene estable respecto a la medición anterior.`;
  if (improved) return `✅ Mejoraste tu ${test.name} en ${abs} ${test.unit} respecto a la medición anterior. ¡Buen trabajo!`;
  return `⚠️ Tu ${test.name} bajó ${abs} ${test.unit} respecto a la medición anterior. Revisa tu carga de trabajo.`;
}

// ── Mini gráfica SVG ─────────────────────────────────────────
function MiniChart({ history, color }) {
  if (history.length < 2) return null;
  const vals = history.map((h) => parseFloat(h.value)).filter((v) => !isNaN(v));
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 280, H = 60, PAD = 8;
  const pts = vals.map((v, i) => {
    const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",");
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

// ── Card de un test ─────────────────────────────────────────
function TestCard({ test, userId }) {
  const [history, setHistory] = useState(() => loadHistory(userId, test.id));
  const [input, setInput]     = useState("");
  const [open, setOpen]       = useState(false);

  const last     = history[history.length - 1];
  const levelColor = getLevelColor(test, last?.value);
  const iaText   = generateIaText(test, history);

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

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-depro-gray-light flex items-center justify-center text-2xl flex-shrink-0">
          {test.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-depro-dark">{test.name}</h3>
            {last && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: levelColor + "20", color: levelColor }}>
                {getLevelLabel(test, last.value)}
              </span>
            )}
          </div>
          <p className="text-xs text-depro-gray mt-0.5">{test.description}</p>
          {last && (
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black" style={{ color: levelColor }}>{last.value}</span>
              <span className="text-sm text-depro-gray">{test.unit}</span>
              <span className="text-xs text-depro-gray ml-2">— {last.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* IA feedback */}
      {iaText && (
        <div className="mx-5 mb-4 px-4 py-3 bg-depro-blue/5 border border-depro-blue/20 rounded-xl text-xs text-depro-dark">
          {iaText}
        </div>
      )}

      {/* Gráfica */}
      {history.length >= 2 && (
        <div className="px-5 pb-4">
          <p className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2">Evolución</p>
          <MiniChart history={history} color={levelColor} />
        </div>
      )}

      {/* Registro nuevo */}
      <div className="px-5 pb-4 flex gap-2">
        <input
          type="number"
          step="0.01"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={test.placeholder}
          className="admin-input flex-1 text-center font-mono"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 transition-colors hover:bg-depro-blue-dark"
        >
          <Save size={14} /> Guardar
        </button>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div className="border-t border-depro-border">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-depro-gray hover:text-depro-dark transition-colors"
          >
            <span>Histórico ({history.length} mediciones)</span>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="px-5 pb-4 space-y-1">
              {[...history].reverse().map((entry, ri) => {
                const idx = history.length - 1 - ri;
                const c = getLevelColor(test, entry.value);
                return (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-depro-border last:border-0">
                    <span className="text-xs text-depro-gray">{entry.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: c }}>
                        {entry.value} {test.unit}
                      </span>
                      <button onClick={() => handleDelete(idx)} className="p-1 rounded text-depro-gray hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-depro-gray italic">{test.tip}</p>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
export default function PhysicalPage() {
  const { user } = useAuth();
  const isPremium = user?.plan === "Premium" || user?.plan === "premium";

  if (!isPremium) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-depro-gray uppercase tracking-wide mb-6">
          <Activity size={13} className="text-depro-blue" /> Tests físicos
        </div>
        <div className="bg-white border-2 border-dashed border-depro-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-depro-yellow/15 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-depro-yellow" />
          </div>
          <h2 className="text-xl font-bold text-depro-dark mb-2">Disponible en Plan Premium</h2>
          <p className="text-sm text-depro-gray max-w-sm mx-auto mb-6">
            Los tests físicos con análisis evolutivo y feedback personalizado están incluidos en el plan Premium.
          </p>
          <a
            href="/comprar?plan=premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-depro-yellow text-depro-dark font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Actualizar a Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-depro-blue uppercase tracking-wide mb-2">
          <Activity size={13} /> Tests físicos
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Evaluación física</h1>
        <p className="text-depro-gray text-sm mt-1">
          Registra tus mediciones periódicas. El sistema analiza tu evolución automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TESTS.map((test) => (
          <TestCard key={test.id} test={test} userId={user?.id} />
        ))}
      </div>

      <p className="text-xs text-depro-gray text-center pb-4">
        Realiza los tests cada 3–4 semanas para ver tu evolución real.
      </p>
    </div>
  );
}
