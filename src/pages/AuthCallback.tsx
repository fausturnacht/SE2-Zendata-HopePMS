import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      // Supabase automatically reads the Google token from the URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Authentication failed:', error.message);
        navigate('/login', { replace: true });
        return;
      }

      if (session) {
        // Success! Send them to the main system
        navigate('/products', { replace: true });
      } else {
        // If something weird happened and there's no session, kick them back to login
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="text-sm text-gray-500">Securing your academic environment</p>
      </div>
    </div>
  );
}