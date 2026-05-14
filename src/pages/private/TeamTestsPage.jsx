import { useState, useEffect } from "react";
import {
  Activity, Users, ChevronRight, ChevronLeft, Save,
  TrendingUp, TrendingDown, Minus, BarChart2, User, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ── Mismos 4 tests que en PhysicalPage ─────────────────────────
const TESTS = [
  {
    id: "resistencia",
    name: "Resistencia aeróbica",
    subtitle: "Rectas completadas en 5–6 min",
    unit: "rectas",
    color: "#3B82F6",
    higher_is_better: true,
    placeholder: "Ej: 14",
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
    ranges: [
      { label: "Bajo",      max: 25,       color: "#EF4444" },
      { label: "Medio",     max: 35,       color: "#F59E0B" },
      { label: "Bueno",     max: 45,       color: "#3B82F6" },
      { label: "Excelente", max: Infinity, color: "#22C55E" },
    ],
  },
];

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function testKey(playerId, testId) { return `depro_test_${playerId}_${testId}`; }
function loadHistory(playerId, testId) {
  try { return JSON.parse(localStorage.getItem(testKey(playerId, testId)) || "[]"); }
  catch { return []; }
}
function saveHistory(playerId, testId, entries) {
  localStorage.setItem(testKey(playerId, testId), JSON.stringify(entries));
}

function getRange(test, val) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return test.ranges.find((r) => n < r.max) || test.ranges[test.ranges.length - 1];
}
function getTrend(test, history) {
  if (history.length < 2) return null;
  const last = parseFloat(history[history.length - 1].value);
  const prev = parseFloat(history[history.length - 2].value);
  if (isNaN(last) || isNaN(prev)) return null;
  const diff = last - prev;
  if (diff === 0) return { icon: Minus, color: "#6B7280", text: "Sin cambio" };
  const improved = test.higher_is_better ? diff > 0 : diff < 0;
  return improved
    ? { icon: TrendingUp,   color: "#22C55E", text: `${Math.abs(diff).toFixed(2)} ${test.unit} mejor` }
    : { icon: TrendingDown, color: "#EF4444", text: `${Math.abs(diff).toFixed(2)} ${test.unit} peor` };
}

/* ── Mini sparkline ─── */
function Sparkline({ history, test, accent }) {
  if (history.length < 2) return null;
  const vals = history.map((e) => parseFloat(e.value)).filter((v) => !isNaN(v));
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 120, h = 36;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * (w - 8) + 4;
    const y = h - 4 - ((v - min) / range) * (h - 8);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" points={pts.join(" ")} />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",");
        return <circle key={i} cx={x} cy={y} r="3" fill={accent} />;
      })}
    </svg>
  );
}

