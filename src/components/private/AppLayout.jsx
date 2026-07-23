import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Activity, MessageSquare, LogOut, Menu, X,
  ChevronRight, Trophy, ClipboardList, Users as UsersIcon, User, TrendingUp,
  Building2, HelpCircle, Bell, CreditCard,
} from "lucide-react";
import TrialBanner from "./TrialBanner";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../context/ViewContext";
import LanguageSwitcher from "../shared/LanguageSwitcher";
import { TutorialProvider, useTutorial } from "./DashboardTutorial";
import AiAssistantWidget from "./AiAssistantWidget";
import PanelSearch from "../shared/PanelSearch";

function luminance(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}

function contrastText(hex) {
  return luminance(hex) > 0.55 ? "#111827" : "#ffffff";
}

function visibleOnWhite(color, fallback = "#0A36F7") {
  return luminance(color) > 0.75 ? fallback : color;
}

function tourIdForRoute(to) {
  const map = {
    "/dashboard": "nav-dashboard",
    "/dashboard/plan": "nav-plan",
    "/dashboard/mesocycle": "nav-mesocycle",
    "/dashboard/squad": "nav-squad",
    "/dashboard/team-tests": "nav-tests",
    "/dashboard/cargas": "nav-cargas",
    "/dashboard/physical": "nav-physical",
    "/dashboard/feedback": "nav-feedback",
    "/dashboard/club-settings": "nav-club-settings",
    "/dashboard/profile": "nav-profile",
    "/dashboard/club-profile": "nav-profile",
    "/dashboard/subscription": "nav-subscription",
  };
  return map[to] || null;
}

function TutorialButtonMobile() {
  const { start } = useTutorial();
  return (
    <button
      onClick={start}
      className="sm:hidden p-1.5 text-white/45 hover:text-white rounded-lg hover:bg-white/10"
      title="Guía"
    >
      <HelpCircle size={16} />
    </button>
  );
}

