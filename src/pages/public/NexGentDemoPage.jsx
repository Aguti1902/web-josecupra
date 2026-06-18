import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { ClubDashboardExplorer } from "../../components/pitch/ClubDashboardExplorer";
import { PALMEIRAS } from "../../lib/nexgentConfig";

export default function NexGentDemoPage() {
  const { t } = useTranslation("nexgentPitch");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 bg-gray-900 sticky top-0 z-50">
        <Link to="/nexgent/pitch" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">
          <ArrowLeft size={16} /> {t("demo.back")}
        </Link>
        <span className="text-xs font-bold text-gray-500 hidden sm:inline">{PALMEIRAS.shortName} · Demo</span>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-3xl mb-8 md:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">{t("demo.eyebrow")}</p>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-3">{t("demo.title", { club: PALMEIRAS.shortName })}</h1>
          <p className="text-gray-400 leading-relaxed">{t("demo.desc")}</p>
        </div>
        <ClubDashboardExplorer
          club={{
            name: PALMEIRAS.name,
            abbrev: PALMEIRAS.abbrev,
            logo: PALMEIRAS.logo,
            accent: PALMEIRAS.accent,
            team: PALMEIRAS.team,
          }}
        />
        <p className="text-center text-xs text-gray-500 mt-6">{t("demo.footnote", { club: PALMEIRAS.shortName })}</p>
      </div>
    </div>
  );
}
