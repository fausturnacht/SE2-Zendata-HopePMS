import { supabase } from '../lib/supabase';

export type UserType = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface Product {
  prodcode: string;
  description: string | null;
  unit: string | null;
  record_status: 'ACTIVE' | 'INACTIVE';
  stamp: string | null;
}

/**
 * Fetches all products based on user type.
 * 'USER' only sees ACTIVE records.
 * 'ADMIN' and 'SUPERADMIN' see all records.
 */
export const getProducts = async (userType: UserType) => {
  let query = supabase.from('product').select('*');
  
  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data as Product[];
};

/**
 * Adds a new product to the database.
 */
export const addProduct = async (product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('product')
    .insert([product])
    .select();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  return data?.[0] as Product;
};

/**
 * Updates an existing product.
 */
export const updateProduct = async (prodcode: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('product')
    .update(product)
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  return data?.[0] as Product;
};

/**
 * Soft deletes a product by setting record_status to 'DELETED'.
 */
export const softDeleteProduct = async (prodcode: string) => {
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'DELETED' })
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error soft deleting product:', error);
    throw error;
  }
  return data?.[0] as Product;
};

/**
 * Recovers a soft-deleted product by setting record_status to 'ACTIVE'.
 */
export const recoverProduct = async (prodcode: string) => {
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'ACTIVE' })
    .eq('prodcode', prodcode)
    .select();
  
  if (error) {
    console.error('Error recovering product:', error);
    throw error;
  }
  return data?.[0] as Product;
};
