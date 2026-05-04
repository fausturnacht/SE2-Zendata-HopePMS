import { supabase } from '../lib/supabase';

export interface StampEntry {
  id: number;
  prodcode: string;
  stamp: string;
  created_at: string;
}

/**
 * Inserts a new stamp history entry for a product.
 * Called after every product mutation alongside the stamp written to product.stamp.
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
 * Fetches all stamp history entries for a product, newest first.
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
