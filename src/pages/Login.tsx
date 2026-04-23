import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  
  // Catch the error state sent from the AuthCallback guard
  const location = useLocation();
  const inactiveError = location.state?.error;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error with Google Login:', error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] font-sans">
      <header className="flex items-center border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight text-blue-600">HOPE, INC.</h1>
        <div className="mx-4 h-6 border-l border-gray-300"></div>
        <span className="text-sm font-medium text-gray-500">Product Management System</span>
      </header>

      <main className="flex flex-grow flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[24px] bg-white p-10 shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
          <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
          <p className="mt-2 text-sm text-gray-500 mb-8">Log in with your Google account</p>

          {/* Yellow Warning Banner for Inactive Users */}
          {inactiveError && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              {inactiveError}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span>Redirecting...</span>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
        
        <p className="mt-8 text-xs font-semibold tracking-widest text-gray-400">
          SECURE ACADEMIC ENVIRONMENT
        </p>
      </main>

      <footer className="flex items-center justify-between px-8 py-6 text-xs text-gray-400">
        <div>New Era University © 2026</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-600 transition-colors">PRIVACY POLICY</a>
          <a href="#" className="hover:text-gray-600 transition-colors">INSTITUTIONAL TERMS</a>
          <a href="#" className="hover:text-gray-600 transition-colors">RESEARCH ARCHIVE</a>
        </div>
      </footer>
    </div>
  );
}