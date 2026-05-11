import { useState } from "react";
import { Search, Filter, Clock, Play, ArrowRight, BarChart3, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sessionLibrary } from "../../data/mockData";

const TYPES = ["Todos", "Technical", "Physical", "Tactical", "Recovery"];
const INTENSITIES = ["Todos", "Low", "Medium", "High", "Maximum"];
const intensityColor = { Low: "#3BC21D", Medium: "#F6CC12", High: "#FB2C39", Maximum: "#dc2626" };
const typeColor = { Technical: "#0A36F7", Physical: "#F6CC12", Recovery: "#3BC21D", Tactical: "#a855f7" };

export default function SessionLibraryPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";
  const [q, setQ] = useState("");
  const [type, setType] = useState("Todos");
  const [intensity, setIntensity] = useState("Todos");

  const filtered = sessionLibrary.filter((s) => {
    const matchQ = s.title.toLowerCase().includes(q.toLowerCase()) || s.objective.toLowerCase().includes(q.toLowerCase());
    const matchT = type === "Todos" || s.type === type;
    const matchI = intensity === "Todos" || s.intensity === intensity;
    return matchQ && matchT && matchI;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Biblioteca de Sesiones</h1>
        <p className="text-depro-gray text-sm">Explora todas las sesiones disponibles</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-depro-border rounded-2xl p-4 mb-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar sesiones..."
              className="admin-input w-full pl-10" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-depro-gray flex-shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    type === t ? "border-depro-blue text-depro-blue bg-depro-blue-light" : "border-depro-border text-depro-gray hover:border-depro-blue/40"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-depro-gray mb-5">{filtered.length} sesiones encontradas</div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const tc = typeColor[s.type] || accent;
          const ic = intensityColor[s.intensity] || "#888";
          return (
            <div key={s.id} className="card group hover:shadow-card-hover cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: tc + "15", color: tc }}>{s.type}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: ic + "15", color: ic }}>{s.intensity}</span>
              </div>
              <h3 className="font-bold text-depro-dark mb-1 group-hover:text-depro-blue transition-colors">{s.title}</h3>
              <p className="text-sm text-depro-gray mb-4 leading-relaxed line-clamp-2">{s.objective}</p>
              <div className="flex items-center gap-4 text-xs text-depro-gray mb-4 border-t border-depro-border pt-3">
                <span className="flex items-center gap-1"><Clock size={12} /> {s.duration}</span>
                <span className="flex items-center gap-1"><Play size={12} /> {s.exercises} ejercicios</span>
                {s.players && <span className="flex items-center gap-1"><Users size={12} /> {s.players}</span>}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-all">
                Ver sesión <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <BarChart3 size={32} className="text-depro-border mx-auto mb-3" />
            <p className="text-depro-gray font-medium">No se encontraron sesiones con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
