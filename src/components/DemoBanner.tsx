/**
 * @file components/DemoBanner.tsx
 * @description Persistent toolbar for the Demo Version to switch roles and indicate sandbox mode.
 */
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function DemoBanner() {
  const { currentUser, signOut } = useAuth();
  const [switching, setSwitching] = useState(false);

  // Only show if the user is a demo user
  const isDemoUser = currentUser?.email?.endsWith('@demo.hope.com');

  if (!isDemoUser) return null;

  const handleSwitchRole = async (email: string) => {
    setSwitching(true);
    try {
      // Sign out first to clear session
      await supabase.auth.signOut();
      
      // Sign in as the new role
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'demo-password-123',
      });

      if (error) throw error;
      
      // Refresh the page to reset all contexts
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch role:', err);
      alert('Failed to switch role. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
      <div className="bg-primary/95 backdrop-blur-md text-on-primary px-6 py-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-primary-container/20">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-on-primary text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold leading-tight uppercase tracking-widest opacity-80">Demo Environment</p>
            <p className="text-[10px] font-medium opacity-60">You are currently exploring as <span className="underline decoration-dotted">{currentUser?.email}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-2 hidden lg:inline">Switch Role:</span>
          
          <button 
            onClick={() => handleSwitchRole('admin@demo.hope.com')}
            disabled={switching || currentUser?.email === 'admin@demo.hope.com'}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-on-primary/10 hover:bg-on-primary/20 disabled:bg-on-primary/30 disabled:opacity-50"
          >
            ADMIN
          </button>
          
          <button 
            onClick={() => handleSwitchRole('manager@demo.hope.com')}
            disabled={switching || currentUser?.email === 'manager@demo.hope.com'}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-on-primary/10 hover:bg-on-primary/20 disabled:bg-on-primary/30 disabled:opacity-50"
          >
            MANAGER
          </button>
          
          <button 
            onClick={() => handleSwitchRole('staff@demo.hope.com')}
            disabled={switching || currentUser?.email === 'staff@demo.hope.com'}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-on-primary/10 hover:bg-on-primary/20 disabled:bg-on-primary/30 disabled:opacity-50"
          >
            STAFF
          </button>

          <div className="mx-2 h-4 border-l border-on-primary/20"></div>

          <button 
            onClick={() => signOut()}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-error-container text-on-error-container hover:brightness-110 transition-all"
          >
            EXIT DEMO
          </button>
        </div>
      </div>
    </div>
  );
}
