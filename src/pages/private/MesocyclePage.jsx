import { useState, useEffect } from "react";
import {
  ClipboardList, Calendar, ChevronDown, ChevronUp, CheckCircle,
  Activity, Flame, Zap, Clock, Layers, PlayCircle, Shield, Info,
  LayoutGrid, List,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  distributeMesocycleForTeam, getDayRationale, getSessionType,
  getCurrentWeekIndex, formatDate, getWeekStartDate, isMesocicloActive, getMesocicloWeeks,
} from "../../lib/periodization";

/* ── Helpers ────────────────────────────────────────────── */
function getAgeBlock(category) {
  const blocks = {
    "Bloque 1": ["Sub-9","Sub-10","Sub-11","Sub-12"],
    "Bloque 2": ["Sub-13","Sub-14","Sub-15"],
    "Bloque 3": ["Sub-16","Juvenil"],
  };
  for (const [id, ages] of Object.entries(blocks)) {
    if (ages.includes(category)) return id;
  }
  return null;
}

const SESSION_TYPE_COLOR = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444" };
const SESSION_TYPE_LABEL = { A: "Extensiva", B: "Intensiva", C: "Reactiva" };

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const SESSION_TYPE_OPTIONS = [
  { value: "Baja",       label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media",      label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media-alta", label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Alta",       label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Máxima",     label: "C · Reactiva",   color: "#EF4444" },
];

