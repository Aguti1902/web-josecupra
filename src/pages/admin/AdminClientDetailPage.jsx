import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, MessageSquare, Plus, Trash2,
  Edit3, Check, X, ChevronDown, ChevronUp, Star, Save, Clock, Target, Flame,
  Info, PlayCircle, CalendarDays, RefreshCw,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { refreshExercise as refreshExerciseInEngine, buildMesoPlayerPlan } from "../../lib/playerPlanEngine";
import { isPlayerPro } from "../../lib/subscription";
import { loadPlayerPlan } from "../../lib/playerPlanStorage";

const INTENSITY_OPTIONS = ["Low", "Medium", "High", "Maximum"];
const TYPE_OPTIONS = ["Technical", "Physical", "Tactical", "Recovery", "Match"];
const typeColor = { Technical: "#0A36F7", Physical: "#F6CC12", Recovery: "#3BC21D", Tactical: "#a855f7", Match: "#FB2C39" };
const intensityColor = { Low: "#3BC21D", Medium: "#F6CC12", High: "#FB2C39", Maximum: "#dc2626" };

/* ── WEEK PLAN TAB ───────────────────────────────────────────────── */
function PlanTab({ clientId }) {
  const { clientPlans, updateSession, addSession, deleteSession, addExercise, updateExercise, deleteExercise } = useAdmin();
  const plan = clientPlans[clientId] || [];
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingSession, setEditingSession] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(null);
  const [sessionDraft, setSessionDraft] = useState({});
  const [exerciseDraft, setExerciseDraft] = useState({});
  const [newSession, setNewSession] = useState({ title: "", duration: "60 min", intensity: "Medium", type: "Technical", objective: "", status: "upcoming", exercises: [] });
  const [newExercise, setNewExercise] = useState({ name: "", duration: "15 min", sets: "3", reps: "5", description: "", tips: "", videoUrl: "" });

  const day = plan[selectedDay];

  const startEditSession = (dIdx, sIdx) => { setSessionDraft({ ...plan[dIdx].sessions[sIdx] }); setEditingSession({ dayIdx: dIdx, sessionIdx: sIdx }); };
  const saveSession = () => { updateSession(clientId, editingSession.dayIdx, editingSession.sessionIdx, sessionDraft); setEditingSession(null); };
  const startEditExercise = (dIdx, sIdx, eIdx) => { setExerciseDraft({ ...plan[dIdx].sessions[sIdx].exercises[eIdx] }); setEditingExercise({ dayIdx: dIdx, sessionIdx: sIdx, exIdx: eIdx }); };
  const saveExercise = () => { updateExercise(clientId, editingExercise.dayIdx, editingExercise.sessionIdx, editingExercise.exIdx, exerciseDraft); setEditingExercise(null); };
  const handleAddSession = () => { addSession(clientId, selectedDay, { ...newSession }); setNewSession({ title: "", duration: "60 min", intensity: "Medium", type: "Technical", objective: "", status: "upcoming", exercises: [] }); setShowAddSession(false); };
  const handleAddExercise = (sIdx) => { addExercise(clientId, selectedDay, sIdx, { ...newExercise }); setNewExercise({ name: "", duration: "15 min", sets: "3", reps: "5", description: "", tips: "", videoUrl: "" }); setShowAddExercise(null); };

  /** Sustituye ejercicio por otro compatible del mismo slot (PDF §3.4). */
  const handleRefreshExercise = (dIdx, sIdx, eIdx) => {
    const session = plan[dIdx]?.sessions?.[sIdx];
    const ex = session?.exercises?.[eIdx];
    if (!session || !ex) return;
    const next = refreshExerciseInEngine(session, ex.id, {
      material: ["Gimnasio completo"],
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
      userId: clientId,
    });
    const refreshed = (next.exercises || [])[eIdx];
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Plan sincronizado con el jugador (<code className="text-xs">depro_plan_{clientId}</code>). Los cambios se reflejan en su perfil.
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
            <span className="text-gray-400">{d.sessions.length} ses.</span>
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
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
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
                        {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
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
      return buildMesoPlayerPlan(client, 4);
    } catch {
      return [];
    }
  }, [client, clientId, stored]);

  if (stored?.premiumPending || (isPremium && !stored?.assignment && !stored?.source && !stored?.weeks)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 space-y-2">
        <p className="font-bold">Premium · rutina pendiente de asignación manual</p>
        <p>El usuario rellenó el cuestionario. Asigna la rutina desde el motor de planes; hasta entonces no debe verse como disponible.</p>
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
  const { clientFeedback, addFeedback, deleteFeedback } = useAdmin();
  const feedbacks = clientFeedback[clientId] || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ week: "", message: "", rating: 8, nextFocus: "", adjustments: "" });

  const handleAdd = () => {
    if (!form.message) return;
    addFeedback(clientId, {
      week: form.week || `Semana ${feedbacks.length + 1}`,
      message: form.message,
      rating: parseInt(form.rating),
      nextFocus: form.nextFocus,
      adjustments: form.adjustments ? form.adjustments.split("\n").filter(Boolean) : [],
    });
    setForm({ week: "", message: "", rating: 8, nextFocus: "", adjustments: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-depro-dark">Feedback del preparador</h3>
          <p className="text-xs text-depro-gray mt-0.5">{feedbacks.length} revisiones enviadas</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-green-light hover:bg-green-100 border border-green-200 text-green-700 text-sm font-semibold transition-all">
          <Plus size={15} /> Nueva revisión
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-green-200 bg-depro-green-light p-5 space-y-3">
          <h4 className="font-semibold text-depro-dark text-sm">Revisión semanal</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Semana (ej. Semana 16)" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} className="admin-input" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-depro-gray whitespace-nowrap">Valoración: {form.rating}/10</label>
              <input type="range" min={1} max={10} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="flex-1 accent-depro-blue" />
            </div>
          </div>
          <textarea placeholder="Escribe el feedback para este jugador/club..." rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="admin-input w-full resize-none" />
          <textarea placeholder="Ajustes realizados (uno por línea)" rows={3} value={form.adjustments} onChange={(e) => setForm({ ...form, adjustments: e.target.value })} className="admin-input w-full resize-none" />
          <input placeholder="Foco para la próxima semana" value={form.nextFocus} onChange={(e) => setForm({ ...form, nextFocus: e.target.value })} className="admin-input" />
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(fb.rating / 2) ? "fill-depro-yellow text-depro-yellow" : "text-depro-border"} />
                ))}
                <span className="text-xs text-depro-gray ml-1">{fb.rating}/10</span>
              </div>
              <button onClick={() => deleteFeedback(clientId, fb.id)} className="p-1.5 text-depro-gray hover:text-depro-red hover:bg-depro-red-light rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          </div>
          <p className="text-sm text-depro-gray leading-relaxed mb-3">{fb.message}</p>
          {fb.adjustments?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-bold text-depro-gray mb-1.5 uppercase tracking-wider">Ajustes</div>
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
              <span className="text-depro-blue font-semibold">Próximo foco: </span>
              <span className="text-depro-gray">{fb.nextFocus}</span>
            </div>
          )}
        </div>
      ))}

      {feedbacks.length === 0 && !showForm && (
        <div className="text-center py-10 text-depro-gray text-sm bg-depro-gray-light rounded-2xl">Sin feedback aún.</div>
      )}
    </div>
  );
}

