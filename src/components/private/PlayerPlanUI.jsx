import { useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle, Clock, Dumbbell, FileText, Flame, Gauge, Info,
  Layers, Pause, Repeat2, Target, Video, Wind, X, RefreshCw,
} from "lucide-react";
import { getSessionBlocks, getNonEmptyBlocks, getTodayName, WEEK_DAYS } from "../../lib/sessionBlocks";
import { getYouTubeId } from "../../lib/youtube";
import { saveLoadLog } from "../../lib/loadLogs";
import {
  loadFieldsForExercise,
  exerciseNeedsWeight,
  blockAllowsLoadLogging,
  objectiveAllowsLoadLogging,
  loadLoggingMode,
  getTipoRegistro,
  isLoadRegistrable,
} from "../../lib/loadAnalytics";
import { canPersistInTrial, trialPersistBlockedMessage } from "../../lib/trialPersistence";
import { hasFeatureAccess } from "../../lib/subscription";

const BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",     Icon: Flame,    color: "#F59E0B" },
  principal:      { label: "Bloque principal",  Icon: Dumbbell, color: "#3B82F6" },
  complementario: { label: "Complementario",    Icon: Target,   color: "#8B5CF6" },
  core:           { label: "Core",              Icon: Gauge,    color: "#EC4899" },
  vuelta_calma:   { label: "Vuelta a la calma", Icon: Wind,     color: "#10B981" },
};

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  } catch { return 0; }
}
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function ConditionPill({ Icon, label, color = "#6B7280" }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-depro-gray bg-depro-gray-light rounded-md px-2 py-1">
      <Icon size={11} style={{ color }} />
      {label}
    </span>
  );
}

