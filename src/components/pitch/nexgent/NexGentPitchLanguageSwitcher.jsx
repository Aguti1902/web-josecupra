import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGS = [
  { code: "en", labelKey: "lang.en", short: "EN" },
  { code: "es", labelKey: "lang.es", short: "ES" },
];

const STORAGE_KEY = "depro_nexgent_pitch_lang";

export default function NexGentPitchLanguageSwitcher() {
  const { i18n, t } = useTranslation("nexgentPitch");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const langCode = i18n.language?.startsWith("es") ? "es" : "en";
  const current = LANGS.find((l) => l.code === langCode) ?? LANGS[0];

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors"
        aria-label="Language"
      >
        <Globe size={14} />
        <span>{current.short}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLanguage(l.code)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs font-black text-gray-400 w-6">{l.short}</span>
              <span className="font-medium flex-1 text-left">{t(l.labelKey)}</span>
              {current.code === l.code && <Check size={13} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function initNexGentPitchLanguage(i18n) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const lang = stored === "es" || stored === "en" ? stored : "es";
  if (!i18n.language?.startsWith(lang)) i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
}
