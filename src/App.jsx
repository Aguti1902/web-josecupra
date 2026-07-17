import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ViewProvider } from "./context/ViewContext";
import PWAInstallBanner from "./components/PWAInstallBanner";

// Public — web marketing Holded-style
import HoldedShell from "./components/public/holded/HoldedShell";
import HomePage from "./pages/public/HomePage";
import FeaturesPage from "./pages/public/FeaturesPage";
import ParaClubsPage from "./pages/public/ParaClubsPage";
import ParaEntrenadoresPage from "./pages/public/ParaEntrenadoresPage";
import ParaJugadoresPage from "./pages/public/ParaJugadoresPage";
import PricingPage from "./pages/public/PricingPage";
import ResourcesPage from "./pages/public/ResourcesPage";
import LoginPage from "./pages/public/LoginPage";
import OnboardingPage from "./pages/public/OnboardingPage";
import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";
import USClubPitchPage from "./pages/public/USClubPitchPage";
import NexGentLauncherPage from "./pages/public/NexGentLauncherPage";
import NexGentPitchPage from "./pages/public/NexGentPitchPage";
import NexGentPresentationPage from "./pages/public/NexGentPresentationPage";
import NexGentDemoPage from "./pages/public/NexGentDemoPage";

// Private (client app)
import AppLayout from "./components/private/AppLayout";
import DashboardPage from "./pages/private/DashboardPage";
import WeeklyPlanPage from "./pages/private/WeeklyPlanPage";
import SessionLibraryPage from "./pages/private/SessionLibraryPage";
import TechniquePage from "./pages/private/TechniquePage";
import PhysicalPage from "./pages/private/PhysicalPage";
import FeedbackPage from "./pages/private/FeedbackPage";
import RankingPage from "./pages/private/RankingPage";
import TacticalGuidePage from "./pages/private/TacticalGuidePage";
import SquadPage from "./pages/private/SquadPage";
import MesocyclePage from "./pages/private/MesocyclePage";
import ProfilePage from "./pages/private/ProfilePage";
import ClubProfilePage from "./pages/private/ClubProfilePage";
import TeamTestsPage from "./pages/private/TeamTestsPage";
import CargasPage from "./pages/private/CargasPage";
import CoachOnboardingPage from "./pages/private/CoachOnboardingPage";
import ClubOnboardingPage from "./pages/private/ClubOnboardingPage";
import ClubSettingsPage from "./pages/private/ClubSettingsPage";

// Admin panel
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminClientDetailPage from "./pages/admin/AdminClientDetailPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminPlanBuilderPage from "./pages/admin/AdminPlanBuilderPage";
import AdminClubsManagerPage from "./pages/admin/AdminClubsManagerPage";
import AdminClubDetailPage from "./pages/admin/AdminClubDetailPage";
import AdminPlanificacionPage from "./pages/admin/AdminPlanificacionPage";
import AdminTestsPage from "./pages/admin/AdminTestsPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminCoachLibraryPage from "./pages/admin/AdminCoachLibraryPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

