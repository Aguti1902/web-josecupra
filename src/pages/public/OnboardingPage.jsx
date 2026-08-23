import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerPendingClubPlayer } from "../../lib/clubPlayerRegistry";
import {
  ArrowLeft, ArrowRight, CheckCircle, Zap, Trophy, User, Mail, Calendar,
  Target, AlertCircle, Shield, Lock,
  ChevronRight, ChevronDown, BadgeCheck, MapPin, Building2, Users,
} from "lucide-react";
import {
  AUDIENCES, PLANS, resolvePlanId, plansForAudience, formatPrice, applyClubDiscount,
} from "../../lib/checkoutPlans";
import { useAuth } from "../../context/AuthContext";
import { PLAYER_ADDONS } from "../../lib/playerAddons";
import StripeTestBanner from "../../components/public/StripeTestBanner";
import TeamBrandingFields, { saveCoachBrandingDraft } from "../../components/shared/TeamBrandingFields";
import { COMPETITION_DAY_OPTIONS } from "../../lib/planLoadRules";
import { SECONDARY_BLOCKED_FREQ1_MESSAGE } from "../../lib/objectiveSessionMatrix";
import EmbeddedStripeCheckout from "../../components/public/EmbeddedStripeCheckout";
import CoachAutoQuestionnaire from "../../components/shared/CoachAutoQuestionnaire";
import { validateCoachQuestionnaire } from "../../lib/clubAuto/clubAutoCoachBridge";

const ONBOARDING_STORAGE_KEY = "depro_onboarding";
const ONBOARDING_DRAFT_KEY = "depro_onboarding_draft_v1";
const SPORTS     = ["Fútbol", "Baloncesto", "Balonmano", "Atletismo", "Natación", "Otro"];
const FREQUENCY  = ["1 día / sem", "2 días / sem", "3 días / sem", "4 días / sem", "5 días / sem"];
const MATERIALS  = ["Sin material", "Gomas", "Mancuernas", "Barra", "Gimnasio completo"];
const INJURIES   = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda", "Pubalgia"];
const INJURY_SUBTYPES = {
  Rodilla: ["ACL", "Menisco", "Rotuliana", "Otra"],
  Tobillo: ["Esguince", "Inestabilidad", "Otra"],
  Hombro: ["Manguito rotador", "Inestabilidad", "Otra"],
  Espalda: ["Lumbar", "Dorsal", "Cervical", "Otra"],
  Pubalgia: ["Aductores", "Recto abdominal", "Mixta"],
};
const OBJECTIVES = ["Fuerza", "Velocidad", "Resistencia", "Hipertrofia", "Prevención", "Movilidad"];
const COMPETITION_DAYS = COMPETITION_DAY_OPTIONS;
const WEEK_DAYS  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const EXPERIENCE = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
const STEPS_PLAYER = ["Plan", "Tu cuenta", "Tus datos", "Tu entrenamiento", "Pago"];
const STEPS_STAFF  = ["Plan", "Tu cuenta", "Equipo / Microciclo", "Pago"];

