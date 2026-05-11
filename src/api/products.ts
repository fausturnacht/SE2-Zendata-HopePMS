/**
 * @file api/products.ts
 * @description Data access layer for the `product` table in Supabase.
 *
 * Provides CRUD operations plus soft-delete and recovery for product records.
 * Every mutation (add, update, delete, recover) follows a stamp-then-log pattern:
 *   1. Generate an audit stamp via `createStamp(action)`
 *   2. Write the stamp to the record's `stamp` column
 *   3. Append a copy to the `product_stamp_hist` table for immutable history
 *
 * Supabase tables used:
 *   - `product`            — Core product records (primary key: `prodcode`)
 *   - `product_stamp_hist` — Append-only audit log (via stampHistory.ts)
 *
 * @see {@link ../utils/stamp.ts} — Stamp generation
 * @see {@link ./stampHistory.ts} — Stamp history persistence
 */
import { supabase } from '../lib/supabase';
import { createStamp } from '../utils/stamp';
import { addStampEntry } from './stampHistory';

/**
 * User role type used to determine product visibility.
 * - `'USER'`       → Can only see products with `record_status = 'ACTIVE'`
 * - `'ADMIN'`      → Can see all products including soft-deleted ones
 * - `'SUPERADMIN'` → Same visibility as ADMIN
 */
export type UserType = 'USER' | 'ADMIN' | 'SUPERADMIN';

/**
 * Represents a single row in the `product` Supabase table.
 */
export interface Product {
  /** 6-character alphanumeric product code (primary key, immutable after creation). */
  prodcode: string;
  /** Human-readable product description (max 30 characters). */
  description: string | null;
  /** Unit of measure: 'pc', 'ea', 'mtr', 'pkg', or 'ltr'. */
  unit: string | null;
  /** Soft-delete flag: 'ACTIVE' for visible products, 'INACTIVE'/'DELETED' for archived. */
  record_status: 'ACTIVE' | 'INACTIVE';
  /** Latest audit stamp string (e.g. "ADDED jdoe 2026-05-11 14:30"). */
  stamp: string | null;
}

/**
 * Fetches all active products from the `product` table.
 *
 * @param {any} [_userType] - Reserved for future role-based filtering (currently unused).
 * @returns {Promise<Product[]>} Array of active product records.
 * @throws {Error} If the Supabase query fails.
 */
export const getProducts = async (_userType?: any) => {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .eq('record_status', 'ACTIVE');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data as Product[];
};

/**
 * Fetches all soft-deleted products for the Deleted Items page.
 *
 * Only returns products where `record_status = 'DELETED'`.
 * Used by Admin/SuperAdmin users to review and potentially recover items.
 *
 * @returns {Promise<Product[]>} Array of soft-deleted product records.
 * @throws {Error} If the Supabase query fails.
 */
export const getDeletedProducts = async () => {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .eq('record_status', 'DELETED');
    
  if (error) {
    console.error('Error fetching deleted products:', error);
    throw error;
  }
  return data as Product[];
};

/**
 * Creates a new product with an automatic "ADDED" audit stamp.
 *
 * Performs two writes:
 *   1. Inserts the product row into the `product` table
 *   2. Logs the stamp to `product_stamp_hist` for immutable audit trail
 *
 * @param {Partial<Product>} product - The product fields to insert (must include `prodcode`).
 * @returns {Promise<Product>} The newly created product record.
 * @throws {Error} If the product code already exists or the insert fails.
 */
export const addProduct = async (product: Partial<Product>) => {
  const stamp = await createStamp('ADDED');
  const { data, error } = await supabase
    .from('product')
    .insert([{ ...product, stamp }])
    .select();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  const saved = data?.[0] as Product;
  await addStampEntry(saved.prodcode, stamp);
  return saved;
};

/**
 * Updates an existing product's mutable fields with an "EDITED" audit stamp.
 *
 * Note: The product code (`prodcode`) is immutable and cannot be changed.
 * Only `description` and `unit` are updatable via this function.
 *
 * @param {string} prodcode - The product code identifying the record to update.
 * @param {Partial<Product>} product - The fields to modify.
 * @returns {Promise<Product>} The updated product record.
 * @throws {Error} If the product does not exist or the query fails.
 */
export const updateProduct = async (prodcode: string, product: Partial<Product>) => {
  const stamp = await createStamp('EDITED');
  const { data, error } = await supabase
    .from('product')
    .update({ ...product, stamp })
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  const updated = data?.[0] as Product;
  await addStampEntry(prodcode, stamp);
  return updated;
};

/**
 * Soft-deletes a product by setting `record_status` to 'DELETED'.
 *
 * The record is NOT removed from the database — it becomes hidden from
 * regular users but remains visible to Admin/SuperAdmin users and can
 * be recovered later via `recoverProduct()`.
 *
 * @param {string} prodcode - The product code to soft-delete.
 * @returns {Promise<Product>} The updated product with 'DELETED' status.
 * @throws {Error} If the product is not found or the query fails.
 */
export const softDeleteProduct = async (prodcode: string) => {
  const stamp = await createStamp('DELETED');
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'DELETED', stamp })
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error soft deleting product:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('Product not found or you do not have permission to delete it.');
  }
  await addStampEntry(prodcode, stamp);
  return data[0] as Product;
};

/**
 * Recovers a previously soft-deleted product by resetting `record_status` to 'ACTIVE'.
 *
 * Accessible only from the Deleted Items page (Admin/SuperAdmin).
 *
 * @param {string} prodcode - The product code to restore.
 * @returns {Promise<Product>} The restored product with 'ACTIVE' status.
 * @throws {Error} If the product is not found or the query fails.
 */
export const recoverProduct = async (prodcode: string) => {
  const stamp = await createStamp('RECOVERED');
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error recovering product:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('Product not found or you do not have permission to recover it.');
  }
  await addStampEntry(prodcode, stamp);
  return data[0] as Product;
};

/**
 * Bulk-stamps all active products as 'VERIFIED'.
 *
 * Sets the `stamp` column to the literal string 'VERIFIED' for every
 * product with `record_status = 'ACTIVE'`. Used by the Dashboard's
 * "Verify All" quick action to mark all active inventory as reviewed.
 *
 * Note: This does NOT log individual stamp history entries because it
 * is a batch convenience action, not a per-product mutation.
 *
 * @returns {Promise<any>} The Supabase update response data.
 * @throws {Error} If the bulk update query fails.
 */
export const verifyAllProducts = async () => {
  const { data, error } = await supabase
    .from('product')
    .update({ stamp: 'VERIFIED' })
    .eq('record_status', 'ACTIVE');
  
  if (error) {
    console.error('Error verifying all products:', error);
    throw error;
  }
  return data;
};
