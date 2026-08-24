import { useState, useEffect, useRef } from "react";
import { User, Shield, CheckCircle, AlertCircle, Hash, LogOut, ChevronRight, Users, Camera, CreditCard, Sparkles, Calendar, RefreshCw, Lock, Mail, Eye, EyeOff, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { WEEK_DAYS } from "../../lib/sessionBlocks";
import { buildPlayerPlan, buildFourWeekPlan } from "../../lib/playerPlanEngine";
import {
  canRegenerateFromProfile,
  recordProfileRegen,
  profileTrainingFingerprint,
  getProfileRegenCount,
  MAX_PROFILE_REGENS_PER_CYCLE,
  resetCycleCounters,
  PLAN_CYCLE_DAYS,
  isSuccessfulGeneratedPlan,
} from "../../lib/planSwapLimits";
import { loadPlayerPlan, fetchPlayerPlan, savePlayerPlan, persistPlayerPlanRemote, normalizePlayerPlan } from "../../lib/playerPlanStorage";
import { clubMatchesDiscountCode } from "../../lib/clubEconomy";
import { TRIAL_LIMITED_MESSAGE } from "../../lib/trialPersistence";
import { openBillingPortal, isSubscriptionActive, purchaseAddon, changePlan, fetchPremiumCapacity, hasFeatureAccess, isPlayerPro, isInTrial } from "../../lib/subscription";
import { PLAYER_ADDONS } from "../../lib/playerAddons";
import { PLANS, formatPrice } from "../../lib/checkoutPlans";
import { PREMIUM_PLAYER_CAP } from "../../lib/premiumCapacity";
import { COMPETITION_DAY_OPTIONS } from "../../lib/planLoadRules";
import {
  registerPendingClubPlayer,
  activateClubPlayerInSquad,
  applyClubBrandingToPlayer,
} from "../../lib/clubPlayerRegistry";
import {
  mergeTrainingSources,
  trainingFieldsKey,
  normalizeStringList,
  normalizeFrecuencia,
  filterCatalogObjetivos,
  trainingFieldsToAuthMetadata,
  trainingProfileSnapshotFromAny,
  CATALOG_OBJECTIVES,
} from "../../lib/playerTrainingProfile";
import { isProCoachUser } from "../../lib/clubAuto/clubAutoCoachBridge";

const SPORTS = ["Fútbol", "Baloncesto", "Balonmano", "Atletismo", "Natación", "Otro"];
const FREQUENCY = ["1 día / sem", "2 días / sem", "3 días / sem", "4 días / sem", "5 días / sem"];
const MATERIALS = ["Sin material", "Gomas", "Mancuernas", "Barra", "Gimnasio completo"];
const EXPERIENCE = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
const OBJECTIVES = CATALOG_OBJECTIVES;
const INJURIES = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda", "Pubalgia"];
const INJURY_SUBTYPES = {
  Rodilla: ["ACL", "Menisco", "Rotuliana", "Otra"],
  Tobillo: ["Esguince", "Inestabilidad", "Otra"],
  Hombro: ["Manguito rotador", "Inestabilidad", "Otra"],
  Espalda: ["Lumbar", "Dorsal", "Cervical", "Otra"],
  Pubalgia: ["Aductores", "Recto abdominal", "Mixta"],
};

function freqNumber(freq) {
  return parseInt(String(freq || "").replace(/\D/g, ""), 10) || 3;
}

function validateTrainingComplete(nextData, trainingDays, objetivosSel) {
  const n = freqNumber(nextData.frecuencia);
  if (!nextData.edad || Number(nextData.edad) < 10 || Number(nextData.edad) > 80) {
    return "Indica una edad válida (10–80) antes de regenerar.";
  }
  if (!nextData.objetivos?.length) return "Selecciona al menos un objetivo.";
  if (n <= 1 && filterCatalogObjetivos(objetivosSel).length > 1) {
    return "Con 1 día/sem solo puedes tener 1 objetivo. Quita el secundario o sube la frecuencia.";
  }
  if (!nextData.deporte) return "Selecciona un deporte.";
  if (!nextData.frecuencia) return "Selecciona la frecuencia semanal.";
  if (!nextData.experiencia) return "Indica el tiempo que llevas entrenando.";
  if (!nextData.diaCompeticion) return "Selecciona el día de competición.";
  if (trainingDays.length < n) {
    return `Con frecuencia ${n} días/sem, selecciona al menos ${n} días disponibles.`;
  }
  if (!nextData.material?.length) return "Selecciona al menos un material disponible.";
  return "";
}

function ChipGroup({ options, selected, onToggle, multi = true, maxSelected }) {
  const list = multi
    ? (Array.isArray(selected) ? selected : normalizeStringList(selected))
    : selected;
  const isSel = (opt) => (multi ? list.includes(opt) : list === opt);
  const atMax = multi && maxSelected != null && list.length >= maxSelected;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const sel = isSel(opt);
        const disabled = multi && atMax && !sel;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
              sel
                ? "bg-depro-blue border-depro-blue text-white"
                : disabled
                  ? "bg-gray-50 border-depro-border text-gray-300 cursor-not-allowed"
                  : "bg-white border-depro-border text-depro-gray hover:border-depro-blue"
            }`}
          >
            {opt}
          </button>
        );
      })}
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

  const [planForProfile, setPlanForProfile] = useState(() => (user?.id ? loadPlayerPlan(user.id) : null));
  const initialTraining = mergeTrainingSources(user || {}, planForProfile);
  const [trainingDays, setTrainingDays] = useState(() => (
    initialTraining.disponibles.length ? initialTraining.disponibles : ["Lunes", "Miércoles", "Viernes"]
  ));
  const [materialSel, setMaterialSel] = useState(() => initialTraining.material);
  const [experienciaSel, setExperienciaSel] = useState(() => initialTraining.experiencia || "");
  const [edadSel, setEdadSel] = useState(() => initialTraining.edad);
  const [deporteSel, setDeporteSel] = useState(() => initialTraining.deporte);
  const [frecuenciaSel, setFrecuenciaSel] = useState(() => initialTraining.frecuencia);
  const [objetivosSel, setObjetivosSel] = useState(() => filterCatalogObjetivos(initialTraining.objetivos));
  const [lesionSel, setLesionSel] = useState(() => initialTraining.lesion);
  const [lesionSubtipoSel, setLesionSubtipoSel] = useState(() => initialTraining.lesionSubtipo);
  const [diaCompeticionSel, setDiaCompeticionSel] = useState(() => initialTraining.diaCompeticion || "Fin de semana");
  const [daysSaving, setDaysSaving] = useState(false);
  const [daysMsg, setDaysMsg] = useState("");
  const [regenConfirmOpen, setRegenConfirmOpen] = useState(false);
  const [pendingRegenData, setPendingRegenData] = useState(null);
  const [trainingHydratedKey, setTrainingHydratedKey] = useState(() => trainingFieldsKey(initialTraining));
  const trainingDirtyRef = useRef(false);
  const trainingHydratedKeyRef = useRef(trainingHydratedKey);
  trainingHydratedKeyRef.current = trainingHydratedKey;
  const currentPlan = planForProfile || (user?.id ? loadPlayerPlan(user.id) : null);
  const profileRegensUsed = user?.id ? getProfileRegenCount(user.id, currentPlan) : 0;
  const canProfileRegen = user?.id ? canRegenerateFromProfile(user.id, currentPlan, user) : false;
  const freqN = freqNumber(frecuenciaSel || "3 días / sem");
  const markTrainingDirty = () => { trainingDirtyRef.current = true; };

  const [accountName, setAccountName] = useState(user?.name || "");
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState(null);
  const [addonLoading, setAddonLoading] = useState(null);
  const [premiumCap, setPremiumCap] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

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
    if (user?.role !== "player" || isPlayerPro(user)) return;
    let cancelled = false;
    fetchPremiumCapacity().then((cap) => {
      if (!cancelled) setPremiumCap(cap);
    });
    return () => { cancelled = true; };
  }, [user?.id, user?.plan, user?.role]);

  const handleBuyAddonFromProfile = async (addon) => {
    if (!addon?.id || !user) return;
    const ok = window.confirm(
      `¿Añadir «${addon.name}» por ${addon.price}€${addon.period || "/ mes"}?\nSe cargará en tu suscripción Stripe (prorrateo si aplica).`,
    );
    if (!ok) return;
    setAddonLoading(addon.id);
    showAccountMsg("ok", "Procesando pago con Stripe…");
    const res = await purchaseAddon(user, addon.id);
    setAddonLoading(null);
    if (res.ok && res.inline) {
      await refreshUser();
      showAccountMsg("ok", `«${addon.name}» activado en tu cuenta ✓`);
      return;
    }
    if (!res.ok) showAccountMsg("error", res.error || "No se pudo añadir el extra.");
  };

  const handleUpgradePremiumFromProfile = async () => {
    if (!user || isPlayerPro(user)) return;
    if (premiumCap && premiumCap.ok && !premiumCap.available) {
      showAccountMsg("error", `No quedan plazas Premium (máx. ${PREMIUM_PLAYER_CAP}).`);
      return;
    }
    const spots = premiumCap?.remaining != null ? ` Quedan ${premiumCap.remaining} plazas.` : "";
    const ok = window.confirm(
      `¿Cambiar a Premium (${formatPrice(PLANS["player-pro"]?.price || 99)}/mes)?${spots}\nSe actualizará tu suscripción (prorrateo en Stripe si aplica).`,
    );
    if (!ok) return;
    setUpgradeLoading(true);
    const res = await changePlan({ user, newPlanId: "player-pro" });
    setUpgradeLoading(false);
    if (!res.ok) {
      showAccountMsg("error", res.error || "No se pudo actualizar a Premium.");
      const cap = await fetchPremiumCapacity();
      setPremiumCap(cap);
      return;
    }
    await refreshUser();
    showAccountMsg("ok", "Plan actualizado a Premium ✓");
    setPremiumCap(await fetchPremiumCapacity());
  };

  // Precarga desde cuestionario O snapshot del plan (motor). No pisa edits locales.
  const applyTrainingFields = (next, { force = false } = {}) => {
    if (!force && trainingDirtyRef.current) return;
    const key = trainingFieldsKey(next);
    if (!force && key === trainingHydratedKeyRef.current) return;
    trainingHydratedKeyRef.current = key;
    setTrainingHydratedKey(key);
    setEdadSel(next.edad);
    setDeporteSel(next.deporte);
    setFrecuenciaSel(normalizeFrecuencia(next.frecuencia) || next.frecuencia || "");
    setObjetivosSel(filterCatalogObjetivos(next.objetivos));
    setMaterialSel(next.material);
    setExperienciaSel(next.experiencia);
    setLesionSel(next.lesion);
    setLesionSubtipoSel(next.lesionSubtipo);
    if (next.diaCompeticion) setDiaCompeticionSel(next.diaCompeticion);
    if (next.disponibles.length) setTrainingDays(next.disponibles);
  };

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const localPlan = loadPlayerPlan(user.id);
    if (localPlan) setPlanForProfile(localPlan);
    applyTrainingFields(mergeTrainingSources(user, localPlan));

    fetchPlayerPlan(user.id).then((remote) => {
      if (cancelled) return;
      if (remote) setPlanForProfile(remote);
      applyTrainingFields(mergeTrainingSources(user, remote || localPlan));
    });
    return () => { cancelled = true; };
  }, [
    user?.id,
    user?.edad,
    user?.age,
    user?.objetivo,
    user?.objetivoSecundario,
    user?.frecuencia,
    user?.deporte,
    user?.experiencia,
    Array.isArray(user?.objetivos) ? user.objetivos.join("|") : String(user?.objetivos || ""),
    Array.isArray(user?.disponibles) ? user.disponibles.join("|") : String(user?.disponibles || ""),
    Array.isArray(user?.material) ? user.material.join("|") : String(user?.material || ""),
  ]);

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
    const found = clubs.find((c) => clubMatchesDiscountCode(c, code));

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
    markTrainingDirty();
    setTrainingDays((prev) => (
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    ));
    setDaysMsg("");
  };

  const toggleMaterial = (item) => {
    markTrainingDirty();
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
    markTrainingDirty();
    setObjetivosSel((prev) => {
      const cur = filterCatalogObjetivos(prev);
      if (cur.includes(obj)) {
        const next = cur.filter((o) => o !== obj);
        return next.length ? next : cur;
      }
      if (cur.length >= 2) return [cur[0], obj];
      return [...cur, obj];
    });
    setDaysMsg("");
  };

  const toggleLesion = (item) => {
    markTrainingDirty();
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
    markTrainingDirty();
    setLesionSubtipoSel((prev) => (
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    ));
    setDaysMsg("");
  };

  const buildTrainingPayload = () => {
    let objetivos = filterCatalogObjetivos(objetivosSel).slice(0, 2);
    const n = freqNumber(frecuenciaSel || "3 días / sem");
    if (n <= 1) objetivos = objetivos.slice(0, 1);
    return {
      edad: String(edadSel || "").trim(),
      deporte: deporteSel,
      frecuencia: normalizeFrecuencia(frecuenciaSel) || frecuenciaSel,
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

  const persistTrainingMetadata = async (nextData, { planOverride = null } = {}) => {
    const metaPayload = trainingFieldsToAuthMetadata(nextData);
    await supabase.auth.updateUser({ data: metaPayload });

    const existingPlan = planOverride || planForProfile || loadPlayerPlan(user.id);
    if (existingPlan) {
      const snap = trainingProfileSnapshotFromAny(nextData);
      existingPlan.profileSnapshot = snap;
      savePlayerPlan(user.id, existingPlan);
      setPlanForProfile(existingPlan);
    }

    trainingDirtyRef.current = false;
    const key = trainingFieldsKey(nextData);
    trainingHydratedKeyRef.current = key;
    setTrainingHydratedKey(key);
  };

  const runSuccessfulRegen = async (nextData) => {
    const newUser = { ...user, ...nextData };
    // Generar SIN tocar el plan actual hasta confirmar éxito (no gasta cupo si falla).
    const probe = buildPlayerPlan(newUser);
    if (!isSuccessfulGeneratedPlan(probe)) {
      const msg = probe?.planError
        || "No se pudo generar la rutina con esos datos. Revisa los campos e inténtalo de nuevo (no se ha gastado el cupo).";
      setDaysMsg(msg);
      return false;
    }

    const weeks = buildFourWeekPlan(newUser);
    const hasWork = (weeks || []).some((w) => isSuccessfulGeneratedPlan(w.days || w));
    if (!hasWork) {
      setDaysMsg("No se pudo generar la rutina con esos datos. No se ha gastado el cupo.");
      return false;
    }

    const snap = trainingProfileSnapshotFromAny(nextData);
    const startDate = probe.startDate || new Date().toISOString().slice(0, 10);
    const profileRegenAt = new Date().toISOString();
    const payload = {
      weeks,
      startDate,
      source: "profile_regen",
      profileRegenAt,
      profileSnapshot: snap,
      assignedTo: user.id,
      premiumPending: false,
      planPendingManual: false,
    };

    resetCycleCounters(user.id, startDate);
    recordProfileRegen(user.id, { startDate, source: "profile_regen", profileRegenAt });

    const normalized = normalizePlayerPlan(payload);
    if (normalized) {
      normalized.profileSnapshot = snap;
      normalized.source = "profile_regen";
      normalized.profileRegenAt = profileRegenAt;
      normalized.startDate = startDate;
    }
    savePlayerPlan(user.id, normalized || payload);
    setPlanForProfile(normalized || payload);

    const remote = await persistPlayerPlanRemote(user.id, payload);
    if (!remote.ok) {
      // Local ya está; avisamos pero no revertimos el cupo (la rutina sí cambió en este dispositivo)
      setDaysMsg(`Rutina regenerada en este dispositivo, pero no se pudo sincronizar: ${remote.error || "error de red"}`);
    }

    await supabase.auth.updateUser({ data: trainingFieldsToAuthMetadata(nextData) });
    trainingDirtyRef.current = false;
    const key = trainingFieldsKey(nextData);
    trainingHydratedKeyRef.current = key;
    setTrainingHydratedKey(key);

    await refreshUser();
    setDaysMsg("Perfil actualizado · rutina regenerada correctamente (1 cambio este mesociclo) ✓");
    setTimeout(() => setDaysMsg(""), 5000);
    return true;
  };

  const handleSaveTrainingProfile = async () => {
    const nextData = buildTrainingPayload();
    const validationError = validateTrainingComplete(nextData, trainingDays, objetivosSel);
    if (validationError) {
      setDaysMsg(validationError);
      return;
    }

    const prevMerged = mergeTrainingSources(user || {}, planForProfile || loadPlayerPlan(user?.id));
    const prevData = {
      ...prevMerged,
      frecuencia: normalizeFrecuencia(prevMerged.frecuencia) || prevMerged.frecuencia,
      objetivos: filterCatalogObjetivos(prevMerged.objetivos),
      lesion: prevMerged.lesion.includes("Ninguna") ? [] : prevMerged.lesion,
      lesionSubtipo: prevMerged.lesion.includes("Ninguna") ? [] : prevMerged.lesionSubtipo,
    };
    const nextForFp = {
      ...nextData,
      frecuencia: normalizeFrecuencia(nextData.frecuencia) || nextData.frecuencia,
      objetivos: filterCatalogObjetivos(nextData.objetivos),
      lesion: nextData.lesion || [],
    };
    const changed = profileTrainingFingerprint(nextForFp) !== profileTrainingFingerprint(prevData);
    const plan = planForProfile || loadPlayerPlan(user.id);

    if (!changed) {
      setDaysSaving(true);
      setDaysMsg("");
      try {
        await persistTrainingMetadata(nextData);
        await refreshUser();
        setDaysMsg("Perfil de entrenamiento guardado (sin cambios que regeneren la rutina).");
        setTimeout(() => setDaysMsg(""), 4000);
      } catch {
        setDaysMsg("No se pudo guardar. Inténtalo de nuevo.");
      } finally {
        setDaysSaving(false);
      }
      return;
    }

    if (!canRegenerateFromProfile(user.id, plan, user)) {
      setDaysSaving(true);
      setDaysMsg("");
      try {
        await persistTrainingMetadata(nextData);
        await refreshUser();
        setDaysMsg(isInTrial(user)
          ? TRIAL_LIMITED_MESSAGE
          : `Ya usaste tu cambio de rutina este mesociclo (${MAX_PROFILE_REGENS_PER_CYCLE}/mes). Los datos se guardaron, pero la rutina no se regeneró.`);
      } catch {
        setDaysMsg("No se pudo guardar. Inténtalo de nuevo.");
      } finally {
        setDaysSaving(false);
      }
      return;
    }

    // Siempre pedir confirmación si hay cambios que regeneran (motor, cuestionario o essential)
    setPendingRegenData(nextData);
    setRegenConfirmOpen(true);
    setDaysMsg("");
  };

  const handleCancelRegenConfirm = () => {
    setRegenConfirmOpen(false);
    setPendingRegenData(null);
    setDaysMsg("Cancelado. No se ha regenerado la rutina ni se ha gastado el cupo.");
    setTimeout(() => setDaysMsg(""), 4000);
  };

  const handleConfirmRegen = async () => {
    if (!pendingRegenData) return;
    setDaysSaving(true);
    setDaysMsg("");
    try {
      const ok = await runSuccessfulRegen(pendingRegenData);
      if (ok) {
        setRegenConfirmOpen(false);
        setPendingRegenData(null);
      }
    } catch {
      setDaysMsg("No se pudo regenerar. Inténtalo de nuevo (no se ha gastado el cupo).");
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

  if (isProCoachUser(user)) {
    return <Navigate to="/dashboard/club-profile" replace />;
  }

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
          <CreditCard size={18} className="text-depro-blue" /> Facturación y extras
        </h2>
        <p className="text-sm text-depro-gray mb-2">
          Plan actual:{" "}
          <span className="font-bold text-depro-dark">
            {isPlayerPro(user) ? "Premium" : "Standard"}
            {isInTrial(user) ? " · prueba 15 días" : ""}
          </span>
        </p>
        <p className="text-sm text-depro-gray mb-4">
          Gestiona el pago en Stripe, añade extras (+5€/mes) o pásate a Premium si quedan plazas.
        </p>
        <div className="flex flex-wrap gap-3 mb-5">
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
            <Sparkles size={14} /> Ver plan completo
          </Link>
        </div>

        {user?.role === "player" && !isPlayerPro(user) && (
          <div className="space-y-4 border-t border-depro-border pt-5">
            <div>
              <h3 className="font-bold text-depro-dark text-sm mb-1">Extras (+5€ / mes)</h3>
              <p className="text-xs text-depro-gray mb-3">
                En Standard el feedback es Premium. PDF, tests y mis cargas se añaden aquí confirmando el pago.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {PLAYER_ADDONS.map((addon) => {
                  const owned = hasFeatureAccess(user, addon.featureId)
                    || (user.purchasedAddons || []).includes(addon.id);
                  return (
                    <div key={addon.id} className="rounded-xl border border-depro-border p-3 flex flex-col">
                      <div className="font-bold text-depro-dark text-sm">{addon.name}</div>
                      <p className="text-xs text-depro-gray mt-1 flex-1">{addon.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-depro-dark">{addon.price}€{addon.period}</span>
                        {owned ? (
                          <span className="text-xs font-bold text-green-600">Incluido</span>
                        ) : (
                          <button
                            type="button"
                            disabled={!!addonLoading}
                            onClick={() => handleBuyAddonFromProfile(addon)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-depro-blue text-white hover:bg-depro-blue-dark disabled:opacity-50"
                          >
                            {addonLoading === addon.id ? "…" : "Añadir"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <h3 className="font-bold text-depro-dark text-sm mb-1">Pasar a Premium</h3>
              <p className="text-xs text-depro-gray mb-2">
                Feedback del preparador, todos los extras y seguimiento humano.
                <strong className="text-depro-dark"> Sin prueba gratis</strong> · plazas limitadas ({PREMIUM_PLAYER_CAP}).
                {premiumCap?.ok && (
                  <> · Disponibles: <strong>{premiumCap.remaining}</strong></>
                )}
              </p>
              <button
                type="button"
                disabled={upgradeLoading || (premiumCap?.ok && !premiumCap.available)}
                onClick={handleUpgradePremiumFromProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-dark text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {upgradeLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {premiumCap?.ok && !premiumCap.available
                  ? "Sin plazas Premium"
                  : `Actualizar a Premium · ${formatPrice(PLANS["player-pro"]?.price || 99)}`}
              </button>
            </div>
          </div>
        )}

        {user?.role === "player" && isPlayerPro(user) && (
          <p className="text-xs text-green-700 font-semibold border-t border-depro-border pt-4">
            Premium activo: feedback, PDF, tests y mis cargas incluidos.
          </p>
        )}
      </div>

      {user?.role === "player" && (
        <div className="bg-white border border-depro-border rounded-2xl p-6">
          <h2 className="font-bold text-depro-dark text-lg mb-1 flex items-center gap-2">
            <Calendar size={18} className="text-depro-blue" /> Entrenamiento
          </h2>
          <p className="text-sm text-depro-gray mb-2">
            Edita los mismos datos del onboarding (edad, objetivos, deporte, frecuencia, material, lesiones, días…).
            Si cambian y la rutina se genera bien, cuenta como regeneración
            {" "}(máximo {MAX_PROFILE_REGENS_PER_CYCLE} vez cada ~{PLAN_CYCLE_DAYS} días).
            Te pediremos confirmación antes de regenerar.
          </p>
          <p className={`text-xs font-bold mb-4 ${canProfileRegen ? "text-depro-blue" : "text-amber-700"}`}>
            Regeneraciones este mesociclo: {Math.min(profileRegensUsed, MAX_PROFILE_REGENS_PER_CYCLE)}/{MAX_PROFILE_REGENS_PER_CYCLE}
            {!canProfileRegen && (isInTrial(user)
              ? ` · ${TRIAL_LIMITED_MESSAGE}`
              : " · cupo agotado (puedes guardar datos, sin nueva rutina)")}
          </p>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-depro-gray mb-2">Edad</label>
            <input
              type="number"
              min={10}
              max={80}
              value={edadSel}
              onChange={(e) => { markTrainingDirty(); setEdadSel(e.target.value); setDaysMsg(""); }}
              className="w-28 px-3 py-2 rounded-xl border border-depro-border text-sm focus:outline-none focus:border-depro-blue"
              placeholder="años"
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Objetivos (máx. 2)</p>
            <p className="text-xs text-depro-gray mb-2">
              Se marcan los del cuestionario o los del motor de planes. Puedes elegir hasta 2.
            </p>
            <ChipGroup
              options={OBJECTIVES}
              selected={objetivosSel}
              onToggle={toggleObjective}
              multi
              maxSelected={2}
            />
            <p className="text-xs text-depro-gray mt-2">
              {objetivosSel.length === 0
                ? "Selecciona al menos 1 objetivo"
                : objetivosSel.length === 1
                  ? `Seleccionado: ${objetivosSel[0]} · puedes añadir un segundo`
                  : `Seleccionados: ${objetivosSel.join(" + ")}`}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Deporte</p>
            <ChipGroup
              options={SPORTS}
              selected={deporteSel}
              onToggle={(s) => { markTrainingDirty(); setDeporteSel(s); setDaysMsg(""); }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Frecuencia semanal</p>
            <ChipGroup
              options={FREQUENCY}
              selected={normalizeFrecuencia(frecuenciaSel) || frecuenciaSel}
              onToggle={(f) => {
                markTrainingDirty();
                setFrecuenciaSel(f);
                setDaysMsg("");
              }}
              multi={false}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Día de competición</p>
            <ChipGroup
              options={COMPETITION_DAY_OPTIONS}
              selected={diaCompeticionSel}
              onToggle={(d) => { markTrainingDirty(); setDiaCompeticionSel(d); setDaysMsg(""); }}
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
              onToggle={(exp) => { markTrainingDirty(); setExperienciaSel(exp); setDaysMsg(""); }}
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
            Guardar cambios de entrenamiento
          </button>
          <p className="text-xs text-depro-gray mt-2">
            Si hay cambios, te pediremos confirmación antes de regenerar la rutina.
          </p>
        </div>
      )}

      {regenConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-depro w-full max-w-md p-6 border border-depro-border">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-depro-dark text-lg">¿Estás seguro?</h3>
                <p className="text-sm text-depro-gray mt-1">
                  Se va a <strong className="text-depro-dark">regenerar tu rutina</strong> con los datos del perfil
                  (sustituye la actual). Solo puedes hacerlo
                  {" "}<strong className="text-depro-dark">1 vez cada mesociclo (~{PLAN_CYCLE_DAYS} días)</strong>.
                  Después no podrás volver a modificarla desde el perfil hasta el siguiente ciclo.
                </p>
                <p className="text-sm text-depro-gray mt-2">
                  El cupo solo se gasta si la rutina se genera correctamente.
                </p>
              </div>
            </div>
            {daysMsg && !daysMsg.includes("✓") && (
              <p className="text-xs text-amber-700 mb-3">{daysMsg}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleCancelRegenConfirm}
                disabled={daysSaving}
                className="px-4 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-dark hover:bg-depro-gray-light transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRegen}
                disabled={daysSaving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark transition-colors disabled:opacity-50"
              >
                {daysSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Sí, regenerar rutina
              </button>
            </div>
          </div>
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
