import { useEffect, useState } from "react";
import {
  Activity, Flame, Zap, Dumbbell, ChevronDown, Check, ListChecks,
  Maximize2, Repeat2, Clock, Users, Route, Target, TrendingUp, Timer, Sun, Wind, ShieldCheck,
} from "lucide-react";
import {
  normalizeTaskDesigner, resolveTaskTypes, resolveTaskParams,
  resolveTaskCues, resolveTaskRecommendations,
} from "../../lib/taskDesigner";

export const SESSION_FRAMEWORK_UI = {
  A: { label: "Extensiva", color: "#3B82F6", bg: "#EFF6FF", Icon: Activity },
  B: { label: "Intensiva", color: "#F59E0B", bg: "#FFFBEB", Icon: Flame },
  C: { label: "Reactiva", color: "#EF4444", bg: "#FEF2F2", Icon: Zap },
  D: { label: "Complementaria", color: "#10B981", bg: "#F0FDF4", Icon: Dumbbell },
};

export const FRAMEWORK_TO_SESSION_TEXT = {
  A: "extensiva",
  B: "intensiva",
  C: "reactiva",
  D: "extensiva",
};

const REC_ICONS = [
  Maximize2, Repeat2, Clock, Users, Route, Zap, Target, TrendingUp,
  Timer, Activity, Sun, Dumbbell, Wind, ShieldCheck,
];

function loadSelectedTasks(storageKey, taskTypes) {
  const fallback = taskTypes[0] ? [taskTypes[0]] : [];
  if (!storageKey) return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (Array.isArray(data.tasks) && data.tasks.length) {
      return data.tasks.filter((t) => taskTypes.includes(t));
    }
    if (data.task && taskTypes.includes(data.task)) return [data.task];
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Diseñador de tareas de la planificación manual (A/B/C/D).
 * Misma UI para clubs y ProCoach.
 */
export default function DisenarTareas({ accentColor, sessionType = "A", storageKey, taskDesigner }) {
  const td = normalizeTaskDesigner(taskDesigner);
  const taskTypes = resolveTaskTypes(td);
  const [dropOpen, setDropOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(() => loadSelectedTasks(storageKey, taskTypes));

  useEffect(() => {
    setSelectedTasks((prev) => {
      const valid = prev.filter((t) => taskTypes.includes(t));
      if (valid.length) return valid;
      return taskTypes[0] ? [taskTypes[0]] : [];
    });
  }, [taskTypes.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ tasks: selectedTasks, sessionType, savedAt: Date.now() }));
    } catch {
      /* cupo lleno: no tumbar el diseñador */
    }
  }, [selectedTasks, storageKey, sessionType]);

  const toggleTask = (t) => {
    setSelectedTasks((prev) => {
      if (prev.includes(t)) {
        const next = prev.filter((x) => x !== t);
        return next.length ? next : prev;
      }
      return [...prev, t];
    });
  };

  const st = SESSION_FRAMEWORK_UI[sessionType] || SESSION_FRAMEWORK_UI.A;
  const StIcon = st.Icon;
  const params = resolveTaskParams(td, sessionType);
  const recTexts = resolveTaskRecommendations(td, sessionType);

  return (
    <div className="space-y-5">
      <div className="relative">
        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2 block">
          Tipo de tarea
        </label>
        <button
          type="button"
          onClick={() => setDropOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-depro-gray-light border border-depro-border rounded-xl text-sm font-semibold text-depro-dark hover:bg-depro-gray-light/70 transition-colors"
        >
          <span className="truncate text-left">
            {selectedTasks.length === 1
              ? selectedTasks[0]
              : `${selectedTasks.length} tareas seleccionadas`}
          </span>
          <ChevronDown size={14} className={`text-depro-gray transition-transform flex-shrink-0 ml-2 ${dropOpen ? "rotate-180" : ""}`} />
        </button>
        {dropOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-depro-border rounded-xl shadow-card-hover z-20 max-h-60 overflow-y-auto">
            {taskTypes.map((t) => {
              const checked = selectedTasks.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTask(t)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 ${
                    checked ? "font-bold text-depro-blue bg-depro-blue-light/50" : "text-depro-dark hover:bg-depro-gray-light"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    checked ? "bg-depro-blue border-depro-blue" : "border-depro-border bg-white"
                  }`}>
                    {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  {t}
                </button>
              );
            })}
          </div>
        )}
        {selectedTasks.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedTasks.map((t) => (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: st.color + "15", color: st.color }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="w-full rounded-2xl p-8 flex flex-col items-center justify-center border"
        style={{ background: `linear-gradient(135deg, ${st.bg} 0%, ${st.color}18 100%)`, borderColor: st.color + "30" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border"
          style={{ backgroundColor: st.color + "20", borderColor: st.color + "30" }}>
          <StIcon size={30} style={{ color: st.color }} />
        </div>
        {selectedTasks.length === 1 ? (
          <div className="text-2xl font-black text-center" style={{ color: st.color }}>{selectedTasks[0]}</div>
        ) : (
          <div className="text-lg font-black text-center leading-snug" style={{ color: st.color }}>
            {selectedTasks.join(" · ")}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-depro-gray mt-1.5">
          <StIcon size={10} style={{ color: st.color }} /> Sesión {st.label}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ backgroundColor: st.color + "15", color: st.color }}>
            Parámetros para Sesión {st.label}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { label: "Espacio", value: params.space, icon: "📐" },
            { label: "Agrupación", value: params.grouping, icon: "👥" },
            { label: "Balones", value: params.balls, icon: "⚽" },
            { label: "Trabajo", value: params.work, icon: "⏱️" },
            { label: "Descanso", value: params.rest, icon: "🛑" },
            { label: "Intensidad", value: params.intensity, icon: "🔋" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-depro-gray-light rounded-xl p-3 border border-depro-border">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
              <div className="text-xs font-black text-depro-dark mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedTasks.map((taskName) => {
        const cues = resolveTaskCues(td, taskName, sessionType);
        return (
          <div key={taskName} className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: st.color + "08", border: `1px solid ${st.color}20` }}>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: st.color }}>
              💬 Consignas · {taskName}
            </div>
            {cues.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: st.color + "20", color: st.color }}>{i + 1}</span>
                <span className="text-xs text-depro-dark leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        );
      })}

      <div className="bg-depro-gray-light rounded-2xl p-4 border border-depro-border">
        <div className="flex items-center gap-1.5 text-xs font-bold text-depro-dark mb-3">
          <ListChecks size={13} style={{ color: accentColor || st.color }} /> Recomendaciones del día · Sesión {st.label}
        </div>
        <div className="space-y-2.5">
          {recTexts.map((text, i) => {
            const RIcon = REC_ICONS[i % REC_ICONS.length];
            return (
              <div key={i} className="flex items-center gap-2.5 text-xs text-depro-dark">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: st.color + "15" }}>
                  <RIcon size={11} style={{ color: st.color }} />
                </div>
                <span className="leading-snug">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
