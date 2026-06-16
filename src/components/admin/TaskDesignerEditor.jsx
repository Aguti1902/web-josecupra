import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  FRAMEWORKS, FRAMEWORK_LABELS, FRAMEWORK_COLORS,
} from "../../lib/mesocycleTemplates";
import {
  normalizeTaskDesigner, PARAM_FIELDS, resolveTaskCues,
} from "../../lib/taskDesigner";

export default function TaskDesignerEditor({ value, onChange, sessionFramework = "A" }) {
  const td = normalizeTaskDesigner(value);
  const [fwTab, setFwTab] = useState(sessionFramework || "A");
  const [cueTask, setCueTask] = useState(td.taskTypes[0] || "");

  const patch = (changes) => onChange(normalizeTaskDesigner({ ...td, ...changes }));

  const setTaskTypes = (taskTypes) => patch({ taskTypes });
  const setParams = (framework, field, val) =>
    patch({
      paramsByFramework: {
        ...td.paramsByFramework,
        [framework]: { ...td.paramsByFramework[framework], [field]: val },
      },
    });

  const setRecommendations = (framework, list) =>
    patch({ recommendationsByFramework: { ...td.recommendationsByFramework, [framework]: list } });

  const cuesForTask = resolveTaskCues(td, cueTask, fwTab);
  const setCuesForTask = (lines) =>
    patch({
      cuesByTask: {
        ...td.cuesByTask,
        [cueTask]: { ...(td.cuesByTask[cueTask] || {}), [fwTab]: lines },
      },
    });

  const addTaskType = () => {
    const name = `Nueva tarea ${td.taskTypes.length + 1}`;
    setTaskTypes([...td.taskTypes, name]);
  };

  const updateTaskType = (idx, name) =>
    setTaskTypes(td.taskTypes.map((t, i) => (i === idx ? name : t)));

  const removeTaskType = (idx) => {
    if (td.taskTypes.length <= 1) return;
    const removed = td.taskTypes[idx];
    const nextTypes = td.taskTypes.filter((_, i) => i !== idx);
    const nextCues = { ...td.cuesByTask };
    delete nextCues[removed];
    patch({ taskTypes: nextTypes, cuesByTask: nextCues });
    if (cueTask === removed) setCueTask(nextTypes[0] || "");
  };

  const recs = td.recommendationsByFramework[fwTab] || [];

  return (
    <div className="space-y-5">
      {/* Catálogo de tipos de tarea */}
      <div className="rounded-xl border border-depro-border p-4 space-y-3 bg-depro-gray-light/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-depro-dark">Tipos de tarea</p>
            <p className="text-[10px] text-depro-gray">Lista disponible en el diseñador (multiselección en vista club)</p>
          </div>
          <button type="button" onClick={addTaskType}
            className="flex items-center gap-1 text-xs font-bold text-depro-blue hover:underline">
            <Plus size={11} /> Añadir
          </button>
        </div>
        {td.taskTypes.map((name, idx) => (
          <div key={`${idx}-${name}`} className="flex items-center gap-2">
            <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={name}
              onChange={(e) => updateTaskType(idx, e.target.value)} />
            <button type="button" onClick={() => removeTaskType(idx)} className="text-depro-gray hover:text-red-500 p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Pestañas marco A/B/C/D */}
      <div className="flex gap-1 overflow-x-auto">
        {FRAMEWORKS.map((fw) => (
          <button key={fw} type="button" onClick={() => setFwTab(fw)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              fwTab === fw ? "text-white border-transparent" : "bg-white text-depro-gray border-depro-border"
            }`}
            style={fwTab === fw ? { backgroundColor: FRAMEWORK_COLORS[fw] } : {}}>
            {fw} · {FRAMEWORK_LABELS[fw]}
          </button>
        ))}
      </div>

      {/* Parámetros */}
      <div className="rounded-xl border border-depro-border p-4 space-y-3">
        <p className="text-xs font-bold text-depro-dark">Parámetros · Sesión {FRAMEWORK_LABELS[fwTab]}</p>
        <div className="grid grid-cols-2 gap-2">
          {PARAM_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</label>
              <input className="w-full mt-0.5 border border-depro-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder={placeholder}
                value={td.paramsByFramework[fwTab]?.[key] || ""}
                onChange={(e) => setParams(fwTab, key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* Consignas por tarea */}
      <div className="rounded-xl border border-depro-border p-4 space-y-3">
        <p className="text-xs font-bold text-depro-dark">Consignas por tipo de tarea</p>
        <select className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
          value={cueTask} onChange={(e) => setCueTask(e.target.value)}>
          {td.taskTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {cuesForTask.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-xs font-black text-depro-gray w-5 pt-2">{i + 1}</span>
            <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={line}
              onChange={(e) => {
                const next = [...cuesForTask];
                next[i] = e.target.value;
                setCuesForTask(next);
              }} />
            <button type="button" onClick={() => setCuesForTask(cuesForTask.filter((_, j) => j !== i))}
              className="text-depro-gray hover:text-red-500 p-1">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setCuesForTask([...cuesForTask, ""])}
          className="text-xs font-bold text-depro-blue hover:underline flex items-center gap-1">
          <Plus size={11} /> Añadir consigna
        </button>
      </div>

      {/* Recomendaciones del día */}
      <div className="rounded-xl border border-depro-border p-4 space-y-3">
        <p className="text-xs font-bold text-depro-dark">Recomendaciones del día · {FRAMEWORK_LABELS[fwTab]}</p>
        {recs.map((line, i) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={line}
              onChange={(e) => {
                const next = [...recs];
                next[i] = e.target.value;
                setRecommendations(fwTab, next);
              }} />
            <button type="button" onClick={() => setRecommendations(fwTab, recs.filter((_, j) => j !== i))}
              className="text-depro-gray hover:text-red-500 p-1">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setRecommendations(fwTab, [...recs, ""])}
          className="text-xs font-bold text-depro-blue hover:underline flex items-center gap-1">
          <Plus size={11} /> Añadir recomendación
        </button>
      </div>
    </div>
  );
}
