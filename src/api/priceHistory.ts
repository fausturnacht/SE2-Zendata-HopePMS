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
