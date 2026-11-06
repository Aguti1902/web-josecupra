import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { LIBRARY_FOLDERS, LIBRARY_SIZE, libraryFolderLabel, listLibraryExercises } from "../../lib/exerciseLibrary";

function ExerciseRow({ exercise, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(exercise)}
      className="w-full text-left px-3 py-2 hover:bg-depro-blue-light"
    >
      <span className="block text-sm font-medium text-depro-dark">{exercise.nombre}</span>
      <span className="block text-[11px] text-depro-gray">{libraryFolderLabel(exercise.carpeta)}</span>
    </button>
  );
}

/** Buscador + carpetas de toda la biblioteca. No aplica filtros del motor. */
export default function ExerciseLibraryPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [openFolder, setOpenFolder] = useState("");
  const results = useMemo(
    () => listLibraryExercises({ query }),
    [query],
  );
  const searching = query.trim().length > 0;
  const grouped = useMemo(() => (
    LIBRARY_FOLDERS
      .map((folder) => ({
        ...folder,
        exercises: results.filter((ex) => ex.carpeta === folder.id),
      }))
      .filter((folder) => folder.exercises.length > 0)
  ), [results]);

  return (
    <div className="mt-2 rounded-xl border border-depro-blue/30 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-depro-dark">Seleccionar ejercicio</p>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1 text-depro-gray hover:text-depro-dark" aria-label="Cerrar">
            <X size={14} />
          </button>
        )}
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
      <p className="text-[11px] text-depro-gray">{results.length} ejercicios</p>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-depro-border">
        {results.length === 0 && (
          <p className="px-3 py-4 text-xs text-depro-gray text-center">Ningún ejercicio coincide con la búsqueda.</p>
        )}
        {searching ? (
          <ul className="divide-y divide-depro-border">
            {results.map((ex) => (
              <li key={ex.id}><ExerciseRow exercise={ex} onSelect={onSelect} /></li>
            ))}
          </ul>
        ) : (
          grouped.map((folder) => {
            const open = openFolder === folder.id;
            return (
              <div key={folder.id} className="border-b border-depro-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenFolder(open ? "" : folder.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-depro-gray-light"
                >
                  <span className="text-xs font-bold text-depro-dark">{folder.label}</span>
                  <span className="flex items-center gap-1 text-[11px] text-depro-gray">
                    {folder.exercises.length}
                    <ChevronDown size={13} className={open ? "rotate-180" : ""} />
                  </span>
                </button>
                {open && (
                  <ul className="divide-y divide-depro-border bg-depro-gray-light/50">
                    {folder.exercises.map((ex) => (
                      <li key={ex.id}><ExerciseRow exercise={ex} onSelect={onSelect} /></li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
