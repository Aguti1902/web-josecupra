import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { DEPRO_LOGO, NEXGENT_LOGO, nexgentUrl } from "../../../lib/nexgentConfig";
import NexGentPitchLanguageSwitcher, { initNexGentPitchLanguage } from "./NexGentPitchLanguageSwitcher";

const NAV_KEYS = [
  { id: "alianza", key: "nav.alliance" },
  { id: "palmeiras", key: "nav.palmeiras" },
  { id: "plataforma", key: "nav.platform" },
  { id: "ventajas", key: "nav.advantages" },
  { id: "roadmap", key: "nav.roadmap" },
  { id: "comparativa", key: "nav.compare" },
  { id: "comisiones", key: "nav.commission" },
];

export function PitchNav() {
  const { t, i18n } = useTranslation("nexgentPitch");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const demoUrl = nexgentUrl("/app/inicio");

  useEffect(() => {
    initNexGentPitchLanguage(i18n);
  }, [i18n]);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/nexgent" className="flex-shrink-0 text-sm font-black text-gray-900 hover:text-blue-600 transition-colors">
          NexGent <span className="text-gray-300 font-light mx-1">×</span> DEPRO
        </Link>
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_KEYS.map(({ id, key }) => (
            <button key={id} type="button" onClick={() => scrollTo(id)} className="px-2.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
              {t(key)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 flex-shrink-0">
          <NexGentPitchLanguageSwitcher />
          {demoUrl && (
            <a href={demoUrl} className="hidden md:inline-flex text-xs font-bold text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: "#0A36F7" }}>
              {t("nav.demo")}
            </a>
          )}
          <button type="button" className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-1">
          {NAV_KEYS.map(({ id, key }) => (
            <button key={id} type="button" onClick={() => scrollTo(id)} className="block w-full text-left py-2.5 text-sm font-medium text-gray-600">{t(key)}</button>
          ))}
          {demoUrl && (
            <a href={demoUrl} className="block py-2.5 text-sm font-bold text-blue-600">{t("nav.demo")}</a>
          )}
        </div>
      )}
    </header>
  );
}

export function PitchFooter() {
  const { t } = useTranslation("nexgentPitch");
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto pb-8 border-b border-gray-200">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src={NEXGENT_LOGO} alt="NexGent" className="h-16 md:h-24 w-auto object-contain" />
            <span className="text-2xl text-gray-300 font-light">×</span>
            <img src={DEPRO_LOGO} alt="DEPRO" className="h-12 md:h-16 w-auto object-contain" />
          </div>
          <p className="text-sm md:text-base font-bold text-gray-900 leading-snug">{t("footer.headline")}</p>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{t("footer.desc")}</p>
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
