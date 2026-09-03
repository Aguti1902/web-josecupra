import { useMemo, useState, useEffect, Component } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, MessageSquare, Plus, Trash2,
  Edit3, Check, X, ChevronDown, ChevronUp, Star, Save, Clock, Target, Flame,
  Info, PlayCircle, CalendarDays, RefreshCw, Archive, Send, Activity, Scale,
  Phone, ExternalLink, PencilRuler,
} from "lucide-react";
import { useAdmin, mapPlayerToClient } from "../../context/AdminContext";
import { refreshExerciseAcrossPlan, buildMesoPlayerPlan } from "../../lib/playerPlanEngine";
import { isPlayerPro } from "../../lib/subscription";
import { loadPlayerPlan, weekDaysFromPlan } from "../../lib/playerPlanStorage";
import { getChatMessages, sendChatMessage } from "../../lib/internalChat";
import { getWellnessMap, formatWeekLabel, recentWeekKeys } from "../../lib/wellnessLogs";
import { getLoadLogs } from "../../lib/loadLogs";
import { getImprovementSummary } from "../../lib/loadAnalytics";
import { startImpersonation } from "../../lib/adminImpersonation";

const INTENSITY_OPTIONS = ["Baja", "Media", "Alta", "Máxima"];
const TYPE_OPTIONS = [
  { id: "Fuerza", label: "Fuerza" },
  { id: "Velocidad", label: "Velocidad" },
  { id: "Resistencia", label: "Resistencia" },
  { id: "Hipertrofia", label: "Hipertrofia" },
  { id: "Prevención", label: "Prevención" },
  { id: "Movilidad", label: "Movilidad" },
  { id: "Recuperación", label: "Recuperación" },
];
const typeColor = {
  Fuerza: "#0A36F7",
  Velocidad: "#F6CC12",
  Resistencia: "#FB2C39",
  Hipertrofia: "#a855f7",
  Prevención: "#3BC21D",
  Movilidad: "#06b6d4",
  Recuperación: "#64748b",
  // legacy
  Physical: "#F6CC12",
  Technical: "#94a3b8",
  Tactical: "#94a3b8",
  Recovery: "#3BC21D",
  Match: "#FB2C39",
};
const intensityColor = { Baja: "#3BC21D", Media: "#F6CC12", Alta: "#FB2C39", Máxima: "#dc2626", Low: "#3BC21D", Medium: "#F6CC12", High: "#FB2C39", Maximum: "#dc2626" };

function isPremiumClient(client) {
  if (!client) return false;
  if (isPlayerPro(client)) return true;
  const plan = String(client.plan || "").toLowerCase();
  return plan === "player-pro" || plan === "premium" || plan === "pro" || client.billingSource === "manual";
}

function planBuilderUrl(client) {
  const name = encodeURIComponent(client?.name || "");
  return `/admin/plan-builder?clientId=${encodeURIComponent(client.id)}&name=${name}`;
}

class DetailErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 space-y-3">
          <p className="font-bold">Esta ficha no se pudo mostrar.</p>
          <p className="text-red-700">{String(this.state.error?.message || this.state.error)}</p>
          <Link to="/admin/clients" className="text-depro-blue font-semibold hover:underline">← Volver a clientes</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── WEEK PLAN TAB ───────────────────────────────────────────────── */
