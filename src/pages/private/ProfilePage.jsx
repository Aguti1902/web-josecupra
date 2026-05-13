import { useState, useEffect } from "react";
import { User, Shield, CheckCircle, AlertCircle, Hash, LogOut, ChevronRight, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();

  // Paso 1: introducir código
  const [clubCode, setClubCode]     = useState("");
  const [codeStatus, setCodeStatus] = useState(null);
  const [codeMsg, setCodeMsg]       = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  // Paso 2: seleccionar equipo
  const [foundClub, setFoundClub]   = useState(null);  // club encontrado por código
  const [teams, setTeams]           = useState([]);     // equipos disponibles
  const [selectedTeam, setSelectedTeam] = useState(""); // id del equipo elegido
  const [joining, setJoining]       = useState(false);

  // Club actual del jugador
  const [currentClub, setCurrentClub] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const raw = localStorage.getItem(`depro_player_club_${user.id}`);
    if (!raw) { setCurrentClub(user?.club || null); return; }
    try {
      const parsed = JSON.parse(raw);
      const clubId  = typeof parsed === "object" ? parsed.clubId  : parsed;
      const teamId  = typeof parsed === "object" ? parsed.teamId  : null;
      const clubs   = lsGet("depro_clubs", []);
      const club    = clubs.find((c) => c.id === clubId) || null;
      // Enriquecer con logo/colors desde detail
      if (club) {
        const detail = lsGet(`depro_club_${clubId}`, null);
        if (detail) Object.assign(club, {
          logo: detail.logo || club.logo,
          primaryColor: detail.primaryColor || club.primaryColor,
          secondaryColor: detail.secondaryColor || club.secondaryColor,
          slogan: detail.slogan || club.slogan,
          teams: detail.teams || club.teams || [],
        });
        setCurrentClub(club);
        if (teamId) {
          const t = (club.teams || []).find((t) => t.id === teamId);
          setCurrentTeam(t || null);
        }
      }
    } catch {
      setCurrentClub(user?.club || null);
    }
  }, [user]);

  // ── Paso 1: validar código ──────────────────────────────────
  const handleCheckCode = (e) => {
    e.preventDefault();
    if (!clubCode.trim()) return;
    setCodeLoading(true);
    setCodeStatus(null);

    const clubs = lsGet("depro_clubs", []);
    const code  = clubCode.trim().toUpperCase();
    const found = clubs.find(
      (c) => (c.loginCode || c.login_code || "").toUpperCase() === code
    );

    if (!found) {
      setCodeStatus("error");
      setCodeMsg("Código no válido. Pide el código a tu entrenador o coordinador.");
      setCodeLoading(false);
      return;
    }

    // Cargar equipos desde el detail del club
    const detail = lsGet(`depro_club_${found.id}`, null);
    const clubTeams = detail?.teams || found.teams || [];
    const enriched  = { ...found, ...(detail || {}), teams: clubTeams };

    setFoundClub(enriched);
    setTeams(clubTeams);
    setSelectedTeam(clubTeams[0]?.id || "");
    setCodeStatus("ok");
    setCodeMsg(`Club encontrado: ${found.name}. Ahora elige tu equipo.`);
    setCodeLoading(false);
  };

  // ── Paso 2: unirse al equipo ────────────────────────────────
  const handleJoinTeam = async () => {
    if (!foundClub || !selectedTeam) return;
    setJoining(true);

    const team = teams.find((t) => t.id === selectedTeam);
    const assoc = { clubId: foundClub.id, teamId: selectedTeam };

    // Guardar en localStorage
    localStorage.setItem(`depro_player_club_${user.id}`, JSON.stringify(assoc));

    // Actualizar Supabase user_metadata
    try {
      await supabase.auth.updateUser({
        data: { clubId: foundClub.id, teamId: selectedTeam, teamRole: "jugador" },
      });
    } catch {}

    setCurrentClub(foundClub);
    setCurrentTeam(team || null);
    setFoundClub(null);
    setTeams([]);
    setClubCode("");
    setCodeStatus(null);
    setJoining(false);

    await refreshUser();
  };

  // ── Salir del club ──────────────────────────────────────────
  const handleLeaveClub = async () => {
    if (!window.confirm("¿Seguro que quieres salir del club? Tu perfil personal seguirá activo.")) return;
    localStorage.removeItem(`depro_player_club_${user.id}`);
    try {
      await supabase.auth.updateUser({ data: { clubId: null, teamId: null, teamRole: null } });
    } catch {}
    setCurrentClub(null);
    setCurrentTeam(null);
    setCodeStatus(null);
    setFoundClub(null);
    await refreshUser();
  };

  const accent = currentClub?.primaryColor || "#0A36F7";

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
          <Shield size={18} className="text-depro-blue" /> Mi club
        </h2>
        <p className="text-sm text-depro-gray mb-5">
          Introduce el código que te ha dado tu entrenador para asociarte a tu equipo. El entrenador podrá ver tus estadísticas y entrenos desde el panel del club.
        </p>

        {currentClub ? (
          /* Club ya asociado */
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 flex items-center gap-4 border"
              style={{
                background: `linear-gradient(135deg, ${accent}10, white)`,
                borderColor: accent + "30",
              }}
            >
              {currentClub.logo ? (
                <img src={currentClub.logo} alt={currentClub.name} className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-depro-border flex-shrink-0" />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
                  style={{ backgroundColor: accent + "15", color: accent }}
                >
                  {currentClub.abbreviation || currentClub.name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-depro-dark text-base">{currentClub.name}</div>
                {currentClub.city && <div className="text-xs text-depro-gray mt-0.5">{currentClub.city}</div>}
                {currentTeam && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Users size={11} style={{ color: accent }} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>
                      {currentTeam.name}
                    </span>
                    {currentTeam.category && <span className="text-xs text-depro-gray">{currentTeam.category}</span>}
                  </div>
                )}
                {currentClub.slogan && (
                  <div className="text-xs italic mt-1" style={{ color: accent }}>"{currentClub.slogan}"</div>
                )}
              </div>
              <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
            </div>

            <button
              onClick={handleLeaveClub}
              className="flex items-center gap-2 text-sm text-depro-gray hover:text-red-500 transition-colors"
            >
              <LogOut size={14} /> Salir del club
            </button>
          </div>

        ) : foundClub ? (
          /* Paso 2: seleccionar equipo */
          <div className="space-y-4">
            {/* Club encontrado */}
            <div
              className="rounded-xl p-3 flex items-center gap-3 border"
              style={{ backgroundColor: (foundClub.primaryColor || "#0A36F7") + "08", borderColor: (foundClub.primaryColor || "#0A36F7") + "30" }}
            >
              {foundClub.logo
                ? <img src={foundClub.logo} alt={foundClub.name} className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-depro-border flex-shrink-0" />
                : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: (foundClub.primaryColor || "#0A36F7") + "15", color: foundClub.primaryColor || "#0A36F7" }}>
                    {foundClub.abbreviation || foundClub.name?.[0]}
                  </div>
              }
              <div>
                <div className="font-bold text-depro-dark">{foundClub.name}</div>
                {foundClub.city && <div className="text-xs text-depro-gray">{foundClub.city}</div>}
              </div>
              <CheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
            </div>

            {/* Selector de equipo */}
            {teams.length > 0 ? (
              <div>
                <label className="block text-sm font-semibold text-depro-dark mb-2">
                  Elige tu equipo
                </label>
                <div className="space-y-2">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeam(t.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedTeam === t.id
                          ? "border-2"
                          : "border-depro-border hover:border-depro-blue/40"
                      }`}
                      style={selectedTeam === t.id ? { borderColor: foundClub.primaryColor || "#0A36F7", backgroundColor: (foundClub.primaryColor || "#0A36F7") + "06" } : {}}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ backgroundColor: (foundClub.primaryColor || "#0A36F7") + "15", color: foundClub.primaryColor || "#0A36F7" }}
                      >
                        {t.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-depro-dark text-sm">{t.name}</div>
                        {t.category && <div className="text-xs text-depro-gray">{t.category} · {t.season}</div>}
                        {t.coach?.name && <div className="text-xs text-depro-gray">Entrenador: {t.coach.name}</div>}
                      </div>
                      {selectedTeam === t.id && <CheckCircle size={16} style={{ color: foundClub.primaryColor || "#0A36F7" }} />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-depro-gray bg-depro-gray-light rounded-xl p-3">
                Este club aún no tiene equipos creados. Contacta con tu coordinador.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setFoundClub(null); setTeams([]); setCodeStatus(null); }}
                className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm text-depro-gray hover:bg-depro-gray-light transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={joining || !selectedTeam}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: foundClub.primaryColor || "#0A36F7", color: "#fff" }}
              >
                {joining ? <div className="spinner border-white/20 border-t-white w-4 h-4" /> : <>
                  Unirme al equipo <ChevronRight size={15} />
                </>}
              </button>
            </div>
          </div>

        ) : (
          /* Paso 1: introducir código */
          <form onSubmit={handleCheckCode} className="space-y-3">
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={clubCode}
                onChange={(e) => setClubCode(e.target.value.toUpperCase())}
                placeholder="Ej: RMC2026"
                className="admin-input w-full pl-10 font-mono tracking-widest uppercase"
                maxLength={12}
              />
            </div>

            {codeStatus === "error" && (
              <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl border bg-red-50 text-red-700 border-red-200">
                <AlertCircle size={15} className="flex-shrink-0" />
                {codeMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={codeLoading || !clubCode.trim()}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {codeLoading ? <div className="spinner border-white/20 border-t-white" /> : <>
                Buscar club <ChevronRight size={15} />
              </>}
            </button>
          </form>
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="bg-white border border-depro-border rounded-2xl p-4">
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-depro-gray hover:text-red-500 text-sm font-medium transition-colors w-full py-1.5 px-2 rounded-xl hover:bg-red-50"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
