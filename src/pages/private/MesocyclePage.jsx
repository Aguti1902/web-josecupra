import { useState } from "react";
import {
  ClipboardList, Star, CheckCircle, AlertCircle, Target, Plus, X, Save,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { mesocycleAssessments, clubWeeklyPlan } from "../../data/mockData";

export default function MesocyclePage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0A36F7";

  const [history] = useState(mesocycleAssessments);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: clubWeeklyPlan[0]?.code || "S.1",
    rating: 8,
    achievements: [""],
    issues: [""],
    nextFocus: "",
    completionByDay: {},
  });

  const handleArrayChange = (key, idx, value) => {
    setForm((f) => ({ ...f, [key]: f[key].map((v, i) => (i === idx ? value : v)) }));
  };
  const addItem = (key) => setForm((f) => ({ ...f, [key]: [...f[key], ""] }));
  const removeItem = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const submit = (e) => {
    e.preventDefault();
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
            <ClipboardList size={14} className="text-depro-blue" /> Valoración de mesociclo
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">Valoración del mesociclo</h1>
          <p className="text-depro-gray text-sm max-w-2xl">
            Formulario breve para registrar la marcha del equipo al cerrar cada microciclo.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-depro-blue text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-depro-blue-dark transition-colors"
          >
            <Plus size={16} /> Nueva valoración
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={submit} className="bg-white border border-depro-border rounded-2xl shadow-card p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-depro-dark">Nueva valoración</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-depro-gray hover:text-depro-dark">
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Microciclo</label>
              <select
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="admin-input w-full"
              >
                {clubWeeklyPlan.map((m) => (
                  <option key={m.code} value={m.code}>{m.code} · {m.focus}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">
                Valoración global · {form.rating}/10
              </label>
              <input
                type="range" min="1" max="10" step="1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: accent }}
              />
            </div>
          </div>

          {/* Logros */}
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <CheckCircle size={12} className="text-depro-green" /> Logros del mesociclo
            </label>
            {form.achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={a}
                  onChange={(e) => handleArrayChange("achievements", i, e.target.value)}
                  placeholder="Ej. Mejora del ritmo de pase en posesión"
                  className="admin-input flex-1"
                />
                {form.achievements.length > 1 && (
                  <button type="button" onClick={() => removeItem("achievements", i)} className="text-depro-red hover:bg-depro-red-light rounded-lg p-1.5">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItem("achievements")} className="text-xs font-bold text-depro-blue hover:underline flex items-center gap-1">
              <Plus size={12} /> Añadir logro
            </button>
          </div>

          {/* Incidencias */}
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <AlertCircle size={12} className="text-depro-red" /> Incidencias / aspectos a mejorar
            </label>
            {form.issues.map((it, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={it}
                  onChange={(e) => handleArrayChange("issues", i, e.target.value)}
                  placeholder="Ej. Bajón el último día por carga acumulada"
                  className="admin-input flex-1"
                />
                {form.issues.length > 1 && (
                  <button type="button" onClick={() => removeItem("issues", i)} className="text-depro-red hover:bg-depro-red-light rounded-lg p-1.5">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItem("issues")} className="text-xs font-bold text-depro-red hover:underline flex items-center gap-1">
              <Plus size={12} /> Añadir incidencia
            </button>
          </div>

          {/* Próximo foco */}
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Target size={12} style={{ color: accent }} /> Próximo foco
            </label>
            <textarea
              rows={2}
              value={form.nextFocus}
              onChange={(e) => setForm({ ...form, nextFocus: e.target.value })}
              placeholder="¿Qué prioriza el equipo el próximo microciclo?"
              className="admin-input w-full resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-depro-gray hover:text-depro-dark transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex items-center gap-2 bg-depro-blue text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-depro-blue-dark transition-colors">
              <Save size={14} /> Guardar valoración
            </button>
          </div>
        </form>
      )}

      {/* Historial */}
      <h2 className="font-bold text-depro-dark mb-3 text-sm uppercase tracking-wide text-depro-gray">Historial</h2>
      <div className="space-y-4">
        {history.map((m) => (
          <div key={m.id} className="bg-white border border-depro-border rounded-2xl shadow-card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black" style={{ backgroundColor: accent + "20", color: accent }}>
                  {m.code}
                </div>
                <div>
                  <div className="font-bold text-depro-dark">{m.label}</div>
                  <div className="text-xs text-depro-gray">Cerrado el {m.completedAt}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < m.rating ? "fill-current text-depro-yellow" : "text-depro-border"}
                    />
                  ))}
                </div>
                <div className="text-xs font-bold text-depro-dark mt-1">{m.rating}/10</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <CheckCircle size={11} className="text-depro-green" /> Logros
                </div>
                <ul className="space-y-1">
                  {m.achievements.map((a, i) => (
                    <li key={i} className="text-xs text-depro-dark leading-snug">• {a}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <AlertCircle size={11} className="text-depro-red" /> Incidencias
                </div>
                <ul className="space-y-1">
                  {m.issues.map((it, i) => (
                    <li key={i} className="text-xs text-depro-dark leading-snug">• {it}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Target size={11} style={{ color: accent }} /> Próximo foco
                </div>
                <p className="text-xs text-depro-dark leading-snug">{m.nextFocus}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-depro-border flex items-center gap-2 text-xs text-depro-gray">
              <CheckCircle size={12} className="text-depro-green" />
              Sesiones completadas: <strong className="text-depro-dark">{m.sessionsCompleted}/{m.sessionsPlanned}</strong>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="bg-white border border-depro-border rounded-2xl text-center py-16 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={26} className="text-depro-gray" />
            </div>
            <h3 className="text-lg font-bold text-depro-dark mb-2">Sin valoraciones aún</h3>
            <p className="text-depro-gray text-sm">Crea la primera valoración cuando termines el microciclo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
