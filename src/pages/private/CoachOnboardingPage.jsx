import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Dumbbell, Calendar, Clock,
  Target, Trophy, Users, Package, Building2, Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { saveClub } from "../../lib/adminStorage";
import { MATERIALES } from "../../data/coachExerciseLibrary";
import { WEEK_TEMPLATES } from "../../lib/coachEngine";

const CATEGORIES = ["Sub-9", "Sub-10", "Sub-11", "Sub-12", "Sub-13", "Sub-14", "Sub-15", "Sub-16", "Juvenil", "Amateur"];
const PHASE_OBJECTIVES = [
  { id: "pretemporada", label: "Pretemporada", desc: "Base física general" },
  { id: "fuerza", label: "Fuerza", desc: "Desarrollo de fuerza" },
  { id: "velocidad", label: "Velocidad", desc: "Velocidad y potencia" },
  { id: "mantenimiento", label: "Mantenimiento", desc: "Reparto equilibrado" },
  { id: "recuperacion", label: "Recuperación", desc: "Prevención de lesiones" },
];
const COMPETITIVE_LEVELS = [
  { id: "iniciacion", label: "Iniciación" },
  { id: "amateur", label: "Amateur" },
  { id: "alto_rendimiento", label: "Alto rendimiento" },
];
const MATERIAL_LABELS = {
  sin_material: "Sin material", conos: "Conos", picas: "Picas", aros: "Aros",
  vallas: "Vallas", gomas: "Gomas", mancuernas: "Mancuernas", balon_medicinal: "Balón medicinal",
  cajon: "Cajón pliométrico", escalera_coordinacion: "Escalera de coordinación",
  banda_resistencia: "Banda de resistencia / arnés", gimnasio: "Acceso a gimnasio",
};
const PLAYER_COUNTS = ["< 15", "15–20", "20–25", "> 25"];
const STEPS = ["Tu equipo", "Entrenamientos", "Contexto", "Confirmar"];

function TagGroup({ options, value, onChange, multi = false, renderLabel = (o) => o.label ?? o }) {
  const getId = (o) => (typeof o === "string" ? o : o.id);
  const isSelected = (o) => (multi ? (value || []).includes(getId(o)) : value === getId(o));
  const handle = (o) => {
    const id = getId(o);
    if (multi) {
      const next = (value || []).includes(id) ? value.filter((v) => v !== id) : [...(value || []), id];
      onChange(next);
    } else {
      onChange(id);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const id = getId(o);
        const sel = isSelected(o);
        return (
          <button
            key={id}
            type="button"
            onClick={() => handle(o)}
            className={`text-sm font-bold px-3.5 py-2 rounded-xl border transition-all ${
              sel
                ? "bg-depro-blue border-depro-blue text-white"
                : "bg-white border-depro-border text-depro-gray hover:text-depro-dark hover:border-depro-blue/40"
            }`}
          >
            {renderLabel(o)}
          </button>
        );
      })}
    </div>
  );
}