/* ─────────────────────────────────────────────
   COMPONENTES AUX
───────────────────────────────────────────── */
function StepHeader({ steps, current }) {
  return (
    <div className="mb-10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center justify-between mb-3 min-w-[280px] sm:min-w-0">
        {steps.map((label, i) => {
          const stepNumber = i + 1;
          const done = stepNumber < current;
          const active = stepNumber === current;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
                    done
                      ? "bg-depro-green text-white"
                      : active
                      ? "bg-depro-blue text-white shadow-depro"
                      : "bg-depro-gray-light text-depro-gray"
                  }`}
                >
                  {done ? <CheckCircle size={15} /> : stepNumber}
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    active ? "text-depro-dark" : "text-depro-gray"
                  }`}
                >
                  {label}
                </span>
              </div>
              {stepNumber !== steps.length && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${done ? "bg-depro-green" : "bg-depro-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ label, value, options, onChange, multi = false }) {
  const handle = (opt) => {
    if (multi) {
      const next = value?.includes(opt) ? value.filter((v) => v !== opt) : [...(value || []), opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  };
  return (
    <div>
      <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = multi ? value?.includes(opt) : value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handle(opt)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                selected
                  ? "bg-depro-blue border-depro-blue text-white"
                  : "bg-white border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-blue/40"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 1 — Elegir plan
───────────────────────────────────────────── */
function StepPlan({ audience, onAudienceChange, selected, onSelect, onNext }) {
  const visiblePlans = plansForAudience(audience);

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Elige tu plan</h2>
      <p className="text-depro-gray text-sm mb-6">Selecciona el perfil y el plan que encaja con tu escala.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.values(AUDIENCES).map((aud) => (
          <button
            key={aud.id}
            type="button"
            onClick={() => onAudienceChange(aud.id)}
            className={`text-sm font-bold px-4 py-2.5 rounded-xl border transition-all ${
              audience === aud.id
                ? "bg-depro-blue border-depro-blue text-white"
                : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
            }`}
          >
            {aud.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${visiblePlans.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {visiblePlans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={`relative text-left rounded-2xl border-2 p-6 transition-all hover:shadow-card-hover hover:-translate-y-1 ${
                isSelected ? "border-depro-blue bg-depro-blue/[0.03]" : "border-depro-border bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 right-5 bg-depro-yellow text-depro-dark text-[10px] font-black px-3 py-1 rounded-full">
                  RECOMENDADO
                </span>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.bg }}>
                  {plan.highlight ? <Trophy size={20} style={{ color: plan.color }} /> : <Zap size={20} style={{ color: plan.color }} />}
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "border-depro-blue bg-depro-blue" : "border-depro-border"
                  }`}
                >
                  {isSelected && <CheckCircle size={14} className="text-white" />}
                </div>
              </div>

              <h3 className="text-xl font-black text-depro-dark">{plan.name}</h3>
              <p className="text-xs text-depro-gray mt-0.5 mb-3">{plan.tagline}</p>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-black text-depro-dark">{formatPrice(plan.price)}</span>
                <span className="text-xs text-depro-gray">{plan.period}</span>
              </div>

              <ul className="space-y-2 mb-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-depro-gray">
                    <CheckCircle size={14} className="text-depro-blue mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 2 — Crear cuenta
───────────────────────────────────────────── */
function StepCuenta({ form, setForm, onNext, onBack }) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(form.nombre || "");
  const [email, setEmail] = useState(form.email || "");
  const [password, setPassword] = useState(form.password || form.pendingPassword || "");
  const [confirm, setConfirm] = useState(form.password || form.pendingPassword || "");
  const [error, setError] = useState("");

  const handleContinueLoggedIn = () => {
    setForm((f) => ({
      ...f,
      email: user.email,
      nombre: (f.nombre || user.name || user.user_metadata?.name || "").trim(),
    }));
    onNext();
  };

  // No crear usuario en Auth antes del pago: solo validar y guardar credenciales en el form.
  // La cuenta se crea en complete-payment tras checkout / activación del trial.
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    const displayName = nombre.trim() || email.split("@")[0];
    setForm((f) => ({
      ...f,
      email: email.trim().toLowerCase(),
      nombre: displayName,
      password,
      pendingPassword: password,
    }));
    onNext();
  };

  if (user) {
    return (
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Tu cuenta</h2>
        <p className="text-depro-gray text-sm mb-8">Continuarás con la sesión que ya tienes abierta.</p>

        <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-depro-blue/10 flex items-center justify-center">
              <User size={22} className="text-depro-blue" />
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-depro-dark truncate">{user.name || user.email}</div>
              <div className="text-sm text-depro-gray truncate">{user.email}</div>
            </div>
            <CheckCircle size={20} className="text-depro-green ml-auto shrink-0" />
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={16} /> Atrás
          </button>
          <button onClick={handleContinueLoggedIn} className="btn-primary flex items-center gap-2">
            Continuar con sesión actual <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Datos de acceso</h2>
      <p className="text-depro-gray text-sm mb-8">
        Indica email y contraseña. Tu cuenta se crea al completar el checkout y activar la prueba gratuita.
      </p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card space-y-5">
        <p className="text-xs text-depro-gray bg-depro-bg/50 border border-depro-border rounded-xl px-3 py-2.5">
          El acceso con Google es solo para cuentas ya activas. Para comprar, continúa con email y contraseña (sin crear usuario hasta el pago).
        </p>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Nombre *</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="admin-input w-full pl-10"
                placeholder="Tu nombre y apellidos"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Email *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Contraseña *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input w-full pl-10"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Confirmar contraseña *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="admin-input w-full pl-10"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Continuar al checkout
          </button>
        </form>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Atrás
        </button>
      </div>

      <p className="text-xs text-depro-gray mt-6 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-depro-blue font-bold hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 3 — Datos personales
───────────────────────────────────────────── */
function StepDatos({ audience, form, setForm, onNext, onBack, loggedInEmail, planId }) {
  const isPremiumPlayer = audience === "player" && (planId === "player-pro" || planId === "premium");
  const isPlayer = audience === "player";
  const email = loggedInEmail || form.email;
  const [clubTeams, setClubTeams] = useState([]);
  const [clubCodeMsg, setClubCodeMsg] = useState("");

  const resolveClubFromCode = (codeRaw) => {
    if (!codeRaw?.trim()) {
      setClubTeams([]);
      setClubCodeMsg("");
      setForm((f) => ({ ...f, clubId: "", clubTeamId: "" }));
      return true;
    }
    try {
      const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
      const code = codeRaw.trim().toUpperCase();
      const found = clubs.find((c) => (c.loginCode || c.login_code || "").toUpperCase() === code);
      if (!found) {
        setClubTeams([]);
        setClubCodeMsg("Código no encontrado");
        return false;
      }
      const detail = JSON.parse(localStorage.getItem(`depro_club_${found.id}`) || "null");
      const teams = detail?.teams || found.teams || [];
      if (teams.length === 0) {
        setClubCodeMsg("Este club aún no tiene equipos configurados");
        return false;
      }
      setClubTeams(teams);
      setClubCodeMsg(`Club encontrado: ${found.name}`);
      setForm((f) => ({ ...f, clubId: found.id, clubTeamId: f.clubTeamId || teams[0]?.id || "" }));
      return true;
    } catch {
      setClubCodeMsg("No se pudo validar el código");
      return false;
    }
  };

  const missing = [];
  if (!form.nombre?.trim()) missing.push("nombre");
  if (!email?.trim()) missing.push("email");
  if (!isPlayer && !form.club?.trim()) missing.push(audience === "club" ? "nombre del club" : "club / academia");
  if (isPremiumPlayer && !String(form.phone || "").trim()) missing.push("teléfono de contacto");
  if ((audience === "coach" || audience === "club")) {
    const q = validateCoachQuestionnaire(form.coachAuto || {});
    if (!q.ok) missing.push("cuestionario de equipo / microciclo");
  }
  // Código de club inválido: aviso, pero no bloquea el avance (se puede quitar)
  const clubCodeBlocking = !!(form.clubCode?.trim() && !(form.clubId && form.clubTeamId));
  const valid = missing.length === 0;

  const handleNext = () => {
    if (clubCodeBlocking) {
      // No bloquear el cuestionario por un código mal escrito
      setForm((f) => ({ ...f, clubCode: "", clubId: "", clubTeamId: "" }));
      setClubTeams([]);
      setClubCodeMsg("Código no válido: continuamos sin descuento de club.");
    }
    setForm((f) => ({
      ...f,
      email: (loggedInEmail || f.email || "").trim(),
      nombre: (f.nombre || "").trim(),
      ...(clubCodeBlocking ? { clubCode: "", clubId: "", clubTeamId: "" } : {}),
    }));
    if (audience === "coach" || audience === "club") {
      try {
        saveCoachBrandingDraft({
          logo: form.logo || "",
          primaryColor: form.primaryColor || "#0A36F7",
          secondaryColor: form.secondaryColor || "#ffffff",
          clubName: form.club || "",
          teamHint: form.equipos || "",
        });
      } catch { /* no bloquear el alta */ }
    }
    onNext();
  };

  const clearClubCode = () => {
    setForm((f) => ({ ...f, clubCode: "", clubId: "", clubTeamId: "" }));
    setClubTeams([]);
    setClubCodeMsg("");
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">
        {audience === "club" ? "Datos del club" : audience === "coach" ? "Datos del entrenador" : "Cuéntanos sobre ti"}
      </h2>
      <p className="text-depro-gray text-sm mb-8">
        {audience === "player"
          ? "Necesitamos tus datos para crear tu cuenta y personalizar el plan."
          : "Crearemos tu cuenta y configuraremos el panel según tu contexto."}
      </p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
              {audience === "club" ? "Persona de contacto *" : "Nombre completo *"}
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="admin-input w-full pl-10"
                placeholder={audience === "club" ? "Nombre del responsable" : "Tu nombre y apellidos"}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Email *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {loggedInEmail ? (
                <input
                  type="email"
                  readOnly
                  value={loggedInEmail}
                  className="admin-input w-full pl-10 bg-depro-gray-light/60 cursor-not-allowed"
                />
              ) : (
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="admin-input w-full pl-10"
                  placeholder="tu@email.com"
                />
              )}
            </div>
          </div>
        </div>

        {isPlayer ? (
          <>
            {isPremiumPlayer && (
              <div>
                <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                  Teléfono de contacto *
                </label>
                <p className="text-xs text-depro-gray mb-2">
                  Premium: tu preparador te contactará para agendar la videollamada (rutina manual &lt; 48h).
                </p>
                <input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="admin-input w-full"
                  placeholder="+34 600 000 000"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Ubicación</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={form.club}
                  onChange={(e) => setForm((f) => ({ ...f, club: e.target.value }))}
                  className="admin-input w-full pl-10"
                  placeholder="Ciudad, club o academia (opcional)"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                Código de club <span className="text-depro-gray font-normal normal-case">(opcional · descuento 10%)</span>
              </label>
              <input
                type="text" value={form.clubCode}
                onChange={(e) => {
                  setForm((f) => ({ ...f, clubCode: e.target.value.toUpperCase(), clubId: "", clubTeamId: "" }));
                  setClubTeams([]);
                  setClubCodeMsg("");
                }}
                onBlur={() => { if (form.clubCode?.trim()) resolveClubFromCode(form.clubCode); }}
                className="admin-input w-full uppercase tracking-wider"
                placeholder="EJ. DEPRO-CLUB-2025"
                maxLength={32}
              />
              {clubCodeMsg && (
                <p className={`text-xs mt-1.5 ${clubCodeMsg.includes("encontrado") && !clubCodeMsg.includes("no encontrado") && !clubCodeMsg.includes("no válido") ? "text-green-700" : "text-amber-700"}`}>
                  {clubCodeMsg}
                </p>
              )}
              {form.clubCode?.trim() && (
                <button type="button" onClick={clearClubCode} className="text-xs font-semibold text-depro-blue mt-1.5 hover:underline">
                  Quitar código y continuar sin descuento
                </button>
              )}
            </div>

            {clubTeams.length > 0 && (
              <div>
                <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                  Equipo dentro del club *
                </label>
                <select
                  value={form.clubTeamId || ""}
                  onChange={(e) => setForm((f) => ({ ...f, clubTeamId: e.target.value }))}
                  className="admin-input w-full"
                >
                  {clubTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} · {t.category}</option>
                  ))}
                </select>
                <p className="text-xs text-depro-gray mt-1.5">
                  Tras el pago entrarás en la plantilla de este equipo con el escudo y banner del club.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                {audience === "club" ? "Nombre del club *" : "Club / academia principal *"}
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={form.club}
                  onChange={(e) => setForm((f) => ({ ...f, club: e.target.value }))}
                  className="admin-input w-full pl-10"
                  placeholder={audience === "club" ? "Ej. FC Cantera Norte" : "Ej. Academia o club donde entrenas"}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                {audience === "club" ? "Número de equipos / categorías" : "Equipos que gestionas"}
              </label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={form.equipos}
                  onChange={(e) => setForm((f) => ({ ...f, equipos: e.target.value }))}
                  className="admin-input w-full pl-10"
                  placeholder={audience === "club" ? "Ej. 5 categorías" : "Ej. Juvenil A, Cadete B"}
                />
              </div>
            </div>

            {(audience === "coach" || audience === "club") && (
              <TeamBrandingFields
                logo={form.logo || ""}
                primaryColor={form.primaryColor || "#0A36F7"}
                secondaryColor={form.secondaryColor || "#ffffff"}
                title={audience === "coach" ? "Escudo y colores del equipo" : "Escudo y colores del club"}
                onChange={(b) => setForm((f) => ({
                  ...f,
                  logo: b.logo,
                  primaryColor: b.primaryColor,
                  secondaryColor: b.secondaryColor,
                }))}
              />
            )}

            {(audience === "coach" || audience === "club") && (
              <div className="pt-4 border-t border-depro-border space-y-3">
                <div>
                  <h3 className="font-bold text-depro-dark text-sm">Equipo / Microciclo</h3>
                  <p className="text-xs text-depro-gray mt-0.5">
                    Completa el cuestionario antes del pago para generar la planificación automática.
                  </p>
                </div>
                <CoachAutoQuestionnaire
                  value={form.coachAuto || {}}
                  onChange={(coachAuto) => setForm((f) => ({ ...f, coachAuto }))}
                  showErrors
                />
              </div>
            )}
          </>
        )}
      </div>

      {!valid && (
        <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Completa: {missing.join(", ")}.
        </p>
      )}
      {valid && clubCodeBlocking && (
        <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          El código de club no es válido. Al continuar se ignorará (sin descuento), o{" "}
          <button type="button" onClick={clearClubCode} className="font-bold underline">quítalo ahora</button>.
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button onClick={handleNext} disabled={!valid} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isPlayer ? "Continuar" : "Ir al pago"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 4 — Datos de fútbol
───────────────────────────────────────────── */
function StepFutbol({ form, setForm, onNext, onBack, planId }) {
  const isPremium = planId === "player-pro" || planId === "premium";
  const freqN = parseInt(String(form.frecuencia).replace(/\D/g, "")) || 3;
  const objetivos = form.objetivos?.length ? form.objetivos : [form.objetivo, form.objetivoSecundario].filter(Boolean);
  const materialOk = Array.isArray(form.material) ? form.material.length > 0 : !!form.material;
  const valid = form.edad && objetivos.length >= 1 && form.deporte && form.frecuencia && materialOk && form.experiencia
    && form.diaCompeticion
    && (form.disponibles?.length || 0) >= freqN;

  const toggleObjetivo = (obj) => {
    // max 1 objetivo si entrena 1 día/sem; si aún no eligió frecuencia, permitir hasta 2
    const maxObjs = form.frecuencia && freqN <= 1 ? 1 : 2;
    setForm((f) => {
      const cur = f.objetivos?.length
        ? f.objetivos
        : [f.objetivo, f.objetivoSecundario].filter(Boolean);
      if (cur.includes(obj)) {
        const next = cur.filter((x) => x !== obj);
        return { ...f, objetivos: next, objetivo: next[0] || "", objetivoSecundario: next[1] || "" };
      }
      if (cur.length >= maxObjs) return f;
      const next = [...cur, obj];
      return { ...f, objetivos: next, objetivo: next[0], objetivoSecundario: next[1] || "" };
    });
  };

  const handleFrequencyChange = (v) => {
    const newFreqN = parseInt(String(v).replace(/\D/g, "")) || 3;
    setForm((f) => {
      const cur = f.objetivos?.length
        ? f.objetivos
        : [f.objetivo, f.objetivoSecundario].filter(Boolean);
      const nextObjs = newFreqN === 1 && cur.length > 1 ? [cur[0]] : cur;

      // Asegurar suficientes días seleccionados al subir la frecuencia
      let days = [...(f.disponibles || [])];
      if (days.length < newFreqN) {
        for (const d of WEEK_DAYS) {
          if (days.length >= newFreqN) break;
          if (!days.includes(d)) days.push(d);
        }
      }

      return {
        ...f,
        frecuencia: v,
        objetivos: nextObjs,
        objetivo: nextObjs[0] || "",
        objetivoSecundario: nextObjs[1] || "",
        disponibles: days,
      };
    });
  };

  const validationHints = [];
  if (!form.edad) validationHints.push("edad");
  if (!objetivos.length) validationHints.push("al menos 1 objetivo");
  if (!form.deporte) validationHints.push("deporte");
  if (!form.frecuencia) validationHints.push("frecuencia");
  if (!materialOk) validationHints.push("material disponible");
  if (!form.experiencia) validationHints.push("experiencia");
  if (!form.diaCompeticion) validationHints.push("día de competición");
  if ((form.disponibles?.length || 0) < freqN) {
    validationHints.push(`al menos ${freqN} días disponibles (ahora ${form.disponibles?.length || 0})`);
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Tu entrenamiento</h2>
      <p className="text-depro-gray text-sm mb-8">
        {isPremium
          ? "Guardamos tu cuestionario para que tu preparador diseñe la rutina manualmente. No se genera un plan automático."
          : "Con estos datos el sistema genera automáticamente tu plan personalizado."}
      </p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card space-y-6">

        {/* Edad */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Edad *</label>
          <div className="relative max-w-xs">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number" min="10" max="60" value={form.edad}
              onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))}
              className="admin-input w-full pl-10"
              placeholder="18"
            />
          </div>
        </div>

        {/* Deporte principal */}
        <Toggle
          label="Deporte principal *"
          value={form.deporte}
          options={SPORTS}
          onChange={(v) => setForm((f) => ({ ...f, deporte: v }))}
        />

        {/* Frecuencia primero: condiciona cuántos objetivos se permiten */}
        <Toggle
          label="Días de entrenamiento por semana *"
          value={form.frecuencia}
          options={FREQUENCY}
          onChange={handleFrequencyChange}
        />

        {/* Objetivos */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1 block flex items-center gap-1.5">
            <Target size={12} className="text-depro-blue" /> Objetivos *
          </label>
          <p className="text-xs text-depro-gray mb-3">
            El objetivo principal es obligatorio. Puedes añadir un segundo objetivo opcional si entrenas al menos 2 días por semana.
          </p>
          {freqN === 1 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              {SECONDARY_BLOCKED_FREQ1_MESSAGE}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OBJECTIVES.map((obj) => {
              const sel = objetivos.includes(obj);
              const maxObjs = form.frecuencia && freqN <= 1 ? 1 : 2;
              const full = objetivos.length >= maxObjs && !sel;
              return (
                <button
                  key={obj} type="button"
                  onClick={() => toggleObjetivo(obj)}
                  disabled={full}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
                    sel
                      ? "bg-depro-blue border-depro-blue text-white"
                      : full
                        ? "bg-gray-50 border-depro-border text-gray-300 cursor-not-allowed"
                        : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
                  }`}
                >
                  <span className="text-lg">
                    {obj === "Fuerza" ? "💪" : obj === "Velocidad" ? "⚡" : obj === "Resistencia" ? "🫀" : obj === "Hipertrofia" ? "🏋️" : obj === "Prevención" ? "🛡️" : "🧘"}
                  </span>
                  {obj}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-depro-gray mt-2">
            {objetivos.length === 0
              ? "Selecciona al menos 1 objetivo"
              : objetivos.length === 1
                ? "1 objetivo (principal)"
                : "2 objetivos (principal + secundario)"}
          </p>
        </div>

        {/* Día de competición */}
        <Toggle
          label="Día habitual de competición *"
          value={form.diaCompeticion}
          options={COMPETITION_DAYS}
          onChange={(v) => setForm((f) => ({ ...f, diaCompeticion: v }))}
        />

        {/* Días disponibles */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 block">
            Días en los que puedes entrenar *
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const sel = (form.disponibles || []).includes(day);
              return (
                <button key={day} type="button"
                  onClick={() => {
                    setForm((f) => {
                      const cur = f.disponibles || [];
                      const next = sel ? cur.filter((d) => d !== day) : [...cur, day];
                      return { ...f, disponibles: next };
                    });
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border ${sel ? "bg-depro-blue border-depro-blue text-white" : "bg-white border-depro-border text-depro-gray"}`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-depro-gray mt-2">Selecciona al menos tantos días como tu frecuencia ({freqN}).</p>
        </div>

        {/* Material — multiselección real */}
        <Toggle
          label="Material disponible *"
          value={Array.isArray(form.material) ? form.material : (form.material ? [form.material] : [])}
          options={MATERIALS}
          multi
          onChange={(v) => setForm((f) => ({ ...f, material: v }))}
        />
        <p className="text-xs text-depro-gray -mt-3">
          Puedes marcar varias opciones. «Gimnasio completo» desbloquea todo el catálogo (barra, máquinas, gomas y mancuernas).
        </p>

        {/* Experiencia entrenando */}
        <Toggle
          label="Experiencia entrenando *"
          value={form.experiencia}
          options={EXPERIENCE}
          onChange={(v) => setForm((f) => ({ ...f, experiencia: v }))}
        />

        {/* Lesiones */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-amber-500" /> Lesiones o molestias actuales
          </label>
          <div className="flex flex-wrap gap-2">
            {INJURIES.map((inj) => {
              const sel = (form.lesion || []).includes(inj) || (inj === "Ninguna" && (!form.lesion || form.lesion.length === 0));
              return (
                <button
                  key={inj} type="button"
                  onClick={() => {
                    if (inj === "Ninguna") { setForm({ ...form, lesion: [], lesionSubtipo: [] }); return; }
                    const current = (form.lesion || []).filter((x) => x !== "Ninguna");
                    const next = current.includes(inj) ? current.filter((x) => x !== inj) : [...current, inj];
                    setForm({ ...form, lesion: next });
                  }}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    sel
                      ? inj === "Ninguna" ? "bg-green-500 border-green-500 text-white" : "bg-amber-500 border-amber-500 text-white"
                      : "bg-white border-depro-border text-depro-gray hover:border-amber-300"
                  }`}
                >
                  {inj}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-depro-gray mt-2">El plan excluirá ejercicios contraindicados para tus lesiones.</p>
          {(form.lesion || []).filter((x) => x !== "Ninguna").map((inj) => (
            <div key={inj} className="mt-3">
              <p className="text-[10px] font-bold text-depro-gray uppercase mb-2">Subtipo · {inj}</p>
              <div className="flex flex-wrap gap-2">
                {(INJURY_SUBTYPES[inj] || []).map((sub) => {
                  const sel = (form.lesionSubtipo || []).includes(sub);
                  return (
                    <button key={sub} type="button"
                      onClick={() => {
                        const cur = form.lesionSubtipo || [];
                        const next = sel ? cur.filter((x) => x !== sub) : [...cur, sub];
                        setForm({ ...form, lesionSubtipo: next });
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${sel ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-depro-border text-depro-gray"}`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!valid && validationHints.length > 0 && (
        <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Para ir al pago completa: {validationHints.join(", ")}.
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button onClick={onNext} disabled={!valid} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          Ir al pago <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 4 — Pago
───────────────────────────────────────────── */
function StepPago({ form, setForm, plan, onBack, authUserId }) {
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const selectedAddons = form.selectedAddons || [];

  useEffect(() => {
    if (!authUserId || !form.clubId || !form.clubTeamId) return;
    registerPendingClubPlayer({
      userId: authUserId,
      clubId: form.clubId,
      teamId: form.clubTeamId,
      name: form.nombre,
      email: form.email,
      plan: plan?.id,
    });
  }, [authUserId, form.clubId, form.clubTeamId, form.nombre, form.email, plan?.id]);
  const addonsTotal = selectedAddons.reduce((sum, id) => sum + (PLAYER_ADDONS.find((a) => a.id === id)?.price || 0), 0);

  const toggleAddon = (id) => {
    const next = selectedAddons.includes(id)
      ? selectedAddons.filter((x) => x !== id)
      : [...selectedAddons, id];
    setForm({ ...form, selectedAddons: next });
  };

  const formPayload = useMemo(
    () => ({
      ...form,
      // No enviar data URLs enormes a Stripe metadata
      logo: undefined,
      material: Array.isArray(form.material) ? form.material.join("|") : form.material,
      audience: plan?.audience,
      authUserId: authUserId || "",
      // Password elegido en StepCuenta (usuario aún no creado hasta complete-payment)
      password: form.password || form.pendingPassword || "",
      pendingPassword: form.pendingPassword || form.password || "",
      selectedAddons,
      primaryColor: form.primaryColor || "#0A36F7",
      secondaryColor: form.secondaryColor || "#ffffff",
    }),
    [form, plan?.audience, authUserId, selectedAddons],
  );

  if (!plan?.id) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        No se ha seleccionado un plan válido. Vuelve atrás y elige un plan.
        <button type="button" onClick={onBack} className="mt-4 btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    );
  }

  const hasDiscount = !!form.clubCode && plan.audience === "player";
  const discount    = hasDiscount ? Math.round((plan.price - applyClubDiscount(plan.price)) * 100) / 100 : 0;
  const total       = (hasDiscount ? applyClubDiscount(plan.price) : plan.price) + addonsTotal;

  const profileRows = [
    ["Nombre", form.nombre],
    ["Email", form.email],
    plan.audience === "player" ? ["Edad", form.edad] : null,
    plan.audience === "player" ? ["Teléfono", form.phone] : null,
    plan.audience === "player" ? ["Ubicación", form.club] : null,
    plan.audience === "player" ? ["Objetivos", (form.objetivos?.length ? form.objetivos : [form.objetivo, form.objetivoSecundario].filter(Boolean)).join(" + ")] : null,
    plan.audience === "player" ? ["Deporte", form.deporte] : null,
    plan.audience === "player" ? ["Frecuencia", form.frecuencia] : null,
    plan.audience === "player" ? ["Competición", form.diaCompeticion] : null,
    plan.audience === "player" ? ["Días", (form.disponibles || []).join(", ")] : null,
    plan.audience === "player" ? ["Material", Array.isArray(form.material) ? form.material.join(", ") : form.material] : null,
    plan.audience === "player" ? ["Experiencia", form.experiencia] : null,
    plan.audience === "player" ? ["Lesiones", (form.lesion?.length > 0 ? form.lesion.join(", ") : "Ninguna")] : null,
    plan.audience !== "player" ? ["Club", form.club] : null,
    plan.audience !== "player" ? ["Equipos", form.equipos] : null,
  ].filter(Boolean).filter(([, v]) => v);

  return (
    <div>
      <StripeTestBanner />

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Finaliza tu suscripción</h2>
        <p className="text-depro-gray text-sm">
          Introduce tu método de pago para activar <strong className="text-depro-dark">15 días de prueba gratis</strong>.
          Hoy se autoriza la tarjeta con <strong className="text-depro-dark">0 €</strong>; el primer cargo llega al terminar el trial.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
        {/* Resumen del carrito — sidebar (player y staff: plan, precio, trial) */}
        <aside className="lg:col-span-2 space-y-4 lg:sticky lg:top-4 order-1">
          <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-depro-border">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-depro-green/10 px-2.5 py-1 text-[11px] font-bold text-depro-green mb-3">
                <BadgeCheck size={12} /> 15 días gratis · 0 € hoy
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.bg }}>
                  {plan.highlight ? <Trophy size={18} style={{ color: plan.color }} /> : <Zap size={18} style={{ color: plan.color }} />}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-depro-dark truncate">{plan.name}</div>
                  <div className="text-xs text-depro-gray truncate">{plan.tagline}</div>
                </div>
              </div>
              {plan.audience !== "player" && (
                <p className="text-xs text-depro-gray mt-3 leading-relaxed">
                  Resumen de tu suscripción {plan.audience === "club" ? "de club" : "de entrenador"}:
                  {" "}{formatPrice(plan.price)}/mes tras {15} días de trial.
                </p>
              )}
            </div>

            <div className="p-5 space-y-2 text-sm">
              <div className="flex justify-between text-depro-gray">
                <span>Plan {plan.audience === "club" ? "club" : plan.audience === "coach" ? "entrenador" : ""}</span>
                <span className={hasDiscount ? "line-through text-depro-gray/70" : ""}>{formatPrice(plan.price)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-depro-green">
                  <span className="flex items-center gap-1"><BadgeCheck size={13} /> Código club (−10%)</span>
                  <span>– {formatPrice(discount)}</span>
                </div>
              )}
              {addonsTotal > 0 && (
                <div className="flex justify-between text-depro-gray">
                  <span>Extras</span><span>{formatPrice(addonsTotal)}</span>
                </div>
              )}
              <div className="border-t border-depro-border pt-3 flex justify-between items-baseline">
                <span className="font-bold text-depro-dark">Total / mes</span>
                <span className="text-2xl font-black text-depro-dark">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-depro-gray pt-1">
                Se pide tarjeta ahora (cargo 0 €). Primer cobro tras 15 días. Cancela cuando quieras.
              </p>
            </div>

            <div className="px-5 pb-5">
              <ul className="space-y-2 border-t border-depro-border pt-4">
                {(plan.features || []).slice(0, plan.audience === "player" ? 4 : 6).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-depro-dark">
                    <CheckCircle size={13} className="text-depro-green shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {plan.audience === "player" && (
            <div className="bg-white border border-depro-border rounded-2xl p-5 shadow-card space-y-3">
              <div className="font-bold text-depro-dark text-sm">Extras opcionales</div>
              <p className="text-xs text-depro-gray">Añade funcionalidades al carrito antes de pagar.</p>
              {PLAYER_ADDONS.map((addon) => {
                const sel = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      sel ? "border-depro-blue bg-depro-blue-light/40" : "border-depro-border hover:border-depro-blue/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-depro-dark">{addon.name}</span>
                      <span className="text-xs font-bold text-depro-blue">{formatPrice(addon.price)}{addon.period}</span>
                    </div>
                    <p className="text-xs text-depro-gray mt-1">{addon.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border border-depro-border bg-white px-4 py-3 text-sm font-semibold text-depro-dark shadow-card hover:bg-depro-bg/30 transition-colors"
          >
            <span>Tus datos ({form.nombre || form.email})</span>
            <ChevronDown size={16} className={`shrink-0 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>

          {showDetails && (
            <div className="bg-white border border-depro-border rounded-2xl p-4 shadow-card text-sm space-y-2">
              {profileRows.map(([label, val]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-depro-gray shrink-0">{label}</span>
                  <span className="font-semibold text-depro-dark text-right">{val}</span>
                </div>
              ))}
            </div>
          )}

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-depro-gray px-1">
            <Shield size={12} className="text-depro-blue shrink-0" />
            Pago seguro · No guardamos datos de tarjeta
          </div>
        </aside>

        {/* Checkout embebido Stripe — único camino (trial con tarjeta, 0 € hoy) */}
        <div className="lg:col-span-3 order-2 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="bg-white border border-depro-border rounded-2xl p-5 shadow-card space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-depro-blue/10 px-2.5 py-1 text-[11px] font-bold text-depro-blue">
              <Lock size={12} /> Pago seguro con Stripe
            </div>
            <h3 className="font-black text-depro-dark text-lg">Método de pago</h3>
            <p className="text-sm text-depro-gray">
              Añade tu tarjeta para empezar la prueba de <strong className="text-depro-dark">15 días</strong>.
              Hoy el cargo es <strong className="text-depro-dark">0 €</strong>; el cobro del plan comienza al terminar el trial.
            </p>
            <EmbeddedStripeCheckout
              planId={plan.id}
              formData={formPayload}
              onError={setError}
            />
          </div>

          <p className="lg:hidden flex items-center gap-2 text-[11px] text-depro-gray justify-center">
            <Lock size={12} className="text-depro-green" />
            Pago 100% seguro con Stripe
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 5 — Confirmación
───────────────────────────────────────────── */
function StepDone({ plan, form }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 rounded-3xl bg-depro-green/15 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={42} className="text-depro-green" />
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-depro-dark mb-3">¡Bienvenido a DEPRO, {form.nombre.split(" ")[0]}!</h2>
      <p className="text-depro-gray mb-8">
        Tu <strong className="text-depro-dark">{plan.name}</strong> está activo. Hemos generado tu plan mensual con todos los entrenamientos
        adaptados a tu perfil y objetivos.
      </p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card text-left mb-8">
        <div className="font-bold text-depro-dark mb-3 text-sm">Resumen de tu cuenta</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-depro-gray">
            <span>Email</span>
            <span className="text-depro-dark font-semibold">{form.email}</span>
          </div>
          <div className="flex items-center justify-between text-depro-gray">
            <span>Plan</span>
            <span className="text-depro-dark font-semibold">{plan.name}</span>
          </div>
          <div className="flex items-center justify-between text-depro-gray">
            <span>Objetivos</span>
            <span className="text-depro-dark font-semibold">
              {(form.objetivos?.length ? form.objetivos : [form.objetivo, form.objetivoSecundario].filter(Boolean)).join(" + ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-depro-gray">
            <span>Frecuencia</span>
            <span className="text-depro-dark font-semibold">{form.frecuencia}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/login")}
          className="btn-primary flex items-center justify-center gap-2"
        >
          Acceder al panel <ChevronRight size={16} />
        </button>
        <Link to="/" className="btn-ghost flex items-center justify-center gap-2">
          Volver al inicio
        </Link>
      </div>

      <p className="text-xs text-depro-gray mt-6">
        Hemos enviado tus credenciales de acceso a <strong>{form.email}</strong>.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function OnboardingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const audienceParam = params.get("audience") || "player";
  const initialPlanId = resolvePlanId(audienceParam, params.get("plan"));
  const initialAudience = initialPlanId
    ? (PLANS[initialPlanId]?.audience || audienceParam)
    : (AUDIENCES[audienceParam] ? audienceParam : "player");

  const [audience, setAudience] = useState(initialAudience);
  const [step, setStep] = useState(initialPlanId ? 2 : 1);
  // Si llega ?audience=coach sin plan, preseleccionar el primero para no bloquear el avance
  const [planId, setPlanId] = useState(
    initialPlanId || plansForAudience(initialAudience)[0]?.id || "",
  );
  const [draftReady, setDraftReady] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    edad: "",
    club: "",
    equipos: "",
    clubCode: "",
    clubId: "",
    clubTeamId: "",
    logo: "",
    primaryColor: "#0A36F7",
    secondaryColor: "#ffffff",
    objetivos: [],
    objetivo:  "",
    objetivoSecundario: "",
    deporte:   "",
    frecuencia: "",
    material:  [],
    experiencia: "",
    lesion:    [],
    lesionSubtipo: [],
    diaCompeticion: "Fin de semana",
    disponibles: ["Lunes", "Miércoles", "Viernes"],
    selectedAddons: [],
    phone: "",
  });

  const plan = PLANS[planId] || plansForAudience(audience)[0];
  const isPlayerFlow = plan?.audience === "player";
  const stepLabels = isPlayerFlow ? STEPS_PLAYER : STEPS_STAFF;

  const datosStep = 3;
  const futbolStep = 4;
  const paymentStep = isPlayerFlow ? 5 : 4;

  const handleAudienceChange = (nextAudience) => {
    setAudience(nextAudience);
    const first = plansForAudience(nextAudience)[0];
    setPlanId(first?.id || "");
  };

  const saveOnboardingForOAuth = () => {
    sessionStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ audience, planId, form, step: datosStep }),
    );
  };

  const clearOnboardingDraft = () => {
    try { localStorage.removeItem(ONBOARDING_DRAFT_KEY); } catch { /* ignore */ }
    try { sessionStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch { /* ignore */ }
  };

  const handleCancelQuestionnaire = () => {
    clearOnboardingDraft();
    navigate("/");
  };

  const handleRestartQuestionnaire = () => {
    clearOnboardingDraft();
    setAudience(initialAudience);
    setPlanId(initialPlanId || plansForAudience(initialAudience)[0]?.id || "");
    setStep(initialPlanId ? 2 : 1);
    setForm({
      nombre: "",
      email: "",
      password: "",
      pendingPassword: "",
      edad: "",
      club: "",
      equipos: "",
      clubCode: "",
      clubId: "",
      clubTeamId: "",
      logo: "",
      primaryColor: "#0A36F7",
      secondaryColor: "#ffffff",
      objetivos: [],
      objetivo: "",
      objetivoSecundario: "",
      deporte: "",
      frecuencia: "",
      material: [],
      experiencia: "",
      lesion: [],
      lesionSubtipo: [],
      diaCompeticion: "Fin de semana",
      disponibles: ["Lunes", "Miércoles", "Viernes"],
      selectedAddons: [],
      phone: "",
    });
  };

  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Restaurar borrador completo (form + step) al montar — no solo OAuth
  useEffect(() => {
    if (draftReady) return;
    if (params.get("oauth") === "1") {
      setDraftReady(true);
      return;
    }
    try {
      const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (state.audience) setAudience(state.audience);
        if (state.planId) setPlanId(state.planId);
        if (state.form && typeof state.form === "object") {
          setForm((f) => ({ ...f, ...state.form }));
        }
        if (state.step) setStep(state.step);
      }
    } catch { /* ignore */ }
    setDraftReady(true);
  }, [params, draftReady]);

  // Persistir borrador en cada cambio (tras hidratar)
  useEffect(() => {
    if (!draftReady) return;
    try {
      localStorage.setItem(
        ONBOARDING_DRAFT_KEY,
        JSON.stringify({ audience, planId, form, step }),
      );
    } catch { /* ignore */ }
  }, [draftReady, audience, planId, form, step]);

  useEffect(() => {
    if (params.get("oauth") !== "1" || authLoading || !user) return;
    const saved = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (state.audience) setAudience(state.audience);
      if (state.planId) setPlanId(state.planId);
      setForm((f) => ({
        ...f,
        ...(state.form || {}),
        email: user.email || state.form?.email || f.email,
        nombre: user.name || user.user_metadata?.name || state.form?.nombre || f.nombre,
      }));
      setStep(state.step || datosStep);
    } catch { /* ignore */ }
    sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.history.replaceState(null, "", window.location.pathname);
  }, [params, user, authLoading, datosStep]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email || "",
      nombre: f.nombre || user.name || user.user_metadata?.name || "",
    }));
  }, [user]);

  const backFromPayment = () => setStep(isPlayerFlow ? futbolStep : datosStep);

  return (
    <div className="min-h-screen bg-depro-gray-light pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 gap-3 flex-wrap">
          <Link to="/" className="flex items-center gap-2 text-depro-gray hover:text-depro-dark transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-bold">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestartQuestionnaire}
              className="text-xs font-bold text-depro-gray hover:text-depro-blue transition-colors"
            >
              Reiniciar cuestionario
            </button>
            <button
              type="button"
              onClick={handleCancelQuestionnaire}
              className="text-xs font-bold text-depro-gray hover:text-red-600 transition-colors"
            >
              Cancelar cuestionario
            </button>
            <Link to="/">
              <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            </Link>
          </div>
        </div>

        {/* Wizard */}
        <StepHeader steps={stepLabels} current={step} />

        {step === 1 && (
          <StepPlan
            audience={audience}
            onAudienceChange={handleAudienceChange}
            selected={planId}
            onSelect={setPlanId}
            onNext={() => planId && setStep(2)}
          />
        )}

        {step === 2 && (
          <StepCuenta
            form={form}
            setForm={setForm}
            onNext={() => setStep(datosStep)}
            onBack={() => setStep(1)}
          />
        )}

        {step === datosStep && (
          <StepDatos
            audience={plan?.audience || audience}
            form={form}
            setForm={setForm}
            planId={plan?.id || planId}
            loggedInEmail={user?.email}
            onNext={() => {
              setForm((f) => ({
                ...f,
                email: (user?.email || f.email || "").trim(),
                nombre: (f.nombre || user?.name || "").trim(),
              }));
              if (isPlayerFlow) setStep(futbolStep);
              else setStep(paymentStep);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {step === futbolStep && isPlayerFlow && (
          <StepFutbol
            form={form}
            setForm={setForm}
            planId={plan?.id || planId}
            onNext={() => {
              setForm((f) => ({
                ...f,
                email: (user?.email || f.email || "").trim(),
              }));
              setStep(paymentStep);
            }}
            onBack={() => setStep(datosStep)}
          />
        )}

        {step === paymentStep && plan?.id && (
          <StepPago
            form={form}
            setForm={setForm}
            plan={plan}
            authUserId={user?.id}
            onBack={backFromPayment}
          />
        )}
        {step === paymentStep && !plan?.id && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            No hay un plan seleccionado. Vuelve al primer paso y elige un plan.
            <button type="button" onClick={() => setStep(1)} className="mt-4 btn-primary flex items-center gap-2">
              Elegir plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
