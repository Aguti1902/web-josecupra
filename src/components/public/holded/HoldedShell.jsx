import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, ChevronDown, ChevronRight, ArrowRight,
  Calendar, Activity, Users, BarChart3, Brain, Building2, User,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../shared/LanguageSwitcher";
import { HoldedHeroMockup, GoogleIcon, ExitIntentMiniMockup } from "./HoldedMockups";
import WebsiteAssistantWidget from "./WebsiteAssistantWidget";

const MEGA_PRODUCTS = [
  { label: "Planificación", to: "/funcionalidades/planificacion", badge: "TOP", icon: Calendar },
  { label: "Control de carga", to: "/funcionalidades/cargas", badge: "TOP", icon: Activity },
  { label: "Tests físicos", to: "/funcionalidades/tests", icon: BarChart3 },
  { label: "Plantilla", to: "/funcionalidades/plantilla", icon: Users },
  { label: "Periodización", to: "/funcionalidades/planificacion", icon: Brain },
  { label: "DEPRO Coach", to: "/para-entrenadores", icon: User },
  { label: "DEPRO Club", to: "/para-clubs", icon: Building2 },
];

const MEGA_OTHER = [
  { label: "Inteligencia artificial", to: "/funcionalidades#ia", badge: "NUEVO" },
  { label: "Ranking jugadores", to: "/para-jugadores" },
  { label: "Integraciones GPS", to: "/recursos" },
  { label: "Biblioteca ejercicios", to: "/funcionalidades" },
  { label: "White-label club", to: "/para-clubs" },
  { label: "Export PDF", to: "/funcionalidades" },
  { label: "Modo offline", to: "/recursos" },
];

const NAV_MAIN = [
  { label: "Funcionalidades", mega: true },
  { label: "Para clubs", to: "/para-clubs" },
  { label: "Entrenadores", to: "/para-entrenadores" },
  { label: "Jugadores", to: "/para-jugadores" },
  { label: "Recursos", to: "/recursos" },
  { label: "Precios", to: "/precios" },
];

