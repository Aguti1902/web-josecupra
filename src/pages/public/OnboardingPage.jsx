import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Zap, Trophy, User, Mail, Calendar,
  Target, Activity, Heart, Dumbbell, AlertCircle, CreditCard, Shield, Lock,
  ChevronRight, BadgeCheck, MapPin, Clock,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIG DE PLANES
───────────────────────────────────────────── */
const PLANS = {
  basic: {
    id: "basic",
    name: "Plan Básico",
    tagline: "Tu plan mensual al instante",
    price: 49,
    period: "/ mes",
    description: "Plan mensual automatizado generado tras tu formulario.",
    features: [
      "Plan mensual completo al instante",
      "Todos los entrenamientos del mes",
      "Acceso al panel privado",
      "Descarga en PDF",
      "Iconografía condicional",
    ],
    color: "#0A36F7",
    bg: "#EEF1FF",
  },
  premium: {
    id: "premium",
    name: "Plan Premium",
    tagline: "Plan + seguimiento del preparador",
    price: 119,
    period: "/ mes",
    description: "Plan personalizado revisado por el preparador con feedback continuo.",
    features: [
      "Todo el Plan Básico incluido",
      "Plan revisado y ajustado por el preparador",
      "Seguimiento continuo en el panel",
      "Feedback mensual personalizado",
      "Contacto directo por el panel",
      "Renovación con progresión adaptada",
    ],
    color: "#F6CC12",
    bg: "#FEFAE7",
    highlight: true,
  },
};

const POSITIONS  = ["Portero", "Defensa", "Lateral", "Pivote", "Centro", "Mediapunta", "Extremo", "Delantero"];
// Preguntas del motor de planes (doc técnico)
const OBJECTIVES = ["Fuerza", "Velocidad", "Resistencia", "Estética", "Prevención", "Movilidad"];
const SPORTS     = ["Fútbol", "Basket", "Natación", "Tenis", "Fitness", "Otro"];
const FREQUENCY  = ["1 día / sem", "2 días / sem", "3 días / sem", "4 días / sem"];
const MATERIALS  = ["Sin material", "Gomas", "Mancuernas", "Barra / Gimnasio"];
const INJURIES   = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda"];
const EXPERIENCE = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
const STEPS      = ["Plan", "Tus datos", "Tu entrenamiento", "Pago"];

