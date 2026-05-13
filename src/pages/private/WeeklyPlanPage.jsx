import { useState, useEffect } from "react";
import {
  Clock, Flame, CheckCircle, Play, ChevronDown, ChevronUp, FileText, Video,
  Target, X, Moon, Maximize2, Users, Gauge, Pause, Zap, RefreshCw, Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubWeeklyPlan } from "../../data/mockData";
import { getDayObjectives, filterExercises } from "../../data/exercises";

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
        </div>
        <div className="aspect-video bg-depro-gray-light rounded-2xl mb-5 flex items-center justify-center border border-depro-border group cursor-pointer hover:border-depro-blue transition-colors">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: accent + "15" }}>
              <Play size={24} style={{ color: accent }} />
            </div>
            <p className="text-xs text-depro-gray">Reproducir vídeo</p>
          </div>
        </div>
        <p className="text-depro-gray leading-relaxed mb-5 text-sm">{exercise.description}</p>
        <div className="rounded-xl p-4 border text-sm mb-5" style={{ backgroundColor: accent + "08", borderColor: accent + "20" }}>
          <div className="font-bold text-depro-dark mb-2 flex items-center gap-1.5">
            <Target size={14} style={{ color: accent }} /> Tips del preparador
          </div>
          <p className="text-depro-gray">{exercise.tips}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-all">
            <FileText size={15} /> Descargar PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: accent }}>
            <CheckCircle size={15} /> Completar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SESSION CARD (jugador)
