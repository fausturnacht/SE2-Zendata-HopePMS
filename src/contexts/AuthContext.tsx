/**
 * @file contexts/AuthContext.tsx
 * @description Manages Supabase authentication state for the entire application.
 *
 * Provides:
 *   - `session`     — The current Supabase Auth session (contains JWT tokens)
 *   - `currentUser` — The authenticated Supabase User object (email, id, metadata)
 *   - `signOut`     — Function to terminate the session and clear state
 *   - `isLoading`   — True while the initial session is being resolved
 *
 * Initialization uses a dual strategy:
 *   1. `onAuthStateChange` listener for real-time auth events (login, logout, token refresh)
 *   2. `getSession()` one-shot call to catch any existing session on first mount
 *
 * This context MUST wrap UserRightsProvider because rights-fetching depends on
 * knowing the current user's identity.
 *
 * @see {@link ../hooks/useAuth.ts} — Convenience hook for consuming this context
 */
import React, { createContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Shape of the authentication context value.
 */
interface AuthContextType {
  /** The current Supabase Auth session, or null if unauthenticated. */
  session: Session | null;
  /** The authenticated user object, or null if unauthenticated. */
  currentUser: User | null;
  /** Signs out the current user and clears the session. */
  signOut: () => Promise<void>;
  /** True while the initial auth check is in progress (prevents redirect flicker). */
  isLoading: boolean;
}

/** Default context value used before the provider mounts. */
export const AuthContext = createContext<AuthContextType>({
  session: null,
  currentUser: null,
  signOut: async () => {},
  isLoading: true,
});

/**
 * Provider component that manages authentication lifecycle.
 *
 * Uses a `mounted` flag to prevent state updates after unmount,
 * avoiding React warnings in strict mode or during fast navigation.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mounted flag prevents state updates after component unmount
    let mounted = true;

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Check initial session in case the listener missed it
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setSession(session);
        setCurrentUser(session.user);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs the current user out of Supabase Auth.
   * The onAuthStateChange listener will automatically clear session/user state.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, currentUser, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};