import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Camera, Lock, Mail, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Shield, Crown, UserCheck, Dumbbell,
  Sparkles, SlidersHorizontal, CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { loadClubDetail, saveClubDetail } from "../../lib/adminStorage";
import { clearCoachGeneratedPlans } from "../../lib/coachSessionsStorage";
import PlanUsageCard from "../../components/private/PlanUsageCard";
import { canManageClubBilling, canSeeClubPricing, clubRoleLabel } from "../../lib/clubRoles";
import TeamBrandingFields from "../../components/shared/TeamBrandingFields";
import CoachAutoQuestionnaire, {
  questionnaireToCoachConfig,
} from "../../components/shared/CoachAutoQuestionnaire";
import {
  coachConfigToQuestionnaire,
  categoryForNivel,
} from "../../lib/clubAuto/clubAutoCoachBridge";

// Comprime imagen de perfil a 200×200
function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        const sx  = (img.width  - min) / 2;
        const sy  = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const ROLE_LABEL = { administrador: "Administrador", coordinador: "Coordinador", entrenador: "Entrenador", ayudante: "Ayudante técnico" };
const ROLE_ICON  = { administrador: Crown, coordinador: Crown, entrenador: UserCheck, ayudante: Dumbbell };

export default function ClubProfilePage() {
  const { user, refreshUser } = useAuth();
  const accent     = user?.club?.primaryColor || "#0A36F7";
  const teamRole   = user?.team_role;
  const RoleIcon   = ROLE_ICON[teamRole] || UserCheck;

  // ── Estado ────────────────────────────────────────────────
  const [photo, setPhoto]       = useState(null);
  const [name, setName]         = useState(user?.name || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [msg, setMsg]           = useState(null); // { type: "ok"|"error", text }
  const [saving, setSaving]     = useState(false);
  const [mode, setMode]         = useState(user?.club?.mode || "depro");
  const [savingMode, setSavingMode] = useState(false);
  const [branding, setBranding] = useState({
    logo: user?.club?.logo || "",
    primaryColor: user?.club?.primaryColor || "#0A36F7",
    secondaryColor: user?.club?.secondaryColor || "#ffffff",
  });
  const [savingBranding, setSavingBranding] = useState(false);
  const [autoQ, setAutoQ] = useState(() => coachConfigToQuestionnaire(user?.club?.coachConfig || {}));
  const [savingAutoQ, setSavingAutoQ] = useState(false);
  const photoRef = useRef();
  const isSoloCoach = !!user?.club?.isSoloCoach;
  const showBilling = canManageClubBilling(user) && canSeeClubPricing(user);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  useEffect(() => {
    setAutoQ(coachConfigToQuestionnaire(user?.club?.coachConfig || {}));
    setMode(user?.club?.mode || "depro");
  }, [user?.club?.coachConfig, user?.club?.mode]);

  const handleChangeMode = async (nextMode) => {
    if (nextMode === mode || !user?.club?.id) return;
    setSavingMode(true);
    setMode(nextMode);
    const detail = loadClubDetail(user.club.id) || user.club;
    const prevCfg = detail.coachConfig || {};
    const nextCfg = nextMode === "personalizado"
      ? { ...prevCfg, mode: "personalizado", engine: "manual" }
      : { ...prevCfg, mode: "depro", engine: "club_auto" };
    await saveClubDetail(user.club.id, {
      ...detail,
      mode: nextMode,
      planningMode: nextMode === "personalizado" ? "manual" : "auto",
      coachConfig: nextCfg,
    });
    clearCoachGeneratedPlans(user.club.id, user.teamId);
    await refreshUser();
    setSavingMode(false);
    showMsg("ok", nextMode === "personalizado" ? "Modo «Llevado por mí» activado." : "Modo automático activado.");
  };

  const handleSaveBranding = async () => {
    if (!user?.club?.id) return;
    setSavingBranding(true);
    const detail = loadClubDetail(user.club.id) || user.club;
    await saveClubDetail(user.club.id, {
      ...detail,
      logo: branding.logo || null,
      primaryColor: branding.primaryColor || "#0A36F7",
      secondaryColor: branding.secondaryColor || "#ffffff",
    });
    await refreshUser();
    setSavingBranding(false);
    showMsg("ok", "Escudo y colores guardados.");
  };

  const handleSaveAutoQuestionnaire = async () => {
    if (!user?.club?.id) return;
    const packed = questionnaireToCoachConfig(autoQ);
    if (!packed.ok) {
      showMsg("error", packed.errors.join(" "));
      return;
    }
    setSavingAutoQ(true);
    const detail = loadClubDetail(user.club.id) || user.club;
    const teams = Array.isArray(detail.teams) ? detail.teams.map((t) => (
      t.id === user.teamId
        ? {
            ...t,
            trainingDays: packed.config.dias_exactos_entrenamiento,
            category: categoryForNivel(packed.config.nivel),
          }
        : t
    )) : detail.teams;
    await saveClubDetail(user.club.id, {
      ...detail,
      mode: "depro",
      planningMode: "auto",
      coachConfig: { ...(detail.coachConfig || {}), ...packed.config, mode: "depro", engine: "club_auto" },
      teams,
    });
    clearCoachGeneratedPlans(user.club.id, user.teamId);
    await refreshUser();
    setSavingAutoQ(false);
    showMsg("ok", "Cuestionario guardado. Se regenerará el microciclo automático.");
  };

  // Cargar foto guardada en localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`depro_club_profile_${user?.id}`);
    if (saved) setPhoto(saved);
  }, [user?.id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressAvatar(file);
      localStorage.setItem(`depro_club_profile_${user?.id}`, compressed);
      setPhoto(compressed);
      showMsg("ok", "Foto actualizada correctamente.");
    } catch {
      showMsg("error", "No se pudo procesar la imagen. Prueba con otra.");
    }
  };

  // ── Guardar nombre ────────────────────────────────────────
  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (error) throw error;
      await refreshUser();
      showMsg("ok", "Nombre actualizado correctamente.");
    } catch (e) {
      showMsg("error", e.message || "No se pudo actualizar el nombre.");
    }
    setSaving(false);
  };

  // ── Cambiar contraseña ────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { showMsg("error", "Las contraseñas no coinciden."); return; }
    if (newPw.length < 6)    { showMsg("error", "La contraseña debe tener al menos 6 caracteres."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showMsg("ok", "Contraseña cambiada correctamente.");
    } catch (e) {
      showMsg("error", e.message || "No se pudo cambiar la contraseña.");
    }
    setSaving(false);
  };

  return (
    <div className="dash-page">

      {/* Mensaje flotante */}
      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          msg.type === "ok"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-depro-red border-red-200"
        }`}>
          {msg.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      {/* Tarjeta de perfil */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        {/* Header con color del club */}
        <div
          className="h-20 relative"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}BB 100%)` }}
        >
          {user?.club?.banner && (
            <img src={user.club.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar flotante sobre el header */}
          <div className="relative -mt-10 mb-4 flex items-end gap-4">
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: accent + "20", color: accent }}
              >
                {photo
                  ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                  : (user?.avatar || "?")}
              </div>
              <button
                onClick={() => photoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-depro-blue border-2 border-white flex items-center justify-center hover:bg-depro-blue-dark transition-colors shadow"
                title="Cambiar foto"
              >
                <Camera size={12} className="text-white" />
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-black text-depro-dark leading-tight">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: accent + "15", color: accent }}
                >
                  <RoleIcon size={10} /> {clubRoleLabel(teamRole)}
                </span>
                {user?.team && (
                  <span className="text-xs text-depro-gray">· {user.team.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Info del club */}
          {user?.club && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-5 border"
              style={{ backgroundColor: accent + "08", borderColor: accent + "25" }}
            >
              {user.club.logo ? (
                <img src={user.club.logo} alt={user.club.name} className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-depro-border flex-shrink-0" />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ backgroundColor: accent + "15", color: accent }}
                >
                  {user.club.abbreviation || user.club.name?.[0]}
                </div>
              )}
              <div>
                <div className="font-semibold text-sm text-depro-dark">{user.club.name}</div>
                {user.club.slogan && <div className="text-xs italic text-depro-gray">"{user.club.slogan}"</div>}
              </div>
            </div>
          )}

          <p className="text-xs text-depro-gray mb-2 flex items-center gap-1">
            <Mail size={11} /> {user?.email}
          </p>
        </div>
      </div>

      {/* Identidad del equipo — solo entrenador individual (no tiene ClubSettings) */}
      {isSoloCoach && (
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-depro-dark mb-1">Identidad del equipo</h3>
          <p className="text-xs text-depro-gray">Escudo y colores que se muestran en tu panel.</p>
          <TeamBrandingFields
            logo={branding.logo}
            primaryColor={branding.primaryColor}
            secondaryColor={branding.secondaryColor}
            onChange={setBranding}
          />
          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={savingBranding}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} /> {savingBranding ? "Guardando…" : "Guardar identidad"}
          </button>
        </div>
      )}

      {/* Cuestionario corto del motor automático (punto 4 del documento) */}
      {isSoloCoach && mode !== "personalizado" && (
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-depro-dark mb-1">Cuestionario del entrenador</h3>
            <p className="text-xs text-depro-gray">
              Nivel, días de entreno, día de partido y gimnasio. Sin metodología ni número de jugadores.
            </p>
          </div>
          <CoachAutoQuestionnaire value={autoQ} onChange={setAutoQ} />
          <button
            type="button"
            onClick={handleSaveAutoQuestionnaire}
            disabled={savingAutoQ}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} /> {savingAutoQ ? "Guardando…" : "Guardar y regenerar microciclo"}
          </button>
        </div>
      )}

      {/* Modo de trabajo — solo entrenador individual */}
      {isSoloCoach && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h3 className="font-bold text-depro-dark mb-1 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-depro-blue" /> Modo de trabajo
          </h3>
          <p className="text-xs text-depro-gray mb-4">Elige cómo quieres planificar tus sesiones.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleChangeMode("depro")}
              disabled={savingMode}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                mode === "depro" ? "border-depro-blue bg-depro-blue/5" : "border-depro-border hover:border-depro-blue/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={15} className="text-depro-blue" />
                <span className="font-bold text-sm text-depro-dark">Automático</span>
                {mode === "depro" && <CheckCircle size={14} className="text-depro-blue ml-auto" />}
              </div>
              <p className="text-xs text-depro-gray">Motor automático clubs: microciclo A/B/C según días de entrenamiento y partido. Calentamiento → balón → protocolo → tarea.</p>
            </button>
            <button
              onClick={() => handleChangeMode("personalizado")}
              disabled={savingMode}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                mode === "personalizado" ? "border-depro-blue bg-depro-blue/5" : "border-depro-border hover:border-depro-blue/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <SlidersHorizontal size={15} className="text-depro-blue" />
                <span className="font-bold text-sm text-depro-dark">Llevado por mí</span>
                {mode === "personalizado" && <CheckCircle size={14} className="text-depro-blue ml-auto" />}
              </div>
              <p className="text-xs text-depro-gray">Planificación manual: crea tus propias sesiones, duplica, favoritos y ejercicios propios (línea premium gestionada a mano).</p>
            </button>
          </div>
        </div>
      )}

      {showBilling && (
        <>
          <PlanUsageCard club={user?.club} user={user} audience={user?.club?.isSoloCoach ? "coach" : "club"} />
          <Link
            to="/dashboard/subscription"
            className="flex items-center justify-between gap-3 bg-white border border-depro-border rounded-2xl p-4 hover:border-depro-blue transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-depro-blue-light flex items-center justify-center">
                <CreditCard size={18} className="text-depro-blue" />
              </div>
              <div>
                <p className="font-bold text-depro-dark text-sm">Suscripción y mejoras</p>
                <p className="text-xs text-depro-gray">Gestiona tu plan, trial y desbloqueos</p>
              </div>
            </div>
            <Sparkles size={16} className="text-depro-border group-hover:text-depro-blue" />
          </Link>
        </>
      )}

      {/* Editar nombre */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h3 className="font-bold text-depro-dark mb-4 flex items-center gap-2">
          <User size={16} className="text-depro-blue" /> Datos personales
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input w-full"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="admin-input w-full opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-depro-gray mt-1">El email no se puede cambiar desde aquí. Contacta al administrador.</p>
          </div>
          <button
            onClick={handleSaveName}
            disabled={saving || name.trim() === user?.name}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            {saving ? <div className="spinner border-white/20 border-t-white" /> : <Save size={14} />}
            Guardar nombre
          </button>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h3 className="font-bold text-depro-dark mb-4 flex items-center gap-2">
          <Lock size={16} className="text-depro-blue" /> Cambiar contraseña
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="admin-input w-full pr-11"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-depro-dark"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-depro-dark mb-1.5">Confirmar contraseña</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={`admin-input w-full ${confirmPw && confirmPw !== newPw ? "border-red-400" : ""}`}
              placeholder="••••••••"
              required
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-xs text-depro-red mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !newPw || !confirmPw}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            {saving ? <div className="spinner border-white/20 border-t-white" /> : <Lock size={14} />}
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
