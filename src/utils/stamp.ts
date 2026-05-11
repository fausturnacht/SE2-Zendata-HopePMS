/**
 * @file stamp.ts
 * @description Generates audit stamp strings that record WHO did WHAT and WHEN.
 *
 * Every product and user mutation in the system writes a stamp string to the
 * relevant record's `stamp` column. The stamp format is:
 *   "<ACTION> <username> <YYYY-MM-DD HH:mm>"
 *
 * Examples:
 *   - "ADDED jdoe 2026-05-11 14:30"
 *   - "EDITED admin 2026-05-11 09:15"
 *   - "DELETED mcruz 2026-05-11 20:45"
 *
 * @see {@link ../api/products.ts} — Product mutations that consume this utility
 * @see {@link ../api/users.ts} — User mutations that consume this utility
 */
import { supabase } from '../lib/supabase';
import { getNowGMT8 } from './dateUtils';

/**
 * Creates an audit stamp string for a given action.
 *
 * Fetches the currently authenticated user from Supabase Auth, extracts
 * the email prefix (e.g. "jdoe" from "jdoe@hope.edu") as the identifier,
 * and appends the current GMT+8 timestamp.
 *
 * @param {string} action - The action label (e.g. "ADDED", "EDITED", "DELETED", "RECOVERED").
 * @returns {Promise<string>} The formatted stamp string: "<action> <user> <datetime>".
 *
 * @example
 * const stamp = await createStamp('ADDED');
 * // => "ADDED jdoe 2026-05-11 14:30"
 */
export const createStamp = async (action: string) => {
  const { data } = await supabase.auth.getUser();

  // Default to 'System' for unauthenticated or service-level operations
  let userIdentifier = 'System';
  
  if (data?.user) {
    // Use email prefix (before @) as the human-readable identifier,
    // falling back to a truncated UUID if no email is available
    userIdentifier = data.user.email?.split('@')[0] || data.user.id.substring(0, 8);
  }

  const formattedDate = getNowGMT8();
  
  return `${action} ${userIdentifier} ${formattedDate}`;
};
