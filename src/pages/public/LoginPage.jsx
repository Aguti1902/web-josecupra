import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
    await new Promise((r) => setTimeout(r, 500));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(email === "jose@admin.com" ? "/admin" : "/dashboard");
    } else {
      setError(result.error);
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

          <div className="mb-6">
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
