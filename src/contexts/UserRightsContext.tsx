import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export type RightsMap = {
    [key: string]: number;
};

type UserRightsContextType = {
    rights: RightsMap;
    userType: string | null;
    loadingRights: boolean;
    userRole: string | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isUser: boolean;
    hasRight: (right: string) => boolean;
};

const UserRightsContext = createContext<UserRightsContextType | undefined>(undefined);

export function UserRightsProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [rights, setRights] = useState<RightsMap>({});
    const [userType, setUserType] = useState<string | null>(null);
    const [loadingRights, setLoadingRights] = useState(true);
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

            // If we already have rights for this user, don't show loading again
            // unless we specifically want to refresh. This prevents flickering.
            if (fetchedUserId === currentUser.id) {
                setLoadingRights(false);
                return;
            }

            setLoadingRights(true);
            try {
                // Fetch User Type using maybeSingle to avoid 406 errors
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('user_type')
                    .eq('userid', currentUser.id)
                    .maybeSingle();

                if (!userError && userData) {
                    setUserType(userData.user_type);
                }

                // Fetch Module Rights
                const { data: rightsData, error: rightsError } = await supabase
                    .from('usermodule_rights')
                    .select('right_id, right_value')
                    .eq('userid', currentUser.id);

                if (rightsError) throw rightsError;

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

    // Role Boolean Helpers
    const isAdmin = userType === 'ADMIN';
    const isSuperAdmin = userType === 'SUPERADMIN';
    const isUser = userType === 'USER';
    const userRole = userType;

    // The core permission checker
    const hasRight = (right: string): boolean => {
        if (isSuperAdmin) return true;
        if (isUser && right === 'STAMP') return false;
        return rights[right] === 1;
    };

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

export const useRights = () => {
    const context = useContext(UserRightsContext);
    if (context === undefined) {
        throw new Error('useRights must be used within a UserRightsProvider');
    }
    return context;
};