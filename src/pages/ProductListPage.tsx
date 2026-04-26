import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, type Product, type UserType } from '../api/products';
import { getPriceHistory, type PriceEntry } from '../api/priceHistory';
import { useRights } from '../hooks/useRights';
import { AddProductModal } from '../components/products/AddProductModal';
import { EditProductModal } from '../components/products/EditProductModal';
import { SoftDeleteConfirmDialog } from '../components/products/SoftDeleteConfirmDialog';
import { PriceHistoryPanel } from '../components/products/PriceHistoryPanel';

const ITEMS_PER_PAGE = 10;

export const ProductListPage: React.FC = () => {
  const { hasRight, userRole } = useRights();

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const deletingId: string | null = null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProducts(userRole as UserType);
        setProducts(data);


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
  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.prodcode.toLowerCase().includes(searchLower) ||
      (product.description?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [searchTerm, products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle delete
  const handleDelete = (prodcode: string) => {
    if (!hasRight('DELETE_PRODUCT')) {
      alert('You do not have permission to delete products');
      return;
    }
    setSelectedProductForDelete(prodcode);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirmed delete
  const handleDeleteConfirmed = () => {
    if (selectedProductForDelete) {
      setProducts(products.filter(p => p.prodcode !== selectedProductForDelete));
    }
  };

  // Handle edit
  const handleEdit = (prodcode: string) => {
    if (!hasRight('EDIT_PRODUCT')) {
      alert('You do not have permission to edit products');
      return;
    }
    const productToEdit = products.find(p => p.prodcode === prodcode);
    if (productToEdit) {
      setSelectedProductForEdit(productToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleToggleExpand = (prodcode: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [prodcode]: !prev[prodcode],
    }));
  };

  const handlePriceSaved = (prodcode: string, unitPrice: number) => {
    setPriceMap((prev) => ({
      ...prev,
      [prodcode]: unitPrice,
    }));
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
      <section className="rounded-[32px] border border-blue-100 bg-white/90 shadow-[0_24px_64px_-40px_rgba(19,83,216,0.45)] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Products</h1>
            <p className="text-base text-slate-600">Manage institutional procurement items and inventory.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-[0_14px_40px_rgba(19,83,216,0.22)] hover:brightness-110 transition-all"
              style={{ backgroundColor: '#1353d8', color: '#ffffff' }}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#ffffff' }}>add</span>
              <span style={{ color: '#ffffff' }}>+ Add Product</span>
            </button>
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/70">MANAGE INVENTORY ITEMS</p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-blue-50/80 rounded-3xl p-5 border border-blue-100 shadow-sm">
        <div className="relative w-full max-w-4xl mx-auto">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-lg opacity-90">
            search
          </span>
          <input
            type="text"
            placeholder="Search by product code, description, or unit..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-14 pr-4 py-4 bg-white border border-blue-100 rounded-3xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm text-slate-800 placeholder:text-slate-400"
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
      <section className="bg-white/95 rounded-[32px] border border-blue-100 shadow-[0_24px_80px_-46px_rgba(19,83,216,0.35)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">
                  Product Code
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">
                  Unit
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">
                  Current Price
                </th>
                {hasRight('STAMP') && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">
                    Stamp
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary text-right">
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
                  <React.Fragment key={product.prodcode}>
                    <tr className="hover:bg-surface-container-low/30 transition-colors group">
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${product.stamp === 'VERIFIED' ? 'bg-primary-container text-primary' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                          {product.stamp || 'Verified'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(product.prodcode)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-container text-primary hover:bg-primary/10 transition-colors"
                          aria-label={expandedRows[product.prodcode] ? 'Collapse price history' : 'Expand price history'}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {expandedRows[product.prodcode] ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {hasRight('EDIT_PRODUCT') && (
                          <button
                            onClick={() => handleEdit(product.prodcode)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
                            title="Edit product"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit
                          </button>
                        )}
                        {hasRight('DELETE_PRODUCT') && (
                          <button
                            onClick={() => handleDelete(product.prodcode)}
                            disabled={deletingId === product.prodcode}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error/10 text-error text-xs font-semibold hover:bg-error/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete product"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  <PriceHistoryPanel
                    productId={product.prodcode}
                    isOpen={!!expandedRows[product.prodcode]}
                    onToggle={() => handleToggleExpand(product.prodcode)}
                    onPriceSaved={(unitPrice) => handlePriceSaved(product.prodcode, unitPrice)}
                    colSpan={hasRight('STAMP') ? 6 : 5}
                  />
                  </React.Fragment>
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={(newProduct) => {
          // Add the new product to the list
          setProducts([...products, newProduct]);
          setCurrentPage(1);
        }}
      />

      {/* Edit Product Modal */}
      {selectedProductForEdit && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProductForEdit}
          onProductSaved={(updatedProduct) => {
            // Update the product in the list
            setProducts(products.map(p => p.prodcode === updatedProduct.prodcode ? updatedProduct : p));
          }}
        />
      )}

      {/* Soft Delete Confirm Dialog */}
      {selectedProductForDelete && (
        <SoftDeleteConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          prodCode={selectedProductForDelete}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default ProductListPage;
