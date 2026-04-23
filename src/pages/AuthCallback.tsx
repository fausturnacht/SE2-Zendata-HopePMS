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
        navigate('/login', { replace: true });
        return;
      }

      // LOGIN GUARD: Check the user's status in the database
      // Using 'userid' to match specific table schema
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('record_status')
        .eq('userid', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        // Fallback to login if the database check fails
        navigate('/login', { replace: true });
        return;
      }

      // The Bouncer: Kick them out if INACTIVE
      if (profile?.record_status === 'INACTIVE') {
        await supabase.auth.signOut();
        // Send them back to login with a hidden error state
        navigate('/login', { 
          replace: true, 
          state: { error: "Account pending approval. Please contact an administrator to activate your access." } 
        });
        return;
      }

      // If they are ACTIVE, let them into the system
      navigate('/dashboard', { replace: true });
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <h2 className="text-xl font-semibold text-gray-900">Verifying Access...</h2>
        <p className="text-sm text-gray-500">Checking security clearances</p>
      </div>
    </div>
  );
}