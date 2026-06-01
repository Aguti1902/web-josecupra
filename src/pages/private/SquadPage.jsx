import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Trash2, Edit3, X, Save,
  Filter, UserPlus, Shield, CheckCircle,
  TrendingUp, Activity, Zap, ChevronRight,
  Calendar, BarChart2, Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../context/ViewContext";
import { supabase } from "../../lib/supabase";

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

// ── Helpers de datos del jugador ────────────────────────────
const TESTS_META = [
  { id: "resistencia", name: "Resistencia",  unit: "rectas", color: "#3B82F6" },
  { id: "sprint",      name: "Sprint",        unit: "seg",    color: "#EF4444" },
  { id: "cod",         name: "COD 5-10-5",   unit: "seg",    color: "#8B5CF6" },
  { id: "cmj",         name: "Salto CMJ",    unit: "cm",     color: "#22C55E" },
];

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

  // Tests físicos
  const tests = TESTS_META.map((t) => {
    try {
      const hist = JSON.parse(localStorage.getItem(`depro_test_${playerId}_${t.id}`) || "[]");
      const last = hist[hist.length - 1];
      return { ...t, last: last?.value ?? null, date: last?.date ?? null, count: hist.length };
    } catch { return { ...t, last: null, date: null, count: 0 }; }
  });

  return { completedDays, plan: !!plan, totalSessions, completedSessions, tests };
}

