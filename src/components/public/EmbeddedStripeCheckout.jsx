import { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { getStripePromise } from "../../lib/stripePublishable";

const INIT_TIMEOUT_MS = 25000;

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
  const [retryNonce, setRetryNonce] = useState(0);

  onErrorRef.current = onError;
  formDataRef.current = formData;

  // Clave estable: no incluir campos que cambian por efectos (nombre, etc.)
  const checkoutKey = useMemo(() => {
    const addons = Array.isArray(formData?.selectedAddons)
      ? [...formData.selectedAddons].sort().join(",")
      : "";
    const clubCode = formData?.clubCode || "";
    const skip = formData?.skipTrial ? "1" : "0";
    return `${planId || ""}|${addons}|${clubCode}|skip${skip}|r${retryNonce}`;
  }, [planId, formData?.selectedAddons, formData?.clubCode, formData?.skipTrial, retryNonce]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;
    let timeoutTimer = null;
    setLoading(true);
    setLocalError("");

    async function init(attempt = 0) {
      if (cancelled) return;

      // Esperar a que el contenedor exista (StrictMode / primer paint)
      if (!containerRef.current) {
        if (attempt < 40) {
          retryTimer = setTimeout(() => init(attempt + 1), 50);
          return;
        }
        const msg = "No se pudo preparar el formulario de pago. Prueba de nuevo.";
        setLocalError(msg);
        onErrorRef.current?.(msg);
        setLoading(false);
        return;
      }

      if (!planId) {
        const msg = "Falta el plan para iniciar el pago.";
        setLocalError(msg);
        onErrorRef.current?.(msg);
        setLoading(false);
        return;
      }

      const stripe = await getStripePromise();
      if (cancelled) return;
      if (!stripe) {
        const msg = "No se pudo inicializar Stripe. Revisa la conexión y reintenta.";
        setLocalError(msg);
        onErrorRef.current?.(msg);
        setLoading(false);
        return;
      }

      const fetchClientSecret = async () => {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const kill = setTimeout(() => controller?.abort(), INIT_TIMEOUT_MS);
        try {
          const res = await fetch("/api/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId,
              formData: formDataRef.current,
              origin: window.location.origin,
              embedded: true,
            }),
            signal: controller?.signal,
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Error al crear sesión de pago");
          if (!data.clientSecret) throw new Error("Stripe no devolvió clientSecret");
          return data.clientSecret;
        } catch (err) {
          if (err?.name === "AbortError") {
            throw new Error("El pago está tardando demasiado. Reintenta.");
          }
          throw err;
        } finally {
          clearTimeout(kill);
        }
      };

      try {
        // Limpiar instancia previa
        checkoutRef.current?.destroy?.();
        checkoutRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = "";

        // Stripe.js 2026: initEmbeddedCheckout() still exists but throws IntegrationError.
        // Prefer createEmbeddedCheckoutPage(); keep legacy init as last resort.
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

    // Timeout global por si Stripe se queda colgado tras create
    timeoutTimer = setTimeout(() => {
      if (!cancelled && checkoutRef.current == null) {
        setLocalError((prev) => prev || "El formulario de pago no responde. Reintenta.");
        setLoading(false);
      }
    }, INIT_TIMEOUT_MS + 5000);

    init();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      checkoutRef.current?.destroy?.();
      checkoutRef.current = null;
    };
  }, [checkoutKey, planId]);

  const retry = () => {
    setLocalError("");
    setRetryNonce((n) => n + 1);
  };

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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="text-sm font-bold px-4 py-2 rounded-xl bg-depro-blue text-white hover:opacity-90"
              >
                Reintentar pago
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-bold text-depro-blue hover:underline"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} className="embedded-checkout-container min-h-[520px]" />
      </div>
    </div>
  );
}