function parseSetCount(exercise) {
  const n = parseInt(String(exercise?.sets ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 8) : 3;
}

function ExerciseModal({ exercise, onClose, accent, user, sessionMeta, objective, blockType, onSwap, canSwap }) {
  const ytId = getYouTubeId(exercise.videoUrl);
  const typedExercise = {
    ...exercise,
    blockType,
    carpeta: exercise.carpeta,
    etiquetas: exercise.etiquetas || {
      objetivo: objective ? [String(objective).toLowerCase()] : [],
      rol: exercise.slotConstraints?.rol,
    },
  };
  const tipoRegistro = getTipoRegistro(typedExercise);
  const showLogging = blockAllowsLoadLogging(blockType)
    && isLoadRegistrable(typedExercise)
    && objectiveAllowsLoadLogging(objective)
    && (blockType === "principal" || blockType === "complementario");
  const mode = loadLoggingMode(objective, typedExercise);
  const fields = loadFieldsForExercise(typedExercise, objective).filter((f) => f !== "completed");
  const needsWeight = tipoRegistro === "fuerza" || exerciseNeedsWeight(exercise);
  const setCount = parseSetCount(exercise);
  const [series, setSeries] = useState(() =>
    Array.from({ length: setCount }, () => ({ weight: "", reps: "", rpe: "", rest: "" })),
  );
  const [loadDraft, setLoadDraft] = useState({});
  const [loadSaved, setLoadSaved] = useState(false);
  const [loadNotice, setLoadNotice] = useState("");

  const handleSaveLoad = () => {
    if (!canPersistInTrial(user, "save_loads")) {
      setLoadNotice(trialPersistBlockedMessage());
      return;
    }
    if (!hasFeatureAccess(user, "cargas") && !canPersistInTrial(user, "save_loads")) {
      setLoadNotice("Activa el extra «Registro de cargas» en Suscripción para guardar todos los datos.");
      return;
    }
    const payload = {
      exerciseId: exercise.id,
      exerciseName: exercise.name || exercise.nombre,
      sessionId: sessionMeta?.sessionId,
      sessionTitle: sessionMeta?.sessionTitle,
      weekLabel: sessionMeta?.weekLabel || new Date().toISOString().slice(0, 10),
      objective,
      blockType,
      tipoRegistro,
      carpeta: exercise.carpeta || null,
      rol: exercise.slotConstraints?.rol || exercise.etiquetas?.rol || null,
      ...loadDraft,
    };
    if (mode === "fuerza_series") {
      payload.sets = String(setCount);
      payload.series = series;
      const filled = series.filter((s) => s.weight || s.reps);
      if (filled.length) {
        payload.weight = filled.map((s) => s.weight).filter(Boolean).join(" / ");
        payload.reps = filled.map((s) => s.reps).filter(Boolean).join(" / ");
        payload.rpe = filled.map((s) => s.rpe).filter(Boolean).join(" / ");
        payload.rest = filled.map((s) => s.rest).filter(Boolean).join(" / ") || loadDraft.rest || "";
      }
    }
    saveLoadLog(user?.id, payload);
    setLoadSaved(true);
    setLoadNotice("");
  };

  const fieldLabels = {
    weight: "Peso (kg)",
    sets: "Series",
    reps: "Repeticiones",
    rest: "Descanso",
    rpe: "RPE / RP",
    time: "Tiempo",
    distance: "Metros / distancia",
    heartRate: "FC (ppm)",
    intensity: "Zona / intensidad",
    feelings: "Sensaciones",
    notes: "Observaciones",
  };
  const loadPrescription = exercise.load || exercise.weight || exercise.peso || null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-depro-border rounded-3xl p-6 max-w-lg w-full shadow-card-hover animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-depro-gray hover:text-depro-dark transition-colors p-1">
          <X size={20} />
        </button>
        <h3 className="text-xl font-black text-depro-dark mb-1">{exercise.name}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <ConditionPill Icon={Clock} label={exercise.duration} color={accent} />
          {exercise.sets && <ConditionPill Icon={Gauge} label={`${exercise.sets} series`} />}
          {exercise.reps && <ConditionPill Icon={Repeat2} label={exercise.reps} />}
          {loadPrescription && <ConditionPill Icon={Dumbbell} label={`Carga: ${loadPrescription}`} color={accent} />}
          {exercise.rest && <ConditionPill Icon={Pause} label={`Descanso: ${exercise.rest}`} />}
        </div>
        {ytId ? (
          <div className="rounded-2xl overflow-hidden mb-5 border border-depro-border">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
            />
          </div>
        ) : (
          <div className="aspect-video bg-depro-gray-light rounded-2xl mb-5 flex items-center justify-center border border-dashed border-depro-border">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: accent + "15" }}>
                <Video size={24} style={{ color: accent }} className="opacity-50" />
              </div>
              <p className="text-xs text-depro-gray">Sin vídeo disponible</p>
            </div>
          </div>
        )}
        {exercise.description && (
          <p className="text-depro-gray leading-relaxed mb-5 text-sm">{exercise.description}</p>
        )}
        {exercise.tips && (
          <div className="rounded-xl p-4 border mb-4" style={{ backgroundColor: accent + "08", borderColor: accent + "20" }}>
            <div className="font-bold text-depro-dark mb-3 flex items-center gap-1.5 text-sm">
              <Target size={14} style={{ color: accent }} /> Consejos técnicos
            </div>
            {Array.isArray(exercise.tips) ? (
              <ul className="space-y-1.5">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-depro-gray">
                    <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: accent + "20", color: accent }}>{i + 1}</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-depro-gray leading-relaxed">{exercise.tips}</p>
            )}
          </div>
        )}

        {showLogging && (
          <div className="rounded-xl border border-depro-border p-4 mb-4 space-y-3">
            <div className="text-sm font-bold text-depro-dark">
              {mode === "fuerza_series" ? "Registro por series" : mode === "velocidad" ? "Registro de velocidad" : "Registro de resistencia"}
            </div>
            <p className="text-[11px] text-depro-gray -mt-1">
              {mode === "fuerza_series"
                ? "Anota peso, repeticiones y RPE/RP de cada serie."
                : mode === "velocidad"
                  ? "Anota tiempo y RPE/RP. Sin campo de peso."
                  : "Anota distancia, tiempo y RPE según el ejercicio."}
            </p>

            {mode === "fuerza_series" ? (
              <div className="space-y-2">
                {series.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <p className="text-[10px] font-bold text-depro-gray uppercase col-span-4 sm:col-span-1 sm:pb-2">Serie {idx + 1}</p>
                    <div>
                      <label className="text-[10px] font-bold text-depro-gray uppercase">Peso</label>
                      <input
                        className="admin-input w-full text-xs mt-1"
                        inputMode="decimal"
                        placeholder="kg"
                        value={row.weight}
                        onChange={(e) => setSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, weight: e.target.value } : s)))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-depro-gray uppercase">Reps</label>
                      <input
                        className="admin-input w-full text-xs mt-1"
                        inputMode="numeric"
                        placeholder="8"
                        value={row.reps}
                        onChange={(e) => setSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, reps: e.target.value } : s)))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-depro-gray uppercase">RP/RPE</label>
                      <input
                        className="admin-input w-full text-xs mt-1"
                        inputMode="numeric"
                        placeholder="6"
                        value={row.rpe}
                        onChange={(e) => setSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, rpe: e.target.value } : s)))}
                      />
                    </div>
                  </div>
                ))}
                {fields.includes("rest") && (
                  <div>
                    <label className="text-[10px] font-bold text-depro-gray uppercase">{fieldLabels.rest}</label>
                    <input
                      className="admin-input w-full text-xs mt-1"
                      placeholder={exercise.rest || "90\""}
                      value={loadDraft.rest || ""}
                      onChange={(e) => setLoadDraft({ ...loadDraft, rest: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-depro-gray uppercase">Observaciones</label>
                  <textarea
                    className="admin-input w-full text-xs mt-1"
                    rows={2}
                    value={loadDraft.notes || ""}
                    onChange={(e) => setLoadDraft({ ...loadDraft, notes: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {fields.map((field) => (
                  <div key={field} className={field === "notes" ? "col-span-2" : ""}>
                    <label className="text-[10px] font-bold text-depro-gray uppercase">{fieldLabels[field]}</label>
                    {field === "notes" ? (
                      <textarea
                        className="admin-input w-full text-xs mt-1"
                        rows={2}
                        value={loadDraft[field] || ""}
                        onChange={(e) => setLoadDraft({ ...loadDraft, [field]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="admin-input w-full text-xs mt-1"
                        value={loadDraft[field] || ""}
                        onChange={(e) => setLoadDraft({ ...loadDraft, [field]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {loadNotice && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">{loadNotice}</p>}
            {loadSaved && <p className="text-xs text-green-700">Registro guardado para este entrenamiento.</p>}
            <button
              type="button"
              onClick={handleSaveLoad}
              className="w-full py-2.5 rounded-xl text-sm font-bold border border-depro-border hover:border-depro-blue hover:text-depro-blue transition-colors"
            >
              Guardar registro
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {onSwap && (
            <button
              type="button"
              disabled={!canSwap}
              onClick={() => { onSwap(exercise.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-depro-border hover:border-depro-blue hover:text-depro-blue transition-all disabled:opacity-40"
            >
              <RefreshCw size={15} /> Cambiar ejercicio
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: accent, color: contrastText(accent) }}
          >
            <CheckCircle size={15} /> Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockExerciseList({ exercises, accentColor, onSelect }) {
  if (!exercises?.length) return null;
  return (
    <div className="space-y-2">
      {exercises.map((ex, i) => {
        const ytId = getYouTubeId(ex.videoUrl);
        return (
          <button key={ex.id || i} type="button" onClick={() => onSelect(ex)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-depro-blue-light border border-depro-border hover:border-blue-100 transition-all text-left group">
            {ytId ? (
              <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt=""
                className="w-14 h-10 rounded-lg object-cover border border-depro-border shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ backgroundColor: accentColor + "15", color: accentColor }}>{i + 1}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-depro-dark">{ex.name}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {ex.duration && <ConditionPill Icon={Clock} label={ex.duration} color={accentColor} />}
                {ex.sets && <ConditionPill Icon={Gauge} label={`${ex.sets} series`} />}
                {ex.reps && <ConditionPill Icon={Repeat2} label={ex.reps} />}
                {(ex.load || ex.weight || ex.peso) && (
                  <ConditionPill Icon={Dumbbell} label={`Carga: ${ex.load || ex.weight || ex.peso}`} color={accentColor} />
                )}
                {ex.rest && <ConditionPill Icon={Pause} label={`Descanso: ${ex.rest}`} />}
              </div>
            </div>
            <span className="text-[10px] font-bold text-depro-blue shrink-0 flex items-center gap-1">
              <Info size={11} /> Ver
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CompletionButton({ completion, onComplete, onUncomplete, accentColor }) {
  const [animating, setAnimating] = useState(false);
  const handleClick = () => {
    if (completion === 100) return;
    setAnimating(true);
    setTimeout(() => { onComplete(); setAnimating(false); }, 700);
  };
  if (completion === 100) {
    return (
      <button
        type="button"
        onClick={onUncomplete}
        className="w-full rounded-xl p-4 border border-green-200 bg-green-50 flex items-center justify-center gap-3 hover:bg-green-100 transition-colors"
      >
        <CheckCircle size={18} className="text-green-600" />
        <span className="text-sm font-bold text-green-700">Sesión completada · Toca para desmarcar</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={handleClick} disabled={animating}
      className="w-full rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ backgroundColor: animating ? "#16A34A" : accentColor }}>
      <CheckCircle size={15} /> {animating ? "Completando…" : "Marcar como completada"}
    </button>
  );
}

/** Calendario semanal L–D con sesiones clicables */
export function WeekCalendar({ plan, accentColor, activeSessionId, onSelectSession }) {
  const todayName = getTodayName();
  const sessionByDay = {};
  (plan || []).forEach((d) => {
    if (d.sessions?.length) sessionByDay[d.day] = { ...d.sessions[0], dayName: d.day };
  });

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-3 sm:p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-depro-gray">Calendario semanal</div>
          <div className="text-sm font-black text-depro-dark">Toca un día para abrir la sesión</div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[320px]">
        {WEEK_DAYS.map((day) => {
          const session = sessionByDay[day];
          const isToday = day === todayName;
          const isActive = session && activeSessionId === session.id;
          const isDone = session?.status === "completed";
          const short = day.slice(0, 3);

          return (
            <div key={day} className="relative pt-2">
              {isToday && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0A36F7] text-white shadow-sm ring-2 ring-white">
                  HOY
                </span>
              )}
            <button
              type="button"
              disabled={!session}
              onClick={() => session && onSelectSession(session)}
              className={`relative w-full flex flex-col items-center rounded-xl p-1.5 sm:p-3 min-h-[84px] sm:min-h-[104px] border transition-all text-center ${
                !session
                  ? isToday
                    ? "bg-depro-gray-light/70 border-depro-blue/40 cursor-default"
                    : "bg-depro-gray-light/60 border-depro-border opacity-60 cursor-default"
                  : isActive
                    ? "bg-depro-blue text-white border-depro-blue shadow-md scale-[1.02]"
                    : isDone
                      ? "bg-green-50 border-green-300 hover:border-green-500"
                      : isToday
                        ? "bg-blue-50 border-[#0A36F7] hover:border-depro-blue-dark"
                        : "bg-white border-depro-border hover:border-depro-blue hover:shadow-sm"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
                isActive ? "text-white/80" : isToday ? "text-[#0A36F7]" : "text-depro-gray"
              }`}>{short}</span>
              {session ? (
                <>
                  <span className={`text-[11px] sm:text-xs font-black leading-tight line-clamp-2 ${
                    isActive ? "text-white" : "text-depro-dark"
                  }`}>{session.title}</span>
                  <span className={`text-[9px] mt-1 ${isActive ? "text-white/70" : "text-depro-gray"}`}>
                    {session.duration}
                  </span>
                  {isDone && !isActive && (
                    <CheckCircle size={12} className="text-green-600 mt-1" />
                  )}
                </>
              ) : (
                <span className={`text-[10px] mt-2 ${isToday ? "text-[#0A36F7] font-semibold" : "text-depro-gray"}`}>Descanso</span>
              )}
            </button>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

/** Vista de sesión a pantalla completa — todos los bloques visibles sin acordeones */
export function PlayerSessionFullscreen({
  session,
  sessionNumber,
  dayLabel,
  accentColor,
  onClose,
  onComplete,
  onUncomplete,
  onDownloadPdf,
  user,
  objective,
  onSwapExercise,
  canSwap = true,
  swapMessage,
}) {
  const blocks = getNonEmptyBlocks(session);
  const totalEx = blocks.reduce((a, b) => a + (b.exercises?.length || 0), 0);
  const [selectedEx, setSelectedEx] = useState(null);
  const isDone = session.status === "completed" || session.completion === 100;
  const [completion, setCompletion] = useState(isDone ? 100 : 0);

  useEffect(() => {
    setCompletion(isDone ? 100 : 0);
  }, [session.id, isDone]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="flex-shrink-0 border-b border-depro-border bg-white/95 backdrop-blur-sm safe-top">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto w-full">
          <button type="button" onClick={onClose}
            className="w-10 h-10 rounded-xl border border-depro-border flex items-center justify-center text-depro-gray hover:text-depro-dark hover:border-depro-blue transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            {dayLabel && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-depro-gray">{dayLabel}</div>
            )}
            <h1 className="font-black text-depro-dark text-lg truncate">{session.title}</h1>
            <div className="flex flex-wrap gap-2 text-[11px] text-depro-gray mt-0.5">
              <span>⏱ {session.duration}</span>
              {session.type && <span>· {session.type}</span>}
              <span>· {totalEx} ejercicios</span>
            </div>
          </div>
          {sessionNumber != null && (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ backgroundColor: accentColor + "15", color: accentColor }}>
              {sessionNumber}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-5 space-y-6">
          {session.objective && (
            <p className="text-sm text-depro-gray leading-relaxed bg-depro-gray-light rounded-xl p-4 border border-depro-border">
              {session.objective}
            </p>
          )}

          {swapMessage && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
              {swapMessage}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Duración", value: session.duration || "—", Icon: Clock },
              { label: "Tipo", value: session.type || "—", Icon: Layers },
              { label: "Intensidad", value: session.intensity || "—", Icon: Flame },
              { label: "Ejercicios", value: `${totalEx}`, Icon: Dumbbell },
            ].map(({ label, value, Icon: MIcon }) => (
              <div key={label} className="bg-depro-gray-light rounded-xl p-3 border border-depro-border">
                <MIcon size={14} className="mb-1" style={{ color: accentColor }} />
                <div className="text-[9px] font-bold text-depro-gray uppercase">{label}</div>
                <div className="text-xs font-black text-depro-dark">{value}</div>
              </div>
            ))}
          </div>

          {blocks.map((block, bi) => {
            const cfg = BLOCK_CONFIG[block.type] || { label: block.label, Icon: Layers, color: accentColor };
            const BIcon = cfg.Icon;
            return (
              <section key={block.type} id={`block-${block.type}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{ backgroundColor: cfg.color + "18", borderColor: cfg.color + "25" }}>
                    <BIcon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <h2 className="font-black text-depro-dark">{cfg.label}</h2>
                    <p className="text-xs text-depro-gray">{block.exercises.length} ejercicios</p>
                  </div>
                </div>
                <BlockExerciseList
                  exercises={block.exercises}
                  accentColor={cfg.color}
                  onSelect={(ex) => setSelectedEx({ ...ex, _blockType: block.type })}
                />
                {bi < blocks.length - 1 && <div className="h-px bg-depro-border mt-6" />}
              </section>
            );
          })}

          {blocks.length === 0 && (
            <div className="text-center py-12 text-depro-gray text-sm">
              Esta sesión no tiene ejercicios asignados.
            </div>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-depro-border bg-white p-4 safe-bottom">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          <CompletionButton
            completion={completion}
            onComplete={() => { setCompletion(100); onComplete?.(); }}
            onUncomplete={() => { setCompletion(0); onUncomplete?.(); }}
            accentColor={accentColor}
          />
          {onDownloadPdf && (
            <button type="button" onClick={onDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors">
              <FileText size={14} /> Descargar PDF
            </button>
          )}
        </div>
      </footer>

      {selectedEx && (
        <ExerciseModal
          exercise={selectedEx}
          blockType={selectedEx._blockType || "principal"}
          onClose={() => setSelectedEx(null)}
          accent={accentColor}
          user={user}
          objective={objective}
          sessionMeta={{ sessionId: session.id, sessionTitle: session.title, weekLabel: dayLabel }}
          onSwap={onSwapExercise}
          canSwap={canSwap}
        />
      )}
    </div>
  );
}

export { getNonEmptyBlocks, getSessionBlocks };

/** Calendario mensual del mesociclo: 4 semanas × 7 días */
export function MesoMonthCalendar({ mesoWeeks, accentColor, activeSessionId, onSelectSession, completedByDay, completedWeek = 1 }) {
  const sessionByWeekDay = {};
  (mesoWeeks || []).forEach((week) => {
    week.sessions.forEach((s) => {
      sessionByWeekDay[`${week.week}_${s.dayName}`] = { ...s, weekNumber: week.week };
    });
  });

  const totalSessions = (mesoWeeks || []).reduce((a, w) => a + w.sessions.length, 0);
  const doneDays = completedByDay instanceof Set
    ? completedByDay
    : new Set(Array.isArray(completedByDay) ? completedByDay : []);

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-3 sm:p-4 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-depro-gray">Calendario mensual</div>
          <div className="text-sm font-black text-depro-dark">4 semanas · mismas sesiones cada semana</div>
        </div>
        <div className="text-xs font-bold text-depro-gray bg-depro-gray-light px-3 py-1.5 rounded-lg self-start">
          {totalSessions} sesiones
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[560px]">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase text-depro-gray py-1">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {(mesoWeeks || []).map((week) => (
          <div key={week.week}>
            <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-1.5 px-0.5">
              {week.label}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAYS.map((day) => {
                const session = sessionByWeekDay[`${week.week}_${day}`];
                const isActive = session && activeSessionId === session.id;
                const isDone = session && week.week === completedWeek && doneDays.has(day);
                const shortTitle = session?.title?.split(" - ")?.[0]?.slice(0, 12) || session?.type?.slice(0, 10);

                return (
                  <button
                    key={`${week.week}_${day}`}
                    type="button"
                    disabled={!session}
                    onClick={() => session && onSelectSession(session)}
                    className={`min-h-[68px] sm:min-h-[80px] rounded-xl border p-1.5 sm:p-2 text-left transition-all ${
                      !session
                        ? "bg-depro-gray-light/50 border-depro-border/60 cursor-default opacity-50"
                        : isActive
                          ? "bg-depro-blue border-depro-blue text-white shadow-md"
                          : isDone
                            ? "bg-green-50 border-green-300 hover:border-green-500"
                            : "bg-white border-depro-border hover:border-depro-blue hover:shadow-sm"
                    }`}
                  >
                    {session ? (
                      <>
                        <div className={`text-[9px] font-bold leading-tight line-clamp-2 ${
                          isActive ? "text-white" : isDone ? "text-green-800" : "text-depro-dark"
                        }`}>
                          {shortTitle}
                        </div>
                        <div className={`text-[8px] mt-1 flex items-center gap-0.5 ${
                          isActive ? "text-white/70" : isDone ? "text-green-600" : "text-depro-gray"
                        }`}>
                          {isDone && !isActive && <CheckCircle size={9} className="shrink-0" />}
                          {session.duration}
                        </div>
                      </>
                    ) : (
                      <span className="text-[9px] text-depro-gray">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}
