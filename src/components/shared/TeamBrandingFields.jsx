import { useRef, useState } from "react";
import { ImagePlus, Palette } from "lucide-react";
import { compressImage } from "../../lib/imageCompress";

/**
 * Escudo + colores para registro / setup de entrenador (o club).
 */
export default function TeamBrandingFields({
  logo = "",
  primaryColor = "#0A36F7",
  secondaryColor = "#ffffff",
  onChange,
  title = "Escudo y colores del equipo",
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const patch = (partial) => onChange?.({ logo, primaryColor, secondaryColor, ...partial });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Sube una imagen (PNG, JPG o WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErr("La imagen es demasiado grande (máx. 8 MB).");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const dataUrl = await compressImage(file, 400, 0.85);
      patch({ logo: dataUrl });
    } catch {
      setErr("No se pudo procesar la imagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Palette size={14} className="text-depro-blue" />
        <p className="text-xs font-bold text-depro-gray uppercase tracking-wide">{title}</p>
      </div>

      <div className="grid sm:grid-cols-[120px_1fr] gap-4 items-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="aspect-square w-full max-w-[120px] rounded-xl border-2 border-dashed border-depro-border bg-white flex flex-col items-center justify-center gap-1.5 hover:border-depro-blue transition-colors overflow-hidden"
        >
          {logo ? (
            <img src={logo} alt="Escudo" className="w-full h-full object-contain p-2" />
          ) : (
            <>
              <ImagePlus size={22} className="text-depro-gray" />
              <span className="text-[11px] font-semibold text-depro-gray px-2 text-center">
                {busy ? "Subiendo…" : "Subir escudo"}
              </span>
            </>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-depro-gray uppercase mb-1 block">Color principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor || "#0A36F7"}
                onChange={(e) => patch({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-depro-border cursor-pointer"
              />
              <input
                className="admin-input flex-1 font-mono uppercase text-sm"
                value={primaryColor || "#0A36F7"}
                onChange={(e) => patch({ primaryColor: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-depro-gray uppercase mb-1 block">Color secundario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor || "#ffffff"}
                onChange={(e) => patch({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-depro-border cursor-pointer"
              />
              <input
                className="admin-input flex-1 font-mono uppercase text-sm"
                value={secondaryColor || "#ffffff"}
                onChange={(e) => patch({ secondaryColor: e.target.value })}
              />
            </div>
          </div>
          {logo && (
            <button
              type="button"
              onClick={() => patch({ logo: "" })}
              className="text-xs font-semibold text-depro-gray hover:text-red-600"
            >
              Quitar escudo
            </button>
          )}
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <p className="text-[11px] text-depro-gray">
        Opcional. El escudo y los colores aparecerán en tu panel y en la identidad del equipo.
      </p>
    </div>
  );
}

export const COACH_BRANDING_STORAGE_KEY = "depro_coach_branding_v1";

export function saveCoachBrandingDraft(branding) {
  try {
    // localStorage: sobrevive al redirect de Stripe (sessionStorage a veces se pierde)
    localStorage.setItem(COACH_BRANDING_STORAGE_KEY, JSON.stringify(branding || {}));
  } catch { /* quota */ }
}

export function loadCoachBrandingDraft() {
  try {
    const raw = localStorage.getItem(COACH_BRANDING_STORAGE_KEY)
      || sessionStorage.getItem(COACH_BRANDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCoachBrandingDraft() {
  try {
    localStorage.removeItem(COACH_BRANDING_STORAGE_KEY);
    sessionStorage.removeItem(COACH_BRANDING_STORAGE_KEY);
  } catch { /* ignore */ }
}
