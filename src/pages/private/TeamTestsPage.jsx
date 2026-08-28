import { useState, useEffect } from "react";
import {
  Activity, Users, TrendingUp, TrendingDown, Minus,
  Plus, X, ChevronDown, ChevronUp, Pencil, Save, PlayCircle, BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam, useIsReadOnly } from "../../context/ViewContext";
import FeatureGate from "../../components/private/FeatureGate";
import {
  RATING_LEGEND, getEvalValues, loadSeasonData, saveSeasonData,
  getRatingForEval, getLastEvalInfo,
} from "../../lib/teamTestRatings";
import { mergeEvalTests } from "../../lib/evalTestDefaults";
import { mergeListsPreferVideo } from "../../lib/contentRestore";
import { isProCoachUser } from "../../lib/clubAuto/clubAutoCoachBridge";

/* ── Helper: cargar config de tests del admin ─────────────── */
function loadAdminTests() {
  try {
    const stored = localStorage.getItem("depro_global_tests");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
async function fetchAdminTestsFromCloud() {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const entry = (data.clubs || []).find((c) => c.id === "GLOBAL_TESTS");
    return entry?.tests ?? null;
  } catch { return null; }
}
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ── Definición de tests ───────────────────────────────────── */
const TESTS = [
  { id: "resistencia", name: "Resistencia", unit: "rectas", color: "#3B82F6", higher_is_better: true,  placeholder: "14" },
  { id: "sprint",      name: "Sprint",      unit: "seg",    color: "#EF4444", higher_is_better: false, placeholder: "2.85" },
  { id: "cod",         name: "COD",         unit: "seg",    color: "#8B5CF6", higher_is_better: false, placeholder: "4.72" },
  { id: "cmj",         name: "CMJ",         unit: "cm",     color: "#22C55E", higher_is_better: true,  placeholder: "38" },
];

const EVALS = ["T1", "T2", "T3"]; // 3 evaluaciones por temporada

/* ── Helpers de color ─────────────────────────────────────── */
function lum(hex) {
  try { const h = (hex||"#000").replace("#",""); return (0.299*parseInt(h.slice(0,2),16)+0.587*parseInt(h.slice(2,4),16)+0.114*parseInt(h.slice(4,6),16))/255; }
  catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

/* ── Helpers de datos ─────────────────────────────────────── */

function getDelta(test, vals) {
  // Retorna delta entre los últimos dos valores registrados
  const filled = vals.filter((v) => v !== "" && !isNaN(parseFloat(v)));
  if (filled.length < 2) return null;
  const last = parseFloat(filled[filled.length - 1]);
  const prev = parseFloat(filled[filled.length - 2]);
  const diff = last - prev;
  if (diff === 0) return { value: 0, improved: null };
  const improved = test.higher_is_better ? diff > 0 : diff < 0;
  return { value: diff, improved, abs: Math.abs(diff).toFixed(2) };
}

/* ── Sparkline 3 puntos ───────────────────────────────────── */
function Sparkline3({ vals, test, playerIds, width = 160, height = 60 }) {
  const points = vals
    .map((v, i) => ({ i, v: parseFloat(v), empty: v === "" || isNaN(parseFloat(v)) }));
  const filled = points.filter((p) => !p.empty);
  if (filled.length === 0) return (
    <div className="flex items-center justify-center text-[10px] text-depro-gray/40" style={{ width, height }}>
      Sin datos
    </div>
  );

  const values = filled.map((p) => p.v);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const padX = 20, padY = 10;
  const innerW = width - padX * 2, innerH = height - padY * 2;

  const toXY = (idx) => ({
    x: padX + (idx / 2) * innerW,
    y: padY + innerH - ((parseFloat(vals[idx] || min) - min) / range) * innerH,
  });

  const linePts = [];
  for (let i = 0; i < 3; i++) {
    if (vals[i] !== "" && !isNaN(parseFloat(vals[i]))) {
      if (linePts.length === 0) linePts.push(`M${toXY(i).x.toFixed(1)},${toXY(i).y.toFixed(1)}`);
      else linePts.push(`L${toXY(i).x.toFixed(1)},${toXY(i).y.toFixed(1)}`);
    }
  }

  // Área bajo la línea (solo puntos con datos)
  const filledPts = [0,1,2].filter((i) => vals[i] !== "" && !isNaN(parseFloat(vals[i])));
  const areaPath = filledPts.length >= 2
    ? `${linePts.join(" ")} L${toXY(filledPts[filledPts.length-1]).x.toFixed(1)},${height} L${toXY(filledPts[0]).x.toFixed(1)},${height} Z`
    : null;

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`sg-${test.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={test.color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={test.color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      <line x1={padX} y1={padY} x1={padX} x2={padX} y2={height - padY} stroke="#E5E7EB" strokeWidth="1" />
      <line x1={padX + innerW/2} y1={padY} x2={padX + innerW/2} y2={height - padY} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3" />
      <line x1={padX + innerW} y1={padY} x2={padX + innerW} y2={height - padY} stroke="#E5E7EB" strokeWidth="1" />

      {/* Área */}
      {areaPath && <path d={areaPath} fill={`url(#sg-${test.id})`} />}

      {/* Línea */}
      {linePts.length > 1 && <path d={linePts.join(" ")} fill="none" stroke={test.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

      {/* Puntos */}
      {[0,1,2].map((i) => {
        const { x, y } = toXY(i);
        const hasVal = vals[i] !== "" && !isNaN(parseFloat(vals[i]));
        const r = hasVal ? getRatingForEval(test, vals[i], playerIds, i) : null;
        return (
          <g key={i}>
            {hasVal ? (
              <>
                <circle cx={x} cy={y} r={6} fill="white" stroke={r?.color || test.color} strokeWidth="2.5" />
                <circle cx={x} cy={y} r={3} fill={r?.color || test.color} />
              </>
            ) : (
              <circle cx={x} cy={y} r={4} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="2,2" />
            )}
          </g>
        );
      })}

      {/* Etiquetas T1/T2/T3 */}
      {[0,1,2].map((i) => (
        <text key={i} x={toXY(i).x} y={height} textAnchor="middle" fontSize="9" fontWeight="700" fill="#9CA3AF">
          {EVALS[i]}
        </text>
      ))}
    </svg>
  );
}

/* ── Panel evolutivo de un jugador (expandido) ───────────── */
function PlayerEvolutionPanel({ player, accent, playerIds, onEdit }) {
  return (
    <div className="border-t border-depro-border bg-gray-50/60 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-depro-gray uppercase tracking-wide">Evolución por test · {player.name}</p>
        {onEdit && (
          <button
            onClick={() => onEdit(player)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
          >
            <Pencil size={11} /> Editar marcas
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TESTS.map((t) => {
          const vals   = getEvalValues(player.id, t.id);
          const delta  = getDelta(t, vals);
          const filled = vals.filter((v) => v !== "" && !isNaN(parseFloat(v)));

          return (
            <div key={t.id} className="bg-white rounded-xl border border-depro-border p-3">
              {/* Header test */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-bold text-depro-dark">{t.name}</span>
                </div>
                {delta && (
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-bold"
                    style={{ color: delta.improved ? "#22C55E" : delta.improved === false ? "#EF4444" : "#6B7280" }}
                  >
                    {delta.improved ? <TrendingUp size={10} /> : delta.improved === false ? <TrendingDown size={10} /> : <Minus size={10} />}
                    {delta.abs} {t.unit}
                  </span>
                )}
              </div>

              {/* Gráfica */}
              <Sparkline3 vals={vals} test={t} playerIds={playerIds} width={140} height={56} />

              {/* Tabla T1/T2/T3 */}
              <div className="mt-2 grid grid-cols-3 gap-1">
                {vals.map((v, i) => {
                  const r = v !== "" && !isNaN(parseFloat(v)) ? getRatingForEval(t, v, playerIds, i) : null;
                  return (
                    <div key={i} className="text-center rounded-lg py-1.5" style={{ backgroundColor: r ? r.color + "12" : "#F9FAFB" }}>
                      <div className="text-[9px] font-bold text-depro-gray">{EVALS[i]}</div>
                      {v !== "" && !isNaN(parseFloat(v)) ? (
                        <>
                          <div className="text-xs font-black mt-0.5" style={{ color: r?.color || t.color }}>{v}</div>
                          <div className="text-[8px]" style={{ color: r?.color || t.color }}>{r?.label}</div>
                        </>
                      ) : (
                        <div className="text-[10px] text-depro-gray/40 mt-0.5">–</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filled.length === 0 && (
                <p className="text-[10px] text-depro-gray text-center mt-1">Sin registros</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Modal para registrar/editar las 3 marcas de un jugador ── */
function EditMarksModal({ player, accent, players, onClose, onSave }) {
  const [inputs, setInputs] = useState(() => {
    const d = loadSeasonData(player.id);
    const init = {};
    TESTS.forEach((t) => { init[t.id] = [...(d[t.id] || ["", "", ""])]; });
    return init;
  });

  const playerIds = players.map((p) => p.id);

  const handleSave = () => {
    TESTS.forEach((t) => {
      const d = loadSeasonData(player.id);
      d[t.id] = inputs[t.id];
      saveSeasonData(player.id, d);
    });
    onSave();
    onClose();
  };

  // Guardar directamente por campo
  const set = (testId, evalIdx, val) => {
    setInputs((prev) => {
      const arr = [...(prev[testId] || ["","",""])];
      arr[evalIdx] = val;
      return { ...prev, [testId]: arr };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-depro-border sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-black text-depro-dark text-lg">Marcas de {player.name}</h3>
            <p className="text-xs text-depro-gray">3 evaluaciones por temporada (T1, T2, T3)</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {TESTS.map((t) => (
            <div key={t.id} className="bg-depro-gray-light/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-sm font-bold text-depro-dark">{t.name}</span>
                <span className="text-xs text-depro-gray">({t.unit})</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {EVALS.map((label, i) => {
                  const val = inputs[t.id]?.[i] || "";
                  const range = val !== "" && !isNaN(parseFloat(val))
                    ? getRatingForEval(t, val, playerIds, i, player.id, val)
                    : null;
                  return (
                    <div key={i}>
                      <label className="text-xs font-bold text-depro-gray mb-1 block">{label}</label>
                      <input
                        type="number" step="0.01"
                        placeholder={t.placeholder}
                        value={val}
                        onChange={(e) => set(t.id, i, e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${
                          range ? "border-transparent focus:ring-depro-blue/30" : "border-depro-border focus:ring-depro-blue/30"
                        }`}
                        style={range ? { borderColor: range.color + "60", backgroundColor: range.color + "08" } : {}}
                      />
                      {range && (
                        <div className="text-[10px] font-bold mt-1 flex items-center gap-1" style={{ color: range.color }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: range.color }} />
                          {range.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-6 border-t border-depro-border sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-depro-border text-depro-gray font-semibold text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent, color: contrastText(accent) }}
          >
            <Save size={15} /> Guardar marcas
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────── */
export default function TeamTestsPage() {
  const { user } = useAuth();
  return (
    <FeatureGate user={user} feature="team_tests">
      <TeamTestsPageInner />
    </FeatureGate>
  );
}

function TeamTestsPageInner() {
  const { user }  = useAuth();
  const activeTeam = useActiveTeam();
  const isReadOnly = useIsReadOnly();
  const accent    = safeAccent(user?.club?.primaryColor || "#0A36F7");

  const [players,         setPlayers]    = useState([]);
  const [sortBy,          setSortBy]     = useState(null);
  const [expandedPlayer,  setExpanded]   = useState(null);
  const [editingPlayer,   setEditing]    = useState(null);
  const [tick,            setTick]       = useState(0);
  const [adminTests,      setAdminTests] = useState(() => mergeEvalTests(loadAdminTests()));
  const [showProtocols,   setShowProtocols] = useState(true);

  /* Carga tests del admin desde la nube */
  useEffect(() => {
    fetchAdminTestsFromCloud().then((cloud) => {
      const local = loadAdminTests();
      if (cloud == null) {
        setAdminTests(mergeEvalTests(local));
        return;
      }
      const merged = mergeEvalTests(mergeListsPreferVideo(local, cloud));
      setAdminTests(merged);
      localStorage.setItem("depro_global_tests", JSON.stringify(merged));
    });
  }, []);

  /* Carga plantilla */
  useEffect(() => {
    const clubId = user?.club?.id, teamId = activeTeam?.id;
    if (!clubId || !teamId) return;
    const manual = JSON.parse(localStorage.getItem(`depro_squad_${clubId}_${teamId}`) || "[]");
    const registered = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("depro_player_club_")) continue;
      try {
        const val  = JSON.parse(localStorage.getItem(key) || "null");
        if (!val)  continue;
        const pClubId = typeof val === "object" ? val.clubId : val;
        const pTeamId = typeof val === "object" ? val.teamId : null;
        if (pClubId !== clubId || pTeamId !== teamId) continue;
        const pid = key.replace("depro_player_club_", "");
        registered.push({ id: pid, name: val.name || val.email || pid, isRegistered: true });
      } catch { /* ignore */ }
    }
    const ids = new Set(manual.map((p) => p.id));
    setPlayers([...manual, ...registered.filter((p) => !ids.has(p.id))]);
  }, [user?.club?.id, activeTeam?.id]);

  /* Ordenar */
  const sortedPlayers = [...players].sort((a, b) => {
    if (!sortBy) return 0;
    const aVals = getEvalValues(a.id, sortBy.testId);
    const bVals = getEvalValues(b.id, sortBy.testId);
    // Usar el último valor registrado
    const aLast = [...aVals].reverse().find((v) => v !== "" && !isNaN(parseFloat(v)));
    const bLast = [...bVals].reverse().find((v) => v !== "" && !isNaN(parseFloat(v)));
    const aNum  = aLast ? parseFloat(aLast) : -Infinity;
    const bNum  = bLast ? parseFloat(bLast) : -Infinity;
    return sortBy.dir === "asc" ? aNum - bNum : bNum - aNum;
  });

  const toggleSort = (testId) => setSortBy((prev) => {
    if (prev?.testId !== testId) return { testId, dir: "desc" };
    if (prev.dir === "desc")     return { testId, dir: "asc" };
    return null;
  });

  const isSoloCoach = isProCoachUser(user);
  const protocols = adminTests.length ? adminTests : mergeEvalTests([]);
  const hasProtocolContent = protocols.some((t) => t.videoUrl || t.description);

  const protocolsBlock = hasProtocolContent && (
    <div className={`${players.length === 0 ? "" : "mt-6"} bg-white border border-depro-border rounded-2xl overflow-hidden`}>
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F8F9FB] transition-colors text-left"
        onClick={() => setShowProtocols((v) => !v)}>
        <div className="w-9 h-9 rounded-xl bg-depro-blue/10 border border-depro-blue/20 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-depro-blue" />
        </div>
        <div className="flex-1">
          <div className="font-black text-depro-dark">Protocolos de evaluación</div>
          <div className="text-xs text-depro-gray">Cómo se realiza cada test · Vídeos explicativos</div>
        </div>
        {showProtocols
          ? <ChevronUp size={16} className="text-depro-gray flex-shrink-0" />
          : <ChevronDown size={16} className="text-depro-gray flex-shrink-0" />}
      </button>

      {showProtocols && (
        <div className="border-t border-depro-border">
          {protocols.map((adminTest, i) => {
            const testDef = TESTS.find((t) => t.id === adminTest.id) || {};
            const ytId = getYouTubeId(adminTest.videoUrl);
            const hasContent = adminTest.videoUrl || adminTest.description;
            if (!hasContent) return null;

            return (
              <div key={adminTest.id || i}
                className={i < protocols.length - 1 ? "border-b border-depro-border/60" : ""}>
                <div className="flex items-center gap-3 px-5 py-3.5 bg-[#F8F9FB]/60">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ backgroundColor: (testDef.color || "#3B82F6") + "20", color: testDef.color || "#3B82F6" }}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-black text-depro-dark text-sm">{adminTest.label || testDef.name}</div>
                    <div className="text-[10px] text-depro-gray">Unidad: {adminTest.unit || testDef.unit}</div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {ytId ? (
                    <div>
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1">
                        <PlayCircle size={10} className="text-depro-blue" /> Vídeo explicativo
                      </div>
                      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
                        <iframe src={`https://www.youtube.com/embed/${ytId}`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen title={adminTest.label} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1">
                        <PlayCircle size={10} className="text-depro-blue" /> Vídeo explicativo
                      </div>
                      <div className="flex items-center justify-center rounded-xl bg-depro-gray-light/50 border-2 border-dashed border-depro-border text-depro-gray text-xs font-medium min-h-[140px] px-4 text-center">
                        El vídeo de este protocolo aparecerá aquí cuando el admin suba la URL (igual que el resto de ejercicios).
                      </div>
                    </div>
                  )}

                  {adminTest.description && (
                    <div>
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2">
                        Protocolo de ejecución
                      </div>
                      <div className="bg-[#F8F9FB] border border-depro-border rounded-xl px-4 py-3 text-sm text-depro-dark/80 whitespace-pre-line leading-relaxed">
                        {adminTest.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (players.length === 0) return (
    <div className="dash-page">
      <h1 className="text-2xl font-black text-depro-dark mb-2">Tests del equipo</h1>
      <div className="bg-white border-2 border-dashed border-depro-border rounded-2xl text-center py-16 mb-6">
        <Users size={36} className="mx-auto mb-3 text-depro-gray opacity-40" />
        <h3 className="font-bold text-depro-dark mb-1">Sin jugadores en la plantilla</h3>
        <p className="text-sm text-depro-gray">
          {isSoloCoach
            ? "Añade jugadores desde Plantilla para registrar marcas. Los protocolos de evaluación están debajo."
            : "Añade jugadores desde la sección Plantilla."}
        </p>
      </div>
      {protocolsBlock}
    </div>
  );

  return (
    <div className="dash-page">
      {isReadOnly && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Modo visualización · {activeTeam?.name || "Equipo"} — Solo lectura
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-depro-gray mb-1">
          <Activity size={13} style={{ color: accent }} /> Tests físicos · 3 evaluaciones / temporada
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Tests del equipo</h1>
        <p className="text-depro-gray text-sm mt-0.5">
          {players.length} jugadores · Pulsa una fila para ver la evolución T1→T2→T3
        </p>
      </div>

      {/* Leyenda — vs media del equipo */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
        {RATING_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-depro-gray">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
            <span className="text-depro-gray/50">({l.hint})</span>
          </div>
        ))}
        <span className="text-xs text-depro-gray/60 w-full sm:w-auto">· Comparado con la media del equipo · T1 / T2 / T3</span>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">

        {/* Cabecera */}
        <div className="grid grid-cols-[1fr_repeat(4,minmax(90px,1fr))] border-b border-depro-border bg-depro-gray-light/50">
          <div className="px-5 py-3 text-xs font-bold text-depro-gray uppercase tracking-wider">Jugador</div>
          {TESTS.map((t) => {
            const active = sortBy?.testId === t.id;
            return (
              <button key={t.id} onClick={() => toggleSort(t.id)}
                className="px-3 py-3 text-left border-l border-depro-border hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-bold text-depro-dark">{t.name}</span>
                  {active
                    ? (sortBy.dir === "desc" ? <ChevronDown size={11} className="text-depro-gray" /> : <ChevronUp size={11} className="text-depro-gray" />)
                    : <ChevronDown size={11} className="text-depro-gray/25" />}
                </div>
                <div className="text-[10px] text-depro-gray mt-0.5">{t.unit}</div>
              </button>
            );
          })}
        </div>

        {/* Filas */}
        {sortedPlayers.map((player, pi) => {
          const isExpanded = expandedPlayer === player.id;
          return (
            <div key={player.id} className={pi < sortedPlayers.length - 1 ? "border-b border-depro-border" : ""}>
              <div className="grid grid-cols-[1fr_repeat(4,minmax(90px,1fr))] hover:bg-depro-gray-light/20 transition-colors">

                {/* Nombre */}
                <div className="px-5 py-3.5 flex items-center gap-3">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : player.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 hover:opacity-80"
                    style={{ backgroundColor: accent + "15", color: accent }}
                  >
                    {(player.name || "?")[0].toUpperCase()}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : player.id)}
                      className="text-sm font-bold text-depro-dark hover:underline flex items-center gap-1 truncate"
                    >
                      {player.name}
                      {isExpanded ? <ChevronUp size={10} className="text-depro-gray flex-shrink-0" /> : <ChevronDown size={10} className="text-depro-gray flex-shrink-0" />}
                    </button>
                    {player.isRegistered && <div className="text-[10px] text-depro-gray">Plan individual</div>}
                  </div>
                </div>

                {/* Celdas: muestra T1 / T2 / T3 en mini formato */}
                {TESTS.map((t) => {
                  const vals  = getEvalValues(player.id, t.id);
                  const delta = getDelta(t, vals);
                  // Última marca registrada
                  const lastInfo = getLastEvalInfo(vals);
                  const lastVal  = lastInfo?.value;
                  const range    = lastVal && lastInfo
                    ? getRatingForEval(t, lastVal, players.map((p) => p.id), lastInfo.idx)
                    : null;

                  return (
                    <button
                      key={t.id}
                      onClick={isReadOnly ? undefined : () => setEditing(player)}
                      className={`px-3 py-3.5 border-l border-depro-border text-left transition-colors ${isReadOnly ? "cursor-default" : "hover:bg-depro-gray-light/50 group"}`}
                    >
                      {lastVal ? (
                        <>
                          {/* Última marca grande */}
                          <div className="text-base font-black leading-none" style={{ color: range?.color || t.color }}>
                            {lastVal}<span className="text-[10px] font-medium ml-0.5">{t.unit}</span>
                          </div>
                          {/* Mini pills T1/T2/T3 */}
                          <div className="flex items-center gap-0.5 mt-1.5">
                            {vals.map((v, i) => {
                              const r = v !== "" && !isNaN(parseFloat(v))
                                ? getRatingForEval(t, v, players.map((p) => p.id), i)
                                : null;
                              return (
                                <div
                                  key={i}
                                  className="text-[8px] font-bold px-1 py-0.5 rounded"
                                  style={{
                                    backgroundColor: r ? r.color + "20" : "#F3F4F6",
                                    color: r ? r.color : "#9CA3AF",
                                  }}
                                >
                                  {EVALS[i]}{v !== "" && !isNaN(parseFloat(v)) ? ` ${v}` : ""}
                                </div>
                              );
                            })}
                          </div>
                          {/* Tendencia */}
                          {delta && (
                            <div className="flex items-center gap-0.5 mt-1" style={{ color: delta.improved ? "#22C55E" : delta.improved === false ? "#EF4444" : "#6B7280" }}>
                              {delta.improved ? <TrendingUp size={10} /> : delta.improved === false ? <TrendingDown size={10} /> : <Minus size={10} />}
                              <span className="text-[9px] font-bold">{delta.abs} {t.unit}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-depro-gray/40 group-hover:text-depro-blue transition-colors">
                          <Plus size={12} /><span className="text-xs">Añadir</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Panel evolución expandido */}
              {isExpanded && (
                <PlayerEvolutionPanel
                  player={player}
                  accent={accent}
                  playerIds={players.map((p) => p.id)}
                  onEdit={isReadOnly ? null : (p) => setEditing(p)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {TESTS.map((t) => {
          const allLastVals = players
            .map((p) => {
              const vals = getEvalValues(p.id, t.id);
              return [...vals].reverse().find((v) => v !== "" && !isNaN(parseFloat(v)));
            })
            .filter(Boolean)
            .map(parseFloat);
          if (allLastVals.length === 0) return (
            <div key={t.id} className="bg-white border border-depro-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-depro-dark">{t.name}</span>
              </div>
              <p className="text-xs text-depro-gray">Sin datos</p>
            </div>
          );
          const best  = t.higher_is_better ? Math.max(...allLastVals) : Math.min(...allLastVals);
          const worst = t.higher_is_better ? Math.min(...allLastVals) : Math.max(...allLastVals);
          const avg   = (allLastVals.reduce((a, b) => a + b, 0) / allLastVals.length).toFixed(2);
          return (
            <div key={t.id} className="bg-white border border-depro-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-depro-dark">{t.name}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-depro-gray">Mejor</span><span className="font-bold text-green-600">{best} {t.unit}</span></div>
                <div className="flex justify-between text-xs"><span className="text-depro-gray">Media</span><span className="font-bold text-depro-dark">{avg} {t.unit}</span></div>
                <div className="flex justify-between text-xs"><span className="text-depro-gray">Peor</span><span className="font-bold text-red-500">{worst} {t.unit}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {protocolsBlock}

      {/* Modal edición de marcas */}
      {editingPlayer && (
        <EditMarksModal
          player={editingPlayer}
          accent={accent}
          players={players}
          onClose={() => setEditing(null)}
          onSave={() => { setTick((v) => v + 1); setExpanded(editingPlayer.id); }}
        />
      )}
    </div>
  );
}
