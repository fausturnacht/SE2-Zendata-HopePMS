/**
 * @file api/priceHistory.ts
 * @description Data access layer for the `pricehist` table in Supabase.
 *
 * Manages price history entries for products. Each entry records a unit price
 * effective from a specific date. The table uses a composite key of
 * (`prodcode`, `effdate`), meaning each product can have at most one price
 * entry per calendar day.
 *
 * When a price is changed via EditProductModal, the system checks if an entry
 * already exists for today. If so, the user is prompted to overwrite it
 * (via OverwritePriceModal) rather than creating a duplicate.
 *
 * Supabase table: `pricehist`
 * Composite primary key: (`prodcode`, `effdate`)
 */
import { supabase } from '../lib/supabase';
import { createStamp } from '../utils/stamp';

/**
 * Represents a single row in the `pricehist` Supabase table.
 */
export interface PriceEntry {
  /** Effective date of this price in YYYY-MM-DD format (part of composite PK). */
  effdate: string;
  /** Product code this price belongs to (part of composite PK, FK → product). */
  prodcode: string;
  /** The unit price effective from `effdate` onwards. */
  unitprice: number;
  /** Record status flag: 'ACTIVE' or 'INACTIVE'. */
  record_status?: 'ACTIVE' | 'INACTIVE';
  /** Audit stamp from the last mutation (e.g. "ADDED jdoe 2026-05-11"). */
  stamp?: string | null;
}

/**
 * Fetches price history records, optionally filtered by product code.
 *
 * Results are joined with the `product` table to include the product description
 * and are sorted by effective date descending (newest first).
 *
 * @param {string} [prodcode] - If provided, filters entries for this product only.
 *   If omitted, returns ALL price history entries across all products.
 * @returns {Promise<any[]>} Array of price history entries with joined product description.
 * @throws {Error} If the Supabase query fails.
 */
export const getPriceHistory = async (prodcode?: string) => {
  let query = supabase
    .from('pricehist')
    .select('*, product(description)')
    .order('effdate', { ascending: false });

  if (prodcode) {
    query = query.eq('prodcode', prodcode);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
  return data;
};

/**
 * Inserts a new price history entry with an automatic "ADDED" audit stamp.
 *
 * Used when creating a product (initial price) or when editing a product's
 * price on a date that has no existing entry.
 *
 * @param {PriceEntry} entry - The price entry to insert (prodcode, effdate, unitprice required).
 * @returns {Promise<PriceEntry | undefined>} The newly created price entry, or undefined on empty response.
 * @throws {Error} If the composite key (prodcode + effdate) already exists, or the insert fails.
 */
export const addPriceEntry = async (entry: PriceEntry) => {
  const stamp = await createStamp('ADDED');
  const { data, error } = await supabase
    .from('pricehist')
    .insert([{ ...entry, stamp }])
    .select();

  if (error) {
    console.error('Error adding price entry:', error);
    throw error;
  }
  return data?.[0];
};

/**
 * Checks whether a price history entry already exists for a product on a specific date.
 *
 * Called during the edit flow to determine whether saving a new price would
 * conflict with an existing entry. If `true`, the OverwritePriceModal is shown
 * to ask the user for confirmation before overwriting.
 *
 * @param {string} prodcode - The product code to check.
 * @param {string} effdate - The date to check in YYYY-MM-DD format.
 * @returns {Promise<boolean>} `true` if an entry exists for this product+date, `false` otherwise.
 * @throws {Error} If the Supabase query fails.
 */
export const checkPriceEntryExists = async (prodcode: string, effdate: string) => {
  const { data, error } = await supabase
    .from('pricehist')
    .select('unitprice')
    .eq('prodcode', prodcode)
    .eq('effdate', effdate)
    .maybeSingle();

  if (error) {
    console.error('Error checking price entry:', error);
    throw error;
  }
  return !!data;
};

/**
 * Overwrites an existing price history entry for a specific product and date.
 *
 * Called when the user confirms overwriting today's price via OverwritePriceModal.
 * Updates the `unitprice` and `stamp` columns for the matching composite key.
 *
 * @param {string} prodcode - The product code.
 * @param {string} effdate - The effective date of the entry to overwrite.
 * @param {number} unitprice - The new unit price value.
 * @returns {Promise<PriceEntry | undefined>} The updated price entry.
 * @throws {Error} If no matching entry is found or the query fails.
 */
export const updatePriceEntry = async (prodcode: string, effdate: string, unitprice: number) => {
  const stamp = await createStamp('UPDATED');
  const { data, error } = await supabase
    .from('pricehist')
    .update({ unitprice, stamp })
    .eq('prodcode', prodcode)
    .eq('effdate', effdate)
    .select();

  if (error) {
    console.error('Error updating price entry:', error);
    throw error;
  }
  return data?.[0];
};