/* ── Guards ───────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <img src="/logo.png" alt="DEPRO" className="h-10 w-auto opacity-80" />
      <div className="spinner border-depro-blue/20 border-t-depro-blue" />
    </div>
  );
}

function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const viewAs = typeof sessionStorage !== "undefined" && sessionStorage.getItem("depro_view_as");
  if (user.role === "admin" && !viewAs) return <Navigate to="/admin" replace />;
  // Entrenador individual sin alta completada → wizard de configuración
  if (user.role === "coach") return <Navigate to="/dashboard/coach-setup" replace />;
  // Club comprado sin clubId → wizard de alta self-service
  if (user.role === "club" && !user.clubId && !user?.club?.isSoloCoach) {
    return <Navigate to="/dashboard/club-setup" replace />;
  }
  return children;
}

function CoachSetupRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "coach") return <Navigate to="/dashboard" replace />;
  return children;
}

function ClubSetupRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "club" || user.clubId) return <Navigate to="/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function FeatureDetailRoute() {
  const { slug } = useParams();
  return <FeaturesPage slug={slug} />;
}

function PublicLayout({ children }) {
  return <HoldedShell>{children}</HoldedShell>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────── */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/funcionalidades" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
      <Route path="/funcionalidades/:slug" element={<PublicLayout><FeatureDetailRoute /></PublicLayout>} />
      <Route path="/para-clubs" element={<PublicLayout><ParaClubsPage /></PublicLayout>} />
      <Route path="/para-entrenadores" element={<PublicLayout><ParaEntrenadoresPage /></PublicLayout>} />
      <Route path="/para-jugadores" element={<PublicLayout><ParaJugadoresPage /></PublicLayout>} />
      <Route path="/precios" element={<PublicLayout><PricingPage /></PublicLayout>} />
      <Route path="/recursos" element={<PublicLayout><ResourcesPage /></PublicLayout>} />
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
            : <LoginPage />
        }
      />
      <Route path="/comprar" element={<OnboardingPage />} />
      <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
      <Route path="/us-clubs" element={<USClubPitchPage variant="partner" />} />
      <Route path="/clubs" element={<USClubPitchPage variant="client" />} />
      <Route path="/nexgent" element={<NexGentLauncherPage />} />
      <Route path="/nexgent/pitch" element={<NexGentPitchPage />} />
      <Route path="/nexgent/presentacion" element={<NexGentPresentationPage />} />
      <Route path="/nexgent/demo" element={<NexGentDemoPage />} />

      {/* ── Client App ─────────────────────────────────────────── */}
      <Route path="/dashboard/coach-setup" element={<CoachSetupRoute><CoachOnboardingPage /></CoachSetupRoute>} />
      <Route path="/dashboard/club-setup" element={<ClubSetupRoute><ClubOnboardingPage /></ClubSetupRoute>} />
      <Route path="/dashboard" element={<ClientRoute><AppLayout><DashboardPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/plan" element={<ClientRoute><AppLayout><WeeklyPlanPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/library" element={<ClientRoute><AppLayout><SessionLibraryPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/technique" element={<ClientRoute><AppLayout><TechniquePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/physical" element={<ClientRoute><AppLayout><PhysicalPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/feedback" element={<ClientRoute><AppLayout><FeedbackPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/ranking" element={<ClientRoute><AppLayout><RankingPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/tactics" element={<ClientRoute><AppLayout><TacticalGuidePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/squad" element={<ClientRoute><AppLayout><SquadPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/mesocycle" element={<ClientRoute><AppLayout><MesocyclePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/profile"      element={<ClientRoute><AppLayout><ProfilePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/team-tests"   element={<ClientRoute><AppLayout><TeamTestsPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/cargas"       element={<ClientRoute><AppLayout><CargasPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/club-profile" element={<ClientRoute><AppLayout><ClubProfilePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/club-settings" element={<ClientRoute><AppLayout><ClubSettingsPage /></AppLayout></ClientRoute>} />

      {/* ── Admin Panel ────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminOverviewPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clients" element={<AdminRoute><AdminLayout><AdminClientsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clients/:id" element={<AdminRoute><AdminLayout><AdminClientDetailPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/plan-builder" element={<AdminRoute><AdminLayout><AdminPlanBuilderPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clubs" element={<AdminRoute><AdminLayout><AdminClubsManagerPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clubs/:id" element={<AdminRoute><AdminLayout><AdminClubDetailPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/planificacion" element={<AdminRoute><AdminLayout><AdminPlanificacionPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/tests" element={<AdminRoute><AdminLayout><AdminTestsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/catalog" element={<AdminRoute><AdminLayout><AdminCatalogPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coach-library" element={<AdminRoute><AdminLayout><AdminCoachLibraryPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettingsPage /></AdminLayout></AdminRoute>} />

      {/* ── Fallback ───────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <ViewProvider>
            <AppRoutes />
            <PWAInstallBanner />
          </ViewProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
