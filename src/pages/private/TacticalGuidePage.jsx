import { useState } from "react";
import {
  BookOpen, ChevronDown, Maximize2, Users, Clock, Flame, Target, Info, AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { tacticalGuides } from "../../data/mockData";

const ICONS = {
  space: Maximize2,
  players: Users,
  time: Clock,
  intensity: Flame,
};

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}

export default function TacticalGuidePage() {
  const { user } = useAuth();
  const raw    = user?.club?.primaryColor || "#0A36F7";
  const accent = lum(raw) > 0.75 ? "#0A36F7" : raw;

  const [selectedKey, setSelectedKey] = useState(tacticalGuides[0].key);
  const [open, setOpen] = useState(false);

  const guide = tacticalGuides.find((g) => g.key === selectedKey);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
          <BookOpen size={14} className="text-depro-blue" />
          Ayuda pedagógica
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Guía técnico-táctica</h1>
        <p className="text-depro-gray text-sm max-w-2xl">
          Selección orientativa de tareas para ayudarte a diseñar tus propios entrenamientos.
          Esta sección no genera archivos ni guarda configuraciones: es una referencia de apoyo.
        </p>
      </div>

      {/* Desplegable de tareas */}
      <div className="bg-white border border-depro-border rounded-2xl shadow-card p-5 mb-6">
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block">
          Tipo de tarea
        </label>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-depro-gray-light hover:bg-depro-gray-light/70 border border-depro-border rounded-xl text-sm font-semibold text-depro-dark transition-colors"
          >
            <span>{guide.label}</span>
            <ChevronDown size={16} className={`text-depro-gray transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-depro-border rounded-xl shadow-card-hover z-10 overflow-hidden">
              {tacticalGuides.map((g) => (
                <button
                  key={g.key}
                  onClick={() => { setSelectedKey(g.key); setOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    g.key === selectedKey
                      ? "bg-depro-blue-light text-depro-blue font-bold"
                      : "text-depro-dark hover:bg-depro-gray-light"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ficha automática */}
      <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-depro-border" style={{ backgroundColor: accent + "08" }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accent }}>
            <Target size={13} /> Objetivo general
          </div>
          <p className="text-depro-dark font-semibold text-lg leading-snug">{guide.objective}</p>
        </div>

        {/* Iconografía condicional */}
        <div className="px-6 py-5 border-b border-depro-border">
          <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3">Condicionantes recomendados</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {guide.icons.map((iconKey) => {
              const Icon = ICONS[iconKey];
              const labels = {
                space: { label: "Espacio", value: guide.conditions.space },
                players: { label: "Jugadores", value: guide.conditions.players },
                time: { label: "Tiempo", value: guide.conditions.time },
                intensity: { label: "Intensidad", value: guide.conditions.intensity },
              };
              const item = labels[iconKey];
              return (
                <div key={iconKey} className="bg-depro-gray-light rounded-xl p-4 border border-depro-border">
                  <Icon size={16} style={{ color: accent }} />
                  <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mt-2">{item.label}</div>
                  <div className="text-sm font-bold text-depro-dark mt-0.5">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orientaciones */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-3" style={{ color: accent }}>
            <Info size={13} /> Orientaciones metodológicas
          </div>
          <ul className="space-y-2">
            {guide.orientations.map((o, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-depro-dark">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: accent + "20", color: accent }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Aviso */}
      <div className="mt-5 flex items-start gap-3 bg-depro-yellow-light border border-depro-yellow/30 rounded-xl p-4">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-depro-dark leading-relaxed">
          <strong>Apoyo pedagógico:</strong> ni se generan archivos ni se guardan configuraciones.
          Usa esta guía para diseñar tus tareas integradas (posesión, juego de posición, ruedas, etc.)
          según los condicionantes adecuados.
        </div>
      </div>
    </div>
  );
}
