/**
 * Modal previo a la generación: bloqueo duro o aviso de calidad.
 */
import { AlertTriangle, Ban, CheckCircle2, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlanCompatibilityModal({
  open,
  hardBlock = false,
  message = "",
  onClose,
  onContinue,
  continuing = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white border border-depro-border shadow-card overflow-hidden"
      >
        <div className={`px-5 py-4 flex items-start gap-3 ${hardBlock ? "bg-red-50" : "bg-amber-50"}`}>
          <div className={`mt-0.5 ${hardBlock ? "text-red-600" : "text-amber-600"}`}>
            {hardBlock ? <Ban size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-black ${hardBlock ? "text-red-950" : "text-amber-950"}`}>
              {hardBlock ? "No se puede generar el plan" : "Aviso de calidad del plan"}
            </h3>
            <p className={`text-sm mt-2 whitespace-pre-line leading-relaxed ${hardBlock ? "text-red-900" : "text-amber-900"}`}>
              {message}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-depro-gray hover:text-depro-dark p-1" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-wrap gap-2 justify-end">
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-dark hover:bg-depro-gray-light"
          >
            Modificar días / Cambiar objetivo
          </Link>
          {!hardBlock && (
            <button
              type="button"
              onClick={onContinue}
              disabled={continuing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              {continuing ? "Generando…" : "Continuar de todos modos"}
            </button>
          )}
          {hardBlock && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-depro-dark text-white text-sm font-bold"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
