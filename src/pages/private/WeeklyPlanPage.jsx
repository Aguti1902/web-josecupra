import { useState, useEffect } from "react";
import {
  distributeWeekSessions, getDayRationale, getSessionType as getPeriodizationSessionType,
  getCurrentWeekIndex, formatDate, getMesocicloWeeks,
} from "../../lib/periodization";
import {
  Clock, Flame, CheckCircle, Play, ChevronDown, ChevronUp, FileText, Video,
  Target, X, Moon, Maximize2, Users, Gauge, Pause, Zap, RefreshCw, Sparkles,
  PencilRuler, Info, AlertTriangle, PlayCircle,
  Activity, Dumbbell, Wind, Layers, TrendingUp, BarChart2, ShieldCheck,
  Timer, Calendar, Sun, Ban, ListChecks, Repeat2, BookOpen, Route,
} from "lucide-react";
import { tacticalGuides } from "../../data/mockData";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam, useIsReadOnly } from "../../context/ViewContext";
import { buildPlayerPlan, buildMesoPlayerPlan } from "../../lib/playerPlanEngine";
import { markSessionComplete, touchLastTrain } from "../../lib/sessionProgress";
import { downloadSessionPdf } from "../../lib/sessionPdf";
import { filterExercisesEnriched } from "../../data/exercises";
import { getTemplate } from "../../lib/planTemplates";

const Youtube = PlayCircle;

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}
import { clubWeeklyPlan } from "../../data/mockData";

const intensityColor = { Low: "#3BC21D", Medium: "#F6CC12", High: "#FB2C39", Maximum: "#dc2626" };
const typeColor      = { Technical: "#0A36F7", Physical: "#F6CC12", Recovery: "#3BC21D", Tactical: "#a855f7", Match: "#FB2C39" };

