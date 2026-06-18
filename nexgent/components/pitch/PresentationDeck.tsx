"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, Brain, Calendar, CheckCircle2,
  ChevronLeft, ChevronRight, Clock, Shield, Sparkles, Target, TrendingUp, Users, X, Zap,
} from "lucide-react";
import { DEPRO_ACCENT, PALMEIRAS } from "@/lib/club-config";
import {
  PITCH_STATS, FEATURES, MODULE_GROUPS, ROADMAP_PHASES, COMPARE_ROWS,
  COMMISSION_TIERS, WORKFLOW_STEPS, ADVANTAGES, PALMEIRAS_STATS,
} from "@/lib/pitch-content";
import { FeatureDemo, HeroAnimatedDemo } from "./NexGentFeatureDemos";

const ACCENT = DEPRO_ACCENT;
const ROADMAP_COLORS = ["#6366F1", "#0A36F7", "#006437", "#F59E0B", "#8B5CF6", "#22C55E"];
const ADV_ICONS = [Brain, Zap, Shield, BarChart3, Target, Sparkles];
const WF_ICONS = [Calendar, Target, TrendingUp, BarChart3];

type Slide =
  | { kind: "title" }
  | { kind: "stats" }
  | { kind: "content"; eyebrow: string; title: string; bullets: string[]; logos?: boolean }
  | { kind: "modules" }
  | { kind: "feature"; featureId: string }
  | { kind: "palmeiras" }
  | { kind: "roadmap" }
  | { kind: "compare" }
  | { kind: "commission" }
  | { kind: "advantages" }
  | { kind: "workflow" }
  | { kind: "cta" };

const SLIDES: Slide[] = [
  { kind: "title" },
  { kind: "stats" },
  {
    kind: "content",
    eyebrow: "El reto",
    title: "Los clubes top compiten con datos e IA",
    bullets: [
      "Excel y WhatsApp no escalan con 8 equipos y 140+ jugadores",
      "GPS genera datos que nadie interpreta a tiempo",
      "Médico, cantera, scouting y planificación en silos",
      "Las familias esperan una app con la cara del club",
    ],
  },
  {
    kind: "content",
    eyebrow: "La alianza",
    title: "NexGent + DEPRO = una plataforma",
    bullets: [
      "NexGent: IA táctica, GPS inteligente, chat, scouting, vídeo, dirección",
      "DEPRO: periodización, tests, white-label, PDFs de sesión",
      "Integración nativa — no dos apps pegadas",
      "Transparente: ambas marcas, un solo producto enterprise",
    ],
    logos: true,
  },
  { kind: "modules" },
  ...FEATURES.map((f) => ({ kind: "feature" as const, featureId: f.id })),
  { kind: "palmeiras" },
  { kind: "roadmap" },
  { kind: "compare" },
  { kind: "commission" },
  { kind: "advantages" },
  { kind: "workflow" },
  { kind: "cta" },
];

function CompareCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50">
        <CheckCircle2 size={16} className="text-green-500" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50">
        <X size={12} className="text-gray-300" />
      </span>
    );
  }
  const label = value === "partial" ? "Parcial" : value === "addon" ? "Extra $" : "Limitado";
  return <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">{label}</span>;
}

function AnimatedFeaturePanel({ featureId, active }: { featureId: string; active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 700);
    return () => clearInterval(t);
  }, [featureId, active]);

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none scale-[0.92] lg:scale-100 origin-top">
      <FeatureDemo id={featureId} step={step} />
      <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Demo animada en vivo
      </p>
    </div>
  );
}

function SlideEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>
      {children}
    </p>
  );
}

function SlideBullets({ items, size = "md" }: { items: string[]; size?: "sm" | "md" }) {
  const text = size === "sm" ? "text-sm" : "text-base sm:text-lg";
  return (
    <ul className={`space-y-2 sm:space-y-3 ${text}`}>
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-gray-700">
          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: ACCENT }} />
          {b}
        </li>
      ))}
    </ul>
  );
}

