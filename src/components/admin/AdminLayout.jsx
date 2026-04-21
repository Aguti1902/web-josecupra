import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/clients", icon: Users, label: "Clients" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const currentNav =
    navItems
      .slice()
      .reverse()
      .find((n) => pathname === n.to || pathname.startsWith(n.to + "/")) ||
    navItems[0];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
        style={{
          background: "linear-gradient(180deg, #0a0a14 0%, #0d0d1a 100%)",
          borderRight: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        {/* Admin brand */}
        <div className="p-5 border-b border-purple-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Admin Panel</div>
              <div className="text-purple-400 text-xs font-semibold">Jose Football</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-3">
            Management
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.to ||
                (item.to !== "/admin" && pathname.startsWith(item.to + "/"));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && (
                    <ChevronRight size={14} className="ml-auto text-purple-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick link to public site */}
          <div className="mt-6">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-3">
              Links
            </p>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="text-base">🌐</span>
              Public Site
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-purple-500/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300">
              {user?.avatar || "J"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-purple-400 text-xs">Administrator</div>
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

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 flex items-center px-4 md:px-6 gap-4 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(139,92,246,0.1)",
            background: "rgba(10,10,20,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white">{currentNav.label}</h1>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <Shield size={13} />
            Admin Mode
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-gray-950">{children}</main>
      </div>
    </div>
  );
}
