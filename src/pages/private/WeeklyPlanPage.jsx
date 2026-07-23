import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  distributeWeekSessions, distributeMesocycleForTeam, getDayRationale, getSessionType as getPeriodizationSessionType,
  getCurrentWeekIndex, formatDate, getMesocicloWeeks, getWeekDateRange, formatWeekRangeLabel,
} from "../../lib/periodization";
import { getSessionDisplayKey } from "../../lib/mesocycleTemplates";
import {
  Clock, Flame, CheckCircle, Play, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, Video,
  Target, X, Moon, Maximize2, Users, Gauge, Pause, Zap, RefreshCw, Sparkles,
  PencilRuler, Info, AlertTriangle, PlayCircle,
  Activity, Dumbbell, Wind, Layers, TrendingUp, BarChart2, ShieldCheck,
  Timer, Calendar, Sun, Ban, ListChecks, Repeat2, BookOpen, Route, Check,
} from "lucide-react";
import { tacticalGuides } from "../../data/mockData";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam, useIsReadOnly } from "../../context/ViewContext";
import { buildPlayerPlan, buildMesoPlayerPlan, ensurePlayerPlan, buildMinimalSession } from "../../lib/playerPlanEngine";
import { markSessionComplete, touchLastTrain } from "../../lib/sessionProgress";
import CoachSessions from "../../components/private/CoachSessions";
import { downloadSessionPdf, buildClubSessionPdfPayload } from "../../lib/sessionPdf";
import { filterExercisesEnriched } from "../../data/exercises";
import { getTemplate } from "../../lib/planTemplates";
import { getSessionBlocks, BLOCK_LABELS, BLOCK_COLORS, ADMIN_BLOCK_TYPES, sessionMatchesTarget } from "../../lib/sessionBlocks";
import { resolveBlockGuideItems } from "../../lib/blockGuideItems";
import {
  normalizeTaskDesigner, resolveTaskTypes, resolveTaskParams,
  resolveTaskCues, resolveTaskRecommendations,
} from "../../lib/taskDesigner";
import { getYouTubeId, youtubeEmbedUrl, youtubeThumbUrl } from "../../lib/youtube";

