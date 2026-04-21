import { useState } from "react";
import {
  Clock,
  Flame,
  CheckCircle,
  Play,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Target,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { weeklyPlan } from "../../data/mockData";

const intensityColor = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
  Maximum: "#dc2626",
};

const typeColor = {
  Technical: "#0ea5e9",
  Physical: "#f59e0b",
  Recovery: "#22c55e",
  Tactical: "#a855f7",
  Match: "#ef4444",
};

function ExerciseModal({ exercise, onClose, accent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-1">{exercise.name}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-5">
          <span className="flex items-center gap-1"><Clock size={13} />{exercise.duration}</span>
          <span>·</span>
          <span>{exercise.sets} sets</span>
          <span>·</span>
          <span>{exercise.reps}</span>
        </div>

        {/* Video placeholder */}
        <div className="aspect-video bg-gray-800 rounded-2xl mb-5 flex items-center justify-center border border-white/5 group cursor-pointer hover:border-brand-500/30 transition-colors">
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: accent + "20" }}
            >
              <Play size={24} style={{ color: accent }} />
            </div>
            <p className="text-xs text-gray-500">Click to play video</p>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-5 text-sm">{exercise.description}</p>

        <div
          className="rounded-xl p-4 border text-sm mb-5"
          style={{ backgroundColor: accent + "10", borderColor: accent + "25" }}
        >
          <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
            <Target size={14} style={{ color: accent }} />
            Coaching tips
          </div>
          <p className="text-gray-300">{exercise.tips}</p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
          >
            <FileText size={15} />
            Download PDF
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            <CheckCircle size={15} />
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, accentColor }) {
  const [expanded, setExpanded] = useState(session.status === "today");
  const [selectedEx, setSelectedEx] = useState(null);
  const color = typeColor[session.type] || accentColor;

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${
        session.status === "today"
          ? "border-brand-500/30 bg-brand-500/5"
          : "border-white/10 bg-gray-900/50"
      }`}
    >
      {/* Session header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + "20" }}
        >
          {session.status === "completed" ? (
            <CheckCircle size={20} style={{ color: "#22c55e" }} />
          ) : session.status === "today" ? (
            <Flame size={20} style={{ color }} />
          ) : (
            <Play size={20} style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + "20", color }}
            >
              {session.type}
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
            {session.status === "completed" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pitch-500/20 text-pitch-400">
                ✓ Done
              </span>
            )}
            {session.status === "today" && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor + "25", color: accentColor }}
              >
                TODAY
              </span>
            )}
          </div>
          <div className="text-white font-semibold text-sm">{session.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{session.objective}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-gray-400 text-sm">
          <span className="flex items-center gap-1 text-xs">
            <Clock size={12} /> {session.duration}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Exercises */}
      {expanded && session.exercises.length > 0 && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="pt-4 space-y-2">
            {session.exercises.map((ex, i) => (
              <button
                key={i}
                onClick={() => setSelectedEx(ex)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 border border-white/5 hover:border-white/15 transition-all text-left group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: color + "20", color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{ex.name}</div>
                  <div className="text-xs text-gray-500">{ex.duration} · {ex.sets} sets · {ex.reps}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Video size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">View</span>
                </div>
              </button>
            ))}
          </div>

          {session.status === "today" && (
            <button
              className="mt-4 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCircle size={16} />
              Mark Session Complete
            </button>
          )}
        </div>
      )}

      {/* Exercise modal */}
      {selectedEx && (
        <ExerciseModal
          exercise={selectedEx}
          onClose={() => setSelectedEx(null)}
          accent={accentColor}
        />
      )}
    </div>
  );
}

export default function WeeklyPlanPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0ea5e9";
  const [selectedDay, setSelectedDay] = useState(
    weeklyPlan.findIndex((d) => d.sessions.some((s) => s.status === "today")) || 0
  );

  const day = weeklyPlan[selectedDay];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Weekly Plan</h1>
        <p className="text-gray-400 text-sm">Week of Apr 21 — Apr 27, 2025</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {weeklyPlan.map((d, i) => {
          const s = d.sessions[0];
          const isToday = s?.status === "today";
          const isDone = s?.status === "completed";
          const isRest = d.sessions.length === 0;
          const isSelected = selectedDay === i;

          return (
            <button
              key={d.shortDay}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${
                isSelected
                  ? "text-white border-transparent"
                  : "border-white/10 text-gray-400 hover:text-white hover:border-white/20 bg-gray-900/50"
              }`}
              style={isSelected ? { backgroundColor: accent + "20", borderColor: accent + "50" } : {}}
            >
              <span className="text-xs font-bold">{d.shortDay}</span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isDone ? "bg-pitch-500 text-white" : isRest ? "bg-gray-800/50 text-gray-700" : ""
                }`}
                style={
                  isToday ? { backgroundColor: accent, color: "#fff" } :
                  isSelected && !isDone && !isRest ? { backgroundColor: accent + "25", color: accent } : {}
                }
              >
                {isDone ? "✓" : isToday ? "▶" : isRest ? "–" : d.date.split(" ")[1]}
              </div>
              <span className="text-xs">{d.date.split(" ")[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold text-white">{day.day}</h2>
          <span className="text-sm text-gray-500">{day.date}</span>
          {day.sessions.length === 0 && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-800 text-gray-500">
              Rest Day
            </span>
          )}
        </div>

        {day.sessions.length > 0 ? (
          <div className="space-y-4">
            {day.sessions.map((session) => (
              <SessionCard key={session.id} session={session} accentColor={accent} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">😴</div>
            <h3 className="text-lg font-semibold text-white mb-2">Rest Day</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Recovery is part of the plan. Let your body adapt and grow stronger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
