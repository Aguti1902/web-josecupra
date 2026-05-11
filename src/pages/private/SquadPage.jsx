import { useMemo, useState } from "react";
import { Users, Search, Lock, Filter } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubSquad } from "../../data/mockData";

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

const FILTERS = ["Todos", "Portero", "Defensa", "Lateral", "Pivote", "Centro", "Mediapunta", "Extremo", "Delantero"];

export default function SquadPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";
  const isCoordinator = user?.teamRole === "coordinador" || !user?.team;
  const userTeamId = user?.team?.id ?? null;

  // Coordinador ve todos los equipos; entrenador solo su equipo
  const baseSquad = isCoordinator
    ? clubSquad
    : clubSquad.filter((p) => p.teamId === userTeamId);

  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("todos");

  // Equipos únicos presentes en la plantilla (solo para coordinador)
  const teams = useMemo(() => {
    const names = [...new Set(clubSquad.map((p) => p.teamName).filter(Boolean))];
    return names;
  }, []);

  const filtered = useMemo(() => {
    return baseSquad.filter((p) => {
      const passesFilter = filter === "Todos" || p.position === filter;
      const passesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const passesTeam = !isCoordinator || teamFilter === "todos" || p.teamName === teamFilter;
      return passesFilter && passesSearch && passesTeam;
    });
  }, [filter, search, teamFilter, baseSquad, isCoordinator]);

  const stats = useMemo(() => {
    const src = filtered.length > 0 ? filtered : baseSquad;
    const avgAge = Math.round(src.reduce((a, p) => a + p.age, 0) / Math.max(src.length, 1));
    const avgWeight = Math.round(src.reduce((a, p) => a + p.weight, 0) / Math.max(src.length, 1));
    return { total: src.length, avgAge, avgWeight };
  }, [filtered, baseSquad]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
            <Users size={14} className="text-depro-blue" />
            {isCoordinator ? "Coordinador · Todos los equipos" : `Entrenador · ${user?.team?.name}`}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Plantilla</h1>
          <p className="text-depro-gray text-sm">
            {isCoordinator
              ? `${baseSquad.length} jugadores en ${teams.length} equipos`
              : `Registro básico · ${baseSquad.length} jugadores`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-depro-gray bg-depro-gray-light border border-depro-border rounded-xl px-3 py-2">
          <Lock size={12} /> Solo lectura · El admin gestiona el contenido
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Jugadores", value: stats.total },
          { label: "Edad media", value: `${stats.avgAge} años` },
          { label: "Peso medio", value: `${stats.avgWeight} kg` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-depro-border rounded-2xl p-4 shadow-card">
            <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{s.label}</div>
            <div className="text-xl font-black text-depro-dark mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-depro-border rounded-2xl p-4 mb-4 shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            className="admin-input w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={14} className="text-depro-gray flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                filter === f
                  ? "bg-depro-blue border-depro-blue text-white"
                  : "bg-white border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-blue/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Filtro de equipo — solo coordinador */}
        {isCoordinator && (
          <div className="flex items-center gap-2 overflow-x-auto mt-2">
            <Users size={14} className="text-depro-gray flex-shrink-0" />
            {["todos", ...teams].map((t) => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all capitalize ${
                  teamFilter === t
                    ? "bg-depro-dark border-depro-dark text-white"
                    : "bg-white border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-dark/40"
                }`}
              >
                {t === "todos" ? "Todos los equipos" : t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de jugadores */}
      <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-depro-border bg-depro-gray-light/50 text-[10px] font-bold text-depro-gray uppercase tracking-wide">
          <div className="col-span-1">Nº</div>
          <div className="col-span-4">Jugador</div>
          <div className="col-span-2">Posición</div>
          <div className="col-span-1 text-center">Edad</div>
          <div className="col-span-1 text-center">Peso</div>
          {isCoordinator && <div className="col-span-1 text-center">Equipo</div>}
          <div className={isCoordinator ? "col-span-2" : "col-span-3"}>Observaciones</div>
        </div>

        {filtered.map((p) => {
          const posColor = POSITION_COLORS[p.position] || accent;
          return (
            <div
              key={p.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-depro-border last:border-b-0 hover:bg-depro-gray-light/40 transition-colors"
            >
              <div className="md:col-span-1 flex items-center gap-2">
                <span className="md:hidden text-[10px] font-bold text-depro-gray uppercase tracking-wide">Nº</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: accent + "15", color: accent }}>
                  {p.number}
                </div>
              </div>

              <div className="md:col-span-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: posColor + "20", color: posColor }}
                >
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-depro-dark text-sm truncate">{p.name}</div>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: posColor + "15", color: posColor }}>
                  {p.position}
                </span>
              </div>

              <div className="md:col-span-1 flex md:justify-center items-center gap-2">
                <span className="md:hidden text-[10px] font-bold text-depro-gray uppercase tracking-wide">Edad</span>
                <span className="text-sm font-semibold text-depro-dark">{p.age}</span>
              </div>

              <div className="md:col-span-1 flex md:justify-center items-center gap-2">
                <span className="md:hidden text-[10px] font-bold text-depro-gray uppercase tracking-wide">Peso</span>
                <span className="text-sm font-semibold text-depro-dark">{p.weight} kg</span>
              </div>

              {isCoordinator && (
                <div className="md:col-span-1 flex md:justify-center items-center">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue">{p.teamName}</span>
                </div>
              )}

              <div className={`${isCoordinator ? "md:col-span-2" : "md:col-span-3"} flex items-center`}>
                <p className="text-xs text-depro-gray leading-snug">{p.notes}</p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-depro-gray text-sm">No hay jugadores que coincidan con la búsqueda.</div>
        )}
      </div>
    </div>
  );
}
