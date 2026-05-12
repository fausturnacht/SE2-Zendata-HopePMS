/**
 * @file App.tsx
 * @description Top-level application router for the HOPE PMS.
 *
 * Defines all client-side routes and wraps protected pages in an
 * authentication guard. Most protected routes are also wrapped in
 * `RootLayout` (sidebar + top nav), except `/api` which is a standalone
 * developer tool rendered without the standard shell.
 *
 * Route table:
 *   /              → Redirects to /dashboard
 *   /login         → Public login page (Google OAuth)
 *   /auth/callback → OAuth redirect handler (popup or full-page)
 *   /dashboard     → Dashboard with metrics & charts
 *   /products      → Product CRUD table (main feature)
 *   /deleted       → Archived/soft-deleted products (Admin/SuperAdmin)
 *   /api           → API Debugger (SuperAdmin only, no RootLayout)
 *   /reports       → Reports hub (REP-001, REP-002)
 *   /admin         → User management console (Admin/SuperAdmin)
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import ApiDebug from './pages/ApiDebug';
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';
import ReportsPage from './pages/reports/ReportsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import { RootLayout } from './layouts/RootLayout';
import DemoBanner from './components/DemoBanner';

import { useRights } from './contexts/UserRightsContext';

/**
 * Route guard that redirects unauthenticated users to `/login`.
 *
 * Displays a loading spinner while the auth session and user rights
 * are being resolved to prevent a flash of the login page on refresh.
 *
 * @param {{ children: React.ReactNode }} props - The protected page content.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const { loadingRights } = useRights();

  // Wait for both auth session AND rights to be resolved before deciding
  if (isLoading || loadingRights) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing session...</p>
        </div>
      </div>
    );
  }

  // If no authenticated user, redirect to login; otherwise render children
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * Root application component that defines the complete route tree.
 * All routes are either public (login, callback) or protected (everything else).
 */
function App() {
  return (
    <>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Routes — accessible without authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes — require authenticated session + resolved rights */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RootLayout>
              <Home />
            </RootLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <RootLayout>
              <ProductListPage />
            </RootLayout>
          </ProtectedRoute>
        } />
        <Route path="/deleted" element={
          <ProtectedRoute>
            <RootLayout>
              <DeletedItemsPage />
            </RootLayout>
          </ProtectedRoute>
        } />
        {/* ApiDebug intentionally omits RootLayout — it has its own full-page chrome */}
        <Route path="/api" element={
          <ProtectedRoute>
            <ApiDebug />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <RootLayout>
              <ReportsPage />
            </RootLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <RootLayout>
              <UserManagementPage />
            </RootLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <DemoBanner />
    </>
  );
}

export default App;