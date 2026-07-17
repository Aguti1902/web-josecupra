import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, X, Gift, Sparkles, Users, User, Building2,
  ChevronRight, Clock, Brain, Cpu, Zap, Shield, BarChart3,
  Calendar, Activity, Play, Star, MessageCircle, Phone, BookOpen,
  Layers, Target, TrendingUp, Bot, Workflow,
} from "lucide-react";
import {
  DashboardMockup, SessionsMockup, LoadMockup, TestsMockup,
  PlayerPlanMockup, ClubOverviewMockup,
} from "../../components/public/LandingMockups";

/* ── Popup 15 días gratis ─────────────────────────────────────── */
function TrialPopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-br from-depro-blue to-indigo-700 px-8 py-10 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Gift size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">15 días gratis</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Prueba DEPRO completo sin tarjeta. Accede a planificación IA, control de carga, tests y panel de entrenador.
          </p>
        </div>
        <div className="p-6 space-y-3">
          {["Sin tarjeta de crédito", "Cancela cuando quieras", "Acceso a todas las funciones"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-depro-gray">
              <Check size={16} className="text-green-500 shrink-0" /> {t}
            </div>
          ))}
          <Link to="/comprar" onClick={onClose} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-2">
            Empezar prueba gratis <ArrowRight size={16} />
          </Link>
          <button onClick={onClose} className="w-full text-sm text-depro-gray hover:text-depro-dark py-2">
            Ahora no, gracias
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function TrialBanner() {
  return (
    <div className="mt-16 md:mt-20 bg-gradient-to-r from-depro-blue to-indigo-600 text-white text-center py-2.5 px-4 text-sm font-semibold">
      <Gift size={14} className="inline mr-2 -mt-0.5" />
      15 días de prueba gratis · Sin tarjeta ·{" "}
      <Link to="/comprar" className="underline underline-offset-2 hover:text-depro-yellow transition-colors">
        Empieza ahora
      </Link>
    </div>
  );
}

/* ── Hero estilo Holded ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(10,54,247,0.12),transparent)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <p className="text-sm font-bold text-depro-blue mb-4 tracking-wide">
              El software todo en uno para el deporte
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-depro-dark tracking-tight leading-[1.08] mb-6">
              Preparación física y mucho más.
            </h1>
            <p className="text-lg text-depro-gray leading-relaxed mb-8">
              DEPRO es la plataforma en la nube con todo lo que necesitas para planificar, monitorizar y optimizar el rendimiento de tu equipo — entrenadores, clubs y jugadores — desde cualquier lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link to="/comprar" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-xl">
                Prueba gratis 15 días <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold border-2 border-depro-border rounded-xl hover:border-depro-blue hover:text-depro-blue transition-colors bg-white">
                <GoogleIcon /> Empezar con Google
              </Link>
            </div>
            <p className="text-xs text-depro-gray flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> Cancela cuando quieras</span>
            </p>
          </div>
          <div className="lg:pl-4">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ── Social proof + stats ─────────────────────────────────────── */
