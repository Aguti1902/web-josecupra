import { useEffect, useRef, useState } from "react";
import { getStripePromise } from "../../lib/stripePublishable";

/**
 * Stripe Embedded Checkout — formulario de pago embebido en /comprar.
 */
export default function EmbeddedStripeCheckout({ planId, formData, onError }) {
  const containerRef = useRef(null);
  const checkoutRef = useRef(null);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);

  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stripe = await getStripePromise();
      if (!stripe || cancelled || !containerRef.current) {
        if (!stripe) onErrorRef.current?.("Stripe no está configurado (clave pública).");
        setLoading(false);
        return;
      }

      const fetchClientSecret = async () => {
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            formData,
            origin: window.location.origin,
            embedded: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear sesión de pago");
        return data.clientSecret;
      };

      try {
        let checkout;
        if (typeof stripe.createEmbeddedCheckoutPage === "function") {
          checkout = await stripe.createEmbeddedCheckoutPage({ fetchClientSecret });
        } else if (typeof stripe.initEmbeddedCheckout === "function") {
          checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret });
        } else {
          throw new Error("Tu navegador no soporta Embedded Checkout. Actualiza @stripe/stripe-js.");
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
          onErrorRef.current?.(err.message || "No se pudo cargar el pago");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      checkoutRef.current?.destroy?.();
      checkoutRef.current = null;
    };
  }, [planId, formData]);

  return (
    <div className="relative min-h-[480px] rounded-2xl border border-depro-border bg-white overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
          <div className="spinner border-depro-border border-t-depro-blue" />
          <p className="text-sm text-depro-gray">Cargando formulario de pago seguro…</p>
        </div>
      )}
      <div ref={containerRef} className="embedded-checkout-container min-h-[480px]" />
    </div>
  );
}
