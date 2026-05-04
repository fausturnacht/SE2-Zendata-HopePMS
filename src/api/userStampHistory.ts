import { supabase } from '../lib/supabase';

export interface UserStampEntry {
  id: number;
  userid: string;
  stamp: string;
  created_at: string;
}

/**
 * Inserts a new stamp history entry for a user.
 * Called after every user mutation alongside the stamp written to users.stamp.
 */
export const addUserStampEntry = async (userid: string, stamp: string): Promise<void> => {
  const { error } = await supabase
    .from('user_stamp_hist')
    .insert([{ userid, stamp }]);

  if (error) {
    // Log but don't throw — stamp history failure should not block the main operation
    console.error('Error writing user stamp history entry:', error);
  }
};

/**
 * Fetches all stamp history entries for a user, newest first.
 */
export const getUserStampHistory = async (userid: string): Promise<UserStampEntry[]> => {
  const { data, error } = await supabase
    .from('user_stamp_hist')
    .select('id, userid, stamp, created_at')
    .eq('userid', userid)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user stamp history:', error);
    throw error;
  }

  return (data ?? []) as UserStampEntry[];
};
