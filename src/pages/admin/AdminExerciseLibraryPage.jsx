import { useSearchParams } from "react-router-dom";
import { BookOpen, Dumbbell } from "lucide-react";
import AdminCatalogPage from "./AdminCatalogPage";
import AdminCoachLibraryPage from "./AdminCoachLibraryPage";

/** Biblioteca unificada: catálogo jugadores + DEPRO Coach */
export default function AdminExerciseLibraryPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "coach" ? "coach" : "players";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Biblioteca de ejercicios</h1>
          <p className="text-sm text-depro-gray mt-0.5">
            Un solo lugar para el catálogo de planes de jugadores y la biblioteca del motor DEPRO Coach
          </p>
        </div>
        <div className="flex gap-1 bg-depro-gray-light p-1 rounded-xl w-fit shrink-0">
          <button
            type="button"
            onClick={() => setParams({})}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "players" ? "bg-white text-depro-dark shadow-sm" : "text-depro-gray hover:text-depro-dark"
            }`}
          >
            <BookOpen size={14} /> Plan jugadores
          </button>
          <button
            type="button"
            onClick={() => setParams({ tab: "coach" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "coach" ? "bg-white text-depro-dark shadow-sm" : "text-depro-gray hover:text-depro-dark"
            }`}
          >
            <Dumbbell size={14} /> DEPRO Coach
          </button>
        </div>
      </div>

      {tab === "coach" ? <AdminCoachLibraryPage embedded /> : <AdminCatalogPage embedded />}
    </div>
  );
}
