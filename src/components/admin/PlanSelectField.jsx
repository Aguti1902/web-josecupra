import { PLANS, plansForAudience, formatPrice } from "../../lib/checkoutPlans";

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
  return (
    <div>
      <label className="block text-sm font-medium text-depro-dark mb-1">Estado de acceso</label>
      <select
        className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="active">Activo (sin Stripe)</option>
        <option value="trialing">Trial activo</option>
        <option value="comp">Cortesía / demo</option>
      </select>
    </div>
  );
}
