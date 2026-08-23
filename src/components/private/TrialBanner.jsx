import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock, Sparkles, Zap, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTrialDaysLeft, isInTrial, activateSubscriptionNow } from "../../lib/subscription";
import { useAuth } from "../../context/AuthContext";

const innerClass = "w-full px-4 md:px-6";

export default function TrialBanner({ user, prominent = false }) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!isInTrial(user)) return null;

  const daysLeft = getTrialDaysLeft(user);
  const urgent = daysLeft <= 3;

  const handleSkip = async () => {
    setLoading(true);
    setError("");
    const res = await activateSubscriptionNow(user);
    setLoading(false);
    if (res.ok) {
      await refreshUser();
      return;
    }
    setError(res.error || t("subscription.activate_error"));
  };

  const skipBtn = (
    <button
      type="button"
      onClick={handleSkip}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
      {t("trial.skip_cta")}
    </button>
  );

  if (prominent) {
    return (
      <div
        className={`w-full shrink-0 border-y-2 shadow-sm ${
          urgent ? "bg-orange-100 border-orange-400" : "bg-orange-50 border-orange-300"
        }`}
      >
        <div className={`${innerClass} py-4 flex flex-col md:flex-row md:items-center gap-4`}>
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
                {t("trial.skip_desc")}
              </p>
              {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 sm:ml-auto">
            {skipBtn}
            <Link
              to="/dashboard/subscription"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-orange-800 border border-orange-300 hover:bg-orange-100"
            >
              <Sparkles size={16} />
              {t("trial.banner_cta")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 border-y border-orange-300 bg-orange-50">
      <div className={`${innerClass} py-3 flex flex-col sm:flex-row sm:items-center gap-3`}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-orange-100">
            <Clock size={18} className="text-orange-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-orange-950">
              {t("trial.banner_title", { days: daysLeft })}
            </p>
            <p className="text-xs mt-0.5 text-orange-800">
              {t("trial.skip_desc")}
            </p>
            {error && <p className="text-[11px] text-red-700 mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 sm:ml-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {t("trial.skip_cta")}
          </button>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-orange-800 border border-orange-300"
          >
            {t("trial.banner_cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
