import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { plansForAudience, formatPrice } from "../../lib/checkoutPlans";
import { changePlan } from "../../lib/subscription";
import { useAuth } from "../../context/AuthContext";

/**
 * Modal de cambio de plan, reutilizable en cualquier dashboard (entrenador, club, jugador).
 * Lista los planes de la audiencia indicada y permite cambiar al que se elija.
 */
export default function ChangePlanModal({ open, onClose, audience, currentPlanId, onChanged }) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!open) return null;

  const plans = plansForAudience(audience);

  const handleSelect = async (planId) => {
    if (planId === currentPlanId || loadingPlan) return;
    setLoadingPlan(planId);
    setError(null);
    const res = await changePlan({ user, newPlanId: planId });
    setLoadingPlan(null);
    if (!res.ok) {
      setError(res.error || t("billing.change_error"));
      return;
    }
    setSuccess(planId);
    await refreshUser();
    onChanged?.(planId);
    setTimeout(() => {
      setSuccess(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-depro-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-black text-depro-dark text-xl">{t("billing.modal_title")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-depro-gray hover:text-depro-dark p-1 flex-shrink-0"
            aria-label={t("billing.close")}
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-depro-gray mb-6">{t("billing.modal_subtitle")}</p>

        {error && (
          <div className="mb-4 text-sm px-3 py-2 rounded-lg border bg-red-50 text-red-700 border-red-200">
            {error}
          </div>
        )}

        <div className={`grid gap-4 ${plans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isLoading = loadingPlan === plan.id;
            const isSuccess = success === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border p-5 ${
                  isCurrent ? "border-depro-blue ring-1 ring-depro-blue/30 bg-depro-blue-light/40" : "border-depro-border"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-4 bg-depro-blue text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
                    {t("billing.current_plan_tag")}
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-wide text-depro-gray mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-2xl font-black text-depro-dark">{formatPrice(plan.price)}</span>
                  <span className="text-depro-gray text-xs mb-0.5">{plan.period}</span>
                </div>
                <p className="text-xs text-depro-gray mb-4">{plan.tagline}</p>
                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-depro-gray">
                      <Check size={12} className="text-depro-blue mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isCurrent || !!loadingPlan}
                  onClick={() => handleSelect(plan.id)}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    isCurrent
                      ? "bg-depro-gray-light text-depro-gray cursor-not-allowed"
                      : "bg-depro-blue text-white hover:bg-depro-blue-dark disabled:opacity-60"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t("billing.changing")}
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={14} /> {t("billing.change_success", { plan: plan.name })}
                    </>
                  ) : isCurrent ? (
                    t("billing.current_plan_disabled_btn")
                  ) : (
                    t("billing.select_plan_btn")
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
