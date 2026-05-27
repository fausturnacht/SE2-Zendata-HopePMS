/**
 * @file components/DemoBanner.tsx
 * @description Persistent toolbar for the Demo Version to switch roles and indicate sandbox mode.
 */
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, User, LogOut, ChevronUp, ChevronDown } from 'lucide-react';

export default function DemoBanner() {
  const { currentUser, signOut } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Only show if the user is a demo user
  const isDemoUser = currentUser?.email?.endsWith('@demo.hope.com');

  if (!isDemoUser) return null;

  const handleSwitchRole = async (email: string) => {
    setSwitching(true);
    try {
      // Sign in directly as the new role to avoid intermediate null session state which triggers /login redirect
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: import.meta.env.VITE_DEMO_PASSWORD || '',
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

  let roleLabel = 'General Staff';
  let roleText = 'STAFF';
  let RoleIcon = User;

  if (currentUser?.email === 'admin@demo.hope.com') {
    roleLabel = 'Super Admin';
    roleText = 'ADMIN';
    RoleIcon = Shield;
  } else if (currentUser?.email === 'manager@demo.hope.com') {
    roleLabel = 'Product Manager';
    roleText = 'MANAGER';
    RoleIcon = Users;
  }

  return (
    <AnimatePresence mode="wait">
      {isMinimized ? (
        <motion.button
          key="minimized"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-[100] bg-[#0a1628] hover:bg-[#11243f] text-white shadow-2xl flex items-center gap-3 p-3 px-4.5 rounded-full border border-white/10 cursor-pointer select-none group transition-colors duration-200"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <RoleIcon className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-black uppercase tracking-widest">
            Demo: <span className="text-blue-400">{roleText}</span>
          </span>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </motion.button>
      ) : (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 right-6 z-[100] w-80 bg-[#0a1628]/95 backdrop-blur-md text-white shadow-2xl rounded-3xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Demo Environment</h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronDown className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0 border border-primary/30">
                <RoleIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">Active Role</p>
                <p className="text-xs font-bold text-white truncate mt-1">{roleLabel}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Switch Active Role:</span>
              
              <button
                onClick={() => handleSwitchRole('admin@demo.hope.com')}
                disabled={switching || currentUser?.email === 'admin@demo.hope.com'}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:bg-primary disabled:text-white disabled:opacity-100 disabled:shadow-lg disabled:shadow-primary/30 disabled:border-primary/50 cursor-pointer disabled:cursor-default"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Super Admin
                </span>
                {currentUser?.email === 'admin@demo.hope.com' && (
                  <span className="text-[9px] font-black tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded-md">ACTIVE</span>
                )}
              </button>

              <button
                onClick={() => handleSwitchRole('manager@demo.hope.com')}
                disabled={switching || currentUser?.email === 'manager@demo.hope.com'}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:bg-primary disabled:text-white disabled:opacity-100 disabled:shadow-lg disabled:shadow-primary/30 disabled:border-primary/50 cursor-pointer disabled:cursor-default"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Product Manager
                </span>
                {currentUser?.email === 'manager@demo.hope.com' && (
                  <span className="text-[9px] font-black tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded-md">ACTIVE</span>
                )}
              </button>

              <button
                onClick={() => handleSwitchRole('staff@demo.hope.com')}
                disabled={switching || currentUser?.email === 'staff@demo.hope.com'}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:bg-primary disabled:text-white disabled:opacity-100 disabled:shadow-lg disabled:shadow-primary/30 disabled:border-primary/50 cursor-pointer disabled:cursor-default"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  General Staff
                </span>
                {currentUser?.email === 'staff@demo.hope.com' && (
                  <span className="text-[9px] font-black tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded-md">ACTIVE</span>
                )}
              </button>
            </div>

            <div className="h-px bg-white/10"></div>

            <button
              onClick={() => signOut()}
              disabled={switching}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(225,29,72,0.3)] border border-rose-500/20 text-white cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit Demo Environment
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