function StepHeader({ current }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                done ? "bg-depro-green text-white" : active ? "bg-depro-blue text-white shadow-depro" : "bg-depro-gray-light text-depro-gray"
              }`}>
                {done ? <CheckCircle size={15} /> : n}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${active ? "text-depro-dark" : "text-depro-gray"}`}>{label}</span>
            </div>
            {n !== STEPS.length && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${done ? "bg-depro-green" : "bg-depro-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function CoachOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    teamName: "", category: "Sub-14", season: "2025/2026",
    trainingsPerWeek: 3, sessionDuration: "75",
    phaseObjective: "mantenimiento", competitiveLevel: "amateur",
    numPlayers: "15–20", gymAccess: false, material: ["sin_material", "conos"],
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const step1Valid = form.teamName.trim().length > 0 && !!form.category;
  const step2Valid = !!form.trainingsPerWeek && !!form.sessionDuration;
  const step3Valid = !!form.phaseObjective && !!form.competitiveLevel && !!form.numPlayers;

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      const clubId = genId("coach_club");
      const teamId = genId("coach_team");
      const trainingDays = (WEEK_TEMPLATES[form.trainingsPerWeek] || WEEK_TEMPLATES[3]).map((t) => t.day);

      const club = {
        id: clubId,
        name: `${user?.name || "Entrenador"} · DEPRO Coach`,
        abbreviation: (user?.name || "EC").trim().slice(0, 2).toUpperCase(),
        city: "", country: "",
        status: "activo",
        plan: user?.plan || "coach-starter",
        isSoloCoach: true,
        coachConfig: {
          ageBlock: form.category.startsWith("Sub-1") && ["Sub-9","Sub-10","Sub-11","Sub-12"].includes(form.category)
            ? "Bloque 1"
            : ["Sub-13","Sub-14","Sub-15"].includes(form.category) ? "Bloque 2" : "Bloque 3",
          trainingsPerWeek: Number(form.trainingsPerWeek),
          sessionDuration: Number(form.sessionDuration),
          phaseObjective: form.phaseObjective,
          competitiveLevel: form.competitiveLevel,
          numPlayers: form.numPlayers,
          gymAccess: form.gymAccess,
          material: form.material,
          mode: "depro",
        },
        primaryColor: "#0A36F7",
        secondaryColor: "#ffffff",
        coordinator: null,
        teams: [
          {
            id: teamId,
            name: form.teamName.trim(),
            category: form.category,
            season: form.season,
            trainingDays,
            coach: { name: user?.name || "", email: user?.email || "" },
            squad: [],
          },
        ],
        plans: [],
        created_at: new Date().toISOString(),
      };

      await saveClub(club);

      const { error: updErr } = await supabase.auth.updateUser({
        data: {
          role: "club",
          clubId,
          teamId,
          teamRole: "entrenador",
        },
      });
      if (updErr) throw updErr;

      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "No se pudo completar el alta. Inténtalo de nuevo.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-depro-gray-light py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-depro-blue text-white">COACH</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-depro-border shadow-card p-6 md:p-8">
          <StepHeader current={step} />

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Configura tu equipo</h2>
              <p className="text-depro-gray text-sm mb-6">
                DEPRO Coach genera tus sesiones automáticamente a partir de estos datos. Podrás cambiarlos más adelante.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Nombre de tu equipo *
                  </label>
                  <input
                    type="text" value={form.teamName}
                    onChange={(e) => set("teamName", e.target.value)}
                    className="admin-input w-full"
                    placeholder="Ej. CD Preparación Individual"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Users size={12} /> Categoría *
                  </label>
                  <TagGroup options={CATEGORIES} value={form.category} onChange={(v) => set("category", v)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Temporada</label>
                  <input
                    type="text" value={form.season}
                    onChange={(e) => set("season", e.target.value)}
                    className="admin-input w-full sm:w-48"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setStep(2)} disabled={!step1Valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Frecuencia de entrenamiento</h2>
              <p className="text-depro-gray text-sm mb-6">Con esto generamos tu microciclo semanal (protocolos A/B/C).</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Calendar size={12} /> Entrenamientos por semana *
                  </label>
                  <TagGroup
                    options={[1, 2, 3, 4, 5].map((n) => ({ id: n, label: `${n} día${n > 1 ? "s" : ""}` }))}
                    value={form.trainingsPerWeek}
                    onChange={(v) => set("trainingsPerWeek", v)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock size={12} /> Duración de sesión *
                  </label>
                  <TagGroup
                    options={["45", "60", "75", "90"].map((n) => ({ id: n, label: `${n} min` }))}
                    value={form.sessionDuration}
                    onChange={(v) => set("sessionDuration", v)}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={() => setStep(3)} disabled={!step2Valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Contexto de trabajo</h2>
              <p className="text-depro-gray text-sm mb-6">El motor de reglas usará esto para filtrar la biblioteca de ejercicios.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Target size={12} /> Objetivo de la fase actual *
                  </label>
                  <TagGroup
                    options={PHASE_OBJECTIVES}
                    value={form.phaseObjective}
                    onChange={(v) => set("phaseObjective", v)}
                    renderLabel={(o) => o.label}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Trophy size={12} /> Nivel competitivo *
                  </label>
                  <TagGroup options={COMPETITIVE_LEVELS} value={form.competitiveLevel} onChange={(v) => set("competitiveLevel", v)} renderLabel={(o) => o.label} />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Users size={12} /> Número de jugadores *
                  </label>
                  <TagGroup options={PLAYER_COUNTS} value={form.numPlayers} onChange={(v) => set("numPlayers", v)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Dumbbell size={12} /> ¿Tienes acceso a gimnasio?
                  </label>
                  <TagGroup
                    options={[{ id: true, label: "Sí" }, { id: false, label: "No" }]}
                    value={form.gymAccess}
                    onChange={(v) => set("gymAccess", v)}
                    renderLabel={(o) => o.label}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Package size={12} /> Material disponible
                  </label>
                  <TagGroup
                    options={Object.keys(MATERIAL_LABELS).filter((m) => m !== "gimnasio").map((id) => ({ id, label: MATERIAL_LABELS[id] }))}
                    value={form.material}
                    onChange={(v) => set("material", v)}
                    multi
                    renderLabel={(o) => o.label}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost flex items-center gap-2"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={() => setStep(4)} disabled={!step3Valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Confirma tu configuración</h2>
              <p className="text-depro-gray text-sm mb-6">Crearemos tu panel de DEPRO Coach con estos datos.</p>
              <div className="bg-depro-gray-light rounded-2xl p-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-depro-gray">Equipo</span><span className="font-bold text-depro-dark">{form.teamName}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Categoría</span><span className="font-bold text-depro-dark">{form.category}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Entrenamientos/semana</span><span className="font-bold text-depro-dark">{form.trainingsPerWeek}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Duración sesión</span><span className="font-bold text-depro-dark">{form.sessionDuration} min</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Objetivo de fase</span><span className="font-bold text-depro-dark">{PHASE_OBJECTIVES.find((o) => o.id === form.phaseObjective)?.label}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Nivel</span><span className="font-bold text-depro-dark">{COMPETITIVE_LEVELS.find((o) => o.id === form.competitiveLevel)?.label}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Jugadores</span><span className="font-bold text-depro-dark">{form.numPlayers}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Gimnasio</span><span className="font-bold text-depro-dark">{form.gymAccess ? "Sí" : "No"}</span></div>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
              )}
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(3)} disabled={saving} className="btn-ghost flex items-center gap-2 disabled:opacity-50"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={handleConfirm} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Creando panel...</> : <>Crear mi panel <CheckCircle size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