───────────────────────────────────────────── */
function SessionCard({ session, accentColor }) {
  const [expanded, setExpanded] = useState(session.status === "today");
  const [selectedEx, setSelectedEx] = useState(null);
  const [completion, setCompletion] = useState(session.status === "completed" ? 100 : session.status === "today" ? 0 : 0);
  const color = typeColor[session.type] || accentColor;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${session.status === "today" ? "border-depro-blue shadow-depro" : "border-depro-border shadow-card"}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-depro-gray-light/50 transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
          {completion === 100 ? <CheckCircle size={20} style={{ color: "#3BC21D" }} /> :
           session.status === "today" ? <Flame size={20} style={{ color }} /> :
           <Play size={20} style={{ color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "15", color }}>{session.type}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: intensityColor[session.intensity] + "15", color: intensityColor[session.intensity] }}>{session.intensity}</span>
            {completion === 100 && <span className="tag-green text-xs">Completada</span>}
            {session.status === "today" && completion < 100 && <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse bg-depro-blue text-white">HOY</span>}
          </div>
          <div className="font-bold text-depro-dark">{session.title}</div>
          <div className="text-xs text-depro-gray mt-0.5">{session.objective}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-depro-gray text-xs">
          <span className="flex items-center gap-1"><Clock size={12} /> {session.duration}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Barra de % cumplimiento */}
      {completion > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1">
            <span>Cumplimiento</span>
            <span style={{ color: completion === 100 ? "#3BC21D" : accentColor }}>{completion}%</span>
          </div>
          <div className="h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${completion}%`, backgroundColor: completion === 100 ? "#3BC21D" : accentColor }}
            />
          </div>
        </div>
      )}

      {expanded && session.exercises && session.exercises.length > 0 && (
        <div className="px-5 pb-5 border-t border-depro-border">
          <div className="pt-4 space-y-2">
            {session.exercises.map((ex, i) => (
              <button key={i} onClick={() => setSelectedEx(ex)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-depro-gray-light hover:bg-depro-blue-light border border-transparent hover:border-blue-100 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0" style={{ backgroundColor: color + "15", color }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-depro-dark">{ex.name}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <ConditionPill Icon={Clock} label={ex.duration} color={color} />
                    <ConditionPill Icon={Gauge} label={`${ex.sets} series`} />
                    <ConditionPill Icon={Pause} label={ex.reps} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-depro-gray opacity-0 group-hover:opacity-100 transition-opacity">
                  <Video size={13} /> Ver
                </div>
              </button>
            ))}
          </div>

          {/* Slider de cumplimiento + acciones */}
          {completion < 100 && (
            <div className="mt-5 bg-depro-gray-light/50 rounded-xl p-4 border border-depro-border">
              <div className="flex items-center justify-between text-xs font-bold text-depro-dark mb-2">
                <span>Marca el % completado</span>
                <span style={{ color: accentColor }}>{completion}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5" value={completion}
                onChange={(e) => setCompletion(Number(e.target.value))}
                className="w-full accent-current"
                style={{ accentColor }}
              />
              <button
                onClick={() => setCompletion(100)}
                className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                <CheckCircle size={15} /> Marcar como completada (100%)
              </button>
            </div>
          )}
        </div>
      )}
      {selectedEx && <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} accent={accentColor} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA JUGADOR
───────────────────────────────────────────── */
// ── Generador local de plan semanal (motor de reglas) ───────
function buildLocalPlan(user) {
  const objetivo   = user?.objetivo  || "fuerza";
  const frecuencia = user?.frecuencia || "3";
  const material   = (user?.material || "sin_material").toLowerCase().replace(/\s|\//g,"_").replace("barra_gimnasio","barra");
  const lesiones   = (user?.lesion   || []).map((l) => l.toLowerCase());

  const dayObjectives = getDayObjectives(objetivo, frecuencia);
  const diasSemana = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const shorts     = ["L","M","X","J","V","S","D"];
  const n = dayObjectives.length;

  return diasSemana.map((nombre, i) => {
    if (i >= n) return { day: nombre, shortDay: shorts[i], date: `${nombre} ${i+1}`, sessions: [] };

    const dayObj = dayObjectives[i];
    const pool   = filterExercises({ etiquetas: dayObj.etiquetas, material, lesiones });

    // Selección pseudoaleatoria pero determinista basada en índice
    const picked = pool.filter((_, idx) => idx % 2 === 0).slice(0, 7);

    const session = {
      id:         `gen_${i}`,
      type:       dayObj.tipo,
      title:      `${dayObj.tipo} · Sesión ${i+1}`,
      objective:  `Trabaja ${dayObj.etiquetas.slice(0,2).join(", ")} según tu objetivo de ${objetivo}.`,
      duration:   "60 min",
      intensity:  "Medium",
      status:     "pending",
      exercises:  picked.map((ex, ei) => ({
        id:          `${ex.id}_${ei}`,
        name:        ex.nombre,
        duration:    "40\"",
        sets:        3,
        reps:        ex.etiquetas.includes("isometrico") ? "20-30\"" : "10-12",
        description: `Ejecuta correctamente. Material: ${ex.material.replace(/_/g," ")}.`,
        tips:        ex.contraindicado.length > 0 ? `Cuidado si tienes problemas en: ${ex.contraindicado.join(", ")}.` : "Mantén la técnica durante toda la serie.",
      })),
    };

    return { day: nombre, shortDay: shorts[i], date: `${nombre} ${i+1}`, sessions: [session] };
  });
}

function PlayerWeeklyPlan({ accent }) {
  const { user } = useAuth();
  const planKey = `depro_plan_${user?.id}`;

  const [plan, setPlan]       = useState(null);
  const [generating, setGen]  = useState(false);
  const [selectedDay, setDay] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(planKey);
      if (saved) setPlan(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [planKey]);

  const handleGenerate = () => {
    setGen(true);
    setTimeout(() => {
      const generated = buildLocalPlan(user);
      setPlan(generated);
      localStorage.setItem(planKey, JSON.stringify(generated));
      setGen(false);
    }, 1400);
  };

  const handleReset = () => {
    if (!confirm("¿Regenerar el plan? Se perderán los cambios actuales.")) return;
    localStorage.removeItem(planKey);
    setPlan(null);
  };

  // Marcar sesión como completada
  const handleComplete = (dayIdx, sessionId) => {
    if (!plan) return;
    const updated = plan.map((d, di) =>
      di === dayIdx
        ? { ...d, sessions: d.sessions.map((s) => s.id === sessionId ? { ...s, status: "completed" } : s) }
        : d
    );
    setPlan(updated);
    localStorage.setItem(planKey, JSON.stringify(updated));
  };

  // ── Sin plan generado ──────────────────────────────────────
  if (!plan) {
    const hasProfile = !!(user?.objetivo || user?.frecuencia);
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Plan semanal</h1>
        <p className="text-depro-gray text-sm mb-8">Tu plan personalizado generado según tu perfil.</p>

        <div className="bg-white border border-depro-border rounded-2xl p-8 text-center shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-depro-blue/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={30} className="text-depro-blue" />
          </div>
          <h2 className="text-xl font-bold text-depro-dark mb-2">
            {hasProfile ? "Tu plan está listo para generarse" : "Completa tu perfil primero"}
          </h2>
          {hasProfile ? (
            <>
              <p className="text-depro-gray text-sm mb-2">Se generará un plan de <strong>{user?.frecuencia}</strong> días / semana con objetivo <strong>{user?.objetivo}</strong>.</p>
              {user?.lesion?.length > 0 && (
                <p className="text-xs text-amber-600 mb-4">Lesiones excluidas: {user.lesion.join(", ")}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-depro-blue text-white font-bold rounded-xl hover:bg-depro-blue-dark transition-colors mt-4 disabled:opacity-60"
              >
                {generating ? <><RefreshCw size={16} className="animate-spin" /> Generando…</> : <><Zap size={16} /> Generar mi plan</>}
              </button>
            </>
          ) : (
            <>
              <p className="text-depro-gray text-sm mb-5">Necesitamos conocer tu objetivo, frecuencia y material disponible.</p>
              <a href="/comprar" className="inline-flex items-center gap-2 px-6 py-3 bg-depro-blue text-white font-bold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm">
                Completar perfil
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  const day = plan[selectedDay];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Plan semanal</h1>
          <p className="text-depro-gray text-sm">Objetivo: <strong>{user?.objetivo}</strong> · {user?.frecuencia}</p>
        </div>
        <button
          onClick={handleReset}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-depro-gray border border-depro-border px-3 py-2 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors"
        >
          <RefreshCw size={13} /> Regenerar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {plan.map((d, i) => {
          const s       = d.sessions[0];
          const isDone  = s?.status === "completed";
          const isRest  = d.sessions.length === 0;
          const isSel   = selectedDay === i;
          return (
            <button key={d.shortDay} onClick={() => setDay(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${
                isSel ? "border-depro-blue text-depro-blue bg-depro-blue-light" :
                "border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-blue/30 bg-white"
              }`}
            >
              <span className="text-xs font-bold">{d.shortDay}</span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isRest ? "bg-depro-gray-light text-gray-400" : ""}`}
                style={isDone ? { backgroundColor: "#3BC21D", color: "#fff" } : !isRest ? { backgroundColor: accent + "20", color: accent } : {}}
              >
                {isDone ? "✓" : isRest ? "–" : s?.sessions?.length || "▶"}
              </div>
              {d.sessions[0]?.type && <span className="text-[10px] text-depro-gray text-center leading-tight max-w-[52px] truncate">{d.sessions[0].type}</span>}
            </button>
          );
        })}
      </div>

      {day.sessions.length > 0 ? (
        <div className="space-y-4">
          {day.sessions.map((session) => (
            <div key={session.id} className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: accent + "15", color: accent }}>{session.type}</span>
                    <h3 className="text-lg font-bold text-depro-dark">{session.title}</h3>
                    <p className="text-sm text-depro-gray mt-0.5">{session.objective}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-depro-gray flex-shrink-0">
                    <Clock size={12} /> {session.duration}
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {session.exercises.map((ex, ei) => (
                    <div key={ex.id} className="flex items-center gap-3 py-2.5 px-3 bg-depro-gray-light rounded-xl">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: accent + "15", color: accent }}>{ei + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-depro-dark">{ex.name}</div>
                        <div className="text-xs text-depro-gray">{ex.duration} · {ex.sets} series · {ex.reps}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {session.status === "completed" ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold text-sm">
                    <CheckCircle size={16} /> Sesión completada ✓
                  </div>
                ) : (
                  <button
                    onClick={() => handleComplete(selectedDay, session.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accent }}
                  >
                    <CheckCircle size={15} /> Marcar como completada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-depro-border rounded-2xl text-center py-16 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
            <Moon size={26} className="text-depro-gray" />
          </div>
          <h3 className="text-lg font-bold text-depro-dark mb-2">Día de descanso</h3>
          <p className="text-depro-gray text-sm max-w-xs mx-auto">El descanso es parte del plan. Deja que tu cuerpo se adapte y crezca.</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLUB — SESIÓN CERRADA con iconografía condicional
───────────────────────────────────────────── */
function ClubSessionCard({ session, accentColor }) {
  const [expanded, setExpanded] = useState(false);
  const [completion, setCompletion] = useState(session.completion ?? 0);
  const color = typeColor[session.type] || accentColor;

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden shadow-card">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="p-5 flex items-start gap-4 hover:bg-depro-gray-light/40 transition-colors">
          {/* Icono tipo */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
            {completion === 100 ? <CheckCircle size={20} style={{ color: "#3BC21D" }} /> : <Play size={20} style={{ color }} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-depro-gray">{session.day}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "15", color }}>{session.type}</span>
              {completion === 100 && <span className="tag-green text-xs">Completada</span>}
            </div>
            <h3 className="font-bold text-depro-dark text-base mb-1">{session.title}</h3>
            <p className="text-xs text-depro-gray leading-relaxed mb-3">{session.objective}</p>

            {/* Iconografía condicional cerrada: tiempo, espacio, jugadores, intensidad */}
            <div className="flex flex-wrap items-center gap-1.5">
              <ConditionPill Icon={Clock}     label={session.duration}              color={accentColor} />
              <ConditionPill Icon={Maximize2} label={session.space}                 color={accentColor} />
              <ConditionPill Icon={Users}     label={`${session.players} jug.`}     color={accentColor} />
              <ConditionPill Icon={Flame}     label={session.intensity}             color={intensityColor[session.intensity]} />
            </div>
          </div>

          <div className="flex-shrink-0 text-depro-gray">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Barra de % */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1">
            <span>Cumplimiento</span>
            <span style={{ color: completion === 100 ? "#3BC21D" : accentColor }}>{completion}%</span>
          </div>
          <div className="h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${completion}%`, backgroundColor: completion === 100 ? "#3BC21D" : accentColor }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-depro-border">
          {/* Vídeo cerrado */}
          <div className="mt-4 aspect-video bg-depro-gray-light rounded-2xl flex items-center justify-center border border-depro-border group cursor-pointer hover:border-depro-blue transition-colors">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: accentColor + "15" }}>
                <Play size={24} style={{ color: accentColor }} />
              </div>
              <p className="text-xs text-depro-gray">Reproducir vídeo de la sesión</p>
            </div>
          </div>

          {/* Slider de cumplimiento */}
          <div className="mt-5 bg-depro-gray-light/50 rounded-xl p-4 border border-depro-border">
            <div className="flex items-center justify-between text-xs font-bold text-depro-dark mb-2">
              <span>Marca el % completado por el equipo</span>
              <span style={{ color: accentColor }}>{completion}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="5" value={completion}
              onChange={(e) => setCompletion(Number(e.target.value))}
              className="w-full"
              style={{ accentColor }}
            />
            <button
              onClick={() => setCompletion(100)}
              className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCircle size={15} /> Marcar como completada (100%)
            </button>
          </div>

          <p className="mt-3 text-[10px] text-depro-gray text-center italic">
            Contenido cerrado · Diseñado por el preparador. Sin opciones de edición.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA CLUB — Microciclos S.1, S.2, S.3, S.4
───────────────────────────────────────────── */
function ClubMicrocycles({ accent }) {
  const { user } = useAuth();
  const isCoordinator = user?.teamRole === "coordinador" || !user?.team;
  const userTeamId = user?.team?.id ?? null;

  // Filtrar microciclos según rol: coordinador ve todos, entrenador solo su equipo
  const visiblePlans = isCoordinator
    ? clubWeeklyPlan
    : clubWeeklyPlan.filter((m) => m.teamId === userTeamId);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const micro = visiblePlans[selectedIdx] ?? visiblePlans[0];

  if (!micro) return (
    <div className="p-8 text-center text-depro-gray">
      <p className="font-medium">No hay microciclos asignados a tu equipo todavía.</p>
    </div>
  );

  const totalCompletion = Math.round(
    micro.sessions.reduce((acc, s) => acc + (s.completion ?? 0), 0) / Math.max(micro.sessions.length, 1)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Microciclos</h1>
        <p className="text-depro-gray text-sm">
          {isCoordinator
            ? "Todos los equipos · Filtra por microciclo"
            : `Equipo: ${user?.team?.name} · Calendario cerrado por semanas`}
        </p>
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

      {/* Sesiones */}
      <div className="space-y-4">
        {micro.sessions.map((s) => (
          <ClubSessionCard key={s.id} session={s} accentColor={accent} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────────── */
export default function WeeklyPlanPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";

  if (user?.role === "club") return <ClubMicrocycles accent={accent} />;
  return <PlayerWeeklyPlan accent={accent} />;
}
