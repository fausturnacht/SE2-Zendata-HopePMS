/**
 * @file api/reports.ts
 * @description Report data aggregation for the HOPE PMS Reports module.
 *
 * Provides two report endpoints:
 *   - REP-001: Full Product Listing — merges products with their current price
 *   - REP-002: Top-Selling Products — aggregates sales by quantity
 *
 * Both reports perform client-side aggregation by composing data from
 * multiple Supabase tables rather than using server-side views or RPCs.
 *
 * Supabase tables used:
 *   - `product`     — Product master data (via products.ts)
 *   - `pricehist`   — Price history (via priceHistory.ts)
 *   - `salesdetail` — Sales line items (direct query)
 *
 * @see {@link ./products.ts} — Product data fetching
 * @see {@link ./priceHistory.ts} — Price data fetching
 */
import { getProducts } from './products';
import { getPriceHistory } from './priceHistory';
import { supabase } from '../lib/supabase';

/**
 * REP-001: Full Product Listing with current price.
 *
 * Fetches all active products and merges each with its most recent price
 * from the `pricehist` table. The merge strategy:
 *   1. Fetch all price history entries (sorted newest-first by getPriceHistory)
 *   2. Build a map of prodcode → first-encountered unitprice (i.e. the latest)
 *   3. Attach `current_price` to each product (defaults to 0 if no price exists)
 *
 * @param {any} [userType] - Reserved for future role-based visibility filtering.
 * @returns {Promise<Array<Product & { current_price: number }>>} Products with current prices.
 */
export const getProductListing = async (userType?: any) => {
  const products = await getProducts(userType);
  const priceData = await getPriceHistory();
  // Build a lookup map: prodcode → latest unit price.
  // Since getPriceHistory returns entries sorted by effdate DESC,
  // the first entry encountered for each prodcode IS the current price.
  const priceMap: Record<string, number> = {};
  if (priceData && Array.isArray(priceData)) {
    priceData.forEach((entry) => {
      // Only record the first (newest) price for each product
      if (!priceMap[entry.prodcode]) {
        priceMap[entry.prodcode] = entry.unitprice;
      }
    });
  }

  return products.map(product => ({
    ...product,
    current_price: priceMap[product.prodcode] || 0
  }));
};

/**
 * REP-002: Top-Selling Products ranked by total quantity sold.
 *
 * Aggregation strategy (all client-side):
 *   1. Fetch ALL rows from `salesdetail` (prodcode + quantity pairs)
 *   2. Aggregate total quantity per product code using a hash map
 *   3. Sort product codes by total quantity descending
 *   4. Take the top N product codes
 *   5. Fetch full product details for those codes
 *   6. Return combined data in ranked order
 *
 * @param {number} limit - How many top sellers to return (e.g. 5, 10).
 * @returns {Promise<Array<Product & { total_sales_quantity: number }>>} Ranked products with sales totals.
 * @throws {Error} If the salesdetail or product query fails.
 */
export const getTopSellers = async (limit: number) => {
  // Fetch all sales details
  const { data: salesData, error: salesError } = await supabase
    .from('salesdetail')
    .select('prodcode, quantity');

  if (salesError) {
    console.error('Error fetching sales detail:', salesError);
    throw salesError;
  }

  // Aggregate quantities
  const quantityMap: Record<string, number> = {};
  if (salesData && Array.isArray(salesData)) {
    salesData.forEach((item) => {
      quantityMap[item.prodcode] = (quantityMap[item.prodcode] || 0) + Number(item.quantity);
    });
  }

  // Sort by total quantity descending
  const sortedProdCodes = Object.keys(quantityMap).sort((a, b) => quantityMap[b] - quantityMap[a]);

  // Take top N
  const topProdCodes = sortedProdCodes.slice(0, limit);

  if (topProdCodes.length === 0) return [];

  // Fetch product details for the top N
  const { data: productsData, error: productsError } = await supabase
    .from('product')
    .select('*')
    .in('prodcode', topProdCodes);

  if (productsError) {
    console.error('Error fetching top products:', productsError);
    throw productsError;
  }

  // Return combined data, maintaining sorted order
  return topProdCodes.map(code => {
    const product = productsData?.find(p => p.prodcode === code);
    return {
      ...(product || { prodcode: code }),
      total_sales_quantity: quantityMap[code]
    };
  }).filter(item => item.description !== undefined); // Exclude orphaned sales (product was hard-deleted)
};
