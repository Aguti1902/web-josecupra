import {
  ArrowRight, BarChart3, Brain, Building2, Calendar, CheckCircle2,
  ChevronRight, Clock, Shield, Sparkles, Target, TrendingUp, Users, Zap,
} from "lucide-react";
import { PitchNav, PitchFooter } from "./PitchLayout";
import AnimatedFeatureShowcase, { HeroAnimatedDemo } from "./AnimatedFeatureShowcase";
import {
  PALMEIRAS, DEPRO_ACCENT, DEPRO_LOGO, NEXGENT_LOGO, nexgentUrl,
} from "../../../lib/nexgentConfig";

const ACCENT = DEPRO_ACCENT;
const CLUB_ACCENT = PALMEIRAS.accent;

const COMPARE_ROWS = [
  { label: "White-label con logo y colores del club", depro: true, sheets: false, generic: false },
  { label: "Periodización meso/microciclo", depro: true, sheets: "partial", generic: false },
  { label: "Tests físicos T1→T2→T3 con ratings", depro: true, sheets: false, generic: "addon" },
  { label: "Import GPS + clasificación IA", depro: true, sheets: false, generic: false },
  { label: "Sesiones con diagrama IA (SVG)", depro: true, sheets: false, generic: false },
  { label: "PDF de sesión con branding", depro: true, sheets: false, generic: "limited" },
  { label: "Chat staff + resumen IA", depro: true, sheets: false, generic: false },
  { label: "Scouting integrado", depro: true, sheets: false, generic: "limited" },
  { label: "Multi-equipo y multi-categoría", depro: true, sheets: true, generic: "limited" },
];

const ADVANTAGES = [
  { icon: Brain, title: "IA que entiende fútbol", desc: "Diagramas tácticos, clasificación de carga y resúmenes del staff en lenguaje natural — no hojas de cálculo con fórmulas." },
  { icon: Zap, title: "Cero fricción con vuestro GPS", desc: "Catapult, STATSports, Polar, WIMU… importáis el CSV y la plataforma mapea columnas automáticamente." },
  { icon: Shield, title: "White-label real", desc: "Palmeiras en cada pantalla. Jugadores, familias y staff ven al club — no un SaaS genérico." },
  { icon: BarChart3, title: "Un solo cerebro de datos", desc: "Rendimiento, salud, planificación y scouting conectados. Sin duplicar datos entre Excel, WhatsApp y apps sueltas." },
  { icon: Target, title: "Periodización DEPRO", desc: "Mesociclos, microciclos, tests y adherencia al plan — la base operativa que ya usan clubes en producción." },
  { icon: Sparkles, title: "NexGent encima", desc: "Capa de IA y módulos pro (chat, scouting avanzado, dirección deportiva) que elevan lo que DEPRO ya hace bien." },
];

function CompareCell({ value }) {
  if (value === true) return <CheckCircle2 size={18} className="text-green-500 mx-auto" />;
  if (value === false) return <span className="text-gray-300">—</span>;
  const label = value === "partial" ? "Parcial" : value === "addon" ? "Extra $" : "Limitado";
  return <span className="text-xs font-bold text-amber-600 capitalize">{label}</span>;
}

function ExternalCta({ href, className, style, children }) {
  if (!href) return null;
  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
}

