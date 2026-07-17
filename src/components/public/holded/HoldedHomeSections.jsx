import { Link } from "react-router-dom";
import { ArrowRight, Play, User, Building2, Users, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  SetupScene, GenerateScene, TrainScene,
  RoleCoachScene, RoleClubScene, RolePlayerScene,
  VideoPreviewScene,
} from "./HoldedAIVisuals";

const STEPS = [
  { icon: User, title: "Configura", desc: "Elige categoría, material y plantilla en 2 minutos.", Scene: SetupScene },
  { icon: Sparkles, title: "Genera", desc: "La IA crea el microciclo con sesiones A/B/C validadas.", Scene: GenerateScene },
  { icon: Play, title: "Entrena", desc: "Ejecuta, registra carga y ajusta con feedback real.", Scene: TrainScene },
];

const ROLES = [
  { icon: User, title: "Entrenador", desc: "Microciclos, sesiones y control de carga en un solo panel.", to: "/para-entrenadores", Scene: RoleCoachScene },
  { icon: Building2, title: "Club", desc: "Multi-equipo, coordinador y white-label para academias.", to: "/para-clubs", Scene: RoleClubScene },
  { icon: Users, title: "Jugador", desc: "Plan personalizado, tests y ranking en el móvil.", to: "/para-jugadores", Scene: RolePlayerScene },
];

const TESTIMONIALS = [
  { quote: "Pasamos de Excel a tener el microciclo generado en minutos.", name: "Marc T.", role: "Entrenador Sub-16", initials: "MT" },
  { quote: "Gestionamos 6 equipos con visibilidad total de carga y adherencia.", name: "Laura V.", role: "Coordinadora Academia", initials: "LV" },
  { quote: "Mis jugadores ven el plan en el móvil y registran RPE al instante.", name: "David R.", role: "Preparador Juvenil", initials: "DR" },
];

const FAQS = [
  { q: "¿Necesito tarjeta para la prueba?", a: "No. Los 15 días gratis no requieren tarjeta de crédito." },
  { q: "¿Funciona para fútbol base y competición?", a: "Sí. DEPRO cubre desde categorías base hasta juvenil y amateur, con protocolos por bloque de edad." },
  { q: "¿Puedo editar las sesiones generadas por IA?", a: "Siempre. Cada sesión es trazable, editable y sustituible por el entrenador." },
  { q: "¿Hay versión para clubs con varios equipos?", a: "DEPRO Club incluye panel coordinador, multi-equipo y personalización de marca." },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Cómo funciona</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">De cero a microciclo en tres pasos</h2>
          <p className="text-gray-500">Sin curva de aprendizaje. Configura, genera y entrena con datos reales desde el primer día.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, title, desc, Scene }, i) => (
            <div key={title} className="group relative rounded-2xl border border-gray-200 bg-gray-50/50 p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-holded-blue/10 flex items-center justify-center">
                  <Icon size={18} className="text-holded-blue" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400">Paso {i + 1}</span>
                  <h3 className="font-black text-gray-900">{title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
              <Scene light />
              <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                <Sparkles size={10} /> Hover para animar
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RolesSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Perfiles</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Una plataforma, tres roles</h2>
          <p className="text-gray-500">Entrenador, club o jugador — cada uno con su panel optimizado.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map(({ icon: Icon, title, desc, to, Scene }) => (
            <Link key={title} to={to} className="group block rounded-2xl border border-gray-200 bg-white p-6 hover:border-holded-blue/30 hover:shadow-xl transition-all">
              <div className="w-11 h-11 rounded-xl bg-holded-blue/10 flex items-center justify-center mb-4 group-hover:bg-holded-blue/15 transition-colors">
                <Icon size={20} className="text-holded-blue" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
              <Scene light />
              <span className="inline-flex items-center gap-1 text-sm font-bold text-holded-blue mt-4 group-hover:gap-2 transition-all">
                Explorar <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Testimonios</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Lo que dicen los entrenadores</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initials }) => (
            <div key={name} className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 flex flex-col">
              <p className="text-gray-600 italic leading-relaxed flex-1 mb-6">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-holded-blue to-indigo-600 text-white flex items-center justify-center text-xs font-bold">{initials}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-20 md:py-28 bg-gray-50 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">FAQ</p>
          <h2 className="text-3xl font-black text-gray-900">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={q} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {q}
                <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VideoSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Demo</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Mira DEPRO en acción</h2>
          <p className="text-gray-500">De cero a microciclo completo en 3 minutos.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="group aspect-video lg:aspect-auto lg:min-h-[260px]">
            <VideoPreviewScene light />
          </div>
          <div className="space-y-6">
            {[
              { t: "Planificación automática", d: "Microciclos con sesiones A/B/C en segundos." },
              { t: "Control de carga en vivo", d: "RPE, wellness y alertas por jugador." },
              { t: "Tests y evolución", d: "Seguimiento T1→T3 con histórico completo." },
            ].map(({ t, d }) => (
              <div key={t} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-holded-blue mt-2 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{t}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{d}</p>
                </div>
              </div>
            ))}
            <Link to="/comprar" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Probar gratis 15 días <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OpportunitySection() {
  return (
    <section className="py-24 md:py-32 bg-holded-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(37,99,235,0.2),transparent)]" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto">
          De la planificación a la sesión en el campo
        </h2>
        <p className="text-holded-muted max-w-xl mx-auto mb-10">
          Todo conectado: mesociclo → microciclo → sesión del día → feedback del jugador → ajuste automático.
        </p>
        <Link to="/comprar" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100">
          Empezar gratis <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

/** Wrapper blanco con curva superior */
export function HoldedWhiteContent({ children }) {
  return (
    <div className="relative bg-white -mt-1 rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.15)] z-10">
      {children}
    </div>
  );
}

/** Bloque oscuro unificado: hero + stats */
export function HoldedDarkHeroBlock({ children }) {
  return (
    <div className="relative bg-holded-dark overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.25),transparent)]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/2" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
