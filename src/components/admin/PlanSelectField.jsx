import { PLANS, plansForAudience, formatPrice } from "../../lib/checkoutPlans";
import {
  ADMIN_ACCOUNT_STATUSES,
  normalizeAdminStatus,
} from "../../lib/adminAccountStatus";

/** Selector de plan DEPRO por audiencia (coach | club | player) */
export default function PlanSelectField({ audience = "club", value, onChange, label = "Plan personalizado" }) {
  const options = plansForAudience(audience);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-depro-dark mb-1">{label}</label>
      )}
      <select
        className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {formatPrice(p.price)}{p.period} · {p.tagline}
          </option>
        ))}
      </select>
      {value && PLANS[value] && (
        <p className="text-xs text-depro-gray mt-1.5">
          Límites:{" "}
          {PLANS[value].limits.maxTeams != null ? `${PLANS[value].limits.maxTeams} equipos` : "equipos ∞"}
          {" · "}
          {PLANS[value].limits.maxPlayers != null ? `${PLANS[value].limits.maxPlayers} jugadores` : "jugadores ∞"}
        </p>
      )}
    </div>
  );
}

export function SubscriptionStatusSelect({ value, onChange }) {
  const current = normalizeAdminStatus(value);
  return (
    <div>
      <label className="block text-sm font-medium text-depro-dark mb-1">Estado</label>
      <select
        className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        {ADMIN_ACCOUNT_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-depro-gray mt-1.5">
        {ADMIN_ACCOUNT_STATUSES.find((s) => s.id === current)?.hint}
      </p>
    </div>
  );
}

export function ManualPriceField({ value, onChange, label = "Precio cobrado (€ / mes)" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-depro-dark mb-1">{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
        placeholder="Ej. 199"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-depro-gray mt-1.5">
        Importe que le cobras tú a este club (no pasa por Stripe). Déjalo vacío si no aplica.
      </p>
    </div>
  );
}
