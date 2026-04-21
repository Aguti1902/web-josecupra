import { useState } from "react";
import { Activity, Play, FileText, CheckCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { physicalContent } from "../../data/mockData";

const categories = ["All", "Speed", "Coordination", "Prevention"];

const catColor = {
  Speed: "#ef4444",
  Coordination: "#f59e0b",
  Prevention: "#22c55e",
};

const levelColor = {
  Foundation: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

function VideoModal({ item, onClose, accent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-xl w-full shadow-2xl animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: catColor[item.category] + "20", color: catColor[item.category] }}
          >
            {item.category}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: levelColor[item.level] + "20", color: levelColor[item.level] }}
          >
            {item.level}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-gray-400 mb-5">{item.duration} module</p>

        <div className="aspect-video bg-gray-800 rounded-2xl mb-5 flex items-center justify-center border border-white/5 cursor-pointer hover:border-pitch-500/30 transition-colors group">
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: catColor[item.category] + "20" }}
            >
              <Play size={24} style={{ color: catColor[item.category] }} />
            </div>
            <p className="text-xs text-gray-500">Click to play</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-5">{item.description}</p>

        <div className="mb-5">
          <h4 className="text-sm font-bold text-white mb-3">Key Points</h4>
          <div className="space-y-2">
            {item.keyPoints.map((kp, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle size={14} style={{ color: accent }} className="flex-shrink-0" />
                {kp}
              </div>
            ))}
          </div>
        </div>

        {item.hasPdf && (
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-white/5">
            <FileText size={15} />
            Download PDF Guide
          </button>
        )}
      </div>
    </div>
  );
}

export default function PhysicalPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0ea5e9";
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = physicalContent.filter(
    (t) => catFilter === "All" || t.category === catFilter
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Activity size={20} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Physical Preparation</h1>
        </div>
        <p className="text-gray-400 text-sm">Speed · Coordination · Injury Prevention</p>
      </div>

      {/* Category overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { cat: "Speed", desc: "Acceleration, max velocity & change of direction", icon: "⚡", color: catColor.Speed, count: physicalContent.filter(p => p.category === "Speed").length },
          { cat: "Coordination", desc: "Agility ladder, footwork & neuromuscular training", icon: "🎯", color: catColor.Coordination, count: physicalContent.filter(p => p.category === "Coordination").length },
          { cat: "Prevention", desc: "Injury prevention protocols & mobility", icon: "🛡️", color: catColor.Prevention, count: physicalContent.filter(p => p.category === "Prevention").length },
        ].map((c) => (
          <button
            key={c.cat}
            onClick={() => setCatFilter(catFilter === c.cat ? "All" : c.cat)}
            className={`card text-left hover:scale-[1.02] transition-transform border ${
              catFilter === c.cat ? "border-opacity-50" : ""
            }`}
            style={catFilter === c.cat ? { borderColor: c.color + "50", backgroundColor: c.color + "08" } : {}}
          >
            <div className="text-2xl mb-3">{c.icon}</div>
            <div className="font-bold text-white text-sm mb-1">{c.cat}</div>
            <div className="text-xs text-gray-500 leading-relaxed hidden sm:block">{c.desc}</div>
            <div className="text-xs font-semibold mt-2" style={{ color: c.color }}>
              {c.count} modules
            </div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              catFilter === c
                ? "text-white border-transparent"
                : "border-white/10 text-gray-400 hover:text-white bg-gray-900/50"
            }`}
            style={catFilter === c ? { backgroundColor: catColor[c] || accent, borderColor: catColor[c] || accent } : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const color = catColor[item.category] || accent;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="card text-left group hover:scale-[1.02] transition-transform"
            >
              <div className="aspect-video bg-gray-800 rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-yellow-500/20 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: color + "20" }}
                >
                  <Play size={18} style={{ color }} />
                </div>
              </div>

              <div className="flex gap-1.5 mb-3">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: color + "20", color }}
                >
                  {item.category}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: levelColor[item.level] + "20",
                    color: levelColor[item.level],
                  }}
                >
                  {item.level}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Play size={11} />{item.duration}</span>
                {item.hasPdf && <span className="flex items-center gap-1"><FileText size={11} />PDF</span>}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <VideoModal item={selected} onClose={() => setSelected(null)} accent={accent} />
      )}
    </div>
  );
}