/* ── PROFILE TAB ─────────────────────────────────────────────────── */
function ProfileTab({ client }) {
  const accent = client.club?.primaryColor || "#0A36F7";
  const info = [
    { label: "Nombre", value: client.name },
    { label: "Email", value: client.email },
    (client.phone || client.telefono) && { label: "Teléfono", value: client.phone || client.telefono },
    { label: "Tipo", value: client.role },
    { label: "Plan", value: client.plan },
    { label: "Club", value: client.club?.name },
    { label: "Alta", value: client.joinedDate },
    client.age && { label: "Edad", value: client.age },
    client.level && { label: "Nivel", value: client.level },
    client.trainingDays && { label: "Días entrenamiento/semana", value: client.trainingDays },
    client.disponibles && { label: "Días disponibles", value: Array.isArray(client.disponibles) ? client.disponibles.join(", ") : client.disponibles },
    client.diaCompeticion && { label: "Día competición", value: client.diaCompeticion },
    client.material && { label: "Material", value: Array.isArray(client.material) ? client.material.join(", ") : client.material },
    client.players && { label: "Jugadores en plantilla", value: `${client.players} jugadores` },
    client.objective && { label: "Objetivo", value: client.objective },
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
  { key: "profile", label: "Perfil", icon: Target },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const clientId = id;
  const { clients } = useAdmin();
  const [activeTab, setActiveTab] = useState("plan");

  const client = clients.find((c) => String(c.id) === String(clientId));
  if (!client) {
    return (
      <div className="p-8 text-center text-depro-gray">
        Cliente no encontrado.{" "}
        <Link to="/admin/clients" className="text-depro-blue hover:underline">← Volver</Link>
      </div>
    );
  }

  const accent = client.club?.primaryColor || "#0A36F7";

  return (
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
          </div>
          <div className="text-sm text-depro-gray">{client.email}</div>
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

      {activeTab === "plan" && <PlanTab clientId={clientId} />}
      {activeTab === "monthly" && <MonthlyPlanTab client={client} clientId={clientId} />}
      {activeTab === "feedback" && <FeedbackTab clientId={clientId} />}
      {activeTab === "profile" && <ProfileTab client={client} />}
    </div>
  );
}
