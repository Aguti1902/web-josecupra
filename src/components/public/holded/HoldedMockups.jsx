import { Link } from "react-router-dom";
import {
  Check, ArrowUp, LayoutDashboard, Calendar, Users, Activity, Zap,
  Shield, Trophy, Target, Sparkles, TrendingUp, Dumbbell, CircleDot,
  ClipboardList, BarChart3,
} from "lucide-react";

const SIDEBAR_NAV = [
  { icon: LayoutDashboard, active: true },
  { icon: Calendar, active: false },
  { icon: Users, active: false },
  { icon: BarChart3, active: false },
  { icon: Zap, active: false },
];

const SESSION_ROWS = [
  { name: "Activación + movilidad", reps: "10 min", done: true, icon: CircleDot },
  { name: "Salto vertical + sprint 20m", reps: "4×6", done: true, icon: TrendingUp },
  { name: "Fuerza unilateral + core", reps: "3×8", done: false, icon: Dumbbell },
  { name: "Core estabilidad + cooldown", reps: "8 min", done: false, icon: Activity },
];

/** Mockup principal estilo Holded — sesión / panel DEPRO (hero, ancho completo) */
export function HoldedHeroMockup() {
  return (
    <div className="relative w-full max-w-[min(1120px,96vw)] mx-auto mt-12 lg:mt-20 px-0 sm:px-2">
      <div className="absolute -inset-10 bg-holded-blue/25 rounded-[3rem] blur-3xl opacity-70" aria-hidden="true" />
      <div className="relative bg-[#f8fafc] rounded-2xl lg:rounded-3xl shadow-[0_50px_100px_-25px_rgba(0,0,0,0.55)] overflow-hidden border border-white/10">
        <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs font-mono text-gray-400 ml-2 flex-1 text-center">app.depro.es/dashboard/sesion</span>
        </div>
        <div className="flex min-h-[400px] lg:min-h-[440px]">
          <div className="w-16 lg:w-[4.5rem] bg-[#0a0e17] py-6 flex flex-col items-center gap-5 shrink-0">
            {SIDEBAR_NAV.map(({ icon: Icon, active }, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  active ? "bg-holded-blue text-white shadow-lg shadow-blue-500/30" : "bg-white/8 text-white/45 hover:text-white/70"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              </div>
            ))}
          </div>
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 p-6 lg:p-8 bg-white min-w-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sesión · Microciclo</p>
                  <h3 className="text-2xl lg:text-[1.65rem] font-black text-gray-900 mt-1 leading-tight">Cadete A · Pretemporada</h3>
                  <p className="text-sm text-gray-500 mt-1.5">Viernes · Protocolo B · Fuerza-Velocidad</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-depro-blue to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                  D
                </div>
              </div>
              <div className="space-y-2.5 mb-5">
                {SESSION_ROWS.map(({ name, reps, done, icon: RowIcon }, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 depro-fade-in"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-holded-green text-white" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                      {done ? <Check size={13} strokeWidth={3} /> : <RowIcon size={13} />}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{name}</span>
                    <span className="text-xs font-bold text-gray-400 tabular-nums">{reps}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400 font-medium">Duración estimada</span>
                <span className="text-2xl font-black text-gray-900 tabular-nums">52 min</span>
              </div>
            </div>
            <div className="w-60 lg:w-72 bg-[#f1f5f9] border-l border-gray-200 p-5 lg:p-6 hidden md:flex flex-col shrink-0">
              <div className="flex gap-1.5 mb-5">
                {["General", "Carga", "Historial"].map((t, i) => (
                  <span key={t} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${i === 0 ? "bg-gray-900 text-white" : "text-gray-400"}`}>{t}</span>
                ))}
              </div>
              <div className="space-y-4 text-sm flex-1">
                <div><p className="text-gray-400 text-xs mb-0.5">Equipo</p><p className="font-bold text-gray-800">Cadete A</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Jugadores</p><p className="font-bold text-gray-800">22 activos</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Carga media RPE</p><p className="font-bold text-holded-green text-lg">6.8 / 10</p></div>
              </div>
              <div className="mt-auto p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <Sparkles size={12} className="depro-pulse-dot" /> Revisada por IA
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">Protocolo validado · 17/07/2026</p>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Adherencia semana</p>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-holded-green rounded-full depro-fill-bar" style={{ width: "85%" }} />
                </div>
                <p className="text-xs font-bold text-gray-600 mt-1.5">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-5 -right-2 lg:right-4 w-28 h-28 rounded-full bg-holded-dark border-4 border-holded-blue flex flex-col items-center justify-center text-center shadow-2xl z-10 mockup-glow-ring">
        <Check size={22} className="text-holded-green mb-1" strokeWidth={3} />
        <span className="text-[9px] font-bold text-white leading-snug px-2">Planificación IA certificada</span>
      </div>
    </div>
  );
}

/** Mini mockup para popup exit-intent */
export function ExitIntentMiniMockup() {
  const bars = [45, 72, 58, 88, 65, 92];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <span className="text-[9px] font-mono text-gray-400 flex-1 text-center">app.depro.es/plan</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-black text-gray-800">Microciclo generado</p>
            <p className="text-[10px] text-gray-400 mt-0.5">3 sesiones · Protocolo A/B/C</p>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 depro-pulse-dot" /> IA activa
          </span>
        </div>
        <div className="flex items-end gap-1 h-14 mb-3">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-blue-100 overflow-hidden flex items-end h-full">
              <div
                className="w-full bg-gradient-to-t from-holded-blue to-blue-400 rounded-t mockup-bar-wave"
                style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Calendar, label: "Sesiones", val: "3/3" },
            { icon: Users, label: "Plantilla", val: "22" },
            { icon: Activity, label: "RPE", val: "6.8" },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="rounded-lg bg-gray-50 border border-gray-100 p-2 text-center">
              <Icon size={12} className="text-holded-blue mx-auto mb-0.5" />
              <p className="text-xs font-black text-gray-800">{val}</p>
              <p className="text-[8px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mockup ingresos / stats estilo Holded contabilidad */
export function HoldedStatsMockup() {
  const bars = [35, 55, 45, 70, 60, 85, 75, 92];
  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-6 w-full max-w-md border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adherencia · Temporada</p>
          <p className="text-3xl font-black text-gray-900 mt-1">87%</p>
        </div>
        <span className="text-xs font-bold text-holded-green bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp size={12} /> 12.4%
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-28 mb-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-holded-green to-emerald-400 mockup-bar-wave"
            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {[
        { label: "Sesiones completadas", val: "156", icon: ClipboardList },
        { label: "Tests registrados", val: "48", icon: Activity },
        { label: "Alertas resueltas", val: "12", icon: Shield },
      ].map(({ label, val, icon: Icon }) => (
        <div key={label} className="flex items-center justify-between py-2.5 border-t border-gray-100 text-sm">
          <span className="text-gray-500 flex items-center gap-2"><Icon size={14} className="text-gray-400" />{label}</span>
          <span className="font-bold text-gray-800 tabular-nums">{val}</span>
        </div>
      ))}
    </div>
  );
}

/** Mockup equipos conectados + widget carga animado */
export function HoldedIntegrationsMockup() {
  const teams = [
    { name: "FC Demo", icon: Shield, color: "from-blue-500 to-blue-600" },
    { name: "Academia", icon: Trophy, color: "from-amber-500 to-orange-500" },
    { name: "Base", icon: Target, color: "from-emerald-500 to-teal-500" },
    { name: "Juvenil", icon: Users, color: "from-violet-500 to-purple-600" },
    { name: "Pro", icon: Zap, color: "from-rose-500 to-red-500" },
    { name: "+50", icon: LayoutDashboard, color: "from-gray-500 to-gray-600" },
  ];
  const barHeights = [40, 65, 50, 80, 70, 90, 75];

  return (
    <div className="relative w-full max-w-xl pb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Equipos conectados</p>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 depro-pulse-dot" /> En vivo
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {teams.map(({ name, icon: Icon, color }) => (
            <div
              key={name}
              className="aspect-square rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 p-2 hover:border-holded-blue/30 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon size={18} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 w-56 lg:w-60 bg-holded-dark rounded-2xl p-5 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-holded-muted font-medium uppercase tracking-wide">Carga media hoy</p>
          <Activity size={14} className="text-holded-green depro-pulse-dot" />
        </div>
        <p className="text-3xl font-black text-white tabular-nums">6.8</p>
        <div className="h-14 mt-3 flex items-end gap-1">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-holded-green to-emerald-400 mockup-bar-wave"
              style={{ height: `${h}%`, animationDelay: `${i * 0.14}s` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-semibold">
          <span className="text-holded-green flex items-center gap-1"><TrendingUp size={10} /> Sesiones 3/3</span>
          <span className="text-holded-muted">RPE ok</span>
        </div>
      </div>
    </div>
  );
}

/** Mockup sesiones flotantes */
export function HoldedFloatingCardsMockup() {
  return (
    <div className="relative w-full max-w-lg h-80 mx-auto">
      <div className="absolute top-6 left-0 right-10 bg-white rounded-xl shadow-lg p-5 border border-gray-100 transform -rotate-2">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-holded-blue" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Sesión S-24011</p>
        </div>
        <p className="text-xl font-black text-depro-blue">Fuerza-Velocidad</p>
        <p className="text-xs text-gray-500 mt-1">Cadete A · 52 min</p>
      </div>
      <div className="absolute top-24 right-0 w-48 bg-white rounded-xl shadow-xl p-5 border border-gray-100 transform rotate-3 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={14} className="text-emerald-500" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Sesión S-24012</p>
        </div>
        <p className="text-xl font-black text-depro-blue">Descarga activa</p>
        <p className="text-xs text-gray-500 mt-1">Juvenil · 45 min</p>
      </div>
      <div className="absolute bottom-0 left-2 right-2 bg-[#f8fafc] rounded-xl border border-gray-200 p-4 shadow-md">
        <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-gray-400 uppercase mb-2">
          <span className="flex items-center gap-1"><Dumbbell size={10} /> Ejercicio</span>
          <span>Series</span><span>Carga</span><span>Total</span>
        </div>
        {[
          { name: "Sentadilla búlgara", s: "3×8", c: "Alta" },
          { name: "Sprint 20m", s: "4×6", c: "Max" },
          { name: "Plancha lateral", s: "3×30s", c: "Media" },
        ].map((row) => (
          <div key={row.name} className="grid grid-cols-4 gap-2 py-2 border-t border-gray-100 text-xs text-gray-700">
            <span className="truncate font-medium">{row.name}</span>
            <span className="tabular-nums">{row.s}</span>
            <span>{row.c}</span>
            <Check size={14} className="text-holded-green" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function HoldedCheckItem({ children, light = false }) {
  return (
    <li className={`flex items-start gap-3 text-sm leading-relaxed ${light ? "text-gray-600" : "text-holded-muted"}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${light ? "bg-blue-50" : "bg-holded-blue/20"}`}>
        <Check size={12} className="text-holded-blue" strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

export function HoldedFeatureSection({ label, title, desc, bullets, mockup, reverse = false, dark = true, ctaLink = "/funcionalidades", ctaText = "Explorar funcionalidad", compact = false }) {
  const bg = dark ? "bg-holded-dark" : "bg-white";
  const titleColor = dark ? "text-white" : "text-gray-900";
  const descColor = dark ? "text-holded-muted" : "text-gray-500";
  const labelColor = dark ? "text-holded-blue-light" : "text-holded-blue";
  const btnClass = dark
    ? "inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors"
    : "inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-800 transition-colors";
  const py = compact ? "py-16 md:py-20" : "py-20 md:py-28";

  return (
    <section className={`${py} ${bg} relative overflow-hidden ${dark ? "border-t border-white/5" : "border-t border-gray-100"}`}>
      {dark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-holded-blue/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px]" />
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {!reverse ? (
            <>
              <div>{mockup}</div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${labelColor}`}>{label}</p>
                <h2 className={`text-3xl md:text-[2.5rem] font-black tracking-tight mb-5 leading-tight ${titleColor}`}>{title}</h2>
                <p className={`leading-relaxed mb-6 ${descColor}`}>{desc}</p>
                <ul className="space-y-4 mb-8">{bullets.map((b) => <HoldedCheckItem key={b} light={!dark}>{b}</HoldedCheckItem>)}</ul>
                <Link to={ctaLink} className={btnClass}>{ctaText} →</Link>
              </div>
            </>
          ) : (
            <>
              <div className="lg:order-2">{mockup}</div>
              <div className="lg:order-1">
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${labelColor}`}>{label}</p>
                <h2 className={`text-3xl md:text-[2.5rem] font-black tracking-tight mb-5 leading-tight ${titleColor}`}>{title}</h2>
                <p className={`leading-relaxed mb-6 ${descColor}`}>{desc}</p>
                <ul className="space-y-4 mb-8">{bullets.map((b) => <HoldedCheckItem key={b} light={!dark}>{b}</HoldedCheckItem>)}</ul>
                <Link to={ctaLink} className={btnClass}>{ctaText} →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function ScrollToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/60 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors hidden md:flex"
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  );
}
