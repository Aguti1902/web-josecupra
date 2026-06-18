/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * REAL — generación IA de diagrama + dibujo manual + banco sesiones.
 */

"use client";

import { useState } from "react";
import { Sparkles, Save, Trash2 } from "lucide-react";
import PitchDiagram, { EMPTY_DIAGRAM } from "@/components/PitchDiagram";
import { SEED_SESSIONS, SessionDiagram, SavedSession } from "@/lib/seed-data";
import { demoGet, demoSet } from "@/lib/demo-store";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function SesionesPage() {
  const [prompt, setPrompt] = useState("");
  const [diagram, setDiagram] = useState<SessionDiagram>(EMPTY_DIAGRAM);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("A");
  const [bank, setBank] = useState<SavedSession[]>(() => demoGet("sessions", SEED_SESSIONS));
  const [title, setTitle] = useState("");

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sesiones/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.diagram) setDiagram(data.diagram);
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = (team: string, x: number, y: number) => {
    setDiagram((d) => ({
      ...d,
      players: [...d.players, { team, x, y }],
    }));
  };

  const clearDiagram = () => setDiagram(EMPTY_DIAGRAM);

  const saveSession = async () => {
    const session: SavedSession = {
      id: crypto.randomUUID(),
      title: title || prompt.slice(0, 40) || "Sesión sin título",
      description: prompt,
      diagram,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("session_tasks").insert({
        title: session.title,
        description: session.description,
        diagram: session.diagram,
      });
    }

    const updated = [session, ...bank];
    setBank(updated);
    demoSet("sessions", updated);
    setTitle("");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-black">Sesiones y tareas</h1>
      <p className="text-depro-gray text-sm">Describe el ejercicio en lenguaje natural o dibújalo manualmente.</p>

      <div className="rounded-xl border border-depro-border bg-white p-4 space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Ej: "posesión 3 contra 3 en espacio reducido, máximo dos toques"'
          rows={2}
          className="w-full bg-white border border-depro-border rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-500 resize-none"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-depro-blue text-white font-bold text-sm hover:bg-amber-300 disabled:opacity-50"
        >
          <Sparkles size={16} /> {loading ? "Generando diagrama…" : "Generar con IA"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Diagrama táctico</h2>
            <div className="flex gap-2">
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="bg-depro-gray-light border border-depro-border rounded px-2 py-1 text-xs">
                <option value="A">Equipo A</option>
                <option value="B">Equipo B</option>
              </select>
              <button onClick={clearDiagram} className="p-2 rounded-lg bg-depro-gray-light text-depro-gray hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <PitchDiagram diagram={diagram} interactive onAddPlayer={addPlayer} selectedTeam={selectedTeam} />
          <p className="text-xs text-amber-400/80 font-medium">Entrena a la IA — clic en el campo para colocar jugadores</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-depro-gray font-bold uppercase">Guardar en banco</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
              className="w-full mt-1 bg-white border border-depro-border rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={saveSession} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-depro-blue text-sm font-bold">
              <Save size={16} /> Guardar sesión
            </button>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2">Banco de sesiones</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bank.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setDiagram(s.diagram); setPrompt(s.description); }}
                  className="w-full text-left rounded-lg border border-depro-border bg-white shadow-sm p-3 hover:border-slate-500 transition-colors"
                >
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-depro-gray mt-1 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
