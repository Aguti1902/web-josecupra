import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Zap, Trophy, User, Mail, Calendar,
  Target, AlertCircle, Shield, Lock,
  ChevronRight, BadgeCheck, MapPin, Building2, Users,
} from "lucide-react";
import {
  AUDIENCES, PLANS, resolvePlanId, plansForAudience, formatPrice, applyClubDiscount,
} from "../../lib/checkoutPlans";
import EmbeddedStripeCheckout from "../../components/public/EmbeddedStripeCheckout";

const POSITIONS  = ["Portero", "Defensa", "Lateral", "Pivote", "Centro", "Mediapunta", "Extremo", "Delantero"];
const OBJECTIVES = ["Fuerza", "Velocidad", "Resistencia", "Hipertrofia", "Prevención", "Movilidad"];
const SPORTS     = ["Fútbol", "Baloncesto", "Balonmano", "Atletismo", "Natación", "Otro"];
const FREQUENCY  = ["1 día / sem", "2 días / sem", "3 días / sem", "4 días / sem"];
const MATERIALS  = ["Sin material", "Gomas", "Mancuernas", "Barra / Gimnasio", "Campo"];
const INJURIES   = ["Ninguna", "Rodilla", "Tobillo", "Hombro", "Espalda", "Pubalgia"];
const INJURY_SUBTYPES = {
  Rodilla: ["ACL", "Menisco", "Rotuliana", "Otra"],
  Tobillo: ["Esguince", "Inestabilidad", "Otra"],
  Hombro: ["Manguito rotador", "Inestabilidad", "Otra"],
  Espalda: ["Lumbar", "Dorsal", "Cervical", "Otra"],
  Pubalgia: ["Aductores", "Recto abdominal", "Mixta"],
};
const COMPETITION_DAYS = ["Sábado", "Domingo", "Entre semana", "No compito regularmente"];
const WEEK_DAYS  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const EXPERIENCE = ["Nunca he entrenado", "Menos de 6 meses", "6–12 meses", "1–3 años", "Más de 3 años"];
const STEPS_PLAYER = ["Plan", "Tus datos", "Tu entrenamiento", "Pago"];
const STEPS_STAFF  = ["Plan", "Tus datos", "Pago"];

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
   STEP 2 — Datos personales
