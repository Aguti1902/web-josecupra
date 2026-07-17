import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff,
  Gift, Layers, Sparkles, Loader2, CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const SIDEBAR_CARDS = [
  { icon: Gift, title: "15 días gratis", desc: "Sin tarjeta de crédito" },
  { icon: Layers, title: "3 perfiles en uno", desc: "Coach · Club · Jugador" },
  { icon: Sparkles, title: "Planificación IA", desc: "Microciclos automáticos" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Detectar retorno de Google OAuth (hash con token)
  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      sessionStorage.setItem("depro_oauth_pending", "1");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Tras OAuth o login normal, redirigir al dashboard (con pantalla de éxito si viene de Google)
  useEffect(() => {
    if (!user) return;

    const fromOAuth = sessionStorage.getItem("depro_oauth_pending") === "1";
    if (fromOAuth) {
      sessionStorage.removeItem("depro_oauth_pending");
      setOauthSuccess(true);
      const timer = setTimeout(() => {
        navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }

    navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError(result.error ?? t("login.error_default"));
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    sessionStorage.setItem("depro_oauth_pending", "1");
    const result = await loginWithGoogle();
    if (!result.success) {
      sessionStorage.removeItem("depro_oauth_pending");
      setError(result.error || "No se pudo conectar con Google");
      setGoogleLoading(false);
    }
    // Si success, el browser redirige a Google OAuth
  };

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "DEPRO";

  if (oauthSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-depro-dark mb-2">¡Tu usuario está listo!</h2>
          <p className="text-depro-gray text-sm mb-8 leading-relaxed">
            ¡Bienvenido a bordo, {firstName}! Te estamos llevando a DEPRO…
          </p>
          <Loader2 size={24} className="animate-spin text-depro-blue mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — estilo Holded onboarding */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-depro-blue rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/">
            <img src="/logo blanco.png" alt="DEPRO" className="h-7 w-auto mb-16" />
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Bienvenido de nuevo</p>
          <h2 className="text-3xl xl:text-4xl font-black leading-tight mb-4">
            Preparación física inteligente para tu equipo.
          </h2>
          <p className="text-indigo-200/80 text-sm leading-relaxed max-w-sm">
            Planifica, monitoriza y optimiza el rendimiento desde cualquier dispositivo. 100% en la nube.
          </p>
        </div>
        <div className="relative space-y-3">
          {SIDEBAR_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-indigo-200" />
              </div>
              <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-indigo-200/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/"><img src="/logo.png" alt="DEPRO" className="h-8" /></Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-depro-dark mb-2">{t("login.title")}</h1>
          <p className="text-depro-gray text-sm mb-8">{t("login.subtitle")}</p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-depro-border bg-white font-semibold text-sm text-depro-dark hover:border-depro-blue hover:bg-depro-gray-light/50 transition-all disabled:opacity-60 mb-6"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-depro-gray" />
            ) : (
              <GoogleIcon />
            )}
            Continuar con Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-depro-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-depro-gray font-medium">o con email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("login.email")}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input w-full pl-10"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("login.password")}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input w-full pl-10 pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-depro-dark">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-depro-red text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading || googleLoading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 rounded-xl"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t("login.submit")} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-depro-gray mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/comprar" className="font-bold text-depro-blue hover:underline">
              Prueba 15 días gratis
            </Link>
          </p>

          <div className="flex justify-center mt-6">
            <LanguageSwitcher />
          </div>
          <Link to="/" className="block text-center text-sm text-depro-gray hover:text-depro-dark mt-4 transition-colors">
            ← {t("common.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
