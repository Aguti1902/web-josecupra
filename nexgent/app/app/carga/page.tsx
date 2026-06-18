/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * REAL — import CSV/XLSX + mapeo columnas + clasificación IA.
 * Fase 2: Catapult Connect / STATSports API con token del club.
 */

"use client";

import { useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import { DEMO_PLAYERS, loadBandColor, LoadBand } from "@/lib/seed-data";

const METRIC_KEYS = [
  { key: "distance", label: "Distancia total (m)" },
  { key: "hsr", label: "Distancia alta velocidad (m)" },
  { key: "sprints", label: "Sprints" },
  { key: "accelerations", label: "Aceleraciones" },
  { key: "playerLoad", label: "Player Load" },
];

interface ParsedRow {
  player: string;
  raw: Record<string, string | number>;
}

interface ClassifiedPlayer {
  name: string;
  metrics: Record<string, number>;
  band: LoadBand;
  explanation: string;
}

export default function CargaPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [classified, setClassified] = useState<ClassifiedPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

    if (json.length === 0) return;
    const hdrs = Object.keys(json[0]);
    setHeaders(hdrs);
    setRows(
      json.map((row) => ({
        player: String(row[hdrs[0]] ?? "Jugador"),
        raw: row,
      }))
    );
    setMapping({});
    setClassified([]);
  };

  const classifyAll = async () => {
    setLoading(true);
    const results: ClassifiedPlayer[] = [];

    for (const row of rows.slice(0, 8)) {
      const metrics: Record<string, number> = {};
      for (const { key } of METRIC_KEYS) {
        const col = mapping[key];
        if (col && row.raw[col] != null) metrics[key] = Number(row.raw[col]) || 0;
      }

      const res = await fetch("/api/carga/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: row.player, metrics, history: [] }),
      });
      const data = await res.json();
      results.push({
        name: row.player,
        metrics,
        band: (data.band as LoadBand) || "alta",
        explanation: data.explanation || "",
      });
    }

    setClassified(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">Control de carga</h1>
      <p className="text-slate-400 text-sm">Importa export GPS (CSV/XLSX) de Catapult, STATSports, Polar, WIMU…</p>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-10 cursor-pointer hover:border-amber-500/50 transition-colors">
        <Upload className="text-slate-400 mb-3" size={32} />
        <span className="font-bold">Subir archivo GPS</span>
        <span className="text-xs text-slate-500 mt-1">CSV o XLSX</span>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
      </label>

      {headers.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5 space-y-4">
          <h2 className="font-bold">Mapeo de columnas</h2>
          <p className="text-xs text-slate-500">Indica qué columna de tu export corresponde a cada métrica.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {METRIC_KEYS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-slate-400">{label}</label>
                <select
                  value={mapping[key] || ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Seleccionar —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">{rows.length} filas detectadas · Jugador: columna &quot;{headers[0]}&quot;</p>
          <button
            onClick={classifyAll}
            disabled={loading || !mapping.distance}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-sm disabled:opacity-50"
          >
            <Sparkles size={16} /> {loading ? "Clasificando con IA…" : "Importar y clasificar"}
          </button>
        </div>
      )}

      {classified.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold">Resultados</h2>
          {classified.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex flex-wrap gap-4 items-start">
              <div>
                <p className="font-bold">{p.name}</p>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full capitalize mt-1 inline-block"
                  style={{ background: loadBandColor(p.band) + "33", color: loadBandColor(p.band) }}
                >
                  {p.band}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex-1 min-w-[200px]">{p.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {!rows.length && (
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-xs text-slate-600 mb-3">Vista previa plantilla (demo):</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_PLAYERS.slice(0, 6).map((p) => (
              <span key={p.id} className="text-xs px-2 py-1 rounded bg-slate-800" style={{ color: loadBandColor(p.loadBand) }}>
                {p.name} · {p.loadBand}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
