import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Zap, Trophy, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Plan Básico",   icon: Zap,         email: "basico@depro.es",   password: "Depro2026!", color: "#0A36F7", bg: "#EEF1FF"  },
  { label: "Plan Premium",  icon: Trophy,      email: "premium@depro.es",  password: "Depro2026!", color: "#D97706", bg: "#FEFAE7"  },
  { label: "Admin",         icon: ShieldCheck, email: "jose@depro.es",     password: null,          color: "#374151", bg: "#F3F4F6", adminOnly: true },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError(result.error ?? "Email o contraseña incorrectos");
    }
  };


  return (
    <div className="min-h-screen bg-depro-gray-light flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/foto5.jpg"
          alt="DEPRO training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-depro-blue/80 to-depro-dark/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Tu plan físico,<br />
              <span className="text-depro-yellow">siempre contigo.</span>
            </h2>
            <p className="text-blue-100 text-lg">
              Accede a tu panel personalizado y comienza a entrenar con metodología profesional.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.png" alt="DEPRO" className="h-8 w-auto" />
            </Link>
            <h1 className="text-3xl font-black text-depro-dark mb-2">Bienvenido de vuelta</h1>
            <p className="text-depro-gray">Accede a tu panel de entrenamiento</p>
          </div>

          {/* Accesos rápidos demo */}
          <div className="mb-6 p-4 bg-depro-gray-light rounded-2xl border border-depro-border">
            <p className="text-[11px] font-bold text-depro-gray uppercase tracking-wide mb-3">Acceso rápido</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.filter((a) => !a.adminOnly).map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm hover:-translate-y-0.5"
                    style={{ borderColor: acc.color + "30", backgroundColor: acc.bg }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: acc.color + "20" }}>
                      <Icon size={14} style={{ color: acc.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: acc.color }}>{acc.label}</div>
                      <div className="text-[10px] text-depro-gray truncate">{acc.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-depro-gray mt-2 text-center">Pulsa para rellenar el formulario automáticamente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">Email</label>
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
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input w-full pl-10 pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-depro-dark"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-depro-red text-sm bg-depro-red-light border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <div className="spinner border-white/20 border-t-white" /> : <>
                Acceder <ArrowRight size={16} />
              </>}
            </button>
          </form>

          <p className="text-center text-sm text-depro-gray mt-6">
            ¿No tienes acceso?{" "}
            <a href="/#contacto" className="text-depro-blue hover:underline font-semibold">
              Solicitar ahora
            </a>
          </p>

          <Link to="/" className="block text-center text-sm text-depro-gray hover:text-depro-dark mt-4 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
