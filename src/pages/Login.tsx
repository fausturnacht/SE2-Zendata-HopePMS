import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Catch the error state sent from the AuthCallback guard
  const location = useLocation();
  const inactiveError = location.state?.error || localError;

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('Error with Google Login:', error.message);
      setLocalError('Unable to connect. Please check your network.');
      setLoading(false);
      return;
    }

    if (data?.url) {
      // Calculate popup position
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.url,
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        alert('Popup blocked! Please allow popups for this site.');
        setLoading(false);
        return;
      }

      // Listener for completion message from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'AUTH_COMPLETE') {
          window.removeEventListener('message', handleMessage);
          navigate('/products');
        } else if (event.data?.type === 'AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          setLoading(false);
          if (event.data.error) {
            setLocalError(event.data.error);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup if popup is closed manually
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
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
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500 mb-8">Sign in to access your research portal</p>

          {/* Yellow Warning Banner for Inactive Users */}
          {inactiveError && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              {inactiveError}
            </div>
          )}

          <GoogleAuthButton
            loading={loading}
            error={localError || undefined}
            onClick={handleGoogleLogin}
          />
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