import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DEPRO_LOGO, NEXGENT_LOGO } from "../../lib/nexgentConfig";
import { initNexGentPitchLanguage } from "../../components/pitch/nexgent/NexGentPitchLanguageSwitcher";

const ACCENT = "#0A36F7";

export default function NexGentCoverPage() {
  const { t, i18n } = useTranslation("nexgentPitch");

  useEffect(() => {
    initNexGentPitchLanguage(i18n);
  }, [i18n]);

  const stats = [
    { v: "10+", l: t("cover.stats.modules") },
    { v: "IA", l: t("cover.stats.ai") },
    { v: "100%", l: t("cover.stats.whitelabel") },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-5 md:gap-10 mb-10 md:mb-14">
          <img src={NEXGENT_LOGO} alt="NexGent" className="h-16 md:h-24 w-auto object-contain" />
          <span className="text-2xl md:text-4xl text-gray-300 font-light">×</span>
          <img src={DEPRO_LOGO} alt="DEPRO" className="h-12 md:h-20 w-auto object-contain" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
          {t("cover.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mb-6">
          {t("cover.title")}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mb-10">
          {t("cover.desc")}
        </p>

        <Link
          to="/nexgent/pitch"
          className="inline-flex items-center gap-2 text-white font-black text-lg px-10 py-4 rounded-xl shadow-depro hover:opacity-90 transition-opacity"
          style={{ backgroundColor: ACCENT }}
        >
          {t("cover.cta")} <ArrowRight size={22} />
        </Link>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
          {stats.map((s) => (
            <li key={s.l} className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-500" />
              <span><strong className="text-gray-800">{s.v}</strong> {s.l}</span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
