/**
 * @file api/stampHistory.ts
 * @description Append-only audit log for product stamp events.
 *
 * Every product mutation (add, edit, delete, recover) writes a stamp to the
 * product row AND appends a copy here for immutable history. This ensures
 * that even if the product's `stamp` column is overwritten by a later action,
 * the full sequence of changes is preserved.
 *
 * Supabase table: `product_stamp_hist`
 *   - `id`         — Auto-increment primary key
 *   - `prodcode`   — FK → product.prodcode
 *   - `stamp`      — The stamp string (e.g. "ADDED jdoe 2026-05-11 14:30")
 *   - `created_at` — Server-side timestamp of when the entry was logged
 *
 * @see {@link ./products.ts} — Product mutations that call addStampEntry()
 */
import { supabase } from '../lib/supabase';

/**
 * Represents a single row in the `product_stamp_hist` table.
 */
export interface StampEntry {
  /** Auto-increment primary key. */
  id: number;
  /** The product code this stamp belongs to (FK → product). */
  prodcode: string;
  /** The full audit stamp string (e.g. "EDITED admin 2026-05-11 09:15"). */
  stamp: string;
  /** Server-generated ISO-8601 timestamp of when this entry was logged. */
  created_at: string;
}

/**
 * Appends a stamp entry to the product audit history log.
 *
 * Called after every product mutation alongside the stamp written to `product.stamp`.
 *
 * IMPORTANT: This function intentionally does NOT throw on failure.
 * Stamp history is a secondary concern — if the insert fails (e.g. due to
 * network issues), the primary product mutation should still succeed.
 *
 * @param {string} prodcode - The product code to log the stamp for.
 * @param {string} stamp - The full audit stamp string.
 */
export const addStampEntry = async (prodcode: string, stamp: string): Promise<void> => {
  const { error } = await supabase
    .from('product_stamp_hist')
    .insert([{ prodcode, stamp }]);

  if (error) {
    // Log but don't throw — stamp history failure should not block the main operation
    console.error('Error writing stamp history entry:', error);
  }
};

/**
 * Fetches all stamp history entries for a specific product.
 *
 * Returns entries sorted by `created_at` descending (newest first)
 * for display in the StampHistoryPanel UI component.
 *
 * @param {string} prodcode - The product code to fetch history for.
 * @returns {Promise<StampEntry[]>} Array of stamp entries, newest first.
 * @throws {Error} If the Supabase query fails.
 */
export const getStampHistory = async (prodcode: string): Promise<StampEntry[]> => {
  const { data, error } = await supabase
    .from('product_stamp_hist')
    .select('id, prodcode, stamp, created_at')
    .eq('prodcode', prodcode)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stamp history:', error);
    throw error;
  }

  return (data ?? []) as StampEntry[];
};
