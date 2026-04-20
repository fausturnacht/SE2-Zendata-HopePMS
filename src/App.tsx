import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    // Notice the <Router> wrapper is gone, we just return <Routes> directly
    <Routes>
      {/* Default route redirects to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected System Routes (Placeholder for now) */}
      <Route path="/products" element={<div>Products Dashboard (Protected)</div>} />
    </Routes>
  );
}

export default App;