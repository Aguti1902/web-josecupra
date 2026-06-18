import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DEPRO_LOGO, NEXGENT_LOGO } from "../../../lib/nexgentConfig";

const NAV = [
  { id: "alianza", label: "Alianza" },
  { id: "palmeiras", label: "Palmeiras" },
  { id: "plataforma", label: "Plataforma" },
  { id: "ventajas", label: "Ventajas" },
  { id: "comparativa", label: "Comparativa" },
];

export function PitchNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/nexgent" className="flex items-center gap-3">
          <img src={DEPRO_LOGO} alt="DEPRO" className="h-7 w-auto" />
          <span className="hidden sm:inline text-gray-300">×</span>
          <img src={NEXGENT_LOGO} alt="NexGent" className="hidden sm:block h-6 w-auto object-contain" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => scrollTo(id)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-1">
          {NAV.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => scrollTo(id)} className="block w-full text-left py-2.5 text-sm font-medium text-gray-600">{label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

export function PitchFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto pb-8 border-b border-gray-200">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src={NEXGENT_LOGO} alt="NexGent" className="h-14 md:h-20 w-auto object-contain" />
            <span className="text-2xl text-gray-300 font-light">×</span>
            <img src={DEPRO_LOGO} alt="DEPRO" className="h-10 md:h-14 w-auto object-contain" />
          </div>
          <p className="text-sm md:text-base font-bold text-gray-900 leading-snug">
            <strong>NexGent</strong> y <strong>DEPRO</strong> se han unido para crear el software más completo a nivel de clubes de fútbol profesional.
          </p>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            NexGent aporta inteligencia artificial, integración GPS y módulos avanzados de rendimiento. DEPRO aporta periodización, tests físicos, white-label y la experiencia operativa de cientos de clubes.
          </p>
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} NexGent × DEPRO · Demo comercial · Palmeiras
        </p>
      </div>
    </footer>
  );
}
