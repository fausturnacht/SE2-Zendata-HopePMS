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

import { useRights } from './contexts/UserRightsContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const { loadingRights } = useRights();

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

  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Default route redirects to Login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
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
  );
}

export default App;