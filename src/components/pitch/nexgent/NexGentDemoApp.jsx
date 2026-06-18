import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home, MessageSquare, Calendar, ClipboardList, Activity,
  Video, Search, HeartPulse, Users, BarChart3, Sparkles,
  TrendingUp, CheckCircle,
} from "lucide-react";
import { PALMEIRAS, NEXGENT_LOGO, DEPRO_LOGO } from "../../../lib/nexgentConfig";
import { DEMO_PLAYERS, WEEKLY_LOAD, loadBandColor, riskColor } from "../../../lib/nexgentSeedData";
import NexGentClubBanner from "./NexGentClubBanner";

const NAV = [
  { id: "inicio", label: "Inicio", icon: Home, mock: true },
  { id: "chat", label: "Chat del staff", icon: MessageSquare, mock: false },
  { id: "planificacion", label: "Planificación", icon: Calendar, mock: true },
  { id: "sesiones", label: "Sesiones y tareas", icon: ClipboardList, mock: false },
  { id: "carga", label: "Control de carga", icon: Activity, mock: false },
  { id: "video", label: "Rendimiento y vídeo", icon: Video, mock: true },
  { id: "scouting", label: "Scouting", icon: Search, mock: false },
  { id: "medico", label: "Médico", icon: HeartPulse, mock: true },
  { id: "cantera", label: "Cantera", icon: Users, mock: true },
  { id: "direccion", label: "Dirección deportiva", icon: BarChart3, mock: true },
];

const ROLES = ["Entrenador", "Médico", "Scouting", "Dirección", "Cantera"];
const QUICK_LINKS = [
  { icon: Calendar, label: "Microciclo", sub: "Semana 24 · Mesociclo 3" },
  { icon: ClipboardList, label: "Sesiones", sub: "2 sesiones planificadas" },
  { icon: TrendingUp, label: "Cargas GPS", sub: "Import Catapult listo" },
  { icon: MessageSquare, label: "Chat staff", sub: "3 mensajes nuevos" },
];

function WeeklyLoadChart({ data, accent }) {
  const max = Math.max(...data.map((d) => d.load));
  return (
    <div className="flex items-end justify-between gap-2 h-48 pt-4">
      {data.map(({ day, load }) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end justify-center" style={{ height: "160px" }}>
            <div
              className="w-full max-w-[36px] rounded-t-md transition-all"
              style={{ height: `${Math.max(8, (load / max) * 100)}%`, backgroundColor: accent }}
            />
          </div>
          <span className="text-xs font-bold text-depro-gray">{day}</span>
        </div>
      ))}
    </div>
  );
}

function InicioPanel() {
  const highRisk = DEMO_PLAYERS.filter((p) => p.injuryRisk === "alto").length;
  const teamRisk = highRisk >= 2 ? "alto" : highRisk === 1 ? "medio" : "bajo";
  const completedTests = DEMO_PLAYERS.filter((p) => p.loadBand === "optima").length;
  const testPct = Math.round((completedTests / DEMO_PLAYERS.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl">
      <NexGentClubBanner team={PALMEIRAS.team} role="Entrenador" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Users size={14} /> Plantilla activa
          </div>
          <p className="text-3xl font-black text-depro-dark">{DEMO_PLAYERS.length}</p>
          <p className="text-xs text-depro-gray mt-1">jugadores · {PALMEIRAS.team}</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Calendar size={14} /> Próxima sesión
          </div>
          <p className="font-bold text-depro-dark">Hoy 09:30</p>
          <p className="text-sm text-depro-gray">Técnico-táctico · Intensidad media</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <CheckCircle size={14} style={{ color: PALMEIRAS.accent }} /> Tests completados
          </div>
          <p className="text-3xl font-black" style={{ color: PALMEIRAS.accent }}>{testPct}%</p>
          <p className="text-xs text-depro-gray mt-1">Evaluación T3 · Semana 24</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Activity size={14} /> Riesgo lesión
          </div>
          <p className="text-3xl font-black capitalize" style={{ color: riskColor(teamRisk) }}>{teamRisk}</p>
          <p className="text-xs text-depro-gray mt-1">{highRisk} jugadores en alerta</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-depro-border p-4 opacity-90">
            <Icon size={18} className="text-depro-blue mb-2" />
            <p className="font-bold text-sm text-depro-dark">{label}</p>
            <p className="text-xs text-depro-gray mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Carga semanal del equipo (AU)</h2>
          <WeeklyLoadChart data={WEEKLY_LOAD} accent={PALMEIRAS.accent} />
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Estado de la plantilla</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DEMO_PLAYERS.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-black border-2 bg-white"
                  style={{ borderColor: loadBandColor(p.loadBand) }}
                >
                  {p.avatar}
                </div>
                <span className="text-[10px] text-depro-gray truncate w-full text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-depro-border bg-white p-4 flex items-start gap-3">
        <img src={NEXGENT_LOGO} alt="NexGent" className="h-5 object-contain flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-gray leading-relaxed">
          Demo comercial <strong className="text-depro-dark">NexGent × DEPRO</strong> · {PALMEIRAS.shortName} · Datos de ejemplo. Producción: agregación GPS en tiempo real + predicción IA de riesgo.
        </p>
      </div>
    </div>
  );
}

export default function NexGentDemoApp() {
  const [role, setRole] = useState("Entrenador");
  const [searchQuery, setSearchQuery] = useState("");
  const activeNav = "inicio";

  return (
    <div className="min-h-screen flex bg-depro-gray-light text-depro-dark">
      <aside className="w-60 flex-shrink-0 border-r border-depro-border bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b border-depro-border">
          <Link to="/nexgent/pitch" className="flex items-center gap-2 mb-3">
            <img src={DEPRO_LOGO} alt="DEPRO" className="h-6 w-auto" />
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
            <img src={NEXGENT_LOGO} alt="NexGent" className="h-3.5 object-contain" />
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon, mock }) => {
            const active = id === activeNav;
            return (
              <div
                key={id}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? "text-white shadow-sm" : "text-depro-gray"
                }`}
                style={active ? { backgroundColor: PALMEIRAS.accent } : undefined}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {mock && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${active ? "bg-white/20 text-white" : "bg-depro-gray-light text-depro-gray"}`}>
                    demo
                  </span>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-depro-border">
          <Link to="/nexgent/pitch" className="text-[10px] text-depro-gray hover:text-depro-blue font-semibold">
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
        <main className="flex-1 overflow-y-auto p-6">
          <InicioPanel />
        </main>
      </div>
    </div>
  );
}
