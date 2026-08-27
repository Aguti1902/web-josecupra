import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  if (/abort|timeout|tiempo/i.test(msg)) {
    return "Pago confirmado. Pulsa para entrar al panel.";
  }
  return msg;
}

function fetchJson(url, options, ms = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { user, login, loading: authLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState({ loading: !!sessionId, redirecting: false, error: null, done: false, email: "" });
  const finalizedRef = useRef(false);
  const userRef = useRef(user);
  const loginRef = useRef(login);
  const lastDataRef = useRef(null);

  userRef.current = user;
  loginRef.current = login;

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  function goToPanel() {
    window.location.replace("/dashboard");
  }

  function goToLogin(email) {
    const url = new URL("/login", window.location.origin);
    if (email) url.searchParams.set("email", email);
    url.searchParams.set("next", "/dashboard");
    window.location.assign(`${url.pathname}${url.search}`);
  }

  function persistSideEffects(data) {
    try {
      reclaimLocalStorage();
      if (!data?.userId) return;
      safeSetItem(sessionStorage, "depro_pending_plan_user", data.userId);
      syncLocalSubscription(data.userId, {
        plan: data.plan,
        status: data.subscriptionStatus || "trialing",
        trialEndsAt: data.trialEndsAt,
        billingSource: "stripe",
      });
      if (data.coachClub?.id) {
        try {
          localStorage.setItem(`depro_club_${data.coachClub.id}`, JSON.stringify(data.coachClub));
        } catch { /* cupo */ }
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
    } catch { /* no bloquear el acceso al panel */ }
  }

  async function enterWithSession(data) {
    if (data?.password && data?.email) {
      const result = await withTimeout(
        loginRef.current(data.email, data.password),
        7000,
        { success: false },
      );
      if (result?.success) {
        goToPanel();
        return true;
      }
    }
    if (userRef.current) {
      goToPanel();
      return true;
    }
    return false;
  }

  async function finalize() {
    if (!sessionId) return;
    setStatus((s) => ({ ...s, loading: true, redirecting: false, error: null }));

    const watchdog = setTimeout(() => {
      setStatus((s) => ({
        loading: false,
        redirecting: false,
        error: s.error || "Pago confirmado. Pulsa para entrar al panel.",
        done: true,
        email: s.email || lastDataRef.current?.email || "",
      }));
    }, 8000);

    try {
      reclaimLocalStorage();
      const res = await fetchJson("/api/complete-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, authUserId: userRef.current?.id || undefined }),
      }, 12000);
      const data = await res.json();
      lastDataRef.current = data;

      if (!data.ok) {
        clearTimeout(watchdog);
        setStatus({
          loading: false,
          redirecting: false,
          error: friendlyError(data.error || "No se pudo activar tu cuenta"),
          done: true,
          email: data.email || "",
        });
        return;
      }

      persistSideEffects(data);
      setStatus({ loading: false, redirecting: true, error: null, done: false, email: data.email || "" });
      const entered = await enterWithSession(data);
      if (entered) return;

      clearTimeout(watchdog);
      setStatus({
        loading: false,
        redirecting: false,
        error: "Pago confirmado. Pulsa para entrar al panel.",
        done: true,
        email: data.email || "",
      });
    } catch (e) {
      clearTimeout(watchdog);
      setStatus({
        loading: false,
        redirecting: false,
        error: friendlyError(e.name === "AbortError" ? "timeout" : e.message),
        done: true,
        email: lastDataRef.current?.email || "",
      });
    }
  }

  useEffect(() => {
    if (!sessionId) {
      if (!authLoading) setStatus({ loading: false, redirecting: false, error: null, done: true, email: "" });
      return;
    }
    if (finalizedRef.current) return;
    if (authLoading) {
      const t = setTimeout(() => {
        if (finalizedRef.current) return;
        finalizedRef.current = true;
        finalize();
      }, 1200);
      return () => clearTimeout(t);
    }
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

        <button
          type="button"
          onClick={() => {
            const data = lastDataRef.current;
            if (userRef.current) {
              goToPanel();
              return;
            }
            if (data?.ok && data.password && data.email) {
              finalizedRef.current = true;
              enterWithSession(data);
              return;
            }
            if (sessionId && !data?.ok) {
              finalize();
              return;
            }
            goToLogin(status.email || data?.email || "");
          }}
          className={`btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 ${busy ? "mt-2" : ""}`}
        >
          Entrar al panel <ArrowRight size={16} />
        </button>

        {sessionId && (
          <p className="text-[10px] text-depro-gray/50 mt-6">Ref: {sessionId.slice(0, 24)}…</p>
        )}
      </div>
    </div>
  );
}
