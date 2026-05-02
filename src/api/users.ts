import { supabase } from '../lib/supabase';

export interface User {
  userid: string;
  email: string;
  username: string | null;
  user_type: string;
  record_status: 'ACTIVE' | 'INACTIVE';
  stamp: string | null;
}

/**
 * Fetches all active users.
 */
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('record_status', 'ACTIVE');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  return data as User[];
};

/**
 * Updates an existing user's profile fields.
 */
export const updateUser = async (userid: string, userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to edit it. Check if the User ID is correct.');
  }
  return data[0] as User;
};

/**
 * Soft deletes a user by setting record_status to 'INACTIVE'.
 */
export const softDeleteUser = async (userid: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ record_status: 'INACTIVE' })
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to delete it.');
  }
  return data[0] as User;
};

/**
 * Restores a user by setting record_status to 'ACTIVE'.
 */
export const restoreUser = async (userid: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ record_status: 'ACTIVE' })
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error restoring user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to restore it.');
  }
  return data[0] as User;
};
