import { getProducts } from './products';
import { getPriceHistory } from './priceHistory';
import { supabase } from '../lib/supabase';

/**
 * REP-001: Fetches full product listing with current price.
 * Merges products with their most recent price from pricehist.
 */
export const getProductListing = async (userType?: any) => {
  const products = await getProducts(userType);
  const priceData = await getPriceHistory();
  
  const priceMap: Record<string, number> = {};
  if (priceData && Array.isArray(priceData)) {
    priceData.forEach((entry) => {
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
 * REP-002: Fetches top-selling products by quantity.
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
  }).filter(item => item.description !== undefined); // filter out if product doesn't exist
};
