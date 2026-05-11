/**
 * @file api/users.ts
 * @description Data access layer for user management in Supabase.
 *
 * Handles CRUD operations for the `users` table, including:
 *   - Fetching active/all/pending users
 *   - Editing user profiles (username, role)
 *   - Activating / deactivating accounts (soft status toggle)
 *   - Pre-authorizing new users via the `pre_auth_users` table
 *
 * Like products, every user mutation follows the stamp-then-log pattern.
 *
 * Supabase tables used:
 *   - `users`           — Core user records (PK: `userid`)
 *   - `pre_auth_users`  — Pre-authorization whitelist for new sign-ups
 *   - `user_stamp_hist` — Append-only audit log (via userStampHistory.ts)
 *
 * @see {@link ./userStampHistory.ts} — User stamp history persistence
 * @see {@link ../utils/stamp.ts} — Stamp generation
 */
import { supabase } from '../lib/supabase';
import { createStamp } from '../utils/stamp';
import { addUserStampEntry } from './userStampHistory';

/**
 * Represents a single row in the `users` Supabase table.
 */
export interface User {
  /** UUID primary key for the user. */
  userid: string;
  /** User's email address (from Google OAuth). */
  email: string;
  /** Display name / username (editable by admins). */
  username: string | null;
  /** Role: 'USER', 'ADMIN', or 'SUPERADMIN'. Determines module access. */
  user_type: string;
  /** Account status: 'ACTIVE' allows login, 'INACTIVE' blocks it. */
  record_status: 'ACTIVE' | 'INACTIVE';
  /** Latest audit stamp (e.g. "ACTIVATED admin 2026-05-11 14:30"). */
  stamp: string | null;
}

/**
 * Fetches all users with `record_status = 'ACTIVE'`.
 *
 * Used by the API Debugger and other contexts that only need active users.
 *
 * @returns {Promise<User[]>} Array of active user records.
 * @throws {Error} If the Supabase query fails.
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
 * Updates an existing user's profile fields with an "EDITED" audit stamp.
 *
 * Updatable fields: `username`, `user_type`.
 * The `userid` and `email` are immutable.
 *
 * @param {string} userid - The user ID to update.
 * @param {Partial<User>} userData - The fields to modify.
 * @returns {Promise<User>} The updated user record.
 * @throws {Error} If the user is not found or the query fails.
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
 * Soft-deletes a user by setting `record_status` to 'INACTIVE'.
 *
 * An inactive user will be blocked at the AuthCallback gate on their next
 * login attempt (see AuthCallback.tsx for the LOGIN GUARD logic).
 *
 * @param {string} userid - The user ID to deactivate.
 * @returns {Promise<User>} The updated user with 'INACTIVE' status.
 * @throws {Error} If the user is not found or the query fails.
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
 * Restores a previously deactivated user by resetting `record_status` to 'ACTIVE'.
 *
 * @param {string} userid - The user ID to restore.
 * @returns {Promise<User>} The restored user with 'ACTIVE' status.
 * @throws {Error} If the user is not found or the query fails.
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
 * Pre-authorizes a new user by inserting their email, name, and role
 * into the `pre_auth_users` whitelist table.
 *
 * When a new user signs up via Google OAuth, a Supabase database trigger
 * checks this table. If the email is found, the user is automatically
 * assigned the pre-configured role and activated.
 *
 * @param {string} email - The email to pre-authorize.
 * @param {string} username - The display name to assign.
 * @param {string} user_type - The role to assign: 'USER' or 'ADMIN'.
 * @returns {Promise<any>} The newly created pre-auth record.
 * @throws {Error} If the email already exists or the insert fails.
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

/**
 * Fetches users pending authorization.
 *
 * First attempts to read from `pre_auth_users` (the whitelist table).
 * Falls back to fetching INACTIVE users from `users` if the pre-auth
 * table doesn't exist or errors out. This fallback ensures compatibility
 * across different database schema versions.
 *
 * @returns {Promise<any[]>} Array of pending user records.
 */
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

/**
 * Fetches ALL users regardless of `record_status`.
 *
 * Used by the UserManagementPage to display both active and
 * suspended users in a single unified table.
 *
 * @returns {Promise<any[]>} Array of all user records.
 * @throws {Error} If the Supabase query fails.
 */
export const fetchAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
  return data || [];
};

/**
 * Activates a user account by setting `record_status` to 'ACTIVE'.
 *
 * Distinct from `restoreUser()` in stamp label: uses 'ACTIVATED' instead
 * of 'RESTORED' to differentiate admin-initiated activation from recovery.
 *
 * @param {string} id - The user ID to activate.
 * @returns {Promise<any>} The Supabase update response.
 * @throws {Error} If the query fails.
 */
export const activateUser = async (id: string) => {
  const stamp = await createStamp('ACTIVATED');
  const { data, error } = await supabase.from('users').update({ record_status: 'ACTIVE', stamp }).eq('userid', id);
  if (error) throw error;
  await addUserStampEntry(id, stamp);
  return data;
};

/**
 * Deactivates a user account by setting `record_status` to 'INACTIVE'.
 *
 * Deactivated users are blocked at the AuthCallback login gate.
 * Their row remains in the database for potential reactivation.
 *
 * @param {string} id - The user ID to deactivate.
 * @returns {Promise<any>} The Supabase update response.
 * @throws {Error} If the query fails.
 */
export const deactivateUser = async (id: string) => {
  const stamp = await createStamp('DEACTIVATED');
  const { data, error } = await supabase.from('users').update({ record_status: 'INACTIVE', stamp }).eq('userid', id);
  if (error) throw error;
  await addUserStampEntry(id, stamp);
  return data;
};

