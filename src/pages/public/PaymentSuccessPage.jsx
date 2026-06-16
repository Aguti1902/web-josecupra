import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail, Copy } from "lucide-react";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState({ loading: true, email: "", password: null, error: null });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setStatus({ loading: false, email: "", password: null, error: null });
      return;
    }
    fetch("/api/complete-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus({ loading: false, email: data.email, password: data.password, error: null });
          if (data.userId) {
            sessionStorage.setItem("depro_pending_plan_user", data.userId);
          }
        } else {
          setStatus({ loading: false, email: "", password: null, error: data.error });
        }
      })
      .catch((e) => setStatus({ loading: false, email: "", password: null, error: e.message }));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-depro-gray-light flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <img src="/logo.png" alt="DEPRO" className="h-7 w-auto mx-auto mb-6" />

        <h1 className="text-3xl font-black text-depro-dark mb-3">¡Pago completado!</h1>
        <p className="text-depro-gray mb-2">
          Tu suscripción está activa. {status.loading ? "Creando tu acceso…" : "Ya puedes entrar al panel."}
        </p>

        {status.password && (
          <div className="bg-white border border-depro-border rounded-2xl p-5 text-left mb-6 shadow-card">
            <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 flex items-center gap-2">
              <Mail size={14} /> Tus credenciales
            </div>
            <p className="text-sm text-depro-dark mb-2"><strong>Email:</strong> {status.email}</p>
            <p className="text-sm text-depro-dark mb-3"><strong>Contraseña:</strong> <span className="font-mono">{status.password}</span></p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`${status.email}\n${status.password}`)}
              className="text-xs font-bold text-depro-blue flex items-center gap-1"
            >
              <Copy size={12} /> Copiar credenciales
            </button>
          </div>
        )}

        {status.error && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">{status.error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login" className="btn-primary flex items-center justify-center gap-2 px-6 py-3">
            Acceder al panel <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn-ghost flex items-center justify-center gap-2 px-6 py-3">
            Volver al inicio
          </Link>
        </div>

        {sessionId && (
          <p className="text-[10px] text-depro-gray/50 mt-6">Ref: {sessionId.slice(0, 24)}…</p>
        )}
      </div>
    </div>
  );
}