export default function PresentationDeck() {
  const [idx, setIdx] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[idx];

  const next = useCallback(() => setIdx((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const feature = slide.kind === "feature" ? FEATURES.find((f) => f.id === slide.featureId) : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-12 sm:h-14 border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 bg-white z-20">
        <Link href="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Volver al pitch</span><span className="sm:hidden">Pitch</span>
        </Link>
        <span className="text-[10px] sm:text-xs font-bold text-gray-400 tabular-nums">{idx + 1} / {total}</span>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8 lg:p-10">
        <div className="w-full max-w-6xl">

          {slide.kind === "title" && (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-5 mb-8">
                  <img src="/logo-nexgent.png" alt="NexGent" className="h-14 sm:h-20 object-contain" />
                  <span className="text-2xl text-gray-300">×</span>
                  <img src="/logo.png" alt="DEPRO" className="h-11 sm:h-16 object-contain" />
                </div>
                <SlideEyebrow>Alianza estratégica · Clubes profesionales</SlideEyebrow>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  El software más completo para clubes de fútbol profesional
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  NexGent y DEPRO unen IA, GPS, periodización, médico, cantera, vídeo y white-label en una plataforma enterprise.
                </p>
              </div>
              <HeroAnimatedDemo />
            </div>
          )}

          {slide.kind === "stats" && (
            <div>
              <SlideEyebrow>En números</SlideEyebrow>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-8">La plataforma en cifras</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
                {PITCH_STATS.map((s) => (
                  <div key={s.l} className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 text-center">
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 stat-number">{s.v}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-1 leading-snug">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Palmeiras demo", value: `${PALMEIRAS.players} jugadores · ${PALMEIRAS.teams} equipos` },
                  { icon: Target, label: "Staff técnico", value: `${PALMEIRAS.coaches} entrenadores · ${PALMEIRAS.category}` },
                  { icon: Zap, label: "Integraciones GPS", value: "Catapult · STATSports · Polar · WIMU" },
                  { icon: Clock, label: "Roadmap típico", value: "12 meses · requisitos → go-live" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT}12` }}>
                      <Icon size={20} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
                      <div className="text-sm font-bold text-gray-900">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.kind === "content" && (
            <div className="max-w-3xl">
              {slide.logos && (
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo-nexgent.png" alt="NexGent" className="h-8 object-contain" />
                  <span className="text-gray-300">×</span>
                  <img src="/logo.png" alt="DEPRO" className="h-6 object-contain" />
                </div>
              )}
              <SlideEyebrow>{slide.eyebrow}</SlideEyebrow>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">{slide.title}</h2>
              <SlideBullets items={slide.bullets} />
            </div>
          )}

          {slide.kind === "modules" && (
            <div>
              <SlideEyebrow>Ecosistema completo</SlideEyebrow>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-6">20+ módulos integrados</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MODULE_GROUPS.map((g) => (
                  <div key={g.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{g.title}</h3>
                    <ul className="space-y-1.5">
                      {g.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.kind === "feature" && feature && (
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div>
                <SlideEyebrow>Módulo · {FEATURES.indexOf(feature) + 1}/{FEATURES.length}</SlideEyebrow>
                <h2 className="text-xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">{feature.title}</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-5">{feature.summary}</p>
                <SlideBullets items={[...feature.bullets]} size="sm" />
              </div>
              <AnimatedFeaturePanel featureId={feature.id} active />
            </div>
          )}

          {slide.kind === "palmeiras" && (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <SlideEyebrow>Demo en vivo</SlideEyebrow>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">Así se ve con {PALMEIRAS.shortName}</h2>
                <div className="flex items-start gap-4 mb-6">
                  <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="w-14 h-14 rounded-xl border border-gray-200 bg-white p-1.5 object-contain" />
                  <div>
                    <div className="font-black text-lg">{PALMEIRAS.name}</div>
                    <div className="text-sm text-gray-500">{PALMEIRAS.city}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {PALMEIRAS_STATS.map((s) => (
                    <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                      <div className="text-xl font-black" style={{ color: PALMEIRAS.accent }}>{s.value}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic border-l-4 pl-4" style={{ borderColor: PALMEIRAS.accent }}>
                  &quot;Por fin tenemos rendimiento, planificación y scouting en un solo sitio — con la cara de Palmeiras.&quot;
                </p>
              </div>
              <AnimatedFeaturePanel featureId="dashboard" active />
            </div>
          )}

          {slide.kind === "roadmap" && (
            <div>
              <SlideEyebrow>Roadmap de desarrollo</SlideEyebrow>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Desde requisitos hasta go-live · 12 meses</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROADMAP_PHASES.map((phase, i) => (
                  <div key={phase.phase} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: ROADMAP_COLORS[i] }}>
                        {i}
                      </span>
                      <span className="text-[10px] font-black uppercase" style={{ color: ROADMAP_COLORS[i] }}>{phase.phase}</span>
                      <span className="text-[10px] text-gray-400">{phase.period}</span>
                    </div>
                    <h3 className="font-black text-sm text-gray-900 mb-1">{phase.title}</h3>
                    <p className="text-[11px] text-gray-500 mb-2">{phase.subtitle}</p>
                    <ul className="space-y-1">
                      {phase.items.slice(0, 2).map((item) => (
                        <li key={item} className="text-[10px] text-gray-600 flex gap-1.5">
                          <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5" style={{ color: ROADMAP_COLORS[i] }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.kind === "compare" && (
            <div>
              <SlideEyebrow>Comparativa</SlideEyebrow>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">NexGent × DEPRO vs alternativas</h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[520px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 font-bold text-gray-700">Capacidad</th>
                        <th className="p-3 font-black text-center" style={{ color: ACCENT, background: "#eff6ff" }}>NexGent × DEPRO</th>
                        <th className="p-3 font-bold text-center text-gray-500">Excel</th>
                        <th className="p-3 font-bold text-center text-gray-500">SaaS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_ROWS.map((row) => (
                        <tr key={row.label} className="border-b border-gray-100 last:border-0">
                          <td className="p-2.5 text-gray-700 font-medium">{row.label}</td>
                          <td className="p-2.5 text-center" style={{ backgroundColor: "#eff6ff40" }}><CompareCell value={row.us} /></td>
                          <td className="p-2.5 text-center"><CompareCell value={row.sheets} /></td>
                          <td className="p-2.5 text-center"><CompareCell value={row.generic} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {slide.kind === "commission" && (
            <div>
              <SlideEyebrow>Para comerciales · 7% comisión</SlideEyebrow>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Valor enterprise = comisión real</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {COMMISSION_TIERS.map((tier) => (
                  <div key={tier.name} className="rounded-xl border border-gray-200 bg-gradient-to-b from-blue-50 to-white p-5">
                    <div className="text-xs font-black text-gray-900 mb-1">{tier.name}</div>
                    <div className="text-lg font-black mb-3" style={{ color: ACCENT }}>{tier.range}</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{tier.example}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Proyectos de Primera División pueden superar €1M–€3M · comisión sobre importe facturado
              </p>
            </div>
          )}

          {slide.kind === "advantages" && (
            <div>
              <SlideEyebrow>Ventajas competitivas</SlideEyebrow>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Por qué NexGent × DEPRO gana</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ADVANTAGES.map(({ title, desc }, i) => {
                  const Icon = ADV_ICONS[i] ?? Sparkles;
                  return (
                    <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
                      <Icon size={20} className="mb-2" style={{ color: ACCENT }} />
                      <h3 className="font-black text-sm mb-1">{title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {slide.kind === "workflow" && (
            <div>
              <SlideEyebrow>Flujo de trabajo</SlideEyebrow>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">De la planificación al campo</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {WORKFLOW_STEPS.map(({ title, desc }, i) => {
                  const Icon = WF_ICONS[i] ?? Calendar;
                  return (
                    <div key={title} className="rounded-xl border border-gray-200 bg-gray-900 p-4 text-white">
                      <div className="text-[10px] font-black text-green-400 mb-1">{String(i + 1).padStart(2, "0")}</div>
                      <Icon size={22} className="mb-2" />
                      <h3 className="font-bold text-sm mb-1">{title}</h3>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {slide.kind === "cta" && (
            <div className="text-center max-w-2xl mx-auto">
              <SlideEyebrow>Siguiente paso</SlideEyebrow>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">¿Listo para verlo en acción?</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Demo interactiva Palmeiras · {FEATURES.length} módulos con demo animada · Roadmap 12 meses desde requisitos
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/app/inicio" className="inline-flex items-center justify-center gap-2 text-white font-black px-8 py-4 rounded-xl" style={{ backgroundColor: ACCENT }}>
                  Ver la demo <ArrowRight size={20} />
                </Link>
                <Link href="/" className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-colors">
                  Volver al pitch
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                <Clock size={14} /> Demo Palmeiras · Sin registro · Datos de ejemplo
              </p>
            </div>
          )}

        </div>
      </main>

      <footer className="h-14 border-t border-gray-200 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 bg-white">
        <button type="button" onClick={prev} disabled={idx === 0} className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900">
          <ChevronLeft size={18} /> Anterior
        </button>
        <div className="hidden sm:flex gap-1 max-w-[40vw] overflow-x-auto py-1">
          {SLIDES.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${i === idx ? "bg-depro-blue w-4" : "bg-gray-200"}`} aria-label={`Diapositiva ${i + 1}`} />
          ))}
        </div>
        <span className="sm:hidden text-xs font-bold text-gray-400 tabular-nums">{idx + 1}/{total}</span>
        <button type="button" onClick={next} disabled={idx === total - 1} className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900">
          Siguiente <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
