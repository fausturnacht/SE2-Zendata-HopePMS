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
      <AuthProvider>
        <UserRightsProvider>
          <App />
        </UserRightsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
