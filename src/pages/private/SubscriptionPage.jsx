import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CreditCard, Lock, Sparkles, ArrowUpCircle, Check, X, Clock, Loader2, Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  isIndividualSubscriber,
  getSubscriptionFromUser,
  isSubscriptionActive,
  cancelSubscription,
  openBillingPortal,
  getPlanLabel,
  getPlanPrice,
  formatSubscriptionDate,
  isInTrial,
  getTrialDaysLeft,
  mustPayToContinue,
  changePlan,
  resolveUserAudience,
  hasFeatureAccess,
  activateSubscriptionNow,
  purchaseAddon,
  syncLocalSubscription,
} from "../../lib/subscription";
import { lockedFeaturesForUser } from "../../lib/planFeatures";
import { plansForAudience, formatPrice, PLANS } from "../../lib/checkoutPlans";
import { PLAYER_ADDONS, addonById } from "../../lib/playerAddons";
import ChangePlanModal from "../../components/private/ChangePlanModal";

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [addonLoading, setAddonLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const sessionId = params.get("addon_session");
    if (!sessionId || !user?.id) return;

    let cancelled = false;
    (async () => {
      const res = await fetch("/api/complete-addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (data.ok) {
        setMsg({ type: "ok", text: t("subscription.addon_success") });
        await refreshUser();
      } else {
        setMsg({ type: "error", text: data.error || t("subscription.addon_error") });
      }
      params.delete("addon_session");
      setParams(params, { replace: true });
    })();

    return () => { cancelled = true; };
  }, [params, user?.id, refreshUser, setParams, t]);

  const audience = resolveUserAudience(user);
  const isPlayer = user?.role === "player";
  const subscription = getSubscriptionFromUser(user);
  const showBilling = isPlayer ? isIndividualSubscriber(user) : !!subscription?.plan;
  const subActive = isSubscriptionActive(subscription);
  const subPendingCancel = subscription?.status === "cancel_at_period_end";
  const inTrial = isInTrial(user);
  const daysLeft = getTrialDaysLeft(user);
  const paywallActive = mustPayToContinue(user);
  const currentPlanId = subscription?.plan || user?.plan;
  const currentPlan = currentPlanId ? PLANS[currentPlanId] : null;
  const purchasedAddons = user?.purchasedAddons || subscription?.purchasedAddons || [];
  const audiencePlans = plansForAudience(audience);
  const [planSwitchLoading, setPlanSwitchLoading] = useState(null);

  const locked = lockedFeaturesForUser(user, {
    isInTrial,
    hasFeatureAccess,
    resolveUserAudience,
  });

  const handlePortal = async () => {
    setPortalLoading(true);
    setMsg(null);
    const res = await openBillingPortal(user);
    if (!res.ok) {
      setPortalLoading(false);
      setMsg({ type: "error", text: res.error || t("subscription.portal_error") });
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    setMsg(null);
    const res = await cancelSubscription(user);
    setCancelLoading(false);
    setShowCancelModal(false);
    if (res.ok) {
      setMsg({
        type: "ok",
        text: t("profile.subscription_cancel_success", { date: formatSubscriptionDate(res.cancelAt) }),
      });
      await refreshUser();
    } else {
      setMsg({ type: "error", text: res.error || t("profile.subscription_cancel_error") });
    }
  };

  const handleActivateNow = async () => {
    setActivateLoading(true);
    setMsg(null);
    const res = await activateSubscriptionNow(user);
    setActivateLoading(false);
    if (res.ok) {
      syncLocalSubscription(user.id, { plan: user.plan, status: "active", trialEndsAt: null });
      setMsg({ type: "ok", text: t("subscription.activate_success") });
      await refreshUser();
    } else {
      setMsg({ type: "error", text: res.error || t("subscription.activate_error") });
    }
  };

  const handlePurchaseAddon = async (addonId) => {
    setAddonLoading(addonId);
    setMsg(null);
    const res = await purchaseAddon(user, addonId);
    if (!res.ok) {
      setAddonLoading(null);
      setMsg({ type: "error", text: res.error || t("subscription.addon_error") });
    }
  };

  const handlePaywallPlan = async (planId) => {
    setPlanSwitchLoading(planId);
    setMsg(null);

    if (planId !== currentPlanId) {
      const changeRes = await changePlan({ user, newPlanId: planId });
      if (!changeRes.ok) {
        setPlanSwitchLoading(null);
        setMsg({ type: "error", text: changeRes.error || t("billing.change_error") });
        return;
      }
      await refreshUser();
    }

    const activateRes = await activateSubscriptionNow({ ...user, plan: planId });
    setPlanSwitchLoading(null);
    if (activateRes.ok) {
      syncLocalSubscription(user.id, { plan: planId, status: "active", trialEndsAt: null });
      setMsg({ type: "ok", text: t("subscription.activate_success") });
      await refreshUser();
    } else {
      setMsg({ type: "error", text: activateRes.error || t("subscription.activate_error") });
    }
  };

  const upgradePlans = plansForAudience(audience).filter((p) => {
    if (!currentPlanId) return true;
    const order = Object.keys(PLANS).filter((id) => PLANS[id].audience === audience);
    return order.indexOf(p.id) > order.indexOf(currentPlanId);
  });

  const availableAddons = isPlayer
    ? PLAYER_ADDONS.filter((a) => !purchasedAddons.includes(a.id) && !hasFeatureAccess(user, a.featureId))
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-depro-dark">{t("subscription.page_title")}</h1>
        <p className="text-sm text-depro-gray mt-1">{t("subscription.page_desc")}</p>
      </div>

      {paywallActive && (
        <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-200 flex items-center justify-center flex-shrink-0">
              <Clock size={26} className="text-orange-800" />
            </div>
            <div>
              <h2 className="text-xl font-black text-orange-950">{t("trial.expired_title")}</h2>
              <p className="text-sm text-orange-900 mt-1">{t("trial.expired_desc")}</p>
            </div>
          </div>

          {msg && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${
              msg.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {msg.text}
            </div>
          )}

          <div className={`grid gap-4 ${audiencePlans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {audiencePlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const loading = planSwitchLoading === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-5 flex flex-col bg-white ${
                    isCurrent ? "border-orange-400 ring-2 ring-orange-200" : "border-depro-border"
                  }`}
                >
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-2">
                      {t("trial.expired_current_plan")}
                    </span>
                  )}
                  <p className="font-black text-depro-dark text-lg">{plan.name}</p>
                  <div className="flex items-end gap-1 my-2">
                    <span className="text-2xl font-black text-depro-dark">{formatPrice(plan.price)}</span>
                    <span className="text-xs text-depro-gray mb-0.5">{plan.period}</span>
                  </div>
                  <p className="text-xs text-depro-gray mb-4 flex-1">{plan.tagline}</p>
                  <button
                    type="button"
                    onClick={() => handlePaywallPlan(plan.id)}
                    disabled={!!planSwitchLoading}
                    className="w-full py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {t("trial.expired_cta", { plan: plan.name })}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {inTrial && !paywallActive && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Clock size={24} className="text-orange-700" />
            </div>
            <div>
              <p className="font-black text-orange-950 text-lg">
                {t("trial.banner_title", { days: daysLeft })}
              </p>
              <p className="text-sm text-orange-800">{t("subscription.trial_explainer")}</p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-center sm:text-right">
              <div className="text-4xl font-black text-orange-700">{daysLeft}</div>
              <div className="text-xs font-bold text-orange-800/70 uppercase tracking-wide">
                {t("subscription.days_remaining")}
              </div>
            </div>
            <button
              type="button"
              onClick={handleActivateNow}
              disabled={activateLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 disabled:opacity-50"
            >
              {activateLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {t("subscription.activate_now")}
            </button>
          </div>
        </div>
      )}

      {showBilling && subscription && !paywallActive && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-depro-blue" />
            {t("subscription.current_plan")}
          </h2>

          <div className="rounded-xl border border-depro-border p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black text-depro-dark text-xl">{getPlanLabel(subscription.plan)}</div>
                {getPlanPrice(subscription.plan) && (
                  <div className="text-sm text-depro-gray mt-0.5">
                    {getPlanPrice(subscription.plan)} · {t("profile.subscription_renews")}
                  </div>
                )}
                {currentPlan?.tagline && (
                  <p className="text-xs text-depro-gray mt-1">{currentPlan.tagline}</p>
                )}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${
                inTrial
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : subPendingCancel
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : subActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-depro-gray-light text-depro-gray border-depro-border"
              }`}>
                {inTrial
                  ? t("subscription.status_trial")
                  : subPendingCancel
                    ? t("profile.subscription_cancel_pending", { date: formatSubscriptionDate(subscription.cancelAt) })
                    : subActive
                      ? t("profile.subscription_active")
                      : t("profile.subscription_cancelled")}
              </span>
            </div>

            {msg && (
              <div className={`text-sm px-3 py-2 rounded-lg border ${
                msg.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {msg.text}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {user?.stripeCustomerId && (
                <button
                  type="button"
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-depro-border text-sm font-semibold text-depro-dark hover:border-depro-blue disabled:opacity-50"
                >
                  <CreditCard size={14} />
                  {portalLoading ? "…" : t("subscription.manage_billing")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowChangePlan(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark"
              >
                <ArrowUpCircle size={14} /> {t("profile.subscription_change_btn")}
              </button>
              {subActive && !subPendingCancel && !inTrial && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 px-3 py-2"
                >
                  {t("profile.subscription_cancel_btn")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!showBilling && !paywallActive && (
        <div className="bg-white border border-depro-border rounded-2xl p-6 text-center">
          <p className="text-depro-gray text-sm mb-4">{t("profile.subscription_no_plan")}</p>
          <Link to="/comprar" className="btn-primary inline-flex px-6 py-2.5 rounded-xl text-sm font-bold">
            {t("subscription.get_plan")}
          </Link>
        </div>
      )}

      {availableAddons.length > 0 && !paywallActive && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-depro-blue" />
            {t("subscription.addons_title")}
          </h2>
          <p className="text-sm text-depro-gray mb-5">{t("subscription.addons_desc")}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {availableAddons.map((addon) => (
              <div key={addon.id} className="rounded-xl border border-depro-border p-4 flex flex-col">
                <p className="font-bold text-depro-dark text-sm">{addon.name}</p>
                <p className="text-xs text-depro-gray mt-1 mb-3 flex-1">{addon.description}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xl font-black text-depro-dark">{formatPrice(addon.price)}</span>
                  <span className="text-xs text-depro-gray">{addon.period}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurchaseAddon(addon.id)}
                  disabled={addonLoading === addon.id}
                  className="w-full py-2 rounded-lg bg-depro-blue text-white text-xs font-bold hover:bg-depro-blue-dark disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {addonLoading === addon.id ? <Loader2 size={12} className="animate-spin" /> : null}
                  {t("subscription.buy_addon")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {purchasedAddons.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-green-800 mb-2">{t("subscription.addons_owned")}</p>
          <div className="flex flex-wrap gap-2">
            {purchasedAddons.map((id) => (
              <span key={id} className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-green-200 text-green-800">
                {addonById(id)?.name || id}
              </span>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && !paywallActive && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
            <Lock size={18} className="text-amber-600" />
            {t("subscription.locked_features")}
          </h2>
          <p className="text-sm text-depro-gray mb-5">{t("subscription.locked_features_desc")}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {locked.map((f) => {
              const addon = f.trialAddon ? addonById(f.trialAddon) : null;
              return (
                <div key={f.id} className="rounded-xl border border-depro-border p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-depro-dark text-sm">{t(f.labelKey)}</p>
                    <p className="text-xs text-depro-gray mt-0.5">{t(f.descKey)}</p>
                    <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      f.reason === "trial" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {f.reason === "trial" ? t("subscription.lock_trial") : t("subscription.lock_plan")}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    {f.reason === "trial" && addon && (
                      <button
                        type="button"
                        onClick={() => handlePurchaseAddon(addon.id)}
                        disabled={addonLoading === addon.id}
                        className="text-xs font-bold text-depro-blue hover:underline text-left flex items-center gap-1"
                      >
                        {addonLoading === addon.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {t("subscription.buy_addon_named", { name: addon.name, price: formatPrice(addon.price) })}
                      </button>
                    )}
                    {f.upsellPlan && (
                      <button
                        type="button"
                        onClick={() => setShowChangePlan(true)}
                        className="text-xs font-bold text-depro-blue hover:underline text-left flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        {t("features.upgrade_to", { plan: f.upsellPlan.name, price: formatPrice(f.upsellPlan.price) })}
                      </button>
                    )}
                    {f.reason === "trial" && !addon && !f.upsellPlan && (
                      <button
                        type="button"
                        onClick={handleActivateNow}
                        disabled={activateLoading}
                        className="text-xs font-bold text-depro-blue hover:underline text-left flex items-center gap-1"
                      >
                        <Zap size={12} /> {t("subscription.activate_now")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upgradePlans.length > 0 && !paywallActive && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-depro-blue" />
            {t("subscription.upgrades_title")}
          </h2>
          <p className="text-sm text-depro-gray mb-5">{t("subscription.upgrades_desc")}</p>
          <div className={`grid gap-4 ${upgradePlans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {upgradePlans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-depro-border p-5 flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wide text-depro-gray">{plan.name}</p>
                <div className="flex items-end gap-1 my-2">
                  <span className="text-2xl font-black text-depro-dark">{formatPrice(plan.price)}</span>
                  <span className="text-xs text-depro-gray mb-0.5">{plan.period}</span>
                </div>
                <p className="text-xs text-depro-gray mb-3">{plan.tagline}</p>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {plan.features.slice(0, 3).map((feat) => (
                    <li key={feat} className="flex items-start gap-1.5 text-xs text-depro-gray">
                      <Check size={12} className="text-depro-blue mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setShowChangePlan(true)}
                  className="w-full py-2.5 rounded-lg bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark"
                >
                  {t("billing.upgrade_to", { plan: plan.name })}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChangePlanModal
        open={showChangePlan}
        onClose={() => setShowChangePlan(false)}
        audience={audience}
        currentPlanId={currentPlanId}
        onChanged={() => refreshUser()}
      />

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="font-bold text-depro-dark text-lg">{t("profile.subscription_cancel_confirm_title")}</h3>
              <button type="button" onClick={() => setShowCancelModal(false)} className="text-depro-gray hover:text-depro-dark p-1">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-depro-gray mb-6">{t("profile.subscription_cancel_confirm_body")}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm font-semibold"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50"
              >
                {cancelLoading ? "…" : t("profile.subscription_cancel_confirm_yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