function StatsBand() {
  const stats = [
    { val: "3", label: "Perfiles en uno", suffix: "" },
    { val: "90", label: "Ejercicios en biblioteca", suffix: "+" },
    { val: "15", label: "Días de prueba gratis", suffix: "" },
    { val: "100", label: "Planificación automática", suffix: "%" },
  ];
  return (
    <section className="py-12 bg-depro-gray-light border-y border-depro-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-depro-gray mb-8 font-medium">
          Entrenadores, clubs y jugadores ya optimizan su rendimiento con DEPRO
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-depro-blue stat-number">{s.val}{s.suffix}</div>
              <div className="text-sm text-depro-gray mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sección alternada con mockup (estilo Holded) ──────────────── */
function FeatureBlock({ label, title, desc, bullets, mockup, reverse = false, id }) {
  return (
    <section id={id} className="py-20 md:py-28 bg-white even:bg-depro-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? "lg:[direction:rtl]" : ""}`}>
          <div className={reverse ? "lg:[direction:ltr]" : ""}>
            <p className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3">{label}</p>
            <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4 leading-tight">{title}</h2>
            <p className="text-depro-gray leading-relaxed mb-6">{desc}</p>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-depro-gray">
                  <Check size={16} className="text-depro-blue mt-0.5 shrink-0" /> {b}
                </li>
              ))}
            </ul>
            <Link to="/comprar" className="inline-flex items-center gap-2 text-depro-blue font-bold text-sm hover:gap-3 transition-all">
              Explorar funcionalidad <ChevronRight size={16} />
            </Link>
          </div>
          <div className={`flex justify-center ${reverse ? "lg:[direction:ltr]" : ""}`}>
            {mockup}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3 productos en una plataforma ────────────────────────────── */
function PlatformProducts() {
  const products = [
    { id: "coach", icon: User, name: "DEPRO Coach", desc: "Entrenador individual. Microciclos IA, sesiones A/B/C, plantilla, tests y carga.", color: "from-blue-500 to-indigo-600", mockup: <SessionsMockup /> },
    { id: "club", icon: Building2, name: "DEPRO Club", desc: "Club multi-equipo. Panel centralizado, periodización por categoría, white-label.", color: "from-indigo-500 to-purple-600", mockup: <ClubOverviewMockup /> },
    { id: "player", icon: Users, name: "DEPRO Player", desc: "Jugador individual. Plan mensual IA adaptado a posición, nivel y objetivos.", color: "from-emerald-500 to-teal-600", mockup: <PlayerPlanMockup /> },
  ];
  const [active, setActive] = useState("coach");
  const current = products.find((p) => p.id === active);

  return (
    <section id="plataforma" className="py-20 md:py-28 bg-depro-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-depro-yellow mb-3">Plataforma todo en uno</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Tres productos. Una plataforma. Cero complicaciones.</h2>
          <p className="text-white/60">Desde tu primer microciclo hasta la gestión completa de un club · DEPRO se adapta a tu rol en cada etapa.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active === p.id ? "bg-white text-depro-dark shadow-lg" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              <p.icon size={16} /> {p.name}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${current.color} text-white text-xs font-bold mb-4`}>
              <Sparkles size={12} /> {current.name}
            </div>
            <h3 className="text-2xl font-black mb-3">{current.name}</h3>
            <p className="text-white/70 leading-relaxed mb-6">{current.desc}</p>
            <Link to={`/comprar?audience=${active}`} className="inline-flex items-center gap-2 bg-white text-depro-dark font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors">
              Probar 15 días gratis <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex justify-center">{current.mockup}</div>
        </div>
      </div>
    </section>
  );
}

/* ── Inteligencia artificial ──────────────────────────────────── */
function AISection() {
  const engines = [
    {
      icon: Workflow,
      name: "Motor de reglas DEPRO Coach",
      type: "Rule-based engine",
      desc: "Genera microciclos y sesiones A/B/C de forma determinista según categoría, objetivo de fase, material disponible y bloque de edad. Sin alucinaciones: reglas deportivas validadas.",
      tags: ["Sub-9 → Juvenil", "90+ ejercicios", "Sustitución inteligente"],
    },
    {
      icon: Brain,
      name: "Motor de planes jugador",
      type: "Plan engine adaptativo",
      desc: "Construye planes mensuales personalizados según posición, nivel, frecuencia, lesiones y objetivos. Se adapta semanalmente con el feedback del jugador.",
      tags: ["Posición + nivel", "Feedback loop", "PDF exportable"],
    },
    {
      icon: BarChart3,
      name: "Clasificador de carga",
      type: "Analytics + alertas",
      desc: "Monitoriza RPE, wellness (sueño, fatiga, ánimo) y detecta zonas de sobrecarga. Alertas automáticas cuando un jugador supera umbrales configurables.",
      tags: ["RPE + wellness", "Alertas automáticas", "Histórico por jugador"],
    },
    {
      icon: Target,
      name: "Periodización por categoría",
      type: "Mesociclo generator",
      desc: "Genera mesociclos completos con progresión de carga semanal, notas editables y alineación con el calendario competitivo del equipo.",
      tags: ["Mesociclos", "Progresión", "Notas semanales"],
    },
  ];

  return (
    <section id="ia" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-depro-blue/10 text-depro-blue text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Bot size={14} /> Inteligencia artificial deportiva
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">
            IA que entiende el deporte, no solo los datos
          </h2>
          <p className="text-depro-gray leading-relaxed">
            DEPRO combina motores de reglas deportivas validados con analítica de carga en tiempo real. Sin cajas negras: cada sesión generada es trazable, editable y sustituible.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {engines.map((e) => (
            <div key={e.name} className="rounded-2xl border border-depro-border p-6 hover:border-depro-blue/30 hover:shadow-lg transition-all bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-depro-blue-light flex items-center justify-center shrink-0">
                  <e.icon size={22} className="text-depro-blue" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-depro-blue mb-0.5">{e.type}</p>
                  <h3 className="font-black text-depro-dark">{e.name}</h3>
                </div>
              </div>
              <p className="text-sm text-depro-gray leading-relaxed mb-4">{e.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-gray">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-depro-gray-light border border-depro-border p-6 flex flex-col md:flex-row items-center gap-6">
          <Cpu size={40} className="text-depro-blue shrink-0" />
          <div>
            <p className="font-bold text-depro-dark mb-1">Stack tecnológico</p>
            <p className="text-sm text-depro-gray">
              React + Supabase en la nube · Stripe para suscripciones · Motores de reglas propios (no LLM generativo en producción) · Sincronización offline-first · Preparado para integración GPS (Catapult, STATSports) en plan Premium.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Vídeo explicativo (placeholder) ──────────────────────────── */
function VideoSection() {
  return (
    <section id="video" className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3">Vídeo explicativo</p>
        <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">
          Mira DEPRO en acción
        </h2>
        <p className="text-depro-gray mb-10 max-w-xl mx-auto">
          En 3 minutos entenderás cómo un entrenador pasa de cero a tener su microciclo completo generado y listo para el campo.
        </p>
        <div className="relative aspect-video rounded-2xl border-2 border-dashed border-depro-border bg-white flex flex-col items-center justify-center gap-4 shadow-inner">
          <div className="w-20 h-20 rounded-full bg-depro-blue/10 flex items-center justify-center">
            <Play size={32} className="text-depro-blue ml-1" />
          </div>
          <div>
            <p className="font-bold text-depro-dark">Vídeo próximamente</p>
            <p className="text-sm text-depro-gray mt-1">Aquí irá el vídeo explicativo de DEPRO</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Grid de funcionalidades ──────────────────────────────────── */
function FeaturesGrid() {
  const features = [
    { icon: Calendar, title: "Microciclos automáticos", desc: "Sesiones A/B/C generadas por IA según categoría, fase y material." },
    { icon: Activity, title: "Control de carga", desc: "RPE, wellness y alertas de sobrecarga por jugador y equipo." },
    { icon: BarChart3, title: "Tests físicos", desc: "Batería T1→T3 con seguimiento histórico y ratings." },
    { icon: Users, title: "Gestión de plantilla", desc: "Ficha completa por jugador: posición, peso, lesiones, notas." },
    { icon: Layers, title: "Modo DEPRO / Personalizado", desc: "Generación automática o construcción manual de sesiones." },
    { icon: Shield, title: "White-label club", desc: "Logo, colores y banner personalizados para tu club." },
    { icon: TrendingUp, title: "Upsells por plan", desc: "Límites de jugadores/equipos con upgrade integrado." },
    { icon: Zap, title: "15 días gratis", desc: "Prueba completa sin tarjeta. Cancela cuando quieras." },
  ];
  return (
    <section id="producto" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">
            Reemplaza hojas de cálculo con un software intuitivo
          </h2>
          <p className="text-depro-gray">Todo lo que un staff técnico necesita, conectado en una sola plataforma.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-depro-border p-5 hover:border-depro-blue/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-depro-blue-light flex items-center justify-center mb-3">
                <f.icon size={20} className="text-depro-blue" />
              </div>
              <h3 className="font-bold text-depro-dark text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-depro-gray leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonios ──────────────────────────────────────────────── */
function Testimonials() {
  const items = [
    { quote: "Pasamos de Excel a tener el microciclo generado en minutos. Los jugadores ven su carga en el móvil.", name: "Marc T.", role: "Entrenador Sub-16", stars: 5 },
    { quote: "Gestionamos 4 equipos desde un solo panel. El código de club para jugadores es genial.", name: "Laura V.", role: "Coordinadora deportiva", stars: 5 },
    { quote: "Mi plan de preparación se adapta cada semana según cómo me siento. Muy completo.", name: "David R.", role: "Jugador amateur", stars: 5 },
  ];
  return (
    <section className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-depro-dark text-center mb-12">Lo que dicen nuestros usuarios</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-depro-border p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-depro-gray leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-bold text-depro-dark text-sm">{t.name}</p>
              <p className="text-xs text-depro-gray">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "¿Qué incluyen los 15 días gratis?", a: "Acceso completo al plan que elijas (Coach, Club o Player). Sin tarjeta de crédito. Al finalizar el trial puedes suscribirte o cancelar sin coste." },
    { q: "¿Necesito conocimientos técnicos?", a: "No. El wizard de alta te guía paso a paso. En menos de 10 minutos tendrás tu equipo configurado y la primera sesión generada." },
    { q: "¿La IA genera sesiones al azar?", a: "No. DEPRO Coach usa un motor de reglas deportivas determinista: filtra ejercicios por categoría, bloque de edad, material y protocolo. Cada sesión es trazable y editable." },
    { q: "¿Puedo usar DEPRO sin conexión?", a: "Sí. Los datos se guardan localmente y se sincronizan con la nube cuando hay conexión (offline-first)." },
    { q: "¿Hay descuento para jugadores de un club?", a: "Sí. Los jugadores que se unen con el código de club obtienen un 15% de descuento en su plan individual." },
  ];
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-black text-depro-dark text-center mb-10">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="border border-depro-border rounded-xl overflow-hidden">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-sm text-depro-dark hover:bg-depro-gray-light transition-colors">
                {f.q}
                <ChevronRight size={16} className={`text-depro-gray transition-transform ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-depro-gray leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA final ────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-depro-blue to-indigo-800 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Prueba DEPRO gratis durante 15 días</h2>
        <p className="text-blue-100 mb-8">Sin tarjeta de crédito. Sin compromiso. Cancela cuando quieras.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/comprar" className="inline-flex items-center justify-center gap-2 bg-white text-depro-dark font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-colors">
            Empezar ahora gratis <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Precios (simplificado, mantiene estructura) ──────────────── */
function Precios() {
  const [audience, setAudience] = useState("coach");
  const plans = {
    coach: [
      { name: "Starter", price: "14,99€", subtext: "1 equipo · 25 jugadores", features: ["Microciclo IA", "Sesiones A/B/C", "Panel entrenador", "Export PDF"], highlighted: false },
      { name: "Pro", price: "29,99€", subtext: "3 equipos · 60 jugadores", features: ["Todo Starter +", "Control de carga", "Tests T1→T3", "Histórico jugador"], highlighted: true },
      { name: "Premium", price: "49,99€", subtext: "Ilimitado", features: ["Todo Pro +", "Import GPS", "Diagramas IA", "Soporte prioritario"], highlighted: false },
    ],
    club: [
      { name: "Inicial", price: "199€", subtext: "3 equipos · 80 jugadores", features: ["Panel centralizado", "Periodización IA", "White-label", "2 staff incluidos"], highlighted: false },
      { name: "Profesional", price: "399€", subtext: "8 equipos · 200 jugadores", features: ["Todo Inicial +", "GPS multi-equipo", "KPIs dirección", "5 staff incluidos"], highlighted: true },
      { name: "Elite", price: "699€", subtext: "Ilimitado", features: ["Todo Pro +", "API", "Scouting", "SLA dedicado"], highlighted: false },
    ],
    player: [
      { name: "Esencial", price: "19,99€", subtext: "Plan mensual IA", features: ["Plan mensual IA", "Adaptado a posición", "Descarga PDF", "Código club -15%"], highlighted: false },
      { name: "Pro", price: "39,99€", subtext: "Plan adaptativo", features: ["Todo Esencial +", "Ajuste semanal IA", "Tests con ratings", "Alertas sobrecarga"], highlighted: true },
    ],
  };
  const tabs = [
    { id: "coach", icon: User, label: "Entrenador" },
    { id: "club", icon: Building2, label: "Club" },
    { id: "player", icon: Users, label: "Jugador" },
  ];
  const list = plans[audience] || [];

  return (
    <section id="precios" className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3">Precios sencillos</p>
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark mb-4">Planes que crecen contigo</h2>
          <div className="inline-flex items-center gap-2 bg-depro-yellow/15 border border-depro-yellow/40 text-depro-dark text-sm font-bold px-4 py-2 rounded-full">
            <Gift size={15} className="text-amber-600" /> 15 días gratis · Sin tarjeta
          </div>
        </div>
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-white border border-depro-border">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button key={id} type="button" onClick={() => setAudience(id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${audience === id ? "bg-depro-blue text-white shadow-sm" : "text-depro-gray hover:text-depro-dark"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className={`grid gap-6 ${list.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
          {list.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border bg-white p-6 md:p-8 flex flex-col ${plan.highlighted ? "border-depro-blue shadow-lg ring-1 ring-depro-blue/20" : "border-depro-border"}`}>
              <p className="text-xs font-bold uppercase text-depro-gray mb-2">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-depro-dark">{plan.price}</span>
                <span className="text-depro-gray text-sm mb-1">/ mes</span>
              </div>
              <p className="text-sm text-depro-gray mb-6">{plan.subtext}</p>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-depro-gray"><Check size={14} className="text-depro-blue mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to={`/comprar?audience=${audience}`} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${plan.highlighted ? "bg-depro-blue text-white hover:bg-depro-blue-dark" : "border border-depro-border text-depro-dark hover:bg-depro-gray-light"}`}>
                Probar 15 días gratis <ChevronRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-depro-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <img src="/logo.png" alt="DEPRO" className="h-7 mb-4" />
            <p className="text-sm text-depro-gray">Preparación física inteligente para entrenadores, clubs y jugadores.</p>
          </div>
          {[
            { title: "Producto", links: [["Plataforma", "#plataforma"], ["IA", "#ia"], ["Precios", "#precios"], ["Vídeo", "#video"]] },
            { title: "Empresa", links: [["Contacto", "#contacto"], ["Sobre DEPRO", "#sobre"]] },
            { title: "Legal", links: [["Privacidad", "#"], ["Términos", "#"]] },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-bold text-depro-dark text-sm mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}><a href={href} className="text-sm text-depro-gray hover:text-depro-blue transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-depro-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-depro-gray">
          <p>© {new Date().getFullYear()} DEPRO. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-depro-dark">Iniciar sesión</Link>
            <Link to="/comprar" className="hover:text-depro-dark font-semibold text-depro-blue">Prueba gratis</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Contacto() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", tipo: "", mensaje: "" });
  return (
    <section id="contacto" className="py-20 bg-white border-t border-depro-border">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-black text-depro-dark mb-2">¿Tienes dudas?</h2>
        <p className="text-depro-gray mb-8 text-sm">Escríbenos y te respondemos en menos de 24h.</p>
        {enviado ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8"><Check size={32} className="text-green-500 mx-auto mb-3" /><p className="font-bold text-depro-dark">Mensaje enviado</p></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setEnviado(true); }} className="space-y-3 text-left">
            <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="admin-input w-full" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input w-full" />
            <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="admin-input w-full">
              <option value="">Soy…</option>
              <option value="coach">Entrenador</option>
              <option value="club">Club</option>
              <option value="player">Jugador</option>
            </select>
            <textarea required rows={3} placeholder="Tu mensaje" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="admin-input w-full resize-none" />
            <button type="submit" className="btn-primary w-full py-3">Enviar <ArrowRight size={16} className="inline ml-1" /></button>
          </form>
        )}
        <div className="flex justify-center gap-6 mt-8 text-sm text-depro-gray">
          <span className="flex items-center gap-2"><MessageCircle size={16} /> Chat soporte</span>
          <span className="flex items-center gap-2"><Phone size={16} /> Ventas</span>
          <span className="flex items-center gap-2"><BookOpen size={16} /> Documentación</span>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("depro_trial_popup_dismissed");
    if (!dismissed) {
      const t = setTimeout(() => setShowPopup(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("depro_trial_popup_dismissed", "1");
  };

  return (
    <div className="bg-white">
      <TrialBanner />
      {showPopup && <TrialPopup onClose={closePopup} />}
      <Hero />
      <StatsBand />
      <FeatureBlock
        id="planificacion"
        label="Planificación"
        title="DEPRO elimina el estrés de la planificación semanal"
        desc="Genera microciclos completos con sesiones A/B/C adaptadas a la categoría, fase competitiva y material disponible. Edita, sustituye ejercicios y duplica sesiones en segundos."
        bullets={["Microciclos y mesociclos automáticos", "Sesiones A/B/C con protocolos validados", "Modo DEPRO o Personalizado", "Biblioteca de 90+ ejercicios"]}
        mockup={<SessionsMockup />}
      />
      <FeatureBlock
        reverse
        label="Control de carga"
        title="Visibilidad total de la carga de tu plantilla"
        desc="Monitoriza RPE, sueño, fatiga y ánimo por jugador. Detecta sobrecargas antes de que se conviertan en lesiones."
        bullets={["RPE por sesión y jugador", "Wellness: sueño, fatiga, ánimo", "Alertas automáticas de sobrecarga", "Histórico y medias de equipo"]}
        mockup={<LoadMockup />}
      />
      <FeatureBlock
        label="Tests físicos"
        title="De la evaluación al seguimiento longitudinal"
        desc="Batería de tests físicos T1→T3 con seguimiento por jugador, comparativas y ratings automáticos."
        bullets={["Sprint, salto, Yo-Yo y más", "Seguimiento T1 → T2 → T3", "Ratings y tendencias", "Export para dirección deportiva"]}
        mockup={<TestsMockup />}
      />
      <PlatformProducts />
      <AISection />
      <VideoSection />
      <FeaturesGrid />
      <Precios />
      <Testimonials />
      <FAQ />
      <Contacto />
      <FinalCTA />
      <Footer />
    </div>
  );
}
