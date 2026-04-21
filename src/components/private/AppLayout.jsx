import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Library,
  Zap,
  Activity,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/plan", icon: Calendar, label: "Weekly Plan" },
  { to: "/dashboard/library", icon: Library, label: "Session Library" },
  { to: "/dashboard/technique", icon: Zap, label: "Technique" },
  { to: "/dashboard/physical", icon: Activity, label: "Physical" },
  { to: "/dashboard/feedback", icon: MessageSquare, label: "Feedback" },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const club = user?.club;
  const accentColor = club?.primaryColor || "#0ea5e9";

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Club branding header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-lg"
              style={{ backgroundColor: accentColor + "20", color: accentColor }}
            >
              {club?.logo || "⚽"}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-sm truncate">{club?.name || "My Club"}</div>
              <div className="text-xs font-semibold" style={{ color: accentColor }}>
                {user?.plan} Plan
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={active ? { backgroundColor: accentColor + "20", color: accentColor } : {}}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto" style={{ color: accentColor }} />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: accentColor + "20", color: accentColor }}
            >
              {user?.avatar || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-gray-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors w-full py-2 px-3 rounded-xl hover:bg-red-400/5"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 bg-gray-950/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white capitalize">
              {navItems.find((n) => n.to === pathname)?.label ||
                navItems.find((n) => pathname.startsWith(n.to) && n.to !== "/dashboard")?.label ||
                "Dashboard"}
            </h1>
          </div>

          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={18} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </button>

          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: accentColor + "15", color: accentColor }}
          >
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center text-xs"
              style={{ backgroundColor: accentColor + "30" }}
            >
              {club?.logo || "⚽"}
            </div>
            {club?.name}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
