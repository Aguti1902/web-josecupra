import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpCircle, CreditCard, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveCurrentPlan, getPlanLimits, getNextPlan } from "../../lib/subscription";
import { formatPrice } from "../../lib/checkoutPlans";
import ChangePlanModal from "./ChangePlanModal";

function countClubPlayers(club) {
  return (club?.teams || []).reduce((sum, t) => sum + (t.squad?.length || 0), 0);
}

function UsageBar({ label, used, limit, icon: Icon }) {
  const { t } = useTranslation();
  const unlimited = limit == null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const isNear = !unlimited && pct >= 80 && pct < 100;
  const isFull = !unlimited && pct >= 100;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 font-semibold text-depro-dark">
          <Icon size={13} className="text-depro-gray" /> {label}
        </span>
        <span className={`font-bold ${isFull ? "text-depro-red" : isNear ? "text-amber-600" : "text-depro-gray"}`}>
          {unlimited ? t("billing.unlimited") : t("billing.used_of", { used, limit })}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 rounded-full bg-depro-gray-light overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isFull ? "bg-depro-red" : isNear ? "bg-amber-500" : "bg-depro-blue"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Tarjeta de "tu plan" con uso de equipos/jugadores y upsell si se acerca al límite.
 * Se usa en el Dashboard, la Plantilla y el perfil del club.
 */
export default function PlanUsageCard({ club, user, audience = "club", highlight = null, className = "" }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const plan = useMemo(() => resolveCurrentPlan(user, club), [user, club]);
  const limits = plan ? getPlanLimits(plan.id) : { maxTeams: null, maxPlayers: null };
  const nextPlan = plan ? getNextPlan(plan.id) : null;

  const teamsUsed = (club?.teams || []).length;
  const playersUsed = countClubPlayers(club);

  const teamsFull = limits.maxTeams != null && teamsUsed >= limits.maxTeams;
  const playersFull = limits.maxPlayers != null && playersUsed >= limits.maxPlayers;
  const showAlert = (highlight === "teams" && teamsFull) || (highlight === "players" && playersFull) || teamsFull || playersFull;

  return (
    <>
      <div className={`bg-white border border-depro-border rounded-2xl p-5 ${className}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-depro-gray mb-1 flex items-center gap-1.5">
              <CreditCard size={12} /> {t("billing.your_plan")}
            </p>
            <p className="font-black text-depro-dark text-lg leading-tight">
              {plan ? plan.name : "—"}
            </p>
            {plan && (
              <p className="text-xs text-depro-gray mt-0.5">{formatPrice(plan.price)}{plan.period}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-depro-blue border border-depro-blue/30 bg-depro-blue-light px-3 py-2 rounded-lg hover:bg-depro-blue/10 transition-colors flex-shrink-0"
          >
            <ArrowUpCircle size={13} /> {t("billing.change_plan")}
          </button>
        </div>

        <div className="space-y-3">
          <UsageBar label={t("billing.teams_usage")} used={teamsUsed} limit={limits.maxTeams} icon={Shield} />
          <UsageBar label={t("billing.players_usage")} used={playersUsed} limit={limits.maxPlayers} icon={Users} />
        </div>

        {showAlert && (
          <div className="mt-4 flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">{t("billing.limit_reached_title")}</p>
              <p>
                {playersFull
                  ? t("billing.limit_reached_players", { plan: plan?.name, limit: limits.maxPlayers })
                  : t("billing.limit_reached_teams", { plan: plan?.name, limit: limits.maxTeams })}
              </p>
              {nextPlan && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-2 font-bold text-amber-900 underline hover:no-underline"
                >
                  {t("billing.upgrade_to", { plan: nextPlan.name })}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ChangePlanModal
        open={showModal}
        onClose={() => setShowModal(false)}
        audience={audience}
        currentPlanId={plan?.id}
      />
    </>
  );
}
