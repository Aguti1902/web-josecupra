import { BookOpen } from "lucide-react";
import AdminClubExercisesPage from "./AdminClubExercisesPage";

/** Catálogo de ejercicios de clubs: mismo contenido que individuales, etiquetado para el motor auto. */
export default function AdminClubCatalogPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-depro-dark flex items-center gap-2">
          <BookOpen size={22} className="text-depro-blue" /> Catálogo de ejercicios · Clubs
        </h1>
        <p className="text-sm text-depro-gray mt-0.5">
          Mismos ejercicios que las planificaciones individuales, agrupados por slot de plantilla
          (movilidad de cadera, tobillo/bisagra, glúteo, fuerza, pliometría…).
          El motor automático usa estas etiquetas para colocar cada ejercicio en Campo/Gym A·B·C.
        </p>
      </div>
      <AdminClubExercisesPage standalone />
    </div>
  );
}