export default function NexGentPitchLanding() {
  const demoUrl = nexgentUrl("/app/inicio");
  const slidesUrl = nexgentUrl("/presentacion");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PitchNav />

      <section id="overview" className="pt-28 pb-16 md:pt-32 md:pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src={NEXGENT_LOGO} alt="NexGent" className="h-10 object-contain" />
                <span className="text-gray-300 text-xl">×</span>
                <img src={DEPRO_LOGO} alt="DEPRO" className="h-8 object-contain" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Alianza estratégica · Clubes profesionales
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.05] text-gray-900 mb-6">
                El software más completo para clubes de fútbol profesional
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                <strong className="text-gray-900">NexGent</strong> y <strong className="text-gray-900">DEPRO</strong> unen IA, GPS, periodización, tests físicos, scouting y white-label en una sola plataforma — pensada para el staff, no para IT.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <ExternalCta
                  href={demoUrl}
                  className="inline-flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-lg transition-colors hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  Ver demo Palmeiras <ArrowRight size={18} />
                </ExternalCta>
                <a href="#plataforma" className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-6 py-3.5 rounded-lg transition-colors">
                  Explorar capacidades
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[
                  { v: "10+", l: "Módulos integrados" },
                  { v: "IA", l: "Sesiones · Carga · Chat" },
                  { v: "100%", l: "White-label club" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-black text-gray-900">{s.v}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <HeroAnimatedDemo />
          </div>
        </div>
      </section>

      <section id="alianza" className="py-16 border-b border-gray-100 bg-depro-blue-light/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Transparencia total</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">NexGent + DEPRO = una sola plataforma</h2>
            <p className="text-gray-600 leading-relaxed">
              No es un rebrand ni un plugin. Es una alianza donde cada empresa aporta lo suyo: DEPRO la base operativa probada en clubes; NexGent la capa de inteligencia y módulos de élite.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <img src={NEXGENT_LOGO} alt="NexGent" className="h-12 mb-4 object-contain" />
              <h3 className="font-black text-lg mb-2">NexGent</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {["IA táctica: texto → diagrama SVG", "Clasificación inteligente de carga GPS", "Chat del staff con resumen IA", "Scouting, dirección deportiva, cantera"].map((t) => (
                  <li key={t} className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <img src={DEPRO_LOGO} alt="DEPRO" className="h-10 mb-4 object-contain" />
              <h3 className="font-black text-lg mb-2">DEPRO</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {["Periodización meso/microciclo", "Tests físicos con ratings automáticos", "White-label: logo, colores, equipos", "PDFs de sesión y adherencia al plan"].map((t) => (
                  <li key={t} className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="palmeiras" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Demo en vivo</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Así se ve con {PALMEIRAS.shortName}</h2>
            <p className="text-gray-600 leading-relaxed">
              El dashboard demo replica el diseño DEPRO real — sidebar claro, banner del club, cards de entrenador — con los colores verde y oro de Palmeiras.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="w-14 h-14 rounded-xl border border-gray-200 bg-white p-1.5 object-contain" />
                <div>
                  <h3 className="text-xl font-black">{PALMEIRAS.name}</h3>
                  <p className="text-sm text-gray-500">{PALMEIRAS.city} · {PALMEIRAS.category}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Users, label: "Jugadores", value: String(PALMEIRAS.players) },
                  { icon: Building2, label: "Equipos", value: String(PALMEIRAS.teams) },
                  { icon: Calendar, label: "Entrenamientos", value: PALMEIRAS.trainingDays },
                  { icon: Target, label: "Staff técnico", value: `${PALMEIRAS.coaches} entrenadores` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <item.icon size={18} className="flex-shrink-0" style={{ color: CLUB_ACCENT }} />
                    <div>
                      <div className="text-xs text-gray-400 font-semibold">{item.label}</div>
                      <div className="font-bold text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <ExternalCta
                href={demoUrl}
                className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: CLUB_ACCENT }}
              >
                Abrir dashboard Palmeiras <ChevronRight size={16} />
              </ExternalCta>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">Snapshot jugador</div>
                <div className="font-black text-gray-900 mb-1">Estêvão · ED · #10</div>
                <div className="text-xs text-gray-500 mb-4">Sub-20 · Semana 24</div>
                <div className="space-y-2 text-xs">
                  {[
                    { t: "Resistencia T3", v: "8.4", r: "+9% vs media" },
                    { t: "Sprint 30m", v: "3.92s", r: "Top 3 plantilla" },
                    { t: "Carga GPS", v: "2.665 AU", r: "Óptima" },
                  ].map((m) => (
                    <div key={m.t} className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{m.t}</span>
                      <span className="font-bold text-gray-800 text-right">{m.v}<br /><span className="text-green-600 font-semibold">{m.r}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="text-xs font-bold text-green-700 uppercase mb-2">Resultado dirección</div>
                <p className="text-sm text-green-900 leading-relaxed">&quot;Por fin tenemos rendimiento, planificación y scouting en un solo sitio — con la cara de Palmeiras.&quot;</p>
                <p className="text-xs text-green-700 mt-2 font-semibold">Dirección deportiva · Demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plataforma" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Plataforma completa</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Todo lo que puede hacer el software</h2>
            <p className="text-gray-600 leading-relaxed">
              Cada módulo con demo animada. Clic en la lista para ver cómo funciona — igual que en la presentación DEPRO para clubes.
            </p>
          </div>
          <AnimatedFeatureShowcase />
        </div>
      </section>

      <section id="ventajas" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Ventajas competitivas</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Por qué NexGent × DEPRO gana</h2>
            <p className="text-gray-600 leading-relaxed">Frente a Excel, WhatsApp y plataformas genéricas que no entienden el día a día del staff.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${ACCENT}15` }}>
                  <Icon size={22} style={{ color: ACCENT }} />
                </div>
                <h3 className="font-black text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comparativa" className="py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Comparativa</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">NexGent × DEPRO vs alternativas</h2>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-bold text-gray-700">Capacidad</th>
                  <th className="p-4 font-bold text-center" style={{ color: ACCENT }}>NexGent × DEPRO</th>
                  <th className="p-4 font-bold text-center text-gray-500">Excel / Sheets</th>
                  <th className="p-4 font-bold text-center text-gray-500">SaaS genérico</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100 last:border-0">
                    <td className="p-4 text-gray-700">{row.label}</td>
                    <td className="p-4 text-center bg-blue-50/50"><CompareCell value={row.depro} /></td>
                    <td className="p-4 text-center"><CompareCell value={row.sheets} /></td>
                    <td className="p-4 text-center"><CompareCell value={row.generic} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Flujo de trabajo</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">De la planificación al campo</h2>
            <p className="text-gray-400 leading-relaxed">Cuatro pasos que el staff ya conoce — digitalizados y conectados.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: "01", title: "Planificar", desc: "Mesociclo y microciclo por equipo. Sesiones asignadas por día.", icon: Calendar },
              { n: "02", title: "Preparar", desc: "Sesiones IA, PDF con logo del club, tests y calentamientos.", icon: Target },
              { n: "03", title: "Monitorizar", desc: "GPS importado, semáforo de carga, chat staff y alertas médicas.", icon: TrendingUp },
              { n: "04", title: "Decidir", desc: "Scouting, KPIs de dirección y readaptación en una sola vista.", icon: BarChart3 },
            ].map(({ n, title, desc, icon: Icon }) => (
              <div key={n} className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                <div className="text-xs font-black text-green-400 mb-2">{n}</div>
                <Icon size={24} className="text-white mb-3" />
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(slidesUrl || demoUrl) && (
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <img src={NEXGENT_LOGO} alt="NexGent" className="h-12 object-contain" />
              <span className="text-gray-300 text-2xl">×</span>
              <img src={DEPRO_LOGO} alt="DEPRO" className="h-10 object-contain" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">¿Listo para verlo en acción?</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Explora la demo interactiva con Palmeiras o revisa la presentación completa diapositiva a diapositiva.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ExternalCta
                href={slidesUrl}
                className="inline-flex items-center gap-2 w-full sm:w-auto justify-center border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-colors"
              >
                Ver presentación más completa por diapositivas <ArrowRight size={20} />
              </ExternalCta>
              <ExternalCta
                href={demoUrl}
                className="inline-flex items-center gap-2 w-full sm:w-auto justify-center text-white font-black px-8 py-4 rounded-xl shadow-depro hover:opacity-90 transition-opacity"
                style={{ backgroundColor: ACCENT }}
              >
                Ver la demo <ArrowRight size={20} />
              </ExternalCta>
            </div>
            <p className="text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
              <Clock size={14} /> Demo Palmeiras · Sin registro · Datos de ejemplo
            </p>
          </div>
        </section>
      )}

      <PitchFooter />
    </div>
  );
}
