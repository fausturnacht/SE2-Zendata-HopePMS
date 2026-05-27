/**
 * @file pages/Login.tsx
 * @description Authentication entry page with Google OAuth sign-in.
 *
 * Authentication flow (popup-based):
 *   1. User clicks the Google sign-in button
 *   2. A popup window opens to the Supabase OAuth provider
 *   3. After authentication, the popup redirects to `/auth/callback`
 *   4. AuthCallback processes the session and posts a message back to this page
 *   5. This page listens for `AUTH_COMPLETE` or `AUTH_ERROR` messages
 *   6. On success, navigates to `/dashboard`
 *
 * Error handling:
 *   - If the user's account is INACTIVE, AuthCallback redirects back here
 *     with `location.state.error` set (the "LOGIN GUARD" rejection).
 *   - Any OAuth errors from the popup are received via `window.postMessage`.
 *
 * @see {@link ./AuthCallback.tsx} — Processes the OAuth redirect
 * @see {@link ../components/GoogleAuthButton.tsx} — The sign-in button component
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Catch the error state sent from the AuthCallback LOGIN GUARD
  // when an INACTIVE user is rejected during the auth flow
  const location = useLocation();
  const inactiveError = location.state?.error || localError;

  // Auto-redirect authenticated users away from the login page
  useEffect(() => {
    if (!isLoading && currentUser) {
      navigate('/products', { replace: true });
    }
  }, [currentUser, isLoading, navigate]);

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

  const handleDemoLogin = async (email: string) => {
    console.log(`[DemoLogin] Attempting login for: ${email}`);
    setLocalError(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: import.meta.env.VITE_DEMO_PASSWORD || 'demo-password-123', 
      });

      if (error) {
        console.error('[DemoLogin] Supabase Auth Error:', error.message);
        let msg = `Login failed: ${error.message}`;
        
        // Connectivity Check
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          msg = 'Connection Error: Attempting to ping Supabase server...';
          setLocalError(msg);
          
          try {
            const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/"/g, "").trim().replace(/\/$/, "");
            const ping = await fetch(`${baseUrl}/auth/v1/health`);
            if (ping.ok) {
              console.log('[Supabase] Server is reachable. The error is likely in Auth settings.');
              setLocalError('Auth Error: Server is reachable but the request was blocked. Check if Email login is enabled.');
            } else {
              setLocalError('Network Error: Supabase server returned an error. Check project status.');
            }
          } catch (pingErr) {
            console.error('[Supabase] Server is NOT reachable:', pingErr);
            setLocalError('Network Error: Cannot reach Supabase server. Check your internet or ad-blocker.');
          }
        } else {
          setLocalError(msg);
        }
        setLoading(false);
        return;
      }

      console.log('[DemoLogin] Success! User authenticated:', data.user?.id);
      
      // Explicitly set loading false before navigating to avoid UI hang
      setLoading(false);
      navigate('/products');
    } catch (err: any) {
      console.error('[DemoLogin] Unexpected Exception:', err);
      setLocalError('An unexpected error occurred. Check browser console.');
      setLoading(false);
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

          <div className="mt-10">
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Or Explore Demo</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDemoLogin('admin@demo.hope.com')}
                disabled={loading}
                className="flex items-center justify-between px-6 py-4 rounded-2xl bg-surface-container-high hover:bg-primary/5 border border-outline-variant/20 transition-all group active:scale-[0.98]"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-on-surface">Super Admin</span>
                  <span className="text-[10px] text-on-surface-variant">Full access & user management</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('manager@demo.hope.com')}
                disabled={loading}
                className="flex items-center justify-between px-6 py-4 rounded-2xl bg-surface-container-high hover:bg-primary/5 border border-outline-variant/20 transition-all group active:scale-[0.98]"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-on-surface">Product Manager</span>
                  <span className="text-[10px] text-on-surface-variant">Edit products & view reports</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('staff@demo.hope.com')}
                disabled={loading}
                className="flex items-center justify-between px-6 py-4 rounded-2xl bg-surface-container-high hover:bg-primary/5 border border-outline-variant/20 transition-all group active:scale-[0.98]"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-on-surface">General Staff</span>
                  <span className="text-[10px] text-on-surface-variant">Standard view-only access</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
              </button>
            </div>
          </div>
          
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full flex flex-col sm:flex-row items-center justify-between px-8 py-6 text-[10px] sm:text-xs text-on-surface-variant/60 font-medium">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">HOPE INC. © 2026</div>
      </footer>
    </div>
  );
}