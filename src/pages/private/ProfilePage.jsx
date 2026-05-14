import { useState, useEffect, useRef } from "react";
import { User, Shield, CheckCircle, AlertCircle, Hash, LogOut, ChevronRight, Users, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

// Color visible sobre fondo blanco (evita blanco sobre blanco)
function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}
function safeColor(color, fallback = "#0A36F7") {
  return lum(color) > 0.75 ? fallback : (color || fallback);
}
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

// Comprimir imagen a base64 (máx 200×200, JPEG 0.75)
async function compressImage(file, maxPx = 200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width  * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { t } = useTranslation();
  const fileRef = useRef(null);

  // ── Foto de perfil ──────────────────────────────────────────
  const photoKey = `depro_player_photo_${user?.id}`;
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem(photoKey) || null);
  const [photoMsg, setPhotoMsg]         = useState("");

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      localStorage.setItem(photoKey, compressed);
      setProfilePhoto(compressed);
      setPhotoMsg("Foto guardada ✓");
      setTimeout(() => setPhotoMsg(""), 2500);
    } catch {
      setPhotoMsg("Error al guardar la foto");
    }
  };

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
      setCodeMsg(t("profile.club_not_found"));
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
    setCodeMsg(t("profile.club_found", { name: found.name }));
    setCodeLoading(false);
  };

  // ── Paso 2: unirse al equipo ────────────────────────────────
  const handleJoinTeam = async () => {
    if (!foundClub || !selectedTeam) return;
    setJoining(true);

    const team = teams.find((t) => t.id === selectedTeam);
    const assoc = { clubId: foundClub.id, teamId: selectedTeam };

    // Guardar en localStorage con nombre y plan para que el entrenador pueda leerlo
    localStorage.setItem(`depro_player_club_${user.id}`, JSON.stringify({
      ...assoc,
      name:  user.name  || user.email?.split("@")[0] || "Jugador",
      plan:  user.plan  || "Plan activo",
      email: user.email || "",
    }));

    // Registrar en el registro compartido del equipo (localStorage — funciona en local inmediatamente)
    try {
      const regKey  = `depro_team_registry_${selectedTeam}`;
      const reg     = JSON.parse(localStorage.getItem(regKey) || "[]");
      const entry   = { id: user.id, name: user.name || user.email?.split("@")[0] || "Jugador", plan: user.plan || "—", email: user.email };
      const idx     = reg.findIndex((p) => p.id === user.id);
      if (idx >= 0) reg[idx] = entry; else reg.push(entry);
      localStorage.setItem(regKey, JSON.stringify(reg));
    } catch {}

    // Actualizar Supabase user_metadata + intentar tabla player_team_links (Vercel/producción)
    try {
      await supabase.auth.updateUser({
        data: { clubId: foundClub.id, teamId: selectedTeam, teamRole: "jugador" },
      });
      await supabase.from("player_team_links").upsert({
        player_id: user.id,
        team_id:   selectedTeam,
        club_id:   foundClub.id,
        name:      user.name || user.email?.split("@")[0] || "Jugador",
        plan:      user.plan || "—",
      }, { onConflict: "player_id" });
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
    if (!window.confirm(t("profile.leave_club_confirm"))) return;
    // Leer teamId actual antes de borrar la asociación
    const oldAssoc = JSON.parse(localStorage.getItem(`depro_player_club_${user.id}`) || "{}");
    localStorage.removeItem(`depro_player_club_${user.id}`);
    // Eliminar del registro del equipo
    try {
      if (oldAssoc.teamId) {
        const regKey = `depro_team_registry_${oldAssoc.teamId}`;
        const reg    = JSON.parse(localStorage.getItem(regKey) || "[]");
        localStorage.setItem(regKey, JSON.stringify(reg.filter((p) => p.id !== user.id)));
      }
    } catch {}
    try {
      await supabase.auth.updateUser({ data: { clubId: null, teamId: null, teamRole: null } });
      await supabase.from("player_team_links").delete().eq("player_id", user.id);
    } catch {}
    setCurrentClub(null);
    setCurrentTeam(null);
    setCodeStatus(null);
    setFoundClub(null);
    await refreshUser();
  };

  const accent = safeColor(currentClub?.primaryColor);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Datos personales */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-5 flex items-center gap-2">
          <User size={18} className="text-depro-blue" /> {t("profile.title")}
        </h2>
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar con upload */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-depro-border bg-depro-blue/10 flex items-center justify-center">
              {profilePhoto
                ? <img src={profilePhoto} alt="perfil" className="w-full h-full object-cover" />
                : <span className="text-2xl font-black text-depro-blue">{user?.avatar || "?"}</span>
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-depro-blue text-white flex items-center justify-center shadow-sm hover:bg-depro-blue-dark transition-colors"
              title="Cambiar foto"
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <div className="text-lg font-bold text-depro-dark">{user?.name}</div>
            <div className="text-sm text-depro-gray">{user?.email}</div>
            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue">
              {user?.plan || "Jugador"}
            </span>
            {photoMsg && <div className="text-xs text-green-600 mt-1">{photoMsg}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {(user?.objetivo || user?.objective) && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("profile.objective")}</div>
              <div className="font-semibold text-depro-dark">{user.objetivo || user.objective}</div>
            </div>
          )}
          {user?.deporte && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("profile.sport")}</div>
              <div className="font-semibold text-depro-dark">{user.deporte}</div>
            </div>
          )}
          {(user?.frecuencia || user?.training_days || user?.trainingDays) && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("profile.frequency")}</div>
              <div className="font-semibold text-depro-dark">
                {user.frecuencia || `${user.training_days || user.trainingDays} ${t("profile.days_week")}`}
              </div>
            </div>
          )}
          {user?.material && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("profile.material")}</div>
              <div className="font-semibold text-depro-dark">{user.material}</div>
            </div>
          )}
          {(user?.lesion?.length > 0) && (
            <div className="bg-depro-gray-light rounded-xl p-3 col-span-2">
              <div className="text-xs text-depro-gray mb-0.5">{t("profile.injury")}</div>
              <div className="font-semibold text-depro-dark">{user.lesion.join(", ")}</div>
            </div>
          )}
          {user?.position && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("squad.position")}</div>
              <div className="font-semibold text-depro-dark">{user.position}</div>
            </div>
          )}
          {user?.level && (
            <div className="bg-depro-gray-light rounded-xl p-3">
              <div className="text-xs text-depro-gray mb-0.5">{t("common.active")}</div>
              <div className="font-semibold text-depro-dark">{user.level}</div>
            </div>
          )}
        </div>
      </div>

      {/* Club asociado */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
          <Shield size={18} className="text-depro-blue" /> {t("profile.my_club")}
        </h2>
        <p className="text-sm text-depro-gray mb-5">
          {t("profile.my_club_desc")}
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
              <LogOut size={14} /> {t("profile.leave_club")}
            </button>
          </div>

        ) : foundClub ? (
          /* Paso 2: seleccionar equipo */
          <div className="space-y-4">
            {/* Club encontrado */}
            {(() => { const fc = safeColor(foundClub.primaryColor); return (
            <div
              className="rounded-xl p-3 flex items-center gap-3 border"
              style={{ backgroundColor: fc + "10", borderColor: fc + "30" }}
            >
              {foundClub.logo
                ? <img src={foundClub.logo} alt={foundClub.name} className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-depro-border flex-shrink-0" />
                : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: fc + "20", color: fc }}>
                    {foundClub.abbreviation || foundClub.name?.[0]}
                  </div>
              }
              <div>
                <div className="font-bold text-depro-dark">{foundClub.name}</div>
                {foundClub.city && <div className="text-xs text-depro-gray">{foundClub.city}</div>}
              </div>
              <CheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
            </div>
            ); })()}

            {/* Selector de equipo */}
            {teams.length > 0 ? (() => {
              const clubColor = safeColor(foundClub.primaryColor);
              const clubTextContrast = contrastText(clubColor);
              return (
                <div>
                  <label className="block text-sm font-semibold text-depro-dark mb-2">
                    {t("profile.select_team")}
                  </label>
                  <div className="space-y-2">
                    {teams.map((team) => {
                      const isSel = selectedTeam === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            isSel ? "" : "border-depro-border hover:border-depro-blue/40 bg-white"
                          }`}
                          style={isSel ? { borderColor: clubColor, backgroundColor: clubColor + "10" } : {}}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                            style={{ backgroundColor: clubColor + "20", color: clubColor }}
                          >
                            {team.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-depro-dark text-sm">{team.name}</div>
                            {team.category && <div className="text-xs text-depro-gray">{team.category}{team.season ? ` · ${team.season}` : ""}</div>}
                            {team.coach?.name && <div className="text-xs text-depro-gray">{t("profile.coach_label")}: {team.coach.name}</div>}
                          </div>
                          {isSel && <CheckCircle size={18} style={{ color: clubColor }} className="flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })() : (
              <p className="text-sm text-depro-gray bg-depro-gray-light rounded-xl p-3">
                {t("profile.no_teams")}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setFoundClub(null); setTeams([]); setCodeStatus(null); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-depro-border text-sm font-semibold text-depro-dark hover:bg-depro-gray-light transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={joining || !selectedTeam}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: safeColor(foundClub.primaryColor), color: contrastText(safeColor(foundClub.primaryColor)) }}
              >
                {joining
                  ? <div className="spinner border-white/20 border-t-white w-4 h-4" />
                  : <>{t("profile.join_team")} <ChevronRight size={15} /></>
                }
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
                {t("profile.search_club")} <ChevronRight size={15} />
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
          <LogOut size={16} /> {t("profile.logout")}
        </button>
      </div>
    </div>
  );
}
