import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { LIBRARY_FOLDERS, LIBRARY_SIZE, libraryFolderLabel, listLibraryExercises } from "../../lib/exerciseLibrary";

/** Buscador + carpetas de toda la biblioteca. No aplica filtros del motor. */
export default function ExerciseLibraryPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [carpeta, setCarpeta] = useState("");
  const results = useMemo(
    () => listLibraryExercises({ carpeta, query }),
    [carpeta, query],
  );

  return (
    <div className="mt-2 rounded-xl border border-depro-blue/30 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-depro-dark">Seleccionar ejercicio</p>
        <button type="button" onClick={onClose} className="p-1 text-depro-gray hover:text-depro-dark" aria-label="Cerrar">
          <X size={14} />
        </button>
      </div>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-depro-gray" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar entre ${LIBRARY_SIZE} ejercicios`}
          className="admin-input w-full text-sm pl-8"
        />
      </div>
      <select
        value={carpeta}
        onChange={(e) => setCarpeta(e.target.value)}
        className="admin-input w-full text-sm"
        aria-label="Carpeta de ejercicios"
      >
        <option value="">Todas las carpetas</option>
        {LIBRARY_FOLDERS.map((folder) => (
          <option key={folder.id} value={folder.id}>{folder.label}</option>
        ))}
      </select>
      <p className="text-[11px] text-depro-gray">{results.length} ejercicios</p>
      <ul className="max-h-56 overflow-y-auto rounded-lg border border-depro-border divide-y divide-depro-border">
        {results.length === 0 && (
          <li className="px-3 py-4 text-xs text-depro-gray text-center">Ningún ejercicio coincide con la búsqueda.</li>
        )}
        {results.map((ex) => (
          <li key={ex.id}>
            <button
              type="button"
              onClick={() => onSelect(ex)}
              className="w-full text-left px-3 py-2 hover:bg-depro-blue-light"
            >
              <span className="block text-sm font-medium text-depro-dark">{ex.nombre}</span>
              <span className="block text-[11px] text-depro-gray">{libraryFolderLabel(ex.carpeta)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
