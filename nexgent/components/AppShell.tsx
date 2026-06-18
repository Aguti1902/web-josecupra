/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: layout compartido con sidebar + header + selector de rol.
 * PRODUCCIÓN: permisos por rol, club switcher, notificaciones.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, MessageSquare, Calendar, ClipboardList, Activity,
  Video, Search, HeartPulse, Users, BarChart3, Sparkles,
} from "lucide-react";
import { DEMO_CLUB } from "@/lib/seed-data";

const NAV = [
  { href: "/app/inicio", label: "Inicio", icon: Home, mock: true },
  { href: "/app/chat", label: "Chat del staff", icon: MessageSquare, mock: false },
  { href: "/app/planificacion", label: "Planificación", icon: Calendar, mock: true },
  { href: "/app/sesiones", label: "Sesiones y tareas", icon: ClipboardList, mock: false },
  { href: "/app/carga", label: "Control de carga", icon: Activity, mock: false },
  { href: "/app/video", label: "Rendimiento y vídeo", icon: Video, mock: true },
  { href: "/app/scouting", label: "Scouting", icon: Search, mock: false },
  { href: "/app/medico", label: "Médico", icon: HeartPulse, mock: true },
  { href: "/app/cantera", label: "Cantera", icon: Users, mock: true },
  { href: "/app/direccion", label: "Dirección deportiva", icon: BarChart3, mock: true },
];

const ROLES = ["Entrenador", "Médico", "Scouting", "Dirección", "Cantera"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState("Entrenador");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-60 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-blue-700 flex items-center justify-center text-xs font-black">NG</div>
            <div>
              <p className="font-bold text-sm">NexGent</p>
              <p className="text-[10px] text-slate-400 truncate">{DEMO_CLUB.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, mock }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {mock && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">demo</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500">
          Demo comercial · NexGent
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center gap-4 px-5 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 max-w-xl">
            <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Pregunta lo que quieras sobre el equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none placeholder:text-slate-500"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
