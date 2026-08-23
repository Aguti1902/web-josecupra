import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Calendar, ChevronDown, ChevronUp, CheckCircle,
  Activity, Flame, Zap, Clock, Layers, PlayCircle, Shield, Info,
  LayoutGrid, List,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam, useIsReadOnly } from "../../context/ViewContext";
import FeatureGate from "../../components/private/FeatureGate";
import {
  distributeMesocycleForTeam, getDayRationale, getSessionType,
  getCurrentWeekIndex, formatDate, getWeekStartDate, isMesocicloActive, getMesocicloWeeks,
  formatWeekRangeLabel,
} from "../../lib/periodization";
import { sessionPlanUrl } from "../../lib/sessionBlocks";
import { getSessionDisplayKey } from "../../lib/mesocycleTemplates";
import CoachPlanning from "../../components/private/CoachPlanning";
import MesocycleCalendar from "../../components/private/MesocycleCalendar";
import { isProCoachUser } from "../../lib/clubAuto/clubAutoCoachBridge";
import { pickPlansFromAdminClubsResponse, resolveClubPanelPlans } from "../../lib/clubManualPlans";

/* ── Contraste seguro ───────────────────────────────────── */
function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}
// Si el color es demasiado claro, usa el azul DEPRO
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
// Texto que contraste sobre un fondo de ese color
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

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

const SESSION_TYPE_COLOR = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", D: "#10B981" };
const SESSION_TYPE_LABEL = { A: "Extensiva", B: "Intensiva", C: "Reactiva", D: "Complementaria" };

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const SESSION_TYPE_OPTIONS = [
  { value: "Baja",             label: "A · Extensiva",       color: "#3B82F6" },
  { value: "Media",            label: "A · Extensiva",       color: "#3B82F6" },
  { value: "Media-alta",       label: "B · Intensiva",       color: "#F59E0B" },
  { value: "Alta",             label: "B · Intensiva",       color: "#F59E0B" },
  { value: "Máxima",           label: "C · Reactiva",        color: "#EF4444" },
  { value: "Complementaria-D", label: "D · Complementaria",  color: "#10B981" },
];

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeTeam = useActiveTeam();
  const isReadOnly = useIsReadOnly();
  const accent = safeAccent(user?.club?.primaryColor || "#0A36F7");
  const teamCategory = activeTeam?.category ?? null;
  const userAgeBlock = getAgeBlock(teamCategory);

  const [allPlans, setAllPlans] = useState(() => {
    try {
      const global = JSON.parse(localStorage.getItem("depro_global_plans") || "[]");
      return resolveClubPanelPlans(user?.club, global);
    } catch { return []; }
  });
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"

  useEffect(() => {
    if (isProCoachUser(user)) return;
    fetch("/api/admin-clubs")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const globalEntry = (data.clubs || []).find((c) => c.id === "GLOBAL_PLANS");
        if (globalEntry?.plans?.length > 0) {
          try { localStorage.setItem("depro_global_plans", JSON.stringify(globalEntry.plans)); } catch {}
        }
        const picked = pickPlansFromAdminClubsResponse(data.clubs, user?.club, globalEntry?.plans || []);
        if (picked.length) setAllPlans(picked);
      })
      .catch(() => {});
  }, [user?.club?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCoach = isProCoachUser(user);
  const blockPlans = allPlans.filter((p) => {
    if (p.ageBlock && userAgeBlock) return p.ageBlock === userAgeBlock;
    return true;
  });

  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const activePlan = blockPlans[selectedPlanIdx] ?? blockPlans[0];
  const allSessions = activePlan?.sessions || [];
  const trainingDays = activeTeam?.trainingDays || [];

  const currentWeekIdx = getCurrentWeekIndex(activePlan?.startDate, activePlan?.endDate);
  const mesocicloActive = isMesocicloActive(activePlan?.startDate, activePlan?.endDate);
  const totalCalendarWeeks = getMesocicloWeeks(activePlan?.startDate, activePlan?.endDate);

  const { weeks, totalSessions, sessionsPerWeek } = isCoach
    ? { weeks: [], totalSessions: 0, sessionsPerWeek: 0 }
    : distributeMesocycleForTeam(activePlan, trainingDays, 3, totalCalendarWeeks);

  if (isCoach) {
    return (
      <FeatureGate user={user} feature="mesocycle">
      <div className="dash-page">
        <CoachPlanning club={user.club} team={activeTeam || user.team} />
      </div>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate user={user} feature="mesocycle">
    <div className="dash-page">
      {isReadOnly && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Modo visualización · {activeTeam?.name || "Equipo"} — Solo lectura
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
          <Calendar size={14} className="text-depro-blue" />
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
              {activeTeam?.name
                ? `${activeTeam.name}${teamCategory ? ` · ${teamCategory}` : ""} · Plan de entrenamiento del mes`
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
          {(viewMode === "list" || !activePlan?.startDate) && weeks.length > 0 && weeks.map(({ weekNumber, sessions: weekSessions, combination }, wi) => {
            const isCurrentWeek = wi === currentWeekIdx;
            const weekStart = getWeekStartDate(activePlan?.startDate, wi);
            return (
              <div key={wi} className={`mb-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border text-xs font-black flex-shrink-0`}
                    style={isCurrentWeek
                      ? { backgroundColor: accent, borderColor: accent, color: contrastText(accent) }
                      : { backgroundColor: accent + "15", borderColor: accent + "25", color: accent }}>
                    {weekNumber}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-depro-dark">{formatWeekRangeLabel(activePlan?.startDate, wi)}</span>
                    {weekStart && <span className="text-[10px] text-depro-gray">({weekStart})</span>}
                    {combination && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue border border-depro-blue/20">
                        {combination}
                      </span>
                    )}
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
                    const sType = session.framework || getSessionType(session.intensity);
                    const displayKey = getSessionDisplayKey(session);
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
                              {displayKey} · {SESSION_TYPE_LABEL[sType]}
                            </span>
                            {rationale && (
                              <span className="text-[10px] text-depro-gray hidden sm:block">{rationale}</span>
                            )}
                          </div>
                        )}
                        <SessionCard session={session} sessionNumber={globalIdx} accent={accent} />
                        <button type="button"
                          onClick={() => navigate(sessionPlanUrl(session, { tab: "resumen", week: wi }))}
                          className="mt-2 w-full py-2 rounded-xl border border-depro-blue/30 text-xs font-bold text-depro-blue hover:bg-depro-blue-light/30 transition-colors">
                          Abrir sesión en microciclo
                        </button>
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
                  { value: sessionsPerWeek, label: "Días/semana", useAccent: true },
                ].map(({ value, label, useAccent }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center border border-depro-border">
                    <div className="text-2xl font-black" style={{ color: useAccent ? accent : "#333333" }}>{value}</div>
                    <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </FeatureGate>
  );
}
