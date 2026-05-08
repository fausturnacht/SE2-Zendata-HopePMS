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
    setLocalError(null);
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
    <div className="relative flex min-h-screen items-center justify-center bg-surface p-4 font-sans overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <header className="absolute top-0 left-0 w-full flex items-center border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md px-6 py-3 z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/HOPE INC LOGO.png" 
            alt="Logo" 
            className="w-14 h-14 object-contain" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-black text-primary tracking-tighter italic">HOPE, Inc.</h1>
        </div>
        <div className="mx-4 h-6 border-l border-outline-variant/30"></div>
        <span className="text-sm font-medium text-on-surface-variant hidden sm:inline">Product Management System</span>
      </header>

      <main className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="rounded-[32px] bg-surface-container-lowest p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-outline-variant/20">
          <div className="flex justify-center mb-6">
            <img 
              src="/HOPE INC LOGO.png" 
              alt="HOPE INC. Logo" 
              className="h-20 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight text-center">Welcome Back</h2>
          <p className="mt-2 text-sm text-on-surface-variant mb-8 text-center">Sign in to access the Product Management System</p>

          {/* Warning Banner for Inactive Users */}
          {inactiveError && (
            <div className="mb-6 rounded-2xl border border-error/20 bg-error-container/10 p-4 text-sm text-error flex gap-3">
              <span className="text-lg">⚠</span>
              <span>{inactiveError}</span>
            </div>
          )}

          <GoogleAuthButton
            loading={loading}
            error={localError || undefined}
            onClick={handleGoogleLogin}
          />
          
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full flex flex-col sm:flex-row items-center justify-between px-8 py-6 text-[10px] sm:text-xs text-on-surface-variant/60 font-medium">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">HOPE INC. © 2026</div>
      </footer>
    </div>
  );
}