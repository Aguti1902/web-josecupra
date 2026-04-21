import { useState } from "react";
import { Search, Filter, Clock, Dumbbell, BookOpen, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sessionLibrary } from "../../data/mockData";

const categories = ["All", "Technical", "Physical", "Tactical"];
const intensities = ["All", "Low", "Medium", "High", "Maximum"];
const ages = ["All", "U13-U17", "U15-U21", "U17-Senior", "All Ages"];

const categoryColor = {
  Technical: "#0ea5e9",
  Physical: "#f59e0b",
  Tactical: "#a855f7",
};

const intensityColor = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
  Maximum: "#dc2626",
};

function SessionCard({ session, accent }) {
  const [open, setOpen] = useState(false);
  const color = categoryColor[session.category] || accent;

  return (
    <div className="card hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + "20" }}
        >
          <Dumbbell size={18} style={{ color }} />
        </div>
        <ChevronRight
          size={16}
          className={`text-gray-600 transition-transform mt-1 ${open ? "rotate-90" : ""}`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: color + "20", color }}
        >
          {session.category}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: intensityColor[session.intensity] + "20",
            color: intensityColor[session.intensity],
          }}
        >
          {session.intensity}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {session.age}
        </span>
      </div>

      <h3 className="font-bold text-white mb-1">{session.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{session.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock size={12} />{session.duration}</span>
        <span className="flex items-center gap-1"><Dumbbell size={12} />{session.exercises} exercises</span>
      </div>

      {/* Tags */}
      {open && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {session.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
          <button
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: accent }}
            onClick={(e) => e.stopPropagation()}
          >
            <BookOpen size={15} />
            Add to my plan
          </button>
        </div>
      )}
    </div>
  );
}

export default function SessionLibraryPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0ea5e9";

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [intFilter, setIntFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");

  const filtered = sessionLibrary.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || s.category === catFilter;
    const matchInt = intFilter === "All" || s.intensity === intFilter;
    const matchAge = ageFilter === "All" || s.age === ageFilter || s.age === "All Ages";
    return matchSearch && matchCat && matchInt && matchAge;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Session Library</h1>
        <p className="text-gray-400 text-sm">{sessionLibrary.length} sessions available · filtered by your profile</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-gray-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-gray-500" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                  catFilter === c
                    ? "text-white border-transparent"
                    : "border-white/10 text-gray-400 hover:text-white"
                }`}
                style={catFilter === c ? { backgroundColor: accent, borderColor: accent } : {}}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {intensities.map((i) => (
              <button
                key={i}
                onClick={() => setIntFilter(i)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                  intFilter === i
                    ? "border-transparent text-white"
                    : "border-white/10 text-gray-400 hover:text-white"
                }`}
                style={
                  intFilter === i
                    ? { backgroundColor: intensityColor[i] || accent, borderColor: intensityColor[i] || accent }
                    : {}
                }
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((session) => (
          <SessionCard key={session.id} session={session} accent={accent} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No sessions found</p>
          <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
