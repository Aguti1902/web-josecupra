import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { TRIAL_LIMITED_MESSAGE } from "../../lib/trialPersistence";

/** Aviso visible cuando una función está limitada por prueba gratuita. */
export default function TrialLimitedNotice({ className = "" }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 ${className}`}>
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-700" />
      <p>
        {TRIAL_LIMITED_MESSAGE}{" "}
        <Link to="/dashboard/subscription" className="font-bold underline">
          Activar suscripción
        </Link>
      </p>
    </div>
  );
}