───────────────────────────────────────────── */
function StepDatos({ audience, form, setForm, onNext, onBack }) {
  const isPlayer = audience === "player";
  const valid = form.nombre && form.email && (isPlayer ? form.edad : form.club);

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
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="admin-input w-full pl-10"
                placeholder={audience === "club" ? "Nombre del responsable" : "Tu nombre y apellidos"}
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

        {isPlayer ? (
          <>
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
              label="Posición principal (opcional)"
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
                placeholder="EJ. DEPRO-CLUB-2025"
                maxLength={32}
              />
            </div>
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
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, equipos: e.target.value })}
                  className="admin-input w-full pl-10"
                  placeholder={audience === "club" ? "Ej. 5 categorías" : "Ej. Juvenil A, Cadete B"}
                />
              </div>
            </div>
          </>
        )}
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
  const freqN = parseInt(String(form.frecuencia).replace(/\D/g, "")) || 3;
  const valid = form.objetivo && form.deporte && form.frecuencia && form.material && form.experiencia
    && form.diaCompeticion
    && (form.disponibles?.length || 0) >= freqN;

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
                  {obj === "Fuerza" ? "💪" : obj === "Velocidad" ? "⚡" : obj === "Resistencia" ? "🫀" : obj === "Hipertrofia" ? "🏋️" : obj === "Prevención" ? "🛡️" : "🧘"}
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

        {/* Día de competición */}
        <Toggle
          label="Día habitual de competición *"
          value={form.diaCompeticion}
          options={COMPETITION_DAYS}
          onChange={(v) => setForm({ ...form, diaCompeticion: v })}
        />

        {/* Días disponibles */}
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-3 block">
            Días en los que puedes entrenar *
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const sel = (form.disponibles || []).includes(day);
              const freqN = parseInt(String(form.frecuencia).replace(/\D/g, "")) || 3;
              return (
                <button key={day} type="button"
                  onClick={() => {
                    const cur = form.disponibles || [];
                    const next = sel ? cur.filter((d) => d !== day) : [...cur, day];
                    setForm({ ...form, disponibles: next });
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border ${sel ? "bg-depro-blue border-depro-blue text-white" : "bg-white border-depro-border text-depro-gray"}`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-depro-gray mt-2">Selecciona al menos tantos días como tu frecuencia ({parseInt(String(form.frecuencia).replace(/\D/g, "")) || 3}).</p>
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
  const [error, setError] = useState("");
  const formPayload = useMemo(() => ({ ...form, audience: plan.audience }), [form, plan.audience]);

  const hasDiscount = !!form.clubCode && plan.audience === "player";
  const discount    = hasDiscount ? Math.round(plan.price * 0.15 * 100) / 100 : 0;
  const total       = hasDiscount ? applyClubDiscount(plan.price) : plan.price;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-depro-dark mb-2">Finaliza tu suscripción</h2>
      <p className="text-depro-gray text-sm mb-8">Completa el pago de forma segura sin salir de DEPRO. 15 días de prueba incluidos.</p>

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
                plan.audience === "player" ? ["Objetivo",  form.objetivo] : null,
                plan.audience === "player" ? ["Deporte",   form.deporte] : null,
                plan.audience === "player" ? ["Frecuencia",form.frecuencia] : null,
                plan.audience === "player" ? ["Experiencia", form.experiencia] : null,
                plan.audience === "player" ? ["Material",  form.material] : null,
                plan.audience === "player" ? ["Días",      (form.disponibles || []).join(", ")] : null,
                plan.audience === "player" ? ["Competición", form.diaCompeticion] : null,
                plan.audience === "player" ? ["Lesiones",  (form.lesion?.length > 0 ? form.lesion.join(", ") : "Ninguna")] : null,
                plan.audience !== "player" ? ["Club", form.club] : null,
                plan.audience !== "player" ? ["Equipos", form.equipos] : null,
              ].filter(Boolean).filter(([, v]) => v).map(([label, val]) => (
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
                  {plan.highlight ? <Trophy size={18} style={{ color: plan.color }} /> : <Zap size={18} style={{ color: plan.color }} />}
                </div>
                <div>
                  <div className="font-black text-depro-dark">{plan.name}</div>
                  <div className="text-xs text-depro-gray">{plan.tagline}</div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-2 text-sm">
              <div className="flex justify-between text-depro-gray">
                <span>Subtotal</span><span>{formatPrice(plan.price)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-depro-green">
                  <span className="flex items-center gap-1"><BadgeCheck size={13} /> Código club</span>
                  <span>– {formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-depro-border pt-3 flex justify-between">
                <span className="font-bold text-depro-dark">Total / mes</span>
                <span className="text-xl font-black text-depro-dark">{formatPrice(total)}</span>
              </div>
              <div className="text-[11px] text-depro-gray">Suscripción mensual. Cancela cuando quieras.</div>
            </div>

            <div className="p-5 border-t border-depro-border space-y-3">
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-depro-gray">
                <Shield size={11} className="text-depro-blue" /> Pago seguro · Cancela cuando quieras
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <EmbeddedStripeCheckout
          planId={plan.id}
          formData={formPayload}
          onError={setError}
        />
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
  const audienceParam = params.get("audience") || "player";
  const initialPlanId = resolvePlanId(audienceParam, params.get("plan"));
  const initialAudience = initialPlanId
    ? (PLANS[initialPlanId]?.audience || audienceParam)
    : (AUDIENCES[audienceParam] ? audienceParam : "player");

  const [audience, setAudience] = useState(initialAudience);
  const [step, setStep] = useState(initialPlanId ? 2 : 1);
  const [planId, setPlanId] = useState(initialPlanId);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    edad: "",
    club: "",
    equipos: "",
    posicion: "",
    clubCode: "",
    objetivo:  "",
    deporte:   "",
    frecuencia: "",
    material:  "",
    experiencia: "",
    lesion:    [],
    lesionSubtipo: [],
    diaCompeticion: "Sábado",
    disponibles: ["Lunes", "Miércoles", "Viernes"],
  });

  const plan = PLANS[planId] || plansForAudience(audience)[0];
  const isPlayerFlow = plan?.audience === "player";
  const stepLabels = isPlayerFlow ? STEPS_PLAYER : STEPS_STAFF;
  const headerStep = !isPlayerFlow && step === 4 ? 3 : step;

  const handleAudienceChange = (nextAudience) => {
    setAudience(nextAudience);
    const first = plansForAudience(nextAudience)[0];
    setPlanId(first?.id || "");
  };

  const goToPayment = () => setStep(isPlayerFlow ? 4 : 3);
  const paymentStep = isPlayerFlow ? 4 : 3;
  const backFromPayment = () => setStep(isPlayerFlow ? 3 : 2);


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
        <StepHeader steps={stepLabels} current={headerStep} />

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
          <StepDatos
            audience={plan?.audience || audience}
            form={form}
            setForm={setForm}
            onNext={() => (isPlayerFlow ? setStep(3) : goToPayment())}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && isPlayerFlow && (
          <StepFutbol
            form={form}
            setForm={setForm}
            onNext={goToPayment}
            onBack={() => setStep(2)}
          />
        )}

        {step === paymentStep && (
          <StepPago
            form={form}
            plan={plan}
            onBack={backFromPayment}
          />
        )}
      </div>
    </div>
  );
}
