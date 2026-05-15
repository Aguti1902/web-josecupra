import React, { useState, useEffect } from "react";
import {
  ClipboardList, PlayCircle, Save, CheckCircle, RefreshCw, Info,
} from "lucide-react";

/* ── Constantes ─────────────────────────────────────────── */
const AGE_BLOCKS = [
  { id: "Bloque 1", label: "Bloque 1 · Fútbol Base",      ages: ["Sub-9","Sub-10","Sub-11","Sub-12"], color: "#3B82F6" },
  { id: "Bloque 2", label: "Bloque 2 · Fútbol Formativo", ages: ["Sub-13","Sub-14","Sub-15"],          color: "#8B5CF6" },
  { id: "Bloque 3", label: "Bloque 3 · Fútbol Juvenil",   ages: ["Sub-16","Juvenil"],                  color: "#EF4444" },
];

const BASE_TESTS = [
  { id: "resistencia", label: "Resistencia aeróbica", unit: "m / min",
    placeholder: "Protocolo: el jugador corre durante X minutos a ritmo constante. Se miden los metros totales…" },
  { id: "sprint",      label: "Sprint 30m",           unit: "seg",
    placeholder: "Protocolo: el jugador realiza un sprint de 30m partiendo desde parado. Se registra el tiempo con fotocélulas…" },
  { id: "cod",         label: "Cambio de dirección",  unit: "seg",
    placeholder: "Protocolo: test 5-10-5 o Illinois. El jugador recorre el circuito lo más rápido posible…" },
  { id: "cmj",         label: "Salto CMJ",            unit: "cm",
    placeholder: "Protocolo: salto con contramovimiento desde posición erguida. Se mide la altura máxima alcanzada…" },
];

const STORAGE_KEY = "depro_block_tests";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function loadTests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

async function fetchTestsFromCloud() {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const entry = (data.clubs || []).find((c) => c.id === "BLOCK_TESTS");
    return entry?.tests ?? null;
  } catch { return null; }
}

