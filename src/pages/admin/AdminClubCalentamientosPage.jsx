import { useMemo, useState } from "react";
import { Flame, Save } from "lucide-react";
import { CLUB_GENERAL_WARMUPS, CLUB_BALL_WARMUPS } from "../../data/clubAutoCatalog";

const STORAGE_KEY = "depro_club_warmup_overrides";

const TIPO_LABELS = {
  rondo: "Rondos",
  rueda_pases: "Ruedas de pases",
  circuito: "Circuitos",
  posiciones: "Trabajo de posiciones",
  pases: "Ejercicios de pases",
};

function readOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function Tag({ children }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-dark border border-depro-border">
      {children}
    </span>
  );
}

function WarmupRow({ item, override, onChange }) {
  const nombre = override?.nombre ?? item.nombre;
  const tags = override?.tags ?? null;
  const tipo = tags?.tipo ?? item.tipo;
  const nivel = tags?.nivel ?? (Array.isArray(item.nivel) ? item.nivel.join("/") : item.nivel);
  const intensidad = tags?.intensidad ?? item.intensidad;

  return (
    <div className="rounded-xl border border-depro-border p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={nombre}
            onChange={(e) => onChange(item.id, { nombre: e.target.value })}
            className="w-full text-sm font-semibold text-depro-dark border border-transparent hover:border-depro-border focus:border-depro-blue rounded-lg px-2 py-1 focus:outline-none"
          />
          <p className="text-[11px] text-depro-gray mt-0.5 px-2">{item.descripcion || item.duracion}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {tipo && <Tag>tipo · {tipo}</Tag>}
          {nivel && <Tag>nivel · {nivel}</Tag>}
          {intensidad && <Tag>intensidad · {intensidad}</Tag>}
          {item.duracion && <Tag>{item.duracion}</Tag>}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 px-2">
        <label className="text-[10px] text-depro-gray">
          Tipo
          <input
            type="text"
            value={tipo || ""}
            onChange={(e) => onChange(item.id, { tags: { ...(override?.tags || {}), tipo: e.target.value, nivel, intensidad } })}
            className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs"
          />
        </label>
        <label className="text-[10px] text-depro-gray">
          Nivel
          <input
            type="text"
            value={nivel || ""}
            onChange={(e) => onChange(item.id, { tags: { ...(override?.tags || {}), tipo, nivel: e.target.value, intensidad } })}
            className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs"
          />
        </label>
        <label className="text-[10px] text-depro-gray">
          Intensidad
          <input
            type="text"
            value={intensidad || ""}
            onChange={(e) => onChange(item.id, { tags: { ...(override?.tags || {}), tipo, nivel, intensidad: e.target.value } })}
            className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs"
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminClubCalentamientosPage() {
  const [overrides, setOverrides] = useState(() => readOverrides());
  const [saved, setSaved] = useState(false);

  const ballGroups = useMemo(() => {
    const map = new Map();
    for (const item of CLUB_BALL_WARMUPS) {
      const key = item.tipo || item.carpeta || "otros";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return [...map.entries()];
  }, []);

  const changeItem = (id, patch) => {
    setOverrides((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          ...patch,
          tags: patch.tags ? { ...(prev[id]?.tags || {}), ...patch.tags } : prev[id]?.tags,
        },
      };
      writeOverrides(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark flex items-center gap-2">
            <Flame size={22} className="text-orange-500" />
            Calentamientos club auto
          </h1>
          <p className="text-sm text-depro-gray mt-1">
            Movilidad general y calentamientos con balón. Puedes editar nombre y etiquetas (local).
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
            <Save size={13} /> Guardado
          </span>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-bold text-depro-dark">Calentamientos generales (movilidad)</h2>
        <p className="text-xs text-depro-gray">Carpeta · /calentamientos_generales</p>
        <div className="space-y-2">
          {CLUB_GENERAL_WARMUPS.map((item) => (
            <WarmupRow
              key={item.id}
              item={{ ...item, tipo: "movilidad", intensidad: "baja", nivel: "A/B/C" }}
              override={overrides[item.id]}
              onChange={changeItem}
            />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-bold text-depro-dark">Calentamientos con balón</h2>
        {ballGroups.map(([tipo, items]) => (
          <div key={tipo} className="space-y-2">
            <h3 className="text-sm font-bold text-depro-blue">
              {TIPO_LABELS[tipo] || tipo}
              <span className="text-depro-gray font-normal ml-2 text-xs">{items[0]?.carpeta}</span>
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <WarmupRow
                  key={item.id}
                  item={item}
                  override={overrides[item.id]}
                  onChange={changeItem}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
