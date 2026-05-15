import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, TrendingUp, Zap, CheckCircle, Clock,
  ArrowRight, Activity, Target, Flame, Trophy, Phone,
  Users, Shield, ClipboardList, BookOpen, ChevronRight,
  Crown, UserCheck, Dumbbell,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { weeklyPlan, coachFeedback } from "../../data/mockData";
import {
  distributeMesocycleForTeam, getCurrentWeekIndex, isMesocicloActive,
} from "../../lib/periodization";

const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/* ── Helper: bloque de edad por categoría ─────────────────── */
function getAgeBlock(category) {
  const map = {
    "Bloque 1": ["Sub-9","Sub-10","Sub-11","Sub-12"],
    "Bloque 2": ["Sub-13","Sub-14","Sub-15"],
    "Bloque 3": ["Sub-16","Juvenil"],
  };
  for (const [id, ages] of Object.entries(map)) {
    if (ages.includes(category)) return id;
  }
  return null;
}

/* ── Carga planes globales desde localStorage + API ─────── */
function loadGlobalPlans() {
  try { return JSON.parse(localStorage.getItem("depro_global_plans") || "[]"); }
  catch { return []; }
}

// Luminancia 0–1
function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}

function contrastText(hex) {
  return lum(hex) > 0.55 ? "#111827" : "#ffffff";
}

// Devuelve el color si es oscuro suficiente sobre blanco, si no devuelve el fallback
function visibleOnWhite(color, fallback = "#0A36F7") {
  return lum(color) > 0.75 ? fallback : color;
}

