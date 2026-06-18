/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * REAL — CRUD informes scouting en Supabase.
 */

"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ScoutingReport, SEED_SCOUTING } from "@/lib/seed-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { demoGet, demoSet } from "@/lib/demo-store";

const EMPTY = {
  player_name: "",
  physical: 5,
  technical: 5,
  tactical: 5,
  attitudinal: 5,
  notes: "",
};

export default function ScoutingPage() {
  const [reports, setReports] = useState<ScoutingReport[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<ScoutingReport | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { data } = await supabase.from("scouting_reports").select("*").order("created_at", { ascending: false });
      if (data?.length) {
        setReports(data as ScoutingReport[]);
        return;
      }
    }
    setReports(demoGet("scouting", SEED_SCOUTING));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.player_name.trim()) return;
    const report: ScoutingReport = {
      id: crypto.randomUUID(),
      ...form,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("scouting_reports").insert({
        player_name: form.player_name,
        physical: form.physical,
        technical: form.technical,
        tactical: form.tactical,
        attitudinal: form.attitudinal,
        notes: form.notes,
      });
    } else {
      const updated = [report, ...reports];
      demoSet("scouting", updated);
      setReports(updated);
    }

    setForm(EMPTY);
    setShowForm(false);
    load();
  };

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-depro-gray">{label}</span>
        <span className="font-bold">{value}/10</span>
      </div>
      <div className="h-2 bg-depro-gray-light rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Scouting</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-depro-blue text-sm font-bold">
          <Plus size={16} /> Nuevo informe
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-depro-border bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-between">
            <h2 className="font-bold">Nuevo informe</h2>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <input
            value={form.player_name}
            onChange={(e) => setForm({ ...form, player_name: e.target.value })}
            placeholder="Nombre del jugador"
            className="w-full bg-white border border-depro-border rounded-lg px-4 py-2"
          />
          {(["physical", "technical", "tactical", "attitudinal"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs text-depro-gray capitalize">{k === "physical" ? "Físico" : k === "technical" ? "Técnico" : k === "tactical" ? "Táctico" : "Actitudinal"}</label>
              <input type="range" min={1} max={10} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="w-full accent-blue-500" />
            </div>
          ))}
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notas libres..."
            rows={3}
            className="w-full bg-white border border-depro-border rounded-lg px-4 py-2 text-sm"
          />
          <button onClick={save} className="px-5 py-2 rounded-lg bg-depro-blue text-white font-bold text-sm">Guardar informe</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${selected?.id === r.id ? "border-depro-blue bg-depro-blue-light" : "border-depro-border bg-white hover:border-slate-500"}`}
            >
              <p className="font-bold">{r.player_name}</p>
              <p className="text-xs text-depro-gray mt-1">
                F{r.physical} T{r.technical} Ta{r.tactical} A{r.attitudinal}
              </p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-xl border border-depro-border bg-white shadow-sm p-5 space-y-4">
            <h2 className="text-xl font-black">{selected.player_name}</h2>
            <ScoreBar label="Físico" value={selected.physical} />
            <ScoreBar label="Técnico" value={selected.technical} />
            <ScoreBar label="Táctico" value={selected.tactical} />
            <ScoreBar label="Actitudinal" value={selected.attitudinal} />
            <p className="text-sm text-depro-gray leading-relaxed">{selected.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