/* ─────────────────────────────────────────────
   Pequeño icono condicional reutilizable
───────────────────────────────────────────── */
function ConditionPill({ Icon, label, color = "#6B7280" }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-depro-gray bg-depro-gray-light rounded-md px-2 py-1">
      <Icon size={11} style={{ color }} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MODAL EJERCICIO (jugador)
───────────────────────────────────────────── */
function ExerciseModal({ exercise, onClose, accent }) {
  const ytId = getYouTubeId(exercise.videoUrl);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-depro-border rounded-3xl p-6 max-w-lg w-full shadow-card-hover animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-depro-gray hover:text-depro-dark transition-colors p-1">
          <X size={20} />
        </button>
        <h3 className="text-xl font-black text-depro-dark mb-1">{exercise.name}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <ConditionPill Icon={Clock} label={exercise.duration} color={accent} />
          <ConditionPill Icon={Gauge} label={`${exercise.sets} series`} />
          <ConditionPill Icon={Pause} label={exercise.reps} />
          {exercise.rest && <ConditionPill Icon={Pause} label={`Descanso: ${exercise.rest}`} />}
        </div>

        {/* Vídeo YouTube embebido */}
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
        {/* Tips técnicos (3-5 bullets) */}
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

        {/* Errores a evitar */}
        {exercise.errorsToAvoid && (
          <div className="rounded-xl p-4 border border-amber-200 bg-amber-50 mb-5">
            <div className="font-bold text-amber-800 mb-1.5 flex items-center gap-1.5 text-sm">
              ⚠️ Errores a evitar
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">{exercise.errorsToAvoid}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: accent, color: contrastText(accent) }}
        >
          <CheckCircle size={15} /> Entendido
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAYER — Lista de ejercicios de un bloque
═══════════════════════════════════════════════════════════ */
function BlockExerciseList({ exercises, accentColor, onSelect }) {
  if (!exercises || exercises.length === 0)
    return <p className="text-xs text-depro-gray italic py-4 text-center">Sin ejercicios en este bloque</p>;
  return (
    <div className="space-y-2">
      {exercises.map((ex, i) => {
        const ytId = getYouTubeId(ex.videoUrl);
        return (
          <button key={i} onClick={() => onSelect(ex)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-depro-gray-light hover:bg-depro-blue-light border border-transparent hover:border-blue-100 transition-all text-left group"
          >
            {ytId ? (
              <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt=""
                className="w-12 h-9 rounded-lg object-cover border border-depro-border shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ backgroundColor: accentColor + "15", color: accentColor }}>{i + 1}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-depro-dark">{ex.name}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {ex.duration && <ConditionPill Icon={Clock} label={ex.duration} color={accentColor} />}
                {ex.sets && <ConditionPill Icon={Gauge} label={`${ex.sets} series`} />}
                {ex.reps && <ConditionPill Icon={Pause} label={ex.reps} />}
              </div>
            </div>
            <span className="text-[10px] text-depro-gray opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
              <Info size={11} /> Ver
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAYER — SESSION CARD con 4 bloques (igual a Zona Club)
═══════════════════════════════════════════════════════════ */
const BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",    Icon: Flame,    color: "#F59E0B" },
  principal:      { label: "Bloque principal", Icon: Dumbbell, color: "#3B82F6" },
  complementario: { label: "Complementario",  Icon: Target,   color: "#8B5CF6" },
  vuelta_calma:   { label: "Vuelta a la calma", Icon: Wind,   color: "#10B981" },
};

function SessionCard({ session, accentColor, sessionNumber, dayLabel, onComplete, onDownloadPdf }) {
  const [expanded, setExpanded]       = useState(session.status === "today");
  const [activeBlock, setActiveBlock] = useState("resumen");
  const [selectedEx, setSelectedEx]   = useState(null);
  const [completion, setCompletion]   = useState(session.status === "completed" || session.completion === 100 ? 100 : 0);
  const isToday = session.status === "today";
  const isDone  = completion === 100;

  const blocks = session.blocks || [
    { type: "principal", label: "Ejercicios", exercises: session.exercises || [] },
  ];

  const TABS = [
    { id: "resumen",        label: "Resumen" },
    { id: "calentamiento",  label: "Calentamiento" },
    { id: "principal",      label: "Principal" },
    { id: "complementario", label: "Complementario" },
    { id: "vuelta_calma",   label: "Vuelta a la calma" },
  ];

  const getBlock = (type) => blocks.find((b) => b.type === type) || { exercises: [] };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-card ${isToday && !isDone ? "border-depro-blue" : "border-depro-border"}`}>
      {/* ── Header ── */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="p-5 flex items-start gap-4 hover:bg-depro-gray-light/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black"
            style={{ backgroundColor: accentColor + "15", color: accentColor }}>
            {sessionNumber || "•"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {dayLabel && <span className="text-[10px] font-bold uppercase tracking-wider text-depro-gray">{dayLabel}</span>}
              {isToday && !isDone && <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse bg-depro-blue text-white">HOY</span>}
              {isDone && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Completada ✓</span>}
            </div>
            <h3 className="font-black text-depro-dark text-base mb-1">{session.title}</h3>
            <div className="flex flex-wrap gap-3 text-xs text-depro-gray">
              <span>⏱ {session.duration}</span>
              {session.type && <span>🏃 {session.type}</span>}
              <span>📋 {blocks.reduce((a, b) => a + b.exercises.length, 0)} ejercicios</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-depro-gray">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </button>

      {/* ── Bloques expandidos ── */}
      {expanded && (
        <div className="border-t border-depro-border">
          {/* Tabs */}
          <div className="flex border-b border-depro-border bg-depro-gray-light/40 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveBlock(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                  activeBlock === tab.id ? "border-current text-depro-blue bg-white" : "border-transparent text-depro-gray hover:text-depro-dark"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── RESUMEN ── */}
            {activeBlock === "resumen" && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background:`linear-gradient(135deg,${accentColor}10 0%,white 100%)`, border:`1px solid ${accentColor}25` }}>
                  <div className="text-5xl font-black leading-none" style={{ color: accentColor }}>{sessionNumber}</div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-0.5">Sesión del día</div>
                    <div className="font-black text-depro-dark text-xl">Sesión {sessionNumber}</div>
                    <p className="text-xs text-depro-gray mt-1 leading-relaxed">{session.objective}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Duración",   value:session.duration  || "60 min", Icon: Clock },
                    { label:"Tipo",       value:session.type       || "General", Icon: Activity },
                    { label:"Intensidad", value:session.intensity || "Media",   Icon: Flame },
                    { label:"Ejercicios", value:`${blocks.reduce((a,b)=>a+b.exercises.length,0)} tareas`, Icon: Layers },
                  ].map(({ label, value, Icon: MIcon }) => (
                    <div key={label} className="bg-depro-gray-light rounded-xl p-4 border border-depro-border">
                      <MIcon size={16} className="mb-2" style={{ color: accentColor }} />
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-black text-depro-dark mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
                {/* Vista rápida de bloques */}
                <div className="space-y-2">
                  {blocks.map((b) => {
                    const cfg = BLOCK_CONFIG[b.type] || { label: b.label, Icon: Layers, color: accentColor };
                    const BIcon = cfg.Icon;
                    return (
                      <div key={b.type}
                        onClick={() => setActiveBlock(b.type)}
                        className="flex items-center justify-between p-3 rounded-xl border border-depro-border bg-depro-gray-light hover:bg-depro-blue-light cursor-pointer transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: cfg.color + "18" }}>
                            <BIcon size={13} style={{ color: cfg.color }} />
                          </div>
                          <span className="text-sm font-bold text-depro-dark">{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-depro-gray">{b.exercises.length} ejercicios</span>
                          <ChevronDown size={12} className="text-depro-gray" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <CompletionButton
                  completion={completion}
                  onComplete={() => { setCompletion(100); onComplete?.(); }}
                  accentColor={accentColor}
                />
                {onDownloadPdf && (
                  <button type="button" onClick={onDownloadPdf}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors">
                    <FileText size={14} /> Descargar PDF
                  </button>
                )}
              </div>
            )}

            {/* ── BLOQUES: calentamiento / principal / complementario / vuelta_calma ── */}
            {["calentamiento","principal","complementario","vuelta_calma"].map((blockType) => {
              if (activeBlock !== blockType) return null;
              const block = getBlock(blockType);
              const cfg = BLOCK_CONFIG[blockType] || { label: blockType, Icon: Layers, color: accentColor };
              const BIcon = cfg.Icon;
              return (
                <div key={blockType} className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl border"
                    style={{ backgroundColor: cfg.color + "08", borderColor: cfg.color + "25" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{ backgroundColor: cfg.color + "18", borderColor: cfg.color + "25" }}>
                      <BIcon size={20} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="font-black text-depro-dark">{cfg.label}</div>
                      {block.duration && (
                        <div className="flex items-center gap-1 text-xs text-depro-gray mt-0.5">
                          <Clock size={10} /> {block.duration}
                        </div>
                      )}
                    </div>
                  </div>
                  <BlockExerciseList exercises={block.exercises} accentColor={cfg.color} onSelect={setSelectedEx} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {selectedEx && <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} accent={accentColor} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA JUGADOR
───────────────────────────────────────────── */
/* ── Generador de plan: ver playerPlanEngine.js ── */

function PlayerWeeklyPlan({ accent }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const planKey = `depro_plan_${user?.id}`;

  const [plan, setPlan]       = useState(null);
  const [generating, setGen]  = useState(false);
  const [view, setView]       = useState("micro"); // "micro" | "meso"

  useEffect(() => {
    try {
      const saved = localStorage.getItem(planKey);
      if (saved) setPlan(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [planKey]);

  const handleGenerate = async () => {
    setGen(true);
    try {
      let generated = buildPlayerPlan(user);
      // Intentar enriquecer con IA si está configurada
      try {
        const firstSession = generated.flatMap((d) => d.sessions)[0];
        if (firstSession) {
          const pool = filterExercisesEnriched({
            material: user?.material,
            lesiones: user?.lesion,
            edad: user?.edad,
            deporte: user?.deporte,
            etiquetas: [],
          });
          await fetch("/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user,
              sessionType: firstSession.type,
              exercises: pool.slice(0, 30),
              plantilla: getTemplate(firstSession.type).blocks.map((b) => b.label).join(", "),
            }),
          });
        }
      } catch { /* motor local como fallback */ }
      setPlan(generated);
      localStorage.setItem(planKey, JSON.stringify(generated));
    } finally {
      setGen(false);
    }
  };

  const handleSessionComplete = (sessionId, dayLabel) => {
    const updated = markSessionComplete({ userId: user?.id, planKey, sessionId, dayLabel });
    if (updated) setPlan(updated);
    touchLastTrain(user?.id);
  };

  const handleReset = () => {
    if (!confirm(t("weekly_plan.regenerate") + "?")) return;
    localStorage.removeItem(planKey);
    setPlan(null);
  };

  // ── Sin plan generado ──────────────────────────────────────
  if (!plan) {
    const hasProfile = !!(user?.objetivo || user?.frecuencia);
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">{t("weekly_plan.title")}</h1>
        <p className="text-depro-gray text-sm mb-8">{t("weekly_plan.subtitle")}</p>
        <div className="bg-white border border-depro-border rounded-2xl p-8 text-center shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-depro-blue/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={30} className="text-depro-blue" />
          </div>
          <h2 className="text-xl font-bold text-depro-dark mb-2">
            {hasProfile ? t("weekly_plan.no_plan_title") : t("dashboard.cta_missing")}
          </h2>
          {hasProfile ? (
            <>
              <p className="text-depro-gray text-sm mb-2">{t("weekly_plan.no_plan_desc")}</p>
              {user?.lesion?.length > 0 && <p className="text-xs text-amber-600 mb-4">{user.lesion.join(", ")}</p>}
              <button onClick={handleGenerate} disabled={generating}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-depro-blue text-white font-bold rounded-xl hover:bg-depro-blue-dark transition-colors mt-4 disabled:opacity-60">
                {generating ? <><RefreshCw size={16} className="animate-spin" /> {t("weekly_plan.generating")}</> : <><Zap size={16} /> {t("weekly_plan.generate")}</>}
              </button>
            </>
          ) : (
            <>
              <p className="text-depro-gray text-sm mb-5">{t("dashboard.no_plan_desc")}</p>
              <a href="/comprar" className="inline-flex items-center gap-2 px-6 py-3 bg-depro-blue text-white font-bold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm">
                {t("dashboard.generate_plan")}
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Sesiones del microciclo (semana actual) ────────────────
  const microSessions = plan
    .filter((d) => d.sessions.length > 0)
    .map((d, i) => ({ ...d.sessions[0], sessionNumber: i + 1, dayName: d.day }));

  const completedMicro  = microSessions.filter((s) => s.status === "completed").length;
  const pctMicro        = microSessions.length ? Math.round((completedMicro / microSessions.length) * 100) : 0;
  const mesoWeeks       = view === "meso" ? buildMesoPlayerPlan(user) : [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Plan de entrenamiento</h1>
          <p className="text-depro-gray text-sm">Objetivo: <strong>{user?.objetivo}</strong> · {user?.frecuencia} días/semana</p>
        </div>
        <button onClick={handleReset}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-depro-gray border border-depro-border px-3 py-2 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
          <RefreshCw size={13} /> Regenerar
        </button>
      </div>

      {/* Toggle Microciclo / Mesociclo */}
      <div className="inline-flex bg-depro-gray-light rounded-xl p-1 mb-6 border border-depro-border">
        {[
          { id:"micro", label:"Microciclo · Semana" },
          { id:"meso",  label:"Mesociclo · Mes" },
        ].map((v) => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              view === v.id ? "bg-white text-depro-blue shadow-sm" : "text-depro-gray hover:text-depro-dark"
            }`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ── MICROCICLO ── */}
      {view === "micro" && (
        <div className="space-y-6">
          {/* Resumen semanal */}
          <div className="rounded-2xl p-5 flex items-center gap-5"
            style={{ background:`linear-gradient(135deg,${accent}14 0%,${accent}04 100%)`, border:`1px solid ${accent}25` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0" style={{ backgroundColor: accent + "20", color: accent }}>
              {pctMicro}%
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-0.5">Progreso semanal</div>
              <div className="font-black text-depro-dark">{completedMicro} de {microSessions.length} sesiones completadas</div>
              <div className="h-1.5 w-full bg-depro-gray-light rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full transition-all" style={{ width:`${pctMicro}%`, backgroundColor: accent }} />
              </div>
            </div>
          </div>

          {/* Selector de sesiones (igual a Club Zone) */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {microSessions.map((s) => (
              <div key={s.id}
                className="flex-shrink-0 px-5 py-3.5 rounded-2xl border bg-white text-left"
                style={{ borderColor: s.status === "completed" ? "#16A34A" : accent + "40" }}>
                <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray">{s.dayName}</div>
                <div className="text-base font-black text-depro-dark mt-0.5">{s.title}</div>
                <div className="text-[11px] font-semibold mt-1 text-depro-gray">{s.type}</div>
                <div className="text-[10px] text-depro-gray mt-0.5">⏱ {s.duration}</div>
                {s.status === "completed" && <div className="text-[10px] text-green-700 font-bold mt-1">✓ Completada</div>}
              </div>
            ))}
          </div>

          {/* Sesiones con los 4 bloques */}
          <div className="space-y-4">
            {microSessions.map((session) => (
              <SessionCard key={session.id} session={session} accentColor={accent}
                sessionNumber={session.sessionNumber} dayLabel={session.dayName}
                onComplete={() => handleSessionComplete(session.id, session.dayName)}
                onDownloadPdf={() => downloadSessionPdf({
                  title: session.title,
                  subtitle: session.objective,
                  blocks: session.blocks,
                  meta: { duration: session.duration, type: session.type, intensity: session.intensity },
                  brandColor: accent,
                })}
              />
            ))}
            {microSessions.length === 0 && (
              <div className="bg-white border border-depro-border rounded-2xl text-center py-16 shadow-card">
                <div className="w-14 h-14 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
                  <Moon size={26} className="text-depro-gray" />
                </div>
                <h3 className="text-lg font-bold text-depro-dark mb-2">Sin sesiones esta semana</h3>
                <p className="text-depro-gray text-sm max-w-xs mx-auto">Ajusta tu frecuencia de entrenamiento en el perfil.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MESOCICLO ── */}
      {view === "meso" && (
        <div className="space-y-8">
          <p className="text-depro-gray text-sm">3 semanas · Sesiones 1 a 9 · Progresión mensual</p>
          {mesoWeeks.map((week) => (
            <div key={week.week}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ backgroundColor: accent + "20", color: accent }}>{week.week}</div>
                <div>
                  <div className="font-black text-depro-dark">{week.label}</div>
                  <div className="text-xs text-depro-gray">{week.sessions.length} sesiones</div>
                </div>
              </div>
              <div className="space-y-3">
                {week.sessions.map((session) => (
                  <SessionCard key={session.id} session={session} accentColor={accent}
                    sessionNumber={session.sessionNumber} dayLabel={session.dayName}
                    onComplete={() => handleSessionComplete(session.id, session.dayName)}
                    onDownloadPdf={() => downloadSessionPdf({
                      title: session.title,
                      subtitle: session.objective,
                      blocks: session.blocks,
                      meta: { duration: session.duration, type: session.type },
                      brandColor: accent,
                    })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DATOS DE SESIÓN CLUB — A/B/C
══════════════════════════════════════════════ */
function getSessionType(intensity) {
  const i = (intensity || "").toLowerCase();
  if (i.includes("complementaria-d") || i === "d") return "D";
  if (i.includes("máxima") || i.includes("maxima")) return "C";
  if (i.includes("alta") || i.includes("media-alta")) return "B";
  return "A";
}
const ST = {
  A: { label: "Extensiva",       color: "#3B82F6", bg: "#EFF6FF", Icon: Activity },
  B: { label: "Intensiva",       color: "#F59E0B", bg: "#FFFBEB", Icon: Flame },
  C: { label: "Reactiva",        color: "#EF4444", bg: "#FEF2F2", Icon: Zap },
  D: { label: "Complementaria",  color: "#10B981", bg: "#F0FDF4", Icon: Dumbbell },
};
const WARMUP_GUIDE_ITEMS = [
  { Icon: Activity,  title: "Con balón",       text: "Posesión simple, rueda o rondo de activación" },
  { Icon: Repeat2,   title: "Tarea integrada", text: "Rondo, conservación o circuito técnico corto" },
  { Icon: Maximize2, title: "Espacio",         text: "Zona media del campo · Sin presión inicial" },
  { Icon: Users,     title: "Participación",   text: "Todo el equipo desde el minuto 1" },
  { Icon: Clock,     title: "Duración",        text: "10–15 min · Escalado gradual hasta ritmo medio" },
  { Icon: Ban,       title: "Evitar",          text: "Sprints sin balón, ejercicios estáticos, carga en frío" },
];
const PROTOCOL_INFO = {
  A: [
    { Icon: Target,       label: "Qué haremos",  value: "Trabajo de volumen y dominio colectivo" },
    { Icon: BookOpen,     label: "Por qué",       value: "Construir base técnica sin sobrecargar el SNC" },
    { Icon: Clock,        label: "Duración",      value: "Series largas · 8–12 min de trabajo" },
    { Icon: Activity,     label: "Intensidad",    value: "60–70% · Ritmo controlado" },
    { Icon: ShieldCheck,  label: "Sub-12",        value: "Reducir series 20% · Sin impacto articular" },
  ],
  B: [
    { Icon: Target,       label: "Qué haremos",  value: "Alta exigencia en espacios reducidos" },
    { Icon: BookOpen,     label: "Por qué",       value: "Mejorar decisión bajo presión y velocidad" },
    { Icon: Clock,        label: "Duración",      value: "Bloques cortos · 4–6 min de trabajo" },
    { Icon: Flame,        label: "Intensidad",    value: "80–90% · Ritmo muy elevado" },
    { Icon: ShieldCheck,  label: "Sub-14",        value: "Máx. 85% FCmax · Vigilar carga articular" },
  ],
  C: [
    { Icon: Target,       label: "Qué haremos",  value: "Acciones explosivas y velocidad reactiva máxima" },
    { Icon: BookOpen,     label: "Por qué",       value: "Activar el SNC y mejorar la velocidad de reacción" },
    { Icon: Timer,        label: "Duración",      value: "Ráfagas cortas · 2–4 min · Descanso 3–5 min" },
    { Icon: Zap,          label: "Intensidad",    value: "100% · Sin reservas · Máximo esfuerzo" },
    { Icon: ShieldCheck,  label: "Sub-16",        value: "Calentamiento mínimo 15 min · Riesgo lesional" },
  ],
  D: [
    { Icon: Target,       label: "Qué haremos",  value: "Trabajo complementario de movilidad y activación" },
    { Icon: BookOpen,     label: "Por qué",       value: "Completar la semana sin acumular fatiga" },
    { Icon: Clock,        label: "Duración",      value: "Bloques medios · 6–8 min" },
    { Icon: Activity,     label: "Intensidad",    value: "50–60% · Carga baja" },
    { Icon: ShieldCheck,  label: "4 días/sem",    value: "Sesión ideal para equipos con 4 entrenos semanales" },
  ],
};
const DAY_RECS = {
  A: [
    { Icon: Maximize2, text: "Espacios amplios para circulación fluida" },
    { Icon: Repeat2,   text: "Alta repetición con baja presión temporal" },
    { Icon: Clock,     text: "Descansos largos entre series, sin prisa" },
    { Icon: Users,     text: "Participación colectiva: todo el equipo junto" },
  ],
  B: [
    { Icon: Route,     text: "Espacios reducidos para forzar decisiones rápidas" },
    { Icon: Users,     text: "Grupos pequeños → máxima participación individual" },
    { Icon: Zap,       text: "Bloques cortos de alta exigencia sin pausa" },
    { Icon: Target,    text: "Presión constante sobre el portador del balón" },
  ],
  C: [
    { Icon: TrendingUp, text: "Acciones de 2–4 seg con arranque máximo" },
    { Icon: Timer,      text: "Recuperación generosa para mantener calidad" },
    { Icon: Activity,   text: "Cambios de dirección y velocidad al máximo" },
    { Icon: Sun,        text: "El descanso define la calidad de cada acción" },
  ],
  D: [
    { Icon: Dumbbell,   text: "Trabajo complementario de baja carga articular" },
    { Icon: Wind,       text: "Movilidad y activación sin fatiga acumulada" },
    { Icon: ShieldCheck,text: "Ideal tras sesiones intensas de la semana" },
    { Icon: Users,      text: "Participación total con foco en calidad técnica" },
  ],
};
const TASK_TYPES = [
  "Automatismos","Ruedas de pase","Posesiones","Juegos de posición",
  "Conservaciones","Rondo simple","Rondo ampliado","Rondo direccional",
  "Partidos reducidos","Partidos condicionados","Finalización",
  "Oleadas","Secuencias por carriles","1 vs 1","2 vs 1","3 vs 2",
  "Transiciones ofensivas","Transiciones defensivas","Circuitos técnicos",
  "Tarea mixta","Tarea global","Juegos reactivos","Presión tras pérdida",
  "Salida de balón","Juego posicional","Pressing zonal","Combinativas",
  "Trabajo técnico individual",
];
const BASE_PARAMS = {
  A: { space:"Amplio", grouping:"Todo el equipo", balls:"1 c/2–3 jug.", work:"8–12 min", rest:"3–4 min", intensity:"60–70%" },
  B: { space:"Reducido", grouping:"Grupos de 4–8", balls:"1 por grupo", work:"4–6 min", rest:"1–2 min", intensity:"80–90%" },
  C: { space:"Direccional", grouping:"Grupos de 4–6", balls:"1 por acción", work:"2–4 min", rest:"3–5 min", intensity:"Máxima" },
  D: { space:"Medio", grouping:"Grupos de 6–10", balls:"1 por grupo", work:"6–8 min", rest:"2–3 min", intensity:"50–60%" },
};
const TASK_CUES = {
  "Posesiones":             { A:["Espacio grande, baja presión","Circulación sin urgencia","Fútbol asociativo"],               B:["Espacio reducido, ritmo alto","Presión inmediata en pérdida","Superioridades cambiantes"],         C:["Acciones rápidas y transiciones veloces","Presión total","Máx. 2–3 min por serie"] },
  "Rondo simple":           { A:["1–2 toques sin presión temporal","Apoyo siempre disponible","Ritmo técnico"],                 B:["1 toque obligatorio","Espacio más pequeño","Velocidad de circulación máxima"],               C:["Reacción inmediata al cambio de rol","Sprint defensivo al perder","Pocas rep. máxima calidad"] },
  "Partidos reducidos":     { A:["Campo grande, juego asociativo","Libertad táctica total","Descansos generosos"],              B:["Campo pequeño, alta intensidad","Transiciones muy rápidas","Presión constante"],               C:["Ráfagas de 2–3 min al 100%","Descanso amplio entre partidos","Transición inmediata"] },
  "Finalización":           { A:["Muchos disparos, poca presión","Variedad de posiciones de tiro","Ritmo técnico"],             B:["Finalización bajo presión activa","Velocidad en el último pase","Decisión rápida"],            C:["Sprint de llegada máximo","Disparo sin control previo","Recuperación total entre rep."] },
  "1 vs 1":                 { A:["Espacio amplio para el dribling","Muchas repeticiones técnicas","Sin urgencia"],              B:["Espacio reducido para 1v1","Alta presión defensiva","Decisión instantánea"],                    C:["Arranque máximo desde el primer metro","100% en el sprint","Transición explosiva"] },
  "Transiciones ofensivas": { A:["Salida organizada sin urgencia","Múltiples líneas de pase","Comunicación táctica"],           B:["Velocidad de transición máxima","Salida en 3 seg máximo","Superioridad aprovechada"],           C:["Sprint total al recuperar","Decisión instantánea","Máxima velocidad hasta el gol"] },
  "Pressing zonal":         { A:["Zonas amplias de pressing suave","Organización de referencias","Baja intensidad defensiva"],  B:["Pressing coordinado y agresivo","Trampa defensiva activa","Alta intensidad en zona"],           C:["Activación total del pressing","Sprint explosivo defensivo","Recuperar el balón en 5 seg"] },
};
const DEFAULT_CUES = {
  A:["Ritmo técnico controlado · alta repetición","Espacios amplios sin urgencia temporal","Descansos generosos entre series"],
  B:["Velocidad de decisión máxima","Presión alta sobre el portador","Grupos reducidos sin pausa"],
  C:["Arranque explosivo en cada acción","Descanso completo antes de repetir","100% de intensidad en cada ráfaga"],
};

/* ─────────────────────────────────────────────
   DISEÑADOR DE TAREAS — 28 tipos + parámetros A/B/C
───────────────────────────────────────────── */

function DisenarTareas({ accentColor, sessionType = "A", storageKey }) {
  const [dropOpen, setDropOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(() => {
    if (!storageKey) return TASK_TYPES[0];
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw).task : TASK_TYPES[0];
    } catch { return TASK_TYPES[0]; }
  });

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ task: selectedTask, sessionType, savedAt: Date.now() }));
  }, [selectedTask, storageKey, sessionType]);

  const st = ST[sessionType] || ST.A;
  const StIcon = st.Icon;
  const params = BASE_PARAMS[sessionType];
  const cues = ((TASK_CUES[selectedTask] || DEFAULT_CUES)[sessionType] || DEFAULT_CUES.A);
  const recs = DAY_RECS[sessionType] || DAY_RECS.A;

  return (
    <div className="space-y-5">
      {/* Dropdown tipo de tarea */}
      <div className="relative">
        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2 block">
          Tipo de tarea
        </label>
        <button
          onClick={() => setDropOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-depro-gray-light border border-depro-border rounded-xl text-sm font-semibold text-depro-dark hover:bg-depro-gray-light/70 transition-colors"
        >
          <span>{selectedTask}</span>
          <ChevronDown size={14} className={`text-depro-gray transition-transform ${dropOpen ? "rotate-180" : ""}`} />
        </button>
        {dropOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-depro-border rounded-xl shadow-card-hover z-20 max-h-60 overflow-y-auto">
            {TASK_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTask(t); setDropOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  t === selectedTask ? "font-bold text-depro-blue bg-depro-blue-light" : "text-depro-dark hover:bg-depro-gray-light"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Banner visual de la tarea */}
      <div
        className="w-full rounded-2xl p-8 flex flex-col items-center justify-center border"
        style={{ background: `linear-gradient(135deg, ${st.bg} 0%, ${st.color}18 100%)`, borderColor: st.color + "30" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border"
          style={{ backgroundColor: st.color + "20", borderColor: st.color + "30" }}>
          <StIcon size={30} style={{ color: st.color }} />
        </div>
        <div className="text-2xl font-black text-center" style={{ color: st.color }}>{selectedTask}</div>
        <div className="flex items-center gap-1 text-xs text-depro-gray mt-1.5">
          <StIcon size={10} style={{ color: st.color }} /> Sesión {st.label}
        </div>
      </div>

      {/* Parámetros condicionales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ backgroundColor: st.color + "15", color: st.color }}>
            {st.emoji} Parámetros para Sesión {st.label}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { label:"Espacio",    value:params.space,     icon:"📐" },
            { label:"Agrupación", value:params.grouping,  icon:"👥" },
            { label:"Balones",    value:params.balls,     icon:"⚽" },
            { label:"Trabajo",    value:params.work,      icon:"⏱️" },
            { label:"Descanso",   value:params.rest,      icon:"🛑" },
            { label:"Intensidad", value:params.intensity, icon:"🔋" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-depro-gray-light rounded-xl p-3 border border-depro-border">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
              <div className="text-xs font-black text-depro-dark mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consignas específicas */}
      <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: st.color + "08", border: `1px solid ${st.color}20` }}>
        <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: st.color }}>
          💬 Consignas · {selectedTask}
        </div>
        {cues.map((c, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
              style={{ backgroundColor: st.color + "20", color: st.color }}>{i + 1}</span>
            <span className="text-xs text-depro-dark leading-relaxed">{c}</span>
          </div>
        ))}
      </div>

      {/* Recomendaciones del día */}
      <div className="bg-depro-gray-light rounded-2xl p-4 border border-depro-border">
        <div className="flex items-center gap-1.5 text-xs font-bold text-depro-dark mb-3">
          <ListChecks size={13} style={{ color: st.color }} /> Recomendaciones del día · Sesión {st.label}
        </div>
        <div className="space-y-2.5">
          {recs.map((r, i) => {
            const RIcon = r.Icon;
            return (
              <div key={i} className="flex items-center gap-2.5 text-xs text-depro-dark">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: st.color + "15" }}>
                  <RIcon size={11} style={{ color: st.color }} />
                </div>
                <span className="leading-snug">{r.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLUB — Ejercicio expandible con vídeo YouTube
───────────────────────────────────────────── */
function ExerciseCardClub({ ex, ytId, accentColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-depro-border rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-depro-gray-light/40 transition-colors text-left"
      >
        {/* Thumbnail o placeholder */}
        {ytId ? (
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={ex.name}
            className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-depro-border"
          />
        ) : (
          <div
            className="w-16 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-depro-border"
            style={{ backgroundColor: accentColor + "10" }}
          >
            <Play size={18} style={{ color: accentColor, opacity: 0.5 }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-depro-dark text-sm leading-tight">{ex.name}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {ex.sets  && <span className="text-[10px] text-depro-gray bg-depro-gray-light px-2 py-0.5 rounded-md">{ex.sets} series</span>}
            {ex.reps  && <span className="text-[10px] text-depro-gray bg-depro-gray-light px-2 py-0.5 rounded-md">{ex.reps}</span>}
            {ex.rest  && <span className="text-[10px] text-depro-gray bg-depro-gray-light px-2 py-0.5 rounded-md">Desc: {ex.rest}</span>}
          </div>
        </div>
        {ytId && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
            style={{ backgroundColor: accentColor + "15", color: accentColor }}>
            <Youtube size={11} /> {open ? "Cerrar" : "Ver"}
          </span>
        )}
      </button>

      {open && ytId && (
        <div className="border-t border-depro-border">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
            title={ex.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOTÓN DE COMPLETADO con animación
───────────────────────────────────────────── */
function CompletionButton({ completion, onComplete, accentColor }) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (completion === 100) return;
    setAnimating(true);
    setTimeout(() => {
      onComplete();
      setAnimating(false);
    }, 700);
  };

  if (completion === 100) {
    return (
      <div className="rounded-xl p-4 border border-green-200 bg-green-50 flex items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={18} className="text-green-600" />
        </div>
        <span className="text-sm font-bold text-green-700">Sesión completada</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={animating}
      className="relative w-full overflow-hidden rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ backgroundColor: animating ? "#16A34A" : accentColor }}
    >
      {animating ? (
        <span className="flex items-center gap-2 animate-pulse">
          <CheckCircle size={15} /> Completando…
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CheckCircle size={15} /> Marcar como completada
        </span>
      )}
      {/* Ripple de color */}
      {animating && (
        <span
          className="absolute inset-0 rounded-xl animate-ping opacity-30"
          style={{ backgroundColor: "#16A34A" }}
        />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLUB — SESIÓN con 4 bloques (diseño profesional, sin emojis)
═══════════════════════════════════════════════════════════ */
function ClubSessionCard({ session, accentColor, sessionNumber, readOnly = false, taskStorageKey }) {
  const [expanded, setExpanded]       = useState(false);
  const [activeBlock, setActiveBlock] = useState("resumen");
  const [completion, setCompletion]   = useState(session.completion ?? 0);

  const sessionType = getSessionType(session.intensity);
  const st          = ST[sessionType];
  const StIcon      = st.Icon;
  const exercises   = session.exercises || [];
  const warmupYtId  = getYouTubeId(session.warmupVideoUrl)   || getYouTubeId(exercises[0]?.videoUrl) || null;
  const protoYtId   = getYouTubeId(session.protocolVideoUrl) || getYouTubeId(exercises[1]?.videoUrl) || warmupYtId;

  const BLOCKS = [
    { id:"resumen",       label:"Resumen",        Icon: BarChart2 },
    { id:"calentamiento", label:"Calentamiento",  Icon: Flame },
    { id:"protocolo",     label:"Protocolo",      Icon: ListChecks },
    { id:"tareas",        label:"Diseñar tareas", Icon: PencilRuler },
  ];

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">
      {/* ── Header cerrado ── */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="p-5 flex items-center gap-4 hover:bg-depro-gray-light/30 transition-colors">
          {/* Chip sesión */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black border"
            style={{ backgroundColor: st.bg, color: st.color, borderColor: st.color + "30" }}>
            {sessionNumber || "•"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {session.day && <span className="text-[10px] font-bold uppercase tracking-wider text-depro-gray">{session.day}</span>}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: st.bg, color: st.color, borderColor: st.color + "30" }}>
                <StIcon size={9} /> {st.label}
              </span>
              {completion === 100 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle size={9} /> Completada
                </span>
              )}
            </div>
            <h3 className="font-black text-depro-dark text-base leading-none mb-2">Sesión {sessionNumber}</h3>
            <div className="flex flex-wrap items-center gap-3">
              {session.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-depro-gray">
                  <Clock size={11} className="text-depro-gray" /> {session.duration}
                </span>
              )}
              {session.intensity && (
                <span className="inline-flex items-center gap-1 text-xs text-depro-gray">
                  <Activity size={11} className="text-depro-gray" /> {session.intensity}
                </span>
              )}
              {exercises.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-depro-gray">
                  <Layers size={11} className="text-depro-gray" /> {exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-depro-gray">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

      </button>

      {/* ── Expandido ── */}
      {expanded && (
        <div className="border-t border-depro-border">
          {/* Tabs */}
          <div className="flex border-b border-depro-border overflow-x-auto">
            {BLOCKS.map((b) => {
              const BIcon = b.Icon;
              return (
                <button key={b.id} onClick={() => setActiveBlock(b.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                    activeBlock === b.id
                      ? "border-depro-blue text-depro-blue bg-depro-blue-light/30"
                      : "border-transparent text-depro-gray hover:text-depro-dark bg-white"
                  }`}>
                  <BIcon size={12} />
                  {b.label}
                </button>
              );
            })}
          </div>

          <div className="p-5">

            {/* ── RESUMEN ── */}
            {activeBlock === "resumen" && (
              <div className="space-y-4">
                {/* Hero tipo sesión */}
                <div className="rounded-2xl p-5 flex items-center gap-5 border"
                  style={{ background:`linear-gradient(135deg,${st.bg} 0%,white 80%)`, borderColor: st.color + "25" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                    style={{ backgroundColor: st.color + "18", borderColor: st.color + "30" }}>
                    <StIcon size={28} style={{ color: st.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-0.5">Sesión del día</div>
                    <div className="font-black text-depro-dark text-2xl leading-none">Sesión {sessionNumber}</div>
                    <div className="text-sm font-semibold mt-1" style={{ color: st.color }}>{st.label}</div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Duración",   value:session.duration   || "—", Icon: Clock },
                    { label:"Intensidad", value:session.intensity  || "—", Icon: Activity },
                    { label:"Dinámica",   value:st.label,                   Icon: StIcon },
                    { label:"Ejercicios", value:`${exercises.length} tareas`, Icon: Layers },
                  ].map(({ label, value, Icon: MIcon }) => (
                    <div key={label} className="bg-depro-gray-light rounded-xl p-4 border border-depro-border">
                      <MIcon size={16} className="mb-2" style={{ color: accentColor }} />
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-black text-depro-dark mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                {!readOnly && (
                  <>
                    <CompletionButton
                      completion={completion}
                      onComplete={() => setCompletion(100)}
                      accentColor={accentColor}
                    />
                    <button type="button"
                      onClick={() => downloadSessionPdf({
                        title: `Sesión ${sessionNumber}`,
                        subtitle: session.objective || session.title,
                        blocks: [{ label: "Ejercicios", exercises: exercises.map((e) => ({ name: e.name })) }],
                        meta: { duration: session.duration, type: st.label, intensity: session.intensity },
                        brandColor: accentColor,
                      })}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors">
                      <FileText size={14} /> Descargar PDF
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── CALENTAMIENTO ── */}
            {activeBlock === "calentamiento" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Video */}
                  <div>
                    {warmupYtId ? (
                      <div className="rounded-2xl overflow-hidden border border-depro-border">
                        <iframe src={`https://www.youtube.com/embed/${warmupYtId}?rel=0&modestbranding=1`}
                          title="Calentamiento" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen className="w-full aspect-video" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-depro-gray-light border border-dashed border-depro-border flex flex-col items-center justify-center gap-2">
                        <Video size={28} className="text-depro-gray opacity-40" />
                        <p className="text-xs text-depro-gray">Sin vídeo de calentamiento</p>
                      </div>
                    )}
                  </div>
                  {/* Guía */}
                  <div className="space-y-3">
                    {exercises[0] && (
                      <div className="bg-white border border-depro-border rounded-xl p-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-depro-blue mb-2">
                          <Flame size={10} /> A · Propuesto por el preparador
                        </div>
                        <div className="font-bold text-depro-dark text-sm">{exercises[0].name}</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {exercises[0].sets && <span className="inline-flex items-center gap-1 text-[10px] bg-depro-gray-light px-2 py-1 rounded-md"><Layers size={9} /> {exercises[0].sets} series</span>}
                          {exercises[0].reps && <span className="inline-flex items-center gap-1 text-[10px] bg-depro-gray-light px-2 py-1 rounded-md"><Repeat2 size={9} /> {exercises[0].reps}</span>}
                          {exercises[0].rest && <span className="inline-flex items-center gap-1 text-[10px] bg-depro-gray-light px-2 py-1 rounded-md"><Timer size={9} /> {exercises[0].rest}</span>}
                        </div>
                      </div>
                    )}
                    <div className="bg-white border border-depro-border rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: accentColor }}>
                        <BookOpen size={10} /> B · Guía calentamiento integrado
                      </div>
                      <div className="space-y-2.5">
                        {WARMUP_GUIDE_ITEMS.map((item) => {
                          const WIcon = item.Icon;
                          return (
                            <div key={item.title} className="flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: accentColor + "12" }}>
                                <WIcon size={11} style={{ color: accentColor }} />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-depro-dark">{item.title}: </span>
                                <span className="text-xs text-depro-gray">{item.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROTOCOLO ── */}
            {activeBlock === "protocolo" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    {protoYtId ? (
                      <div className="rounded-2xl overflow-hidden border border-depro-border">
                        <iframe src={`https://www.youtube.com/embed/${protoYtId}?rel=0&modestbranding=1`}
                          title="Protocolo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen className="w-full aspect-video" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-depro-gray-light border border-dashed border-depro-border flex flex-col items-center justify-center gap-2">
                        <Video size={28} className="text-depro-gray opacity-40" />
                        <p className="text-xs text-depro-gray">Sin vídeo de protocolo</p>
                      </div>
                    )}
                    {exercises.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-depro-gray">
                          <Layers size={10} /> Ejercicios de la sesión
                        </div>
                        {exercises.map((ex, i) => (
                          <ExerciseCardClub key={i} ex={ex} ytId={getYouTubeId(ex.videoUrl)} accentColor={accentColor} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="bg-white border border-depro-border rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-depro-border">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: st.color + "15" }}>
                          <StIcon size={14} style={{ color: st.color }} />
                        </div>
                        <span className="text-xs font-bold text-depro-dark">Protocolo · Sesión {st.label}</span>
                      </div>
                      {PROTOCOL_INFO[sessionType].map((item) => {
                        const PIcon = item.Icon;
                        return (
                          <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-depro-gray-light border border-depro-border">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: st.color + "15" }}>
                              <PIcon size={13} style={{ color: st.color }} />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{item.label}</div>
                              <div className="text-sm font-semibold text-depro-dark mt-0.5">{item.value}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DISEÑAR TAREAS ── */}
            {activeBlock === "tareas" && (
              <DisenarTareas accentColor={accentColor} sessionType={sessionType} storageKey={taskStorageKey} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Devuelve el id de bloque para una categoría de equipo */
function getAgeBlock(category) {
  const blocks = {
    "Bloque 1": ["Sub-9","Sub-10","Sub-11","Sub-12"],
    "Bloque 2": ["Sub-13","Sub-14","Sub-15"],
    "Bloque 3": ["Sub-16","Juvenil"],
  };
  for (const [blockId, ages] of Object.entries(blocks)) {
    if (ages.includes(category)) return blockId;
  }
  return null;
}


// Normaliza un plan del admin al formato que espera ClubMicrocycles
function normalizePlan(m) {
  return {
    ...m,
    code:  m.code  || m.microcycle || "—",
    range: m.range || m.dateRange  || "",
    label: m.label || m.focus      || "",
    sessions: (m.sessions || []).map((s) => ({ completion: 0, ...s })),
  };
}

/* ─────────────────────────────────────────────
   VISTA CLUB — Microciclos del admin
───────────────────────────────────────────── */
function ClubMicrocycles({ accent }) {
  const { user } = useAuth();
  const activeTeam = useActiveTeam();
  const isReadOnly = useIsReadOnly();
  // Coordinador viendo equipo → tratar como entrenador de ese equipo
  const isCoordinator = !isReadOnly && (user?.team_role === "coordinador" || !user?.team);
  const userTeamId = activeTeam?.id ?? null;
  const userTeamCategory = activeTeam?.category ?? null;
  const userAgeBlock = getAgeBlock(userTeamCategory);
  const trainingDays = activeTeam?.trainingDays || []; // días del equipo
  const clubId = user?.club?.id ?? null;

  // Cargar planes globales: localStorage primero, luego API (cross-device)
  const [allPlans, setAllPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem("depro_global_plans") || "[]").map(normalizePlan); }
    catch { return []; }
  });
  useEffect(() => {
    fetch("/api/admin-clubs")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const globalEntry = (data.clubs || []).find((c) => c.id === "GLOBAL_PLANS");
        const apiPlans = globalEntry?.plans;
        if (apiPlans?.length > 0) {
          try { localStorage.setItem("depro_global_plans", JSON.stringify(apiPlans)); } catch {}
          setAllPlans(apiPlans.map(normalizePlan));
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrar: coordinador ve todos; entrenador ve planes de su bloque de edad
  // Sistema nuevo: filtra por ageBlock. Sistema antiguo (fallback): filtra por teamId.
  const visiblePlans = isCoordinator
    ? allPlans
    : allPlans.filter((m) => {
        if (m.ageBlock && userAgeBlock) return m.ageBlock === userAgeBlock;
        return !m.teamId || m.teamId === userTeamId;
      });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const micro = visiblePlans[selectedIdx] ?? visiblePlans[0];

  if (!micro) return (
    <div className="p-8 text-center text-depro-gray">
      <p className="font-medium">No hay mesociclos asignados a tu equipo todavía.</p>
      <p className="text-sm mt-1 opacity-60">El preparador los añadirá desde el panel de administración.</p>
    </div>
  );

  // Detectar semana actual según el calendario real del mesociclo
  const SESSIONS_PER_BASE_WEEK = 3;
  const totalCalendarWeeks = getMesocicloWeeks(micro.startDate, micro.endDate);
  const currentWeekIdx = getCurrentWeekIndex(micro.startDate, micro.endDate);
  const safeWeekIdx = currentWeekIdx < 0 ? 0 : currentWeekIdx;

  // Las sesiones del admin son la plantilla semanal — se repiten cada semana
  const template = (micro.sessions || []).slice(0, SESSIONS_PER_BASE_WEEK);
  const currentWeekSessions = template; // misma plantilla siempre

  // Distribuir sesiones de la semana actual según los días del equipo
  const distributedWeekSessions = !isCoordinator && trainingDays.length > 0
    ? distributeWeekSessions(currentWeekSessions, trainingDays)
    : currentWeekSessions;

  const totalCompletion = Math.round(
    distributedWeekSessions.reduce((acc, s) => acc + (s.completion ?? 0), 0) / Math.max(distributedWeekSessions.length, 1)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {isReadOnly && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Modo visualización · {activeTeam?.name || "Equipo"} — Solo lectura
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Microciclo</h1>
        <p className="text-depro-gray text-sm">
          {isCoordinator
            ? "Todos los equipos · Filtra por mesociclo"
            : `${activeTeam?.name || ""}${userTeamCategory ? ` (${userTeamCategory})` : ""}${userAgeBlock ? ` · ${userAgeBlock}` : ""}`}
        </p>
        {!isCoordinator && micro.startDate && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-depro-blue-light/40 border border-depro-blue/20 text-xs">
            <Calendar size={11} className="text-depro-blue" />
            <span className="text-depro-dark font-bold">Semana {safeWeekIdx + 1}</span>
            <span className="text-depro-gray">· {micro.label}</span>
            <span className="text-depro-gray">· {formatDate(micro.startDate)} → {formatDate(micro.endDate)}</span>
          </div>
        )}
      </div>

      {/* Selector de microciclos */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {visiblePlans.map((m, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={m.code}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "border-depro-blue bg-depro-blue-light text-depro-blue"
                  : "border-depro-border bg-white text-depro-gray hover:text-depro-dark hover:border-depro-blue/30"
              }`}
            >
              <div className="text-lg font-black leading-none">{m.code}</div>
              <div className="text-[11px] font-semibold mt-1">{m.range}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{m.focus}</div>
              {isCoordinator && m.teamName && (
                <div className="text-[10px] mt-0.5 font-bold text-depro-blue/70">{m.teamName}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Resumen del microciclo */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, ${accent}04 100%)`, border: `1px solid ${accent}25` }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black flex-shrink-0" style={{ backgroundColor: accent + "20", color: accent }}>
          {micro.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-depro-gray uppercase tracking-wide">{micro.label}</div>
          <div className="font-black text-depro-dark">{micro.focus}</div>
          <div className="text-xs text-depro-gray">{micro.range}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">Avance</div>
          <div className="text-2xl font-black text-depro-dark">{totalCompletion}%</div>
          <div className="h-1.5 w-28 bg-depro-gray-light rounded-full overflow-hidden mt-1">
            <div className="h-full rounded-full" style={{ width: `${totalCompletion}%`, backgroundColor: accent }} />
          </div>
        </div>
      </div>

      {/* Banner de periodización (solo entrenadores con días configurados) */}
      {!isCoordinator && trainingDays.length > 0 && (
        <div className="bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl p-3 mb-4 flex items-start gap-2">
          <Info size={13} className="text-depro-blue flex-shrink-0 mt-0.5" />
          <p className="text-xs text-depro-dark/70">
            <span className="font-bold text-depro-dark">Sesiones adaptadas a tu equipo · </span>
            {trainingDays.join(", ")} · La carga se distribuye siguiendo lógica de periodización táctica
            (recuperación → pico → activación pre-partido).
          </p>
        </div>
      )}

      {/* Sesiones distribuidas */}
      <div className="space-y-4">
        {distributedWeekSessions.map((s, idx) => {
          const sType = getPeriodizationSessionType(s.intensity);
          const typeColors = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", D: "#10B981" };
          const taskKey = clubId && userTeamId ? `depro_club_tasks_${clubId}_${userTeamId}_${s.id || idx}` : null;
          return (
            <div key={s.id || idx}>
              {s.assignedDay && !isCoordinator && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: typeColors[sType] ?? accent }}>
                    {s.assignedDay}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: (typeColors[sType] ?? accent) + "18", color: typeColors[sType] ?? accent }}>
                    Sesión {sType}
                  </span>
                  <span className="text-[10px] text-depro-gray hidden sm:block">{getDayRationale(s.assignedDay, sType)}</span>
                </div>
              )}
              <ClubSessionCard session={s} accentColor={accent} sessionNumber={idx + 1} readOnly={isReadOnly} taskStorageKey={taskKey} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────────── */
function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}
function safeColor(hex, fallback = "#0A36F7") {
  return lum(hex) > 0.75 ? fallback : (hex || fallback);
}
function contrastText(hex) {
  return lum(hex) > 0.55 ? "#111827" : "#ffffff";
}

export default function WeeklyPlanPage() {
  const { user } = useAuth();
  const raw    = user?.club?.primaryColor || "#0A36F7";
  const accent = safeColor(raw);

  if (user?.role === "club") return <ClubMicrocycles accent={accent} />;
  return <PlayerWeeklyPlan accent={accent} />;
}
