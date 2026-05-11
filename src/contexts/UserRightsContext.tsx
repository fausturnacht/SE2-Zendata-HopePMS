/**
 * @file contexts/UserRightsContext.tsx
 * @description Role-Based Access Control (RBAC) provider for the HOPE PMS.
 *
 * After authentication, this context fetches the current user's:
 *   1. `user_type` from the `users` table (USER / ADMIN / SUPERADMIN)
 *   2. Module-level rights from the `usermodule_rights` table (right_id → right_value)
 *
 * It then exposes a `hasRight(rightId)` function that components use to
 * conditionally render UI elements (buttons, columns, navigation items).
 *
 * Permission matrix (hardcoded overrides):
 *   - SUPERADMIN → ALL rights granted unconditionally
 *   - REP_002    → SUPERADMIN only (Top Sellers report)
 *   - REP_001, ADD_PRODUCT, EDIT_PRODUCT, DELETE_PRODUCT → All roles
 *   - ADM_USER   → ADMIN + SUPERADMIN only
 *   - STAMP      → Hidden from standard USER role
 *   - All other rights → Resolved from `usermodule_rights` database table
 *
 * Supabase tables used:
 *   - `users`              — For fetching `user_type`
 *   - `usermodule_rights`  — For fetching per-user right_id/right_value pairs
 *
 * @see {@link ../hooks/useAuth.ts} — Provides the currentUser consumed here
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

/**
 * Map of right_id → right_value (1 = granted, 0 = denied).
 * Populated from the `usermodule_rights` Supabase table.
 */
export type RightsMap = {
    [key: string]: number;
};

/**
 * Shape of the UserRights context value exposed to consumers.
 */
type UserRightsContextType = {
    /** Raw rights map from the database. */
    rights: RightsMap;
    /** The user's role string ('USER', 'ADMIN', 'SUPERADMIN'), or null if unknown. */
    userType: string | null;
    /** True while rights are being fetched (used by ProtectedRoute to prevent flicker). */
    loadingRights: boolean;
    /** Alias for userType. */
    userRole: string | null;
    /** True if the user's role is exactly 'ADMIN'. */
    isAdmin: boolean;
    /** True if the user's role is exactly 'SUPERADMIN'. */
    isSuperAdmin: boolean;
    /** True if the user's role is exactly 'USER'. */
    isUser: boolean;
    /** Core permission checker. Returns true if the user has the specified right. */
    hasRight: (right: string) => boolean;
};

const UserRightsContext = createContext<UserRightsContextType | undefined>(undefined);

export function UserRightsProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [rights, setRights] = useState<RightsMap>({});
    const [userType, setUserType] = useState<string | null>(null);
    const [loadingRights, setLoadingRights] = useState(true);
    // Track which user's rights we've already fetched to prevent redundant requests
    const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccessData = async () => {
            if (!currentUser) {
                setRights({});
                setUserType(null);
                setFetchedUserId(null);
                setLoadingRights(false);
                return;
            }

            // Anti-flicker guard: If we already fetched rights for this user,
            // skip the loading state to prevent UI flashing on re-renders.
            if (fetchedUserId === currentUser.id) {
                setLoadingRights(false);
                return;
            }

            setLoadingRights(true);
            try {
                // Step 1: Fetch the user's role from the users table.
                // Uses maybeSingle() instead of single() to avoid 406 errors
                // when the user record doesn't exist yet (first-time login).
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('user_type')
                    .eq('userid', currentUser.id)
                    .maybeSingle();

                if (!userError && userData) {
                    setUserType(userData.user_type);
                }

                // Step 2: Fetch per-user module rights from the rights table.
                // Each row maps a right_id (e.g. 'REP_001') to a right_value (0 or 1).
                const { data: rightsData, error: rightsError } = await supabase
                    .from('usermodule_rights')
                    .select('right_id, right_value')
                    .eq('userid', currentUser.id);

                if (rightsError) throw rightsError;

                // Build the rights lookup map from database rows
                const rightsMap: RightsMap = {};
                if (rightsData) {
                    rightsData.forEach((row: any) => {
                        rightsMap[row.right_id] = row.right_value;
                    });
                }

                setRights(rightsMap);
                setFetchedUserId(currentUser.id);
            } catch (error) {
                console.error('Error fetching user access data:', error);
            } finally {
                setLoadingRights(false);
            }
        };

        fetchAccessData();
    }, [currentUser, fetchedUserId]);

    // ─── Role Boolean Helpers ───────────────────────────────────────────
    const isAdmin = userType === 'ADMIN';
    const isSuperAdmin = userType === 'SUPERADMIN';
    const isUser = userType === 'USER';
    const userRole = userType;

    /**
     * Core permission checker used throughout the UI.
     *
     * Priority order:
     *   1. SUPERADMIN bypass → always true
     *   2. Hardcoded deny rules (e.g. REP_002 is superadmin-only)
     *   3. Hardcoded allow rules (e.g. REP_001 is open to all)
     *   4. Role-based rules (e.g. ADM_USER requires admin+)
     *   5. Fallback to database `usermodule_rights` table
     *
     * @param {string} right - The right identifier to check (e.g. 'REP_001', 'STAMP').
     * @returns {boolean} True if the current user has the specified right.
     */
    const hasRight = (right: string): boolean => {
        // 1. SUPERADMIN bypass: full access to everything
        if (isSuperAdmin) return true;

        // 2. REP_002 (Top Sellers) is strictly for superadmins
        if (right === 'REP_002') return false;

        // 3. These rights are granted to ALL authenticated users
        if (right === 'REP_001' || right === 'ADD_PRODUCT' || right === 'EDIT_PRODUCT' || right === 'DELETE_PRODUCT') return true;

        // 4. Admin console requires at least ADMIN role
        if (right === 'ADM_USER' && (isAdmin || isSuperAdmin)) return true;

        // 5. Standard users cannot see audit STAMP columns
        if (isUser && right === 'STAMP') return false;

        // 6. Fallback: check the database rights map (1 = granted)
        return rights[right] === 1;
    };

    // Memoize context value to prevent unnecessary re-renders of consumers.
    // The loadingRights calculation also accounts for the case where the user
    // has changed but rights haven't been fetched yet for the new user.
    const contextValue = React.useMemo(() => ({
        rights,
        userType,
        loadingRights: loadingRights || (!!currentUser && fetchedUserId !== currentUser.id),
        userRole,
        isAdmin,
        isSuperAdmin,
        isUser,
        hasRight
    }), [rights, userType, loadingRights, currentUser, fetchedUserId, isAdmin, isSuperAdmin, isUser]);

    return (
        <UserRightsContext.Provider value={contextValue}>
            {children}
        </UserRightsContext.Provider>
    );
}

/**
 * Convenience hook for consuming UserRightsContext.
 *
 * @returns {UserRightsContextType} The rights context value.
 * @throws {Error} If called outside of a UserRightsProvider.
 */
export const useRights = () => {
    const context = useContext(UserRightsContext);
    if (context === undefined) {
        throw new Error('useRights must be used within a UserRightsProvider');
    }
    return context;
};