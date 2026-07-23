import { FlaskConical, CreditCard } from "lucide-react";
import { isStripeTestMode } from "../../lib/stripePublishable";

export default function StripeTestBanner() {
  if (!isStripeTestMode()) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="flex items-start gap-3">
        <FlaskConical size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="space-y-1.5 min-w-0">
          <p className="font-bold">Modo test de Stripe</p>
          <p className="text-amber-900/90 text-xs leading-relaxed">
            No se realizarán cargos reales. Usa una tarjeta de prueba para completar el pago.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard size={12} className="text-amber-700" />
              4242 4242 4242 4242
            </span>
            <span className="text-amber-800/80">Cad. cualquier futura · CVC 123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