/* ── Exit intent modal (estilo Holded split) ─────────────────── */
export function ExitIntentModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row md:min-h-[520px] animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 md:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-800 md:text-white/70 md:hover:text-white">
          <X size={18} />
        </button>
        {/* Left — testimonial + mockup animado */}
        <div className="md:w-[45%] bg-[#f7f8fa] p-8 flex flex-col justify-between min-h-[280px] md:min-h-0">
          <div>
            <ExitIntentMiniMockup />
            <p className="text-sm text-gray-600 leading-relaxed italic mt-5">
              &ldquo;Pasamos de Excel a tener el microciclo generado en minutos. Los jugadores ven su carga en el móvil.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200/80">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-md">MT</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Marc T.</p>
              <p className="text-xs text-gray-500">Entrenador Sub-16</p>
            </div>
          </div>
        </div>
        {/* Right — offer */}
        <div className="md:w-[55%] bg-holded-dark p-8 md:p-10 text-white flex flex-col justify-center md:min-h-[520px]">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-holded-blue-light mb-4">
            <span className="w-2 h-2 rounded-full bg-holded-blue animate-pulse" /> Prueba gratuita
          </span>
          <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
            Prueba DEPRO sin tarjeta
          </h2>
          <p className="text-holded-muted text-sm mb-6">Y acceso completo a planificación IA, cargas y tests.</p>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-holded-muted mb-1">Plan Coach Pro</p>
            <p className="text-3xl font-black text-holded-blue-light">0 € <span className="text-base text-holded-muted font-medium">/ prueba</span></p>
            <p className="text-xs text-holded-muted mt-1">Después desde 14,99 €/mes</p>
          </div>
          <Link
            to="/comprar"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-3.5 rounded-full hover:bg-gray-100 transition-colors mb-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Quiero mi prueba gratis <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/5 transition-colors text-sm"
          >
            <GoogleIcon size={16} /> Continuar con Google
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-[11px] text-holded-muted">
            {["Sin tarjeta de crédito", "Listo en 2 minutos", "Cancela cuando quieras"].map((t) => (
              <span key={t} className="flex items-center gap-1"><Check size={10} className="text-holded-blue-light" /> {t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom sticky bar ───────────────────────────────────────── */
function BottomStickyBar({ onClose }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl">
      <div className="flex items-center gap-3 bg-holded-dark/95 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 shadow-2xl">
        <div className="flex -space-x-2 shrink-0">
          {["MT", "LV", "DR"].map((initials, i) => (
            <div key={initials} className="w-8 h-8 rounded-full bg-gradient-to-br from-holded-blue to-indigo-600 border-2 border-holded-dark flex items-center justify-center text-[10px] font-bold text-white" style={{ zIndex: 3 - i }}>
              {initials}
            </div>
          ))}
        </div>
        <p className="text-white text-xs sm:text-sm font-medium flex-1 min-w-0 truncate hidden sm:block">
          Mira todo lo que DEPRO puede hacer por ti
        </p>
        <Link to="/comprar" className="text-xs font-bold bg-white text-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 whitespace-nowrap shrink-0">
          Prueba gratis
        </Link>
        <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white shrink-0"><X size={16} /></button>
      </div>
    </div>
  );
}

/* ── Asistente web (chatbot) ─────────────────────────────────── */

/* ── Top promo bar ───────────────────────────────────────────── */
function TopBar() {
  return (
    <div className="bg-holded-topbar text-white text-center text-xs sm:text-sm py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
      <span>
        Empieza ahora y prueba <strong className="underline underline-offset-2">15 días gratis</strong> sin tarjeta
      </span>
      <span className="hidden sm:inline text-white/40">|</span>
      <a href="mailto:ventas@depro.es" className="text-white/90 hover:text-white font-medium">
        Contacta con Ventas · ventas@depro.es
      </a>
    </div>
  );
}

/* ── Navbar ──────────────────────────────────────────────────── */
function HoldedNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef(null);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const fn = (e) => { if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="sticky top-0 z-[70] bg-holded-dark/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo blanco.png" alt="DEPRO" className="h-6 md:h-7 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" ref={megaRef}>
            {NAV_MAIN.map((item) =>
              item.mega ? (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setMegaOpen(!megaOpen)}
                    className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {item.label} <ChevronDown size={14} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                  </button>
                  {megaOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
                      <div className="grid grid-cols-2 gap-0 p-2">
                        <div className="p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">Productos</p>
                          {MEGA_PRODUCTS.map(({ label, to, badge, icon: Icon }) => (
                            <Link key={label} to={to} onClick={() => setMegaOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                              <Icon size={16} className="text-gray-400 group-hover:text-holded-blue" />
                              <span className="text-sm font-medium text-gray-800 flex-1">{label}</span>
                              {badge && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{badge}</span>}
                            </Link>
                          ))}
                        </div>
                        <div className="p-4 border-l border-gray-100">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">Otras funcionalidades</p>
                          {MEGA_OTHER.map(({ label, to, badge }) => (
                            <Link key={label} to={to} onClick={() => setMegaOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                              {label}
                              {badge && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 ml-auto">{badge}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Link to="/funcionalidades" onClick={() => setMegaOpen(false)} className="block text-center py-3 bg-gray-50 text-sm font-bold text-gray-600 hover:text-holded-blue border-t border-gray-100">
                        Todas las funcionalidades →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} to={item.to} className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname === item.to ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher light compact />
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white px-3 py-2">{t("nav.login")}</Link>
            <Link to="/comprar" className="text-sm font-bold bg-white text-gray-900 px-5 py-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1">
              Prueba gratis <ArrowRight size={14} />
            </Link>
          </div>

          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white/70 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-holded-dark border-t border-white/10 px-4 py-4 space-y-1">
          {NAV_MAIN.filter((n) => !n.mega).map((item) => (
            <Link key={item.label} to={item.to} className="block text-white/80 font-medium py-3 px-3 rounded-xl hover:bg-white/5">{item.label}</Link>
          ))}
          <Link to="/funcionalidades" className="block text-white/80 font-medium py-3 px-3 rounded-xl hover:bg-white/5">Funcionalidades</Link>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link to="/login" className="text-center py-2.5 text-white/70">Iniciar sesión</Link>
            <Link to="/comprar" className="text-center py-3 bg-white text-gray-900 font-bold rounded-full">Prueba gratis</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Footer ────────────────────────────────────────────────── */
export function HoldedFooter() {
  return (
    <footer className="bg-holded-dark text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Prueba DEPRO gratis durante 15 días</h2>
          <p className="text-holded-muted mb-8">Sin tarjeta de crédito. Sin compromiso. Cancela cuando quieras.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/comprar" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
              Empezar ahora gratis <ArrowRight size={16} />
            </Link>
            <Link to="/precios" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/5">
              Ver precios
            </Link>
          </div>
          <div className="flex justify-center gap-6 mt-5 text-xs text-holded-muted">
            <span className="flex items-center gap-1"><Check size={12} className="text-holded-blue" /> Sin tarjeta</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 pt-12 border-t border-white/10">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo blanco.png" alt="DEPRO" className="h-6 mb-4" />
            <p className="text-xs text-holded-muted leading-relaxed">Preparación física inteligente para entrenadores, clubs y jugadores.</p>
          </div>
          {[
            { title: "Acceso rápido", links: [["Prueba gratis", "/comprar"], ["Iniciar sesión", "/login"], ["Precios", "/precios"]] },
            { title: "Funcionalidades", links: [["Planificación", "/funcionalidades/planificacion"], ["Cargas", "/funcionalidades/cargas"], ["Tests", "/funcionalidades/tests"], ["IA deportiva", "/funcionalidades#ia"]] },
            { title: "Perfiles", links: [["Para clubs", "/para-clubs"], ["Entrenadores", "/para-entrenadores"], ["Jugadores", "/para-jugadores"]] },
            { title: "Recursos", links: [["Blog", "/recursos"], ["Documentación", "/recursos"], ["Contacto", "/recursos#contacto"]] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link to={href} className="text-sm text-holded-muted hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-holded-muted">
          <p>© {new Date().getFullYear()} DEPRO. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Shell principal ─────────────────────────────────────────── */
export default function HoldedShell({ children, showBottomBar = true }) {
  const [exitOpen, setExitOpen] = useState(false);
  const [bottomBar, setBottomBar] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("depro_exit_intent_dismissed")) return;

    const handleLeave = (e) => {
      if (e.clientY <= 5) {
        setExitOpen(true);
        sessionStorage.setItem("depro_exit_intent_dismissed", "1");
        document.documentElement.removeEventListener("mouseleave", handleLeave);
      }
    };

    const timer = setTimeout(() => {
      document.documentElement.addEventListener("mouseleave", handleLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const closeExit = () => {
    setExitOpen(false);
    sessionStorage.setItem("depro_exit_intent_dismissed", "1");
  };

  return (
    <div className="min-h-screen bg-holded-dark text-white">
      <TopBar />
      <HoldedNavbar />
      <main>{children}</main>
      <HoldedFooter />
      {showBottomBar && bottomBar && <BottomStickyBar onClose={() => setBottomBar(false)} />}
      <WebsiteAssistantWidget />
      <ExitIntentModal open={exitOpen} onClose={closeExit} />
    </div>
  );
}

/* ── Hero reutilizable ───────────────────────────────────────── */
export function HoldedHero({ subtitle = "El software todo en uno para el deporte" }) {
  return (
    <section className="relative pt-12 pb-4 md:pt-16 md:pb-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 bg-holded-blue/20 border border-holded-blue/30 text-holded-blue-light text-xs font-bold px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-holded-blue-light" />
          {subtitle}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black text-white tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto">
          Preparación física y mucho más<span className="text-depro-red">.</span>
        </h1>
        <p className="text-lg text-holded-muted max-w-2xl mx-auto leading-relaxed mb-8">
          DEPRO es la plataforma en la nube con todo lo que necesitas para planificar, monitorizar y optimizar el rendimiento — entrenadores, clubs y jugadores — desde cualquier lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link to="/comprar" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            Prueba gratis 15 días
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors">
            <GoogleIcon /> Empezar gratis con Google
          </Link>
        </div>
        <p className="text-xs text-holded-muted mb-2">Sin tarjeta de crédito · Cancela cuando quieras</p>
      </div>
      <div className="relative max-w-[min(1200px,98vw)] mx-auto px-2 sm:px-4">
        <HoldedHeroMockup />
      </div>
    </section>
  );
}

/* ── Stats + clubes (unificado) ──────────────────────────────── */
export function HoldedStatsBand() {
  const stats = [
    { val: "3", label: "Perfiles en uno", accent: "text-holded-blue-light" },
    { val: "90+", label: "Ejercicios en biblioteca", accent: "text-white" },
    { val: "100%", label: "Planificación automática", accent: "text-white" },
    { val: "40h", label: "Ahorradas al mes", accent: "text-holded-blue-light" },
    { val: "160×", label: "Más rápido planificando", accent: "text-white" },
    { val: "85%", label: "Adherencia media", accent: "text-holded-blue-light" },
  ];

  return (
    <section className="relative pt-4 pb-8 md:pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-holded-muted mb-10 font-medium">
          Entrenadores, clubs y jugadores ya optimizan su rendimiento con DEPRO
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 mb-14">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-2">
              <p className={`text-2xl sm:text-3xl md:text-4xl font-black tabular-nums ${s.accent}`}>{s.val}</p>
              <p className="text-[11px] sm:text-xs text-holded-muted mt-1.5 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-14 opacity-35 mb-2">
          {["FC BARCELONA ACADEMY", "REAL SOCCER", "ACADEMIA PRO", "BASE SPORT", "ELITE FC"].map((logo) => (
            <span key={logo} className="text-[10px] sm:text-xs font-black tracking-widest text-white whitespace-nowrap">{logo}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** @deprecated Usar HoldedStatsBand */
export function HoldedPlatformBand() {
  return <HoldedStatsBand />;
}

/* ── Product grid 6 cards ────────────────────────────────────── */
export function HoldedProductGrid({ dark = true }) {
  const products = [
    { icon: Calendar, title: "Planificación", desc: "Microciclos y mesociclos automáticos con sesiones A/B/C.", to: "/funcionalidades/planificacion" },
    { icon: Activity, title: "Control de carga", desc: "RPE, wellness y alertas de sobrecarga por jugador.", to: "/funcionalidades/cargas" },
    { icon: BarChart3, title: "Tests físicos", desc: "Batería T1→T3 con seguimiento longitudinal.", to: "/funcionalidades/tests" },
    { icon: Users, title: "Plantilla", desc: "Ficha completa, lesiones, posición y código de club.", to: "/funcionalidades/plantilla" },
    { icon: Brain, title: "IA deportiva", desc: "Motores de reglas validados, no caja negra.", to: "/funcionalidades#ia" },
    { icon: Building2, title: "DEPRO Club", desc: "Multi-equipo, white-label y panel coordinador.", to: "/para-clubs" },
  ];
  return (
    <section className={dark ? "py-20 md:py-28 bg-holded-dark relative border-t border-white/5" : "py-20 md:py-28 bg-white relative border-t border-gray-100"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Seis productos. Una plataforma. Cero complicaciones.</h2>
          <p className={dark ? "text-holded-muted" : "text-gray-500"}>Desde tu primer microciclo hasta la gestión completa de un club · DEPRO se adapta a tu rol.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(({ icon: Icon, title, desc, to }) => (
            <Link
              key={title}
              to={to}
              className={dark
                ? "group relative bg-holded-card/80 border border-white/8 rounded-2xl p-6 hover:border-holded-blue/40 hover:bg-holded-card transition-all overflow-hidden"
                : "group relative bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all overflow-hidden"}
            >
              <div className={`absolute top-4 right-4 transition-opacity ${dark ? "opacity-5 group-hover:opacity-10" : "opacity-[0.04] group-hover:opacity-[0.08]"}`}>
                <Icon size={80} className={dark ? "text-white" : "text-holded-blue"} />
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${dark ? "bg-holded-blue/20" : "bg-holded-blue/10"}`}>
                <Icon size={20} className={dark ? "text-holded-blue-light" : "text-holded-blue"} />
              </div>
              <h3 className={`font-black text-lg mb-2 ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${dark ? "text-holded-muted" : "text-gray-500"}`}>{desc}</p>
              <span className={`text-sm font-bold group-hover:gap-2 inline-flex items-center gap-1 transition-all ${dark ? "text-holded-blue-light" : "text-holded-blue"}`}>
                Explorar {title.toLowerCase()} <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
