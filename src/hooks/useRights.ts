import { useAuth } from './useAuth';

export type RightKey = 'ADD_PRODUCT' | 'EDIT_PRODUCT' | 'DELETE_PRODUCT' | 'STAMP' | 'ADMIN' | 'SUPERADMIN';

/**
 * Hook to check user rights based on their role.
 * Determines permissions for USER, ADMIN, and SUPERADMIN roles.
 */
export const useRights = () => {
  const { currentUser } = useAuth();

  /**
   * Get the user's role from custom claims in the JWT (if available).
   * For now, we'll default to 'USER' as the role needs to be set in Supabase.
   * In a real deployment, this would come from:
   * - Custom JWT claims set in Supabase auth rules
   * - A user_roles table query
   * - User metadata in Supabase auth
   */
  const getUserRole = (): 'USER' | 'ADMIN' | 'SUPERADMIN' => {
    // Try to get role from user metadata (if set in Supabase)
    const role = (currentUser?.user_metadata?.role as string) || 'USER';
    
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return role;
    }
    
    return 'USER';
  };

  const userRole = getUserRole();

  /**
   * Determine if user has a specific right.
   */
  const hasRight = (right: RightKey): boolean => {
    // SUPERADMIN has all rights
    if (userRole === 'SUPERADMIN') {
      return true;
    }

    // ADMIN roles
    if (userRole === 'ADMIN') {
      return ['ADD_PRODUCT', 'EDIT_PRODUCT', 'DELETE_PRODUCT', 'STAMP', 'ADMIN'].includes(right);
    }

    // Regular USER roles
    if (userRole === 'USER') {
      // Regular users have limited access
      return ['STAMP'].includes(right);
    }

    return false;
  };

  return {
    hasRight,
    userRole,
    isAdmin: userRole === 'ADMIN',
    isSuperAdmin: userRole === 'SUPERADMIN',
    isUser: userRole === 'USER',
  };
};
