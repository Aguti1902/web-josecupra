import { useState, useRef, useEffect } from "react";
import {
  User, Camera, Lock, Mail, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Shield, Crown, UserCheck, Dumbbell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

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

const ROLE_LABEL = { coordinador: "Coordinador", entrenador: "Entrenador", ayudante: "Ayudante técnico" };
const ROLE_ICON  = { coordinador: Crown, entrenador: UserCheck, ayudante: Dumbbell };

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
  const photoRef = useRef();

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

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">

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
                  <RoleIcon size={10} /> {ROLE_LABEL[teamRole] || teamRole || "Club"}
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