// ── Modal estadísticas jugador registrado ────────────────────
function PlayerStatsModal({ player, onClose, sa }) {
  const stats = useMemo(() => loadPlayerStats(player.id), [player.id]);
  const pct   = stats.totalSessions > 0
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-depro-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ backgroundColor: sa + "15", color: sa }}>
              {(player.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-depro-dark">{player.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#22C55E15", color: "#16A34A" }}>
                  {player.plan || "Plan activo"}
                </span>
                {player.email && <span className="text-xs text-depro-gray">{player.email}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-depro-gray-light text-depro-gray">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Progreso semanal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
              <Calendar size={12} /> Semana actual
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-depro-gray-light rounded-xl p-4 text-center">
                <div className="text-2xl font-black" style={{ color: sa }}>{stats.completedDays}</div>
                <div className="text-xs text-depro-gray mt-0.5">Días completados</div>
              </div>
              <div className="bg-depro-gray-light rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-depro-dark">{stats.plan ? "✓" : "—"}</div>
                <div className="text-xs text-depro-gray mt-0.5">Plan generado</div>
              </div>
            </div>
          </div>

          {/* Progreso del plan */}
          {stats.totalSessions > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
                <BarChart2 size={12} /> Progreso del plan
              </h3>
              <div className="bg-depro-gray-light rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-depro-dark font-medium">{stats.completedSessions} / {stats.totalSessions} sesiones</span>
                  <span className="text-sm font-black" style={{ color: pct === 100 ? "#22C55E" : sa }}>{pct}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#22C55E" : sa }} />
                </div>
              </div>
            </div>
          )}

          {/* Tests físicos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-depro-gray flex items-center gap-1.5 mb-3">
              <Activity size={12} /> Tests físicos (Premium)
            </h3>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Sin datos */}
          {!stats.plan && stats.completedDays === 0 && stats.tests.every((t) => t.last === null) && (
            <div className="text-center py-6 text-depro-gray">
              <Trophy size={28} className="mx-auto mb-2 text-depro-border" />
              <p className="text-sm font-medium text-depro-dark">Sin actividad registrada aún</p>
              <p className="text-xs mt-1">El jugador aún no ha generado su plan ni completado tests.</p>
            </div>
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

  const { t } = useTranslation();

  // ── Estado ────────────────────────────────────────────────
  const [squads, setSquads]         = useState({});
  const [regPlayers, setRegPlayers] = useState([]);
  const [search, setSearch]         = useState("");
  const [posFilter, setPosFilter]   = useState(t("squad.all"));
  const [teamFilter, setTeamFilter] = useState("todos");
  const [showModal, setShowModal]       = useState(false);
  const [editPlayer, setEditPlayer]     = useState(null);
  const [teamError, setTeamError]       = useState(false);
  const [statsPlayer, setStatsPlayer]   = useState(null);

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

  const filtered = useMemo(() => {
    return allPlayers.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchPos    = posFilter === "Todos" || p.position === posFilter;
      const matchTeam   = !isCoord || teamFilter === "todos" || p._teamId === teamFilter;
      return matchSearch && matchPos && matchTeam;
    });
  }, [allPlayers, search, posFilter, teamFilter, isCoord]);

  // ── Estadísticas (manual + registrados) ──────────────────
  const stats = useMemo(() => {
    const src = allPlayers;
    const withAge = src.filter((p) => p.age);
    const avgAge  = withAge.length
      ? Math.round(withAge.reduce((a, p) => a + Number(p.age), 0) / withAge.length)
      : "—";
    const posCounts = {};
    src.forEach((p) => { posCounts[p.position] = (posCounts[p.position] || 0) + 1; });
    const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total: src.length + regPlayers.length, avgAge, topPos };
  }, [allPlayers, regPlayers]);

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
      <div className="bg-white border border-depro-border rounded-2xl p-4 space-y-3">
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
          <div className="flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
            <Filter size={13} className="text-depro-gray flex-shrink-0" />
            {["Todos", ...POSITIONS].map((f) => (
              <button
                key={f}
                onClick={() => setPosFilter(f)}
                className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all"
                style={
                  posFilter === f
                    ? { backgroundColor: sa, color: ct(sa), borderColor: sa }
                    : {}
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por equipo — solo coordinador */}
        {isCoord && allTeams.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Shield size={13} className="text-depro-gray flex-shrink-0" />
            {[{ id: "todos", name: "Todos" }, ...allTeams].map((t) => (
              <button
                key={t.id}
                onClick={() => setTeamFilter(t.id)}
                className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all"
                style={
                  teamFilter === t.id
                    ? { backgroundColor: sa, color: ct(sa), borderColor: sa }
                    : {}
                }
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        {/* Cabecera */}
        <div
          className="hidden md:grid px-5 py-3 text-[10px] font-bold uppercase tracking-wider border-b border-depro-border"
          style={{ backgroundColor: sa + "0D", color: sa,
            gridTemplateColumns: isCoord ? "3rem 1fr 7rem 4rem 4rem 7rem 1fr 3rem" : "3rem 1fr 7rem 4rem 4rem 1fr 5rem" }}
        >
          <span>Nº</span>
          <span>Jugador</span>
          <span>Posición</span>
          <span className="text-center">Edad</span>
          <span className="text-center">Peso</span>
          {isCoord && <span>Equipo</span>}
          <span>Observaciones</span>
          {canEdit && <span />}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="mx-auto mb-3" style={{ color: sa + "50" }} />
            <p className="font-medium text-depro-dark">
              {allPlayers.length === 0 ? "La plantilla está vacía" : "No hay jugadores con ese filtro"}
            </p>
            {allPlayers.length === 0 && canEdit && (
              <p className="text-sm text-depro-gray mt-1">
                Pulsa "Añadir jugador" para comenzar a registrar la plantilla.
              </p>
            )}
            {allPlayers.length === 0 && isCoord && (
              <p className="text-sm text-depro-gray mt-1">
                Los entrenadores de cada equipo añadirán a sus jugadores desde la página de Plantilla.
              </p>
            )}
          </div>
        ) : (
          filtered.map((p) => {
            const posColor = POSITION_COLORS[p.position] || sa;
            return (
              <div
                key={p.id}
                className="grid px-5 py-4 border-b border-depro-border last:border-b-0 hover:bg-depro-gray-light/40 transition-colors items-center gap-3"
                style={{
                  gridTemplateColumns: isCoord
                    ? "3rem 1fr 7rem 4rem 4rem 7rem 1fr 3rem"
                    : "3rem 1fr 7rem 4rem 4rem 1fr 5rem",
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
                  <span className="font-bold text-depro-dark text-sm truncate">{p.name}</span>
                </div>

                {/* Posición */}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                  style={{ backgroundColor: posColor + "15", color: posColor }}
                >
                  {p.position}
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
                {canEdit && (
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => { setEditPlayer(p); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-depro-gray-light text-depro-gray hover:text-depro-dark transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-depro-gray hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Jugadores registrados con plan de pago */}
      {regPlayers.length > 0 && (
        <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
          <div
            className="px-5 py-3 border-b border-depro-border flex items-center justify-between gap-2"
            style={{ backgroundColor: sa + "08" }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={14} style={{ color: sa }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: sa }}>
                Jugadores con plan individual ({regPlayers.length})
              </span>
            </div>
            <span className="text-[10px] text-depro-gray flex items-center gap-1">
              <TrendingUp size={10} /> Clic para ver estadísticas
            </span>
          </div>
          {regPlayers.map((p) => {
            const teamName = allTeams.find((t) => t.id === p._teamId)?.name || myTeam?.name || "—";
            return (
              <div
                key={p.id}
                onClick={() => setStatsPlayer(p)}
                className="flex items-center gap-3 px-5 py-4 border-b border-depro-border last:border-b-0 hover:bg-depro-gray-light/40 transition-colors cursor-pointer group"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: sa + "15", color: sa }}
                >
                  {(p.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-depro-dark text-sm">{p.name}</div>
                  <div className="text-xs text-depro-gray">{teamName}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#22C55E15", color: "#16A34A" }}
                >
                  {p.plan || "Plan activo"}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border"
                  style={{ borderColor: sa + "40", color: sa }}
                >
                  Registrado
                </span>
                <ChevronRight size={14} className="text-depro-gray group-hover:text-depro-dark transition-colors flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal estadísticas jugador registrado */}
      {statsPlayer && (
        <PlayerStatsModal
          player={statsPlayer}
          onClose={() => setStatsPlayer(null)}
          sa={sa}
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
