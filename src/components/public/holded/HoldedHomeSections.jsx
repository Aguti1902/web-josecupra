import { Link } from "react-router-dom";
import {
  ArrowRight, Play, User, Building2, Users, Sparkles, ChevronDown, ChevronRight,
  Star, Check, Calendar, Activity, BarChart3, Brain, Shield,
  LayoutDashboard, Zap,
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
  { q: "¿Necesito tarjeta para la prueba?", a: "No. La prueba gratuita no requiere tarjeta de crédito." },
  { q: "¿Funciona para fútbol base y competición?", a: "Sí. DEPRO cubre desde categorías base hasta juvenil y amateur, con protocolos por bloque de edad." },
  { q: "¿Puedo editar las sesiones generadas por IA?", a: "Siempre. Cada sesión es trazable, editable y sustituible por el entrenador." },
  { q: "¿Hay versión para clubs con varios equipos?", a: "DEPRO Club incluye panel coordinador, multi-equipo y personalización de marca." },
];

export function FAQSection({ dark = true }) {
  const [open, setOpen] = useState(0);
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>FAQ</p>
          <h2 className={`text-3xl font-black ${s.h2}`}>Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={q} className={s.faqItem}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className={s.faqBtn}
              >
                {q}
                <ChevronDown size={18} className={`${s.statSub} shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className={`px-5 pb-4 text-sm leading-relaxed border-t pt-3 ${s.body} ${s.faqBorder}`}>{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Vídeo ───────────────────────────────────────────────────── */

export function VideoSection({ dark = true }) {
  const s = sx(dark);
  return (
    <section className={s.section.replace("relative overflow-hidden", "").trim()}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>Demo</p>
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${s.h2}`}>Mira DEPRO en acción</h2>
          <p className={s.body}>De cero a microciclo completo en 3 minutos.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="group lg:min-h-[260px]">
            <VideoPreviewScene light={!dark} />
          </div>
          <div className="space-y-6">
            {[
              { t: "Planificación automática", d: "Microciclos con sesiones A/B/C en segundos." },
              { t: "Control de carga en vivo", d: "RPE, wellness y alertas por jugador." },
              { t: "Tests y evolución", d: "Seguimiento T1→T3 con histórico completo." },
            ].map(({ t, d }) => (
              <div key={t} className="flex gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dark ? "bg-holded-blue-light" : "bg-holded-blue"}`} />
                <div>
                  <p className={`font-bold ${s.cardTitle}`}>{t}</p>
                  <p className={`text-sm mt-0.5 ${s.body}`}>{d}</p>
                </div>
              </div>
            ))}
            <Link to="/comprar" className={s.ctaSolid}>
              Probar gratis <ArrowRight size={16} />
            </Link>
          </div>
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
