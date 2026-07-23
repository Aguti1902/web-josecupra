import { useState } from "react";
import { Play, FileText, Search, ChevronRight, Target } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { technicalContent } from "../../data/mockData";

const CATS = ["Todos", "Passing", "Control", "Finishing", "Dribbling", "Defending"];

export default function TechniquePage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const [level, setLevel] = useState("Todos");

  const filtered = technicalContent.filter((c) => {
    const matchQ = c.title.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "Todos" || c.category === cat;
    const matchL = level === "Todos" || c.level === level;
    return matchQ && matchC && matchL;
  });

  return (
    <div className="dash-page">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Técnica Individual</h1>
        <p className="text-depro-gray text-sm">Vídeos técnicos + explicaciones del preparador</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-depro-border rounded-2xl p-4 mb-6 shadow-card space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar drills técnicos..."
            className="admin-input w-full pl-10" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                cat === c ? "border-depro-blue text-depro-blue bg-depro-blue-light" : "border-depro-border text-depro-gray hover:border-depro-blue/40"
              }`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {["Todos", "Beginner", "Intermediate", "Advanced"].map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                level === l ? "border-depro-red text-depro-red bg-depro-red-light" : "border-depro-border text-depro-gray hover:border-depro-red/40"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="card group hover:shadow-card-hover cursor-pointer transition-all">
            <div className="aspect-video bg-depro-gray-light rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
                  <Play size={20} className="text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-depro-dark/80 text-white text-xs px-2 py-0.5 rounded-md font-medium">{item.level}</span>
                <span className="bg-white/90 text-depro-dark text-xs px-2 py-0.5 rounded-md font-medium">{item.category}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + "15" }}>
                <Target size={15} style={{ color: accent }} />
              </div>
              <div>
                <h3 className="font-bold text-depro-dark text-sm group-hover:text-depro-blue transition-colors">{item.title}</h3>
                <p className="text-xs text-depro-gray mt-0.5 line-clamp-2">{item.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: accent }}>
                <Play size={12} /> Ver vídeo
              </button>
              {item.hasPdf && (
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-all">
                  <FileText size={12} /> PDF
                </button>
              )}
              <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-all">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Target size={32} className="text-depro-border mx-auto mb-3" />
            <p className="text-depro-gray font-medium">No se encontraron drills con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
