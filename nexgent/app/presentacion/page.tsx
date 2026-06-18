"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DEPRO_ACCENT, PALMEIRAS } from "@/lib/club-config";
import { FEATURES } from "@/components/pitch/AnimatedFeatureShowcase";

const SLIDES = [
  {
    type: "title",
    title: "NexGent × DEPRO",
    subtitle: "El software más completo para clubes de fútbol profesional",
    logos: true,
  },
  {
    type: "content",
    eyebrow: "El reto",
    title: "Los clubes top ya compiten con datos e IA",
    bullets: [
      "Excel y WhatsApp no escalan con 8 equipos y 140+ jugadores",
      "GPS genera datos que nadie interpreta a tiempo",
      "Scouting, médico y planificación viven en silos",
      "Las familias esperan una app con la cara del club",
    ],
  },
  {
    type: "content",
    eyebrow: "La alianza",
    title: "Dos empresas, una plataforma",
    bullets: [
      "NexGent: IA táctica, GPS inteligente, chat staff, scouting avanzado",
      "DEPRO: periodización, tests físicos, white-label, PDFs de sesión",
      "Integración nativa — no dos apps pegadas con duct tape",
      "Transparente: ambos logos, ambas marcas, un solo producto",
    ],
    logos: true,
  },
  {
    type: "content",
    eyebrow: "Visión",
    title: "Un cerebro para todo el staff",
    bullets: [
      "Entrenadores: mesociclo, sesiones, tests, cargas",
      "Médico: readaptación, historial, alertas de riesgo",
      "Scouting: informes estructurados y seguimiento",
      "Dirección: KPIs, adherencia y decisiones con datos",
    ],
  },
  ...FEATURES.map((f) => ({
    type: "feature" as const,
    eyebrow: "Módulo",
    title: f.title,
    summary: f.summary,
    bullets: f.bullets,
  })),
  {
    type: "content",
    eyebrow: "Demo",
    title: `Ejemplo: ${PALMEIRAS.shortName}`,
    bullets: [
      `${PALMEIRAS.players} jugadores · ${PALMEIRAS.teams} equipos · ${PALMEIRAS.city}`,
      "Dashboard con colores verde y oro del club",
      "Sidebar DEPRO, banner, cards de entrenador",
      "Datos GPS, tests y scouting de ejemplo",
    ],
    club: true,
  },
  {
    type: "content",
    eyebrow: "Ventajas",
    title: "Por qué ganamos vs alternativas",
    bullets: [
      "White-label real — no plantilla genérica",
      "Compatible con vuestro GPS actual (Catapult, STATSports…)",
      "IA en lenguaje natural — el staff no aprende JSON",
      "Periodización DEPRO probada + capa NexGent de élite",
    ],
  },
  {
    type: "cta",
    title: "Siguiente paso",
    subtitle: "Explora la demo interactiva o contacta para un piloto acotado de 8–12 semanas.",
    logos: true,
  },
];

export default function PresentacionPage() {
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Volver al pitch
        </Link>
        <div className="flex items-center gap-3">
          <img src="/logo-nexgent.png" alt="NexGent" className="h-6 object-contain hidden sm:block" />
          <span className="text-gray-300 hidden sm:inline">×</span>
          <img src="/logo.png" alt="DEPRO" className="h-5 object-contain hidden sm:block" />
        </div>
        <span className="text-xs font-bold text-gray-400 tabular-nums">{idx + 1} / {total}</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-3xl w-full">
          {slide.type === "title" && (
            <div className="text-center">
              {slide.logos && (
                <div className="flex items-center justify-center gap-6 mb-10">
                  <img src="/logo-nexgent.png" alt="NexGent" className="h-16 md:h-24 object-contain" />
                  <span className="text-3xl text-gray-300">×</span>
                  <img src="/logo.png" alt="DEPRO" className="h-12 md:h-20 object-contain" />
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">{slide.title}</h1>
              <p className="text-xl text-gray-600">{slide.subtitle}</p>
            </div>
          )}

          {(slide.type === "content" || slide.type === "feature") && (
            <div>
              {"logos" in slide && slide.logos && (
                <div className="flex items-center gap-4 mb-8">
                  <img src="/logo-nexgent.png" alt="NexGent" className="h-8 object-contain" />
                  <span className="text-gray-300">×</span>
                  <img src="/logo.png" alt="DEPRO" className="h-6 object-contain" />
                </div>
              )}
              {"club" in slide && slide.club && (
                <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="h-16 mb-6 object-contain" />
              )}
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: DEPRO_ACCENT }}>
                {slide.eyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">{slide.title}</h2>
              {"summary" in slide && slide.summary && (
                <p className="text-lg text-gray-600 mb-6">{slide.summary}</p>
              )}
              <ul className="space-y-4">
                {slide.bullets?.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-lg text-gray-700">
                    <span className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: DEPRO_ACCENT }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slide.type === "cta" && (
            <div className="text-center">
              {slide.logos && (
                <div className="flex items-center justify-center gap-6 mb-10">
                  <img src="/logo-nexgent.png" alt="NexGent" className="h-14 object-contain" />
                  <span className="text-2xl text-gray-300">×</span>
                  <img src="/logo.png" alt="DEPRO" className="h-10 object-contain" />
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: DEPRO_ACCENT }}>CTA</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{slide.title}</h2>
              <p className="text-lg text-gray-600 mb-10">{slide.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/app/inicio" className="inline-flex items-center justify-center gap-2 text-white font-black px-8 py-4 rounded-xl" style={{ backgroundColor: DEPRO_ACCENT }}>
                  Ver la demo <ArrowRight size={20} />
                </Link>
                <Link href="/" className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-colors">
                  Volver al pitch
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="h-16 border-t border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <button type="button" onClick={prev} disabled={idx === 0} className="flex items-center gap-1 text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900">
          <ChevronLeft size={18} /> Anterior
        </button>
        <div className="flex gap-1">
          {SLIDES.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-depro-blue" : "bg-gray-200"}`} aria-label={`Diapositiva ${i + 1}`} />
          ))}
        </div>
        <button type="button" onClick={next} disabled={idx === total - 1} className="flex items-center gap-1 text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900">
          Siguiente <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
