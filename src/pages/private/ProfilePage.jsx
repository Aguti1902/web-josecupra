import { useState, useEffect } from "react";
import { User, Shield, CheckCircle, AlertCircle, Hash, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const [clubCode, setClubCode] = useState("");
  const [codeStatus, setCodeStatus] = useState(null); // null | "ok" | "error"
  const [codeMsg, setCodeMsg]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [currentClub, setCurrentClub] = useState(null);

  // Cargar club actual del jugador
  useEffect(() => {
    if (!user?.id) return;
    const clubId = localStorage.getItem(`depro_player_club_${user.id}`);
    if (clubId) {
      const clubs = lsGet("depro_clubs", []);
      const found = clubs.find((c) => c.id === clubId);
      if (found) setCurrentClub(found);
    } else if (user?.club) {
      setCurrentClub(user.club);
    }
  }, [user]);

  const handleJoinClub = async (e) => {
    e.preventDefault();
    if (!clubCode.trim()) return;
    setLoading(true);
    setCodeStatus(null);

    const clubs = lsGet("depro_clubs", []);
    const code = clubCode.trim().toUpperCase();
    const found = clubs.find(
      (c) => (c.loginCode || c.login_code || "").toUpperCase() === code
    );

    if (!found) {
      setCodeStatus("error");
      setCodeMsg("Código no válido. Pide el código a tu entrenador o coordinador.");
      setLoading(false);
      return;
    }

    // Guardar asociación en localStorage
    localStorage.setItem(`depro_player_club_${user.id}`, found.id);

    // Intentar actualizar user_metadata en Supabase
    try {
      await supabase.auth.updateUser({
        data: { clubId: found.id },
      });
    } catch {}

    setCurrentClub(found);
    setCodeStatus("ok");
    setCodeMsg(`Te has unido a ${found.name} correctamente.`);
    setClubCode("");
    setLoading(false);

    // Refrescar el user en el contexto para que el dashboard use los nuevos colores
    await refreshUser();
  };

  const handleLeaveClub = async () => {
    if (!window.confirm("¿Seguro que quieres salir del club? Tu perfil personal seguirá activo.")) return;
    localStorage.removeItem(`depro_player_club_${user.id}`);
    try { await supabase.auth.updateUser({ data: { clubId: null } }); } catch {}
    setCurrentClub(null);
    setCodeStatus(null);
    setCodeMsg("");
    await refreshUser();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Datos personales */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-5 flex items-center gap-2">
          <User size={18} className="text-depro-blue" /> Mi perfil
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-depro-blue/10 flex items-center justify-center text-2xl font-black text-depro-blue flex-shrink-0">
            {user?.avatar || "?"}
          </div>
          <div>
            <div className="text-lg font-bold text-depro-dark">{user?.name}</div>
            <div className="text-sm text-depro-gray">{user?.email}</div>
            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue">
              {user?.plan || "Jugador"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {user?.position && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">Posición</div>
              <div className="font-semibold text-depro-dark">{user.position}</div>
            </div>
          )}
          {user?.level && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">Nivel</div>
              <div className="font-semibold text-depro-dark">{user.level}</div>
            </div>
          )}
          {(user?.training_days || user?.trainingDays) && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">Días de entreno</div>
              <div className="font-semibold text-depro-dark">{user.training_days || user.trainingDays} días / semana</div>
            </div>
          )}
          {user?.objective && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">Objetivo</div>
              <div className="font-semibold text-depro-dark">{user.objective}</div>
            </div>
          )}
        </div>
      </div>

      {/* Club asociado */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
          <Shield size={18} className="text-depro-blue" /> Club
        </h2>
        <p className="text-sm text-depro-gray mb-5">
          Si perteneces a un club, introduce el código que te ha dado tu entrenador o coordinador para ver el branding y sesiones de tu club.
        </p>

        {currentClub ? (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 flex items-center gap-4 border"
              style={{
                background: `linear-gradient(135deg, ${currentClub.primaryColor || "#0A36F7"}10, white)`,
                borderColor: (currentClub.primaryColor || "#0A36F7") + "30",
              }}
            >
              {currentClub.logo ? (
                <img src={currentClub.logo} alt={currentClub.name} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-depro-border flex-shrink-0" />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                  style={{ backgroundColor: (currentClub.primaryColor || "#0A36F7") + "15", color: currentClub.primaryColor || "#0A36F7" }}
                >
                  {currentClub.abbreviation || currentClub.name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-depro-dark">{currentClub.name}</div>
                <div className="text-xs text-depro-gray mt-0.5">{currentClub.city}</div>
                {currentClub.slogan && (
                  <div className="text-xs italic mt-0.5" style={{ color: currentClub.primaryColor || "#0A36F7" }}>
                    "{currentClub.slogan}"
                  </div>
                )}
              </div>
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            </div>

            <button
              onClick={handleLeaveClub}
              className="flex items-center gap-2 text-sm text-depro-gray hover:text-depro-red transition-colors"
            >
              <LogOut size={14} /> Salir del club
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoinClub} className="space-y-3">
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={clubCode}
                onChange={(e) => setClubCode(e.target.value.toUpperCase())}
                placeholder="Ej: RMC2025"
                className="admin-input w-full pl-10 font-mono tracking-widest uppercase"
                maxLength={12}
              />
            </div>

            {codeStatus && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
                codeStatus === "ok"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-depro-red border-red-200"
              }`}>
                {codeStatus === "ok"
                  ? <CheckCircle size={15} />
                  : <AlertCircle size={15} className="flex-shrink-0" />}
                {codeMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !clubCode.trim()}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="spinner border-white/20 border-t-white" /> : <>
                Unirme al club <ChevronRight size={15} />
              </>}
            </button>
          </form>
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="bg-white border border-depro-border rounded-2xl p-4">
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-depro-gray hover:text-depro-red text-sm font-medium transition-colors w-full py-1.5 px-2 rounded-xl hover:bg-red-50"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