const Youtube = PlayCircle;

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
            {ADMIN_BLOCK_TYPES.map((blockType) => {
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
  const [searchParams] = useSearchParams();
  const wantMinimal = searchParams.get("minimal") === "1";
  const planKey = `depro_plan_${user?.id}`;

  const [plan, setPlan]       = useState(null);
  const [generating, setGen]  = useState(false);
  const [view, setView]       = useState("micro"); // "micro" | "meso"
  const [minimalSession, setMinimalSession] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = localStorage.getItem(planKey);
      if (saved) {
        setPlan(JSON.parse(saved));
        return;
      }
    } catch { /* ignore */ }
    const generated = ensurePlayerPlan(user);
    if (generated) setPlan(generated);
  }, [planKey, user?.id]);

  useEffect(() => {
    if (wantMinimal && user) {
      setMinimalSession(buildMinimalSession(user));
    } else {
      setMinimalSession(null);
    }
  }, [wantMinimal, user?.id, user?.material, user?.lesion]);

  const handleGenerate = async () => {
    setGen(true);
    try {
      let generated = buildPlayerPlan(user);
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
          const res = await fetch("/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user,
              sessionType: firstSession.type,
              exercises: pool.slice(0, 30),
              plantilla: getTemplate(firstSession.type).blocks.map((b) => b.label).join(", "),
            }),
          });
          const data = await res.json();
          if (data?.text) {
            generated = generated.map((day, di) => ({
              ...day,
              sessions: day.sessions.map((s, si) =>
                di === 0 && si === 0
                  ? { ...s, aiNotes: data.text, objective: data.text.slice(0, 280) + (data.text.length > 280 ? "…" : "") }
                  : s
              ),
            }));
          }
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
      {minimalSession && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-700">Versión mínima</div>
              <div className="font-black text-depro-dark">Sesión reducida por adherencia</div>
            </div>
            <Link to="/dashboard/plan" className="text-xs font-bold text-amber-700 hover:underline">Ver plan completo</Link>
          </div>
          <SessionCard
            session={minimalSession}
            accentColor={accent}
            sessionNumber={0}
            dayLabel="Hoy"
            onComplete={() => {}}
            onDownloadPdf={() => downloadSessionPdf({
              title: "Sesión mínima",
              subtitle: minimalSession.objective,
              blocks: minimalSession.blocks,
              meta: { duration: minimalSession.duration, type: minimalSession.type },
              brandColor: accent,
            })}
          />
        </div>
      )}
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
      <div className="flex w-full sm:w-auto bg-depro-gray-light rounded-xl p-1 mb-6 border border-depro-border">
        {[
          { id:"micro", label:"Microciclo · Semana", short:"Semana" },
          { id:"meso",  label:"Mesociclo · Mes", short:"Mes" },
        ].map((v) => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              view === v.id ? "bg-white text-depro-blue shadow-sm" : "text-depro-gray hover:text-depro-dark"
            }`}>
            <span className="sm:hidden">{v.short}</span>
            <span className="hidden sm:inline">{v.label}</span>
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
const REC_ICONS = [Maximize2, Repeat2, Clock, Users, Route, Zap, Target, TrendingUp, Timer, Activity, Sun, Dumbbell, Wind, ShieldCheck];

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

/* ─────────────────────────────────────────────
   DISEÑADOR DE TAREAS — multiselección + datos admin
───────────────────────────────────────────── */

function DisenarTareas({ accentColor, sessionType = "A", storageKey, taskDesigner }) {
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
    localStorage.setItem(storageKey, JSON.stringify({ tasks: selectedTasks, sessionType, savedAt: Date.now() }));
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

  const st = ST[sessionType] || ST.A;
  const StIcon = st.Icon;
  const params = resolveTaskParams(td, sessionType);
  const recTexts = resolveTaskRecommendations(td, sessionType);

  return (
    <div className="space-y-5">
      {/* Multiselección tipo de tarea */}
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

      {/* Banner visual */}
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

      {/* Parámetros */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ backgroundColor: st.color + "15", color: st.color }}>
            Parámetros para Sesión {st.label}
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

      {/* Consignas por tarea seleccionada */}
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

      {/* Recomendaciones del día */}
      <div className="bg-depro-gray-light rounded-2xl p-4 border border-depro-border">
        <div className="flex items-center gap-1.5 text-xs font-bold text-depro-dark mb-3">
          <ListChecks size={13} style={{ color: st.color }} /> Recomendaciones del día · Sesión {st.label}
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
            src={youtubeThumbUrl(ytId)}
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
            src={youtubeEmbedUrl(ytId)}
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
   CLUB — SESIÓN con bloques alineados al admin
═══════════════════════════════════════════════════════════ */
function BlockExercisesPanel({ block, accentColor, showBlockVideo = false }) {
  const exercises = block?.exercises || [];
  const blockYt = getYouTubeId(block?.videoUrl);
  const subSessions = block?.subSessions?.length ? block.subSessions : [{ title: block?.label, exercises }];

  return (
    <div className="space-y-4">
      {showBlockVideo && blockYt && (
        <div className="rounded-2xl overflow-hidden border border-depro-border">
          <iframe src={youtubeEmbedUrl(blockYt)}
            title={block.label} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full aspect-video" />
        </div>
      )}
      {subSessions.map((sub) => (
        <div key={sub.id || sub.title} className="space-y-2">
          {subSessions.length > 1 && (
            <h4 className="text-xs font-black uppercase tracking-wide text-depro-gray">{sub.title}</h4>
          )}
          {(sub.exercises || []).length === 0 ? (
            <p className="text-xs text-depro-gray italic py-4 text-center border border-dashed border-depro-border rounded-xl">
              Sin ejercicios en este bloque
            </p>
          ) : (
            (sub.exercises || []).map((ex, i) => (
              <ExerciseCardClub key={ex.id || i} ex={ex} ytId={getYouTubeId(ex.videoUrl)} accentColor={accentColor} />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function BlockTwoColumnLayout({ block, accentColor, panelTitle, panelIcon: PanelIcon, panelColor, infoItems }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BlockExercisesPanel block={block} accentColor={accentColor} showBlockVideo />
        <div>
          <div className="bg-white border border-depro-border rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 pb-2 border-b border-depro-border">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: panelColor + "15" }}>
                <PanelIcon size={14} style={{ color: panelColor }} />
              </div>
              <span className="text-xs font-bold text-depro-dark">{panelTitle}</span>
            </div>
            {infoItems.map((item) => {
              const label = item.label || item.title;
              const value = item.text || item.value;
              return (
                <div key={item.id || label} className="flex items-start gap-3 p-3 rounded-xl bg-depro-gray-light border border-depro-border">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: panelColor + "15" }}>
                    <Info size={13} style={{ color: panelColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                    <div className="text-sm font-semibold text-depro-dark mt-0.5">{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const CLUB_VISIBLE_TABS = ["resumen", "calentamiento", "principal", "tareas"];

function ClubSessionCard({
  session, accentColor, sessionNumber, readOnly = false, taskStorageKey,
  initialExpanded = false, initialTab = "resumen", cardRef,
  clubName = "", teamName = "", clubLogo = "", secondaryColor = "",
}) {
  const safeInitialTab = CLUB_VISIBLE_TABS.includes(initialTab) ? initialTab : "resumen";
  const [expanded, setExpanded]       = useState(initialExpanded);
  const [activeBlock, setActiveBlock] = useState(safeInitialTab);
  const [completion, setCompletion]   = useState(session.completion ?? 0);

  useEffect(() => {
    if (initialExpanded) setExpanded(true);
    if (initialTab) setActiveBlock(CLUB_VISIBLE_TABS.includes(initialTab) ? initialTab : "resumen");
  }, [initialExpanded, initialTab]);

  const sessionType = session.framework || getSessionType(session.intensity);
  const displayKey  = getSessionDisplayKey(session);
  const st          = ST[sessionType] || ST.A;
  const StIcon      = st.Icon;
  const blocks      = getSessionBlocks(session);
  const allExercises = blocks
    .filter((b) => ADMIN_BLOCK_TYPES.includes(b.type))
    .flatMap((b) => b.exercises || []);
  const blockByType = (type) => blocks.find((b) => b.type === type) || { exercises: [], subSessions: [] };

  const BLOCKS = [
    { id: "resumen",       label: "Resumen",                  Icon: BarChart2 },
    { id: "calentamiento", label: BLOCK_LABELS.calentamiento, Icon: Flame,      blockType: "calentamiento" },
    { id: "principal",     label: BLOCK_LABELS.principal,     Icon: ListChecks, blockType: "principal" },
    { id: "tareas",        label: "Diseñar tareas",             Icon: PencilRuler },
  ];

  return (
    <div ref={cardRef} className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card scroll-mt-24">
      {/* ── Header cerrado ── */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="p-5 flex items-center gap-4 hover:bg-depro-gray-light/30 transition-colors">
          {/* Chip sesión */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-black border"
            style={{ backgroundColor: st.bg, color: st.color, borderColor: st.color + "30" }}>
            {displayKey}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {session.assignedDay && <span className="text-[10px] font-bold uppercase tracking-wider text-depro-gray">{session.assignedDay}</span>}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: st.bg, color: st.color, borderColor: st.color + "30" }}>
                <StIcon size={9} /> {displayKey} · {st.label}
              </span>
              {completion === 100 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle size={9} /> Completada
                </span>
              )}
            </div>
            <h3 className="font-black text-depro-dark text-base leading-none mb-2">{session.title || `Sesión ${displayKey}`}</h3>
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
              {allExercises.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-depro-gray">
                  <Layers size={11} className="text-depro-gray" /> {allExercises.length} ejercicio{allExercises.length !== 1 ? "s" : ""}
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
                    <div className="font-black text-depro-dark text-2xl leading-none">{displayKey}</div>
                    <div className="text-sm font-semibold mt-1" style={{ color: st.color }}>{st.label}</div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Duración",   value:session.duration   || "—", Icon: Clock },
                    { label:"Intensidad", value:session.intensity  || "—", Icon: Activity },
                    { label:"Dinámica",   value:st.label,                   Icon: StIcon },
                    { label:"Ejercicios", value:`${allExercises.length} tareas`, Icon: Layers },
                  ].map(({ label, value, Icon: MIcon }) => (
                    <div key={label} className="bg-depro-gray-light rounded-xl p-4 border border-depro-border">
                      <MIcon size={16} className="mb-2" style={{ color: accentColor }} />
                      <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-black text-depro-dark mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                {!readOnly && (
                  <CompletionButton
                    completion={completion}
                    onComplete={() => setCompletion(100)}
                    accentColor={accentColor}
                  />
                )}
                <button type="button"
                  onClick={() => {
                    void downloadSessionPdf(buildClubSessionPdfPayload({
                      session,
                      displayKey,
                      sessionType,
                      accentColor,
                      taskStorageKey,
                      clubName,
                      teamName,
                      clubLogo,
                      secondaryColor,
                    }));
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors">
                  <FileText size={14} /> Descargar PDF
                </button>
              </div>
            )}

            {/* ── CALENTAMIENTO ── */}
            {activeBlock === "calentamiento" && (
              <BlockTwoColumnLayout
                block={blockByType("calentamiento")}
                accentColor={accentColor}
                panelTitle={`Calentamiento · Sesión ${st.label}`}
                panelIcon={Flame}
                panelColor="#F59E0B"
                infoItems={resolveBlockGuideItems(blockByType("calentamiento"), "calentamiento", sessionType)}
              />
            )}

            {/* ── PRINCIPAL ── */}
            {activeBlock === "principal" && (
              <BlockTwoColumnLayout
                block={blockByType("principal")}
                accentColor={accentColor}
                panelTitle={`Principal · Sesión ${st.label}`}
                panelIcon={StIcon}
                panelColor={st.color}
                infoItems={resolveBlockGuideItems(blockByType("principal"), "principal", sessionType)}
              />
            )}

            {/* ── DISEÑAR TAREAS ── */}
            {activeBlock === "tareas" && (
              <DisenarTareas
                accentColor={accentColor}
                sessionType={sessionType}
                storageKey={taskStorageKey}
                taskDesigner={session.taskDesigner}
              />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const targetSessionId = searchParams.get("session");
  const targetTab = searchParams.get("tab") || "resumen";
  const targetWeekParam = searchParams.get("week");
  const sessionRefs = useRef({});
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

  const template = micro?.sessions || [];
  const totalCalendarWeeks = micro ? getMesocicloWeeks(micro.startDate, micro.endDate) : 1;
  const baseWeekSize = Math.max(trainingDays.length || 3, 3);
  const { weeks: mesoWeeksDistributed } = micro
    ? distributeMesocycleForTeam(micro, trainingDays, baseWeekSize, totalCalendarWeeks)
    : { weeks: [] };

  const currentWeekIdx = micro ? getCurrentWeekIndex(micro.startDate, micro.endDate) : 0;
  const defaultWeekIdx = currentWeekIdx < 0 ? 0 : currentWeekIdx;
  const maxWeekIdx = Math.max(mesoWeeksDistributed.length - 1, 0);
  const parsedWeek = targetWeekParam != null ? parseInt(targetWeekParam, 10) : null;
  const viewWeekIdx = parsedWeek != null && !Number.isNaN(parsedWeek)
    ? Math.min(Math.max(parsedWeek, 0), maxWeekIdx)
    : Math.min(defaultWeekIdx, maxWeekIdx);

  const distributedWeekSessions = micro
    ? (mesoWeeksDistributed.length > 0
        ? mesoWeeksDistributed[viewWeekIdx]?.sessions || []
        : trainingDays.length > 0
          ? distributeWeekSessions(template, trainingDays)
          : template)
    : [];

  const weekDateRange = micro?.startDate ? getWeekDateRange(micro.startDate, viewWeekIdx) : null;
  const defaultViewWeek = Math.min(defaultWeekIdx, maxWeekIdx);

  const changeWeek = (nextIdx) => {
    const clamped = Math.min(Math.max(nextIdx, 0), maxWeekIdx);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (clamped === defaultViewWeek) next.delete("week");
      else next.set("week", String(clamped));
      return next;
    }, { replace: true });
  };

  const changeMesocycle = (nextIdx) => {
    const clamped = Math.min(Math.max(nextIdx, 0), visiblePlans.length - 1);
    setSelectedIdx(clamped);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("week");
      next.delete("session");
      next.delete("tab");
      next.delete("day");
      next.delete("date");
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    if (!targetSessionId || !distributedWeekSessions.length) return;
    const timer = setTimeout(() => {
      const el = sessionRefs.current[targetSessionId];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [targetSessionId, distributedWeekSessions, viewWeekIdx]);

  if (!micro) return (
    <div className="p-8 text-center text-depro-gray">
      <p className="font-medium">No hay mesociclos asignados a tu equipo todavía.</p>
      <p className="text-sm mt-1 opacity-60">El preparador los añadirá desde el panel de administración.</p>
    </div>
  );


  const currentWeekCombination = mesoWeeksDistributed[viewWeekIdx]?.combination || "";

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
            ? "Semana actual del mesociclo"
            : `${activeTeam?.name || ""}${userTeamCategory ? ` (${userTeamCategory})` : ""}${userAgeBlock ? ` · ${userAgeBlock}` : ""}`}
        </p>
        {!isCoordinator && micro.startDate && weekDateRange?.start && (
          <div className="mt-2 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-depro-blue-light/40 border border-depro-blue/20 text-xs">
            <Calendar size={11} className="text-depro-blue" />
            <span className="text-depro-dark font-bold">{formatWeekRangeLabel(micro.startDate, viewWeekIdx)}</span>
            {currentWeekCombination && (
              <span className="font-black text-depro-blue">{currentWeekCombination}</span>
            )}
            <span className="text-depro-gray">· {micro.label}</span>
          </div>
        )}
      </div>

      {/* Navegación mesociclos */}
      {visiblePlans.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button type="button" disabled={selectedIdx <= 0} onClick={() => changeMesocycle(selectedIdx - 1)}
            className="p-2 rounded-xl border border-depro-border bg-white text-depro-gray hover:text-depro-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <div className="text-xs font-bold text-depro-gray uppercase tracking-wide">Mesociclo</div>
            <div className="font-black text-depro-dark truncate">{micro.label || micro.code}</div>
            {micro.startDate && (
              <div className="text-[10px] text-depro-gray">{formatDate(micro.startDate)} → {formatDate(micro.endDate)}</div>
            )}
          </div>
          <button type="button" disabled={selectedIdx >= visiblePlans.length - 1} onClick={() => changeMesocycle(selectedIdx + 1)}
            className="p-2 rounded-xl border border-depro-border bg-white text-depro-gray hover:text-depro-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Selector de mesociclos (acceso rápido) */}
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

      {/* Navegación semanal */}
      {mesoWeeksDistributed.length > 0 && micro?.startDate && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl border border-depro-border bg-white">
          <button type="button" disabled={viewWeekIdx <= 0} onClick={() => changeWeek(viewWeekIdx - 1)}
            className="p-2 rounded-xl border border-depro-border bg-depro-gray-light/50 text-depro-dark hover:bg-depro-gray-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center min-w-0">
            <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">
              Semana {viewWeekIdx + 1} de {mesoWeeksDistributed.length}
            </div>
            <div className="font-black text-depro-dark">{formatWeekRangeLabel(micro.startDate, viewWeekIdx)}</div>
            {currentWeekCombination && (
              <div className="text-xs font-bold text-depro-blue mt-0.5">{currentWeekCombination}</div>
            )}
            {viewWeekIdx === defaultViewWeek && (
              <div className="text-[10px] text-green-700 font-bold mt-1">Semana en curso</div>
            )}
          </div>
          <button type="button" disabled={viewWeekIdx >= maxWeekIdx} onClick={() => changeWeek(viewWeekIdx + 1)}
            className="p-2 rounded-xl border border-depro-border bg-depro-gray-light/50 text-depro-dark hover:bg-depro-gray-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Resumen semanal (solo esta semana) */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, ${accent}04 100%)`, border: `1px solid ${accent}25` }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black flex-shrink-0" style={{ backgroundColor: accent + "20", color: accent }}>
          S{viewWeekIdx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-depro-gray uppercase tracking-wide">Semana {viewWeekIdx + 1}</div>
          <div className="font-black text-depro-dark">{formatWeekRangeLabel(micro.startDate, viewWeekIdx)}</div>
          <div className="text-xs text-depro-gray">
            {micro.label}
            {currentWeekCombination ? ` · ${currentWeekCombination}` : ""}
          </div>
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
          const sType = s.framework || getPeriodizationSessionType(s.intensity);
          const displayKey = getSessionDisplayKey(s);
          const typeColors = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", D: "#10B981" };
          const taskKey = clubId && userTeamId ? `depro_club_tasks_${clubId}_${userTeamId}_${s.id || idx}` : null;
          const matchesTarget = sessionMatchesTarget(s, targetSessionId);
          return (
            <div key={s.id || idx}>
              {s.assignedDay && !isCoordinator && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: typeColors[sType] ?? accent }}>
                    {s.assignedDay}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: (typeColors[sType] ?? accent) + "18", color: typeColors[sType] ?? accent }}>
                    {displayKey} · {ST[sType]?.label || "Sesión"}
                  </span>
                  <span className="text-[10px] text-depro-gray hidden sm:block">{getDayRationale(s.assignedDay, sType)}</span>
                </div>
              )}
              <ClubSessionCard
                key={`${s.id}-${viewWeekIdx}-${matchesTarget ? targetSessionId : ""}`}
                session={s}
                accentColor={accent}
                sessionNumber={idx + 1}
                readOnly={isReadOnly}
                taskStorageKey={taskKey}
                clubName={user?.club?.name || ""}
                teamName={activeTeam?.name || ""}
                clubLogo={user?.club?.logo || ""}
                secondaryColor={user?.club?.secondaryColor || ""}
                initialExpanded={matchesTarget}
                initialTab={matchesTarget ? targetTab : "resumen"}
                cardRef={(el) => {
                  if (s.id) sessionRefs.current[s.id] = el;
                  if (s._sourceTemplateId) sessionRefs.current[s._sourceTemplateId] = el;
                }}
              />
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

  let content;
  if (user?.role === "club" && user?.club?.isSoloCoach) {
    content = <CoachSessions club={user.club} team={user.team} user={user} />;
  } else if (user?.role === "club") {
    content = <ClubMicrocycles accent={accent} />;
  } else {
    content = <PlayerWeeklyPlan accent={accent} />;
  }

  return content;
}
