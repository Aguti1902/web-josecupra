import { Link } from "react-router-dom";
import { Lock, Sparkles, ArrowUpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  hasFeatureAccess,
  getFeatureLockReason,
  getFeatureUpsellPlan,
  isInTrial,
  activateSubscriptionNow,
  purchaseAddon,
} from "../../lib/subscription";
import { FEATURES } from "../../lib/planFeatures";
import { addonForFeature } from "../../lib/playerAddons";
import { formatPrice } from "../../lib/checkoutPlans";
import ChangePlanModal from "./ChangePlanModal";
import { useAuth } from "../../context/AuthContext";

/**
 * Bloquea una sección si el usuario está en trial o no tiene el plan necesario.
 * Muestra upsell para desbloquear.
 */
export default function FeatureGate({
  user,
  feature,
  children,
  compact = false,
  audience: audienceProp,
}) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!user || hasFeatureAccess(user, feature)) {
    return children;
  }

  const meta = FEATURES[feature] || {};
  const reason = getFeatureLockReason(user, feature);
  const upsellPlan = getFeatureUpsellPlan(user, feature);
  const trialAddon = addonForFeature(feature);
  const addon = trialAddon || addonForFeature(feature);
  const audience = audienceProp || (user.role === "club"
    ? (user.club?.isSoloCoach ? "coach" : "club")
    : "player");

  const title = t(meta.labelKey || "features.locked");
  const desc = reason === "trial"
    ? t("features.trial_locked_desc")
    : t(meta.descKey || "features.plan_locked_desc");

  const handleActivate = async () => {
    setActionLoading(true);
    const res = await activateSubscriptionNow(user);
    setActionLoading(false);
    if (res.ok) await refreshUser();
  };

  const handleBuyAddon = async () => {
    if (!trialAddon) return;
    setActionLoading(true);
    await purchaseAddon(user, trialAddon.id);
    setActionLoading(false);
  };

  if (compact) {
    return (
      <div className="rounded-xl border border-dashed border-depro-border bg-depro-gray-light/50 p-4 flex items-center gap-3">
        <Lock size={16} className="text-depro-gray flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-depro-dark">{title}</p>
          <p className="text-xs text-depro-gray">{desc}</p>
        </div>
        <Link
          to="/dashboard/subscription"
          className="text-xs font-bold text-depro-blue hover:underline flex-shrink-0"
        >
          {t("trial.unlock")}
        </Link>
      </div>
    );
  }

  const lockOverlay = (
    <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-xl border border-depro-border p-6 sm:p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
        <Lock size={28} className="text-amber-600" />
      </div>
      <h2 className="text-xl font-black text-depro-dark mb-2">{title}</h2>
      <p className="text-sm text-depro-gray mb-2">{desc}</p>
      {meta.upsellBenefits?.length > 0 && (
        <ul className="text-left text-sm text-depro-gray space-y-1.5 mb-4 max-w-sm mx-auto">
          {meta.upsellBenefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="text-depro-blue font-bold">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {addon && (
        <p className="text-lg font-black text-depro-dark mb-2">{addon.price}€{addon.period}</p>
      )}
      {isInTrial(user) && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5 inline-block">
          {t("features.trial_note")}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
        {trialAddon && feature !== "feedback" && (
          <button
            type="button"
            onClick={handleBuyAddon}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            Añadir · {trialAddon.name} · {trialAddon.price}€
          </button>
        )}
        {upsellPlan && (
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            <ArrowUpCircle size={16} />
            {feature === "feedback"
              ? `Actualizar a Premium · ${formatPrice(upsellPlan.price)}`
              : t("features.upgrade_to", { plan: upsellPlan.name, price: formatPrice(upsellPlan.price) })}
          </button>
        )}
        {feature === "feedback" && !upsellPlan && (
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors"
          >
            <ArrowUpCircle size={16} />
            Actualizar a Premium
          </Link>
        )}
        {reason === "trial" && !trialAddon && !upsellPlan && (
          <button
            type="button"
            onClick={handleActivate}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            <ArrowUpCircle size={16} />
            {t("subscription.activate_now")}
          </button>
        )}
        <Link
          to="/dashboard/subscription"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-depro-border text-sm font-semibold text-depro-dark hover:border-depro-blue hover:text-depro-blue transition-colors"
        >
          <Sparkles size={16} />
          {t("trial.view_plans")}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative min-h-[50vh]">
        <div
          className="pointer-events-none select-none blur-[4px] opacity-50 saturate-75 max-h-[calc(100vh-6rem)] overflow-hidden"
          aria-hidden="true"
        >
          {children}
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-8 sm:pt-16 px-4 pb-8 bg-gradient-to-b from-white/70 via-white/80 to-white/95">
          {lockOverlay}
        </div>
      </div>

      {upsellPlan && (
        <ChangePlanModal
          open={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          audience={audience}
          currentPlanId={user.plan}
        />
      )}
    </>
  );
}
