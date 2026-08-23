import { useState, useEffect, useRef } from "react";
import { User, Shield, CheckCircle, AlertCircle, Hash, LogOut, ChevronRight, Users, Camera, CreditCard, Sparkles, Calendar, RefreshCw, Lock, Mail, Eye, EyeOff, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { WEEK_DAYS } from "../../lib/sessionBlocks";
import { ensurePlayerPlan } from "../../lib/playerPlanEngine";
import {
  canRegenerateFromProfile,
  recordProfileRegen,
  profileTrainingFingerprint,
  getProfileRegenCount,
  MAX_PROFILE_REGENS_PER_CYCLE,
  resetCycleCounters,
} from "../../lib/planSwapLimits";
import { loadPlayerPlan } from "../../lib/playerPlanStorage";
import { openBillingPortal, isSubscriptionActive } from "../../lib/subscription";
import { COMPETITION_DAY_OPTIONS } from "../../lib/planLoadRules";
import {
  registerPendingClubPlayer,
  activateClubPlayerInSquad,
  applyClubBrandingToPlayer,
} from "../../lib/clubPlayerRegistry";

const SPORTS = ["Fútbol", "Baloncesto", "Balonmano", "Atletismo", "Natación", "Otro"];
const FREQUENCY = ["1 día / sem", "2 días / sem", "3 días / sem", "4 días / sem", "5 días / sem"];
const MATERIALS = ["Sin material", "Gomas", "Mancuernas", "Barra", "Gimnasio completo"];
const EXPERIENCE = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
const OBJECTIVES = ["Fuerza", "Velocidad", "Resistencia", "Hipertrofia", "Prevención", "Movilidad"];
const INJURIES = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda", "Pubalgia"];
const INJURY_SUBTYPES = {
  Rodilla: ["ACL", "Menisco", "Rotuliana", "Otra"],
  Tobillo: ["Esguince", "Inestabilidad", "Otra"],
  Hombro: ["Manguito rotador", "Inestabilidad", "Otra"],
  Espalda: ["Lumbar", "Dorsal", "Cervical", "Otra"],
  Pubalgia: ["Aductores", "Recto abdominal", "Mixta"],
};

function normalizeMaterialList(mat) {
  if (Array.isArray(mat)) return mat.filter(Boolean);
  if (!mat) return ["Sin material"];
  return String(mat).split(",").map((s) => s.trim()).filter(Boolean);
}

function normalizeList(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (!v) return [];
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
}

function freqNumber(freq) {
  return parseInt(String(freq || "").replace(/\D/g, ""), 10) || 3;
}

function ChipGroup({ options, selected, onToggle, multi = true }) {
  const isSel = (opt) => (multi ? selected.includes(opt) : selected === opt);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
            isSel(opt)
              ? "bg-depro-blue border-depro-blue text-white"
              : "bg-white border-depro-border text-depro-gray hover:border-depro-blue"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

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

  const [trainingDays, setTrainingDays] = useState(() => user?.disponibles?.length ? user.disponibles : ["Lunes", "Miércoles", "Viernes"]);
  const [materialSel, setMaterialSel] = useState(() => normalizeMaterialList(user?.material));
  const [experienciaSel, setExperienciaSel] = useState(() => user?.experiencia || EXPERIENCE[2]);
  const [edadSel, setEdadSel] = useState(() => user?.edad || user?.age || "");
  const [deporteSel, setDeporteSel] = useState(() => user?.deporte || "Fútbol");
  const [frecuenciaSel, setFrecuenciaSel] = useState(() => user?.frecuencia || "3 días / sem");
  const [objetivosSel, setObjetivosSel] = useState(() => {
    if (Array.isArray(user?.objetivos) && user.objetivos.length) return user.objetivos;
    if (user?.objetivo) return [user.objetivo];
    return ["Fuerza"];
  });
  const [lesionSel, setLesionSel] = useState(() => {
    const list = normalizeList(user?.lesion);
    return list.length ? list : ["Ninguna"];
  });
  const [lesionSubtipoSel, setLesionSubtipoSel] = useState(() => normalizeList(user?.lesionSubtipo));
  const [diaCompeticionSel, setDiaCompeticionSel] = useState(
    () => user?.diaCompeticion || user?.dia_competicion || "Fin de semana",
  );
  const [daysSaving, setDaysSaving] = useState(false);
  const [daysMsg, setDaysMsg] = useState("");
  const currentPlan = user?.id ? loadPlayerPlan(user.id) : null;
  const profileRegensUsed = user?.id ? getProfileRegenCount(user.id, currentPlan) : 0;
  const canProfileRegen = user?.id ? canRegenerateFromProfile(user.id, currentPlan) : false;
  const freqN = freqNumber(frecuenciaSel);

  const [accountName, setAccountName] = useState(user?.name || "");
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState(null);

  useEffect(() => {
    setAccountName(user?.name || "");
    setAccountEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const showAccountMsg = (type, text) => {
    setAccountMsg({ type, text });
    setTimeout(() => setAccountMsg(null), 4500);
  };

  const handleSaveAccount = async () => {
    if (!accountName.trim()) {
      showAccountMsg("error", "El nombre no puede estar vacío.");
      return;
    }
    setAccountSaving(true);
    try {
      const payload = { data: { name: accountName.trim() } };
      if (accountEmail.trim() && accountEmail.trim() !== user?.email) {
        payload.email = accountEmail.trim();
      }
      const { error } = await supabase.auth.updateUser(payload);
      if (error) throw error;
      await refreshUser();
      showAccountMsg(
        "ok",
        accountEmail.trim() !== user?.email
          ? "Datos guardados. Revisa tu correo para confirmar el nuevo email."
          : "Datos actualizados correctamente.",
      );
    } catch (e) {
      showAccountMsg("error", e.message || "No se pudieron guardar los datos.");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAccountMsg("error", t("profile.passwords_no_match"));
      return;
    }
    if (newPassword.length < 6) {
      showAccountMsg("error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setAccountSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      showAccountMsg("ok", "Contraseña actualizada correctamente.");
    } catch (err) {
      showAccountMsg("error", err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleBillingPortal = async () => {
    setBillingLoading(true);
    const res = await openBillingPortal(user);
    setBillingLoading(false);
    if (!res.ok) showAccountMsg("error", res.error || "No se pudo abrir el portal de facturación.");
  };

  useEffect(() => {
    if (user?.disponibles?.length) setTrainingDays(user.disponibles);
  }, [user?.disponibles]);

  useEffect(() => {
    if (user?.material != null) setMaterialSel(normalizeMaterialList(user.material));
  }, [user?.material]);

  useEffect(() => {
    if (user?.experiencia) setExperienciaSel(user.experiencia);
  }, [user?.experiencia]);

  useEffect(() => {
    if (user?.edad != null || user?.age != null) setEdadSel(user?.edad || user?.age || "");
  }, [user?.edad, user?.age]);

  useEffect(() => {
    if (user?.deporte) setDeporteSel(user.deporte);
  }, [user?.deporte]);

  useEffect(() => {
    if (user?.frecuencia) setFrecuenciaSel(user.frecuencia);
  }, [user?.frecuencia]);

  useEffect(() => {
    if (Array.isArray(user?.objetivos) && user.objetivos.length) setObjetivosSel(user.objetivos);
    else if (user?.objetivo) setObjetivosSel([user.objetivo]);
  }, [user?.objetivo, user?.objetivos]);

  useEffect(() => {
    const list = normalizeList(user?.lesion);
    if (list.length) setLesionSel(list);
  }, [user?.lesion]);

  useEffect(() => {
    setLesionSubtipoSel(normalizeList(user?.lesionSubtipo));
  }, [user?.lesionSubtipo]);

  useEffect(() => {
    if (user?.diaCompeticion || user?.dia_competicion) {
      setDiaCompeticionSel(user.diaCompeticion || user.dia_competicion);
    }
  }, [user?.diaCompeticion, user?.dia_competicion]);

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
          banner: detail.banner || club.banner,
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
    const playerData = {
      userId: user.id,
      clubId: foundClub.id,
      teamId: selectedTeam,
      name: user.name || user.email?.split("@")[0] || "Jugador",
      email: user.email || "",
      plan: user.plan || "Plan activo",
    };

    const paid = isSubscriptionActive({
      plan: user.plan,
      status: user.subscriptionStatus,
      stripeSubscriptionId: user.stripeSubscriptionId,
      billingSource: user.billingSource,
    });

    if (paid) {
      activateClubPlayerInSquad(playerData);
    } else {
      registerPendingClubPlayer(playerData);
    }

    applyClubBrandingToPlayer(user.id, foundClub.id);

    try {
      await supabase.auth.updateUser({
        data: { clubId: foundClub.id, teamId: selectedTeam, teamRole: "jugador" },
      });
      if (paid) {
        await supabase.from("player_team_links").upsert({
          player_id: user.id,
          team_id: selectedTeam,
          club_id: foundClub.id,
          name: playerData.name,
          plan: playerData.plan,
        }, { onConflict: "player_id" });
      }
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

  const toggleTrainingDay = (day) => {
    setTrainingDays((prev) => (
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    ));
    setDaysMsg("");
  };

  const toggleMaterial = (item) => {
    setMaterialSel((prev) => {
      const has = prev.includes(item);
      if (has) {
        const next = prev.filter((m) => m !== item);
        return next.length ? next : ["Sin material"];
      }
      if (item === "Sin material") return ["Sin material"];
      const base = prev.filter((m) => m !== "Sin material");
      return [...base, item];
    });
    setDaysMsg("");
  };

  const toggleObjective = (obj) => {
    setObjetivosSel((prev) => {
      if (prev.includes(obj)) {
        const next = prev.filter((o) => o !== obj);
        return next.length ? next : prev;
      }
      if (prev.length >= 2) return [prev[0], obj];
      return [...prev, obj];
    });
    setDaysMsg("");
  };

  const toggleLesion = (item) => {
    setLesionSel((prev) => {
      if (item === "Ninguna") return ["Ninguna"];
      const withoutNone = prev.filter((l) => l !== "Ninguna");
      if (withoutNone.includes(item)) {
        const next = withoutNone.filter((l) => l !== item);
        return next.length ? next : ["Ninguna"];
      }
      return [...withoutNone, item];
    });
    setLesionSubtipoSel([]);
    setDaysMsg("");
  };

  const toggleLesionSubtipo = (item) => {
    setLesionSubtipoSel((prev) => (
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    ));
    setDaysMsg("");
  };

  const buildTrainingPayload = () => {
    const objetivos = objetivosSel.slice(0, 2);
    return {
      edad: String(edadSel || "").trim(),
      deporte: deporteSel,
      frecuencia: frecuenciaSel,
      objetivos,
      objetivo: objetivos[0] || "",
      objetivoSecundario: objetivos[1] || "",
      material: materialSel,
      experiencia: experienciaSel,
      lesion: lesionSel.includes("Ninguna") ? [] : lesionSel,
      lesionSubtipo: lesionSel.includes("Ninguna") ? [] : lesionSubtipoSel,
      diaCompeticion: diaCompeticionSel,
      disponibles: trainingDays,
    };
  };

  const handleSaveTrainingProfile = async () => {
    const nextData = buildTrainingPayload();
    const n = freqNumber(nextData.frecuencia);
    if (!nextData.edad || Number(nextData.edad) < 10 || Number(nextData.edad) > 80) {
      setDaysMsg("Indica una edad válida (10–80).");
      return;
    }
    if (!nextData.objetivos?.length) {
      setDaysMsg("Selecciona al menos un objetivo.");
      return;
    }
    if (trainingDays.length < n) {
      setDaysMsg(`Con frecuencia ${n} días/sem, selecciona al menos ${n} días disponibles.`);
      return;
    }
    if (!materialSel.length) {
      setDaysMsg("Selecciona al menos un material disponible.");
      return;
    }

    const prevData = {
      edad: String(user?.edad || user?.age || ""),
      deporte: user?.deporte || "",
      frecuencia: user?.frecuencia || "",
      objetivos: Array.isArray(user?.objetivos) && user.objetivos.length
        ? user.objetivos
        : (user?.objetivo ? [user.objetivo] : []),
      objetivo: user?.objetivo || "",
      material: normalizeMaterialList(user?.material),
      experiencia: user?.experiencia || "",
      lesion: normalizeList(user?.lesion),
      lesionSubtipo: normalizeList(user?.lesionSubtipo),
      diaCompeticion: user?.diaCompeticion || user?.dia_competicion || "",
      disponibles: user?.disponibles || [],
    };
    const changed = profileTrainingFingerprint(nextData) !== profileTrainingFingerprint(prevData);

    setDaysSaving(true);
    setDaysMsg("");
    try {
      await supabase.auth.updateUser({
        data: {
          edad: nextData.edad,
          deporte: nextData.deporte,
          frecuencia: nextData.frecuencia,
          objetivos: nextData.objetivos,
          objetivo: nextData.objetivo,
          objetivoSecundario: nextData.objetivoSecundario,
          material: nextData.material,
          experiencia: nextData.experiencia,
          lesion: nextData.lesion,
          lesionSubtipo: nextData.lesionSubtipo,
          diaCompeticion: nextData.diaCompeticion,
          disponibles: nextData.disponibles,
        },
      });

      if (!changed) {
        await refreshUser();
        setDaysMsg("Perfil de entrenamiento guardado (sin cambios en la rutina).");
        setTimeout(() => setDaysMsg(""), 4000);
        return;
      }

      const plan = loadPlayerPlan(user.id);
      if (!canRegenerateFromProfile(user.id, plan)) {
        await refreshUser();
        setDaysMsg(`Ya usaste tu cambio de rutina este mesociclo (${MAX_PROFILE_REGENS_PER_CYCLE}/mes). Los datos se guardaron, pero la rutina no se regeneró.`);
        return;
      }

      localStorage.removeItem(`depro_plan_${user.id}`);
      const newUser = { ...user, ...nextData };
      const newPlan = ensurePlayerPlan(newUser);
      if (newPlan && !newPlan.planError) {
        resetCycleCounters(user.id, newPlan.startDate);
        recordProfileRegen(user.id, newPlan);
        localStorage.setItem(`depro_plan_${user.id}`, JSON.stringify(newPlan));
        await refreshUser();
        setDaysMsg("Perfil actualizado · rutina regenerada (1 cambio este mesociclo) ✓");
        setTimeout(() => setDaysMsg(""), 5000);
      } else if (newPlan?.planError) {
        await refreshUser();
        setDaysMsg(newPlan.planError);
      } else {
        await refreshUser();
        setDaysMsg("Perfil guardado.");
      }
    } catch {
      setDaysMsg("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setDaysSaving(false);
    }
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
    <div className="dash-page space-y-6">
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
        <p className="text-xs text-depro-gray mt-4">
          Edad, objetivos, deporte, frecuencia, material, lesiones y días se editan abajo en «Entrenamiento» (máx. 1 regeneración de rutina por mesociclo).
        </p>
      </div>

      {accountMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          accountMsg.type === "ok"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {accountMsg.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {accountMsg.text}
        </div>
      )}

      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
          <User size={18} className="text-depro-blue" /> Cuenta y seguridad
        </h2>
        <p className="text-sm text-depro-gray mb-5">
          Actualiza tu nombre, correo y contraseña de acceso.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">{t("profile.name")}</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Mail size={12} /> {t("profile.email")}
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
              placeholder="tu@email.com"
            />
            <p className="text-xs text-depro-gray mt-1">Si cambias el email, recibirás un enlace de confirmación.</p>
          </div>
          <button
            type="button"
            onClick={handleSaveAccount}
            disabled={accountSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            {accountSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar datos
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-depro-border space-y-4">
          <h3 className="font-bold text-depro-dark text-sm flex items-center gap-2">
            <Lock size={15} className="text-depro-blue" /> {t("profile.change_password")}
          </h3>
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">{t("profile.new_password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-depro-gray hover:text-depro-dark"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">{t("profile.confirm_password")}</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
              placeholder="Repite la contraseña"
            />
          </div>
          <button
            type="submit"
            disabled={accountSaving || !newPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-dark hover:border-depro-blue hover:text-depro-blue transition-colors disabled:opacity-50"
          >
            <Lock size={14} /> Actualizar contraseña
          </button>
        </form>
      </div>

      <div className="bg-white border border-depro-border rounded-2xl p-6">
        <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
          <CreditCard size={18} className="text-depro-blue" /> Facturación
        </h2>
        <p className="text-sm text-depro-gray mb-4">
          Gestiona tu suscripción, método de pago y datos de facturación en Stripe.
        </p>
        <div className="flex flex-wrap gap-3">
          {user?.stripeCustomerId && (
            <button
              type="button"
              onClick={handleBillingPortal}
              disabled={billingLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
            >
              {billingLoading ? <RefreshCw size={14} className="animate-spin" /> : <CreditCard size={14} />}
              Gestionar facturación
            </button>
          )}
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-dark hover:border-depro-blue hover:text-depro-blue transition-colors"
          >
            <Sparkles size={14} /> Ver plan y mejoras
          </Link>
        </div>
      </div>

      {user?.role === "player" && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
            <Calendar size={18} className="text-depro-blue" /> Entrenamiento
          </h2>
          <p className="text-sm text-depro-gray mb-2">
            Edita los mismos datos del onboarding (edad, objetivos, deporte, frecuencia, material, lesiones, días…).
            Si cambian, la rutina se regenera igual que al crear el plan
            {" "}(máximo {MAX_PROFILE_REGENS_PER_CYCLE} vez por mesociclo).
          </p>
          <p className={`text-xs font-bold mb-4 ${canProfileRegen ? "text-depro-blue" : "text-amber-700"}`}>
            Regeneraciones este mesociclo: {Math.min(profileRegensUsed, MAX_PROFILE_REGENS_PER_CYCLE)}/{MAX_PROFILE_REGENS_PER_CYCLE}
            {!canProfileRegen && " · cupo agotado (puedes guardar datos, sin nueva rutina)"}
          </p>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-depro-gray mb-2">Edad</label>
            <input
              type="number"
              min={10}
              max={80}
              value={edadSel}
              onChange={(e) => { setEdadSel(e.target.value); setDaysMsg(""); }}
              className="w-28 px-3 py-2 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
              placeholder="años"
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Objetivos (máx. 2)</p>
            <ChipGroup options={OBJECTIVES} selected={objetivosSel} onToggle={toggleObjective} multi />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Deporte</p>
            <ChipGroup
              options={SPORTS}
              selected={deporteSel}
              onToggle={(s) => { setDeporteSel(s); setDaysMsg(""); }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Frecuencia semanal</p>
            <ChipGroup
              options={FREQUENCY}
              selected={frecuenciaSel}
              onToggle={(f) => { setFrecuenciaSel(f); setDaysMsg(""); }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Día de competición</p>
            <ChipGroup
              options={COMPETITION_DAY_OPTIONS}
              selected={diaCompeticionSel}
              onToggle={(d) => { setDiaCompeticionSel(d); setDaysMsg(""); }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Días de entrenamiento</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {WEEK_DAYS.map((day) => {
                const sel = trainingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleTrainingDay(day)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                      sel ? "bg-depro-blue border-depro-blue text-white" : "bg-white border-depro-border text-depro-gray hover:border-depro-blue"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-depro-gray">Mínimo {freqN} días · seleccionados: {trainingDays.length}</p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Material disponible</p>
            <ChipGroup options={MATERIALS} selected={materialSel} onToggle={toggleMaterial} multi />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Tiempo entrenando</p>
            <ChipGroup
              options={EXPERIENCE}
              selected={experienciaSel}
              onToggle={(exp) => { setExperienciaSel(exp); setDaysMsg(""); }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Lesiones</p>
            <ChipGroup options={INJURIES} selected={lesionSel} onToggle={toggleLesion} multi />
            {!lesionSel.includes("Ninguna") && lesionSel.map((les) => (
              INJURY_SUBTYPES[les] ? (
                <div key={les} className="mt-3">
                  <p className="text-xs text-depro-gray mb-2">Detalle · {les}</p>
                  <ChipGroup
                    options={INJURY_SUBTYPES[les]}
                    selected={lesionSubtipoSel}
                    onToggle={toggleLesionSubtipo}
                    multi
                  />
                </div>
              ) : null
            ))}
          </div>

          {daysMsg && (
            <p className={`text-xs mb-3 ${daysMsg.includes("✓") ? "text-green-600" : "text-amber-700"}`}>{daysMsg}</p>
          )}
          <button
            type="button"
            onClick={handleSaveTrainingProfile}
            disabled={daysSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
          >
            {daysSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Guardar y regenerar rutina (si hay cambios)
          </button>
        </div>
      )}

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
