import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      // Get the session from Google
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Authentication failed' }, window.location.origin);
          window.close();
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // LOGIN GUARD: Check the user's status in the database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('record_status')
        .eq('userid', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Could not fetch profile' }, window.location.origin);
          window.close();
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // The Bouncer: Kick them out if INACTIVE
      if (profile?.record_status === 'INACTIVE') {
        await supabase.auth.signOut();
        const errorMessage = "Account pending approval. Please contact an administrator to activate your access.";
        
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: errorMessage }, window.location.origin);
          window.close();
        } else {
          navigate('/login', { 
            replace: true, 
            state: { error: errorMessage } 
          });
        }
        return;
      }

      // If they are ACTIVE, let them into the system
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_COMPLETE' }, window.location.origin);
        window.close();
      } else {
        navigate('/products', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="bg-surface text-on-surface flex flex-col items-center justify-center min-h-screen ivory-gradient selection:bg-primary-container selection:text-on-primary-container">
      <style>
        {`
          .loader {
            border: 3px solid #f0f4f7;
            border-top: 3px solid #1353d8;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .ivory-gradient {
            background: linear-gradient(180deg, #f7f9fb 0%, #f0f4f7 100%);
          }
        `}
      </style>
      <main className="flex flex-col items-center justify-center space-y-12 px-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-5 bg-surface-container-lowest rounded-xl shadow-[0px_40px_40px_rgba(42,52,57,0.06)] border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-6xl">account_balance</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface uppercase">
            HOPE PMS
          </h1>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <div className="loader"></div>
          <div className="text-center space-y-2">
            <p className="text-on-surface-variant font-medium tracking-tight">
              Initializing Secure Environment...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-on-secondary-fixed-variant">
                ACADEMIC INSTITUTION VERIFIED
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-12 w-full text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-outline-variant">
          INSTITUTIONAL ACCESS ONLY
        </p>
      </footer>
    </div>
  );
}