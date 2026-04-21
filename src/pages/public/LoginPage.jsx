import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
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
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  const demoAccounts = [
    { label: "🛡️ Admin (Jose)", email: "jose@admin.com", password: "admin123" },
    { label: "Player (Marcus)", email: "marcus@demo.com", password: "demo123" },
    { label: "Club (Athletic)", email: "club@demo.com", password: "demo123" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-pitch-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">JOSE FOOTBALL</div>
            <div className="text-brand-400 text-xs font-semibold tracking-widest">TRAINING SYSTEMS</div>
          </div>
        </Link>

        {/* Card */}
        <div className="card-dark border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-2">Access your training dashboard</p>
          </div>

          {/* Demo shortcuts */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 text-center mb-3">Try a demo account:</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-white/5 hover:border-white/15 rounded-lg py-2 px-2 text-gray-400 hover:text-white transition-all text-center"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have access yet?{" "}
            <a href="/#cta" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Apply now
            </a>
          </p>
        </div>

        <Link to="/" className="block text-center text-sm text-gray-600 hover:text-gray-400 transition-colors mt-6">
          ← Back to main site
        </Link>
      </div>
    </div>
  );
}
