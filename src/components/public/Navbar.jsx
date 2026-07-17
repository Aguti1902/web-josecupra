import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../shared/LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { label: "Producto", href: "#producto" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "IA", href: "#ia" },
    { label: "Precios", href: "#precios" },
    { label: "Vídeo", href: "#video" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-depro-border"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="DEPRO"
              className="h-7 md:h-8 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-depro-gray hover:text-depro-dark px-4 py-2 rounded-lg hover:bg-depro-gray-light transition-all"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="text-sm font-medium text-depro-dark hover:text-depro-blue transition-colors px-3 py-2"
            >
              {t("nav.login")}
            </Link>
            <Link to="/comprar" className="btn-primary text-sm py-2.5 rounded-xl">
              15 días gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-depro-dark rounded-lg hover:bg-depro-gray-light transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-depro-border shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-depro-dark font-medium py-3 px-4 rounded-xl hover:bg-depro-gray-light transition-all"
              >
                {l.label}
              </a>
            ))}
            <div className="border-t border-depro-border mt-3 pt-3 flex flex-col gap-2">
              <div className="flex justify-center mb-1"><LanguageSwitcher /></div>
              <Link to="/login" className="btn-outline-dark text-center text-sm">{t("nav.login")}</Link>
              <Link to="/comprar" className="btn-primary text-center text-sm" onClick={() => setOpen(false)}>{t("nav.start")}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
