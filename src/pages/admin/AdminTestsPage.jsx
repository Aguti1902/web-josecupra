import React, { useState, useEffect } from "react";
import { PlayCircle, Save, CheckCircle, RefreshCw, Info } from "lucide-react";
import { EVAL_TEST_DEFAULTS } from "../../lib/evalTestDefaults";

const BASE_TESTS = EVAL_TEST_DEFAULTS;

const STORAGE_KEY = "depro_global_tests";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function loadTests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

async function fetchTestsFromCloud() {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const entry = (data.clubs || []).find((c) => c.id === "GLOBAL_TESTS");
    return entry?.tests ?? null;
  } catch { return null; }
}

async function saveTestsToCloud(tests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  const res = await fetch("/api/admin-clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      club: { id: "GLOBAL_TESTS", name: "Global Tests" },
      detail: { tests },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function defaultTests() {
  return BASE_TESTS.map((t) => ({ ...t, description: "", videoUrl: "" }));
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState(() => {
    const stored = loadTests();
    return stored.length ? stored : defaultTests();
  });
  const [syncing, setSyncing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTestsFromCloud().then((cloud) => {
      if (cloud?.length) {
        setTests(cloud);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
      }
    });
  }, []);

  const updateTest = (i, field, val) =>
    setTests((prev) => prev.map((t, ti) => ti === i ? { ...t, [field]: val } : t));

  const handleSave = async () => {
    setSyncing(true);
    try {
      await saveTestsToCloud(tests);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("[DEPRO] Error guardando tests", e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Tests físicos</h1>
          <p className="text-sm text-depro-gray mt-0.5">
            Configura los 4 tests. Se aplican igual a todos los equipos.
          </p>
        </div>
        <button onClick={handleSave} disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-50">
          {syncing ? <RefreshCw size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {syncing ? "Guardando…" : saved ? "¡Guardado!" : "Guardar en la nube"}
        </button>
      </div>

      {/* Nota */}
      <div className="flex items-start gap-3 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl px-4 py-3">
        <Info size={16} className="text-depro-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-dark/70">
          <strong>Los colores de rendimiento (verde / amarillo / rojo)</strong> no tienen umbrales fijos.
          Se calculan automáticamente según la <strong>media del equipo</strong> en cada test.
          Solo necesitas definir el protocolo y el vídeo explicativo.
        </p>
      </div>

      {/* Los 4 tests */}
      <div className="grid grid-cols-1 gap-5">
        {tests.map((test, i) => {
          const ytId = getYouTubeId(test.videoUrl);
          return (
            <div key={test.id} className="bg-white rounded-2xl border border-depro-border shadow-sm overflow-hidden">
              {/* Encabezado */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-depro-border/60 bg-[#F8F9FB]">
                <div className="w-8 h-8 rounded-xl bg-depro-blue/10 border border-depro-blue/20 flex items-center justify-center text-sm font-black text-depro-blue flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-black text-depro-dark">{test.label}</div>
                  <div className="text-xs text-depro-gray">Unidad de medida: <strong>{test.unit}</strong></div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vídeo */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
                      <PlayCircle size={10} className="text-depro-blue" /> URL vídeo explicativo (YouTube)
                    </label>
                    <input
                      className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                      placeholder="https://youtu.be/…"
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

                {/* Protocolo */}
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
                      Verde / amarillo / rojo se calculan automáticamente según la media del equipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
