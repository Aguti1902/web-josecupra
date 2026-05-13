import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, TrendingUp, Zap, CheckCircle, Clock,
  ArrowRight, Activity, Target, Flame, Trophy, Phone,
  Users, Shield, ClipboardList, BookOpen, ChevronRight,
  Crown, UserCheck, Dumbbell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { weeklyPlan, coachFeedback } from "../../data/mockData";

const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Contraste automático de texto
function contrastText(hex) {
  try {
    const h = (hex || "#0A36F7").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#111827" : "#ffffff";
  } catch { return "#ffffff"; }
}

// ── Shared header banner ─────────────────────────────────────
function ClubBanner({ club, team, teamRole, accent, secondColor }) {
  const roleLabel = { coordinador: "Coordinador", entrenador: "Entrenador", ayudante: "Ayudante técnico" };
  const RoleIcon = { coordinador: Crown, entrenador: UserCheck, ayudante: Dumbbell }[teamRole] || UserCheck;
  const hasBanner = !!club?.banner;
  // Si hay banner, texto siempre blanco (sobre imagen oscurecida). Si no, usar secondColor o contraste.
  const textColor = hasBanner ? "#ffffff" : (secondColor || contrastText(accent));
  const mutedColor = hasBanner ? "rgba(255,255,255,0.75)" : (textColor + "AA");

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: hasBanner
          ? `url(${club.banner}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
        minHeight: "120px",
      }}
    >
      {/* Overlay oscuro sobre el banner para legibilidad */}
      {hasBanner && <div className="absolute inset-0 bg-black/45" />}

      <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {club?.logo ? (
          <img src={club.logo} alt={club.name} className="w-16 h-16 rounded-xl object-contain bg-white p-1.5 flex-shrink-0 shadow-lg" />
        ) : (
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: textColor }}
          >
            {club?.abbreviation || "C"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: mutedColor }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2 className="text-2xl font-black truncate drop-shadow-sm" style={{ color: textColor }}>
            {club?.name || "Mi Club"}
          </h2>
          {club?.slogan && (
            <p className="text-sm mt-0.5 drop-shadow-sm" style={{ color: mutedColor }}>
              {club.slogan}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: textColor }}
            >
              <RoleIcon size={11} /> {roleLabel[teamRole] || teamRole}
            </span>
            {team && (
              <span className="text-sm font-medium drop-shadow-sm" style={{ color: mutedColor }}>
                · {team.name}
              </span>
            )}
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: textColor }}
        >
          {club?.plan || "Activo"}
        </div>
      </div>
    </div>
  );
}

// ── Stat card con colores del club ──────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent, secondary }) {
  const textOnAccent = contrastText(accent);
  return (
    <div
      className="rounded-xl p-4 hover:shadow-md transition-all border"
      style={{ backgroundColor: accent, borderColor: accent }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Icon size={20} style={{ color: textOnAccent }} />
        </div>
        <TrendingUp size={13} style={{ color: "rgba(255,255,255,0.6)" }} className="mt-1" />
      </div>
      <div className="text-2xl font-black" style={{ color: textOnAccent }}>{value ?? "—"}</div>
      <div className="text-sm mt-0.5" style={{ color: textOnAccent + "CC" }}>{label}</div>
      {sub && <div className="text-xs mt-0.5 font-bold" style={{ color: textOnAccent + "99" }}>{sub}</div>}
    </div>
  );
}

// ── Stat card variante secundaria ────────────────────────────
function StatCardSecondary({ label, value, sub, icon: Icon, accent, secondary }) {
  const textOnSecondary = contrastText(secondary || "#ffffff");
  const isWhite = (secondary || "#ffffff").toLowerCase() === "#ffffff" || (secondary || "#fff").toLowerCase() === "#fff";
  return (
    <div
      className={`rounded-xl p-4 hover:shadow-md transition-all border ${isWhite ? "border-depro-border" : ""}`}
      style={{
        backgroundColor: isWhite ? "#F9FAFB" : secondary,
        borderColor: isWhite ? undefined : secondary,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: accent + "20" }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
        <TrendingUp size={13} className="text-green-500 mt-1" />
      </div>
      <div className="text-2xl font-black" style={{ color: isWhite ? "#111827" : textOnSecondary }}>{value ?? "—"}</div>
      <div className="text-sm mt-0.5" style={{ color: isWhite ? "#6B7280" : textOnSecondary + "CC" }}>{label}</div>
      {sub && <div className="text-xs mt-0.5 font-bold" style={{ color: accent }}>{sub}</div>}
    </div>
  );
}

// ── Training days pill strip ─────────────────────────────────
function TrainingDaysPills({ days = [], accent, secondary }) {
  const textOnAccent = contrastText(accent);
  return (
    <div className="flex gap-1.5 flex-wrap">
      {DAYS_FULL.map((day, i) => (
        <span
          key={day}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold"
          style={
            days.includes(day)
              ? { backgroundColor: accent, color: textOnAccent }
              : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
          }
        >
          {DAY_SHORT[i]}
        </span>
      ))}
    </div>
  );
}

// ── Section heading with accent stripe ──────────────────────
function SectionHeading({ title, accent, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
      <h3 className="font-bold text-depro-dark text-lg flex-1">{title}</h3>
      {count !== undefined && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: accent + "15", color: accent }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COORDINADOR DASHBOARD
// ════════════════════════════════════════════════════════════
function CoordinadorDashboard({ club, accent, secondColor }) {
  const teams = club?.teams || [];
  const totalPlayers = teams.reduce((sum, t) => sum + (t.players || 0), 0);
  const totalSessions = (club?.plans || []).reduce((sum, mc) => sum + (mc.sessions?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats globales del club — alternando primary y secondary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Equipos" value={teams.length} sub="en el club" icon={Shield} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Jugadores" value={totalPlayers} sub="en total" icon={Users} accent={accent} secondary={secondColor} />
        <StatCard label="Microciclos" value={(club?.plans || []).length} sub="planificados" icon={ClipboardList} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Sesiones" value={totalSessions} sub="en planificación" icon={Calendar} accent={accent} secondary={secondColor} />
      </div>

      {/* Equipos */}
      <div>
        <SectionHeading title="Equipos del club" accent={accent} count={teams.length} />
        {teams.length === 0 ? (
          <div
            className="text-center py-14 border-2 border-dashed rounded-2xl"
            style={{ borderColor: accent + "30" }}
          >
            <Shield size={36} className="mx-auto mb-3" style={{ color: accent + "50" }} />
            <p className="font-medium text-depro-dark">Sin equipos todavía</p>
            <p className="text-sm mt-1 text-depro-gray">El administrador aún no ha añadido equipos a este club.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamPlans = (club?.plans || []).filter((mc) => !mc.teamId || mc.teamId === team.id);
              return (
                <div
                  key={team.id}
                  className="bg-white rounded-xl p-5 space-y-3 hover:shadow-md transition-all border"
                  style={{ borderColor: accent + "25", borderTopWidth: "3px", borderTopColor: accent }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-depro-dark">{team.name}</h4>
                      <p className="text-xs text-depro-gray mt-0.5">{team.category} · {team.season}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: accent, color: contrastText(accent) }}
                    >
                      {team.players || 0} jug.
                    </span>
                  </div>

                  {team.trainingDays?.length > 0 && (
                    <TrainingDaysPills days={team.trainingDays} accent={accent} secondary={secondColor} />
                  )}

                  {team.coach && (
                    <div
                      className="flex items-center gap-2 text-xs pt-2 border-t"
                      style={{ borderColor: accent + "20" }}
                    >
                      <UserCheck size={12} style={{ color: accent }} />
                      <span className="font-medium text-depro-dark">{team.coach.name}</span>
                      <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: accent + "10", color: accent }}
                      >Entrenador</span>
                    </div>
                  )}

                  <div
                    className="flex items-center justify-between text-xs pt-2 border-t"
                    style={{ borderColor: accent + "20" }}
                  >
                    <span className="flex items-center gap-1 text-depro-gray"><ClipboardList size={11} /> {teamPlans.length} microciclos</span>
                    <Link
                      to="/dashboard/plan"
                      className="flex items-center gap-1 font-bold hover:underline"
                      style={{ color: accent }}
                    >
                      Ver plan <ChevronRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Planificación global */}
      {(club?.plans || []).length > 0 && (
        <div>
          <SectionHeading title="Microciclos activos" accent={accent} count={(club.plans || []).length} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(club.plans || []).slice(0, 4).map((mc) => {
              const teamName = teams.find((t) => t.id === mc.teamId)?.name || "Todos los equipos";
              return (
                <div
                  key={mc.id}
                  className="bg-white border rounded-xl p-5"
                  style={{ borderColor: accent + "25", borderLeftWidth: "3px", borderLeftColor: accent }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                    <h4 className="font-semibold text-depro-dark">{mc.name}</h4>
                    <span
                      className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: accent + "15", color: accent }}
                    >{teamName}</span>
                  </div>
                  <p className="text-sm text-depro-gray mb-2">{mc.objective || "Sin objetivo definido"}</p>
                  <div className="text-xs flex items-center gap-1 font-medium" style={{ color: accent }}>
                    <Activity size={11} /> {(mc.sessions || []).length} sesiones
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ENTRENADOR / AYUDANTE DASHBOARD
// ════════════════════════════════════════════════════════════
function EntrenadorDashboard({ club, team, teamRole, accent, secondColor }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!club?.id) return;
    import("../../lib/supabase").then(({ supabase: sb }) => {
      sb.from("profiles")
        .select("id, name, avatar, plan, position, level")
        .eq("role", "player")
        .then(({ data }) => {
          const allClubPlayers = (data || []).filter((p) => {
            const saved = localStorage.getItem(`depro_player_club_${p.id}`);
            return saved === club.id;
          });
          setPlayers(allClubPlayers);
        });
    });
  }, [club?.id]);

  const allPlans = club?.plans || [];
  const myPlans = team
    ? allPlans.filter((mc) => !mc.teamId || mc.teamId === team.id)
    : allPlans;

  const nextSession = myPlans.flatMap((mc) => mc.sessions || [])[0] || null;

  const quickLinks = [
    { to: "/dashboard/plan",      label: "Planificación semanal", icon: ClipboardList },
    { to: "/dashboard/squad",     label: "Plantilla",             icon: Users },
    { to: "/dashboard/tactics",   label: "Guía táctica",          icon: BookOpen },
    { to: "/dashboard/mesocycle", label: "Mesociclo",             icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Stats del equipo — alternando primary y secondary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jugadores" value={team?.players || "—"} sub={team?.name || "equipo"} icon={Users} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Microciclos" value={myPlans.length} sub="asignados" icon={ClipboardList} accent={accent} secondary={secondColor} />
        <StatCard label="Sesiones" value={myPlans.reduce((s, mc) => s + (mc.sessions?.length || 0), 0)} sub="en total" icon={Calendar} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Categoría" value={team?.category || "—"} sub={team?.season} icon={Shield} accent={accent} secondary={secondColor} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próxima sesión */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeading title="Próxima sesión" accent={accent} />
          {nextSession ? (
            <div className="bg-white border rounded-xl p-5" style={{ borderColor: accent + "25", borderTopWidth: "3px", borderTopColor: accent }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: accent, color: contrastText(accent) }}
                  >
                    {nextSession.type || "Sesión"}
                  </span>
                  <h4 className="font-bold text-depro-dark text-lg">{nextSession.title || nextSession.name}</h4>
                  <p className="text-sm text-depro-gray mt-0.5">{nextSession.objective || nextSession.description}</p>
                </div>
                {nextSession.duration && (
                  <div className="flex items-center gap-1 text-sm flex-shrink-0 font-medium" style={{ color: accent }}>
                    <Clock size={13} /> {nextSession.duration}
                  </div>
                )}
              </div>
              {(nextSession.exercises || []).slice(0, 3).map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl mb-2"
                  style={{ backgroundColor: accent + "08" }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: accent, color: contrastText(accent) }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-depro-dark">{ex.name}</span>
                  {ex.sets && <span className="ml-auto text-xs text-depro-gray">{ex.sets} series</span>}
                </div>
              ))}
              <Link
                to="/dashboard/plan"
                className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                <Flame size={14} /> Ver plan completo <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-14 border border-dashed border-depro-border rounded-2xl text-depro-gray">
              <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin sesiones planificadas todavía</p>
              <p className="text-sm mt-1">El administrador aún no ha creado sesiones para {team?.name || "tu equipo"}.</p>
            </div>
          )}

          {/* Días de entreno del equipo */}
          {team?.trainingDays?.length > 0 && (
            <div className="bg-white border border-depro-border rounded-xl p-5">
              <h4 className="font-semibold text-depro-dark mb-3 flex items-center gap-2">
                <Calendar size={15} style={{ color: accent }} /> Días de entrenamiento
              </h4>
              <TrainingDaysPills days={team.trainingDays} accent={accent} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Microciclos */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Planificación</h3>
            {myPlans.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-depro-border rounded-xl text-depro-gray">
                <p className="text-sm">Sin microciclos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myPlans.slice(0, 4).map((mc) => (
                  <div key={mc.id} className="bg-white border border-depro-border rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                      <span className="text-sm font-medium text-depro-dark truncate">{mc.name}</span>
                      <span className="ml-auto text-xs text-depro-gray flex-shrink-0">{(mc.sessions || []).length} ses.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jugadores del club */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3 flex items-center gap-2">
              <Users size={15} style={{ color: accent }} /> Jugadores
            </h3>
            {players.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-depro-border rounded-xl text-depro-gray text-xs">
                <Users size={20} className="mx-auto mb-2 opacity-30" />
                <p>Ningún jugador se ha unido todavía.</p>
                <p className="mt-1 font-mono font-bold" style={{ color: accent }}>
                  Código: {club?.loginCode || club?.login_code || "—"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 bg-white border border-depro-border rounded-xl">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: accent + "15", color: accent }}
                    >
                      {p.avatar || p.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-depro-dark truncate">{p.name}</div>
                      {p.position && <div className="text-xs text-depro-gray">{p.position}</div>}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "10", color: accent }}>
                      {p.plan || "—"}
                    </span>
                  </div>
                ))}
                {players.length > 6 && (
                  <p className="text-xs text-depro-gray text-center pt-1">+{players.length - 6} más en plantilla</p>
                )}
              </div>
            )}
          </div>

          {/* Acceso rápido */}
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Acceso rápido</h3>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.to} to={item.to}
                  className="flex items-center gap-3 p-3 bg-white border border-depro-border hover:border-depro-blue rounded-xl text-sm text-depro-gray hover:text-depro-blue transition-all group"
                >
                  <item.icon size={15} />
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

// ════════════════════════════════════════════════════════════
// JUGADOR DASHBOARD (original)
// ════════════════════════════════════════════════════════════
function JugadorDashboard({ user, club }) {
  const accent = club?.primaryColor || "#0A36F7";
  const isPremium = user?.plan === "Premium" || user?.plan === "Pro";
  const today = weeklyPlan.find((d) => d.sessions.some((s) => s.status === "today"));
  const todaySession = today?.sessions[0];
  const completedDays = weeklyPlan.filter((d) => d.sessions.some((s) => s.status === "completed")).length;
  const lastFeedback = coachFeedback[0];

  return (
    <div className="space-y-6">
      {/* Banner del club si el jugador está asociado */}
      {club && (
        <div
          className="rounded-2xl p-4 border flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${accent}12 0%, white 100%)`,
            borderColor: accent + "30",
          }}
        >
          {club.logo ? (
            <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-depro-border flex-shrink-0" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ backgroundColor: accent + "15", color: accent }}
            >
              {club.abbreviation || club.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: accent }}>Tu club</div>
            <div className="font-bold text-depro-dark truncate">{club.name}</div>
            {club.slogan && <div className="text-xs italic text-depro-gray mt-0.5">"{club.slogan}"</div>}
          </div>
          <Shield size={18} style={{ color: accent }} className="flex-shrink-0" />
        </div>
      )}

      {/* Welcome */}
      <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, ${accent}08 0%, white 100%)`, borderColor: accent + "20" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 shadow-sm" style={{ backgroundColor: accent + "15", color: accent }}>
            {user?.avatar}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="text-2xl font-black text-depro-dark">Hola, {user?.name?.split(" ")[0]}.</h2>
            <p className="text-depro-gray text-sm mt-0.5">
              {user?.training_days ?? user?.trainingDays ?? "—"} días de entreno · {user?.level || "—"}
            </p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-depro-yellow text-depro-dark text-xs font-black">
              <Trophy size={13} /> Plan Premium
            </div>
          )}
          {todaySession && (
            <Link to="/dashboard/plan" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90" style={{ backgroundColor: accent }}>
              <Flame size={15} /> Sesión de hoy <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {isPremium && (
        <div className="rounded-2xl bg-depro-blue p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Phone size={20} className="text-white" /></div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Contacto directo con tu preparador</div>
            <div className="text-blue-200 text-xs mt-0.5">Plan Premium · Acceso a contacto directo</div>
          </div>
          <a href="tel:+34600000000" className="flex-shrink-0 bg-white text-depro-blue text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">Llamar</a>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sesiones completadas" value={completedDays} sub="esta semana" icon={CheckCircle} color="#3BC21D" />
        <StatCard label="Días de entreno" value={user?.training_days || user?.trainingDays || 5} sub="por semana" icon={Calendar} color={accent} />
        <StatCard label="Valoración coach" value={`${lastFeedback.rating}/10`} sub="última revisión" icon={Trophy} color="#F6CC12" />
        <StatCard label="Plan actual" value={user?.plan || "—"} sub="activo" icon={Zap} color="#FB2C39" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-depro-dark">Sesión de hoy</h3>
            <Link to="/dashboard/plan" className="text-sm text-depro-blue hover:underline flex items-center gap-1">Ver plan completo <ArrowRight size={13} /></Link>
          </div>
          {todaySession ? (
            <div className="bg-white border border-depro-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="tag-blue mb-1 inline-block">{todaySession.type}</span>
                  <h4 className="text-lg font-bold text-depro-dark">{todaySession.title}</h4>
                  <p className="text-sm text-depro-gray mt-0.5">{todaySession.objective}</p>
                </div>
                <div className="flex items-center gap-1.5 text-depro-gray text-sm"><Clock size={14} />{todaySession.duration}</div>
              </div>
              <div className="space-y-2">
                {todaySession.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 bg-depro-gray-light rounded-xl">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: accent + "15", color: accent }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-depro-dark">{ex.name}</div>
                      <div className="text-xs text-depro-gray">{ex.duration} · {ex.sets} sets · {ex.reps}</div>
                    </div>
                  </div>
                ))}
                {todaySession.exercises.length > 3 && <p className="text-xs text-depro-gray text-center pt-1">+ {todaySession.exercises.length - 3} ejercicios más</p>}
              </div>
              <Link to="/dashboard/plan" className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90" style={{ backgroundColor: accent }}>
                Iniciar sesión <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-depro-border rounded-xl text-center py-12">
              <Trophy size={32} className="text-depro-border mx-auto mb-3" />
              <p className="text-depro-gray font-medium">Día de descanso.</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Progreso semanal</h3>
            <div className="bg-white border border-depro-border rounded-xl p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weeklyPlan.map((day) => {
                  const s = day.sessions[0]; const status = s?.status;
                  return (
                    <div key={day.shortDay} className="flex flex-col items-center gap-1">
                      <div className="text-xs text-depro-gray font-medium">{day.shortDay[0]}</div>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={status === "completed" ? { backgroundColor: "#3BC21D", color: "#fff" } : status === "today" ? { backgroundColor: accent, color: "#fff" } : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
                        {status === "completed" ? "✓" : status === "today" ? "▶" : day.sessions.length === 0 ? "–" : "○"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(completedDays / 5) * 100}%`, backgroundColor: "#3BC21D" }} />
                </div>
                <span className="text-xs text-depro-gray font-medium">{completedDays}/5</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-depro-dark mb-3">Último feedback</h3>
            <div className="bg-white border border-depro-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-depro-blue/10 flex items-center justify-center"><Target size={14} className="text-depro-blue" /></div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN — Router por rol
// ════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth();
  const club = user?.club;
  const team = user?.team;
  const teamRole = user?.team_role;
  const accent = club?.primaryColor || "#0A36F7";
  const secondColor = club?.secondaryColor || "#FFFFFF";

  if (user?.role === "club") {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <ClubBanner club={club} team={team} teamRole={teamRole} accent={accent} secondColor={secondColor} />
        {teamRole === "coordinador"
          ? <CoordinadorDashboard club={club} accent={accent} secondColor={secondColor} />
          : <EntrenadorDashboard club={club} team={team} teamRole={teamRole} accent={accent} secondColor={secondColor} />
        }
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <JugadorDashboard user={user} club={club} />
    </div>
  );
}
