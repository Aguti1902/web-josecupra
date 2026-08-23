import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, ClipboardList, Users, Activity, TrendingUp, ArrowRight,
  Flame, Clock, Target, ChevronRight, Settings, ListChecks,
} from "lucide-react";
import { generateMicrociclo } from "../../lib/coachEngine";
import { loadCoachLibrary, getCachedCoachLibrary } from "../../lib/coachLibraryStorage";
import {
  usesClubAutoEngine,
  generateClubAutoWeekForCoach,
} from "../../lib/clubAuto/clubAutoCoachBridge";
import { loadOrGenerateWeek } from "../../lib/coachSessionsStorage";
import PlanUsageCard from "./PlanUsageCard";
import { hasFeatureAccess } from "../../lib/subscription";

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  } catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function currentWeekStart() {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function getTodayName() { return DAY_ORDER[(new Date().getDay() + 6) % 7]; }

export default function CoachDashboard({ club, team, user }) {
  const accent = safeAccent(club?.primaryColor || "#0A36F7");
  const config = {
    ...(club?.coachConfig || {}),
    ...(team?.trainingDays?.length ? { dias_exactos_entrenamiento: team.trainingDays } : {}),
  };
  const [squad, setSquad] = useState([]);
  const [, forceLibrary] = useState(0);

  useEffect(() => {
    loadCoachLibrary().then(() => forceLibrary((n) => n + 1));
  }, []);

  useEffect(() => {
    if (!club?.id || !team?.id) return;
    try {
      const raw = localStorage.getItem(`depro_squad_${club.id}_${team.id}`);
      setSquad(JSON.parse(raw || "[]"));
    } catch { setSquad([]); }
  }, [club?.id, team?.id]);

  const isClubAuto = usesClubAutoEngine({ ...club, coachConfig: config });

  const microciclo = useMemo(() => {
    const weekStart = currentWeekStart();
    if (club?.id && team?.id) {
      return loadOrGenerateWeek({
        clubId: club.id,
        teamId: team.id,
        weekStart,
        config,
        library: getCachedCoachLibrary(),
      });
    }
    if (isClubAuto) {
      return generateClubAutoWeekForCoach(config, { weekStart });
    }
    return generateMicrociclo({
      config: { ...config, material: config.material },
      weekStart,
      library: getCachedCoachLibrary(),
    });
  }, [config, team?.id, club?.id, isClubAuto]);

  const todayName = getTodayName();
  const todaySession = microciclo.sessions.find((s) => s.assignedDay === todayName);
  const nextSession = todaySession || microciclo.sessions[0];

  const quickLinks = [
    { to: "/dashboard/mesocycle", label: "Planificación", icon: ClipboardList, desc: "Macro / meso / microciclo" },
    { to: "/dashboard/plan", label: "Sesiones", icon: Calendar, desc: "Sesión del día generada" },
    { to: "/dashboard/squad", label: "Plantilla", icon: Users, desc: `${squad.length} jugadores` },
    ...(hasFeatureAccess(user, "team_tests")
      ? [{ to: "/dashboard/team-tests", label: "Tests", icon: Activity, desc: "Evaluaciones físicas" }]
      : []),
    ...(hasFeatureAccess(user, "cargas")
      ? [{ to: "/dashboard/cargas", label: "Carga", icon: TrendingUp, desc: "Control de carga" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="dash-glass-header rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}BB 50%, #1e1b4b 100%)` }}
      >
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: contrastText(accent) + "BB" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2 className="text-2xl font-black" style={{ color: contrastText(accent) }}>
            Hola, {user?.name?.split(" ")[0] || "Coach"}
          </h2>
          <p className="text-sm mt-0.5 opacity-90" style={{ color: contrastText(accent) }}>
            {team?.name || "Tu equipo"} · {team?.category || ""}
            {isClubAuto ? " · Motor automático" : ""}
          </p>
        </div>
        <Link
          to="/dashboard/club-profile"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: contrastText(accent) }}
        >
          <Settings size={14} /> Configuración
        </Link>
      </div>

      <PlanUsageCard club={club} user={user} audience="coach" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próxima sesión */}
        <div className="lg:col-span-2 space-y-4">
          {nextSession ? (
            <div
              className="rounded-2xl overflow-hidden shadow-card p-5"
              style={{ background: todaySession ? `linear-gradient(135deg, ${accent}F0 0%, ${accent} 100%)` : "white", border: todaySession ? "none" : "1px solid #E5E7EB" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: todaySession ? contrastText(accent) + "AA" : "#9CA3AF" }}
                  >
                    {todaySession ? `HOY · ${todayName}` : `Próxima sesión · ${nextSession.assignedDay}`}
                  </span>
                  <h3 className="text-xl font-black leading-tight mt-1" style={{ color: todaySession ? contrastText(accent) : "#1F2937" }}>
                    {nextSession.title}
                  </h3>
                  <p className="text-sm mt-1 opacity-80" style={{ color: todaySession ? contrastText(accent) : "#6B7280" }}>
                    Protocolo {nextSession.protocol} · {nextSession.protocolLabel}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 text-sm font-bold flex-shrink-0 px-3 py-1 rounded-xl"
                  style={todaySession ? { backgroundColor: "rgba(255,255,255,0.2)", color: contrastText(accent) } : { backgroundColor: "#F3F4F6", color: "#374151" }}
                >
                  <Clock size={13} /> {nextSession.duracionEstimada}
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                {(nextSession.structure?.length
                  ? nextSession.structure.slice(0, 4).map((block, i) => ({
                      id: block.type,
                      name: block.label?.replace(/^\d+\.\s*/, "") || block.type,
                      i,
                    }))
                  : (nextSession.exercises || []).slice(0, 3).map((ex, i) => ({
                      id: ex.id || i,
                      name: ex.name || ex.nombre,
                      i,
                    }))
                ).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl"
                    style={{ backgroundColor: todaySession ? "rgba(255,255,255,0.15)" : "#F9FAFB" }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={todaySession ? { backgroundColor: "rgba(255,255,255,0.25)", color: contrastText(accent) } : { backgroundColor: accent + "15", color: accent }}
                    >
                      {row.i + 1}
                    </div>
                    <span className="text-sm font-medium flex-1 truncate" style={{ color: todaySession ? contrastText(accent) : "#1F2937" }}>{row.name}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/plan"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={todaySession ? { backgroundColor: "rgba(255,255,255,0.2)", color: contrastText(accent) } : { backgroundColor: accent, color: contrastText(accent) }}
              >
                <Flame size={15} /> Ver sesión completa <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-depro-border rounded-2xl p-8 text-center">
              <ListChecks size={28} className="mx-auto mb-2 text-depro-gray/40" />
              <p className="text-depro-gray text-sm">No hay sesión generada para hoy. Configura tu frecuencia de entrenamiento en tu perfil.</p>
            </div>
          )}

          {/* Resumen de la semana */}
          <div className="bg-white/90 backdrop-blur-sm border border-depro-border/60 rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-depro-dark mb-3 flex items-center gap-2">
              <Calendar size={15} style={{ color: accent }} /> Microciclo de esta semana
            </h4>
            <div className="flex flex-wrap gap-2">
              {microciclo.sessions.map((s) => (
                <span
                  key={s.id}
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: s.assignedDay === todayName ? accent : accent + "12",
                    color: s.assignedDay === todayName ? contrastText(accent) : accent,
                  }}
                >
                  {s.assignedDay} · {s.protocol}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="dash-stat-premium bg-white border border-depro-border/60">
              <Users size={16} style={{ color: accent }} className="mb-2" />
              <div className="text-2xl font-black text-depro-dark">{squad.length}</div>
              <div className="text-xs text-depro-gray font-medium">Jugadores</div>
            </div>
            <div className="dash-stat-premium bg-white border border-depro-border/60">
              <Target size={16} style={{ color: accent }} className="mb-2" />
              <div className="text-2xl font-black text-depro-dark">
                {config.dias_entrenamiento_semana || config.trainingsPerWeek || "—"}
              </div>
              <div className="text-xs text-depro-gray font-medium">Sesiones/semana</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-depro-dark mb-3">Acceso rápido</h3>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <Link key={item.to} to={item.to} className="dash-quick-link group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + "12", color: accent }}>
                    <item.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-depro-dark truncate">{item.label}</div>
                    <div className="text-xs text-depro-gray truncate">{item.desc}</div>
                  </div>
                  <ChevronRight size={13} className="text-depro-gray opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
