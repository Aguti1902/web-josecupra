import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Calendar, Dumbbell, Trophy,
  Building2, Loader2, AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { saveClub } from "../../lib/adminStorage";
import {
  validateCoachQuestionnaire,
  TRAIN_DAYS,
  CLUB_AUTO_NIVELES,
  CLUB_AUTO_MATCH_DAYS,
  categoryForNivel,
} from "../../lib/clubAuto/clubAutoCoachBridge";

const STEPS = ["Tu equipo", "Microciclo", "Confirmar"];

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

/**
 * Cuestionario corto del documento (rama automática clubs/entrenadores):
 * nivel A/B/C · 2/3/4 entrenos · días exactos · día partido · gimnasio.
 * No pregunta metodología, jugadores, táctica ni espacio.
 */
export default function CoachOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    teamName: "",
    season: "2025/2026",
    nivel: "B",
    dias_entrenamiento_semana: 3,
    dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
    dia_partido: "sabado",
    acceso_gimnasio: "no",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const questionnaire = useMemo(() => ({
    nivel: form.nivel,
    dias_entrenamiento_semana: form.dias_entrenamiento_semana,
    dias_exactos_entrenamiento: form.dias_exactos_entrenamiento,
    dia_partido: form.dia_partido,
    acceso_gimnasio: form.acceso_gimnasio,
  }), [form]);

  const validation = useMemo(() => validateCoachQuestionnaire(questionnaire), [questionnaire]);

  const step1Valid = form.teamName.trim().length > 0;
  const step2Valid = validation.ok;

  const toggleDay = (day) => {
    setForm((f) => {
      const cur = f.dias_exactos_entrenamiento || [];
      const has = cur.includes(day);
      let next = has ? cur.filter((d) => d !== day) : [...cur, day];
      if (next.length > f.dias_entrenamiento_semana) {
        next = next.slice(-f.dias_entrenamiento_semana);
      }
      return { ...f, dias_exactos_entrenamiento: next };
    });
  };

  const setFrequency = (n) => {
    setForm((f) => {
      let days = [...(f.dias_exactos_entrenamiento || [])];
      if (days.length > n) days = days.slice(0, n);
      if (days.length < n) {
        for (const d of TRAIN_DAYS) {
          if (days.length >= n) break;
          if (!days.includes(d)) days.push(d);
        }
      }
      return { ...f, dias_entrenamiento_semana: n, dias_exactos_entrenamiento: days };
    });
  };

  const handleConfirm = async () => {
    if (!validation.ok) {
      setError(validation.errors.join(" "));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const q = validation.normalized;
      const clubId = genId("coach_club");
      const teamId = genId("coach_team");
      const category = categoryForNivel(q.nivel);

      const club = {
        id: clubId,
        name: `${user?.name || "Entrenador"} · DEPRO Coach`,
        abbreviation: (user?.name || "EC").trim().slice(0, 2).toUpperCase(),
        city: "",
        country: "",
        status: "activo",
        plan: user?.plan || "coach-starter",
        isSoloCoach: true,
        planningMode: "auto",
        coachConfig: {
          engine: "club_auto",
          nivel: q.nivel,
          dias_entrenamiento_semana: q.dias_entrenamiento_semana,
          dias_exactos_entrenamiento: q.dias_exactos_entrenamiento,
          dia_partido: form.dia_partido,
          acceso_gimnasio: q.acceso_gimnasio ? "si" : "no",
          gymAccess: q.acceso_gimnasio,
          trainingsPerWeek: q.dias_entrenamiento_semana,
          trainingDays: q.dias_exactos_entrenamiento,
          matchDay: form.dia_partido,
          mode: "depro",
        },
        primaryColor: "#0A36F7",
        secondaryColor: "#ffffff",
        coordinator: null,
        teams: [
          {
            id: teamId,
            name: form.teamName.trim(),
            category,
            season: form.season,
            trainingDays: q.dias_exactos_entrenamiento,
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

  const matchLabel = CLUB_AUTO_MATCH_DAYS.find((m) => m.id === form.dia_partido)?.label || form.dia_partido;
  const nivelLabel = CLUB_AUTO_NIVELES.find((n) => n.id === form.nivel)?.label || form.nivel;

  return (
    <div className="min-h-screen bg-depro-gray-light py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-depro-blue text-white">COACH AUTO</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-depro-border shadow-card p-6 md:p-8">
          <StepHeader current={step} />

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Tu equipo</h2>
              <p className="text-depro-gray text-sm mb-6">
                Solo lo esencial. El motor automático genera el microciclo A/B/C según tu calendario.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Nombre de tu equipo *
                  </label>
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => set("teamName", e.target.value)}
                    className="admin-input w-full"
                    placeholder="Ej. Juvenil A"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Trophy size={12} /> Nivel del equipo *
                  </label>
                  <TagGroup
                    options={CLUB_AUTO_NIVELES}
                    value={form.nivel}
                    onChange={(v) => set("nivel", v)}
                    renderLabel={(o) => o.label}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Temporada</label>
                  <input
                    type="text"
                    value={form.season}
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
              <h2 className="text-2xl font-black text-depro-dark mb-2">Tu microciclo</h2>
              <p className="text-depro-gray text-sm mb-6">
                El número de días seleccionados debe coincidir con los entrenamientos por semana.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Calendar size={12} /> Entrenamientos por semana *
                  </label>
                  <TagGroup
                    options={[2, 3, 4].map((n) => ({ id: n, label: `${n} días` }))}
                    value={form.dias_entrenamiento_semana}
                    onChange={setFrequency}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block">
                    Días exactos de entrenamiento * ({form.dias_exactos_entrenamiento.length}/{form.dias_entrenamiento_semana})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAIN_DAYS.map((day) => {
                      const sel = form.dias_exactos_entrenamiento.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`text-sm font-bold px-3.5 py-2 rounded-xl border transition-all ${
                            sel
                              ? "bg-depro-blue border-depro-blue text-white"
                              : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Trophy size={12} /> Día de partido *
                  </label>
                  <TagGroup
                    options={CLUB_AUTO_MATCH_DAYS}
                    value={form.dia_partido}
                    onChange={(v) => set("dia_partido", v)}
                    renderLabel={(o) => o.label}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Dumbbell size={12} /> Acceso a gimnasio *
                  </label>
                  <TagGroup
                    options={[{ id: "si", label: "Sí" }, { id: "no", label: "No" }]}
                    value={form.acceso_gimnasio}
                    onChange={(v) => set("acceso_gimnasio", v)}
                    renderLabel={(o) => o.label}
                  />
                </div>
                {!validation.ok && (
                  <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <ul className="space-y-0.5">
                      {validation.errors.map((err) => <li key={err}>{err}</li>)}
                    </ul>
                  </div>
                )}
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
              <h2 className="text-2xl font-black text-depro-dark mb-2">Confirma tu configuración</h2>
              <p className="text-depro-gray text-sm mb-6">
                Activaremos el motor automático: calentamiento → balón → protocolo → tarea principal.
              </p>
              <div className="bg-depro-gray-light rounded-2xl p-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-depro-gray">Equipo</span><span className="font-bold text-depro-dark">{form.teamName}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Nivel</span><span className="font-bold text-depro-dark">{nivelLabel}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Entrenamientos/semana</span><span className="font-bold text-depro-dark">{form.dias_entrenamiento_semana}</span></div>
                <div className="flex justify-between gap-4"><span className="text-depro-gray shrink-0">Días</span><span className="font-bold text-depro-dark text-right">{form.dias_exactos_entrenamiento.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Partido</span><span className="font-bold text-depro-dark">{matchLabel}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Gimnasio</span><span className="font-bold text-depro-dark">{form.acceso_gimnasio === "si" ? "Sí" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Modo</span><span className="font-bold text-depro-blue">Automático</span></div>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
              )}
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} disabled={saving} className="btn-ghost flex items-center gap-2 disabled:opacity-50"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={handleConfirm} disabled={saving || !validation.ok} className="btn-primary flex items-center gap-2 disabled:opacity-50">
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
