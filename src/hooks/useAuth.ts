/**
 * @file hooks/useAuth.ts
 * @description Convenience hook for consuming the AuthContext.
 *
 * Provides type-safe access to the authentication state (session, currentUser,
 * signOut, isLoading) and throws an error if used outside of AuthProvider.
 *
 * @see {@link ../contexts/AuthContext.tsx} — The context this hook consumes
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Accesses the current authentication context.
 *
 * @returns {{ session, currentUser, signOut, isLoading }} The auth context value.
 * @throws {Error} If called outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
