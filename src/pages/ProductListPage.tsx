import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, softDeleteProduct, type Product, type UserType } from '../api/products';
import { getPriceHistory, type PriceEntry } from '../api/priceHistory';
import { useRights } from '../hooks/useRights';

const ITEMS_PER_PAGE = 10;

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRight, userRole } = useRights();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProducts(userRole as UserType);
        setProducts(data);
        setFilteredProducts(data);

        // Fetch price history for all products
        const priceData = await getPriceHistory();
        const priceMap: Record<string, number> = {};
        if (priceData && Array.isArray(priceData)) {
          // Get the most recent price for each product (since it's ordered by effdate DESC)
          priceData.forEach((entry: PriceEntry) => {
            if (!priceMap[entry.prodcode]) {
              priceMap[entry.prodcode] = entry.unitprice;
            }
          });
        }
        setPriceMap(priceMap);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userRole]);

  // Handle search
  useEffect(() => {
    const filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.prodcode.toLowerCase().includes(searchLower) ||
        (product.description?.toLowerCase().includes(searchLower) ?? false)
      );
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle delete
  const handleDelete = async (prodcode: string) => {
    if (!hasRight('DELETE_PRODUCT')) {
      alert('You do not have permission to delete products');
      return;
    }

    if (!confirm(`Are you sure you want to delete product ${prodcode}?`)) {
      return;
    }

    try {
      setDeletingId(prodcode);
      await softDeleteProduct(prodcode);
      setProducts(products.filter(p => p.prodcode !== prodcode));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit
  const handleEdit = (prodcode: string) => {
    if (!hasRight('EDIT_PRODUCT')) {
      alert('You do not have permission to edit products');
      return;
    }
    navigate(`/products/edit/${prodcode}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header Section */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Products</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage institutional procurement items and inventory.</p>
        </div>
        {hasRight('ADD_PRODUCT') && (
          <div>
            <button
              onClick={() => navigate('/products/add')}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>+ Add Product</span>
            </button>
            <p className="text-[10px] text-right mt-1 text-on-surface-variant font-medium uppercase tracking-widest">Role-based Access</p>
          </div>
        )}
      </section>

      {/* Search Bar */}
      <section className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_0_40px_rgba(42,52,57,0.06)]">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">
            search
          </span>
          <input
            type="text"
            placeholder="Search by product code, description, or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/60"
          />
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(42,52,57,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Product Code
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Unit
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Current Price
                </th>
                {hasRight('STAMP') && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Stamp
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {currentProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={hasRight('STAMP') ? 6 : 5}
                    className="px-6 py-8 text-center text-on-surface-variant"
                  >
                    {filteredProducts.length === 0 && searchTerm
                      ? 'No products match your search'
                      : 'No products available'}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr
                    key={product.prodcode}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">
                      {product.prodcode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-on-surface">
                          {product.description || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {product.unit || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      ${(priceMap[product.prodcode] ?? 0).toFixed(2)}
                    </td>
                    {hasRight('STAMP') && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container uppercase tracking-tighter">
                          {product.stamp || 'Verified'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasRight('EDIT_PRODUCT') && (
                          <button
                            onClick={() => handleEdit(product.prodcode)}
                            className="p-1.5 hover:bg-primary-container rounded-md text-primary-dim transition-colors"
                            title="Edit product"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        )}
                        {hasRight('DELETE_PRODUCT') && (
                          <button
                            onClick={() => handleDelete(product.prodcode)}
                            disabled={deletingId === product.prodcode}
                            className="p-1.5 hover:bg-error-container/20 rounded-md text-error transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {deletingId === product.prodcode ? 'progress_activity' : 'delete'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <footer className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-surface-container">
            <p className="text-xs font-medium text-on-surface-variant">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{' '}
              {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-on-surface-variant">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-on-primary'
                          : 'hover:bg-surface-container-highest text-on-surface'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </footer>
        )}
      </section>

      {/* Bottom Info Boxes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-blue-700">info</span>
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100">Inventory Status</h3>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed opacity-80">
            All product data is synced with the Central Repository. Pricing reflects current institutional contracts.
          </p>
        </div>
        <div className="p-6 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-3 mb-3 text-slate-700 dark:text-slate-200">
            <span className="material-symbols-outlined">history</span>
            <h3 className="font-bold text-sm">Last Update</h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">
            Inventory catalog last updated today at 08:45 AM by Administrator.
          </p>
        </div>
        <div className="p-6 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-3 mb-3 text-slate-700 dark:text-slate-200">
            <span className="material-symbols-outlined">security</span>
            <h3 className="font-bold text-sm">Audit Trail</h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">
            All changes to product listings are logged for compliance with academic procurement standards.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProductListPage;
