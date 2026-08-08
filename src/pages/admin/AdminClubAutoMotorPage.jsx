import { useMemo, useState } from "react";
import {
  Sparkles, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Dumbbell, CheckCircle2,
} from "lucide-react";
import {
  validateCoachQuestionnaire,
  generateClubAutoMicrociclo,
  generateClubAutoFourWeeks,
  TRAIN_DAYS,
} from "../../lib/clubAuto/clubAutoEngine";
import { CLUB_TAG_VALUES } from "../../lib/clubAuto/clubExerciseTags";

const NIVELES = [
  { id: "A", label: "A · 9–12 años" },
  { id: "B", label: "B · 12–15 años" },
  { id: "C", label: "C · 16+ años" },
];
const FREQ = [2, 3, 4];
const MATCH = [
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
  { id: "entre_semana", label: "Entre semana" },
];

function Chip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
        active ? "bg-depro-blue border-depro-blue text-white" : "border-depro-border text-depro-gray hover:border-depro-blue"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function SessionCard({ session }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-depro-border rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-depro-gray-light/40">
        <div>
          <p className="text-xs font-bold text-depro-blue">{session.assignedDay} · Protocolo {session.protocol}</p>
          <p className="text-sm font-semibold text-depro-dark">{session.protocolLabel}</p>
          <p className="text-[11px] text-depro-gray mt-0.5">{session.intensityDay} · dist. partido {session.matchDistance}</p>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="border-t border-depro-border p-4 space-y-4">
          {session.structure.map((block) => (
            <div key={block.label}>
              <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray mb-1.5">{block.label}</p>
              {block.type === "protocolo" ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-depro-gray mb-2">{block.template?.format}</p>
                  {(block.exercises || []).map((ex, i) => (
                    <div key={`${ex.slot}-${i}`} className="flex items-center justify-between gap-2 text-xs bg-depro-gray-light/50 rounded-lg px-3 py-2">
                      <span className="font-medium text-depro-dark flex items-center gap-1.5 min-w-0">
                        <Dumbbell size={12} className="text-depro-blue shrink-0" />
                        <span className="truncate">{i + 1}. {ex.nombre}</span>
                      </span>
                      <span className="text-depro-gray shrink-0">{ex.sets} / {ex.rest}</span>
                    </div>
                  ))}
                </div>
              ) : block.type === "observaciones" ? (
                <div className="text-xs text-depro-dark space-y-1 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p>{block.item?.observaciones}</p>
                  <p className="text-depro-gray"><strong>Jugadores:</strong> {block.item?.adaptaciones_jugadores}</p>
                  <p className="text-depro-gray"><strong>Espacio:</strong> {block.item?.adaptaciones_espacio}</p>
                </div>
              ) : (
                <div className="text-xs bg-depro-gray-light/50 rounded-lg px-3 py-2">
                  <p className="font-semibold text-depro-dark">{block.item?.nombre}</p>
                  <p className="text-depro-gray mt-0.5">{block.item?.descripcion || block.item?.duracion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminClubAutoMotorPage() {
  const [form, setForm] = useState({
    nivel: "B",
    dias_entrenamiento_semana: 3,
    dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
    dia_partido: "sabado",
    acceso_gimnasio: "no",
  });
  const [result, setResult] = useState(null);
  const [weeks, setWeeks] = useState(null);
  const [viewWeek, setViewWeek] = useState(1);
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => validateCoachQuestionnaire(form), [form]);

  const toggleDay = (day) => {
    setForm((f) => {
      const cur = f.dias_exactos_entrenamiento || [];
      const has = cur.includes(day);
      let next = has ? cur.filter((d) => d !== day) : [...cur, day];
      // auto-trim to frequency
      if (next.length > f.dias_entrenamiento_semana) {
        next = next.slice(-f.dias_entrenamiento_semana);
      }
      return { ...f, dias_exactos_entrenamiento: next };
    });
  };

  const generate = (four = false) => {
    setLoading(true);
    setTimeout(() => {
      if (four) {
        const w = generateClubAutoFourWeeks(form);
        setWeeks(w);
        setResult(w[0]);
        setViewWeek(1);
      } else {
        const r = generateClubAutoMicrociclo(form);
        setResult(r);
        setWeeks(null);
      }
      setLoading(false);
    }, 200);
  };

  const current = weeks ? weeks[viewWeek - 1] : result;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-depro-dark">Motor automático clubs / entrenadores</h1>
        <p className="text-sm text-depro-gray mt-0.5">
          Rama separada del motor individual y de la planificación manual. Estructura: calentamiento → balón → protocolo → tarea → observaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cuestionario */}
        <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-depro-blue" />
            <h2 className="font-bold text-depro-dark">Cuestionario del entrenador</h2>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Nivel del equipo *</p>
            <div className="flex flex-wrap gap-2">
              {NIVELES.map((n) => (
                <Chip key={n.id} active={form.nivel === n.id} onClick={() => setForm((f) => ({ ...f, nivel: n.id }))}>{n.label}</Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Entrenamientos / semana *</p>
            <div className="flex gap-2">
              {FREQ.map((n) => (
                <Chip
                  key={n}
                  active={form.dias_entrenamiento_semana === n}
                  onClick={() => setForm((f) => ({
                    ...f,
                    dias_entrenamiento_semana: n,
                    dias_exactos_entrenamiento: (f.dias_exactos_entrenamiento || []).slice(0, n),
                  }))}
                >
                  {n} días
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Días exactos *</p>
            <div className="flex flex-wrap gap-2">
              {TRAIN_DAYS.map((d) => (
                <Chip key={d} active={form.dias_exactos_entrenamiento.includes(d)} onClick={() => toggleDay(d)}>
                  {d.slice(0, 3)}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-depro-gray mt-2">
              Seleccionados: {form.dias_exactos_entrenamiento.length} / {form.dias_entrenamiento_semana}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Día de partido *</p>
            <div className="flex flex-wrap gap-2">
              {MATCH.map((m) => (
                <Chip key={m.id} active={form.dia_partido === m.id} onClick={() => setForm((f) => ({ ...f, dia_partido: m.id }))}>{m.label}</Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-depro-gray mb-2">Acceso a gimnasio *</p>
            <div className="flex gap-2">
              <Chip active={form.acceso_gimnasio === "si"} onClick={() => setForm((f) => ({ ...f, acceso_gimnasio: "si" }))}>Sí</Chip>
              <Chip active={form.acceso_gimnasio === "no"} onClick={() => setForm((f) => ({ ...f, acceso_gimnasio: "no" }))}>No</Chip>
            </div>
          </div>

          {!validation.ok && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1"><AlertTriangle size={13} /> Revisa el cuestionario</p>
              {validation.errors.map((e) => <p key={e}>• {e}</p>)}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!validation.ok || loading}
              onClick={() => generate(false)}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-50"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Generar microciclo
            </button>
            <button
              type="button"
              disabled={!validation.ok || loading}
              onClick={() => generate(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-depro-border text-sm font-bold text-depro-dark hover:bg-depro-gray-light disabled:opacity-50"
            >
              4 semanas
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          {!current && (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-depro-gray border border-dashed border-depro-border rounded-2xl">
              <Sparkles size={36} className="opacity-20 mb-3" />
              <p className="text-sm text-center px-6">Completa el cuestionario y genera el microciclo para previsualizar día a día.</p>
            </div>
          )}

          {current && !current.ok && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
              {(current.errors || []).join(" · ")}
            </div>
          )}

          {current?.ok && (
            <>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-900 flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Microciclo generado</p>
                  <p>{current.summary}</p>
                </div>
              </div>

              {weeks && (
                <div className="flex gap-1 p-1 bg-white rounded-xl border border-depro-border">
                  {weeks.map((w) => (
                    <button
                      key={w.week}
                      type="button"
                      onClick={() => { setViewWeek(w.week); setResult(w); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold ${viewWeek === w.week ? "bg-depro-blue text-white" : "text-depro-gray"}`}
                    >
                      S{w.week}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {(current.sessions || []).map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Referencia etiquetas club_* (capa paralela §10–11) */}
      <div className="bg-white border border-depro-border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-depro-dark">Etiquetas club_* (capa paralela)</h2>
        <p className="text-xs text-depro-gray">
          No las lee el motor individual. Valores runtime usados por el selector de protocolos.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(CLUB_TAG_VALUES).map(([key, values]) => (
            <div key={key} className="rounded-xl border border-depro-border p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-depro-blue mb-1.5">{key}</p>
              <ul className="text-[11px] text-depro-dark space-y-0.5 max-h-28 overflow-y-auto">
                {values.map((v) => <li key={v} className="font-mono">{v}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
