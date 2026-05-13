import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Trash2, Edit3, X, Save,
  Filter, UserPlus, Shield, CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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

// ── Storage helpers ─────────────────────────────────────────
function squadKey(clubId, teamId) {
  return `depro_squad_${clubId}_${teamId}`;
}
function loadSquad(clubId, teamId) {
  try { return JSON.parse(localStorage.getItem(squadKey(clubId, teamId)) || "[]"); }
  catch { return []; }
}
function saveSquad(clubId, teamId, players) {
  localStorage.setItem(squadKey(clubId, teamId), JSON.stringify(players));
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

// ════════════════════════════════════════════════════════════
// SQUAD PAGE
// ════════════════════════════════════════════════════════════
export default function SquadPage() {
  const { user } = useAuth();

  const club      = user?.club;
  const teamRole  = user?.team_role;
  const clubId    = club?.id;
  const isCoord   = teamRole === "coordinador";
  const canEdit   = !isCoord;

  const rawAccent = club?.primaryColor   || "#0A36F7";
  const rawSec    = club?.secondaryColor || "#ffffff";
  const sa        = safe(rawAccent, safe(rawSec, "#0A36F7"));

  // Todos los equipos del club (para coordinador)
  const allTeams  = club?.teams || [];

  // Resolver equipo del entrenador: user.team directo, o búsqueda por email en los equipos del club
  const myTeam = useMemo(() => {
    if (user?.team) return user.team;
    if (!user?.email || isCoord) return null;
    return allTeams.find(
      (t) => t.coach?.email?.toLowerCase() === user.email?.toLowerCase()
    ) || null;
  }, [user?.team, user?.email, isCoord, allTeams]);

  // ── Estado ────────────────────────────────────────────────
  const [squads, setSquads]         = useState({}); // { teamId: player[] }
  const [regPlayers, setRegPlayers] = useState([]); // jugadores registrados vía Supabase
  const [search, setSearch]         = useState("");
  const [posFilter, setPosFilter]   = useState("Todos");
  const [teamFilter, setTeamFilter] = useState("todos");
  const [showModal, setShowModal]   = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [teamError, setTeamError]   = useState(false);

  // ── Cargar plantillas manuales (localStorage) ─────────────
  useEffect(() => {
    if (!clubId) return;
    const loaded = {};
    const teamsToLoad = isCoord ? allTeams : (myTeam ? [myTeam] : []);
    teamsToLoad.forEach((t) => {
      loaded[t.id] = loadSquad(clubId, t.id);
    });
    setSquads(loaded);
  }, [clubId, isCoord, myTeam, allTeams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cargar jugadores registrados desde Supabase ───────────
  useEffect(() => {
    const teamIds = isCoord
      ? allTeams.map((t) => t.id)
      : myTeam ? [myTeam.id] : [];
    if (teamIds.length === 0) return;

    (async () => {
      try {
        // Intentar API Vercel primero
        const apiUrl = `/api/team-players?teamId=${teamIds[0]}`;
        const res    = await fetch(apiUrl).catch(() => null);
        if (res?.ok) {
          const { players: list } = await res.json();
          if (list?.length > 0) { setRegPlayers(list); return; }
        }
        // Fallback: consultar profiles directamente
        const { data } = await supabase
          .from("profiles")
          .select("id, name, plan, team_id")
          .in("team_id", teamIds);
        if (data?.length > 0) {
          setRegPlayers(data.map((p) => ({
            id:       p.id,
            name:     p.name || "Jugador registrado",
            plan:     p.plan || "—",
            position: "—",
            _teamId:  p.team_id,
            _reg:     true,
          })));
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
            className="px-5 py-3 border-b border-depro-border flex items-center gap-2"
            style={{ backgroundColor: sa + "08" }}
          >
            <CheckCircle size={14} style={{ color: sa }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: sa }}>
              Jugadores con plan individual ({regPlayers.length})
            </span>
          </div>
          {regPlayers.map((p) => {
            const teamName = allTeams.find((t) => t.id === p._teamId)?.name || myTeam?.name || "—";
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 px-5 py-4 border-b border-depro-border last:border-b-0 hover:bg-depro-gray-light/40 transition-colors"
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
              </div>
            );
          })}
        </div>
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
