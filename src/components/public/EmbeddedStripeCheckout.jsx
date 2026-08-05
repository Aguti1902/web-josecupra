import { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { getStripePromise } from "../../lib/stripePublishable";

/**
 * Stripe Embedded Checkout — formulario de pago embebido en /comprar.
 * Se remonta solo si cambian plan/addons/código club (no el resto del formulario).
 */
export default function EmbeddedStripeCheckout({ planId, formData, onError, className = "" }) {
  const containerRef = useRef(null);
  const checkoutRef = useRef(null);
  const onErrorRef = useRef(onError);
  const formDataRef = useRef(formData);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState("");

  onErrorRef.current = onError;
  formDataRef.current = formData;

  // Clave estable: no incluir campos que cambian por efectos (nombre, etc.)
  const checkoutKey = useMemo(() => {
    const addons = Array.isArray(formData?.selectedAddons)
      ? [...formData.selectedAddons].sort().join(",")
      : "";
    const clubCode = formData?.clubCode || "";
    return `${planId || ""}|${addons}|${clubCode}`;
  }, [planId, formData?.selectedAddons, formData?.clubCode]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;
    setLoading(true);
    setLocalError("");

    async function init(attempt = 0) {
      if (cancelled) return;

      // Esperar a que el contenedor exista (StrictMode / primer paint)
      if (!containerRef.current) {
        if (attempt < 20) {
          retryTimer = setTimeout(() => init(attempt + 1), 50);
          return;
        }
        const msg = "No se pudo preparar el formulario de pago. Recarga la página.";
        setLocalError(msg);
        onErrorRef.current?.(msg);
        setLoading(false);
        return;
      }

      const stripe = await getStripePromise();
      if (cancelled) return;
      if (!stripe) {
        const msg = "No se pudo inicializar Stripe. Recarga la página.";
        setLocalError(msg);
        onErrorRef.current?.(msg);
        setLoading(false);
        return;
      }

      const fetchClientSecret = async () => {
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            formData: formDataRef.current,
            origin: window.location.origin,
            embedded: true,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Error al crear sesión de pago");
        if (!data.clientSecret) throw new Error("Stripe no devolvió clientSecret");
        return data.clientSecret;
      };

      try {
        // Limpiar instancia previa
        checkoutRef.current?.destroy?.();
        checkoutRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = "";

        let checkout;
        if (typeof stripe.createEmbeddedCheckoutPage === "function") {
          checkout = await stripe.createEmbeddedCheckoutPage({ fetchClientSecret });
        } else if (typeof stripe.initEmbeddedCheckout === "function") {
          checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret });
        } else {
          throw new Error("Tu navegador no soporta Embedded Checkout. Actualiza el navegador.");
        }

        if (cancelled) {
          checkout.destroy?.();
          return;
        }

        checkoutRef.current = checkout;
        checkout.mount(containerRef.current);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          const msg = err.message || "No se pudo cargar el pago";
          setLocalError(msg);
          onErrorRef.current?.(msg);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      checkoutRef.current?.destroy?.();
      checkoutRef.current = null;
    };
  }, [checkoutKey, planId]);

  return (
    <div className={`relative rounded-2xl border border-depro-border bg-white shadow-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-depro-border bg-depro-bg/50 px-5 py-3">
        <Lock size={14} className="text-depro-green shrink-0" />
        <span className="text-xs font-semibold text-depro-dark">Pago seguro con Stripe</span>
      </div>

      <div className="relative min-h-[520px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
            <div className="spinner border-depro-border border-t-depro-blue" />
            <p className="text-sm text-depro-gray">Preparando formulario de pago…</p>
          </div>
        )}
        {localError && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white p-6 text-center">
            <p className="text-sm text-red-600 font-semibold">{localError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-bold text-depro-blue hover:underline"
            >
              Recargar página
            </button>
          </div>
        )}
        <div ref={containerRef} className="embedded-checkout-container min-h-[520px]" />
      </div>
    </div>
  );
}
