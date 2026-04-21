import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Results", href: "#proof" },
    { label: "Contact", href: "#cta" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-pitch-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap size={18} className="text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-wide">JOSE</span>
              <span className="text-brand-400 text-xs font-semibold tracking-widest">FOOTBALL</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="btn-ghost text-sm"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Login
            </Link>
            <a href="#cta" className="btn-primary text-sm py-2">
              Book a Call
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl hover:bg-white/5 transition-all"
              >
                {l.label}
              </a>
            ))}
            <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary text-center text-sm">
                Login
              </Link>
              <a href="#cta" className="btn-primary text-center text-sm" onClick={() => setOpen(false)}>
                Book a Call
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
