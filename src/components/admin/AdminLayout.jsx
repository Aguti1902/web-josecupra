import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, LogOut, Menu, X, ChevronRight,
  Settings, Brain, Building2, Globe, Shield, CalendarDays, ClipboardList, BookOpen,
  Dumbbell, HelpCircle, Bell, Search, Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TutorialProvider, useTutorial } from "../private/DashboardTutorial";
import AiAssistantWidget from "../private/AiAssistantWidget";

const navGroups = [
  {
    label: "General",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Resumen", tour: "nav-dashboard" },
      { to: "/admin/users", icon: Users, label: "Usuarios", tour: "nav-users" },
    ],
  },
  {
    label: "Clubs",
    groupIcon: Building2,
    accent: "#60A5FA",
    items: [
      { to: "/admin/clubs", icon: Building2, label: "Clubs (supervisión)", tour: "nav-clubs" },
      { to: "/admin/planificacion", icon: CalendarDays, label: "Planificación" },
      { to: "/admin/tests", icon: ClipboardList, label: "Tests físicos" },
    ],
  },
  {
    label: "Individuales",
    groupIcon: Users,
    accent: "#A78BFA",
    items: [
      { to: "/admin/clients", icon: Users, label: "Clientes jugadores" },
      { to: "/admin/plan-builder", icon: Brain, label: "Motor de planes" },
      { to: "/admin/catalog", icon: BookOpen, label: "Catálogo ejercicios" },
    ],
  },
  {
    label: "DEPRO Coach",
    groupIcon: Dumbbell,
    accent: "#34D399",
    items: [
      { to: "/admin/coach-library", icon: Dumbbell, label: "Biblioteca de ejercicios" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/admin/settings", icon: Settings, label: "Ajustes" },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

function AdminHeader({ currentNav, onMenuToggle, sidebarOpen }) {
  const { start } = useTutorial();
  return (
    <header className="h-[4.25rem] border-b border-depro-border/60 flex items-center px-4 md:px-6 gap-3 flex-shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2.5 text-depro-gray hover:text-depro-dark rounded-xl hover:bg-slate-100"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-depro-gray hidden sm:block">Administración</p>
        <h1 className="text-base md:text-lg font-black text-depro-dark truncate">{currentNav.label}</h1>
      </div>
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 border border-depro-border/50 w-48">
        <Search size={15} className="text-depro-gray" />
        <span className="text-xs text-depro-gray">Buscar…</span>
      </div>
      <div data-tour="header-actions" className="flex items-center gap-2">
        <button
          onClick={start}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-depro-blue bg-blue-50 hover:bg-blue-100 border border-blue-100"
        >
          <HelpCircle size={15} /> Guía
        </button>
        <button className="p-2.5 rounded-xl text-depro-gray hover:bg-slate-100 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-depro-red ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-depro-dark text-white text-xs font-bold">
          <Shield size={12} /> Admin
        </div>
      </div>
    </header>
  );
}

function AdminLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("depro_admin_photo"));

  useEffect(() => {
    const sync = () => setProfilePhoto(localStorage.getItem("depro_admin_photo"));
    window.addEventListener("storage", sync);
    window.addEventListener("depro_photo_updated", sync);
    const interval = setInterval(sync, 3000);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("depro_photo_updated", sync);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const currentNav = allNavItems.slice().reverse().find(
    (n) => pathname === n.to || pathname.startsWith(n.to + "/")
  ) || allNavItems[0];

  return (
    <div className="flex h-screen dashboard-bg overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[17.5rem] flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 dash-sidebar-admin ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-depro-blue via-cyan-400 to-emerald-400" />

        <div className="p-5 pl-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo blanco.png" alt="DEPRO" className="h-6 w-auto" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Admin</span>
          </div>
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <Sparkles size={14} className="text-indigo-300" />
            <span className="text-xs text-white/60 font-medium">Panel de supervisión</span>
          </div>
        </div>

        <nav data-tour="sidebar-nav" className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 px-3 mb-2">
                {group.groupIcon && (
                  <group.groupIcon size={12} style={{ color: group.accent || "rgba(255,255,255,0.35)" }} />
                )}
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: group.accent ? group.accent + "CC" : "rgba(255,255,255,0.35)" }}
                >
                  {group.label}
                </p>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to + "/"));
                  return (
                    <Link
                      key={item.to}
                      {...(item.tour ? { "data-tour": item.tour } : {})}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-depro-blue text-white shadow-lg shadow-blue-500/25"
                          : "text-white/55 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      <item.icon size={17} />
                      {item.label}
                      {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/10">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/45 hover:text-white hover:bg-white/8"
            >
              <Globe size={16} /> Web pública
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-depro-blue flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (user?.avatar || "J")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Shield size={11} /> Administrador
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm w-full py-2 px-3 rounded-xl hover:bg-red-500/10"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AdminHeader currentNav={currentNav} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto dashboard-main-scroll p-4 md:p-6 lg:p-8">{children}</main>
        <AiAssistantWidget />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  return (
    <TutorialProvider user={user}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </TutorialProvider>
  );
}
