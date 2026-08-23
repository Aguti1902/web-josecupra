import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canSeeClubEconomy } from "../../lib/clubRoles";
import ClubEconomyPanel from "../../components/private/ClubEconomyPanel";

export default function ClubEconomyPage() {
  const { user } = useAuth();
  if (!canSeeClubEconomy(user) || user?.club?.isSoloCoach) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="dash-page space-y-6">
      <div>
        <h1 className="text-2xl font-black text-depro-dark">Economía</h1>
        <p className="text-sm text-depro-gray mt-0.5">
          Cuota del club, código de descuento y comisiones de planificaciones individuales.
        </p>
      </div>
      <ClubEconomyPanel club={user?.club} />
    </div>
  );
}
