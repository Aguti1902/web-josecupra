import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Library, Zap, Activity,
  MessageSquare, LogOut, Menu, X, ChevronRight, Trophy,
  ClipboardList, Users as UsersIcon, BookOpen, User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../shared/LanguageSwitcher";

// Luminancia 0-1 de un color hex
function luminance(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}

// Contraste de texto para poner SOBRE un color de fondo
function contrastText(hex) {
  return luminance(hex) > 0.55 ? "#111827" : "#ffffff";
}

// Elige el color más visible para usar como color de acento visible sobre FONDO BLANCO.
// Si el color es demasiado claro (blanco, crema…) devuelve el fallback.
function visibleOnWhite(color, fallback = "#0A36F7") {
  return luminance(color) > 0.75 ? fallback : color;
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Nav items built with translations
  const playerNav = [
    { to: "/dashboard",           icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/plan",      icon: Calendar,        label: t("nav.weekly_plan") },
    { to: "/dashboard/library",   icon: Library,         label: t("nav.library") },
    { to: "/dashboard/technique", icon: Zap,             label: t("nav.technique") },
    { to: "/dashboard/physical",  icon: Activity,        label: t("nav.physical") },
    { to: "/dashboard/feedback",  icon: MessageSquare,   label: t("nav.feedback") },
    { to: "/dashboard/ranking",   icon: Trophy,          label: t("nav.ranking") },
    { to: "/dashboard/profile",   icon: User,            label: t("nav.my_profile") },
  ];

  const coordinadorNav = [
    { to: "/dashboard",              icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/squad",        icon: UsersIcon,       label: t("nav.squad") },
    { to: "/dashboard/club-profile", icon: User,            label: t("nav.my_profile") },
  ];

  const entrenadorNav = [
    { to: "/dashboard",              icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/plan",         icon: Calendar,        label: t("nav.weekly_plan") },
    { to: "/dashboard/squad",        icon: UsersIcon,       label: t("nav.squad") },
    { to: "/dashboard/tactics",      icon: BookOpen,        label: t("nav.tactics") },
    { to: "/dashboard/mesocycle",    icon: ClipboardList,   label: t("nav.mesocycle") },
    { to: "/dashboard/library",      icon: Library,         label: t("nav.library") },
    { to: "/dashboard/club-profile", icon: User,            label: t("nav.my_profile") },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  const club = user?.club;
  // Colores del club
  const rawAccent    = club?.primaryColor   || "#0A36F7";
  const rawSecondary = club?.secondaryColor || "#ffffff";
  // Para elementos sobre fondo BLANCO del sidebar usamos el color que sea visible
  const sidebarAccent = visibleOnWhite(rawAccent, visibleOnWhite(rawSecondary, "#0A36F7"));
  // Para elementos sobre fondo de color (banner, cards rellenas) usamos el raw
  const accent        = rawAccent;
  const secondary     = rawSecondary;
  const activeTextColor = contrastText(sidebarAccent);
  const navItems = user?.role === "club"
    ? (user?.team_role === "coordinador" ? coordinadorNav : entrenadorNav)
    : playerNav;

  // Cargar foto de perfil desde localStorage
  useEffect(() => {
    const load = () => {
      if (!user?.id) return;
      const key = user.role === "admin"
        ? `depro_admin_photo`
        : user.role === "club"
        ? `depro_club_profile_${user.id}`
        : `depro_player_photo_${user.id}`;
      const p = localStorage.getItem(key);
      setProfilePhoto(p || null);
    };
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [user?.id, user?.role]);

  // Club suspendido: mostrar pantalla de acceso bloqueado
  if (user?.role === "club" && club?.status === "inactivo") {
    return (
      <div className="min-h-screen bg-depro-gray-light flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-depro max-w-md w-full p-8 text-center">
          {club?.logo ? (
            <img src={club.logo} alt={club.name} className="w-16 h-16 object-contain mx-auto mb-4 rounded-xl border border-depro-border p-1" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-6V5m-4 7a4 4 0 108 0 4 4 0 00-8 0z" /></svg>
            </div>
          )}
          <h1 className="text-xl font-bold text-depro-dark mb-2">{t("dashboard.suspended_title")}</h1>
          <p className="text-sm text-depro-gray mb-1">
            {t("dashboard.suspended_desc", { club: club?.name || "tu club" })}
          </p>
          <p className="text-xs text-depro-gray mb-6">
            {t("dashboard.suspended_hint")}
          </p>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors"
          >
            {t("nav.logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-depro-gray-light overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-depro-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        {/* Club branding */}
        <div className="p-4 border-b border-depro-border">
          <div className="flex items-center gap-3">
            {club?.logo ? (
              <img
                src={club.logo}
                alt={club.name}
                className="w-10 h-10 rounded-xl object-contain flex-shrink-0 shadow-sm border border-depro-border bg-white p-0.5"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm border border-depro-border"
                style={{ backgroundColor: sidebarAccent + "15", color: sidebarAccent }}
              >
                {club?.abbreviation || club?.name?.[0] || "D"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-depro-dark font-bold text-sm truncate">{club?.name || "DEPRO"}</div>
              {user?.role === "club" ? (
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: sidebarAccent, color: contrastText(sidebarAccent) }}
                >
                  {user?.team_role === "coordinador" ? "Coordinador"
                    : user?.team_role === "entrenador" ? `${user.team?.name || "Entrenador"}`
                    : user?.team_role || "Club"}
                </span>
              ) : (
                <div className="text-xs font-semibold mt-0.5" style={{ color: sidebarAccent }}>{user?.plan || "Jugador"}</div>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">{t("nav.dashboard")}</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? "shadow-sm"
                      : "text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light"
                  }`}
                  style={active ? { backgroundColor: sidebarAccent, color: contrastText(sidebarAccent) } : {}}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-depro-border">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden border border-depro-border"
              style={{ backgroundColor: sidebarAccent + "15" }}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="perfil" className="w-full h-full object-cover" />
                :               <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: sidebarAccent }}>
                    {user?.avatar || "?"}
                  </div>
              }
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-depro-dark text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-depro-gray text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <LanguageSwitcher compact />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-depro-gray hover:text-depro-red text-sm transition-colors py-2 px-3 rounded-xl hover:bg-red-50"
            >
              <LogOut size={16} /> {t("nav.logout")}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-depro-border flex items-center px-4 md:px-6 gap-4 flex-shrink-0 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-depro-gray hover:text-depro-dark rounded-lg hover:bg-depro-gray-light"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-depro-dark">
              {navItems.find((n) => n.to === pathname)?.label ||
               navItems.find((n) => pathname.startsWith(n.to) && n.to !== "/dashboard")?.label ||
               "Dashboard"}
            </h1>
          </div>
          {/* DEPRO logo small */}
          <img src="/logo.png" alt="DEPRO" className="h-5 w-auto" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
