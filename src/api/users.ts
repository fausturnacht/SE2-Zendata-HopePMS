import { supabase } from '../lib/supabase';
import { createStamp } from '../utils/stamp';
import { addUserStampEntry } from './userStampHistory';

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
  const stamp = await createStamp('EDITED');
  const { data, error } = await supabase
    .from('users')
    .update({ ...userData, stamp })
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to edit it. Check if the User ID is correct.');
  }
  await addUserStampEntry(userid, stamp);
  return data[0] as User;
};

/**
 * Soft deletes a user by setting record_status to 'INACTIVE'.
 */
export const softDeleteUser = async (userid: string) => {
  const stamp = await createStamp('DELETED');
  const { data, error } = await supabase
    .from('users')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to delete it.');
  }
  await addUserStampEntry(userid, stamp);
  return data[0] as User;
};

/**
 * Restores a user by setting record_status to 'ACTIVE'.
 */
export const restoreUser = async (userid: string) => {
  const stamp = await createStamp('RESTORED');
  const { data, error } = await supabase
    .from('users')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('userid', userid)
    .select();
  
  if (error) {
    console.error('Error restoring user:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('User not found or you do not have permission to restore it.');
  }
  await addUserStampEntry(userid, stamp);
  return data[0] as User;
};

/**
 * Pre-authorizes a user by adding their email, name, and role to a pre_auth_users table.
 * The database trigger on Supabase Auth should read from this table upon new user sign-up.
 */
export const preAuthorizeUser = async (email: string, username: string, user_type: string) => {
  const { data, error } = await supabase
    .from('pre_auth_users')
    .insert([{ email, username, user_type }])
    .select();
  
  if (error) {
    console.error('Error pre-authorizing user:', error);
    throw error;
  }
  return data?.[0];
};

export const getPendingUsers = async () => {
  try {
    // Check if there is a pending users or pre_auth_users table. Assuming pre_auth_users for now.
    const { data, error } = await supabase.from('pre_auth_users').select('*');
    if (error) {
      console.warn('Could not fetch pre_auth_users, checking if pending status in users');
      const fallback = await supabase.from('users').select('*').eq('record_status', 'INACTIVE');
      return fallback.data || [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
};

export const fetchAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
  return data || [];
};

export const approveUser = async (id: string) => {
  const stamp = await createStamp('APPROVED');
  const { data, error } = await supabase.from('users').update({ record_status: 'ACTIVE', stamp }).eq('userid', id);
  if (error) throw error;
  await addUserStampEntry(id, stamp);
  return data;
};

export const rejectUser = async (id: string) => {
  const { data, error } = await supabase.from('users').delete().eq('userid', id);
  if (error) throw error;
  return data;
};

export const activateUser = async (id: string) => {
  const stamp = await createStamp('ACTIVATED');
  const { data, error } = await supabase.from('users').update({ record_status: 'ACTIVE', stamp }).eq('userid', id);
  if (error) throw error;
  await addUserStampEntry(id, stamp);
  return data;
};

export const deactivateUser = async (id: string) => {
  const stamp = await createStamp('DEACTIVATED');
  const { data, error } = await supabase.from('users').update({ record_status: 'INACTIVE', stamp }).eq('userid', id);
  if (error) throw error;
  await addUserStampEntry(id, stamp);
  return data;
};

