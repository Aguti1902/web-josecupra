import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await resetPasswordForEmail(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "No se pudo enviar el email");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-depro-dark mb-2">Revisa tu email</h1>
          <p className="text-sm text-depro-gray mb-6 leading-relaxed">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            Volver al login <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full">
        <Link to="/"><img src="/logo.png" alt="DEPRO" className="h-8 mb-8" /></Link>
        <h1 className="text-2xl font-black text-depro-dark mb-2">Recuperar contraseña</h1>
        <p className="text-sm text-depro-gray mb-6">Te enviaremos un enlace para crear una nueva contraseña.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input w-full pl-10"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-depro-red text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Enviar enlace <ArrowRight size={16} /></>}
          </button>
        </form>

        <Link to="/login" className="block text-center text-sm text-depro-gray hover:text-depro-dark mt-6">← Volver al login</Link>
        <div className="flex justify-center mt-6"><LanguageSwitcher /></div>
      </div>
    </div>
  );
}
