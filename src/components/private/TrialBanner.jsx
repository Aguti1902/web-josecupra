import { Link } from "react-router-dom";
import { Clock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTrialDaysLeft, isInTrial } from "../../lib/subscription";

export default function TrialBanner({ user, prominent = false }) {
  const { t } = useTranslation();
  if (!isInTrial(user)) return null;

  const daysLeft = getTrialDaysLeft(user);
  const urgent = daysLeft <= 3;

  if (prominent) {
    return (
      <div
        className={`border-2 px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm ${
          urgent ? "bg-orange-100 border-orange-400" : "bg-orange-50 border-orange-300"
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-16 h-16 flex items-center justify-center flex-shrink-0 ${
            urgent ? "bg-orange-200" : "bg-orange-100"
          }`}>
            <Clock size={28} className="text-orange-700" />
          </div>
          <div>
            <p className="text-lg font-black text-orange-950">
              {t("trial.banner_title", { days: daysLeft })}
            </p>
            <p className="text-sm mt-0.5 text-orange-800">
              {t("trial.banner_desc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-4xl font-black text-orange-700">{daysLeft}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-orange-800/70">{t("subscription.days_remaining")}</div>
          </div>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <Sparkles size={16} />
            {t("trial.banner_cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-orange-300 bg-orange-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-orange-100">
          <Clock size={18} className="text-orange-700" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-orange-950">
            {t("trial.banner_title", { days: daysLeft })}
          </p>
          <p className="text-xs mt-0.5 text-orange-800">
            {t("trial.banner_desc")}
          </p>
        </div>
      </div>
      <Link
        to="/dashboard/subscription"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors flex-shrink-0"
      >
        <Sparkles size={14} />
        {t("trial.banner_cta")}
      </Link>
    </div>
  );
}
