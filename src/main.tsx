/**
 * @file main.tsx
 * @description Application entry point for the HOPE PMS (Product Management System).
 *
 * Mounts the React component tree into the DOM with the following provider hierarchy:
 *   StrictMode → BrowserRouter → AuthProvider → UserRightsProvider → App
 *
 * Provider ordering is critical:
 *   - BrowserRouter must wrap everything that uses react-router hooks.
 *   - AuthProvider supplies the authenticated Supabase user session.
 *   - UserRightsProvider depends on AuthContext (via useAuth) to fetch
 *     per-user module rights, so it MUST be nested inside AuthProvider.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserRightsProvider } from './contexts/UserRightsContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* AuthProvider must wrap UserRightsProvider because rights-fetching depends on the current user session */}
      <AuthProvider>
        <UserRightsProvider>
          <App />
        </UserRightsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
