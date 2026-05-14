import { useState, useEffect } from "react";
import { Activity, Users, Save, TrendingUp, TrendingDown, Minus, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const TESTS = [
  { id: "resistencia", name: "Resistencia",  unit: "rectas", color: "#3B82F6", higher_is_better: true,  placeholder: "14",
    ranges: [{ label: "Bajo", max: 8, color: "#EF4444" }, { label: "Medio", max: 15, color: "#F59E0B" }, { label: "Bueno", max: 22, color: "#3B82F6" }, { label: "Excelente", max: Infinity, color: "#22C55E" }] },
  { id: "sprint",      name: "Sprint",       unit: "seg",    color: "#EF4444", higher_is_better: false, placeholder: "2.85",
    ranges: [{ label: "Excelente", max: 2.6, color: "#22C55E" }, { label: "Bueno", max: 3.0, color: "#3B82F6" }, { label: "Medio", max: 3.5, color: "#F59E0B" }, { label: "Bajo", max: Infinity, color: "#EF4444" }] },
  { id: "cod",         name: "COD",          unit: "seg",    color: "#8B5CF6", higher_is_better: false, placeholder: "4.72",
    ranges: [{ label: "Excelente", max: 4.4, color: "#22C55E" }, { label: "Bueno", max: 5.0, color: "#3B82F6" }, { label: "Medio", max: 5.6, color: "#F59E0B" }, { label: "Bajo", max: Infinity, color: "#EF4444" }] },
  { id: "cmj",         name: "CMJ",          unit: "cm",     color: "#22C55E", higher_is_better: true,  placeholder: "38",
    ranges: [{ label: "Bajo", max: 25, color: "#EF4444" }, { label: "Medio", max: 35, color: "#F59E0B" }, { label: "Bueno", max: 45, color: "#3B82F6" }, { label: "Excelente", max: Infinity, color: "#22C55E" }] },
];

function lum(hex) {
  try { const h = (hex||"#000").replace("#",""); return (0.299*parseInt(h.slice(0,2),16)+0.587*parseInt(h.slice(2,4),16)+0.114*parseInt(h.slice(4,6),16))/255; }
  catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function testKey(playerId, testId) { return `depro_test_${playerId}_${testId}`; }
function loadLast(playerId, testId) {
  try {
    const arr = JSON.parse(localStorage.getItem(testKey(playerId, testId)) || "[]");
    return arr.length ? arr[arr.length - 1] : null;
  } catch { return null; }
}
function loadHistory(playerId, testId) {
  try { return JSON.parse(localStorage.getItem(testKey(playerId, testId)) || "[]"); }
  catch { return []; }
}
function saveToHistory(playerId, testId, value) {
  const h = loadHistory(playerId, testId);
  h.push({ date: new Date().toLocaleDateString("es-ES"), value });
  localStorage.setItem(testKey(playerId, testId), JSON.stringify(h));
}
function getRange(test, val) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return test.ranges.find((r) => n < r.max) || test.ranges[test.ranges.length - 1];
}
function getTrend(test, playerId) {
  const h = loadHistory(playerId, test.id);
  if (h.length < 2) return null;
  const diff = parseFloat(h[h.length-1].value) - parseFloat(h[h.length-2].value);
  if (isNaN(diff) || diff === 0) return 0;
  return test.higher_is_better ? diff : -diff; // positivo = mejoró
}

/* ── Modal para registrar un valor de test ─────────────────── */
function AddTestModal({ player, test, accent, onClose, onSave }) {
  const [val, setVal] = useState("");
  const history = loadHistory(player.id, test.id);
  const range = getRange(test, val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-depro-dark">{test.name}</h3>
            <p className="text-xs text-depro-gray">{player.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-depro-gray hover:text-depro-dark"><X size={18} /></button>
        </div>

        {/* Último resultado */}
        {history.length > 0 && (
          <div className="bg-depro-gray-light rounded-xl p-3 mb-4 text-sm">
            <span className="text-depro-gray">Último: </span>
            <strong>{history[history.length-1].value} {test.unit}</strong>
            <span className="text-depro-gray ml-1">({history[history.length-1].date})</span>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number" step="0.01" autoFocus
            placeholder={test.placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1 border border-depro-border rounded-xl px-4 py-2.5 text-base font-mono focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
          />
          <span className="text-sm text-depro-gray font-medium w-12">{test.unit}</span>
        </div>

        {/* Nivel en tiempo real */}
        {range && val && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: range.color }} />
            <span className="text-xs font-bold" style={{ color: range.color }}>{range.label}</span>
          </div>
        )}

        {/* Rangos referencia */}
        <div className="grid grid-cols-4 gap-1 mb-5">
          {test.ranges.filter(r => isFinite(r.max)).map((r, i, arr) => (
            <div key={r.label} className="text-center rounded-lg p-1.5" style={{ backgroundColor: r.color + "12" }}>
              <div className="text-[9px] font-bold" style={{ color: r.color }}>{r.label}</div>
              <div className="text-[9px] text-depro-gray">{i===0?`<${r.max}`:`${arr[i-1].max}–${r.max}`}</div>
            </div>
          ))}
          <div className="text-center rounded-lg p-1.5" style={{ backgroundColor: test.ranges[test.ranges.length-1].color + "12" }}>
            <div className="text-[9px] font-bold" style={{ color: test.ranges[test.ranges.length-1].color }}>{test.ranges[test.ranges.length-1].label}</div>
            <div className="text-[9px] text-depro-gray">≥{test.ranges[test.ranges.length-2]?.max}</div>
          </div>
        </div>

        <button
          onClick={() => { if (val && !isNaN(parseFloat(val))) { saveToHistory(player.id, test.id, val); onSave(); onClose(); } }}
          disabled={!val || isNaN(parseFloat(val))}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-colors"
          style={{ backgroundColor: accent, color: contrastText(accent) }}
        >
          Guardar resultado
        </button>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────── */
export default function TeamTestsPage() {
  const { user } = useAuth();
  const accent = safeAccent(user?.club?.primaryColor || "#0A36F7");

  const [players, setPlayers] = useState([]);
  const [data, setData]       = useState({}); // { playerId: { testId: lastEntry } }
  const [modal, setModal]     = useState(null); // { player, test }
  const [sortBy, setSortBy]   = useState(null); // { testId, dir: 'asc'|'desc' }
  const [tick, setTick]       = useState(0);    // para forzar re-render tras guardar

  // Cargar plantilla
  useEffect(() => {
    const clubId = user?.club?.id;
    const teamId = user?.team?.id;
    if (!clubId || !teamId) return;

    const manual = JSON.parse(localStorage.getItem(`depro_squad_${clubId}_${teamId}`) || "[]");
    const registered = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("depro_player_club_")) continue;
      try {
        const val = JSON.parse(localStorage.getItem(key) || "null");
        if (!val) continue;
        const pClubId = typeof val === "object" ? val.clubId : val;
        const pTeamId = typeof val === "object" ? val.teamId : null;
        if (pClubId !== clubId || pTeamId !== teamId) continue;
        const playerId = key.replace("depro_player_club_", "");
        registered.push({ id: playerId, name: val.name || val.email || playerId, isRegistered: true });
      } catch { /* ignore */ }
    }
    const ids = new Set(manual.map((p) => p.id));
    setPlayers([...manual, ...registered.filter((p) => !ids.has(p.id))]);
  }, [user?.club?.id, user?.team?.id]);

  // Construir mapa de datos
  useEffect(() => {
    const map = {};
    players.forEach((p) => {
      map[p.id] = {};
      TESTS.forEach((t) => { map[p.id][t.id] = loadLast(p.id, t.id); });
    });
    setData(map);
  }, [players, tick]);

  // Ordenar jugadores
  const sortedPlayers = [...players].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = parseFloat(data[a.id]?.[sortBy.testId]?.value ?? "");
    const bVal = parseFloat(data[b.id]?.[sortBy.testId]?.value ?? "");
    const aNum = isNaN(aVal) ? -Infinity : aVal;
    const bNum = isNaN(bVal) ? -Infinity : bVal;
    return sortBy.dir === "asc" ? aNum - bNum : bNum - aNum;
  });

  const toggleSort = (testId) => {
    setSortBy((prev) => {
      if (prev?.testId !== testId) return { testId, dir: "desc" };
      if (prev.dir === "desc") return { testId, dir: "asc" };
      return null;
    });
  };

  if (players.length === 0) return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Tests del equipo</h1>
        <p className="text-depro-gray text-sm">Registra y compara los tests físicos de tu plantilla.</p>
      </div>
      <div className="bg-white border-2 border-dashed border-depro-border rounded-2xl text-center py-16">
        <Users size={36} className="mx-auto mb-3 text-depro-gray opacity-40" />
        <h3 className="font-bold text-depro-dark mb-2">Sin jugadores en la plantilla</h3>
        <p className="text-sm text-depro-gray">Añade jugadores desde la sección Plantilla.</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-depro-gray mb-1">
            <Activity size={13} style={{ color: accent }} /> Tests físicos
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Tests del equipo</h1>
          <p className="text-depro-gray text-sm mt-0.5">{players.length} jugadores · Pulsa cualquier celda para registrar un resultado</p>
        </div>
      </div>

      {/* Leyenda de niveles */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {[{ label: "Excelente", color: "#22C55E" }, { label: "Bueno", color: "#3B82F6" }, { label: "Medio", color: "#F59E0B" }, { label: "Bajo", color: "#EF4444" }].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-depro-gray">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
        <span className="text-xs text-depro-gray ml-2">· Pulsa columna para ordenar</span>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">
        {/* Cabecera */}
        <div className="grid grid-cols-[1fr_repeat(4,minmax(100px,1fr))] border-b border-depro-border">
          <div className="px-5 py-3.5 text-xs font-bold text-depro-gray uppercase tracking-wider">
            Jugador
          </div>
          {TESTS.map((t) => {
            const active = sortBy?.testId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => toggleSort(t.id)}
                className="px-3 py-3.5 text-left border-l border-depro-border hover:bg-depro-gray-light/50 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-bold text-depro-dark">{t.name}</span>
                  {active
                    ? (sortBy.dir === "desc" ? <ChevronDown size={12} className="text-depro-gray" /> : <ChevronUp size={12} className="text-depro-gray" />)
                    : <ChevronDown size={12} className="text-depro-gray/30" />
                  }
                </div>
                <div className="text-[10px] text-depro-gray mt-0.5">{t.unit}</div>
              </button>
            );
          })}
        </div>

        {/* Filas */}
        {sortedPlayers.map((player, pi) => (
          <div
            key={player.id}
            className={`grid grid-cols-[1fr_repeat(4,minmax(100px,1fr))] ${pi < sortedPlayers.length - 1 ? "border-b border-depro-border" : ""} hover:bg-depro-gray-light/30 transition-colors`}
          >
            {/* Nombre */}
            <div className="px-5 py-4 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ backgroundColor: accent + "15", color: accent }}
              >
                {(player.name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-depro-dark truncate">{player.name}</div>
                {player.isRegistered && (
                  <div className="text-[10px] text-depro-gray">Plan individual</div>
                )}
              </div>
            </div>

            {/* Celdas de tests */}
            {TESTS.map((t) => {
              const entry = data[player.id]?.[t.id];
              const range = entry ? getRange(t, entry.value) : null;
              const trend = getTrend(t, player.id);

              return (
                <button
                  key={t.id}
                  onClick={() => setModal({ player, test: t })}
                  className="px-3 py-4 border-l border-depro-border text-left hover:bg-depro-gray-light/60 transition-colors group relative"
                >
                  {entry ? (
                    <>
                      {/* Fondo color nivel */}
                      <div
                        className="absolute inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: range?.color + "08" }}
                      />
                      <div className="relative">
                        <div className="text-base font-black leading-none" style={{ color: range?.color || t.color }}>
                          {entry.value}
                          <span className="text-[10px] font-medium ml-0.5">{t.unit}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] font-bold" style={{ color: range?.color || t.color }}>{range?.label}</span>
                          {trend !== null && (
                            <span style={{ color: trend > 0 ? "#22C55E" : trend < 0 ? "#EF4444" : "#6B7280" }}>
                              {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-depro-gray/40 group-hover:text-depro-blue transition-colors">
                      <Plus size={13} />
                      <span className="text-xs">Añadir</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Resumen por test */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {TESTS.map((t) => {
          const vals = players
            .map((p) => parseFloat(data[p.id]?.[t.id]?.value ?? ""))
            .filter((v) => !isNaN(v));
          if (vals.length === 0) return (
            <div key={t.id} className="bg-white border border-depro-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-depro-dark">{t.name}</span>
              </div>
              <p className="text-xs text-depro-gray">Sin datos</p>
            </div>
          );
          const best  = t.higher_is_better ? Math.max(...vals) : Math.min(...vals);
          const worst = t.higher_is_better ? Math.min(...vals) : Math.max(...vals);
          const avg   = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
          return (
            <div key={t.id} className="bg-white border border-depro-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-depro-dark">{t.name}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-depro-gray">Mejor</span>
                  <span className="font-bold text-green-600">{best} {t.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-depro-gray">Media</span>
                  <span className="font-bold text-depro-dark">{avg} {t.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-depro-gray">Peor</span>
                  <span className="font-bold text-red-500">{worst} {t.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <AddTestModal
          player={modal.player}
          test={modal.test}
          accent={accent}
          onClose={() => setModal(null)}
          onSave={() => setTick((v) => v + 1)}
        />
      )}
    </div>
  );
}