async function saveTestsToCloud(tests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  const res = await fetch("/api/admin-clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      club: { id: "BLOCK_TESTS", name: "Block Tests" },
      detail: { tests },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function defaultBlockTests() {
  const out = {};
  AGE_BLOCKS.forEach((b) => {
    out[b.id] = BASE_TESTS.map((t) => ({ ...t, description: "", videoUrl: "" }));
  });
  return out;
}

/* ── Componente principal ────────────────────────────────── */
export default function AdminTestsPage() {
  const [allTests, setAllTests] = useState(() => {
    const stored = loadTests();
    const defaults = defaultBlockTests();
    const merged = {};
    AGE_BLOCKS.forEach((b) => {
      merged[b.id] = stored[b.id]?.length ? stored[b.id] : defaults[b.id];
    });
    return merged;
  });
  const [activeBlock, setActiveBlock] = useState(AGE_BLOCKS[0].id);
  const [syncing, setSyncing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar desde la nube al montar
  useEffect(() => {
    fetchTestsFromCloud().then((cloud) => {
      if (!cloud) return;
      const defaults = defaultBlockTests();
      const merged = {};
      AGE_BLOCKS.forEach((b) => {
        merged[b.id] = cloud[b.id]?.length ? cloud[b.id] : defaults[b.id];
      });
      setAllTests(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    });
  }, []);

  const bloque = AGE_BLOCKS.find((b) => b.id === activeBlock);
  const tests = allTests[activeBlock] || BASE_TESTS.map((t) => ({ ...t, description: "", videoUrl: "" }));

  const updateTest = (i, field, val) => {
    setAllTests((prev) => ({
      ...prev,
      [activeBlock]: prev[activeBlock].map((t, ti) => ti === i ? { ...t, [field]: val } : t),
    }));
  };

  const handleSave = async () => {
    setSyncing(true);
    try {
      await saveTestsToCloud(allTests);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("[DEPRO] Error guardando tests", e);
    } finally {
      setSyncing(false);
    }
  };

  const blockHasData = (bid) => {
    const ts = allTests[bid] || [];
    return ts.some((t) => t.videoUrl || t.description);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Tests físicos</h1>
          <p className="text-sm text-depro-gray mt-0.5">Configura los 4 tests para cada bloque de edad. José los define una sola vez.</p>
        </div>
        <button onClick={handleSave} disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-50">
          {syncing ? <RefreshCw size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {syncing ? "Guardando…" : saved ? "¡Guardado!" : "Guardar en la nube"}
        </button>
      </div>

      {/* Nota metodológica */}
      <div className="flex items-start gap-3 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl px-4 py-3">
        <Info size={16} className="text-depro-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-dark/70">
          <strong>Los colores de rendimiento (verde / amarillo / rojo)</strong> no tienen umbrales fijos.
          Se calculan automáticamente en base a la <strong>media del equipo</strong> en cada test:
          por encima de la media → verde; zona media → amarillo; por debajo → rojo.
          Solo necesitas definir el protocolo y el vídeo explicativo.
        </p>
      </div>

      {/* Tabs por bloque */}
      <div className="flex gap-2">
        {AGE_BLOCKS.map((b) => (
          <button key={b.id} onClick={() => setActiveBlock(b.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border"
            style={activeBlock === b.id
              ? { backgroundColor: b.color, color: "#fff", borderColor: b.color }
              : { backgroundColor: "#fff", color: b.color, borderColor: b.color + "40" }}>
            <ClipboardList size={13} />
            {b.id}
            {blockHasData(b.id) && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Información del bloque activo */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
        style={{ borderColor: bloque.color + "30", backgroundColor: bloque.color + "08" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ backgroundColor: bloque.color }}>
          {bloque.id.replace("Bloque ", "B")}
        </div>
        <div>
          <div className="font-black text-depro-dark text-sm">{bloque.label}</div>
          <div className="text-xs text-depro-gray">{bloque.ages.join(" · ")}</div>
        </div>
      </div>

      {/* Los 4 tests */}
      <div className="grid grid-cols-1 gap-5">
        {tests.map((test, i) => {
          const ytId = getYouTubeId(test.videoUrl);
          return (
            <div key={test.id} className="bg-white rounded-2xl border border-depro-border shadow-sm overflow-hidden">
              {/* Encabezado */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-depro-border/60"
                style={{ backgroundColor: bloque.color + "07" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ backgroundColor: bloque.color + "20", color: bloque.color }}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-black text-depro-dark">{test.label}</div>
                  <div className="text-xs text-depro-gray">Unidad de medida: <strong>{test.unit}</strong></div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: vídeo */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
                      <PlayCircle size={10} className="text-depro-blue" /> URL vídeo explicativo (YouTube)
                    </label>
                    <input
                      className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                      placeholder="https://youtu.be/…  o  https://www.youtube.com/watch?v=…"
                      value={test.videoUrl || ""}
                      onChange={(e) => updateTest(i, "videoUrl", e.target.value)}
                    />
                  </div>

                  {ytId ? (
                    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title={test.label}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl bg-depro-gray-light/50 border-2 border-dashed border-depro-border text-depro-gray text-xs font-medium"
                      style={{ minHeight: "140px" }}>
                      <span className="flex items-center gap-2">
                        <PlayCircle size={16} /> Pega una URL para previsualizar el vídeo
                      </span>
                    </div>
                  )}
                </div>

                {/* Columna derecha: protocolo */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1.5">
                      Protocolo de ejecución
                    </label>
                    <textarea
                      rows={7}
                      className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                      placeholder={test.placeholder}
                      value={test.description || ""}
                      onChange={(e) => updateTest(i, "description", e.target.value)}
                    />
                  </div>
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">
                      Los rangos verde / amarillo / rojo se calculan automáticamente según la media del equipo.
                      No es necesario definir umbrales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón guardar inferior */}
      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-50">
          {syncing ? <RefreshCw size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {syncing ? "Guardando…" : saved ? "¡Guardado en la nube!" : "Guardar todos los tests"}
        </button>
      </div>
    </div>
  );
}
