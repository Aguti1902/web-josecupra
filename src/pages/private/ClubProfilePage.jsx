import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Camera, Lock, Mail, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Crown, UserCheck, Dumbbell,
  Sparkles, CreditCard, Plus, Trash2, Users, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { loadClubDetail, saveClubDetail, saveClub } from "../../lib/adminStorage";
import { clearCoachGeneratedPlans } from "../../lib/coachSessionsStorage";
import PlanUsageCard from "../../components/private/PlanUsageCard";
import { canManageClubBilling, canSeeClubPricing, clubRoleLabel } from "../../lib/clubRoles";
import { hasFeatureAccess, isInTrial } from "../../lib/subscription";
import { TRIAL_LIMITED_MESSAGE } from "../../lib/trialPersistence";
import { getPlanLimits } from "../../lib/checkoutPlans";
import { COACH_STANDARD_MAX_TEAMS, COACH_TEAMS_WITH_ADDON } from "../../lib/coachAddons";
import TeamBrandingFields from "../../components/shared/TeamBrandingFields";
import CoachAutoQuestionnaire, {
  questionnaireToCoachConfig,
} from "../../components/shared/CoachAutoQuestionnaire";
import {
  coachConfigToQuestionnaire,
  categoryForNivel,
  isProCoachUser,
  parseCoachAutoFromMeta,
  loadCoachAutoDraftFromStorage,
  coachConfigFingerprint,
  monthKeyFromDate,
  serializeCoachAutoForMeta,
} from "../../lib/clubAuto/clubAutoCoachBridge";
import { markQuestionnaireCompleted } from "../../lib/questionnaireState";
import {
  canRegenerateFromProfile,
  recordProfileRegen,
  getProfileRegenCount,
  MAX_PROFILE_REGENS_PER_CYCLE,
  PLAN_CYCLE_DAYS,
} from "../../lib/planSwapLimits";

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

const ROLE_ICON  = { administrador: Crown, coordinador: Crown, entrenador: UserCheck, ayudante: Dumbbell };
const AGE_BLOCKS = [
  { label: "Bloque 1", ages: ["Sub-9", "Sub-10", "Sub-11", "Sub-12"] },
  { label: "Bloque 2", ages: ["Sub-13", "Sub-14", "Sub-15"] },
  { label: "Bloque 3", ages: ["Sub-16", "Juvenil", "Amateur"] },
];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

function initialCoachQuestionnaire(user) {
  const fromClub = coachConfigToQuestionnaire(user?.club?.coachConfig || {});
  if (fromClub?.nivel && (user?.club?.coachConfig?.nivel || (fromClub.dias_exactos_entrenamiento || []).length)) {
    return fromClub;
  }
  const fromMeta = user?.coachAuto && typeof user.coachAuto === "object"
    ? user.coachAuto
    : parseCoachAutoFromMeta(user?.coachAuto);
  if (fromMeta?.nivel) return { ...fromClub, ...fromMeta };
  const fromDraft = loadCoachAutoDraftFromStorage();
  if (fromDraft?.nivel) return { ...fromClub, ...fromDraft };
  return fromClub;
}

