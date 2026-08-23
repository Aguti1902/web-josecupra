import { useSearchParams, Navigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import AdminCatalogPage from "./AdminCatalogPage";

/** Catálogo de planificaciones individuales (sin pestaña ProCoach). */
export default function AdminExerciseLibraryPage() {
  const [params] = useSearchParams();
  if (params.get("tab") === "coach") {
    return <Navigate to="/admin/club-catalog" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-depro-dark flex items-center gap-2">
          <BookOpen size={22} className="text-depro-blue" /> Catálogo de ejercicios
        </h1>
        <p className="text-sm text-depro-gray mt-0.5">
          Planificaciones individuales. El mismo listado, con etiquetas de plantilla club, está en
          {" "}Clubs · Contenido → Catálogo ejercicios.
        </p>
      </div>
      <AdminCatalogPage embedded />
    </div>
  );
}
