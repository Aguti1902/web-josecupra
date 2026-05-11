import { useState } from "react";
import { Play, Clock, Zap, Shield, Activity, Timer, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { physicalContent } from "../../data/mockData";

const CATS = [
  { id: "Todos", label: "Todos", icon: Activity },
  { id: "Speed", label: "Velocidad", icon: Zap },
  { id: "Coordination", label: "Coordinación", icon: Timer },
  { id: "Prevention", label: "Prevención", icon: Shield },
  { id: "Strength", label: "Fuerza", icon: Activity },
];

const catColor = { Speed: "#FB2C39", Coordination: "#0A36F7", Prevention: "#3BC21D", Strength: "#F6CC12" };

export default function PhysicalPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  const filtered = physicalContent.filter((c) => {
    const matchQ = c.title.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "Todos" || c.category === cat;
    return matchQ && matchC;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Preparación Física</h1>
        <p className="text-depro-gray text-sm">Velocidad, coordinación y prevención de lesiones</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATS.map((c) => {
          const color = catColor[c.id] || accent;
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all flex-shrink-0 ${
                active ? "text-white border-transparent shadow-sm" : "border-depro-border bg-white text-depro-gray hover:border-depro-blue/40"
              }`}
              style={active ? { backgroundColor: color, borderColor: color } : {}}
            >
              <c.icon size={15} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicios físicos..."
          className="admin-input w-full pl-10 max-w-md" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const color = catColor[item.category] || accent;
          return (
            <div key={item.id} className="card group hover:shadow-card-hover cursor-pointer transition-all overflow-hidden">
              <div className="h-1 rounded-full -mt-6 -mx-6 mb-5" style={{ backgroundColor: color }} />
              <div className="aspect-video bg-depro-gray-light rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                    <Play size={20} className="text-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: color }}>
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-depro-dark mb-1 group-hover:text-depro-blue transition-colors">{item.title}</h3>
              <p className="text-sm text-depro-gray mb-3 leading-relaxed line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-3 text-xs text-depro-gray mb-4">
                <span className="flex items-center gap-1"><Clock size={12} />{item.duration}</span>
                <span className="flex items-center gap-1"><Activity size={12} />{item.intensity}</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
                <Play size={14} /> Ver ejercicio
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Activity size={32} className="text-depro-border mx-auto mb-3" />
            <p className="text-depro-gray font-medium">No se encontraron ejercicios</p>
          </div>
        )}
      </div>
    </div>
  );
}