function genCoachId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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
  const [branding, setBranding] = useState({
    logo: user?.club?.logo || "",
    primaryColor: user?.club?.primaryColor || "#0A36F7",
    secondaryColor: user?.club?.secondaryColor || "#ffffff",
  });
  const [savingBranding, setSavingBranding] = useState(false);
  const [autoQ, setAutoQ] = useState(() => initialCoachQuestionnaire(user));
  const [savingAutoQ, setSavingAutoQ] = useState(false);
  const [teamForm, setTeamForm] = useState({ open: false, name: "", category: "Sub-16", days: [] });
  const [savingTeam, setSavingTeam] = useState(false);
  const photoRef = useRef();
  const isSoloCoach = isProCoachUser(user);
  const showBilling = isSoloCoach || (canManageClubBilling(user) && canSeeClubPricing(user));
  const cyclePlan = {
    startDate: user?.club?.coachMesociclo?.[user?.teamId]?.startDate
      || `${monthKeyFromDate(new Date())}-01`,
  };
  const profileRegensUsed = user?.id ? getProfileRegenCount(user.id, cyclePlan) : 0;
  const canProfileRegen = user?.id ? canRegenerateFromProfile(user.id, cyclePlan, user) : false;
  const hadAutoConfig = !!(user?.club?.coachConfig?.nivel);
  const purchasedAddons = user?.purchasedAddons || user?.club?.purchasedAddons || [];
  const extraTeamsUnlocked = hasFeatureAccess(user, "extra_teams");
  const teamLimits = getPlanLimits(user?.plan || user?.club?.plan || "coach-starter", { purchasedAddons });
  const maxTeams = extraTeamsUnlocked
    ? (teamLimits.maxTeams || COACH_TEAMS_WITH_ADDON)
    : COACH_STANDARD_MAX_TEAMS;
  const clubTeams = user?.club?.teams || [];
  const canAddTeam = clubTeams.length < maxTeams;
  const needsTeamsAddon = !extraTeamsUnlocked && clubTeams.length >= COACH_STANDARD_MAX_TEAMS;

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  useEffect(() => {
    const next = initialCoachQuestionnaire(user);
    setAutoQ(next);
  }, [user?.club?.coachConfig, user?.club?.mode, user?.coachAuto]);

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
    const packed = questionnaireToCoachConfig(autoQ);
    if (!packed.ok) {
      showMsg("error", packed.errors.join(" "));
      return;
    }
    const cfg = { ...packed.config, mode: "depro", engine: "club_auto" };
    const prevFp = coachConfigFingerprint(user?.club?.coachConfig || {});
    const nextFp = coachConfigFingerprint(cfg);
    const fingerprintChanged = prevFp !== nextFp;
    const willRegen = !hadAutoConfig || fingerprintChanged;

    if (hadAutoConfig && fingerprintChanged && !canProfileRegen) {
      showMsg(
        "error",
        isInTrial(user)
          ? TRIAL_LIMITED_MESSAGE
          : `Ya usaste tu cambio de plan este mesociclo (${MAX_PROFILE_REGENS_PER_CYCLE}/mes). Los datos no se regeneran.`,
      );
      return;
    }

    setSavingAutoQ(true);
    try {
      let clubId = user?.club?.id;
      const category = categoryForNivel(cfg.nivel);

      if (!clubId) {
        clubId = genCoachId("coach_club");
        const teamId = genCoachId("coach_team");
        const club = {
          id: clubId,
          name: `${user?.name || "Entrenador"} · DEPRO Coach`,
          abbreviation: (user?.name || "EC").trim().slice(0, 2).toUpperCase(),
          city: "",
          country: "",
          status: "activo",
          plan: user?.plan || "coach-starter",
          isSoloCoach: true,
          origen: "automatico",
          planningMode: "auto",
          mode: "depro",
          coachConfig: cfg,
          logo: branding.logo || user?.club?.logo || null,
          primaryColor: branding.primaryColor || user?.club?.primaryColor || "#0A36F7",
          secondaryColor: branding.secondaryColor || user?.club?.secondaryColor || "#ffffff",
          coordinator: null,
          teams: [
            {
              id: teamId,
              name: user?.team?.name || "Mi equipo",
              category,
              season: "2025/2026",
              trainingDays: cfg.dias_exactos_entrenamiento,
              coach: { name: user?.name || "", email: user?.email || "" },
              squad: [],
            },
          ],
          plans: [],
          created_at: new Date().toISOString(),
        };
        await saveClub(club);
        const { error: updErr } = await supabase.auth.updateUser({
          data: { role: "club", clubId, teamId, teamRole: "entrenador", isSoloCoach: true },
        });
        if (updErr) throw updErr;
        markQuestionnaireCompleted("coach", user?.id || user?.email);
      } else {
        const detail = loadClubDetail(clubId) || user.club;
        const teams = Array.isArray(detail.teams) ? detail.teams.map((t) => (
          t.id === user.teamId
            ? {
                ...t,
                trainingDays: packed.config.dias_exactos_entrenamiento,
                category,
              }
            : t
        )) : detail.teams;
        await saveClubDetail(clubId, {
          ...detail,
          isSoloCoach: true,
          mode: "depro",
          planningMode: "auto",
          origen: detail.origen || "automatico",
          coachConfig: { ...(detail.coachConfig || {}), ...cfg },
          teams,
        });
        if (willRegen) {
          clearCoachGeneratedPlans(clubId, user.teamId);
          if (hadAutoConfig && fingerprintChanged && user?.id) {
            recordProfileRegen(user.id, { ...cyclePlan, source: "profile_regen", profileRegenAt: new Date().toISOString() });
          }
        }
      }
      await supabase.auth.updateUser({
        data: { coachAuto: serializeCoachAutoForMeta(autoQ) },
      });
      await refreshUser();
      showMsg(
        "ok",
        willRegen
          ? (hadAutoConfig ? "Cuestionario actualizado. Se regenerará el microciclo automático." : "Cuestionario guardado. Se generará el microciclo automático.")
          : "Cuestionario guardado.",
      );
    } catch (e) {
      showMsg("error", e.message || "No se pudo guardar el cuestionario.");
    } finally {
      setSavingAutoQ(false);
    }
  };

  const openTeamForm = () => {
    const defaults = clubTeams[0]?.trainingDays
      || user?.club?.coachConfig?.dias_exactos_entrenamiento
      || [];
    setTeamForm({
      open: true,
      name: "",
      category: clubTeams[0]?.category || "Sub-16",
      days: Array.isArray(defaults) ? [...defaults] : [],
    });
  };

  const toggleTeamDay = (day) => {
    setTeamForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const handleAddTeam = async () => {
    if (!teamForm.name.trim()) {
      showMsg("error", "Pon un nombre al equipo.");
      return;
    }
    if (![2, 3, 4].includes(teamForm.days.length)) {
      showMsg("error", "Elige entre 2 y 4 días de entrenamiento.");
      return;
    }
    if (!user?.club?.id) {
      showMsg("error", "Guarda primero el cuestionario para crear tu club.");
      return;
    }
    if (!canAddTeam) {
      showMsg(
        "error",
        needsTeamsAddon
          ? "Desbloquea «Tres equipos más» en Suscripción para añadir hasta 4 equipos."
          : `Has alcanzado el máximo de ${maxTeams} equipos.`,
      );
      return;
    }
    setSavingTeam(true);
    try {
      const detail = loadClubDetail(user.club.id) || user.club;
      const existing = Array.isArray(detail.teams) ? detail.teams : [];
      const nextTeam = {
        id: genCoachId("coach_team"),
        name: teamForm.name.trim(),
        category: teamForm.category,
        season: existing[0]?.season || "2026/2027",
        trainingDays: teamForm.days,
        coach: { name: user?.name || "", email: user?.email || "" },
        squad: [],
      };
      await saveClubDetail(user.club.id, {
        ...detail,
        isSoloCoach: true,
        teams: [...existing, nextTeam],
      });
      setTeamForm({ open: false, name: "", category: "Sub-16", days: [] });
      await refreshUser();
      showMsg(
        "ok",
        existing.length >= 1
          ? "Equipo añadido. En el dashboard verás todos tus equipos, como un coordinador."
          : "Equipo añadido.",
      );
    } catch (e) {
      showMsg("error", e.message || "No se pudo añadir el equipo.");
    } finally {
      setSavingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (clubTeams.length <= 1) {
      showMsg("error", "Debes conservar al menos un equipo.");
      return;
    }
    setSavingTeam(true);
    try {
      const detail = loadClubDetail(user.club.id) || user.club;
      const remaining = (detail.teams || []).filter((t) => t.id !== teamId);
      await saveClubDetail(user.club.id, { ...detail, teams: remaining });
      if (user.teamId === teamId && remaining[0]?.id) {
        await supabase.auth.updateUser({ data: { teamId: remaining[0].id } });
      }
      await refreshUser();
      showMsg("ok", "Equipo eliminado.");
    } catch (e) {
      showMsg("error", e.message || "No se pudo eliminar el equipo.");
    } finally {
      setSavingTeam(false);
    }
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

      {/* Cuestionario del motor automático — siempre visible en ProCoach para generar la rutina */}
      {isSoloCoach && (
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-depro-dark mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-depro-blue" /> Cuestionario del entrenador
            </h3>
            <p className="text-xs text-depro-gray">
              Nivel, días de entreno, día de partido, material y duración.
              {hadAutoConfig
                ? ` Puedes actualizar el cuestionario y regenerar el plan una vez cada ~${PLAN_CYCLE_DAYS} días.`
                : " La primera vez genera la rutina automática (no consume el cupo)."}
            </p>
            {hadAutoConfig && (
              <p className={`text-xs font-bold mt-2 ${canProfileRegen ? "text-depro-blue" : "text-amber-700"}`}>
                Actualizaciones este mesociclo: {Math.min(profileRegensUsed, MAX_PROFILE_REGENS_PER_CYCLE)}/{MAX_PROFILE_REGENS_PER_CYCLE}
                {!canProfileRegen && " · cupo agotado"}
              </p>
            )}
          </div>
          <CoachAutoQuestionnaire value={autoQ} onChange={setAutoQ} />
          <button
            type="button"
            onClick={handleSaveAutoQuestionnaire}
            disabled={savingAutoQ || (hadAutoConfig && !canProfileRegen)}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} />{" "}
            {savingAutoQ
              ? "Guardando…"
              : hadAutoConfig && !canProfileRegen
                ? "Cupo de actualización agotado"
                : hadAutoConfig
                  ? "Guardar y regenerar microciclo"
                  : "Guardar y generar microciclo"}
          </button>
        </div>
      )}

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
            disabled={savingBranding || !user?.club?.id}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} /> {savingBranding ? "Guardando…" : "Guardar identidad"}
          </button>
        </div>
      )}

      {/* Equipos — ProCoach: 1 incluido, +3 con el extra (hasta 4) */}
      {isSoloCoach && (
        <div className="bg-white border border-depro-border rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-depro-dark mb-1 flex items-center gap-2">
                <Users size={16} className="text-depro-blue" /> Equipos
              </h3>
              <p className="text-xs text-depro-gray">
                {extraTeamsUnlocked
                  ? `Hasta ${maxTeams} equipos. Con varios equipos el dashboard se ve como el del coordinador de club.`
                  : "Un equipo incluido. El extra «Tres equipos más» (5 €/mes) te deja hasta 4 y abre la vista de coordinador."}
              </p>
              <p className="text-xs font-bold text-depro-blue mt-1">
                {clubTeams.length}/{maxTeams} equipos
              </p>
            </div>
            {canAddTeam ? (
              <button
                type="button"
                onClick={openTeamForm}
                disabled={!user?.club?.id || savingTeam}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Plus size={14} /> Añadir equipo
              </button>
            ) : needsTeamsAddon ? (
              <Link
                to="/dashboard/subscription"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={14} /> Añadir equipos
              </Link>
            ) : null}
          </div>

          {!user?.club?.id && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
              Guarda el cuestionario para crear tu primer equipo. Después podrás añadir más.
            </p>
          )}

          {clubTeams.length > 0 && (
            <div className="space-y-2">
              {clubTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-depro-border"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-depro-dark truncate">{team.name}</p>
                    <p className="text-xs text-depro-gray">
                      {team.category}
                      {team.trainingDays?.length ? ` · ${team.trainingDays.join(", ")}` : ""}
                    </p>
                  </div>
                  {clubTeams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={savingTeam}
                      className="p-2 rounded-lg text-depro-gray hover:text-depro-red hover:bg-red-50 disabled:opacity-50"
                      title="Eliminar equipo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isSoloCoach && teamForm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-depro w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-depro-border">
              <h2 className="font-bold text-depro-dark">Añadir equipo</h2>
              <button
                type="button"
                onClick={() => setTeamForm((f) => ({ ...f, open: false }))}
                className="text-depro-gray hover:text-depro-dark"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-depro-dark mb-1">Nombre *</label>
                <input
                  className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Juvenil A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-depro-dark mb-1">Categoría</label>
                <select
                  className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
                  value={teamForm.category}
                  onChange={(e) => setTeamForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {AGE_BLOCKS.map((b) => (
                    <optgroup key={b.label} label={b.label}>
                      {b.ages.map((a) => <option key={a}>{a}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-depro-dark mb-2">Días de entrenamiento (2–4)</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleTeamDay(day)}
                      className={`w-9 h-9 rounded-lg text-xs font-semibold border ${
                        teamForm.days.includes(day)
                          ? "bg-depro-blue border-depro-blue text-white"
                          : "border-depro-border text-depro-gray"
                      }`}
                    >
                      {DAY_SHORT[i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-depro-border">
              <button
                type="button"
                onClick={() => setTeamForm((f) => ({ ...f, open: false }))}
                className="flex-1 py-2.5 rounded-xl border border-depro-border text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddTeam}
                disabled={savingTeam || !teamForm.name.trim() || ![2, 3, 4].includes(teamForm.days.length)}
                className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold disabled:opacity-40"
              >
                {savingTeam ? "Guardando…" : "Crear equipo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBilling && (
        <>
          <PlanUsageCard club={user?.club} user={user} audience={isSoloCoach ? "coach" : "club"} />
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
