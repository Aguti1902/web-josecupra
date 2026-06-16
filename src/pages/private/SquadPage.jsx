import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Trash2, Edit3, X, Save,
  Filter, UserPlus, Shield,
  Activity, Zap, ChevronRight,
  BarChart2, ArrowUpDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../context/ViewContext";
import { supabase } from "../../lib/supabase";
import { getEvalValues, getRatingForEval } from "../../lib/teamTestRatings";

// ── Constantes ───────────────────────────────────────────────
const POSITIONS = [
  "Portero", "Defensa", "Lateral", "Pivote",
  "Centro", "Mediapunta", "Extremo", "Delantero",
];

const POSITION_COLORS = {
  Portero:    "#F6CC12",
  Defensa:    "#3BC21D",
  Lateral:    "#3BC21D",
  Pivote:     "#0A36F7",
  Centro:     "#0A36F7",
  Mediapunta: "#0A36F7",
  Extremo:    "#FB2C39",
  Delantero:  "#FB2C39",
};

const EMPTY_PLAYER = {
  name: "", number: "", position: "Centro",
  age: "", weight: "", notes: "",
};

// ── Storage helpers (localStorage + Supabase sync) ──────────
function squadKey(clubId, teamId) {
  return `depro_squad_${clubId}_${teamId}`;
}
function loadSquad(clubId, teamId) {
  try { return JSON.parse(localStorage.getItem(squadKey(clubId, teamId)) || "[]"); }
  catch { return []; }
}
function saveSquad(clubId, teamId, players) {
  // 1. localStorage (inmediato)
  localStorage.setItem(squadKey(clubId, teamId), JSON.stringify(players));
  // 2. Supabase (en segundo plano, sin bloquear)
  syncSquadToSupabase(clubId, teamId, players).catch(() => {});
}
async function syncSquadToSupabase(clubId, teamId, players) {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return;
    const data = await r.json();
    const club = (data.clubs || []).find((c) => c.id === clubId);
    if (!club) return;
    const teams = (club.teams || []).map((t) =>
      t.id === teamId ? { ...t, squad: players } : t
    );
    await fetch("/api/admin-clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ club: { ...club, teams } }),
    });
    // Actualizar caché local
    const allClubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    const idx = allClubs.findIndex((c) => c.id === clubId);
    const updated = { ...club, teams };
    if (idx >= 0) allClubs[idx] = updated; else allClubs.unshift(updated);
    localStorage.setItem("depro_clubs", JSON.stringify(allClubs));
    localStorage.setItem(`depro_club_${clubId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn("[SquadPage] sync squad to Supabase failed:", e.message);
  }
}
async function loadSquadFromSupabase(clubId, teamId) {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const club = (data.clubs || []).find((c) => c.id === clubId);
    const team = (club?.teams || []).find((t) => t.id === teamId);
    return team?.squad || null;
  } catch { return null; }
}
function genId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Luminance helper ─────────────────────────────────────────
function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}
function ct(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }
function safe(color, fallback = "#0A36F7") { return lum(color) > 0.75 ? fallback : color; }

// ════════════════════════════════════════════════════════════
// Modal añadir / editar jugador
// ════════════════════════════════════════════════════════════
function PlayerModal({ initial, onSave, onClose, sa }) {
  const [form, setForm] = useState(initial || EMPTY_PLAYER);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark">
            {isEdit ? "Editar jugador" : "Añadir jugador"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-depro-gray-light text-depro-gray">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-depro-dark mb-1">Nombre completo *</label>
              <input
                className="admin-input w-full"
                placeholder="Nombre del jugador"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-1">Dorsal</label>
              <input
                className="admin-input w-full text-center font-mono"
                placeholder="—"
                type="number"
                min="1" max="99"
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-1">Posición *</label>
            <select
              className="admin-input w-full"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
            >
              {POSITIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-1">Edad</label>
              <input
                className="admin-input w-full"
                placeholder="—"
                type="number" min="10" max="50"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-depro-dark mb-1">Peso (kg)</label>
              <input
                className="admin-input w-full"
                placeholder="—"
                type="number" min="30" max="130"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-depro-dark mb-1">Observaciones</label>
            <textarea
              className="admin-input w-full resize-none"
              rows={2}
              placeholder="Notas sobre el jugador (lesiones, rol, etc.)"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm text-depro-gray hover:bg-depro-gray-light transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ backgroundColor: sa, color: ct(sa) }}
          >
            <Save size={14} /> {isEdit ? "Guardar cambios" : "Añadir jugador"}
          </button>
        </div>
      </div>
    </div>
  );
}

const FILTER_ALL = "Todos";

const POS_GROUPS = {
  [FILTER_ALL]: null,
  Portería: ["Portero"],
  Defensa:  ["Defensa", "Lateral"],
  Medio:    ["Pivote", "Centro", "Mediapunta"],
  Ataque:   ["Extremo", "Delantero"],
};

const TESTS_FULL = [
  { id: "resistencia", name: "Resistencia aeróbica", unit: "rectas", color: "#3B82F6", higher_is_better: true },
  { id: "sprint", name: "Sprint lineal", unit: "seg", color: "#EF4444", higher_is_better: false },
  { id: "cod", name: "COD 5-10-5", unit: "seg", color: "#8B5CF6", higher_is_better: false },
  { id: "cmj", name: "Salto CMJ", unit: "cm", color: "#22C55E", higher_is_better: true },
];

const EVAL_LABELS = ["T1", "T2", "T3"];

function loadSeasonTests(playerId) {
  const d = {};
  TESTS_FULL.forEach((t) => { d[t.id] = getEvalValues(playerId, t.id); });
  return d;
}
function playerHasAnyTests(playerId) {
  const season = loadSeasonTests(playerId);
  const hasSeason = Object.values(season).some((arr) => (arr || []).some((v) => v !== "" && !isNaN(parseFloat(v))));
  const hasPremium = TESTS_FULL.some((t) => {
    try {
      const hist = JSON.parse(localStorage.getItem(`depro_test_${playerId}_${t.id}`) || "[]");
      return hist.length > 0;
    } catch { return false; }
  });
  return hasSeason || hasPremium;
}

function filterPillClass(active) {
  const base = "text-xs font-bold px-3 py-1.5 rounded-full border transition-all";
  if (!active) return `${base} border-depro-border text-depro-gray bg-depro-gray-light/40 hover:border-depro-gray/50 hover:text-depro-dark`;
  return base;
}

function filterPillStyle(active, sa, ctFn, variant = "soft") {
  if (!active) return undefined;
  if (variant === "solid") return { backgroundColor: sa, color: ctFn(sa), borderColor: sa };
  return { backgroundColor: sa + "15", color: sa, borderColor: sa + "35" };
}

function weekKey() {
  const d = new Date(); const day = d.getDay() || 7;
  const mon = new Date(d); mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}

function loadPlayerStats(playerId) {
  // Progreso semanal
  let completedDays = 0;
  try {
    const raw = localStorage.getItem(`depro_progress_${playerId}_${weekKey()}`);
    completedDays = (JSON.parse(raw || "[]")).length;
  } catch {}

  // Plan generado
  let plan = null;
  let totalSessions = 0, completedSessions = 0;
  try {
    plan = JSON.parse(localStorage.getItem(`depro_plan_${playerId}`) || "null");
    if (plan) {
      const allSessions = plan.flatMap((d) => d.sessions || []);
      totalSessions    = allSessions.length;
      completedSessions = allSessions.filter((s) => s.status === "completed").length;
    }
  } catch {}

  // Tests físicos (premium individual)
  const tests = TESTS_FULL.map((t) => {
    try {
      const hist = JSON.parse(localStorage.getItem(`depro_test_${playerId}_${t.id}`) || "[]");
      const last = hist[hist.length - 1];
      return { ...t, last: last?.value ?? null, date: last?.date ?? null, count: hist.length, history: hist };
    } catch { return { ...t, last: null, date: null, count: 0, history: [] }; }
  });

  const seasonTests = TESTS_FULL.map((t) => ({
    ...t,
    evals: (loadSeasonTests(playerId)[t.id] || ["", "", ""]).slice(0, 3),
  }));

  return { completedDays, plan: !!plan, totalSessions, completedSessions, tests, seasonTests };
}

// ── Modal ficha completa del jugador ────────────────────────
function PlayerDetailModal({ player, onClose, sa, onEdit, teamPlayers = [] }) {
  const stats = useMemo(() => loadPlayerStats(player.id), [player.id]);
  const teamIds = useMemo(() => teamPlayers.map((p) => p.id), [teamPlayers]);
  const pct   = stats.totalSessions > 0
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0;
  const posColor = POSITION_COLORS[player.position] || sa;
  const isRegistered = player._source === "registered" || player._reg;
  const hasSeasonData = stats.seasonTests.some((t) => t.evals.some((v) => v !== "" && !isNaN(parseFloat(v))));
  const hasPremiumData = stats.tests.some((t) => t.last !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-depro-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ backgroundColor: posColor + "20", color: posColor }}
            >
              {(player.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-depro-dark text-xl">{player.name}</h2>
                {player.number && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ backgroundColor: sa, color: ct(sa) }}>
                    #{player.number}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {player.position && player.position !== "—" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: posColor + "15", color: posColor }}>
                    {player.position}
                  </span>
                )}
                {player._teamName && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sa + "12", color: sa }}>
                    {player._teamName}
                  </span>
                )}
                {isRegistered && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#22C55E15", color: "#16A34A" }}>
                    {player.plan || "Plan individual"}
                  </span>
                )}
              </div>
              {player.email && <p className="text-xs text-depro-gray mt-1 truncate">{player.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && player._source === "manual" && (
              <button
                onClick={() => { onClose(); onEdit(player); }}
                className="p-2 rounded-lg hover:bg-depro-gray-light text-depro-gray hover:text-depro-dark transition-colors"
                title="Editar jugador"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-depro-gray-light text-depro-gray">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Datos personales */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
              <Users size={12} /> Información del jugador
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Edad", value: player.age ? `${player.age} años` : "—" },
                { label: "Peso", value: player.weight ? `${player.weight} kg` : "—" },
                { label: "Dorsal", value: player.number || "—" },
                { label: "Equipo", value: player._teamName || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-depro-gray-light rounded-xl p-3">
                  <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                  <div className="text-sm font-black text-depro-dark mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            {player.notes && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Observaciones</div>
                <p className="text-sm text-amber-900">{player.notes}</p>
              </div>
            )}
          </section>

          {/* Tests de temporada (entrenador) */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-1">
              <Activity size={12} /> Tests físicos · Temporada (T1 / T2 / T3)
            </h3>
            <p className="text-[10px] text-depro-gray mb-3">Colores y etiquetas según la media del equipo en cada evaluación</p>
            {hasSeasonData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.seasonTests.map((t) => (
                  <div key={t.id} className="border border-depro-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-sm font-bold text-depro-dark">{t.name}</span>
                      <span className="text-[10px] text-depro-gray ml-auto">{t.unit}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {t.evals.map((v, i) => {
                        const r = v !== "" && !isNaN(parseFloat(v)) && teamIds.length
                          ? getRatingForEval(t, v, teamIds, i)
                          : null;
                        return (
                          <div key={i} className="text-center rounded-lg py-2" style={{ backgroundColor: r ? r.color + "12" : "#F9FAFB" }}>
                            <div className="text-[9px] font-bold text-depro-gray">{EVAL_LABELS[i]}</div>
                            {r ? (
                              <>
                                <div className="text-base font-black mt-0.5" style={{ color: r.color }}>{v}</div>
                                <div className="text-[9px] font-semibold" style={{ color: r.color }}>{r.label}</div>
                              </>
                            ) : (
                              <div className="text-sm text-depro-gray/40 mt-1">—</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-depro-border rounded-xl text-depro-gray">
                <Activity size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin tests de temporada registrados</p>
                <p className="text-xs mt-1">Puedes añadirlos desde la sección Tests del equipo</p>
              </div>
            )}
          </section>

          {/* Tests premium (jugador registrado) */}
          {isRegistered && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
                <Zap size={12} /> Tests individuales (app jugador)
              </h3>
              {hasPremiumData ? (
                <div className="grid grid-cols-2 gap-3">
                  {stats.tests.map((t) => (
                    <div key={t.id} className="bg-depro-gray-light rounded-xl p-3 border-l-4" style={{ borderColor: t.color }}>
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{t.name}</div>
                      {t.last !== null ? (
                        <>
                          <div className="text-xl font-black mt-0.5" style={{ color: t.color }}>
                            {t.last} <span className="text-xs font-normal text-depro-gray">{t.unit}</span>
                          </div>
                          <div className="text-[10px] text-depro-gray mt-0.5">{t.date} · {t.count} mediciones</div>
                        </>
                      ) : (
                        <div className="text-sm text-depro-gray mt-1">Sin datos</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-depro-gray text-center py-4">El jugador aún no ha registrado tests en la app</p>
              )}
            </section>
          )}

          {/* Actividad del plan (registrados) */}
          {isRegistered && (stats.plan || stats.completedDays > 0) && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
                <BarChart2 size={12} /> Actividad del plan
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-depro-gray-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-black" style={{ color: sa }}>{stats.completedDays}</div>
                  <div className="text-xs text-depro-gray mt-0.5">Días completados esta semana</div>
                </div>
                {stats.totalSessions > 0 && (
                  <div className="bg-depro-gray-light rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{stats.completedSessions}/{stats.totalSessions} sesiones</span>
                      <span className="text-sm font-black" style={{ color: pct === 100 ? "#22C55E" : sa }}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#22C55E" : sa }} />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SQUAD PAGE
// ════════════════════════════════════════════════════════════
export default function SquadPage() {
  const { user } = useAuth();
  const { viewingTeam } = useView();

  const club      = user?.club;
  const teamRole  = user?.team_role;
  const clubId    = club?.id;
  // Si el coordinador está viendo un equipo específico → no es "coordinador general"
  const isCoord   = teamRole === "coordinador" && !viewingTeam;
  const canEdit   = teamRole !== "coordinador"; // coordinador nunca puede editar

  const rawAccent = club?.primaryColor   || "#0A36F7";
  const rawSec    = club?.secondaryColor || "#ffffff";
  const sa        = safe(rawAccent, safe(rawSec, "#0A36F7"));

  // Todos los equipos del club (para coordinador)
  const allTeams  = club?.teams || [];

  // Resolver equipo activo: viewingTeam (coord viendo equipo) → user.team → búsqueda por email
  const myTeam = useMemo(() => {
    if (viewingTeam) return viewingTeam;
    if (user?.team) return user.team;
    if (!user?.email || isCoord) return null;
    return allTeams.find(
      (t) => t.coach?.email?.toLowerCase() === user.email?.toLowerCase()
    ) || null;
  }, [viewingTeam, user?.team, user?.email, isCoord, allTeams]);

  // ── Estado ────────────────────────────────────────────────
  const [squads, setSquads]         = useState({});
  const [regPlayers, setRegPlayers] = useState([]);
  const [search, setSearch]         = useState("");
  const [posFilter, setPosFilter]   = useState(FILTER_ALL);
  const [teamFilter, setTeamFilter] = useState("todos");
  const [posGroupFilter, setPosGroupFilter] = useState(FILTER_ALL);
  const [sourceFilter, setSourceFilter] = useState(FILTER_ALL);
  const [testsFilter, setTestsFilter]   = useState(FILTER_ALL);
  const [sortBy, setSortBy]         = useState("nombre");
  const [showModal, setShowModal]       = useState(false);
  const [editPlayer, setEditPlayer]     = useState(null);
  const [teamError, setTeamError]       = useState(false);
  const [detailPlayer, setDetailPlayer] = useState(null);

  // ── Cargar plantillas (localStorage + Supabase) ────────────
  // allTeams.length y myTeam?.id en deps para re-ejecutar cuando lleguen los datos asíncronos del club
  useEffect(() => {
    if (!clubId) return;
    const teamsToLoad = isCoord ? allTeams : (myTeam ? [myTeam] : []);
    if (teamsToLoad.length === 0) return;

    // Carga inmediata desde localStorage
    const fromLS = {};
    teamsToLoad.forEach((t) => { fromLS[t.id] = loadSquad(clubId, t.id); });
    setSquads(fromLS);

    // Actualización desde Supabase (reemplaza si hay datos más recientes)
    Promise.all(
      teamsToLoad.map(async (t) => {
        const remote = await loadSquadFromSupabase(clubId, t.id);
        if (remote && remote.length > 0) {
          localStorage.setItem(squadKey(clubId, t.id), JSON.stringify(remote));
          return { id: t.id, squad: remote };
        }
        return null;
      })
    ).then((results) => {
      const updates = results.filter(Boolean);
      if (updates.length > 0) {
        setSquads((prev) => {
          const next = { ...prev };
          updates.forEach(({ id, squad }) => { next[id] = squad; });
          return next;
        });
      }
    }).catch(() => {});
  }, [clubId, isCoord, allTeams.length, myTeam?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cargar jugadores registrados desde Supabase ───────────
  useEffect(() => {
    const teamIds = isCoord
      ? allTeams.map((t) => t.id)
      : myTeam ? [myTeam.id] : [];
    if (teamIds.length === 0) return;

    // 1. Buscar en TODO el localStorage: cualquier key depro_player_club_* con teamId coincidente
    const fromLS = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("depro_player_club_")) continue;
        const val = JSON.parse(localStorage.getItem(key) || "{}");
        if (teamIds.includes(val.teamId)) {
          // Buscar nombre del jugador en depro_player_photo o user sessions — usamos email si disponible
          fromLS.push({
            id:      key.replace("depro_player_club_", ""),
            name:    val.name || "Jugador registrado",
            plan:    val.plan || "Plan activo",
            email:   val.email || "",
            _teamId: val.teamId,
            _reg:    true,
          });
        }
      }
    } catch { /* silencioso */ }

    // 2. Registro compartido del equipo (guardado cuando el jugador se une)
    const fromRegistry = teamIds.flatMap((tid) => {
      try {
        return (JSON.parse(localStorage.getItem(`depro_team_registry_${tid}`) || "[]"))
          .map((p) => ({ ...p, _teamId: tid, _reg: true }));
      } catch { return []; }
    });

    // Combinar ambas fuentes sin duplicados
    const combined = [...fromRegistry];
    fromLS.forEach((p) => {
      if (!combined.find((c) => c.id === p.id)) combined.push(p);
    });
    if (combined.length > 0) { setRegPlayers(combined); return; }

    // 3. Supabase player_team_links (necesita SQL previo) + API Vercel
    (async () => {
      try {
        const { data, error } = await supabase
          .from("player_team_links")
          .select("player_id, name, plan, team_id")
          .in("team_id", teamIds);
        if (!error && data?.length > 0) {
          setRegPlayers(data.map((p) => ({ id: p.player_id, name: p.name || "Jugador", plan: p.plan || "—", _teamId: p.team_id, _reg: true })));
          return;
        }
        const res = await fetch(`/api/team-players?teamId=${teamIds[0]}`).catch(() => null);
        if (res?.ok) {
          const { players: list } = await res.json();
          if (list?.length > 0) setRegPlayers(list.map((p) => ({ ...p, _reg: true })));
        }
      } catch { /* silencioso */ }
    })();
  }, [isCoord, allTeams, myTeam]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Jugadores manuales visibles ───────────────────────────
  const allPlayers = useMemo(() => {
    const teams = isCoord ? allTeams : (myTeam ? [myTeam] : []);
    return teams.flatMap((t) =>
      (squads[t.id] || []).map((p) => ({ ...p, _teamId: t.id, _teamName: t.name }))
    );
  }, [squads, isCoord, allTeams, myTeam]);

  // ── Lista unificada: plantilla manual + registrados ───────
  const unifiedPlayers = useMemo(() => {
    const manual = allPlayers.map((p) => ({ ...p, _source: "manual" }));
    const manualIds = new Set(manual.map((p) => p.id));
    const reg = regPlayers
      .filter((p) => !manualIds.has(p.id))
      .map((p) => ({
        ...p,
        _source: "registered",
        position: p.position || "—",
        _teamName: allTeams.find((t) => t.id === p._teamId)?.name || myTeam?.name || "—",
      }));
    return [...manual, ...reg];
  }, [allPlayers, regPlayers, allTeams, myTeam?.name]);

  const filtered = useMemo(() => {
    let list = unifiedPlayers.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchPos    = posFilter === FILTER_ALL || p.position === posFilter;
      const matchTeam   = !isCoord || teamFilter === "todos" || p._teamId === teamFilter;
      const groupPos    = POS_GROUPS[posGroupFilter];
      const matchGroup  = !groupPos || groupPos.includes(p.position);
      const matchSource = sourceFilter === FILTER_ALL
        || (sourceFilter === "Manual" && p._source === "manual")
        || (sourceFilter === "Registrado" && p._source === "registered");
      const hasTests    = playerHasAnyTests(p.id);
      const matchTests  = testsFilter === FILTER_ALL
        || (testsFilter === "Con tests" && hasTests)
        || (testsFilter === "Sin tests" && !hasTests);
      return matchSearch && matchPos && matchTeam && matchGroup && matchSource && matchTests;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "nombre") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortBy === "dorsal") cmp = (Number(a.number) || 99) - (Number(b.number) || 99);
      else if (sortBy === "edad") cmp = (Number(a.age) || 0) - (Number(b.age) || 0);
      else if (sortBy === "posicion") cmp = (a.position || "").localeCompare(b.position || "");
      else if (sortBy === "equipo") cmp = (a._teamName || "").localeCompare(b._teamName || "");
      return cmp;
    });
    return list;
  }, [unifiedPlayers, search, posFilter, teamFilter, posGroupFilter, sourceFilter, testsFilter, sortBy, isCoord]);

  // ── Estadísticas (manual + registrados) ──────────────────
  const stats = useMemo(() => {
    const src = unifiedPlayers;
    const withAge = src.filter((p) => p.age);
    const avgAge  = withAge.length
      ? Math.round(withAge.reduce((a, p) => a + Number(p.age), 0) / withAge.length)
      : "—";
    const posCounts = {};
    src.forEach((p) => { if (p.position && p.position !== "—") posCounts[p.position] = (posCounts[p.position] || 0) + 1; });
    const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total: src.length, avgAge, topPos };
  }, [unifiedPlayers]);

  // ── CRUD ─────────────────────────────────────────────────
  const activeTeamId = isCoord ? null : myTeam?.id;

  const handleSave = (form) => {
    const tid = activeTeamId;
    if (!tid || !clubId) {
      setTeamError(true);
      setShowModal(false);
      return;
    }
    const current = squads[tid] || [];
    let updated;
    if (editPlayer?.id) {
      updated = current.map((p) => p.id === editPlayer.id ? { ...form, id: p.id } : p);
    } else {
      updated = [...current, { ...form, id: genId(), number: form.number || current.length + 1 }];
    }
    saveSquad(clubId, tid, updated);
    setSquads((s) => ({ ...s, [tid]: updated }));
    setShowModal(false);
    setEditPlayer(null);
  };

  const handleDelete = (player) => {
    if (!window.confirm(`¿Eliminar a ${player.name} de la plantilla?`)) return;
    const tid = player._teamId;
    const updated = (squads[tid] || []).filter((p) => p.id !== player.id);
    saveSquad(clubId, tid, updated);
    setSquads((s) => ({ ...s, [tid]: updated }));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: sa }}>
            <Users size={13} />
            {isCoord ? "Coordinador · Visión global" : `Entrenador · ${myTeam?.name || "Mi equipo"}`}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Plantilla</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            {isCoord
              ? `${stats.total} jugadores en ${allTeams.length} equipos`
              : `${stats.total} jugadores registrados`}
          </p>
        </div>

        {/* Botón añadir — solo entrenador */}
        {canEdit && (
          <button
            onClick={() => {
              if (!activeTeamId && !myTeam) { setTeamError(true); return; }
              setTeamError(false);
              setEditPlayer(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
            style={{ backgroundColor: sa, color: ct(sa) }}
          >
            <UserPlus size={16} /> Añadir jugador
          </button>
        )}
      </div>

      {/* Error: equipo no vinculado */}
      {teamError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <X size={16} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-700 text-sm">No se puede identificar tu equipo</p>
            <p className="text-xs text-red-600 mt-0.5">
              Tu cuenta no tiene un equipo vinculado correctamente. Pide al administrador que revise
              tu perfil en el panel de clubes y verifique que el equipo tenga tu email de coach asignado.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jugadores", value: stats.total },
          { label: "Edad media", value: stats.avgAge !== "—" ? `${stats.avgAge} años` : "—" },
          { label: "Posición más común", value: stats.topPos },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border rounded-2xl p-4"
            style={{ borderColor: sa + "25", borderTopWidth: "3px", borderTopColor: sa }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray">{s.label}</div>
            <div className="text-xl font-black text-depro-dark mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-depro-border rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="admin-input w-full pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 sm:min-w-[180px]">
            <ArrowUpDown size={13} className="text-depro-gray flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-input text-xs py-2 pr-8 w-full"
            >
              <option value="nombre">Orden: Nombre</option>
              <option value="dorsal">Orden: Dorsal</option>
              <option value="edad">Orden: Edad</option>
              <option value="posicion">Orden: Posición</option>
              {isCoord && <option value="equipo">Orden: Equipo</option>}
            </select>
          </div>
        </div>

        <div className="border-t border-depro-border pt-5 space-y-5">
          {/* Posición específica */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-depro-gray" />
              <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wider">Posición</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[FILTER_ALL, ...POSITIONS].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPosFilter(f)}
                  className={filterPillClass(posFilter === f)}
                  style={filterPillStyle(posFilter === f, sa, ct, "solid")}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Línea · Tipo · Tests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wider block">Línea</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(POS_GROUPS).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPosGroupFilter(g)}
                    className={filterPillClass(posGroupFilter === g)}
                    style={filterPillStyle(posGroupFilter === g, sa, ct)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wider block">Tipo</span>
              <div className="flex flex-wrap gap-2">
                {[FILTER_ALL, "Manual", "Registrado"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSourceFilter(s)}
                    className={filterPillClass(sourceFilter === s)}
                    style={filterPillStyle(sourceFilter === s, sa, ct)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wider block">Tests</span>
              <div className="flex flex-wrap gap-2">
                {[FILTER_ALL, "Con tests", "Sin tests"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTestsFilter(t)}
                    className={filterPillClass(testsFilter === t)}
                    style={filterPillStyle(testsFilter === t, sa, ct)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtro por equipo — solo coordinador */}
          {isCoord && allTeams.length > 0 && (
            <div className="space-y-2.5 pt-1 border-t border-depro-border">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-depro-gray" />
                <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wider">Equipo</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[{ id: "todos", name: FILTER_ALL }, ...allTeams].map((tm) => (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setTeamFilter(tm.id)}
                    className={filterPillClass(teamFilter === tm.id)}
                    style={filterPillStyle(teamFilter === tm.id, sa, ct, "solid")}
                  >
                    {tm.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        <div
          className="px-5 py-2.5 border-b border-depro-border flex items-center justify-between text-[10px] text-depro-gray"
          style={{ backgroundColor: sa + "06" }}
        >
          <span>{filtered.length} jugador{filtered.length !== 1 ? "es" : ""} · Clic en una fila para ver ficha completa</span>
          <span className="hidden sm:flex items-center gap-1"><ChevronRight size={10} /> Ver detalle</span>
        </div>
        {/* Cabecera */}
        <div
          className="hidden md:grid px-5 py-3 text-[10px] font-bold uppercase tracking-wider border-b border-depro-border"
          style={{ backgroundColor: sa + "0D", color: sa,
            gridTemplateColumns: isCoord
              ? "3rem 1fr 7rem 4rem 4rem 7rem 1fr 3rem 1.5rem"
              : "3rem 1fr 7rem 4rem 4rem 1fr 5rem 1.5rem" }}
        >
          <span>Nº</span>
          <span>Jugador</span>
          <span>Posición</span>
          <span className="text-center">Edad</span>
          <span className="text-center">Peso</span>
          {isCoord && <span>Equipo</span>}
          <span>Observaciones</span>
          {canEdit && <span />}
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="mx-auto mb-3" style={{ color: sa + "50" }} />
            <p className="font-medium text-depro-dark">
              {unifiedPlayers.length === 0 ? "La plantilla está vacía" : "No hay jugadores con ese filtro"}
            </p>
            {unifiedPlayers.length === 0 && canEdit && (
              <p className="text-sm text-depro-gray mt-1">
                Pulsa "Añadir jugador" para comenzar a registrar la plantilla.
              </p>
            )}
            {unifiedPlayers.length === 0 && isCoord && (
              <p className="text-sm text-depro-gray mt-1">
                Los entrenadores de cada equipo añadirán a sus jugadores desde la página de Plantilla.
              </p>
            )}
          </div>
        ) : (
          filtered.map((p) => {
            const posColor = POSITION_COLORS[p.position] || sa;
            const hasTests = playerHasAnyTests(p.id);
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailPlayer(p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailPlayer(p); }}
                className="grid px-5 py-4 border-b border-depro-border last:border-b-0 hover:bg-depro-gray-light/40 transition-colors items-center gap-3 cursor-pointer group"
                style={{
                  gridTemplateColumns: isCoord
                    ? "3rem 1fr 7rem 4rem 4rem 7rem 1fr 3rem 1.5rem"
                    : "3rem 1fr 7rem 4rem 4rem 1fr 5rem 1.5rem",
                }}
              >
                {/* Dorsal */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: sa, color: ct(sa) }}
                >
                  {p.number || "—"}
                </div>

                {/* Nombre */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: posColor + "20", color: posColor }}
                  >
                    {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-depro-dark text-sm truncate block">{p.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p._source === "registered" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#22C55E15", color: "#16A34A" }}>
                          Registrado
                        </span>
                      )}
                      {hasTests && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-depro-blue-light text-depro-blue">
                          Tests
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Posición */}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                  style={{ backgroundColor: posColor + "15", color: posColor }}
                >
                  {p.position || "—"}
                </span>

                {/* Edad */}
                <span className="text-sm font-semibold text-depro-dark text-center">{p.age || "—"}</span>

                {/* Peso */}
                <span className="text-sm font-semibold text-depro-dark text-center">
                  {p.weight ? `${p.weight} kg` : "—"}
                </span>

                {/* Equipo (solo coordinador) */}
                {isCoord && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                    style={{ backgroundColor: sa + "12", color: sa }}
                  >
                    {p._teamName}
                  </span>
                )}

                {/* Notas */}
                <p className="text-xs text-depro-gray line-clamp-2">{p.notes || "—"}</p>

                {/* Acciones */}
                {canEdit && p._source === "manual" && (
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditPlayer(p); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-depro-gray-light text-depro-gray hover:text-depro-dark transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-depro-gray hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {(!canEdit || p._source !== "manual") && <span />}

                <ChevronRight size={16} className="text-depro-gray group-hover:text-depro-dark transition-colors flex-shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* Modal ficha jugador */}
      {detailPlayer && (
        <PlayerDetailModal
          player={detailPlayer}
          onClose={() => setDetailPlayer(null)}
          sa={sa}
          teamPlayers={unifiedPlayers}
          onEdit={canEdit ? (p) => { setEditPlayer(p); setShowModal(true); } : null}
        />
      )}

      {/* Modal */}
      {showModal && (
        <PlayerModal
          initial={editPlayer}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditPlayer(null); }}
          sa={sa}
        />
      )}
    </div>
  );
}
