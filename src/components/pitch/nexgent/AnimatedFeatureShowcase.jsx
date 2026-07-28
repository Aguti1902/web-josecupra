import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { DEPRO_ACCENT, PALMEIRAS } from "../../../lib/nexgentConfig";

const FEATURES = [
  {
    id: "dashboard",
    title: "Dashboard del club",
    summary: "Una pantalla para dirección, cuerpo técnico y médico.",
    bullets: ["Mesociclo y microciclo por equipo", "Próxima sesión y tests completados", "Cabecera con logo y colores del club"],
    demo: "dashboard",
  },
  {
    id: "sessions",
    title: "Sesiones con IA táctica",
    summary: "Describe el ejercicio en lenguaje natural → diagrama SVG.",
    bullets: ["Generación JSON estricta", "Task designer integrado", "PDF con branding del club"],
    demo: "sessions",
  },
  {
    id: "loads",
    title: "Control de carga GPS",
    summary: "Import Catapult, STATSports, Polar, WIMU…",
    bullets: ["Mapeo de columnas flexible", "Clasificación IA por jugador", "Semáforo óptima / alta / riesgo"],
    demo: "loads",
  },
  {
    id: "tests",
    title: "Tests físicos",
    summary: "Ratings objetivos T1→T2→T3 vs media del equipo.",
    bullets: ["4 tests × 3 evaluaciones", "Gráficas automáticas", "Verde / ámbar / rojo"],
    demo: "tests",
  },
  {
    id: "chat",
    title: "Chat del staff + IA",
    summary: "Canales por rol con resumen inteligente.",
    bullets: ["Cuerpo técnico, médico, scouting", "Persistencia en tiempo real", "Resumen IA en 2-3 líneas"],
    demo: "chat",
  },
  {
    id: "scouting",
    title: "Scouting integrado",
    summary: "Informes estructurados y seguimiento de objetivos.",
    bullets: ["Físico, técnico, táctico, actitudinal", "Notas libres", "Histórico por jugador"],
    demo: "scouting",
  },
  {
    id: "pdf",
    title: "PDFs de sesión",
    summary: "Plan profesional listo para el campo.",
    bullets: ["Logo y colores del club", "Vídeos de calentamiento", "Export en un clic"],
    demo: "pdf",
  },
  {
    id: "brand",
    title: "White-label completo",
    summary: "Tu club en cada pantalla — no una app genérica.",
    bullets: ["Logo, colores, equipos", "Familias ven Palmeiras", "Multi-categoría"],
    demo: "brand",
  },
];

function BrowserChrome({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono truncate text-center">
            app.depro.club · {title}
          </div>
        </div>
      </div>
      <div className="p-4 bg-[#FAFBFC] min-h-[240px]">{children}</div>
    </div>
  );
}

function DemoPanel({ type, step }) {
  const accent = DEPRO_ACCENT;
  if (type === "dashboard") {
    return (
      <BrowserChrome title="dashboard">
        <div className="rounded-lg p-3 text-white mb-3" style={{ background: `linear-gradient(135deg, ${PALMEIRAS.accent}, #004d2a)` }}>
          <div className="text-[10px] opacity-80 font-bold">{PALMEIRAS.shortName} · Sub-20</div>
          <div className="text-sm font-black">Semana 24 · Mesociclo 3</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["142", "4", step >= 1 ? "91%" : "—"].map((v, i) => (
            <div key={i} className="bg-white rounded-lg border p-2 text-center">
              <div className="text-lg font-black">{v}</div>
              <div className="text-[8px] text-gray-400 font-bold uppercase">{["Jugadores", "Sesiones", "Tests"][i]}</div>
            </div>
          ))}
        </div>
      </BrowserChrome>
    );
  }
  if (type === "sessions") {
    return (
      <BrowserChrome title="sesiones / ia">
        <div className="rounded-lg bg-emerald-700/90 h-28 mb-2 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {[...Array(3 + step)].map((_, i) => (
              <span key={i} className="w-4 h-4 rounded-full bg-white/90 border-2 border-amber-400 animate-fade-slide" />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-gray-600">Posesión 3v3 · espacio reducido · 2 toques</p>
      </BrowserChrome>
    );
  }
  if (type === "loads") {
    return (
      <BrowserChrome title="cargas / gps">
        <div className="flex gap-1.5 items-end h-24 mb-2">
          {[40, 65, step >= 2 ? 89 : 30, 55].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t relative overflow-hidden">
              <div
                className="absolute bottom-0 w-full rounded-t transition-all duration-700"
                style={{ height: `${h}%`, backgroundColor: i === 2 ? "#F59E0B" : accent }}
              />
            </div>
          ))}
        </div>
        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Media · 2.665 AU</span>
      </BrowserChrome>
    );
  }
  if (type === "tests") {
    return (
      <BrowserChrome title="tests">
        <svg viewBox="0 0 200 60" className="w-full h-16">
          <polyline points="10,45 70,38 130,28 190,18" fill="none" stroke="#006437" strokeWidth="2.5" />
          <polyline points="10,48 70,42 130,35 190,30" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        <p className="text-[9px] text-green-600 font-bold">+9% vs media equipo · Resistencia T3</p>
      </BrowserChrome>
    );
  }
  if (type === "chat") {
    return (
      <BrowserChrome title="chat staff">
        <div className="space-y-2">
          {["Sesión técnica mañana — intensidad media", "Luis Felipe Fase 2 readaptación"].map((m, i) => (
            <div key={i} className="bg-white rounded-lg border px-2 py-1.5 text-[10px] text-gray-700">{m}</div>
          ))}
          {step >= 2 && <div className="text-[9px] text-amber-700 bg-amber-50 rounded px-2 py-1 font-bold">✨ Resumen IA generado</div>}
        </div>
      </BrowserChrome>
    );
  }
  return (
    <BrowserChrome title={type}>
      <div className="h-24 bg-gradient-to-br from-depro-blue-light to-white rounded-lg border border-gray-100 flex items-center justify-center">
        <span className="text-xs font-bold text-depro-blue capitalize">{type}</span>
      </div>
    </BrowserChrome>
  );
}

export function HeroAnimatedDemo() {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= 3 ? 0 : s + 1)), 600);
    return () => clearInterval(t);
  }, [idx]);

  useEffect(() => {
    const r = setInterval(() => setIdx((i) => (i + 1) % 4), 2800);
    return () => clearInterval(r);
  }, []);

  const demos = ["dashboard", "sessions", "loads", "tests"];
  return <DemoPanel type={demos[idx]} step={step} />;
}

export default function AnimatedFeatureShowcase() {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const feature = FEATURES[idx];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= 3 ? 0 : s + 1)), 700);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div className="lg:sticky lg:top-24">
        <DemoPanel type={feature.demo} step={step} />
        <p className="text-center text-xs text-gray-400 mt-4">Demo animada · clic en módulo para cambiar</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Capacidades completas</p>
        <div className="space-y-2">
          {FEATURES.map((f, i) => {
            const active = i === idx;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => { setIdx(i); setStep(0); }}
                className={`w-full text-left rounded-xl border p-4 transition-all ${active ? "border-blue-200 bg-blue-50/60 shadow-sm ring-1 ring-blue-100" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-700"}`}>{f.title}</h3>
                    <p className={`text-xs mt-0.5 ${active ? "text-gray-600" : "text-gray-400"}`}>{f.summary}</p>
                  </div>
                  {active && <ChevronRight size={16} className="text-blue-600 flex-shrink-0" />}
                </div>
                {active && (
                  <ul className="mt-3 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
