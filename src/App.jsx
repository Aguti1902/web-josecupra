import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

// Public
import Navbar from "./components/public/Navbar";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";

// Private (client app)
import AppLayout from "./components/private/AppLayout";
import DashboardPage from "./pages/private/DashboardPage";
import WeeklyPlanPage from "./pages/private/WeeklyPlanPage";
import SessionLibraryPage from "./pages/private/SessionLibraryPage";
import TechniquePage from "./pages/private/TechniquePage";
import PhysicalPage from "./pages/private/PhysicalPage";
import FeedbackPage from "./pages/private/FeedbackPage";

// Admin panel
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminClientDetailPage from "./pages/admin/AdminClientDetailPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

/* ── Guards ───────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
}

function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
            : <LoginPage />
        }
      />

      {/* ── Client App ─────────────────────────────────────────── */}
      <Route path="/dashboard" element={<ClientRoute><AppLayout><DashboardPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/plan" element={<ClientRoute><AppLayout><WeeklyPlanPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/library" element={<ClientRoute><AppLayout><SessionLibraryPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/technique" element={<ClientRoute><AppLayout><TechniquePage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/physical" element={<ClientRoute><AppLayout><PhysicalPage /></AppLayout></ClientRoute>} />
      <Route path="/dashboard/feedback" element={<ClientRoute><AppLayout><FeedbackPage /></AppLayout></ClientRoute>} />

      {/* ── Admin Panel ────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminOverviewPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clients" element={<AdminRoute><AdminLayout><AdminClientsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/clients/:id" element={<AdminRoute><AdminLayout><AdminClientDetailPage /></AdminLayout></AdminRoute>} />
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
          <AppRoutes />
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