function PlanTab({ clientId, client }) {
  const { clientPlans, updateSession, addSession, deleteSession, addExercise, updateExercise, deleteExercise, setClientPlan } = useAdmin();
  const raw = clientPlans[clientId];
  const pending = !!(raw?.premiumPending || raw?.planPendingManual);
  const plan = Array.isArray(raw) ? raw : weekDaysFromPlan(raw);
  const premium = isPremiumClient(client);
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingSession, setEditingSession] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(null);
  const [sessionDraft, setSessionDraft] = useState({});
  const [exerciseDraft, setExerciseDraft] = useState({});
  const [newSession, setNewSession] = useState({ title: "", duration: "60 min", intensity: "Media", type: "Fuerza", objective: "", status: "upcoming", exercises: [] });
  const [newExercise, setNewExercise] = useState({ name: "", duration: "15 min", sets: "3", reps: "5", description: "", tips: "", videoUrl: "" });

  const day = plan[selectedDay];

  const startEditSession = (dIdx, sIdx) => { setSessionDraft({ ...plan[dIdx].sessions[sIdx] }); setEditingSession({ dayIdx: dIdx, sessionIdx: sIdx }); };
  const saveSession = () => { updateSession(clientId, editingSession.dayIdx, editingSession.sessionIdx, sessionDraft); setEditingSession(null); };
  const startEditExercise = (dIdx, sIdx, eIdx) => { setExerciseDraft({ ...plan[dIdx].sessions[sIdx].exercises[eIdx] }); setEditingExercise({ dayIdx: dIdx, sessionIdx: sIdx, exIdx: eIdx }); };
  const saveExercise = () => { updateExercise(clientId, editingExercise.dayIdx, editingExercise.sessionIdx, editingExercise.exIdx, exerciseDraft); setEditingExercise(null); };
  const handleAddSession = () => { addSession(clientId, selectedDay, { ...newSession }); setNewSession({ title: "", duration: "60 min", intensity: "Media", type: "Fuerza", objective: "", status: "upcoming", exercises: [] }); setShowAddSession(false); };
  const handleAddExercise = (sIdx) => { addExercise(clientId, selectedDay, sIdx, { ...newExercise }); setNewExercise({ name: "", duration: "15 min", sets: "3", reps: "5", description: "", tips: "", videoUrl: "" }); setShowAddExercise(null); };

  /** Sustituye ejercicio y conserva el cambio en todas las semanas al asignar. */
  const handleRefreshExercise = (dIdx, sIdx, eIdx) => {
    const session = plan[dIdx]?.sessions?.[sIdx];
    const ex = session?.exercises?.[eIdx];
    if (!session || !ex) return;
    const stored = loadPlayerPlan(clientId) || (Array.isArray(plan) ? plan : raw);
    const next = refreshExerciseAcrossPlan(stored, session.id, ex.id, {
      material: client?.material || ["Gimnasio completo"],
      lesiones: client?.lesion || [],
      lesionSubtipo: client?.lesionSubtipo || [],
      edad: client?.age || 22,
      experiencia: client?.experiencia || "intermedio",
      userId: clientId,
    });
    if (next && setClientPlan) {
      setClientPlan(clientId, next);
      return;
    }
    const nextSession = (Array.isArray(next) ? next[dIdx]?.sessions?.[sIdx] : null) || session;
    const refreshed = (nextSession.exercises || [])[eIdx];
    if (!refreshed || refreshed.name === ex.name) return;
    updateExercise(clientId, dIdx, sIdx, eIdx, {
      ...ex,
      ...refreshed,
      name: refreshed.name,
      catalogId: refreshed.catalogId,
      pool: refreshed.pool,
      videoUrl: refreshed.videoUrl || ex.videoUrl,
      slotConstraints: refreshed.slotConstraints || ex.slotConstraints,
      tips: Array.isArray(refreshed.tips) ? refreshed.tips.join(" · ") : (refreshed.tips || ex.tips),
    });
  };

  return (
    <div className="space-y-5">
      {premium && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-bold">Premium · el plan lo creas tú</p>
            <p className="text-amber-800 text-xs mt-0.5">
              {pending
                ? "Pendiente de asignación. Abre el motor de planes, genera las 4 semanas y asígnalas."
                : "Puedes crear o sustituir la rutina desde el motor de planes."}
            </p>
          </div>
          <Link
            to={planBuilderUrl(client)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 flex-shrink-0"
          >
            <PencilRuler size={15} /> Crear plan
          </Link>
        </div>
      )}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Planificación individual real del jugador (servidor + cuenta). Motor de planes físicos: fuerza, velocidad, resistencia, prevención. No entrenamientos técnicos.
      </div>
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {plan.map((d, i) => (
          <button key={d.shortDay} onClick={() => { setSelectedDay(i); setExpandedSession(null); setShowAddSession(false); }}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all text-xs ${
              selectedDay === i ? "bg-depro-blue-light border-depro-blue text-depro-blue font-bold" : "border-depro-border text-depro-gray hover:border-depro-blue/40 bg-white"
            }`}
          >
            <span className="font-bold">{d.shortDay}</span>
            <span>{d.date}</span>
            <span className="text-gray-400">{(d.sessions || []).length} ses.</span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-depro-dark">{day?.day} <span className="text-depro-gray font-normal text-sm">— {day?.date}</span></h3>
        <button onClick={() => setShowAddSession(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue-light hover:bg-blue-100 border border-blue-200 text-depro-blue text-sm font-semibold transition-all">
          <Plus size={15} /> Añadir sesión
        </button>
      </div>

      {/* Add session form */}
      {showAddSession && (
        <div className="rounded-2xl border border-depro-blue/20 bg-depro-blue-light p-5 space-y-3">
          <h4 className="font-semibold text-depro-dark text-sm">Nueva Sesión</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Título de sesión" value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} className="admin-input" />
            <input placeholder="Duración (ej. 90 min)" value={newSession.duration} onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })} className="admin-input" />
            <select value={newSession.type} onChange={(e) => setNewSession({ ...newSession, type: e.target.value })} className="admin-input">
              {TYPE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={newSession.intensity} onChange={(e) => setNewSession({ ...newSession, intensity: e.target.value })} className="admin-input">
              {INTENSITY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <textarea placeholder="Objetivo de la sesión" rows={2} value={newSession.objective} onChange={(e) => setNewSession({ ...newSession, objective: e.target.value })} className="admin-input w-full resize-none" />
          <div className="flex gap-2">
            <button onClick={handleAddSession} className="admin-btn-primary flex items-center gap-2"><Check size={15} /> Añadir</button>
            <button onClick={() => setShowAddSession(false)} className="admin-btn-ghost flex items-center gap-2"><X size={15} /> Cancelar</button>
          </div>
        </div>
      )}

      {day?.sessions.length === 0 && !showAddSession && (
        <div className="text-center py-10 text-depro-gray text-sm bg-depro-gray-light rounded-2xl">Descanso. Sin sesiones este día.</div>
      )}

      {day?.sessions.map((session, sIdx) => {
        const isEditing = editingSession?.dayIdx === selectedDay && editingSession?.sessionIdx === sIdx;
        const isExpanded = expandedSession === sIdx;
        const color = typeColor[session.type] || "#0A36F7";
        return (
          <div key={session.id} className="rounded-2xl border border-depro-border bg-white overflow-hidden shadow-card">
            <div className="flex items-center gap-3 p-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input value={sessionDraft.title} onChange={(e) => setSessionDraft({ ...sessionDraft, title: e.target.value })} className="admin-input text-sm" placeholder="Título" />
                      <input value={sessionDraft.duration} onChange={(e) => setSessionDraft({ ...sessionDraft, duration: e.target.value })} className="admin-input text-sm" placeholder="Duración" />
                      <select value={sessionDraft.type} onChange={(e) => setSessionDraft({ ...sessionDraft, type: e.target.value })} className="admin-input text-sm">
                        {TYPE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                      <select value={sessionDraft.intensity} onChange={(e) => setSessionDraft({ ...sessionDraft, intensity: e.target.value })} className="admin-input text-sm">
                        {INTENSITY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <textarea value={sessionDraft.objective} onChange={(e) => setSessionDraft({ ...sessionDraft, objective: e.target.value })} className="admin-input w-full resize-none text-sm" rows={2} placeholder="Objetivo" />
                    <div className="flex gap-2">
                      <button onClick={saveSession} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"><Save size={13} /> Guardar</button>
                      <button onClick={() => setEditingSession(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"><X size={13} /> Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "15", color }}>{session.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: intensityColor[session.intensity] + "15", color: intensityColor[session.intensity] }}>{session.intensity}</span>
                      <span className="text-xs text-depro-gray flex items-center gap-1"><Clock size={11} />{session.duration}</span>
                    </div>
                    <div className="font-semibold text-depro-dark text-sm">{session.title}</div>
                    <div className="text-xs text-depro-gray mt-0.5">{session.objective}</div>
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEditSession(selectedDay, sIdx)} className="p-1.5 text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light rounded-lg transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => deleteSession(clientId, selectedDay, sIdx)} className="p-1.5 text-depro-gray hover:text-depro-red hover:bg-depro-red-light rounded-lg transition-all"><Trash2 size={14} /></button>
                  <button onClick={() => setExpandedSession(isExpanded ? null : sIdx)} className="p-1.5 text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light rounded-lg transition-all">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-depro-border p-4 space-y-3 bg-depro-gray-light">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-depro-gray uppercase tracking-wider">Ejercicios ({session.exercises.length})</span>
                  <button onClick={() => setShowAddExercise(sIdx)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-depro-blue-light hover:bg-blue-100 text-depro-blue border border-blue-200 font-semibold transition-all">
                    <Plus size={12} /> Añadir
                  </button>
                </div>

                {session.exercises.map((ex, eIdx) => {
                  const isEditingEx = editingExercise?.dayIdx === selectedDay && editingExercise?.sessionIdx === sIdx && editingExercise?.exIdx === eIdx;
                  return (
                    <div key={eIdx} className="bg-white rounded-xl p-3 border border-depro-border shadow-sm">
                      {isEditingEx ? (
                        <div className="space-y-2">
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input value={exerciseDraft.name} onChange={(e) => setExerciseDraft({ ...exerciseDraft, name: e.target.value })} className="admin-input text-sm" placeholder="Nombre" />
                            <input value={exerciseDraft.duration} onChange={(e) => setExerciseDraft({ ...exerciseDraft, duration: e.target.value })} className="admin-input text-sm" placeholder="Duración" />
                            <input value={exerciseDraft.sets} onChange={(e) => setExerciseDraft({ ...exerciseDraft, sets: e.target.value })} className="admin-input text-sm" placeholder="Series" />
                            <input value={exerciseDraft.reps} onChange={(e) => setExerciseDraft({ ...exerciseDraft, reps: e.target.value })} className="admin-input text-sm" placeholder="Reps / duración" />
                          </div>
                          <textarea value={exerciseDraft.description} onChange={(e) => setExerciseDraft({ ...exerciseDraft, description: e.target.value })} className="admin-input w-full resize-none text-sm" rows={2} placeholder="Descripción" />
                          <textarea value={exerciseDraft.tips} onChange={(e) => setExerciseDraft({ ...exerciseDraft, tips: e.target.value })} className="admin-input w-full resize-none text-sm" rows={2} placeholder="Consejos del preparador" />
                          <input value={exerciseDraft.videoUrl} onChange={(e) => setExerciseDraft({ ...exerciseDraft, videoUrl: e.target.value })} className="admin-input text-sm" placeholder="URL vídeo (YouTube, Vimeo...)" />
                          <div className="flex gap-2">
                            <button onClick={saveExercise} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"><Save size={13} /> Guardar</button>
                            <button onClick={() => setEditingExercise(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"><X size={13} /> Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-depro-gray-light border border-depro-border flex items-center justify-center text-xs font-bold text-depro-gray flex-shrink-0 mt-0.5">{eIdx + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-depro-dark text-sm">{ex.name}</div>
                            <div className="text-xs text-depro-gray mt-0.5">{ex.duration} · {ex.sets} series · {ex.reps}</div>
                            {ex.description && <div className="text-xs text-depro-gray mt-1 leading-relaxed">{ex.description}</div>}
                            {ex.tips && <div className="text-xs text-depro-blue mt-1 flex items-center gap-1"><Info size={11} /> {ex.tips}</div>}
                            {ex.videoUrl && ex.videoUrl !== "#" && <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-depro-blue hover:underline mt-1 flex items-center gap-1"><PlayCircle size={11} /> Ver vídeo</a>}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              title="Sustituir por ejercicio compatible"
                              onClick={() => handleRefreshExercise(selectedDay, sIdx, eIdx)}
                              className="p-1.5 text-depro-gray hover:text-depro-blue hover:bg-depro-blue-light rounded-lg transition-all"
                            >
                              <RefreshCw size={13} />
                            </button>
                            <button onClick={() => startEditExercise(selectedDay, sIdx, eIdx)} className="p-1.5 text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light rounded-lg transition-all"><Edit3 size={13} /></button>
                            <button onClick={() => deleteExercise(clientId, selectedDay, sIdx, eIdx)} className="p-1.5 text-depro-gray hover:text-depro-red hover:bg-depro-red-light rounded-lg transition-all"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {showAddExercise === sIdx && (
                  <div className="bg-depro-blue-light border border-blue-200 rounded-xl p-4 space-y-2">
                    <h5 className="text-sm font-semibold text-depro-blue">Nuevo Ejercicio</h5>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input placeholder="Nombre del ejercicio" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Duración (ej. 15 min)" value={newExercise.duration} onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Series (ej. 3)" value={newExercise.sets} onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Reps / duración" value={newExercise.reps} onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })} className="admin-input text-sm" />
                    </div>
                    <textarea placeholder="Descripción" rows={2} value={newExercise.description} onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })} className="admin-input w-full resize-none text-sm" />
                    <textarea placeholder="Consejos del preparador (visibles para el jugador)" rows={2} value={newExercise.tips} onChange={(e) => setNewExercise({ ...newExercise, tips: e.target.value })} className="admin-input w-full resize-none text-sm" />
                    <input placeholder="URL vídeo (YouTube, Vimeo, Drive...)" value={newExercise.videoUrl} onChange={(e) => setNewExercise({ ...newExercise, videoUrl: e.target.value })} className="admin-input text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => handleAddExercise(sIdx)} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"><Check size={13} /> Añadir</button>
                      <button onClick={() => setShowAddExercise(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"><X size={13} /> Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── MONTHLY PLAN TAB ────────────────────────────────────────────── */
function MonthlyPlanTab({ client, clientId }) {
  const stored = loadPlayerPlan(clientId);
  const isPremium = isPlayerPro(client) || client?.plan === "player-pro";
  const weeks = useMemo(() => {
    if (stored?.weeks?.length) return stored.weeks;
    if (stored?.premiumPending || stored?.planPendingManual) return [];
    if (isPremium && !stored?.assignment && !stored?.source) return [];
    try {
      return buildMesoPlayerPlan(client, 4, stored);
    } catch {
      return [];
    }
  }, [client, clientId, stored]);

  if (stored?.premiumPending || (isPremium && !stored?.assignment && !stored?.source && !stored?.weeks)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 space-y-3">
        <p className="font-bold">Premium · rutina pendiente de asignación manual</p>
        <p>El usuario rellenó el cuestionario. Asigna la rutina desde el motor de planes; hasta entonces no debe verse como disponible.</p>
        <Link
          to={planBuilderUrl(client)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700"
        >
          <PencilRuler size={15} /> Crear plan
        </Link>
      </div>
    );
  }

  if (!weeks.length) {
    return (
      <div className="rounded-2xl border border-depro-border bg-depro-gray-light p-8 text-center text-sm text-depro-gray">
        Sin plan mensual todavía. Genera o asigna un plan desde el motor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {isPremium
          ? "Usuario Premium: se muestra la rutina asignada manualmente desde el motor de planes."
          : "Usuario normal: vista del mesociclo / plan mensual generado."}
      </div>
      {weeks.map((w, i) => (
        <div key={w.week || i} className="rounded-2xl border border-depro-border bg-white p-4">
          <div className="font-bold text-depro-dark mb-2">{w.label || `Semana ${w.week || i + 1}`}</div>
          <div className="space-y-1.5">
            {(w.sessions || []).map((s, si) => (
              <div key={s.id || si} className="text-sm flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-depro-gray-light">
                <span className="font-medium text-depro-dark">{s.dayName || s.day || s.title || `Sesión ${si + 1}`}</span>
                <span className="text-xs text-depro-gray">{s.type || s.title || s.duration || ""}</span>
              </div>
            ))}
            {!(w.sessions || []).length && (
              <p className="text-xs text-depro-gray">Sin sesiones en esta semana.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── FEEDBACK TAB ────────────────────────────────────────────────── */
function FeedbackTab({ clientId }) {
  const { clientFeedback, addFeedback, deleteFeedback, archiveFeedback } = useAdmin();
  const all = clientFeedback[clientId] || [];
  const feedbacks = all.filter((f) => !f.archivedAt);
  const archived = all.filter((f) => f.archivedAt);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ week: "", message: "", rating: 8, nextFocus: "", adjustments: "" });

  const handleAdd = () => {
    if (!form.message.trim()) return;
    addFeedback(clientId, {
      week: form.week || `Semana ${feedbacks.length + archived.length + 1}`,
      message: form.message,
      rating: parseInt(form.rating, 10),
      nextFocus: form.nextFocus,
      adjustments: form.adjustments ? form.adjustments.split("\n").filter(Boolean) : [],
      coach: "Preparador",
    });
    setForm({ week: "", message: "", rating: 8, nextFocus: "", adjustments: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-depro-dark">Feedback del preparador físico</h3>
          <p className="text-xs text-depro-gray mt-0.5">
            {feedbacks.length} activos · {archived.length} archivados — solo preparación física (cargas, adherencia, fuerza/velocidad/resistencia)
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-green-light hover:bg-green-100 border border-green-200 text-green-700 text-sm font-semibold transition-all">
          <Plus size={15} /> Nueva revisión
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-green-200 bg-depro-green-light p-5 space-y-3">
          <h4 className="font-semibold text-depro-dark text-sm">Revisión de preparación física</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Semana (ej. Semana 16)" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} className="admin-input" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-depro-gray whitespace-nowrap">Valoración: {form.rating}/10</label>
              <input type="range" min={1} max={10} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="flex-1 accent-depro-blue" />
            </div>
          </div>
          <textarea
            placeholder="Feedback físico: adherencia, cargas, progresión de fuerza/velocidad/resistencia, recuperación…"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="admin-input w-full resize-none"
          />
          <textarea
            placeholder="Ajustes de carga física (uno por línea), ej. −10% volumen fuerza inferior"
            rows={3}
            value={form.adjustments}
            onChange={(e) => setForm({ ...form, adjustments: e.target.value })}
            className="admin-input w-full resize-none"
          />
          <input
            placeholder="Foco físico próxima semana (ej. potencia, VAM, prevención isquios)"
            value={form.nextFocus}
            onChange={(e) => setForm({ ...form, nextFocus: e.target.value })}
            className="admin-input"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="admin-btn-primary flex items-center gap-2"><Check size={15} /> Enviar feedback</button>
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost flex items-center gap-2"><X size={15} /> Cancelar</button>
          </div>
        </div>
      )}

      {feedbacks.map((fb) => (
        <div key={fb.id} className="rounded-2xl border border-depro-border bg-white p-5 group hover:border-depro-blue/30 hover:shadow-card transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-depro-dark">{fb.week}</div>
              <div className="text-xs text-depro-gray">{fb.date}</div>
            </div>
            <div className="flex items-center gap-2">
              {fb.rating != null && (
                <div className="flex items-center gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(fb.rating / 2) ? "fill-depro-yellow text-depro-yellow" : "text-depro-border"} />
                  ))}
                  <span className="text-xs text-depro-gray ml-1">{fb.rating}/10</span>
                </div>
              )}
              <button
                type="button"
                title="Archivar"
                onClick={() => archiveFeedback(clientId, fb.id)}
                className="p-1.5 text-depro-gray hover:text-depro-blue hover:bg-depro-blue-light rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Archive size={14} />
              </button>
              <button onClick={() => deleteFeedback(clientId, fb.id)} className="p-1.5 text-depro-gray hover:text-depro-red hover:bg-depro-red-light rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          </div>
          <p className="text-sm text-depro-gray leading-relaxed mb-3">{fb.message}</p>
          {fb.adjustments?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-bold text-depro-gray mb-1.5 uppercase tracking-wider">Ajustes de carga</div>
              <div className="space-y-1">
                {fb.adjustments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-depro-gray">
                    <Check size={11} className="text-depro-green flex-shrink-0" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}
          {fb.nextFocus && (
            <div className="bg-depro-blue-light border border-blue-100 rounded-xl px-3 py-2 text-xs">
              <span className="text-depro-blue font-semibold">Foco físico: </span>
              <span className="text-depro-gray">{fb.nextFocus}</span>
            </div>
          )}
        </div>
      ))}

      {archived.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-bold uppercase text-depro-gray mb-2">Archivados ({archived.length})</p>
          <div className="space-y-2">
            {archived.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-depro-border bg-depro-gray-light/50 px-4 py-3 text-sm text-depro-gray flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-depro-dark text-xs">{fb.week} · {fb.date}</p>
                  <p className="line-clamp-2 mt-0.5">{fb.message}</p>
                </div>
                <button type="button" onClick={() => deleteFeedback(clientId, fb.id)} className="text-depro-gray hover:text-depro-red shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedbacks.length === 0 && !showForm && (
        <div className="text-center py-10 text-depro-gray text-sm bg-depro-gray-light rounded-2xl">
          Sin revisiones enviadas. El chat de abajo sigue activo.
        </div>
      )}

      <AdminPlayerChat clientId={clientId} />
    </div>
  );
}

function AdminPlayerChat({ clientId }) {
  const [messages, setMessages] = useState(() => getChatMessages(clientId));
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage(clientId, { text, from: "coach", authorName: "Preparador" });
    setMessages(getChatMessages(clientId));
    setText("");
  };

  return (
    <div className="rounded-2xl border border-depro-border bg-white p-5">
      <h4 className="font-bold text-depro-dark mb-1 flex items-center gap-2">
        <MessageSquare size={16} className="text-depro-blue" /> Conversación con el jugador
      </h4>
      <p className="text-xs text-depro-gray mb-3">
        Los mensajes que envías aparecen en su pestaña de feedback. Los que él escribe llegan aquí.
      </p>
      <div className="max-h-64 overflow-y-auto space-y-2 mb-3 bg-depro-gray-light rounded-xl p-3 border border-depro-border">
        {messages.length === 0 && <p className="text-xs text-depro-gray text-center py-4">Sin mensajes aún.</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
              m.from === "coach" || m.from === "admin"
                ? "ml-auto bg-depro-blue text-white"
                : "bg-white border border-depro-border text-depro-dark"
            }`}
          >
            <p>{m.text}</p>
            <p className={`text-[10px] mt-1 ${m.from === "coach" || m.from === "admin" ? "text-white/70" : "text-depro-gray"}`}>
              {m.from === "player" ? (m.authorName || "Jugador") : "Tú"}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="admin-input flex-1 text-sm"
          placeholder="Escribe al jugador…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button type="button" onClick={handleSend} className="admin-btn-primary px-4 flex items-center gap-1">
          <Send size={14} /> Enviar
        </button>
      </div>
    </div>
  );
}

function ProgressionTab({ clientId }) {
  const wellness = getWellnessMap(clientId);
  const weeks = recentWeekKeys(8);
  const logs = getLoadLogs(clientId);
  const summary = getImprovementSummary(clientId) || {};
  const lastWeight = weeks.map((k) => wellness[k]).find((e) => e?.weightKg);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-depro-border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-depro-gray flex items-center gap-1"><Scale size={12} /> Peso corporal</p>
          <p className="text-2xl font-black text-depro-dark mt-1">{lastWeight?.weightKg ? `${lastWeight.weightKg} kg` : "—"}</p>
          <p className="text-xs text-depro-gray mt-1">Último registro wellness</p>
        </div>
        <div className="rounded-2xl border border-depro-border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-depro-gray flex items-center gap-1"><Activity size={12} /> Cargas</p>
          <p className="text-2xl font-black text-depro-dark mt-1">{logs.length}</p>
          <p className="text-xs text-depro-gray mt-1">Sesiones registradas</p>
        </div>
        <div className="rounded-2xl border border-depro-border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-depro-gray flex items-center gap-1"><Flame size={12} /> Progreso</p>
          <p className="text-2xl font-black text-depro-dark mt-1">{summary?.pct != null ? `${summary.pct > 0 ? "+" : ""}${summary.pct}%` : "—"}</p>
          <p className="text-xs text-depro-gray mt-1">{summary?.message || summary?.exerciseName || "Mejoras detectadas"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-depro-border bg-white p-5">
        <h4 className="font-bold text-depro-dark mb-3">Wellness (peso, cintura, fatiga, sueño)</h4>
        <div className="space-y-2">
          {weeks.map((k) => {
            const e = wellness[k];
            return (
              <div key={k} className="flex items-center justify-between text-sm border-b border-depro-border py-2 last:border-0">
                <span className="text-depro-gray">{formatWeekLabel(k)}</span>
                <span className="text-depro-dark font-medium">
                  {e?.weightKg ? `${e.weightKg} kg` : "—"}
                  {e?.waistCm ? ` · ${e.waistCm} cm` : ""}
                  {e?.fatigue ? ` · fatiga ${e.fatigue}` : ""}
                  {e?.sleep ? ` · sueño ${e.sleep}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-depro-border bg-white p-5">
        <h4 className="font-bold text-depro-dark mb-3">Últimos registros de carga</h4>
        {logs.slice(0, 8).length === 0 ? (
          <p className="text-sm text-depro-gray">Aún no hay cargas registradas en este dispositivo/admin.</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 8).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm border-b border-depro-border py-2 last:border-0">
                <span className="text-depro-dark font-medium truncate">{l.exerciseName || l.name || l.sessionTitle || "Sesión"}</span>
                <span className="text-depro-gray text-xs shrink-0 ml-2">
                  {l.weight ? `${l.weight} kg` : ""} {l.reps ? `· ${l.reps} reps` : ""} {l.rpe ? `· RPE ${l.rpe}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PROFILE TAB ─────────────────────────────────────────────────── */
function ProfileTab({ client }) {
  const accent = client.club?.primaryColor || "#0A36F7";
  const phone = client.phone || client.telefono || "";
  const info = [
    { label: "Nombre", value: client.name },
    { label: "Email", value: client.email },
    { label: "Teléfono", value: phone || "—" },
    { label: "Tipo", value: client.role },
    { label: "Plan", value: client.plan },
    { label: "Club", value: client.club?.name },
    { label: "Alta", value: client.joinedDate },
    client.age && { label: "Edad", value: client.age },
    client.level && { label: "Nivel", value: client.level },
    client.trainingDays && { label: "Días entrenamiento/semana", value: client.trainingDays },
    client.objective && { label: "Objetivos", value: client.objective },
    client.disponibles && { label: "Días disponibles", value: Array.isArray(client.disponibles) ? client.disponibles.join(", ") : client.disponibles },
    client.diaCompeticion && { label: "Día competición", value: client.diaCompeticion },
    client.material && { label: "Material", value: Array.isArray(client.material) ? client.material.join(", ") : client.material },
    client.players && { label: "Jugadores en plantilla", value: `${client.players} jugadores` },
    client.deporte && { label: "Deporte", value: client.deporte },
    client.experiencia && { label: "Experiencia", value: client.experiencia },
    client.lesion && { label: "Lesión", value: Array.isArray(client.lesion) ? client.lesion.join(", ") : client.lesion },
  ].filter(Boolean);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-2xl p-6 border" style={{ borderColor: accent + "30", background: `linear-gradient(135deg, ${accent}08 0%, white 100%)` }}>
        <div className="text-xs font-bold text-depro-gray uppercase tracking-wider mb-4">Vista del cliente</div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm" style={{ backgroundColor: accent + "15", color: accent }}>
            {client.club?.logo}
          </div>
          <div>
            <div className="text-xl font-black text-depro-dark">{client.club?.name}</div>
            <div className="text-sm font-bold mt-1" style={{ color: accent }}>{client.plan}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: client.club?.primaryColor }} title="Primary" />
              {client.club?.secondaryColor && <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: client.club?.secondaryColor }} />}
              {client.club?.accentColor && <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: client.club?.accentColor }} />}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-depro-border overflow-hidden shadow-card">
        {info.map((item, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i < info.length - 1 ? "border-b border-depro-border" : ""}`}>
            <div className="text-xs font-semibold text-depro-gray w-40 flex-shrink-0">{item.label}</div>
            <div className="text-sm text-depro-dark font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ───────────────────────────────────────────────────── */
const TABS = [
  { key: "plan", label: "Plan semanal", icon: Calendar },
  { key: "monthly", label: "Plan mensual", icon: CalendarDays },
  { key: "feedback", label: "Feedback", icon: MessageSquare },
  { key: "progress", label: "Progresión", icon: Activity },
  { key: "profile", label: "Perfil", icon: Target },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const clientId = id;
  const { clients, allUsers, clientsLoading, hydrateClientPlan, refreshClients } = useAdmin();
  const [activeTab, setActiveTab] = useState("plan");

  useEffect(() => {
    refreshClients?.();
  }, [refreshClients]);

  useEffect(() => {
    if (clientId) hydrateClientPlan?.(clientId);
  }, [clientId, hydrateClientPlan]);

  const fromList = clients.find((c) => String(c.id) === String(clientId));
  const fromAll = allUsers.find((u) => String(u.id) === String(clientId));
  const mapped = fromList || (fromAll ? mapPlayerToClient(fromAll) : null);
  let client = mapped;
  if (client && !(client.phone || client.telefono)) {
    try {
      const plan = loadPlayerPlan(client.id);
      const snap = plan?.profileSnapshot || plan?._meta?.profileSnapshot || {};
      const fromPlan = snap.phone || snap.telefono || "";
      if (fromPlan) client = { ...client, phone: fromPlan, telefono: fromPlan };
    } catch { /* ignore */ }
  }

  if (!client && clientsLoading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="spinner border-depro-blue/20 border-t-depro-blue" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center text-depro-gray">
        Cliente no encontrado.{" "}
        <Link to="/admin/clients" className="text-depro-blue hover:underline">← Volver</Link>
      </div>
    );
  }

  const accent = client.club?.primaryColor || "#0A36F7";
  const phone = client.phone || client.telefono;
  const premium = isPremiumClient(client);

  const openPanel = () => {
    startImpersonation({ ...fromAll, ...client, id: client.id });
    window.location.assign("/dashboard");
  };

  return (
    <DetailErrorBoundary>
    <div className="max-w-7xl mx-auto">
      <Link to="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-depro-gray hover:text-depro-dark transition-colors mb-6">
        <ArrowLeft size={15} /> Todos los clientes
      </Link>

      {/* Client header */}
      <div className="rounded-3xl p-6 border mb-8" style={{ borderColor: accent + "25", background: `linear-gradient(135deg, ${accent}06 0%, white 100%)` }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-sm" style={{ backgroundColor: accent + "15", color: accent }}>
            {client.club?.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black text-depro-dark">{client.name}</div>
            <div className="text-depro-gray text-sm">{client.club?.name}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>{client.plan}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-gray capitalize">{client.role}</span>
              {client.level && <span className="text-xs px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-gray">{client.level}</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-depro-dark">
              <span>{client.email}</span>
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1 font-bold text-depro-blue">
                  <Phone size={13} /> {phone}
                </a>
              ) : (
                <span className="text-depro-gray inline-flex items-center gap-1"><Phone size={13} /> Sin teléfono</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {premium && (
              <Link
                to={planBuilderUrl(client)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700"
              >
                <PencilRuler size={15} /> Crear plan
              </Link>
            )}
            <button
              type="button"
              onClick={openPanel}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-depro-border bg-white text-sm font-bold text-depro-dark hover:border-depro-blue"
            >
              <ExternalLink size={15} /> Ver panel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-depro-gray-light border border-depro-border rounded-2xl p-1.5 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all ${
              activeTab === tab.key ? "text-white shadow-sm" : "text-depro-gray hover:text-depro-dark hover:bg-white"
            }`}
            style={activeTab === tab.key ? { backgroundColor: accent } : {}}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "plan" && <PlanTab clientId={clientId} client={client} />}
      {activeTab === "monthly" && <MonthlyPlanTab client={client} clientId={clientId} />}
      {activeTab === "feedback" && <FeedbackTab clientId={clientId} />}
      {activeTab === "progress" && <ProgressionTab clientId={clientId} />}
      {activeTab === "profile" && <ProfileTab client={client} />}
    </div>
    </DetailErrorBoundary>
  );
}