/* ─────────────────────────────────────────────
   COMPONENTES AUX
───────────────────────────────────────────── */
function StepHeader({ current }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((label, i) => {
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
              {stepNumber !== STEPS.length && (
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
function StepPlan({ selected, onSelect, onNext }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Elige tu plan</h2>
      <p className="text-depro-gray text-sm mb-8">Puedes cambiar de plan en cualquier momento desde tu panel.</p>

      <div className="grid md:grid-cols-2 gap-5">
        {Object.values(PLANS).map((plan) => {
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
                  {plan.id === "basic" ? <Zap size={20} style={{ color: plan.color }} /> : <Trophy size={20} style={{ color: plan.color }} />}
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
                <span className="text-3xl font-black text-depro-dark">{plan.price}€</span>
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
   STEP 2 — Datos personales
───────────────────────────────────────────── */
function StepDatos({ form, setForm, onNext, onBack }) {
  const valid = form.nombre && form.email && form.edad && form.posicion;
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Cuéntanos sobre ti</h2>
      <p className="text-depro-gray text-sm mb-8">Necesitamos tus datos para crear tu cuenta y personalizar el plan.</p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Nombre completo *</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
                type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input w-full pl-10"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Edad *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" min="10" max="60" value={form.edad}
                onChange={(e) => setForm({ ...form, edad: e.target.value })}
                className="admin-input w-full pl-10"
                placeholder="18"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Club / equipo actual</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={form.club}
                onChange={(e) => setForm({ ...form, club: e.target.value })}
                className="admin-input w-full pl-10"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <Toggle
          label="Posición principal *"
          value={form.posicion}
          options={POSITIONS}
          onChange={(v) => setForm({ ...form, posicion: v })}
        />

        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
            Código de club <span className="text-depro-gray font-normal normal-case">(opcional, para descuento)</span>
          </label>
          <input
            type="text" value={form.clubCode}
            onChange={(e) => setForm({ ...form, clubCode: e.target.value.toUpperCase() })}
            className="admin-input w-full uppercase tracking-wider"
            placeholder="EJ. DEPRO-FCB-2025"
            maxLength={32}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button onClick={onNext} disabled={!valid} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          Continuar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 3 — Datos de fútbol
───────────────────────────────────────────── */
function StepFutbol({ form, setForm, onNext, onBack }) {
  const valid = form.objetivo && form.deporte && form.frecuencia && form.material && form.experiencia;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Tu entrenamiento</h2>
      <p className="text-depro-gray text-sm mb-8">Con estos datos el sistema genera automáticamente tu plan personalizado.</p>

      <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card space-y-6">

        {/* Objetivo principal */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Target size={12} className="text-depro-blue" /> Objetivo principal *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OBJECTIVES.map((obj) => (
              <button
                key={obj} type="button"
                onClick={() => setForm({ ...form, objetivo: obj })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
                  form.objetivo === obj
                    ? "bg-depro-blue border-depro-blue text-white"
                    : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
                }`}
              >
                <span className="text-lg">
                  {obj === "Fuerza" ? "💪" : obj === "Velocidad" ? "⚡" : obj === "Resistencia" ? "🫀" : obj === "Estética" ? "✨" : obj === "Prevención" ? "🛡️" : "🧘"}
                </span>
                {obj}
              </button>
            ))}
          </div>
        </div>

        {/* Deporte principal */}
        <Toggle
          label="Deporte principal *"
          value={form.deporte}
          options={SPORTS}
          onChange={(v) => setForm({ ...form, deporte: v })}
        />

        {/* Frecuencia semanal */}
        <Toggle
          label="Días de entrenamiento disponibles por semana *"
          value={form.frecuencia}
          options={FREQUENCY}
          onChange={(v) => setForm({ ...form, frecuencia: v })}
        />

        {/* Experiencia entrenando */}
        <Toggle
          label="Experiencia entrenando *"
          value={form.experiencia}
          options={EXPERIENCE}
          onChange={(v) => setForm({ ...form, experiencia: v })}
        />

        {/* Material */}
        <Toggle
          label="Material disponible *"
          value={form.material}
          options={MATERIALS}
          onChange={(v) => setForm({ ...form, material: v })}
        />

        {/* Lesiones */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-amber-500" /> Lesiones o molestias
          </label>
          <div className="flex flex-wrap gap-2">
            {INJURIES.map((inj) => {
              const sel = (form.lesion || []).includes(inj) || (inj === "Ninguna" && (!form.lesion || form.lesion.length === 0));
              return (
                <button
                  key={inj} type="button"
                  onClick={() => {
                    if (inj === "Ninguna") { setForm({ ...form, lesion: [] }); return; }
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
        </div>
      </div>

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
function StepPago({ form, plan, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const hasDiscount = !!form.clubCode;
  const discount    = hasDiscount ? Math.round(plan.price * 0.15) : 0;
  const total       = plan.price - discount;

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId:   plan.id,
          formData: form,
          origin:   window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear sesión de pago");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Finaliza tu pago</h2>
      <p className="text-depro-gray text-sm mb-8">Serás redirigido a Stripe para completar el pago de forma segura.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info izquierda */}
        <div className="lg:col-span-2 space-y-5">
          {/* Qué incluye */}
          <div className="bg-white border border-depro-border rounded-2xl p-5 shadow-card">
            <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-4">Tu plan incluye</div>
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-depro-dark">
                  <CheckCircle size={15} className="text-depro-green shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Resumen del perfil */}
          <div className="bg-white border border-depro-border rounded-2xl p-5 shadow-card">
            <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-4">Tus datos</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                ["Nombre",    form.nombre],
                ["Email",     form.email],
                ["Objetivo",  form.objetivo],
                ["Deporte",   form.deporte],
                ["Frecuencia",form.frecuencia],
                ["Material",  form.material],
                ["Lesiones",  (form.lesion?.length > 0 ? form.lesion.join(", ") : "Ninguna")],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label}>
                  <span className="text-depro-gray">{label}: </span>
                  <span className="font-semibold text-depro-dark">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-depro-gray">
            <Lock size={12} className="text-depro-green" />
            Pago 100% seguro con Stripe · No guardamos datos de tarjeta
          </div>
        </div>

        {/* Resumen precio */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden sticky top-4">
            <div className="p-5 border-b border-depro-border">
              <div className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2">Resumen</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.bg }}>
                  {plan.id === "basic" ? <Zap size={18} style={{ color: plan.color }} /> : <Trophy size={18} style={{ color: plan.color }} />}
                </div>
                <div>
                  <div className="font-black text-depro-dark">{plan.name}</div>
                  <div className="text-xs text-depro-gray">{plan.tagline}</div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-2 text-sm">
              <div className="flex justify-between text-depro-gray">
                <span>Subtotal</span><span>{plan.price}€</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-depro-green">
                  <span className="flex items-center gap-1"><BadgeCheck size={13} /> Código club</span>
                  <span>– {discount}€</span>
                </div>
              )}
              <div className="border-t border-depro-border pt-3 flex justify-between">
                <span className="font-bold text-depro-dark">Total / mes</span>
                <span className="text-xl font-black text-depro-dark">{total}€</span>
              </div>
              <div className="text-[11px] text-depro-gray">Suscripción mensual. Cancela cuando quieras.</div>
            </div>

            <div className="p-5 border-t border-depro-border space-y-3">
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="w-full bg-depro-blue hover:bg-depro-blue-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><div className="spinner border-white/20 border-t-white" /> Redirigiendo a Stripe...</>
                ) : (
                  <><Lock size={14} /> Pagar {total}€ con Stripe</>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-depro-gray">
                <Shield size={11} className="text-depro-blue" /> Pago seguro · Cancela cuando quieras
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={onBack} disabled={loading} className="btn-ghost flex items-center gap-2 disabled:opacity-50">
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
            <span>Posición</span>
            <span className="text-depro-dark font-semibold">{form.posicion}</span>
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
  const initial = params.get("plan") === "premium" ? "premium" : params.get("plan") === "basic" ? "basic" : "";

  const [step, setStep] = useState(initial ? 2 : 1);
  const [planId, setPlanId] = useState(initial);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    edad: "",
    club: "",
    posicion: "",
    clubCode: "",
    // Campos del motor de planes (doc técnico)
    objetivo:  "",   // fuerza | velocidad | resistencia | estética | prevención | movilidad
    deporte:   "",   // fútbol | basket | natación | tenis | fitness | otro
    frecuencia: "",  // 1 | 2 | 3 | 4 días/sem
    material:  "",   // sin material | gomas | mancuernas | barra/gimnasio
    lesion:    [],   // ninguna | rodilla | tobillo | hombro | espalda
  });

  const plan = PLANS[planId] || PLANS.basic;


  return (
    <div className="min-h-screen bg-depro-gray-light pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2 text-depro-gray hover:text-depro-dark transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-bold">Volver al inicio</span>
          </Link>
          <Link to="/">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
          </Link>
        </div>

        {/* Wizard */}
        <StepHeader current={step} />

        {step === 1 && (
          <StepPlan
            selected={planId}
            onSelect={setPlanId}
            onNext={() => planId && setStep(2)}
          />
        )}

        {step === 2 && (
          <StepDatos
            form={form}
            setForm={setForm}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepFutbol
            form={form}
            setForm={setForm}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepPago
            form={form}
            plan={plan}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}
