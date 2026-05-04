import { supabase } from '../lib/supabase';
import { createStamp } from '../utils/stamp';

export interface PriceEntry {
  effdate: string;
  prodcode: string;
  unitprice: number;
  record_status?: 'ACTIVE' | 'INACTIVE';
  stamp?: string | null;
}

/**
 * Fetches price history records.
 * Can be filtered by prodcode.
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
 * Adds a new price history entry.
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
 * Checks if a price history entry exists for a specific date and product.
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
 * Updates an existing price history entry.
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