function HeaderBar({ navItems, pathname, sidebarAccent, onMenuToggle, sidebarOpen, user }) {
  const { start } = useTutorial();
  const current =
    navItems.find((n) => n.to === pathname) ||
    navItems.find((n) => pathname.startsWith(n.to) && n.to !== "/dashboard");

  return (
    <header className="h-[4.25rem] border-b border-depro-border/60 flex items-center px-4 md:px-6 gap-3 flex-shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2.5 text-depro-gray hover:text-depro-dark rounded-xl hover:bg-slate-100 transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-depro-gray hidden sm:block">
          DEPRO Panel
        </p>
        <h1 className="text-base md:text-lg font-black text-depro-dark truncate">
          {current?.label || "Dashboard"}
        </h1>
      </div>

      {/* Search */}
      <PanelSearch mode="client" navItems={navItems} user={user} className="hidden md:block w-full max-w-sm lg:max-w-md" />

      <div data-tour="header-actions" className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={start}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-depro-blue bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
        >
          <HelpCircle size={15} /> Guía
        </button>
        <button className="p-2.5 rounded-xl text-depro-gray hover:text-depro-dark hover:bg-slate-100 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-depro-red ring-2 ring-white" />
        </button>
        <div
          className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-depro-border/60 bg-white"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ backgroundColor: sidebarAccent + "18", color: sidebarAccent }}
          >
            {user?.avatar || "?"}
          </div>
          <span className="text-xs font-semibold text-depro-dark max-w-[100px] truncate hidden lg:block">
            {user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}

function AppLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { user, logout } = useAuth();
  const { viewingTeam, setViewingTeam } = useView();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.toggle("sidebar-open-mobile", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open-mobile");
  }, [sidebarOpen]);

  const activeTeamForNav = viewingTeam || user?.team;
  const activeCategory = activeTeamForNav?.category;
  const isBlock2or3 = ["Sub-13", "Sub-14", "Sub-15", "Sub-16", "Juvenil"].includes(activeCategory);

  const subscriptionNav = { to: "/dashboard/subscription", icon: CreditCard, label: t("nav.subscription") };

  const playerNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/plan", icon: Calendar, label: t("nav.weekly_plan") },
    { to: "/dashboard/physical", icon: Activity, label: t("nav.tests") },
    { to: "/dashboard/feedback", icon: MessageSquare, label: t("nav.feedback") },
    { to: "/dashboard/ranking", icon: Trophy, label: t("nav.ranking") },
    subscriptionNav,
    { to: "/dashboard/profile", icon: User, label: t("nav.my_profile") },
  ];

  const coordinadorNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/squad", icon: UsersIcon, label: t("nav.squad") },
    { to: "/dashboard/club-settings", icon: Building2, label: "Mi Club" },
    subscriptionNav,
    { to: "/dashboard/club-profile", icon: User, label: t("nav.my_profile") },
  ];

  const entrenadorNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/dashboard/plan", icon: Calendar, label: t("nav.microcycle") },
    { to: "/dashboard/mesocycle", icon: ClipboardList, label: t("nav.mesocycle") },
    { to: "/dashboard/squad", icon: UsersIcon, label: t("nav.squad") },
    { to: "/dashboard/team-tests", icon: Activity, label: t("nav.tests") },
    ...(isBlock2or3 ? [{ to: "/dashboard/cargas", icon: TrendingUp, label: "Cargas" }] : []),
    subscriptionNav,
    { to: "/dashboard/club-profile", icon: User, label: t("nav.my_profile") },
  ];

  const club = user?.club;
  const isSoloCoach = !!club?.isSoloCoach;

  const coachNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/mesocycle", icon: ClipboardList, label: "Planificación" },
    { to: "/dashboard/plan", icon: Calendar, label: "Sesiones" },
    { to: "/dashboard/squad", icon: UsersIcon, label: "Plantilla" },
    { to: "/dashboard/team-tests", icon: Activity, label: "Tests" },
    ...(isBlock2or3 ? [{ to: "/dashboard/cargas", icon: TrendingUp, label: "Carga" }] : []),
    subscriptionNav,
    { to: "/dashboard/club-profile", icon: User, label: "Mi perfil" },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  const rawAccent = club?.primaryColor || "#0A36F7";
  const rawSecondary = club?.secondaryColor || "#ffffff";
  const sidebarAccent = visibleOnWhite(rawAccent, visibleOnWhite(rawSecondary, "#0A36F7"));
  const isCoordViewingTeam = user?.team_role === "coordinador" && viewingTeam;
  const navItems = user?.role === "club"
    ? (isSoloCoach ? coachNav : (user?.team_role === "coordinador" && !isCoordViewingTeam ? coordinadorNav : entrenadorNav))
    : playerNav;

  useEffect(() => {
    const load = () => {
      if (!user?.id) return;
      const key = user.role === "club"
        ? `depro_club_profile_${user.id}`
        : `depro_player_photo_${user.id}`;
      setProfilePhoto(localStorage.getItem(key) || null);
    };
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [user?.id, user?.role]);

  if (user?.role === "club" && club?.status === "inactivo") {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-6">
        <div className="dash-card-premium max-w-md w-full p-8 text-center">
          {club?.logo ? (
            <img src={club.logo} alt={club.name} className="w-16 h-16 object-contain mx-auto mb-4 rounded-xl border border-depro-border p-1" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
          )}
          <h1 className="text-xl font-bold text-depro-dark mb-2">{t("dashboard.suspended_title")}</h1>
          <p className="text-sm text-depro-gray mb-6">{t("dashboard.suspended_desc", { club: club?.name || "tu club" })}</p>
          <button onClick={() => { logout(); navigate("/"); }} className="btn-primary w-full py-2.5 rounded-xl">
            {t("nav.logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen dashboard-bg overflow-hidden">
      {/* Sidebar premium */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[17.5rem] flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 dash-sidebar ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ "--dash-accent": sidebarAccent }}
      >
        {/* Accent strip */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-depro-blue via-indigo-500 to-violet-500" />

        {/* Brand */}
        <div className="p-5 pl-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {isSoloCoach ? (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black dash-sidebar-icon">
                DC
              </div>
            ) : club?.logo ? (
              <img src={club.logo} alt={club.name} className="w-11 h-11 rounded-xl object-contain dash-sidebar-icon p-0.5" />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black dash-sidebar-icon">
                {club?.abbreviation || club?.name?.[0] || "D"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-white font-bold text-sm truncate">
                {isSoloCoach ? "DEPRO Coach" : (club?.name || "DEPRO")}
              </div>
              <span
                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 dash-role-badge"
                style={{ backgroundColor: sidebarAccent, color: contrastText(sidebarAccent) }}
              >
                {isSoloCoach ? (user?.team?.name || "Mi equipo")
                  : user?.role === "club"
                  ? (user?.team_role === "coordinador" && viewingTeam ? viewingTeam.name
                    : user?.team_role === "coordinador" ? "Coordinador"
                    : user?.team?.name || "Entrenador")
                  : (user?.plan || "Jugador")}
              </span>
            </div>
          </div>
        </div>

        {isCoordViewingTeam && (
          <div className="px-4 pt-3">
            <button
              onClick={() => { setViewingTeam(null); navigate("/dashboard"); setSidebarOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/8 transition-colors border border-white/10"
            >
              <ChevronRight size={13} className="rotate-180" /> Todos los equipos
            </button>
          </div>
        )}

        {/* Nav */}
        <nav data-tour="sidebar-nav" className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3 mb-3">Menú</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              const tourId = tourIdForRoute(item.to);
              return (
                <Link
                  key={item.to}
                  {...(tourId ? { "data-tour": tourId } : {})}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`dash-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? "dash-nav-active" : "text-white/55 hover:text-white hover:bg-white/8"
                  }`}
                  style={active ? { backgroundColor: sidebarAccent, color: contrastText(sidebarAccent) } : {}}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} className="opacity-60" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/15 shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/80 bg-white/10">
                  {user?.avatar || "?"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-white/40 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <LanguageSwitcher compact light />
            <div className="flex items-center gap-1">
              <TutorialButtonMobile />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-white/45 hover:text-red-400 text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <HeaderBar
          navItems={navItems}
          pathname={pathname}
          sidebarAccent={sidebarAccent}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          user={user}
        />
        <div className="md:hidden px-4 py-2 border-b border-depro-border/60 bg-white/90">
          <PanelSearch mode="client" navItems={navItems} user={user} />
        </div>
        <main className="flex-1 overflow-y-auto dashboard-main-scroll">
          {pathname !== "/dashboard" && <TrialBanner user={user} />}
          {children}
        </main>
        <AiAssistantWidget />
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <TutorialProvider user={user}>
      <AppLayoutInner>{children}</AppLayoutInner>
    </TutorialProvider>
  );
}
