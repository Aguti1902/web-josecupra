import { Link } from "react-router-dom";
import { ArrowRight, Brain, CheckCircle2, Shield, Sparkles, Target } from "lucide-react";

const ACCENT = "#0A36F7";
const DEPRO_LOGO = "/logo.png";
const NEXGENT_LOGO = "/LOGO NEXGENT.png";
const PALMEIRAS_LOGO = "/Palmeiras_logo.svg.png";

/** URL pública de la app NexGent (Vercel). Configurar VITE_NEXGENT_URL en producción. */
const NEXGENT_BASE = (import.meta.env.VITE_NEXGENT_URL || "").replace(/\/$/, "");

const HIGHLIGHTS = [
  { icon: Brain, text: "IA táctica, clasificación GPS y resúmenes del staff en lenguaje natural" },
  { icon: Target, text: "Periodización DEPRO, tests físicos y PDFs de sesión con branding del club" },
  { icon: Shield, text: "White-label completo — Palmeiras, Cornellà o tu escudo en cada pantalla" },
  { icon: Sparkles, text: "Chat del staff, scouting, cantera y dirección deportiva en un solo cerebro" },
];

export default function NexGentLauncherPage() {
  const pitchUrl = NEXGENT_BASE || null;
  const slidesUrl = pitchUrl ? `${pitchUrl}/presentacion` : null;
  const demoUrl = pitchUrl ? `${pitchUrl}/app/inicio` : null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
            ← DEPRO
          </Link>
          <div className="flex items-center gap-3">
            <img src={DEPRO_LOGO} alt="DEPRO" className="h-6 w-auto" />
            <span className="text-gray-300">×</span>
            <img src={NEXGENT_LOGO} alt="NexGent" className="h-5 w-auto object-contain" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-5 md:gap-8 mb-10">
            <img src={NEXGENT_LOGO} alt="NexGent" className="h-14 md:h-20 w-auto object-contain" />
            <span className="text-2xl md:text-3xl text-gray-300 font-light">×</span>
            <img src={DEPRO_LOGO} alt="DEPRO" className="h-11 md:h-16 w-auto object-contain" />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
            Alianza estratégica · Clubes profesionales
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-gray-900 mb-6">
            El software más completo para clubes de fútbol profesional
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            <strong className="text-gray-900">NexGent</strong> y <strong className="text-gray-900">DEPRO</strong> se han unido para
            ofrecer periodización, tests, GPS, IA táctica, scouting y white-label en una sola plataforma — pensada para el
            staff, no para IT.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${ACCENT}12` }}
              >
                <Icon size={18} style={{ color: ACCENT }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pt-1">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm mb-12 flex flex-col sm:flex-row items-center gap-6">
          <img src={PALMEIRAS_LOGO} alt="Palmeiras" className="w-16 h-16 object-contain flex-shrink-0" />
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Demo en vivo</p>
            <h2 className="text-xl font-black text-gray-900 mb-1">Sociedade Esportiva Palmeiras</h2>
            <p className="text-sm text-gray-600">
              Dashboard con colores del club, sidebar DEPRO, sesiones IA, cargas GPS y scouting — datos de ejemplo listos para reunión comercial.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {slidesUrl ? (
            <a
              href={slidesUrl}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-colors"
            >
              Ver presentación por diapositivas <ArrowRight size={20} />
            </a>
          ) : (
            <span className="text-sm text-gray-400 text-center px-4">
              Configura <code className="text-xs bg-gray-100 px-1 rounded">VITE_NEXGENT_URL</code> para enlazar la demo interactiva.
            </span>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-white font-black px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}
            >
              Ver demo Palmeiras <ArrowRight size={20} />
            </a>
          )}
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          {["10+ módulos", "IA integrada", "100% white-label", "Compatible Catapult · STATSports · Polar"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-green-500" />
              {t}
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} NexGent × DEPRO
      </footer>
    </div>
  );
}
