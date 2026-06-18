/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: layout compartido estilo DEPRO — sidebar blanco, fondo gris claro.
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
import { PALMEIRAS } from "@/lib/club-config";

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
const CLUB_GREEN = PALMEIRAS.accent;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState("Entrenador");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex bg-depro-gray-light text-depro-dark">
      <aside className="w-60 flex-shrink-0 border-r border-depro-border bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b border-depro-border">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="DEPRO" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="w-9 h-9 object-contain rounded-lg border border-depro-border p-0.5 bg-white" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{PALMEIRAS.shortName}</p>
              <p className="text-[10px] text-depro-gray truncate">{PALMEIRAS.team}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-depro-border">
            <span className="text-[9px] text-depro-gray uppercase tracking-wide">Con</span>
            <img src="/logo-nexgent.png" alt="NexGent" className="h-3.5 object-contain" />
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
                  active ? "text-white shadow-sm" : "text-depro-gray hover:bg-depro-gray-light hover:text-depro-dark"
                }`}
                style={active ? { backgroundColor: CLUB_GREEN } : undefined}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {mock && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${active ? "bg-white/20 text-white" : "bg-depro-gray-light text-depro-gray"}`}>
                    demo
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-depro-border">
          <Link href="/" className="text-[10px] text-depro-gray hover:text-depro-blue font-semibold">
            ← Volver al pitch
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-depro-border bg-white flex items-center gap-4 px-5 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-depro-gray-light border border-depro-border rounded-lg px-3 py-2 max-w-xl">
            <Sparkles size={16} className="text-depro-blue flex-shrink-0" />
            <input
              type="text"
              placeholder="Pregunta lo que quieras sobre el equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none placeholder:text-depro-gray text-depro-dark"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-white border border-depro-border rounded-lg px-3 py-2 text-sm font-medium text-depro-dark"
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
