import { Link } from "react-router-dom";
import {
  ArrowRight, Play, User, Building2, Users, Sparkles, ChevronDown, ChevronRight,
  Star, Check, Calendar, Activity, BarChart3, Brain, Shield,
  LayoutDashboard, Zap, CreditCard, Smartphone, FileText, XCircle,
  Mail, MessageCircle,
} from "lucide-react";
import { useState } from "react";
import {
  SetupScene, GenerateScene, TrainScene,
  RoleCoachScene, RoleClubScene, RolePlayerScene,
  VideoPreviewScene, AIEngineScene,
} from "./HoldedAIVisuals";

function sx(dark) {
  return {
    section: dark
      ? "py-20 md:py-28 bg-holded-dark border-t border-white/5 relative overflow-hidden"
      : "py-20 md:py-28 bg-white border-t border-gray-100 relative overflow-hidden",
    h2: dark ? "text-white" : "text-gray-900",
    body: dark ? "text-holded-muted" : "text-gray-500",
    label: dark ? "text-holded-blue-light" : "text-holded-blue",
    toolCard: dark
      ? "group block rounded-2xl border border-white/8 bg-holded-card/60 overflow-hidden hover:border-holded-blue/30 hover:shadow-xl transition-all"
      : "group block rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden hover:border-holded-blue/30 hover:shadow-lg transition-all",
    cardTitle: dark ? "text-white" : "text-gray-900",
    card: dark
      ? "rounded-2xl border border-white/8 bg-holded-card/60 hover:border-white/15 transition-all"
      : "rounded-2xl border border-gray-200 bg-gray-50 hover:shadow-md transition-all",
    stepCard: dark
      ? "group rounded-2xl border border-white/8 bg-holded-card/40 p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all"
      : "group rounded-2xl border border-gray-200 bg-white p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all",
    roleCard: dark
      ? "group block rounded-2xl border border-white/8 bg-holded-card/40 p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all"
      : "group block rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all",
    iconBox: dark ? "bg-holded-blue/20" : "bg-holded-blue/10",
    icon: dark ? "text-holded-blue-light" : "text-holded-blue",
    link: dark ? "text-holded-blue-light" : "text-holded-blue",
    highlight: dark
      ? "border-holded-blue/30 bg-holded-blue/10 hover:bg-holded-blue/15"
      : "border-holded-blue/25 bg-blue-50/80 hover:bg-blue-50",
    normal: dark
      ? "border-white/8 bg-holded-card/40 hover:border-holded-blue/25"
      : "border-gray-200 bg-gray-50/80 hover:border-holded-blue/25",
    ctaSolid: dark
      ? "inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
      : "inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors",
    ctaOutline: dark
      ? "inline-flex items-center gap-2 border border-white/25 text-white font-bold px-6 py-3 rounded-full hover:bg-white/5 transition-colors"
      : "inline-flex items-center gap-2 border border-gray-300 text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors",
    check: dark ? "text-holded-green" : "text-holded-green",
    aiBadge: dark
      ? "inline-flex items-center gap-2 bg-holded-blue/15 border border-holded-blue/25 text-holded-blue-light text-xs font-bold px-4 py-1.5 rounded-full mb-5"
      : "inline-flex items-center gap-2 bg-blue-50 text-holded-blue text-xs font-bold px-4 py-1.5 rounded-full mb-5",
    aiCard: dark
      ? "group relative rounded-2xl border border-white/8 bg-holded-card/60 p-6 hover:border-holded-blue/35 transition-all overflow-hidden"
      : "group relative rounded-2xl border border-gray-200 bg-white p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all overflow-hidden",
    aiBanner: dark
      ? "mt-10 rounded-2xl border border-white/8 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
      : "mt-10 rounded-2xl border border-gray-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-sm",
    shieldBox: "w-14 h-14 rounded-2xl bg-holded-green/15 border border-holded-green/25 flex items-center justify-center shrink-0",
    faqItem: dark
      ? "rounded-xl border border-white/8 bg-holded-card/40 overflow-hidden"
      : "rounded-xl border border-gray-200 bg-white overflow-hidden",
    faqBtn: dark
      ? "w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-white hover:bg-white/5 transition-colors"
      : "w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors",
    faqBorder: dark ? "border-white/8" : "border-gray-100",
    glowOrange: dark ? "bg-orange-500/5" : "bg-orange-100/40",
    statHover: dark ? "group-hover:text-holded-blue-light" : "group-hover:text-holded-blue",
    statVal: dark ? "text-white" : "text-gray-900",
    statLabel: dark ? "text-white/80" : "text-gray-700",
    statSub: dark ? "text-holded-muted" : "text-gray-400",
    statCard: dark
      ? "group rounded-2xl border border-white/8 bg-holded-card/40 p-8 text-center hover:border-holded-blue/30 transition-all"
      : "group rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center hover:border-holded-blue/30 hover:shadow-md transition-all",
  };
}

