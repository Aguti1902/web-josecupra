import { Link } from "react-router-dom";
import {
  Calendar, TrendingUp, Zap, CheckCircle, Clock,
  ArrowRight, Activity, Target, Flame, Trophy, Phone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { weeklyPlan, coachFeedback } from "../../data/mockData";

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
          <Icon size={20} style={{ color }} />
        </div>
        <TrendingUp size={13} className="text-depro-green mt-1" />
      </div>
      <div className="text-2xl font-black text-depro-dark">{value}</div>
      <div className="text-sm text-depro-gray mt-0.5">{label}</div>
      {sub && <div className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isClub = user?.role === "club";
  const club = user?.club;
  const team = user?.team;
  const accent = club?.primaryColor || "#0A36F7";
  const secondColor = club?.secondaryColor || "#FFFFFF";
  const isPremium = user?.plan === "Premium" || user?.plan === "Pro";

  const today = weeklyPlan.find((d) => d.sessions.some((s) => s.status === "today"));
  const todaySession = today?.sessions[0];
  const completedDays = weeklyPlan.filter((d) => d.sessions.some((s) => s.status === "completed")).length;
  const lastFeedback = coachFeedback[0];

  // Planificación del club: microciclos asignados al equipo del entrenador
  const clubPlans = club?.plans || [];
  const teamPlans = team
    ? clubPlans.filter((mc) => !mc.teamId || mc.teamId === team.id)
    : clubPlans;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 border overflow-hidden"
        style={{
          background: isClub && club
            ? `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`
            : `linear-gradient(135deg, ${accent}08 0%, white 100%)`,
          borderColor: accent + "20",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo o avatar */}
          {isClub && club?.logo ? (
            <img
              src={club.logo}
              alt={club.name}
              className="w-14 h-14 rounded-xl object-contain bg-white p-1 flex-shrink-0 shadow"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 shadow-sm"
              style={{
                backgroundColor: isClub ? "rgba(255,255,255,0.2)" : accent + "15",
                color: isClub ? secondColor : accent,
              }}
            >
              {isClub ? (club?.abbreviation || club?.name?.[0] || "C") : (user?.avatar)}
            </div>
          )}

          <div className="flex-1">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-0.5"
              style={{ color: isClub ? "rgba(255,255,255,0.7)" : accent }}
            >
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2
              className="text-2xl font-black"
              style={{ color: isClub ? secondColor : "var(--depro-dark, #111)" }}
            >
              {isClub ? (club?.name || "Mi Club") : `Hola, ${user?.name?.split(" ")[0]}.`}
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: isClub ? "rgba(255,255,255,0.75)" : "#6B7280" }}
            >
              {isClub
                ? `${team?.name || "Sin equipo asignado"} · ${user?.team_role || "Entrenador"}`
                : `${user?.training_days ?? user?.trainingDays ?? "—"} días de entreno · ${user?.level || "—"}`}
            </p>
          </div>

          {isPremium && !isClub && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-depro-yellow text-depro-dark text-xs font-black">
              <Trophy size={13} /> Plan Premium
            </div>
          )}
          {isClub && club && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: secondColor }}
            >
              {club.plan || "Activo"}
            </div>
          )}
          {!isClub && todaySession && (
            <Link
              to="/dashboard/plan"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              <Flame size={15} /> Sesión de hoy <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Planificación del club si es entrenador */}
      {isClub && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-depro-dark text-lg">Planificación de {team?.name || "tu equipo"}</h3>
          </div>
          {teamPlans.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-depro-border rounded-2xl text-depro-gray">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">Sin planificación asignada todavía</p>
              <p className="text-sm mt-1">El administrador aún no ha creado microciclos para este equipo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamPlans.map((mc) => (
                <div key={mc.id} className="bg-white border border-depro-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                    <h4 className="font-semibold text-depro-dark">{mc.name}</h4>
                    <span className="ml-auto text-xs text-depro-gray">{mc.weekLabel}</span>
                  </div>
                  <p className="text-sm text-depro-gray mb-3">{mc.objective}</p>
                  <div className="flex items-center gap-2 text-xs text-depro-gray">
                    <Activity size={12} />
                    <span>{(mc.sessions || []).length} sesiones</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Premium contact card */}
      {isPremium && (
        <div className="rounded-2xl bg-depro-blue p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Contacto directo con tu preparador</div>
            <div className="text-blue-200 text-xs mt-0.5">Plan Premium · Acceso a contacto directo</div>
          </div>
          <a
            href="tel:+34600000000"
            className="flex-shrink-0 bg-white text-depro-blue text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Llamar
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sesiones completadas" value={completedDays} sub="esta semana" icon={CheckCircle} color="#3BC21D" />
        <StatCard label="Días de entreno" value={user?.trainingDays || 5} sub="por semana" icon={Calendar} color={accent} />
        <StatCard label="Valoración coach" value={`${lastFeedback.rating}/10`} sub="última revisión" icon={Trophy} color="#F6CC12" />
        <StatCard label="Plan actual" value={user?.plan} sub="activo" icon={Zap} color="#FB2C39" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's session */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-depro-dark">Sesión de hoy</h3>
            <Link to="/dashboard/plan" className="text-sm text-depro-blue hover:underline flex items-center gap-1">
              Ver plan completo <ArrowRight size={13} />
            </Link>
          </div>
          {todaySession ? (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="tag-blue">{todaySession.type}</span>
                    <span className="text-xs text-depro-gray">{todaySession.intensity}</span>
                  </div>
                  <h4 className="text-lg font-bold text-depro-dark">{todaySession.title}</h4>
                  <p className="text-sm text-depro-gray mt-0.5">{todaySession.objective}</p>
                </div>
                <div className="flex items-center gap-1.5 text-depro-gray text-sm flex-shrink-0">
                  <Clock size={14} /> {todaySession.duration}
                </div>
              </div>
              <div className="space-y-2">
                {todaySession.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 bg-depro-gray-light rounded-xl">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: accent + "15", color: accent }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-depro-dark">{ex.name}</div>
                      <div className="text-xs text-depro-gray">{ex.duration} · {ex.sets} sets · {ex.reps}</div>
                    </div>
                  </div>
                ))}
                {todaySession.exercises.length > 3 && (
                  <p className="text-xs text-depro-gray text-center pt-1">
                    + {todaySession.exercises.length - 3} ejercicios más
                  </p>
                )}
              </div>
              <Link
                to="/dashboard/plan"
                className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 text-white"
                style={{ backgroundColor: accent }}
              >
                Iniciar sesión <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Trophy size={32} className="text-depro-border mx-auto mb-3" />
              <p className="text-depro-gray font-medium">Día de descanso — el descanso también es entrenamiento.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Week progress */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Progreso semanal</h3>
            <div className="card">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weeklyPlan.map((day) => {
                  const s = day.sessions[0];
                  const status = s?.status;
                  return (
                    <div key={day.shortDay} className="flex flex-col items-center gap-1">
                      <div className="text-xs text-depro-gray font-medium">{day.shortDay[0]}</div>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          status === "completed" ? "text-white" :
                          status === "today" ? "text-white" :
                          day.sessions.length === 0 ? "bg-depro-gray-light text-gray-400" :
                          "bg-depro-gray-light text-depro-gray"
                        }`}
                        style={
                          status === "completed" ? { backgroundColor: "#3BC21D" } :
                          status === "today" ? { backgroundColor: accent } : {}
                        }
                      >
                        {status === "completed" ? "✓" : status === "today" ? "▶" : day.sessions.length === 0 ? "–" : "○"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(completedDays / 5) * 100}%`, backgroundColor: "#3BC21D" }} />
                </div>
                <span className="text-xs text-depro-gray font-medium">{completedDays}/5</span>
              </div>
            </div>
          </div>

          {/* Coach feedback */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Último feedback</h3>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-depro-blue-light flex items-center justify-center">
                  <Target size={14} className="text-depro-blue" />
                </div>
                <div>
                  <div className="text-sm font-bold text-depro-dark">Coach DEPRO</div>
                  <div className="text-xs text-depro-gray">{lastFeedback.week}</div>
                </div>
              </div>
              <p className="text-sm text-depro-gray leading-relaxed line-clamp-3">{lastFeedback.message}</p>
              <div className="mt-3 pt-3 border-t border-depro-border">
                <div className="text-xs text-depro-gray mb-1">Próximo foco:</div>
                <div className="text-xs font-bold text-depro-dark">{lastFeedback.nextFocus}</div>
              </div>
              <Link to="/dashboard/feedback" className="mt-3 text-xs font-semibold text-depro-blue flex items-center gap-1 hover:underline">
                Ver todo <ArrowRight size={11} />
              </Link>
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Acceso rápido</h3>
            <div className="space-y-2">
              {[
                { to: "/dashboard/technique", label: "Biblioteca técnica", icon: Zap },
                { to: "/dashboard/physical", label: "Preparación física", icon: Activity },
                { to: "/dashboard/library", label: "Sesiones", icon: Calendar },
              ].map((item) => (
                <Link
                  key={item.to} to={item.to}
                  className="flex items-center gap-3 p-3 bg-white border border-depro-border hover:border-depro-blue rounded-xl text-sm text-depro-gray hover:text-depro-blue transition-all group"
                >
                  <item.icon size={16} />
                  {item.label}
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
