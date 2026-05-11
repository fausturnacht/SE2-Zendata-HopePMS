/**
 * @file api/userStampHistory.ts
 * @description Append-only audit log for user account stamp events.
 *
 * Mirrors the pattern of `stampHistory.ts` but for the `users` table.
 * Every user mutation (edit, activate, deactivate, restore) writes a stamp
 * to the user row AND appends a copy here for immutable history.
 *
 * Supabase table: `user_stamp_hist`
 *   - `id`         — Auto-increment primary key
 *   - `userid`     — FK → users.userid
 *   - `stamp`      — The stamp string (e.g. "ACTIVATED admin 2026-05-11 09:15")
 *   - `created_at` — Server-side timestamp of when the entry was logged
 *
 * @see {@link ./users.ts} — User mutations that call addUserStampEntry()
 * @see {@link ./stampHistory.ts} — Equivalent module for product stamps
 */
import { supabase } from '../lib/supabase';

/**
 * Represents a single row in the `user_stamp_hist` table.
 */
export interface UserStampEntry {
  /** Auto-increment primary key. */
  id: number;
  /** The user ID this stamp belongs to (FK → users.userid). */
  userid: string;
  /** The full audit stamp string (e.g. "DEACTIVATED admin 2026-05-11 20:45"). */
  stamp: string;
  /** Server-generated ISO-8601 timestamp of when this entry was logged. */
  created_at: string;
}

/**
 * Appends a stamp entry to the user audit history log.
 *
 * Called after every user mutation alongside the stamp written to `users.stamp`.
 *
 * IMPORTANT: Like its product counterpart, this function intentionally does NOT
 * throw on failure. Stamp history is secondary — a logging failure should never
 * block the primary user operation.
 *
 * @param {string} userid - The user ID to log the stamp for.
 * @param {string} stamp - The full audit stamp string.
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
 * Fetches all stamp history entries for a specific user.
 *
 * Returns entries sorted by `created_at` descending (newest first)
 * for display in the UserStampHistoryPanel UI component.
 *
 * @param {string} userid - The user ID to fetch history for.
 * @returns {Promise<UserStampEntry[]>} Array of stamp entries, newest first.
 * @throws {Error} If the Supabase query fails.
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
