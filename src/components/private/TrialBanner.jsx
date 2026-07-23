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
        className={`rounded-2xl border-2 px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm ${
          urgent ? "bg-amber-50 border-amber-300" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            urgent ? "bg-amber-100" : "bg-white border border-blue-100"
          }`}>
            <Clock size={28} className={urgent ? "text-amber-700" : "text-depro-blue"} />
          </div>
          <div>
            <p className={`text-lg font-black ${urgent ? "text-amber-900" : "text-depro-dark"}`}>
              {t("trial.banner_title", { days: daysLeft })}
            </p>
            <p className={`text-sm mt-0.5 ${urgent ? "text-amber-800" : "text-depro-gray"}`}>
              {t("trial.banner_desc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className={`text-4xl font-black ${urgent ? "text-amber-700" : "text-depro-blue"}`}>{daysLeft}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray">{t("subscription.days_remaining")}</div>
          </div>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-depro-blue hover:bg-depro-blue-dark transition-colors"
          >
            <Sparkles size={16} />
            {t("trial.banner_cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-4 md:mx-6 mt-4 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
        urgent
          ? "bg-amber-50 border-amber-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          urgent ? "bg-amber-100" : "bg-blue-100"
        }`}>
          <Clock size={18} className={urgent ? "text-amber-700" : "text-depro-blue"} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${urgent ? "text-amber-900" : "text-depro-dark"}`}>
            {t("trial.banner_title", { days: daysLeft })}
          </p>
          <p className={`text-xs mt-0.5 ${urgent ? "text-amber-800" : "text-depro-gray"}`}>
            {t("trial.banner_desc")}
          </p>
        </div>
      </div>
      <Link
        to="/dashboard/subscription"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-depro-blue hover:bg-depro-blue-dark transition-colors flex-shrink-0"
      >
        <Sparkles size={14} />
        {t("trial.banner_cta")}
      </Link>
    </div>
  );
}
