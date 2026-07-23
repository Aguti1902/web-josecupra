import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const { updatePassword, recoverSessionFromHash } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    recoverSessionFromHash().then((ok) => setReady(ok));
  }, [recoverSessionFromHash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
    } else {
      setError(result.error || "No se pudo actualizar la contraseña");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <Loader2 size={28} className="animate-spin text-depro-blue mx-auto mb-4" />
          <p className="text-sm text-depro-gray">Validando enlace de recuperación…</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-depro-dark mb-2">Contraseña actualizada</h1>
          <p className="text-sm text-depro-gray">Redirigiendo al panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full">
        <Link to="/"><img src="/logo.png" alt="DEPRO" className="h-8 mb-8" /></Link>
        <h1 className="text-2xl font-black text-depro-dark mb-2">Nueva contraseña</h1>
        <p className="text-sm text-depro-gray mb-6">Elige una contraseña segura para tu cuenta DEPRO.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input w-full pl-10 pr-11"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Confirmar contraseña</label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="admin-input w-full"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-depro-red text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Guardar contraseña <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
