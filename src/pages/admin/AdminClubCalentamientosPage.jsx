import { useEffect, useMemo, useState } from "react";
import { Flame, Save, ExternalLink, Plus, Trash2 } from "lucide-react";
import {
  CLUB_SIN_BALON_INTRO,
  loadCustomWarmups,
  saveCustomWarmups,
  hydrateCustomWarmups,
} from "../../data/clubAutoCatalog";

function youtubeOk(url) {
  return /youtu\.?be|youtube\.com/i.test(String(url || ""));
}

export default function AdminClubCalentamientosPage({ embedded = false } = {}) {
  const [warmups, setWarmups] = useState(() => loadCustomWarmups());
  const [draftUrl, setDraftUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    hydrateCustomWarmups().then((list) => {
      if (Array.isArray(list) && list.length) setWarmups(list);
    }).catch(() => {});
  }, []);

  const persist = async (next) => {
    setError("");
    setSaving(true);
    try {
      const numbered = await saveCustomWarmups(next);
      setWarmups(numbered);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setWarmups(next);
      setError(err?.message || "No se pudo guardar en la base de datos. Reinténtalo.");
    } finally {
      setSaving(false);
    }
  };

  const addWarmup = () => {
    const url = draftUrl.trim();
    if (!url || !youtubeOk(url)) {
      setError("Pega un enlace de YouTube.");
      return;
    }
    setError("");
    persist([
      ...warmups,
      {
        id: `cgw_${Date.now()}`,
        videoUrl: url,
        video: url,
        carpeta: "/calentamientos_sin_balon",
      },
    ]);
    setDraftUrl("");
  };

  const changeUrl = (id, videoUrl) => {
    persist(warmups.map((w) => (w.id === id ? { ...w, videoUrl, video: videoUrl } : w)));
  };

  const removeWarmup = (id) => {
    persist(warmups.filter((w) => w.id !== id));
  };

  const preview = useMemo(() => warmups, [warmups]);

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-depro-dark flex items-center gap-2">
              <Flame size={22} className="text-orange-500" />
              Calentamientos sin balón
            </h1>
            <p className="text-sm text-depro-gray mt-1">
              Solo enlace de YouTube. Se numeran solos: Calentamiento 1, 2, 3…
            </p>
          </div>
          {saving && (
            <span className="text-xs font-semibold text-depro-gray px-3 py-1.5">Guardando en la nube…</span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <Save size={13} /> Guardado en la base de datos
            </span>
          )}
        </div>
      )}
      {embedded && saving && (
        <span className="text-xs font-semibold text-depro-gray">Guardando en la nube…</span>
      )}
      {embedded && saved && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
          <Save size={13} /> Guardado en la base de datos
        </span>
      )}

      <div className="rounded-2xl border border-depro-border bg-depro-blue-light/30 p-4">
        <p className="text-sm font-bold text-depro-dark">{CLUB_SIN_BALON_INTRO.titulo}</p>
        <p className="text-xs text-depro-gray mt-1 leading-relaxed">{CLUB_SIN_BALON_INTRO.descripcion}</p>
        <p className="text-[11px] text-depro-gray mt-2">
          El entrenador ve este texto; no ve títulos inventados. El motor elige uno de los vídeos numerados.
        </p>
      </div>

      <div className="rounded-2xl border border-depro-border bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => { setDraftUrl(e.target.value); setError(""); }}
            placeholder="https://www.youtube.com/watch?v=…"
            className="flex-1 border border-depro-border rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={addWarmup}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold"
          >
            <Plus size={14} /> Añadir calentamiento
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="space-y-2">
        {preview.length === 0 && (
          <p className="text-sm text-depro-gray italic border border-dashed border-depro-border rounded-xl p-6 text-center">
            Todavía no hay calentamientos. Añade el enlace de YouTube.
          </p>
        )}
        {preview.map((item) => (
          <div key={item.id} className="rounded-xl border border-depro-border p-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-depro-dark min-w-[8.5rem]">{item.nombre}</span>
            <input
              type="url"
              value={item.videoUrl || item.video || ""}
              onChange={(e) => changeUrl(item.id, e.target.value)}
              className="flex-1 min-w-[12rem] border border-depro-border rounded-lg px-2 py-1.5 text-xs"
            />
            {(item.videoUrl || item.video) && (
              <a
                href={item.videoUrl || item.video}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-depro-blue"
              >
                <ExternalLink size={12} /> Ver
              </a>
            )}
            <button
              type="button"
              onClick={() => removeWarmup(item.id)}
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-red-600 hover:border-red-200"
              aria-label="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
