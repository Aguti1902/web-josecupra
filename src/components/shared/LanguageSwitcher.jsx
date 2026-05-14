import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGS = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
  { code: "ca", label: "Català",  short: "CA" },
];

export default function LanguageSwitcher({ compact = false, light = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const btnBase = compact
    ? "flex items-center gap-1 p-1.5 rounded-lg transition-colors"
    : "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors";

  const btnColor = light
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-depro-gray hover:text-depro-dark hover:bg-depro-gray-light";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${btnBase} ${btnColor}`}
        title="Cambiar idioma / Change language"
      >
        {compact ? (
          <Globe size={16} />
        ) : (
          <>
            <Globe size={14} />
            <span className="font-semibold text-xs tracking-wide">{current.short}</span>
            <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-depro-border rounded-xl shadow-card-hover overflow-hidden z-50 min-w-[140px]">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLanguage(l.code)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-depro-dark hover:bg-depro-gray-light transition-colors"
            >
              <span className="text-xs font-black text-depro-gray w-6">{l.short}</span>
              <span className="font-medium flex-1 text-left">{l.label}</span>
              {current.code === l.code && <Check size={13} className="text-depro-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
