/**
 * MAQUETA — vídeo con eventos de ejemplo.
 * Producción: requiere integración visión por computador (fase posterior).
 */

"use client";

import { VIDEO_EVENTS } from "@/lib/seed-data";
import { Play } from "lucide-react";

export default function VideoPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">Rendimiento y vídeo</h1>

      <div className="relative rounded-xl overflow-hidden border border-depro-border bg-white aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Play size={28} className="text-white ml-1" />
          </div>
          <p className="text-sm text-depro-gray">Vídeo demo · Partido La Liga J38</p>
        </div>
      </div>

      <div className="rounded-xl border border-depro-border bg-white divide-y divide-slate-700">
        <div className="px-4 py-3 font-bold text-sm text-depro-gray uppercase">Eventos detectados (demo)</div>
        {VIDEO_EVENTS.map((ev) => (
          <div key={ev.time} className="px-4 py-3 flex items-center gap-4">
            <span className="font-mono text-sm text-amber-400 w-14">{ev.time}</span>
            <span className={`text-sm flex-1 ${ev.type === "positive" ? "text-emerald-400" : "text-red-400"}`}>
              {ev.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-depro-gray border border-depro-border rounded-lg p-3">
        MAQUETA — no hay detección real de eventos. Fase 2: pipeline CV + tracking + etiquetado automático.
      </p>
    </div>
  );
}