/* ── Mini mockups para cards estilo Holded ───────────────────── */

function SquadCardVisual() {
  return (
    <div className="bg-[#0a0e17] rounded-xl p-3 h-36 overflow-hidden group">
      <p className="text-[8px] font-bold text-white/40 uppercase mb-2">Plantilla · 22 jugadores</p>
      <div className="space-y-1.5">
        {["Delantero", "Medio", "Defensa"].map((p, i) => (
          <div key={p} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
            <div className={`w-5 h-5 rounded-full ai-hover-pulse ${["bg-blue-500", "bg-emerald-500", "bg-violet-500"][i]}`} />
            <span className="text-[9px] font-semibold text-white/70 flex-1">{p}</span>
            <span className="text-[8px] text-white/30">{8 - i * 2} activos</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestsCardVisual() {
  return (
    <div className="bg-[#0a0e17] rounded-xl p-3 h-36 overflow-hidden group">
      <p className="text-[8px] font-bold text-white/40 uppercase mb-2">Tests T1 → T3</p>
      <div className="flex items-end gap-1 h-20">
        {[45, 62, 78, 55, 85, 70, 92].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-holded-green to-emerald-400 ai-hover-bar" style={{ height: `${h * 0.55}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <p className="text-[8px] text-holded-green font-bold mt-1">+12% vs temporada anterior</p>
    </div>
  );
}

function PeriodCardVisual() {
  return (
    <div className="bg-[#0a0e17] rounded-xl p-3 h-36 overflow-hidden group">
      <p className="text-[8px] font-bold text-white/40 uppercase mb-2">Mesociclo · Pretemporada</p>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {["S1", "S2", "S3", "S4"].map((w, i) => (
          <div key={w} className="text-center">
            <div className={`rounded ai-hover-week mx-auto w-full ${i < 3 ? "bg-holded-blue h-10" : "bg-white/10 h-6"}`} style={{ animationDelay: `${i * 0.12}s` }} />
            <span className="text-[7px] text-white/30 mt-0.5 block">{w}</span>
          </div>
        ))}
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-3/4 bg-holded-blue rounded-full ai-hover-progress" />
      </div>
    </div>
  );
}

function ReportsCardVisual() {
  return (
    <div className="bg-[#0a0e17] rounded-xl p-3 h-36 overflow-hidden group">
      <p className="text-[8px] font-bold text-white/40 uppercase mb-2">Informe semanal</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-lg font-black text-white">87%</p>
          <p className="text-[7px] text-white/40">Adherencia</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <p className="text-lg font-black text-holded-green">6.8</p>
          <p className="text-[7px] text-white/40">RPE medio</p>
        </div>
      </div>
      <div className="flex gap-1 h-6">
        {[60, 80, 55, 90, 70].map((w, i) => (
          <div key={i} className="flex-1 rounded-sm bg-holded-blue/60 ai-hover-bar" style={{ height: `${w * 0.35}%`, alignSelf: "flex-end", animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Sección: Otras herramientas (4 cards con mockup arriba) ─── */

const EXTRA_TOOLS = [
  { title: "Plantilla", desc: "Gestiona jugadores, posiciones, lesiones y códigos de acceso al club.", to: "/funcionalidades/plantilla", Visual: SquadCardVisual },
  { title: "Tests físicos", desc: "Monitoriza evolución T1→T3 con ratings automáticos y comparativas.", to: "/funcionalidades/tests", Visual: TestsCardVisual },
  { title: "Periodización", desc: "Mesociclos con progresión semanal, descarga y fases de competición.", to: "/funcionalidades/planificacion", Visual: PeriodCardVisual },
  { title: "Informes", desc: "Exporta adherencia, carga y rendimiento para dirección deportiva.", to: "/funcionalidades/cargas", Visual: ReportsCardVisual },
];

export function ExtraToolsSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] ${s.glowOrange} rounded-full blur-[100px]`} aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>Otras herramientas para potenciar tu rendimiento</h2>
          <p className={s.body}>Plantilla, tests, periodización e informes — conectados con tu planificación.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EXTRA_TOOLS.map(({ title, desc, to, Visual }) => (
            <Link key={title} to={to} className={s.toolCard}>
              <div className="p-4 pb-0">
                <Visual />
              </div>
              <div className="p-5 pt-4">
                <h3 className={`font-black text-lg mb-2 ${s.cardTitle}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${s.body}`}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Precios teaser (split + tarjetas apiladas) ──────────────── */

const PLAN_CARDS = [
  { name: "Coach", color: "from-slate-600 to-slate-700", price: "14,99 €" },
  { name: "Pro", color: "from-holded-blue to-indigo-600", price: "29,99 €", featured: true },
  { name: "Club", color: "from-violet-600 to-purple-700", price: "49,99 €" },
  { name: "Elite", color: "from-emerald-600 to-teal-700", price: "Custom" },
];

export function PricingTeaserSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${s.label}`}>Precios sencillos</p>
            <h2 className={`text-3xl md:text-4xl font-black mb-4 leading-tight ${s.h2}`}>Planes que crecen con tu club</h2>
            <p className={`mb-6 leading-relaxed ${s.body}`}>Sin tarjeta de crédito. Escala cuando lo necesites.</p>
            <div className={`flex flex-wrap gap-4 mb-8 text-sm ${s.body}`}>
              {["Sin tarjeta", "Escala contigo", "Cancela cuando quieras"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check size={14} className={s.check} /> {t}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/precios" className={s.ctaSolid}>
                Ver todos los planes <ArrowRight size={16} />
              </Link>
              <Link to="/comprar" className={s.ctaOutline}>
                Prueba gratis
              </Link>
            </div>
          </div>
          <div className="relative h-64 lg:h-72 flex items-center justify-center">
            {PLAN_CARDS.map(({ name, color, price, featured }, i) => (
              <div
                key={name}
                className={`absolute w-48 h-28 rounded-2xl bg-gradient-to-br ${color} shadow-2xl border border-white/10 p-4 flex flex-col justify-between transition-transform group hover:scale-105`}
                style={{
                  transform: `rotate(${(i - 1.5) * 8}deg) translateX(${(i - 1.5) * 28}px) translateY(${Math.abs(i - 1.5) * 8}px)`,
                  zIndex: featured ? 10 : i,
                }}
              >
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase">Plan</p>
                  <p className="text-lg font-black text-white">{name}</p>
                </div>
                <p className="text-sm font-bold text-white/90">{price}<span className="text-[10px] font-normal text-white/50">/mes</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Por qué eligen DEPRO (4 cards) ────────────────────────── */

const WHY_DEPRO = [
  { icon: LayoutDashboard, title: "Dashboard en tiempo real", desc: "Adherencia, carga y tests actualizados al instante para todo el staff.", to: "/funcionalidades/cargas" },
  { icon: Brain, title: "IA deportiva validada", desc: "Motores de reglas trazables — no caja negra. Cada sesión editable.", to: "/funcionalidades#ia", highlight: true },
  { icon: Users, title: "3 perfiles conectados", desc: "Entrenador, club y jugador sincronizados en una sola plataforma.", to: "/para-entrenadores" },
  { icon: Zap, title: "Listo en 2 minutos", desc: "Registro con Google, plantilla importada y primer microciclo generado.", to: "/comprar" },
];

export function WhyDeproSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>Por qué los clubs eligen DEPRO</h2>
          <p className={s.body}>Las funcionalidades que hacen de DEPRO la mejor opción para preparación física.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_DEPRO.map(({ icon: Icon, title, desc, to, highlight }) => (
            <Link
              key={title}
              to={to}
              className={`group rounded-2xl border p-6 transition-all hover:shadow-lg ${highlight ? s.highlight : s.normal}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.iconBox}`}>
                <Icon size={20} className={s.icon} />
              </div>
              <h3 className={`font-black mb-2 leading-snug ${s.cardTitle}`}>{title}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${s.body}`}>{desc}</p>
              <span className={`text-sm font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all ${s.link}`}>
                Saber más <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Impact stats (3 cards grandes) ──────────────────────────── */

export function ImpactStatsSection({ dark = true }) {
  const s = sx(dark);
  const stats = [
    { val: "40 h", label: "ahorradas al mes en planificación", sub: "vs Excel y WhatsApp" },
    { val: "160×", label: "más rápido generando microciclos", sub: "con IA validada" },
    { val: "85%", label: "adherencia media de plantillas", sub: "en clubs activos" },
  ];
  return (
    <section className={`${s.section.replace("relative overflow-hidden", "").trim()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className={`text-3xl md:text-4xl font-black text-center mb-14 ${s.h2}`}>
          Entrenadores y clubs ya confían en DEPRO
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map(({ val, label, sub }) => (
            <div key={label} className={s.statCard}>
              <p className={`text-4xl md:text-5xl font-black mb-3 tabular-nums transition-colors ${s.statVal} ${s.statHover}`}>{val}</p>
              <p className={`text-sm font-semibold mb-1 ${s.statLabel}`}>{label}</p>
              <p className={`text-xs ${s.statSub}`}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Cómo funciona ───────────────────────────────────────────── */

const STEPS = [
  { icon: User, title: "Configura", desc: "Elige categoría, material y plantilla en 2 minutos.", Scene: SetupScene },
  { icon: Sparkles, title: "Genera", desc: "La IA crea el microciclo con sesiones A/B/C validadas.", Scene: GenerateScene },
  { icon: Play, title: "Entrena", desc: "Ejecuta, registra carga y ajusta con feedback real.", Scene: TrainScene },
];

export function HowItWorksSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>Cómo funciona</p>
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>De cero a microciclo en tres pasos</h2>
          <p className={s.body}>Sin curva de aprendizaje. Configura, genera y entrena con datos reales.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, title, desc, Scene }, i) => (
            <div key={title} className={s.stepCard}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBox}`}>
                  <Icon size={18} className={s.icon} />
                </div>
                <div>
                  <span className={`text-[10px] font-bold ${s.statSub}`}>Paso {i + 1}</span>
                  <h3 className={`font-black ${s.cardTitle}`}>{title}</h3>
                </div>
              </div>
              <p className={`text-sm mb-4 leading-relaxed ${s.body}`}>{desc}</p>
              <Scene light={!dark} />
              <p className={`text-[10px] mt-3 flex items-center gap-1 ${s.statSub}`}>
                <Sparkles size={10} /> Hover para animar
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Perfiles ────────────────────────────────────────────────── */

const ROLES = [
  { icon: User, title: "Entrenador", desc: "Microciclos, sesiones y control de carga en un solo panel.", to: "/para-entrenadores", Scene: RoleCoachScene },
  { icon: Building2, title: "Club", desc: "Multi-equipo, coordinador y white-label para academias.", to: "/para-clubs", Scene: RoleClubScene },
  { icon: Users, title: "Jugador", desc: "Plan personalizado, tests y ranking en el móvil.", to: "/para-jugadores", Scene: RolePlayerScene },
];

export function RolesSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>Perfiles</p>
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>Una plataforma, tres roles</h2>
          <p className={s.body}>Entrenador, club o jugador — cada uno con su panel optimizado.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map(({ icon: Icon, title, desc, to, Scene }) => (
            <Link key={title} to={to} className={s.roleCard}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.iconBox}`}>
                <Icon size={20} className={s.icon} />
              </div>
              <h3 className={`font-black text-lg mb-2 ${s.cardTitle}`}>{title}</h3>
              <p className={`text-sm mb-4 leading-relaxed ${s.body}`}>{desc}</p>
              <Scene light={!dark} />
              <span className={`inline-flex items-center gap-1 text-sm font-bold mt-4 group-hover:gap-2 transition-all ${s.link}`}>
                Explorar <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── IA ──────────────────────────────────────────────────────── */

const AI_ENGINES = [
  { id: "coach", icon: Calendar, name: "Motor DEPRO Coach", desc: "Microciclos deterministas por categoría, fase y material.", tag: "Planificación" },
  { id: "player", icon: Brain, name: "Plan engine jugador", desc: "Planes adaptativos según posición, lesiones y feedback.", tag: "Personalización" },
  { id: "load", icon: Activity, name: "Clasificador de carga", desc: "RPE + wellness con alertas automáticas de sobrecarga.", tag: "Monitorización" },
  { id: "period", icon: BarChart3, name: "Periodización", desc: "Mesociclos con progresión semanal y descarga automática.", tag: "Temporada" },
];

export function AISection({ dark = true }) {
  const s = sx(dark);
  return (
    <section id="ia" className={s.section}>
      {dark && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(37,99,235,0.12),transparent)]" aria-hidden="true" />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={s.aiBadge}>
            <Brain size={14} /> Inteligencia artificial deportiva
          </span>
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>IA que entiende el deporte</h2>
          <p className={`leading-relaxed ${s.body}`}>
            Motores de reglas validados — no caja negra. Cada sesión es trazable, editable y sustituible.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
          {AI_ENGINES.map(({ id, icon: Icon, name, desc, tag }) => (
            <div key={id} className={s.aiCard}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBox}`}>
                  <Icon size={20} className={s.icon} strokeWidth={2} />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.statSub}`}>{tag}</span>
                  <h3 className={`font-black text-lg leading-tight ${s.cardTitle}`}>{name}</h3>
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${s.body}`}>{desc}</p>
              <AIEngineScene id={id} light={!dark} />
              <p className={`text-[10px] mt-3 flex items-center gap-1 ${s.statSub}`}>
                <Sparkles size={10} /> Pasa el ratón para ver la simulación
              </p>
            </div>
          ))}
        </div>
        <div className={s.aiBanner}>
          <div className={s.shieldBox}>
            <Shield size={26} className="text-holded-green" />
          </div>
          <div className="flex-1">
            <h3 className={`font-black text-lg mb-1 ${s.cardTitle}`}>Validada por entrenadores, no por marketing</h3>
            <p className={`text-sm leading-relaxed ${s.body}`}>
              Cada recomendación sigue protocolos deportivos reales. Edita, sustituye o duplica cualquier sesión en segundos.
            </p>
          </div>
          <Link to="/funcionalidades#ia" className={`inline-flex items-center gap-2 text-sm font-bold transition-colors shrink-0 ${s.link} ${dark ? "hover:text-white" : "hover:text-holded-blue/80"}`}>
            Ver motores IA <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonios con estrellas ───────────────────────────────── */

const TESTIMONIALS = [
  { title: "De Excel a microciclo en minutos", quote: "Pasamos de planificar en Excel a tener el microciclo generado en minutos. Los jugadores ven su carga en el móvil.", name: "Marc T.", role: "Entrenador Sub-16 · FC Demo", initials: "MT", date: "12 mar 2026", color: "from-rose-500 to-red-600" },
  { title: "Visibilidad total del club", quote: "Gestionamos 6 equipos con adherencia, carga y tests en un solo panel. La dirección deportiva tiene informes al instante.", name: "Laura V.", role: "Coordinadora · Academia Pro", initials: "LV", date: "28 feb 2026", color: "from-holded-blue to-indigo-600" },
  { title: "Los jugadores están enganchados", quote: "Mis jugadores registran RPE al terminar la sesión y consultan su ranking. La adherencia subió un 30% este trimestre.", name: "David R.", role: "Preparador · Juvenil A", initials: "DR", date: "5 mar 2026", color: "from-amber-500 to-orange-600" },
];

export function TestimonialsSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className={`text-3xl md:text-4xl font-black text-center mb-14 ${s.h2}`}>Lo que dicen nuestros clientes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ title, quote, name, role, initials, date, color }) => (
            <div key={name} className={`${s.card} p-6 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-holded-green fill-holded-green" />)}
                </div>
                <span className={`text-[10px] ${s.statSub}`}>{date}</span>
              </div>
              <h3 className={`font-black mb-3 leading-snug ${s.cardTitle}`}>{title}</h3>
              <p className={`text-sm leading-relaxed flex-1 mb-6 ${s.body}`}>{quote}</p>
              <div className={`flex items-center gap-3 pt-4 border-t ${s.faqBorder}`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{initials}</div>
                <div>
                  <p className={`font-bold text-sm ${s.cardTitle}`}>{name}</p>
                  <p className={`text-xs ${s.statSub}`}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────── */

const FAQS = [
  {
    icon: CreditCard,
    q: "¿Necesito tarjeta para la prueba?",
    a: "No. La prueba gratuita no requiere tarjeta de crédito. Regístrate con email o Google y empieza a planificar en minutos.",
  },
  {
    icon: Zap,
    q: "¿Cuánto cuesta DEPRO?",
    a: "Los planes empiezan desde 14,99 €/mes (Coach Pro). Hay opciones para entrenadores individuales, clubs y academias. Consulta la página de precios para comparar límites y funcionalidades.",
  },
  {
    icon: Users,
    q: "¿Funciona para fútbol base y competición?",
    a: "Sí. DEPRO cubre desde categorías base hasta juvenil y amateur, con protocolos por bloque de edad, fase de temporada y material disponible.",
  },
  {
    icon: Brain,
    q: "¿Puedo editar las sesiones generadas por IA?",
    a: "Siempre. Cada sesión es trazable, editable y sustituible. La IA propone; tú decides. Duplica, exporta o comparte con la plantilla cuando quieras.",
  },
  {
    icon: Building2,
    q: "¿Hay versión para clubs con varios equipos?",
    a: "DEPRO Club incluye panel coordinador, multi-equipo, códigos de acceso por categoría y personalización de marca para academias.",
  },
  {
    icon: Smartphone,
    q: "¿Los jugadores tienen panel o app?",
    a: "Sí. Cada jugador accede a su plan semanal, registra RPE y feedback, consulta tests y ranking. Todo sincronizado con el entrenador en tiempo real.",
  },
  {
    icon: Activity,
    q: "¿Qué tests físicos incluye?",
    a: "Sprint, salto, Yo-Yo, resistencia y más. Batería T1→T2→T3 con ratings automáticos, tendencias y comparativas por jugador y equipo.",
  },
  {
    icon: BarChart3,
    q: "¿Cómo funciona el control de carga?",
    a: "Monitorizas RPE, wellness y alertas por jugador. DEPRO concilia la carga planificada con la ejecutada y avisa antes de situaciones de sobrecarga.",
  },
  {
    icon: FileText,
    q: "¿Puedo exportar informes?",
    a: "Sí. Adherencia, carga, tests y evolución de temporada se exportan para dirección deportiva, coordinadores o reuniones de staff.",
  },
  {
    icon: XCircle,
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sin permanencia. Cancela desde tu cuenta cuando lo necesites. Tus datos e histórico permanecen accesibles según tu plan activo.",
  },
];

export function FAQSection({ dark = false }) {
  const [open, setOpen] = useState(0);
  const s = sx(dark);

  return (
    <section className={`${s.section} overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] ${dark ? "bg-holded-blue/15" : "bg-blue-100/80"}`} />
        <div className={`absolute -bottom-32 -left-24 w-80 h-80 rounded-full blur-[90px] ${dark ? "bg-emerald-500/10" : "bg-orange-100/60"}`} />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>FAQ</p>
            <h2 className={`text-3xl md:text-4xl font-black mb-4 leading-tight ${s.h2}`}>
              Resolvemos tus dudas antes de empezar
            </h2>
            <p className={`text-base leading-relaxed mb-8 ${s.body}`}>
              Todo lo que suelen preguntarnos entrenadores, coordinadores y clubs antes de probar DEPRO.
            </p>
            <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-holded-blue/15 flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-holded-blue" />
                </div>
                <div>
                  <p className={`font-bold mb-1 ${s.cardTitle}`}>¿No encuentras tu respuesta?</p>
                  <p className={`text-sm mb-4 ${s.body}`}>Escríbenos y te respondemos en menos de 24 horas.</p>
                  <a
                    href="mailto:ventas@depro.es"
                    className="inline-flex items-center gap-2 text-sm font-bold text-holded-blue hover:gap-3 transition-all"
                  >
                    <Mail size={15} /> ventas@depro.es
                  </a>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-3 mt-6 pt-6 border-t ${dark ? "border-white/10" : "border-gray-100"}`}>
                {[
                  { val: "10+", label: "Preguntas" },
                  { val: "24h", label: "Respuesta" },
                ].map(({ val, label }) => (
                  <div key={label} className={`rounded-xl px-3 py-2.5 text-center ${dark ? "bg-white/5" : "bg-gray-50"}`}>
                    <p className={`text-xl font-black tabular-nums ${s.cardTitle}`}>{val}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${s.statSub}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ icon: Icon, q, a }, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={q}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? dark
                        ? "border-holded-blue/40 bg-holded-blue/10 shadow-lg shadow-holded-blue/5"
                        : "border-holded-blue/30 bg-white shadow-lg shadow-blue-500/5"
                      : dark
                        ? "border-white/8 bg-holded-card/50 hover:border-white/15"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50/80"}`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-holded-blue text-white" : dark ? "bg-white/10 text-holded-blue-light" : "bg-blue-50 text-holded-blue"
                    }`}>
                      <Icon size={18} strokeWidth={2.25} />
                    </span>
                    <span className={`font-bold flex-1 pr-2 ${s.cardTitle}`}>{q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${s.statSub} ${isOpen ? "rotate-180 text-holded-blue" : ""}`}
                    />
                  </button>
                  <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className={`px-5 pb-5 pl-[4.5rem] text-sm leading-relaxed border-t pt-3 ${s.body} ${dark ? "border-white/8" : "border-gray-100"}`}>
                        {a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Vídeo demo ──────────────────────────────────────────────── */

const VIDEO_CHAPTERS = [
  { time: "0:00", label: "Configura tu equipo" },
  { time: "0:45", label: "Genera el microciclo" },
  { time: "1:30", label: "Comparte con la plantilla" },
];

export function VideoSection({ dark = true }) {
  const [playing, setPlaying] = useState(false);
  const s = sx(dark);

  return (
    <section className={`${s.section} overflow-hidden`}>
      {dark && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(37,99,235,0.18),transparent)]" />
        </div>
      )}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-5 ${
            dark ? "bg-white/10 text-holded-blue-light border border-white/10" : "bg-blue-50 text-holded-blue"
          }`}>
            <Play size={12} className="fill-current" /> Demo en vídeo
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight ${s.h2}`}>
            Mira DEPRO en acción
          </h2>
          <p className={`text-base md:text-lg ${s.body}`}>
            De cero a microciclo completo en 3 minutos. Planificación, carga y tests en un solo flujo.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className={`absolute -inset-4 rounded-[2rem] blur-2xl opacity-60 ${dark ? "bg-holded-blue/20" : "bg-blue-200/40"}`} aria-hidden="true" />
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video group">
            {!playing ? (
              <>
                <img
                  src="/foto3.jpg"
                  alt="Entrenamiento de fútbol con DEPRO"
                  className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  aria-label="Reproducir demo de DEPRO"
                >
                  <span className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.35)] group-hover:scale-110 transition-transform duration-300">
                    <Play size={36} className="text-holded-blue fill-holded-blue ml-1.5" />
                  </span>
                  <span className="text-white font-bold text-sm md:text-base tracking-wide">Ver demo · 3 min</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-wrap gap-2">
                  {VIDEO_CHAPTERS.map(({ time, label }) => (
                    <span key={label} className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                      {time} · {label}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-holded-dark text-center p-8">
                <VideoPreviewScene light={false} />
                <p className="text-holded-muted text-sm mt-4 max-w-sm">
                  Vídeo demo próximamente. Mientras tanto, prueba DEPRO gratis y genera tu primer microciclo.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Link to="/comprar" className={s.ctaSolid}>
                    Probar gratis <ArrowRight size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPlaying(false)}
                    className={s.ctaOutline}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mt-10 md:mt-14">
          {[
            { icon: Sparkles, t: "Planificación automática", d: "Microciclos con sesiones A/B/C en segundos." },
            { icon: Activity, t: "Control de carga en vivo", d: "RPE, wellness y alertas por jugador." },
            { icon: BarChart3, t: "Tests y evolución", d: "Seguimiento T1→T3 con histórico completo." },
          ].map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
                dark ? "border-white/8 bg-white/5 hover:border-holded-blue/30" : "border-gray-200 bg-white hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${dark ? "bg-holded-blue/20" : "bg-blue-50"}`}>
                <Icon size={18} className={dark ? "text-holded-blue-light" : "text-holded-blue"} />
              </div>
              <p className={`font-bold mb-1 ${s.cardTitle}`}>{t}</p>
              <p className={`text-sm leading-relaxed ${s.body}`}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Secciones con fotos reales de fútbol ───────────────────── */

export function FootballStorySection({
  dark = true,
  reverse = false,
  image,
  label,
  title,
  desc,
  bullets = [],
  to = "/comprar",
  ctaText = "Probar DEPRO",
}) {
  const s = sx(dark);
  const content = (
    <div className="flex flex-col justify-center py-4 lg:py-8">
      <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${s.label}`}>{label}</p>
      <h2 className={`text-3xl md:text-4xl font-black mb-4 leading-tight ${s.h2}`}>{title}</h2>
      <p className={`text-base leading-relaxed mb-6 ${s.body}`}>{desc}</p>
      {bullets.length > 0 && (
        <ul className="space-y-3 mb-8">
          {bullets.map((b) => (
            <li key={b} className={`flex items-start gap-3 text-sm ${s.body}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${dark ? "bg-holded-blue/20" : "bg-blue-50"}`}>
                <Check size={12} className="text-holded-blue" strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
      <Link
        to={to}
        className={dark
          ? "inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors w-fit"
          : "inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors w-fit"}
      >
        {ctaText} <ArrowRight size={16} />
      </Link>
    </div>
  );

  const visual = (
    <div className="relative">
      <div className={`absolute -inset-3 rounded-[2rem] blur-2xl opacity-50 ${dark ? "bg-holded-blue/25" : "bg-orange-200/50"}`} aria-hidden="true" />
      <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${dark ? "bg-gradient-to-t from-holded-dark/90 via-holded-dark/20 to-transparent" : "bg-gradient-to-t from-gray-900/50 via-transparent to-transparent"}`} />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/35 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-holded-green animate-pulse" /> En el campo
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}>
          {reverse ? (
            <>
              {visual}
              {content}
            </>
          ) : (
            <>
              {content}
              {visual}
            </>
          )}
        </div>
      </div>
    </section>
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
