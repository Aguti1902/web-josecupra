/**
 * Cuestionario corto del entrenador (punto 4 del documento).
 * Solo: nivel A/B/C · 2/3/4 · días exactos · partido · gimnasio.
 */
import { useMemo } from "react";
import { AlertCircle, Calendar, Dumbbell, Trophy } from "lucide-react";
import {
  validateCoachQuestionnaire,
  TRAIN_DAYS,
  CLUB_AUTO_NIVELES,
  CLUB_AUTO_MATCH_DAYS,
} from "../../lib/clubAuto/clubAutoCoachBridge";

function Chip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
        active
          ? "bg-depro-blue border-depro-blue text-white"
          : "bg-white border-depro-border text-depro-gray hover:border-depro-blue/40"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * @param {{
 *   value: {
 *     nivel: string,
 *     dias_entrenamiento_semana: number,
 *     dias_exactos_entrenamiento: string[],
 *     dia_partido: string,
 *     acceso_gimnasio: string|boolean,
 *   },
 *   onChange: (next: object) => void,
 *   showErrors?: boolean,
 * }} props
 */
export default function CoachAutoQuestionnaire({ value, onChange, showErrors = true }) {
  const form = {
    nivel: value?.nivel || "B",
    dias_entrenamiento_semana: Number(value?.dias_entrenamiento_semana || 3),
    dias_exactos_entrenamiento: value?.dias_exactos_entrenamiento || [],
    dia_partido: value?.dia_partido || "sabado",
    acceso_gimnasio: value?.acceso_gimnasio === true || value?.acceso_gimnasio === "si" ? "si" : "no",
  };

  const validation = useMemo(() => validateCoachQuestionnaire(form), [form]);

  const patch = (partial) => onChange({ ...form, ...partial });

  const setFrequency = (n) => {
    let days = [...form.dias_exactos_entrenamiento];
    if (days.length > n) days = days.slice(0, n);
    if (days.length < n) {
      for (const d of TRAIN_DAYS) {
        if (days.length >= n) break;
        if (!days.includes(d)) days.push(d);
      }
    }
    patch({ dias_entrenamiento_semana: n, dias_exactos_entrenamiento: days });
  };

  const toggleDay = (day) => {
    const cur = form.dias_exactos_entrenamiento;
    const has = cur.includes(day);
    let next = has ? cur.filter((d) => d !== day) : [...cur, day];
    if (next.length > form.dias_entrenamiento_semana) {
      next = next.slice(-form.dias_entrenamiento_semana);
    }
    patch({ dias_exactos_entrenamiento: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Trophy size={12} /> Nivel del equipo *
        </label>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_NIVELES.map((n) => (
            <Chip key={n.id} active={form.nivel === n.id} onClick={() => patch({ nivel: n.id })}>
              {n.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Calendar size={12} /> Entrenamientos por semana *
        </label>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4].map((n) => (
            <Chip key={n} active={form.dias_entrenamiento_semana === n} onClick={() => setFrequency(n)}>
              {n} días
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block">
          Días exactos de entrenamiento * ({form.dias_exactos_entrenamiento.length}/{form.dias_entrenamiento_semana})
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAIN_DAYS.map((day) => (
            <Chip
              key={day}
              active={form.dias_exactos_entrenamiento.includes(day)}
              onClick={() => toggleDay(day)}
            >
              {day}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Trophy size={12} /> Día de partido *
        </label>
        <div className="flex flex-wrap gap-2">
          {CLUB_AUTO_MATCH_DAYS.map((m) => (
            <Chip key={m.id} active={form.dia_partido === m.id} onClick={() => patch({ dia_partido: m.id })}>
              {m.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Dumbbell size={12} /> Acceso a gimnasio *
        </label>
        <div className="flex flex-wrap gap-2">
          {[{ id: "si", label: "Sí" }, { id: "no", label: "No" }].map((o) => (
            <Chip key={o.id} active={form.acceso_gimnasio === o.id} onClick={() => patch({ acceso_gimnasio: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      {showErrors && !validation.ok && (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {validation.errors.map((err) => <li key={err}>{err}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export function questionnaireToCoachConfig(q) {
  const v = validateCoachQuestionnaire(q);
  if (!v.ok) return { ok: false, errors: v.errors, config: null };
  const n = v.normalized;
  return {
    ok: true,
    errors: [],
    config: {
      engine: "club_auto",
      nivel: n.nivel,
      dias_entrenamiento_semana: n.dias_entrenamiento_semana,
      dias_exactos_entrenamiento: n.dias_exactos_entrenamiento,
      dia_partido: q.dia_partido || "sabado",
      acceso_gimnasio: n.acceso_gimnasio ? "si" : "no",
      gymAccess: n.acceso_gimnasio,
      trainingsPerWeek: n.dias_entrenamiento_semana,
      trainingDays: n.dias_exactos_entrenamiento,
      matchDay: q.dia_partido || "sabado",
      mode: "depro",
    },
  };
}

export { validateCoachQuestionnaire };
