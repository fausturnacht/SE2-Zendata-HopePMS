import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { UserRightsProvider } from './contexts/UserRightsContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import ApiDebug from './pages/ApiDebug';
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';
import { RootLayout } from './layouts/RootLayout';

// Optimized Wrapper Route
// This prevents the context from unmounting/remounting on every page change
function ProtectedRouteWrapper() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If logged in, wrap the layout and provider ONCE. 
  // <Outlet /> acts as a placeholder where pages (Home, ProductList, etc.) will render.
  return currentUser ? (
    <UserRightsProvider>
      <RootLayout>
        <Outlet /> 
      </RootLayout>
    </UserRightsProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}

// Simple Wrapper for standalone pages
function SimpleProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
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

      {/* Protected Routes (Grouped together under the single wrapper!) */}
      <Route element={<ProtectedRouteWrapper />}>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/deleted" element={<DeletedItemsPage />} />
      </Route>

      {/* API Debug Route (Protected, but no Layout or Rights Provider needed) */}
      <Route path="/api" element={
        <SimpleProtectedRoute>
          <ApiDebug />
        </SimpleProtectedRoute>
      } />
    </Routes>
  );
}

export default App;