/* ── Calendar View ─────────────────────────────────────── */
const WEEKDAY_NAMES  = ["L","M","X","J","V","S","D"];
const WEEKDAY_FULL   = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const MONTH_NAMES    = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function buildCalendarGrid(year, month) {
  // month: 0-based. Returns array of 6 rows × 7 cols (null = outside month)
  const firstDay = new Date(year, month, 1);
  // Monday-first: getDay() 0=Sun → index 6, 1=Mon → index 0 ...
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function MesocycleCalendar({ activePlan, weeks, trainingDays, accent }) {
  if (!activePlan?.startDate) return null;

  const start = new Date(activePlan.startDate);
  const end   = new Date(activePlan.endDate || activePlan.startDate);
  const today = new Date();

  // Meses que abarca el mesociclo
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= endMonth) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }

  // Mapear sesiones a fechas concretas
  // Cada sesión tiene assignedDay (ej. "Lunes") y su semana en weeks[]
  const sessionDateMap = {}; // "YYYY-MM-DD" → { session, weekIdx, sessionIdx, sType }
  weeks.forEach(({ sessions: weekSessions }, wi) => {
    weekSessions.forEach((session, si) => {
      if (!session.assignedDay) return;
      // Calcular la fecha real: inicio + wi semanas + offset del día
      const weekBase = new Date(start);
      weekBase.setDate(weekBase.getDate() + wi * 7);
      // Ajustar al día de la semana correcto (Monday-first)
      const targetDayIdx = WEEKDAY_FULL.findIndex((d) => d === session.assignedDay);
      if (targetDayIdx < 0) return;
      const curDayIdx = (weekBase.getDay() + 6) % 7; // 0=Mon
      const diff = targetDayIdx - curDayIdx;
      const sessionDate = new Date(weekBase);
      sessionDate.setDate(sessionDate.getDate() + diff);
      const key = sessionDate.toISOString().slice(0, 10);
      const sType = getSessionType(session.intensity);
      sessionDateMap[key] = { session, weekIdx: wi, sType, sessionNumber: wi * 3 + si + 1 };
    });
  });

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-depro-border/60 bg-[#F8F9FB]">
        <Calendar size={15} style={{ color: accent }} />
        <span className="font-black text-depro-dark text-sm">Calendario del mesociclo</span>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-depro-gray">
          {Object.entries(SESSION_TYPE_COLOR).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {type} · {SESSION_TYPE_LABEL[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {months.map(({ year, month }) => {
          const rows = buildCalendarGrid(year, month);
          return (
            <div key={`${year}-${month}`}>
              <div className="text-sm font-black text-depro-dark mb-2">
                {MONTH_NAMES[month]} {year}
              </div>
              <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-depro-border">
                {/* Cabecera días */}
                {WEEKDAY_NAMES.map((d) => (
                  <div key={d} className="bg-[#F8F9FB] text-center py-1.5 text-[10px] font-black text-depro-gray uppercase">
                    {d}
                  </div>
                ))}
                {/* Celdas */}
                {rows.flat().map((day, ci) => {
                  if (!day) return (
                    <div key={`e-${ci}`} className="bg-[#F8F9FB] h-10" />
                  );
                  const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const sessionInfo = sessionDateMap[dateStr];
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const isInRange = dateStr >= activePlan.startDate && dateStr <= (activePlan.endDate || activePlan.startDate);

                  return (
                    <div key={dateStr}
                      className={`bg-white relative flex flex-col items-center justify-center h-10 transition-colors ${
                        !isInRange ? "opacity-30" : ""
                      }`}>
                      {/* Fondo de sesión */}
                      {sessionInfo && (
                        <div className="absolute inset-1 rounded-lg opacity-20"
                          style={{ backgroundColor: SESSION_TYPE_COLOR[sessionInfo.sType] }} />
                      )}
                      {/* Número del día */}
                      <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isToday
                          ? "font-black text-white"
                          : sessionInfo
                          ? "font-black"
                          : "text-depro-dark"
                      }`}
                        style={isToday
                          ? { backgroundColor: accent }
                          : sessionInfo
                          ? { color: SESSION_TYPE_COLOR[sessionInfo.sType] }
                          : {}}>
                        {day}
                      </div>
                      {/* Punto indicador de sesión */}
                      {sessionInfo && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{ backgroundColor: SESSION_TYPE_COLOR[sessionInfo.sType] }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Card de sesión (vista sólo lectura) ──────────────────── */
function SessionCard({ session, sessionNumber, accent }) {
  const [open, setOpen] = useState(false);
  const typeMeta = SESSION_TYPE_OPTIONS.find((o) => o.value === session.intensity) || SESSION_TYPE_OPTIONS[1];
  const exercises = session.exercises || [];
  const blocks = session.blocks || [];

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
      <button className="w-full text-left p-4 flex items-center gap-3" onClick={() => setOpen((o) => !o)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ backgroundColor: typeMeta.color + "18", borderColor: typeMeta.color + "30" }}>
          <span className="text-sm font-black" style={{ color: typeMeta.color }}>{sessionNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-depro-dark text-sm">{session.title || `Sesión ${sessionNumber}`}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: typeMeta.color + "15", color: typeMeta.color }}>
              {typeMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-depro-gray">
            {session.duration && <span className="flex items-center gap-1"><Clock size={10}/>{session.duration}</span>}
            {(exercises.length > 0 || blocks.length > 0) && (
              <span className="flex items-center gap-1">
                <Layers size={10}/>
                {blocks.length > 0 ? `${blocks.reduce((a,b) => a + (b.exercises?.length || 0), 0)} ejercicios` : `${exercises.length} ejercicios`}
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={14} className="text-depro-gray flex-shrink-0" /> : <ChevronDown size={14} className="text-depro-gray flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-depro-border px-4 pb-4 pt-3 space-y-4">
          {session.objective && (
            <p className="text-xs text-depro-gray italic">{session.objective}</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Clock,    label: "Duración",   value: session.duration },
              { icon: Flame,    label: "Intensidad", value: session.intensity },
              { icon: Activity, label: "Tipo",       value: typeMeta.label },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#F8F9FB] rounded-xl p-2.5 text-center border border-depro-border/50">
                <Icon size={14} className="mx-auto mb-1 text-depro-gray" />
                <div className="text-[9px] font-bold text-depro-gray uppercase tracking-wide">{label}</div>
                <div className="text-xs font-black text-depro-dark mt-0.5">{value || "—"}</div>
              </div>
            ))}
          </div>

          {blocks.length > 0 ? (
            <div className="space-y-3">
              {blocks.map((block) => {
                const exList = block.exercises || [];
                if (exList.length === 0) return null;
                const ytId = getYouTubeId(block.videoUrl);
                return (
                  <div key={block.type} className="rounded-xl border border-depro-border overflow-hidden">
                    <div className="px-3 py-2 bg-[#F8F9FB] border-b border-depro-border">
                      <span className="text-xs font-black text-depro-dark">{block.label}</span>
                      {block.duration && <span className="text-[10px] text-depro-gray ml-2">{block.duration}</span>}
                    </div>
                    {ytId && (
                      <div className="relative w-full bg-black" style={{ paddingBottom: "28%" }}>
                        <iframe src={`https://www.youtube.com/embed/${ytId}`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen title={block.label} />
                      </div>
                    )}
                    <div className="p-2 space-y-1.5">
                      {exList.map((ex, ei) => (
                        <div key={ex.id || ei} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-depro-border/40">
                          <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black bg-depro-blue/10 text-depro-blue flex-shrink-0">{ei+1}</span>
                          <span className="text-xs font-medium text-depro-dark flex-1 truncate">{ex.name}</span>
                          <span className="text-[10px] text-depro-gray">{ex.sets && `${ex.sets}×`}{ex.reps}</span>
                          {getYouTubeId(ex.videoUrl) && <PlayCircle size={11} className="text-red-500 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : exercises.length > 0 ? (
            <div className="space-y-1.5">
              {exercises.map((ex, ei) => (
                <div key={ex.id || ei} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F9FB] border border-depro-border/40">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black bg-depro-blue/10 text-depro-blue flex-shrink-0">{ei+1}</span>
                  <span className="text-xs font-medium text-depro-dark flex-1 truncate">{ex.name}</span>
                  <span className="text-[10px] text-depro-gray">{ex.sets && `${ex.sets}×`}{ex.reps}</span>
                  {getYouTubeId(ex.videoUrl) && <PlayCircle size={11} className="text-red-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-depro-gray italic text-center py-2">Sin ejercicios registrados</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PÁGINA MESOCICLO
   ════════════════════════════════════════════════════════════ */
export default function MesocyclePage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";
  const teamCategory = user?.team?.category ?? null;
  const userAgeBlock = getAgeBlock(teamCategory);

  const [allPlans, setAllPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem("depro_global_plans") || "[]"); }
    catch { return []; }
  });
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"

  useEffect(() => {
    fetch("/api/admin-clubs")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const globalEntry = (data.clubs || []).find((c) => c.id === "GLOBAL_PLANS");
        if (globalEntry?.plans?.length > 0) {
          try { localStorage.setItem("depro_global_plans", JSON.stringify(globalEntry.plans)); } catch {}
          setAllPlans(globalEntry.plans);
        }
      })
      .catch(() => {});
  }, []);

  const blockPlans = allPlans.filter((p) => {
    if (p.ageBlock && userAgeBlock) return p.ageBlock === userAgeBlock;
    return true;
  });

  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const activePlan = blockPlans[selectedPlanIdx] ?? blockPlans[0];
  const allSessions = activePlan?.sessions || [];
  const trainingDays = user?.team?.trainingDays || [];

  const { weeks, totalSessions, sessionsPerWeek } = distributeMesocycleForTeam(
    allSessions, trainingDays, 3
  );

  const currentWeekIdx = getCurrentWeekIndex(activePlan?.startDate, activePlan?.endDate);
  const mesocicloActive = isMesocicloActive(activePlan?.startDate, activePlan?.endDate);
  const totalCalendarWeeks = getMesocicloWeeks(activePlan?.startDate, activePlan?.endDate);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
          <Calendar size={14} style={{ color: accent }} />
          Plan mensual
          {userAgeBlock && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#F8F9FB] border border-depro-border text-depro-gray font-bold">
              {userAgeBlock}
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Mesociclo</h1>
            <p className="text-depro-gray text-sm">
              {user?.team?.name
                ? `${user.team.name}${teamCategory ? ` · ${teamCategory}` : ""} · Plan de entrenamiento del mes`
                : "Plan de entrenamiento del mes"}
            </p>
          </div>
          {/* Toggle vista */}
          {blockPlans.length > 0 && weeks.length > 0 && (
            <div className="flex items-center gap-1 bg-[#F8F9FB] border border-depro-border rounded-xl p-1 flex-shrink-0">
              <button onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "calendar" ? "bg-white shadow-sm text-depro-dark border border-depro-border" : "text-depro-gray hover:text-depro-dark"
                }`}>
                <LayoutGrid size={12} /> Calendario
              </button>
              <button onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" ? "bg-white shadow-sm text-depro-dark border border-depro-border" : "text-depro-gray hover:text-depro-dark"
                }`}>
                <List size={12} /> Lista
              </button>
            </div>
          )}
        </div>
      </div>

      {blockPlans.length === 0 && (
        <div className="py-20 text-center text-depro-gray border border-dashed border-depro-border rounded-2xl bg-white">
          <Calendar size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-bold text-depro-dark text-base mb-1">Sin plan mensual todavía</p>
          <p className="text-sm opacity-70">El preparador está preparando el mesociclo para tu categoría.</p>
        </div>
      )}

      {blockPlans.length > 0 && (
        <>
          {/* Selector de mesociclo */}
          {blockPlans.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {blockPlans.map((plan, i) => (
                <button key={plan.id} onClick={() => setSelectedPlanIdx(i)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all text-xs ${
                    i === selectedPlanIdx
                      ? "border-depro-blue bg-depro-blue-light text-depro-blue"
                      : "border-depro-border bg-white text-depro-gray hover:text-depro-dark hover:border-depro-blue/30"
                  }`}>
                  <div className="font-black text-sm leading-none">{plan.label || plan.code}</div>
                  {plan.startDate && <div className="mt-0.5 opacity-70 text-[10px]">{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</div>}
                </button>
              ))}
            </div>
          )}

          {/* Info del mesociclo activo */}
          <div className="bg-white border border-depro-border rounded-2xl p-5 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                style={{ backgroundColor: accent + "15", borderColor: accent + "25" }}>
                <Shield size={20} style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-black text-depro-dark text-lg">{activePlan.label || "Mesociclo"}</h2>
                  {activePlan.status && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      activePlan.status === "activo" ? "bg-green-50 text-green-700 border-green-200" :
                      activePlan.status === "completado" ? "bg-gray-100 text-gray-500 border-gray-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>{activePlan.status}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-depro-gray mt-1">
                  {activePlan.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11}/>
                      {formatDate(activePlan.startDate)} → {formatDate(activePlan.endDate)}
                    </span>
                  )}
                  {totalCalendarWeeks > 0 && (
                    <span className="flex items-center gap-1"><Layers size={11}/>{totalCalendarWeeks} semanas</span>
                  )}
                  <span className="flex items-center gap-1"><Zap size={11}/>{allSessions.length} sesiones totales</span>
                </div>
                {mesocicloActive && currentWeekIdx >= 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-50 border border-green-200 text-green-700">
                    <CheckCircle size={10}/> Semana {currentWeekIdx + 1} en curso
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sin sesiones */}
          {weeks.length === 0 && (
            <div className="py-12 text-center text-depro-gray border border-dashed border-depro-border rounded-2xl bg-white">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-25" />
              <p className="text-sm text-depro-dark font-medium">Este mesociclo aún no tiene sesiones programadas.</p>
            </div>
          )}

          {/* ── VISTA CALENDARIO ── */}
          {viewMode === "calendar" && weeks.length > 0 && (
            <MesocycleCalendar
              activePlan={activePlan}
              weeks={weeks}
              trainingDays={trainingDays}
              accent={accent}
            />
          )}

          {/* ── VISTA LISTA (semanas) ── */}
          {(viewMode === "list" || !activePlan?.startDate) && weeks.length > 0 && weeks.map(({ weekNumber, sessions: weekSessions }, wi) => {
            const isCurrentWeek = wi === currentWeekIdx;
            const weekStart = getWeekStartDate(activePlan?.startDate, wi);
            return (
              <div key={wi} className={`mb-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border text-xs font-black flex-shrink-0`}
                    style={isCurrentWeek
                      ? { backgroundColor: accent, borderColor: accent, color: "white" }
                      : { backgroundColor: accent + "15", borderColor: accent + "25", color: accent }}>
                    {weekNumber}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-depro-dark">Semana {weekNumber}</span>
                    {weekStart && <span className="text-[10px] text-depro-gray">{weekStart}</span>}
                    <span className="text-xs text-depro-gray">· {weekSessions.length} sesiones</span>
                    {isCurrentWeek && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center gap-1">
                        <CheckCircle size={9}/> Esta semana
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-depro-border" />
                </div>

                <div className="space-y-3 pl-2">
                  {weekSessions.map((session, si) => {
                    const globalIdx = wi * sessionsPerWeek + si + 1;
                    const sType = getSessionType(session.intensity);
                    const rationale = getDayRationale(session.assignedDay, sType);
                    return (
                      <div key={session.id || si}>
                        {session.assignedDay && (
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <span className="text-xs font-black uppercase tracking-wide"
                              style={{ color: SESSION_TYPE_COLOR[sType] ?? accent }}>
                              {session.assignedDay}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: (SESSION_TYPE_COLOR[sType] ?? accent) + "18", color: SESSION_TYPE_COLOR[sType] ?? accent }}>
                              Sesión {sType} · {SESSION_TYPE_LABEL[sType]}
                            </span>
                            {rationale && (
                              <span className="text-[10px] text-depro-gray hidden sm:block">{rationale}</span>
                            )}
                          </div>
                        )}
                        <SessionCard session={session} sessionNumber={globalIdx} accent={accent} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Leyenda periodización */}
          {trainingDays.length > 0 && (
            <div className="mt-4 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl p-4 flex items-start gap-3">
              <Info size={14} className="text-depro-blue flex-shrink-0 mt-0.5" />
              <div className="text-xs text-depro-dark/70">
                <span className="font-bold text-depro-dark">Distribución automática · </span>
                Las sesiones se han adaptado a tus días de entrenamiento (
                <span className="font-bold">{trainingDays.join(", ")}</span>
                ) siguiendo la lógica de periodización táctica:
                sesiones <span className="font-bold" style={{ color: "#3B82F6" }}>A · Extensivas</span> en días post-partido,{" "}
                <span className="font-bold" style={{ color: "#F59E0B" }}>B · Intensivas</span> en el pico de carga semanal y{" "}
                <span className="font-bold" style={{ color: "#EF4444" }}>C · Reactivas</span> en activación pre-partido.
              </div>
            </div>
          )}

          {/* Resumen del mes */}
          {allSessions.length > 0 && (
            <div className="mt-4 bg-[#F8F9FB] border border-depro-border rounded-2xl p-5">
              <h3 className="text-xs font-black text-depro-gray uppercase tracking-wide mb-3">Resumen del mes</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: totalSessions, label: "Sesiones" },
                  { value: weeks.length,  label: "Semanas" },
                  { value: sessionsPerWeek, label: "Días/semana", accent: true },
                ].map(({ value, label, accent: isAccent }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center border border-depro-border">
                    <div className="text-2xl font-black" style={isAccent ? { color: accent } : { color: "#333" }}>{value}</div>
                    <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
