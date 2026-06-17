import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, LogOut, Menu, X, ChevronRight,
  Settings, Brain, Building2, Globe, Shield, CalendarDays, ClipboardList, BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navGroups = [
  {
    label: "General",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Resumen" },
    ],
  },
  {
    label: "Clubs",
    groupIcon: Building2,
    accent: "#60A5FA",
    items: [
      { to: "/admin/clubs",         icon: Building2,   label: "Clubs y equipos" },
      { to: "/admin/planificacion", icon: CalendarDays, label: "Planificación" },
      { to: "/admin/tests",         icon: ClipboardList, label: "Tests físicos" },
    ],
  },
  {
    label: "Individuales",
    groupIcon: Users,
    accent: "#A78BFA",
    items: [
      { to: "/admin/clients",      icon: Users,  label: "Clientes jugadores" },
      { to: "/admin/plan-builder", icon: Brain,  label: "Motor de planes" },
      { to: "/admin/catalog",      icon: BookOpen, label: "Catálogo ejercicios" },
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

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("depro_admin_photo"));

  // Actualizar foto si cambia en otra pestaña o después de guardar ajustes
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
    <div className="flex h-screen bg-depro-gray-light overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-depro-dark flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo blanco.png" alt="DEPRO" className="h-6 w-auto" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div
              key={group.label}
              className={group.label === "Individuales" ? "pt-1 border-t border-white/10" : ""}
            >
              <div className="flex items-center gap-2 px-3 mb-2">
                {group.groupIcon && (
                  <group.groupIcon size={13} style={{ color: group.accent || "rgba(255,255,255,0.35)" }} />
                )}
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: group.accent ? group.accent + "CC" : "rgba(255,255,255,0.35)" }}
                >
                  {group.label}
                </p>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.to ||
                    (item.to !== "/admin" && pathname.startsWith(item.to + "/"));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-depro-blue text-white shadow-depro"
                          : "text-white/60 hover:text-white hover:bg-white/8"
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
          <div className="pt-4 border-t border-white/10">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
            >
              <Globe size={16} /> Web pública
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-depro-blue flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
              {profilePhoto
                ? <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                : (user?.avatar || "J")
              }
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
            className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm transition-colors w-full py-2 px-3 rounded-xl hover:bg-red-500/10"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="h-16 border-b border-depro-border flex items-center px-4 md:px-6 gap-4 flex-shrink-0 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-depro-gray hover:text-depro-dark rounded-lg hover:bg-depro-gray-light"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-depro-dark">{currentNav.label}</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-depro-dark text-white text-xs font-semibold">
            <Shield size={12} /> Admin
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
