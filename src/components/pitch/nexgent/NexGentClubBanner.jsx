import { LAKERS } from "../../../lib/nexgentConfig";

function contrastText(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#111827" : "#ffffff";
}

export default function NexGentClubBanner({ team = LAKERS.team, role = "Entrenador", banner = null }) {
  const accent = LAKERS.accent;
  const secondary = LAKERS.secondary;
  const hasBanner = !!banner;
  const textColor = hasBanner ? "#ffffff" : contrastText(accent);
  const mutedColor = hasBanner ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.85)";

  return (
    <div
      className="rounded-2xl overflow-hidden relative shadow-card"
      style={{
        background: hasBanner
          ? `linear-gradient(135deg, rgba(85,37,131,0.92), rgba(55,20,90,0.88)), url(${banner}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent} 0%, #37145a 100%)`,
        minHeight: "128px",
      }}
    >
      <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <img src={LAKERS.logo} alt={LAKERS.shortName} className="w-16 h-16 rounded-xl object-contain bg-white p-1.5 flex-shrink-0 shadow-lg" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: mutedColor }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2 className="text-2xl font-black truncate" style={{ color: textColor }}>{LAKERS.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedColor }}>Purple & Gold · {LAKERS.city}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: textColor }}>
              {role}
            </span>
            <span className="text-sm font-medium" style={{ color: mutedColor }}>· {team}</span>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: secondary, color: "#552583" }}>
          Semana 24
        </div>
      </div>
    </div>
  );
}