// ── Shared header banner ─────────────────────────────────────
function ClubBanner({ club, team, teamRole, accent, secondColor }) {
  const { t: tg } = useTranslation();
  const roleLabel = { coordinador: tg("dashboard.coordinator"), entrenador: tg("dashboard.coach"), ayudante: tg("dashboard.assistant") };
  const RoleIcon = { coordinador: Crown, entrenador: UserCheck, ayudante: Dumbbell }[teamRole] || UserCheck;
  const hasBanner = !!club?.banner;

  // Color seguro para el fondo del banner cuando no hay imagen
  const safeBg = lum(accent) > 0.75
    ? (lum(secondColor) > 0.75 ? "#1E3A8A" : secondColor)
    : accent;

  // Texto: si hay banner siempre blanco. Si no, contraste sobre el safeBg
  const textColor = hasBanner ? "#ffffff" : contrastText(safeBg);
  const mutedColor = hasBanner ? "rgba(255,255,255,0.75)" : (textColor === "#ffffff" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)");

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: hasBanner
          ? `url(${club.banner}) center/cover no-repeat`
          : `linear-gradient(135deg, ${safeBg} 0%, ${safeBg}DD 100%)`,
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

// ── Stat card — se adapta: relleno si el color es oscuro, borde si es claro ──
function StatCard({ label, value, sub, icon: Icon, accent, secondary }) {
  const safeAccent = visibleOnWhite(accent, visibleOnWhite(secondary, "#0A36F7"));
  const isLight = lum(accent) > 0.75;

  if (isLight) {
    // Modo borde: fondo blanco con borde y acentos en color
    return (
      <div
        className="bg-white rounded-xl p-4 hover:shadow-md transition-all border-2"
        style={{ borderColor: safeAccent }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: safeAccent + "15" }}>
            <Icon size={20} style={{ color: safeAccent }} />
          </div>
          <TrendingUp size={13} className="text-green-500 mt-1" />
        </div>
        <div className="text-2xl font-black text-depro-dark">{value ?? "—"}</div>
        <div className="text-sm text-depro-gray mt-0.5">{label}</div>
        {sub && <div className="text-xs mt-0.5 font-bold" style={{ color: safeAccent }}>{sub}</div>}
      </div>
    );
  }

  // Modo relleno: fondo con el color del club
  const textOnAccent = contrastText(accent);
  return (
    <div className="rounded-xl p-4 hover:shadow-md transition-all border" style={{ backgroundColor: accent, borderColor: accent }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
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
  const safeAccent = visibleOnWhite(accent, visibleOnWhite(secondary, "#0A36F7"));
  const secLight = lum(secondary) > 0.75;

  if (secLight) {
    // Secundario claro → usar fondo muy suave con borde del color primario visible
    return (
      <div className="bg-depro-gray-light rounded-xl p-4 hover:shadow-md transition-all border border-depro-border">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: safeAccent + "20" }}>
            <Icon size={20} style={{ color: safeAccent }} />
          </div>
          <TrendingUp size={13} className="text-green-500 mt-1" />
        </div>
        <div className="text-2xl font-black text-depro-dark">{value ?? "—"}</div>
        <div className="text-sm text-depro-gray mt-0.5">{label}</div>
        {sub && <div className="text-xs mt-0.5 font-bold" style={{ color: safeAccent }}>{sub}</div>}
      </div>
    );
  }

  const textOnSec = contrastText(secondary);
  return (
    <div className="rounded-xl p-4 hover:shadow-md transition-all border" style={{ backgroundColor: secondary, borderColor: secondary }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <Icon size={20} style={{ color: textOnSec }} />
        </div>
        <TrendingUp size={13} style={{ color: "rgba(255,255,255,0.6)" }} className="mt-1" />
      </div>
      <div className="text-2xl font-black" style={{ color: textOnSec }}>{value ?? "—"}</div>
      <div className="text-sm mt-0.5" style={{ color: textOnSec + "CC" }}>{label}</div>
      {sub && <div className="text-xs mt-0.5 font-bold" style={{ color: textOnSec + "99" }}>{sub}</div>}
    </div>
  );
}

// ── Training days pill strip ─────────────────────────────────
function TrainingDaysPills({ days = [], safeAccent }) {
  const textOnAccent = contrastText(safeAccent);
  return (
    <div className="flex gap-1.5 flex-wrap">
      {DAYS_FULL.map((day, i) => (
        <span
          key={day}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold"
          style={
            days.includes(day)
              ? { backgroundColor: safeAccent, color: textOnAccent }
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
function SectionHeading({ title, safeAccent, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: safeAccent }} />
      <h3 className="font-bold text-depro-dark text-lg flex-1">{title}</h3>
      {count !== undefined && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: safeAccent + "18", color: safeAccent }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ── Coach avatar mini ────────────────────────────────────────
function CoachAvatar({ coach, safeAccent }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    if (!coach?.email) return;
    // Buscar foto por email en localStorage (iterar keys)
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("depro_club_profile_")) {
          // La foto está asociada al userId no al email; lo mejor es mostrar iniciales por ahora
        }
      }
    } catch {}
  }, [coach?.email]);

  const initials = (coach?.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: safeAccent, color: contrastText(safeAccent) }}
      >
        {photo ? <img src={photo} alt={coach.name} className="w-full h-full object-cover" /> : initials}
      </div>
      <span className="font-medium text-depro-dark text-xs">{coach?.name}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COORDINADOR DASHBOARD
// ════════════════════════════════════════════════════════════
function CoordinadorDashboard({ club, accent, secondColor, onViewTeam }) {
  const teams = club?.teams || [];
  const totalSessions = (club?.plans || []).reduce((sum, mc) => sum + (mc.sessions?.length || 0), 0);

  // Contar jugadores reales desde localStorage (depro_squad_{clubId}_{teamId})
  const [squadCounts, setSquadCounts] = useState({});
  useEffect(() => {
    if (!club?.id) return;
    const counts = {};
    teams.forEach((t) => {
      try {
        const raw = localStorage.getItem(`depro_squad_${club.id}_${t.id}`);
        counts[t.id] = (JSON.parse(raw || "[]")).length;
      } catch { counts[t.id] = 0; }
    });
    setSquadCounts(counts);
  }, [club?.id, teams]);

  const playerCount = (teamId) => squadCounts[teamId] ?? 0;
  const totalPlayers = Object.values(squadCounts).reduce((a, b) => a + b, 0);

  // Color seguro para usar sobre fondo BLANCO (cards, textos, badges)
  const sa = visibleOnWhite(accent, visibleOnWhite(secondColor, "#0A36F7"));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Equipos" value={teams.length} sub="en el club" icon={Shield} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Jugadores" value={totalPlayers} sub="en total" icon={Users} accent={accent} secondary={secondColor} />
        <StatCard label="Microciclos" value={(club?.plans || []).length} sub="planificados" icon={ClipboardList} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Sesiones" value={totalSessions} sub="en planificación" icon={Calendar} accent={accent} secondary={secondColor} />
      </div>

      {/* Equipos */}
      <div>
        <SectionHeading title="Equipos del club" safeAccent={sa} count={teams.length} />
        {teams.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed rounded-2xl" style={{ borderColor: sa + "40" }}>
            <Shield size={36} className="mx-auto mb-3" style={{ color: sa + "60" }} />
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
                  onClick={() => onViewTeam(team)}
                  className="bg-white rounded-xl p-5 space-y-3 hover:shadow-lg transition-all border cursor-pointer group"
                  style={{ borderColor: sa + "30", borderTopWidth: "3px", borderTopColor: sa }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-depro-dark group-hover:underline">{team.name}</h4>
                      <p className="text-xs text-depro-gray mt-0.5">{team.category} · {team.season}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sa, color: contrastText(sa) }}
                    >
                      {playerCount(team.id)} jug.
                    </span>
                  </div>

                  {team.trainingDays?.length > 0 && (
                    <TrainingDaysPills days={team.trainingDays} safeAccent={sa} />
                  )}

                  {team.coach && (
                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: sa + "20" }}>
                      <CoachAvatar coach={team.coach} safeAccent={sa} />
                      <span
                        className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: sa + "15", color: sa }}
                      >Entrenador</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: sa + "20" }}>
                    <span className="flex items-center gap-1 text-depro-gray">
                      <ClipboardList size={11} style={{ color: sa }} /> {teamPlans.length} microciclos
                    </span>
                    <span className="flex items-center gap-1 font-bold" style={{ color: sa }}>
                      Ver equipo <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estadísticas por equipo */}
      {teams.length > 0 && (
        <div>
          <SectionHeading title="Estadísticas por equipo" safeAccent={sa} />
          <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: sa + "25" }}>
            {/* Header */}
            <div
              className="grid grid-cols-4 gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: sa + "10", color: sa }}
            >
              <span>Equipo</span>
              <span className="text-center">Jugadores</span>
              <span className="text-center">Microciclos</span>
              <span className="text-center">Sesiones</span>
            </div>
            {teams.map((team, idx) => {
              const teamPlans = (club?.plans || []).filter((mc) => !mc.teamId || mc.teamId === team.id);
              const teamSessions = teamPlans.reduce((s, mc) => s + (mc.sessions?.length || 0), 0);
              return (
                <div
                  key={team.id}
                  onClick={() => onViewTeam(team)}
                  className={`grid grid-cols-4 gap-2 px-5 py-3.5 items-center cursor-pointer hover:bg-depro-gray-light transition-colors group ${
                    idx < teams.length - 1 ? "border-b border-depro-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: sa, color: contrastText(sa) }}
                    >
                      {(team.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-depro-dark text-sm truncate group-hover:underline">{team.name}</div>
                      <div className="text-xs text-depro-gray">{team.category}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span
                      className="inline-block text-sm font-black px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: sa + "12", color: sa }}
                    >{playerCount(team.id)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-depro-dark">{teamPlans.length}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-depro-dark">{teamSessions}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Microciclos recientes (si hay) */}
      {(club?.plans || []).length > 0 && (
        <div>
          <SectionHeading title="Microciclos recientes" safeAccent={sa} count={(club.plans || []).length} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(club.plans || []).slice(0, 4).map((mc) => {
              const teamName = teams.find((t) => t.id === mc.teamId)?.name || "Global";
              return (
                <div
                  key={mc.id}
                  className="bg-white border rounded-xl p-4"
                  style={{ borderColor: sa + "25", borderLeftWidth: "3px", borderLeftColor: sa }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-depro-dark flex-1 truncate">{mc.name}</h4>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sa + "15", color: sa }}
                    >{teamName}</span>
                  </div>
                  <p className="text-xs text-depro-gray mb-1.5">{mc.objective || "Sin objetivo definido"}</p>
                  <div className="text-xs flex items-center gap-1 font-medium" style={{ color: sa }}>
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
function EntrenadorDashboard({ club, team, teamRole, accent, secondColor, onBack }) {
  const [squadPlayers, setSquadPlayers]  = useState([]); // añadidos manualmente
  const [regPlayers, setRegPlayers]      = useState([]); // jugadores registrados (Stripe)
  const [globalPlans, setGlobalPlans]    = useState(() => loadGlobalPlans());
  const players = [...squadPlayers, ...regPlayers.map((p) => ({ ...p, _registered: true }))];

  // Color seguro sobre fondo blanco
  const sa = visibleOnWhite(accent, visibleOnWhite(secondColor, "#0A36F7"));

  // Jugadores manuales del squad
  useEffect(() => {
    if (!club?.id || !team?.id) return;
    try {
      const raw = localStorage.getItem(`depro_squad_${club.id}_${team.id}`);
      setSquadPlayers(JSON.parse(raw || "[]"));
    } catch { setSquadPlayers([]); }
  }, [club?.id, team?.id]);

  // Jugadores registrados con plan de pago que se han unido a este equipo
  useEffect(() => {
    if (!team?.id) return;

    // Intentar API de Vercel primero; si falla, leer directamente de Supabase profiles
    fetch(`/api/team-players?teamId=${team.id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("api_fail"))
      .then(({ players: list }) => { if (list?.length >= 0) setRegPlayers(list); })
      .catch(async () => {
        // Fallback: consultar player_team_links (tabla sin FK, legible por autenticados)
        try {
          const { data } = await supabase
            .from("player_team_links")
            .select("player_id, name, plan, team_id")
            .eq("team_id", team.id);
          if (data?.length > 0) {
            setRegPlayers(data.map((p) => ({
              id:       p.player_id,
              name:     p.name || "Jugador",
              plan:     p.plan || "—",
              position: null,
              teamId:   team.id,
            })));
          }
        } catch { /* silencioso */ }
      });
  }, [team?.id]);

  // Cargar planes globales desde la nube (cross-device)
  useEffect(() => {
    fetch("/api/admin-clubs")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const entry = (data.clubs || []).find((c) => c.id === "GLOBAL_PLANS");
        if (entry?.plans?.length > 0) {
          localStorage.setItem("depro_global_plans", JSON.stringify(entry.plans));
          setGlobalPlans(entry.plans);
        }
      })
      .catch(() => {});
  }, []);

  // Determinar la próxima sesión: buscar en planes globales por bloque de edad
  const teamCategory = team?.category ?? null;
  const ageBlock = getAgeBlock(teamCategory);
  const trainingDays = team?.trainingDays || [];

  // Filtrar planes por bloque del equipo
  const blockPlans = globalPlans.filter((p) => {
    if (p.ageBlock && ageBlock) return p.ageBlock === ageBlock;
    return true;
  });

  // Encontrar el mesociclo activo
  const activePlan = blockPlans.find((p) => isMesocicloActive(p.startDate, p.endDate))
    || blockPlans[0];

  // Obtener sesiones de la semana actual
  let nextSession = null;
  if (activePlan?.sessions?.length > 0) {
    const { weeks } = distributeMesocycleForTeam(activePlan.sessions, trainingDays, 3);
    const weekIdx = getCurrentWeekIndex(activePlan.startDate, activePlan.endDate);
    const currentWeekSessions = weeks[weekIdx >= 0 ? weekIdx : 0]?.sessions || [];
    nextSession = currentWeekSessions[0] || activePlan.sessions[0] || null;
  }

  // Fallback: planes del club (sistema antiguo)
  const allClubPlans = club?.plans || [];
  const myClubPlans = team
    ? allClubPlans.filter((mc) => !mc.teamId || mc.teamId === team.id)
    : allClubPlans;
  if (!nextSession) {
    nextSession = myClubPlans.flatMap((mc) => mc.sessions || [])[0] || null;
  }

  const myPlans = blockPlans.length > 0 ? blockPlans : myClubPlans;

  const quickLinks = [
    { to: "/dashboard/plan",      label: "Planificación semanal", icon: ClipboardList },
    { to: "/dashboard/squad",     label: "Plantilla",             icon: Users },
    { to: "/dashboard/tactics",   label: "Guía táctica",          icon: BookOpen },
    { to: "/dashboard/mesocycle", label: "Mesociclo",             icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Botón volver (solo si es coordinador viendo equipo) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-depro-gray hover:text-depro-dark transition-colors -mb-2"
        >
          <ChevronRight size={14} className="rotate-180" /> Volver a todos los equipos
        </button>
      )}

      {/* Stats del equipo — alternando primary y secondary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jugadores" value={players.length || "—"} sub={team?.name || "equipo"} icon={Users} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Microciclos" value={myPlans.length} sub="asignados" icon={ClipboardList} accent={accent} secondary={secondColor} />
        <StatCard label="Sesiones" value={myPlans.reduce((s, mc) => s + (mc.sessions?.length || 0), 0)} sub="en total" icon={Calendar} accent={accent} secondary={secondColor} />
        <StatCardSecondary label="Categoría" value={team?.category || "—"} sub={team?.season} icon={Shield} accent={accent} secondary={secondColor} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próxima sesión */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeading title="Próxima sesión" safeAccent={sa} />
          {nextSession ? (
            <div className="bg-white border rounded-xl p-5" style={{ borderColor: accent + "25", borderTopWidth: "3px", borderTopColor: accent }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: sa, color: contrastText(sa) }}
                  >
                    {nextSession.type || "Sesión"}
                  </span>
                  <h4 className="font-bold text-depro-dark text-lg">{nextSession.title || nextSession.name}</h4>
                  <p className="text-sm text-depro-gray mt-0.5">{nextSession.objective || nextSession.description}</p>
                </div>
                {nextSession.duration && (
                  <div className="flex items-center gap-1 text-sm flex-shrink-0 font-medium" style={{ color: sa }}>
                    <Clock size={13} /> {nextSession.duration}
                  </div>
                )}
              </div>
              {(nextSession.exercises || []).slice(0, 3).map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl mb-2"
                  style={{ backgroundColor: sa + "0D" }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: sa, color: contrastText(sa) }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-depro-dark">{ex.name}</span>
                  {ex.sets && <span className="ml-auto text-xs text-depro-gray">{ex.sets} series</span>}
                </div>
              ))}
              <Link
                to="/dashboard/plan"
                className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: sa, color: contrastText(sa) }}
              >
                <Flame size={14} /> Ver plan completo <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-14 border-2 border-dashed rounded-2xl" style={{ borderColor: sa + "30" }}>
              <ClipboardList size={36} className="mx-auto mb-3" style={{ color: sa + "50" }} />
              <p className="font-medium text-depro-dark">Sin sesiones planificadas todavía</p>
              <p className="text-sm mt-1 text-depro-gray">El administrador aún no ha creado sesiones para {team?.name || "tu equipo"}.</p>
            </div>
          )}

          {/* Días de entreno del equipo */}
          {team?.trainingDays?.length > 0 && (
            <div className="bg-white border border-depro-border rounded-xl p-5">
              <h4 className="font-semibold text-depro-dark mb-3 flex items-center gap-2">
                <Calendar size={15} style={{ color: sa }} /> Días de entrenamiento
              </h4>
              <TrainingDaysPills days={team.trainingDays} safeAccent={sa} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Microciclos */}
          <div>
            <SectionHeading title="Planificación" safeAccent={sa} count={myPlans.length} />
            {myPlans.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-xl" style={{ borderColor: sa + "30" }}>
                <p className="text-sm text-depro-gray">Sin microciclos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myPlans.slice(0, 4).map((mc) => (
                  <div key={mc.id} className="bg-white border border-depro-border rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sa }} />
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
            <SectionHeading title="Jugadores" safeAccent={sa} count={players.length || undefined} />
            {players.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-xl text-xs" style={{ borderColor: sa + "30" }}>
                <Users size={20} className="mx-auto mb-2" style={{ color: sa + "60" }} />
                <p className="text-depro-gray">Aún no hay jugadores en la plantilla.</p>
                <p className="mt-1 text-xs" style={{ color: sa }}>
                  Añádelos desde la sección <strong>Plantilla</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 bg-white border border-depro-border rounded-xl">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: sa, color: contrastText(sa) }}
                    >
                      {p.avatar || p.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-depro-dark truncate">{p.name}</div>
                      {p.position && <div className="text-xs text-depro-gray">{p.position}</div>}
                    </div>
                    {p._registered ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {p.plan || "Premium"}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sa + "15", color: sa }}>
                        {p.number ? `#${p.number}` : p.position || "—"}
                      </span>
                    )}
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
                  className="flex items-center gap-3 p-3 bg-white border rounded-xl text-sm text-depro-gray transition-all group hover:shadow-sm"
                  style={{ borderColor: sa + "30" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = sa; e.currentTarget.style.color = sa; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = sa + "30"; e.currentTarget.style.color = ""; }}
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
// Helper: semana actual (lunes → domingo) como clave
function weekKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function JugadorDashboard({ user, club }) {
  const accent    = club?.primaryColor || "#0A36F7";
  // Siempre un color visible sobre fondo blanco (si el club tiene color claro usamos el azul DEPRO)
  const safeAccent = visibleOnWhite(accent, "#0A36F7");
  const isPremium = user?.plan === "Premium" || user?.plan === "Pro";
  const today = weeklyPlan.find((d) => d.sessions.some((s) => s.status === "today"));
  const todaySession = today?.sessions[0];
  const lastFeedback = coachFeedback[0];

  // ── Progreso real (localStorage) ───────────────────────────
  const freqNum = parseInt(
    String(user?.frecuencia || user?.training_days || 3).replace(/\D/g, "")
  ) || 3;

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(`depro_progress_${user?.id}_${weekKey()}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const completedDays = completedIds.length;
  const progressPct   = Math.min(100, Math.round((completedDays / freqNum) * 100));

  const markDayDone = (label) => {
    if (completedIds.includes(label)) return;
    const updated = [...completedIds, label];
    setCompletedIds(updated);
    localStorage.setItem(`depro_progress_${user?.id}_${weekKey()}`, JSON.stringify(updated));
  };

  const days7 = ["L", "M", "X", "J", "V", "S", "D"];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=lunes

  return (
    <div className="space-y-6">
      {/* Banner del club si el jugador está asociado */}
      {club && (
        <div
          className="rounded-2xl p-4 border flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${safeAccent}12 0%, white 100%)`,
            borderColor: safeAccent + "35",
          }}
        >
          {club.logo ? (
            <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-depro-border flex-shrink-0 shadow-sm" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ backgroundColor: safeAccent + "15", color: safeAccent }}
            >
              {club.abbreviation || club.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: safeAccent }}>Tu club</div>
            <div className="font-bold text-depro-dark truncate">{club.name}</div>
            {club.slogan && <div className="text-xs italic text-depro-gray mt-0.5">"{club.slogan}"</div>}
          </div>
          <Shield size={18} style={{ color: safeAccent }} className="flex-shrink-0" />
        </div>
      )}

      {/* Welcome */}
      <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, ${safeAccent}08 0%, white 100%)`, borderColor: safeAccent + "25" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 shadow-sm" style={{ backgroundColor: safeAccent + "15", color: safeAccent }}>
            {user?.avatar || user?.name?.[0]?.toUpperCase() || "👤"}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: safeAccent }}>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="text-2xl font-black text-depro-dark">Hola, {user?.name?.split(" ")[0]}.</h2>
            <p className="text-depro-gray text-sm mt-0.5">
              {user?.frecuencia || user?.training_days || "—"} · {user?.objetivo || user?.level || "—"}
            </p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-depro-yellow text-depro-dark text-xs font-black">
              <Trophy size={13} /> Plan Premium
            </div>
          )}
          {todaySession && (
            <Link to="/dashboard/plan" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90" style={{ backgroundColor: safeAccent, color: contrastText(safeAccent) }}>
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

      {/* CTA si lleva días sin entrenar */}
      {completedDays === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-5 flex items-center gap-4" style={{ borderColor: safeAccent + "40", backgroundColor: safeAccent + "04" }}>
          <div className="text-3xl">💪</div>
          <div className="flex-1">
            <div className="font-bold text-depro-dark text-sm">¡Empieza la semana con fuerza!</div>
            <div className="text-xs text-depro-gray mt-0.5">Aún no has completado ninguna sesión esta semana. Tu plan te está esperando.</div>
          </div>
          <Link to="/dashboard/plan" className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: safeAccent, color: contrastText(safeAccent) }}>
            Ir al plan
          </Link>
        </div>
      )}
      {completedDays > 0 && completedDays < freqNum && (
        <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: "#3BC21D30", backgroundColor: "#3BC21D06" }}>
          <div className="text-2xl">🔥</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-depro-dark text-sm">{completedDays} de {freqNum} sesiones completadas esta semana</div>
            <div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <span className="text-lg font-black text-green-500 flex-shrink-0">{progressPct}%</span>
        </div>
      )}
      {completedDays >= freqNum && (
        <div className="rounded-2xl border p-4 flex items-center gap-3 bg-green-50 border-green-200">
          <div className="text-2xl">🏆</div>
          <div className="flex-1">
            <div className="font-bold text-green-700 text-sm">¡Semana completada! {freqNum}/{freqNum} sesiones.</div>
            <div className="text-xs text-green-600 mt-0.5">Eres constante. Eso es lo que marca la diferencia.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sesiones esta semana" value={`${completedDays}/${freqNum}`} sub={`${progressPct}% completado`} icon={CheckCircle} accent="#3BC21D" />
        <StatCard label="Frecuencia semanal" value={freqNum} sub="días de entreno" icon={Calendar} accent={safeAccent} />
        <StatCard label="Valoración coach" value={`${lastFeedback.rating}/10`} sub="última revisión" icon={Trophy} accent="#F6CC12" />
        <StatCard label="Plan actual" value={user?.plan || "—"} sub="activo" icon={Zap} accent="#0A36F7" />
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
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: safeAccent + "15", color: safeAccent }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-depro-dark">{ex.name}</div>
                      <div className="text-xs text-depro-gray">{ex.duration} · {ex.sets} sets · {ex.reps}</div>
                    </div>
                  </div>
                ))}
                {todaySession.exercises.length > 3 && <p className="text-xs text-depro-gray text-center pt-1">+ {todaySession.exercises.length - 3} ejercicios más</p>}
              </div>
              <Link to="/dashboard/plan" className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm hover:opacity-90" style={{ backgroundColor: safeAccent, color: contrastText(safeAccent) }}>
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
                {days7.map((d, i) => {
                  const done    = completedIds.includes(d);
                  const isToday = i === todayIdx;
                  // Colores siempre visibles:
                  // Completado → verde; Hoy (sin completar) → azul DEPRO con borde; Resto → gris
                  const bg    = done ? "#3BC21D" : isToday ? "#0A36F7" : "#F3F4F6";
                  const fg    = done ? "#fff"    : isToday ? "#fff"    : "#9CA3AF";
                  const label = done ? "✓"       : isToday ? "●"      : d;
                  return (
                    <button
                      key={d}
                      onClick={() => markDayDone(d)}
                      title={done ? "Completado" : isToday ? "Hoy" : "Marcar como hecho"}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`text-xs font-bold ${isToday ? "text-depro-dark" : "text-depro-gray"}`}>{d}</div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110 ${isToday && !done ? "ring-2 ring-offset-1 ring-depro-blue" : ""}`}
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: "#3BC21D" }} />
                </div>
                <span className="text-xs text-depro-gray font-medium">{completedDays}/{freqNum}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-depro-gray"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" /> Completado</span>
                <span className="flex items-center gap-1 text-[10px] text-depro-gray"><span className="w-2.5 h-2.5 rounded-sm bg-depro-blue inline-block" /> Hoy</span>
                <span className="flex items-center gap-1 text-[10px] text-depro-gray"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" /> Pendiente</span>
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
  const { t } = useTranslation();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const club = user?.club;
  const team = user?.team;
  const teamRole = user?.team_role;
  const accent = club?.primaryColor || "#0A36F7";
  const secondColor = club?.secondaryColor || "#FFFFFF";

  if (user?.role === "club") {
    // Cuando el coordinador hace click en un equipo, muestra la vista del entrenador
    const viewTeam = selectedTeam || team;
    const viewRole = selectedTeam ? "entrenador" : teamRole;

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <ClubBanner
          club={club}
          team={selectedTeam || team}
          teamRole={viewRole}
          accent={accent}
          secondColor={secondColor}
        />
        {(teamRole === "coordinador" && !selectedTeam)
          ? <CoordinadorDashboard
              club={club}
              accent={accent}
              secondColor={secondColor}
              onViewTeam={(t) => setSelectedTeam(t)}
            />
          : <EntrenadorDashboard
              club={club}
              team={viewTeam}
              teamRole={viewRole}
              accent={accent}
              secondColor={secondColor}
              onBack={selectedTeam ? () => setSelectedTeam(null) : null}
            />
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
