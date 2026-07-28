import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home, MessageSquare, Calendar, ClipboardList, Activity,
  Video, Search, HeartPulse, Users, Sparkles, Shirt,
} from "lucide-react";
import { PALMEIRAS } from "../../../lib/nexgentConfig";
import { DEMO_PANELS } from "./demo/NexGentDemoPanels";

const NAV = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "plantilla", label: "Plantilla", icon: Shirt },
  { id: "chat", label: "Chat del staff", icon: MessageSquare },
  { id: "planificacion", label: "Planificación", icon: Calendar },
  { id: "sesiones", label: "Sesiones y tareas", icon: ClipboardList },
  { id: "carga", label: "Control de carga", icon: Activity },
  { id: "video", label: "Rendimiento y vídeo", icon: Video },
  { id: "scouting", label: "Scouting", icon: Search },
  { id: "medico", label: "Médico", icon: HeartPulse },
  { id: "cantera", label: "Cantera", icon: Users },
];

const ROLES = ["Entrenador", "Médico", "Scouting", "Dirección", "Cantera"];

export default function NexGentDemoApp() {
  const [role, setRole] = useState("Entrenador");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("inicio");

  const Panel = DEMO_PANELS[activeNav] ?? DEMO_PANELS.inicio;

  return (
    <div className="min-h-screen flex bg-depro-gray-light text-depro-dark">
      <aside className="w-60 flex-shrink-0 border-r border-depro-border bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b border-depro-border">
          <Link to="/nexgent/pitch" className="flex items-center gap-2.5 mb-1 group">
            <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="w-10 h-10 object-contain rounded-lg border border-depro-border p-0.5 bg-white" />
            <div className="min-w-0">
              <p className="font-black text-sm truncate transition-colors group-hover:opacity-80" style={{ color: PALMEIRAS.accent }}>{PALMEIRAS.shortName}</p>
              <p className="text-[10px] text-depro-gray truncate">{PALMEIRAS.team}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = id === activeNav;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveNav(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "text-white shadow-sm" : "text-depro-gray hover:bg-depro-gray-light hover:text-depro-dark"
                }`}
                style={active ? { backgroundColor: PALMEIRAS.accent } : undefined}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-depro-border">
          <Link to="/nexgent/pitch" className="text-[10px] text-depro-gray font-semibold transition-colors hover:opacity-80" style={{ color: PALMEIRAS.accent }}>
            ← Volver al pitch
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-depro-border bg-white flex items-center gap-4 px-5 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-depro-gray-light border border-depro-border rounded-lg px-3 py-2">
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
        <main className="flex-1 overflow-y-auto p-6">
          <Panel onNavigate={setActiveNav} />
        </main>
      </div>
    </div>
  );
}