/* ── Panel de tests de un jugador ─── */
function PlayerTestPanel({ player, accent, onBack }) {
  const [inputs, setInputs] = useState({});
  const [saved, setSaved] = useState({});
  const [histories, setHistories] = useState({});
  const [selectedTest, setSelectedTest] = useState(TESTS[0].id);

  useEffect(() => {
    const h = {};
    TESTS.forEach((t) => { h[t.id] = loadHistory(player.id, t.id); });
    setHistories(h);
  }, [player.id]);

  const handleSave = (testId) => {
    const raw = inputs[testId];
    if (!raw || isNaN(parseFloat(raw))) return;
    const newEntry = { date: new Date().toLocaleDateString("es-ES"), value: raw };
    const updated = [...(histories[testId] || []), newEntry];
    saveHistory(player.id, testId, updated);
    setHistories((prev) => ({ ...prev, [testId]: updated }));
    setInputs((prev) => ({ ...prev, [testId]: "" }));
    setSaved((prev) => ({ ...prev, [testId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [testId]: false })), 2000);
  };

  const handleDelete = (testId, idx) => {
    const updated = (histories[testId] || []).filter((_, i) => i !== idx);
    saveHistory(player.id, testId, updated);
    setHistories((prev) => ({ ...prev, [testId]: updated }));
  };

  const test = TESTS.find((t) => t.id === selectedTest);
  const history = histories[selectedTest] || [];
  const trend = getTrend(test, history);
  const lastEntry = history[history.length - 1];
  const lastRange = lastEntry ? getRange(test, lastEntry.value) : null;

  return (
    <div>
      {/* Header jugador */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-dark transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
          style={{ backgroundColor: accent + "20", color: accent }}
        >
          {(player.name || "?")[0].toUpperCase()}
        </div>
        <div>
          <h2 className="font-black text-depro-dark text-lg leading-none">{player.name}</h2>
          <p className="text-xs text-depro-gray mt-0.5">Tests físicos individuales</p>
        </div>
      </div>

      {/* Selector de test */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TESTS.map((t) => {
          const h = histories[t.id] || [];
          const last = h[h.length - 1];
          const r = last ? getRange(t, last.value) : null;
          const isSelected = selectedTest === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTest(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected ? "shadow-md" : "border-depro-border bg-white hover:border-depro-blue/30"
              }`}
              style={isSelected ? { borderColor: t.color, backgroundColor: t.color + "08" } : {}}
            >
              <div className="w-8 h-8 rounded-xl mb-2 flex items-center justify-center" style={{ backgroundColor: t.color + "15" }}>
                <Activity size={16} style={{ color: t.color }} />
              </div>
              <div className="text-xs font-black text-depro-dark leading-tight mb-1">{t.name}</div>
              {last ? (
                <div className="text-lg font-black" style={{ color: r?.color || t.color }}>
                  {last.value} <span className="text-xs font-medium">{t.unit}</span>
                </div>
              ) : (
                <div className="text-xs text-depro-gray">Sin datos</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle del test seleccionado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Izquierda: input + historial */}
        <div className="space-y-4">
          {/* Registrar resultado */}
          <div className="bg-white border border-depro-border rounded-2xl p-5">
            <h3 className="font-bold text-depro-dark mb-1">{test.name}</h3>
            <p className="text-xs text-depro-gray mb-4">{test.subtitle}</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder={test.placeholder}
                value={inputs[test.id] || ""}
                onChange={(e) => setInputs((p) => ({ ...p, [test.id]: e.target.value }))}
                className="flex-1 border border-depro-border rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              />
              <span className="flex items-center px-3 text-sm text-depro-gray font-medium">{test.unit}</span>
              <button
                onClick={() => handleSave(test.id)}
                disabled={!inputs[test.id]}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ backgroundColor: saved[test.id] ? "#22C55E" : accent, color: contrastText(saved[test.id] ? "#22C55E" : accent) }}
              >
                <Save size={14} /> {saved[test.id] ? "✓" : "Guardar"}
              </button>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-white border border-depro-border rounded-2xl p-5">
            <h4 className="text-xs font-bold text-depro-gray uppercase tracking-wider mb-3">Historial</h4>
            {history.length === 0 ? (
              <p className="text-sm text-depro-gray text-center py-4">Sin registros todavía</p>
            ) : (
              <div className="space-y-2">
                {[...history].reverse().map((entry, i) => {
                  const r = getRange(test, entry.value);
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-depro-border last:border-0">
                      <div>
                        <span className="text-sm font-bold text-depro-dark">{entry.value} {test.unit}</span>
                        <span className="text-xs text-depro-gray ml-2">{entry.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {r && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: r.color + "15", color: r.color }}>
                            {r.label}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(test.id, history.length - 1 - i)}
                          className="p-1 rounded-lg text-depro-gray hover:text-red-500 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Derecha: gráfica + tendencia */}
        <div className="space-y-4">
          {/* Gráfica */}
          <div className="bg-white border border-depro-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-depro-gray uppercase tracking-wider">Evolución</h4>
              {trend && (
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: trend.color }}>
                  <trend.icon size={13} /> {trend.text}
                </span>
              )}
            </div>
            {history.length >= 2 ? (
              <div className="flex flex-col items-center gap-3">
                <Sparkline history={history} test={test} accent={test.color} />
                <div className="flex items-center justify-between w-full text-xs text-depro-gray mt-2">
                  <span>{history[0].date}</span>
                  <span>{history[history.length - 1].date}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-depro-gray">
                <BarChart2 size={28} className="opacity-30 mb-2" />
                <p className="text-xs">Necesitas al menos 2 registros para ver la evolución</p>
              </div>
            )}
          </div>

          {/* Resultado actual */}
          {lastEntry && lastRange && (
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: lastRange.color + "10", border: `1px solid ${lastRange.color}30` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                style={{ backgroundColor: lastRange.color + "20", color: lastRange.color }}
              >
                {lastRange.label[0]}
              </div>
              <div>
                <div className="text-xs text-depro-gray font-medium">Último resultado</div>
                <div className="text-2xl font-black" style={{ color: lastRange.color }}>
                  {lastEntry.value} <span className="text-sm font-medium">{test.unit}</span>
                </div>
                <div className="text-xs font-bold mt-0.5" style={{ color: lastRange.color }}>{lastRange.label}</div>
              </div>
            </div>
          )}

          {/* Rangos */}
          <div className="bg-white border border-depro-border rounded-2xl p-5">
            <h4 className="text-xs font-bold text-depro-gray uppercase tracking-wider mb-3">Referencia de niveles</h4>
            <div className="space-y-2">
              {test.ranges.filter((r) => isFinite(r.max)).map((r, i, arr) => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="font-medium text-depro-dark">{r.label}</span>
                  </div>
                  <span className="text-depro-gray font-mono">
                    {i === 0 ? `< ${r.max}` : `${arr[i-1].max} – ${r.max}`} {test.unit}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: test.ranges[test.ranges.length - 1].color }} />
                  <span className="font-medium text-depro-dark">{test.ranges[test.ranges.length - 1].label}</span>
                </div>
                <span className="text-depro-gray font-mono">≥ {test.ranges[test.ranges.length - 2]?.max} {test.unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────── */
export default function TeamTestsPage() {
  const { user } = useAuth();
  const accent = safeAccent(user?.club?.primaryColor || "#0A36F7");

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Cargar jugadores de la plantilla (localStorage, misma lógica que SquadPage)
  useEffect(() => {
    const clubId  = user?.club?.id;
    const teamId  = user?.team?.id;
    if (!clubId || !teamId) return;

    // 1. Jugadores manuales del equipo
    const squadRaw = localStorage.getItem(`depro_squad_${clubId}_${teamId}`);
    const manual = JSON.parse(squadRaw || "[]");

    // 2. Jugadores registrados que se unieron con código
    const registered = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("depro_player_club_")) continue;
      try {
        const val = JSON.parse(localStorage.getItem(key) || "null");
        if (!val) continue;
        const pClubId  = typeof val === "object" ? val.clubId  : val;
        const pTeamId  = typeof val === "object" ? val.teamId  : null;
        if (pClubId !== clubId || pTeamId !== teamId) continue;
        const playerId = key.replace("depro_player_club_", "");
        const name = val.name || val.email || playerId;
        registered.push({ id: playerId, name, plan: val.plan, isRegistered: true });
      } catch { /* ignore */ }
    }

    // Combinar sin duplicados
    const ids = new Set(manual.map((p) => p.id));
    const all = [...manual, ...registered.filter((p) => !ids.has(p.id))];
    setPlayers(all);
  }, [user?.club?.id, user?.team?.id]);

  if (selectedPlayer) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <PlayerTestPanel
          player={selectedPlayer}
          accent={accent}
          onBack={() => setSelectedPlayer(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-depro-gray mb-2">
          <Activity size={14} style={{ color: accent }} />
          Tests físicos
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Tests del equipo</h1>
        <p className="text-depro-gray text-sm">
          Registra y sigue la evolución de los 4 tests físicos para cada jugador de tu plantilla.
        </p>
      </div>

      {/* Listado de jugadores */}
      {players.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-depro-border rounded-2xl text-center py-16">
          <Users size={36} className="mx-auto mb-3 text-depro-gray opacity-40" />
          <h3 className="font-bold text-depro-dark mb-2">Sin jugadores en la plantilla</h3>
          <p className="text-sm text-depro-gray">Añade jugadores desde la sección Plantilla para poder registrar tests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => {
            // Resumen rápido de tests
            const testSummary = TESTS.map((t) => {
              const h = loadHistory(player.id, t.id);
              const last = h[h.length - 1];
              const r = last ? getRange(t, last.value) : null;
              return { test: t, last, range: r };
            });
            const done = testSummary.filter((s) => s.last).length;

            return (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="bg-white border border-depro-border rounded-2xl p-5 text-left hover:shadow-md hover:border-depro-blue/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ backgroundColor: accent + "15", color: accent }}
                  >
                    {(player.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-depro-dark truncate">{player.name}</div>
                    {player.isRegistered && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>
                        Plan individual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-depro-gray group-hover:text-depro-blue transition-colors">
                    <span className="text-xs">{done}/{TESTS.length} tests</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                {/* Mini resumen de los 4 tests */}
                <div className="grid grid-cols-4 gap-2">
                  {testSummary.map(({ test: t, last, range: r }) => (
                    <div
                      key={t.id}
                      className="rounded-xl p-2 text-center"
                      style={{ backgroundColor: r ? r.color + "10" : "#F9FAFB", border: `1px solid ${r ? r.color + "25" : "#E5E7EB"}` }}
                    >
                      <div className="text-[9px] font-bold text-depro-gray leading-tight mb-1">{t.name.split(" ")[0]}</div>
                      {last ? (
                        <div className="text-xs font-black" style={{ color: r?.color || t.color }}>
                          {last.value}<br />
                          <span className="text-[9px] font-medium">{t.unit}</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-depro-gray">–</div>
                      )}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
