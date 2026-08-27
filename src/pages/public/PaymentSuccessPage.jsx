import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { syncLocalSubscription } from "../../lib/subscription";
import { registerClubCodePlayer, getPlayerClubAssoc, applyClubBrandingToPlayer } from "../../lib/clubPlayerRegistry";
import { reclaimLocalStorage, safeSetItem } from "../../lib/storageQuota";

function friendlyError(raw) {
  const msg = String(raw || "");
  if (/quota/i.test(msg)) {
    return "El navegador tiene el almacenamiento lleno. Tu pago está bien: entra al panel.";
  }
  return msg;
}

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { user, login, refreshUser, loading: authLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState({ loading: !!sessionId, redirecting: false, error: null, done: false, email: "" });
  const finalizedRef = useRef(false);
  const userRef = useRef(user);
  const loginRef = useRef(login);
  const refreshUserRef = useRef(refreshUser);
  const navigateRef = useRef(navigate);

  userRef.current = user;
  loginRef.current = login;
  refreshUserRef.current = refreshUser;
  navigateRef.current = navigate;

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  function goToPanel() {
    navigateRef.current("/dashboard", { replace: true });
  }

  function goToLogin(email) {
    const url = new URL("/login", window.location.origin);
    if (email) url.searchParams.set("email", email);
    url.searchParams.set("next", "/dashboard");
    window.location.assign(`${url.pathname}${url.search}`);
  }

  async function persistSideEffects(data) {
    try {
      reclaimLocalStorage();
      if (data.userId) {
        safeSetItem(sessionStorage, "depro_pending_plan_user", data.userId);
        syncLocalSubscription(data.userId, {
          plan: data.plan,
          status: data.subscriptionStatus || "trialing",
          trialEndsAt: data.trialEndsAt,
          billingSource: "stripe",
        });
        if (data.coachClub?.id) {
          try {
            const { saveClub } = await import("../../lib/adminStorage");
            await saveClub(data.coachClub);
          } catch { /* el club ya está en clubs_detail */ }
        }
        const clubId = data.clubId;
        if (clubId) {
          registerClubCodePlayer({
            userId: data.userId,
            clubId,
            name: data.name,
            email: data.email,
            plan: data.plan,
            status: data.subscriptionStatus === "trialing" ? "trialing" : "active",
          });
        } else {
          const assoc = getPlayerClubAssoc(data.userId);
          if (assoc?.clubId) {
            registerClubCodePlayer({
              userId: data.userId,
              clubId: assoc.clubId,
              name: assoc.name || data.name,
              email: assoc.email || data.email,
              plan: data.plan || assoc.plan,
              status: data.subscriptionStatus === "trialing" ? "trialing" : "active",
            });
            applyClubBrandingToPlayer(data.userId, assoc.clubId);
          }
        }
      }
    } catch { /* localStorage lleno no puede bloquear el acceso al panel */ }
  }

  async function enterWithSession(data) {
    if (data?.password && data?.email) {
      const result = await loginRef.current(data.email, data.password);
      if (result.success) {
        try { await refreshUserRef.current(); } catch { /* ignore */ }
        goToPanel();
        return true;
      }
    }
    if (userRef.current) {
      try { await refreshUserRef.current(); } catch { /* ignore */ }
      goToPanel();
      return true;
    }
    return false;
  }

  async function finalize() {
    if (!sessionId) return;
    setStatus((s) => ({ ...s, loading: true, redirecting: false, error: null }));

    try {
      reclaimLocalStorage();
      const res = await fetch("/api/complete-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, authUserId: userRef.current?.id || undefined }),
      });
      const data = await res.json();

      if (!data.ok) {
        setStatus({
          loading: false,
          redirecting: false,
          error: friendlyError(data.error || "No se pudo activar tu cuenta"),
          done: true,
          email: data.email || "",
        });
        return;
      }

      // Login ANTES de escribir branding: si Safari está lleno, el cupo no puede abortar la sesión.
      setStatus({ loading: false, redirecting: true, error: null, done: false, email: data.email || "" });
      const entered = await enterWithSession(data);
      await persistSideEffects(data);
      if (entered) return;

      setStatus({
        loading: false,
        redirecting: false,
        error: "Pago confirmado. Pulsa para entrar al panel.",
        done: true,
        email: data.email || "",
      });
    } catch (e) {
      setStatus({
        loading: false,
        redirecting: false,
        error: friendlyError(e.message),
        done: true,
        email: "",
      });
    }
  }

  useEffect(() => {
    if (!sessionId) {
      if (!authLoading) setStatus({ loading: false, redirecting: false, error: null, done: true, email: "" });
      return;
    }
    if (authLoading || finalizedRef.current) return;
    finalizedRef.current = true;
    finalize();
  }, [sessionId, authLoading]);

  const busy = status.loading || status.redirecting;

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
          {busy
            ? "Activando tu suscripción y entrando al panel…"
            : "Tu suscripción está activa."}
        </p>

        {busy && (
          <div className="flex justify-center mb-6">
            <Loader2 size={28} className="animate-spin text-depro-blue" />
          </div>
        )}

        {status.error && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">{status.error}</p>
        )}

        {!busy && (
          <button
            type="button"
            onClick={() => {
              if (sessionId) {
                finalizedRef.current = true;
                finalize();
                return;
              }
              if (userRef.current) {
                goToPanel();
                return;
              }
              goToLogin(status.email);
            }}
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
          >
            Entrar al panel <ArrowRight size={16} />
          </button>
        )}

        {sessionId && (
          <p className="text-[10px] text-depro-gray/50 mt-6">Ref: {sessionId.slice(0, 24)}…</p>
        )}
      </div>
    </div>
  );
}
