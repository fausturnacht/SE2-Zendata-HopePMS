/**
 * @file pages/ProductListPage.tsx
 * @description Primary product management interface with full CRUD capabilities.
 *
 * This is the most complex page in the application. Key features:
 *
 * Data pipeline (search → filter → sort → paginate):
 *   1. Search: text-match against prodcode OR description (case-insensitive)
 *   2. Filter: by unit type (optional dropdown)
 *   3. Sort: by prodcode, description, unit, or price (asc/desc toggle)
 *   4. Paginate: 10 items per page with prev/next navigation
 *
 * State management:
 *   - Products are fetched once on mount and stored in local state
 *   - Prices are fetched separately and merged via a prodcode→price map
 *   - Expandable rows (price history, stamp history) are tracked per product
 *   - Modal state (add/edit/delete) is managed via useState flags
 *
 * Role-gated UI elements (via hasRight()):
 *   - ADD_PRODUCT: "Add Product" button visibility
 *   - EDIT_PRODUCT: Edit button per row
 *   - DELETE_PRODUCT: Delete button per row
 *   - STAMP: Stamp column visibility in the table
 *
 * @see {@link ../api/products.ts} — Product CRUD
 * @see {@link ../api/priceHistory.ts} — Price data
 * @see {@link ../components/products/} — All product modal/panel components
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, type Product } from '../api/products';
import { getPriceHistory, type PriceEntry } from '../api/priceHistory';
import { useRights } from '../contexts/UserRightsContext';
import { AddProductModal } from '../components/products/AddProductModal';
import { EditProductModal } from '../components/products/EditProductModal';
import { SoftDeleteConfirmDialog } from '../components/products/SoftDeleteConfirmDialog';
import { PriceHistoryPanel } from '../components/products/PriceHistoryPanel';
import { StampHistoryPanel } from '../components/products/StampHistoryPanel';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, ChevronLeft, ChevronRight, Info, History, Shield, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { SkeletonTable } from '../components/shared/SkeletonTable';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorBanner } from '../components/shared/ErrorBanner';

/** Number of products displayed per page in the data table. */
const ITEMS_PER_PAGE = 10;

export const ProductListPage: React.FC = () => {
  const { hasRight } = useRights();

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const deletingId: string | null = null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await getProducts();
      setProducts(data);

      const priceData = await getPriceHistory();
      const newPriceMap: Record<string, number> = {};
      if (priceData && Array.isArray(priceData)) {
        priceData.forEach((entry: PriceEntry) => {
          if (!newPriceMap[entry.prodcode]) {
            newPriceMap[entry.prodcode] = entry.unitprice;
          }
        });
      }
      setPriceMap(newPriceMap);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  // Handle search and sorting
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.unit) cats.add(p.unit);
    });
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    let result = products;

    if (filterCategory !== 'All') {
      result = result.filter(p => p.unit === filterCategory);
    }

    result = result.filter((product) =>
      product.prodcode.toLowerCase().includes(searchLower) ||
      (product.description?.toLowerCase().includes(searchLower) ?? false)
    );

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'price') {
          aValue = priceMap[a.prodcode] || 0;
          bValue = priceMap[b.prodcode] || 0;
        } else {
          aValue = a[sortConfig.key as keyof Product] || '';
          bValue = b[sortConfig.key as keyof Product] || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, products, filterCategory, sortConfig, priceMap]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500">Manage institutional procurement items and inventory.</p>
          </div>
        </div>
        <SkeletonTable columns={hasRight('STAMP') ? 6 : 5} />
      </div>
    );
  }

  if (products.length === 0 && !error) {
    return (
      <div className="space-y-8 pb-10 flex flex-col min-h-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500">Manage institutional procurement items and inventory.</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium bg-primary text-on-primary hover:bg-primary-dim transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold pr-1">ROLE-BASED ACCESS</p>
          </div>
        </div>

        <EmptyState 
          message="No products found. Add your first product to get started." 
          ctaLabel={hasRight('ADD_PRODUCT') ? "Add Product" : undefined}
          onCtaClick={hasRight('ADD_PRODUCT') ? () => setIsModalOpen(true) : undefined} 
        />

        {/* Add Product Modal */}
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProductAdded={(newProduct, initialPrice) => {
            setProducts([...products, newProduct]);
            if (initialPrice !== undefined) {
              setPriceMap(prev => ({ ...prev, [newProduct.prodcode]: initialPrice }));
            }
            setCurrentPage(1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage institutional procurement items and inventory.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium bg-primary text-on-primary hover:bg-primary-dim transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold pr-1">ROLE-BASED ACCESS</p>
        </div>
      </div>

      <ErrorBanner error={error} onRetry={fetchProducts} />

      {/* Main Content Area: Search + Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-surface-container-low">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product code, description, or unit..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 text-sm placeholder:text-slate-400"
              />
            </div>
            <div className="relative sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 text-sm text-slate-700 appearance-none cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Units' : cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative sm:w-64">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSortConfig(null);
                  } else {
                    const [key, direction] = val.split('-');
                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                  }
                }}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Sort by...</option>
                <option value="prodcode-asc">Product Code (A-Z)</option>
                <option value="prodcode-desc">Product Code (Z-A)</option>
                <option value="description-asc">Description (A-Z)</option>
                <option value="description-desc">Description (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th 
                  onClick={() => handleSort('prodcode')}
                  className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Product Code
                    {sortConfig?.key === 'prodcode' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('description')}
                  className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Description
                    {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('unit')}
                  className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Unit
                    {sortConfig?.key === 'unit' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Current Price
                </th>
                {hasRight('STAMP') && (
                  <th 
                    onClick={() => handleSort('stamp')}
                    className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Stamp
                      {sortConfig?.key === 'stamp' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={hasRight('STAMP') ? 6 : 5}
                    className="px-6 py-8 text-center text-slate-500 text-sm"
                  >
                    {filteredProducts.length === 0 && searchTerm
                      ? 'No products match your search'
                      : 'No products available'}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <React.Fragment key={product.prodcode}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-semibold text-primary">
                      {product.prodcode}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-900">
                        {product.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {product.unit || '—'}
                    </td>
                    <td className="px-6 py-5 text-sm font-extrabold text-slate-900">
                      ${(priceMap[product.prodcode] ?? 0).toFixed(2)}
                    </td>
                    {hasRight('STAMP') && (
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-500 font-mono">
                          {product.stamp || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(product.prodcode)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                          aria-label={expandedRows[product.prodcode] ? 'Collapse price history' : 'Expand price history'}
                        >
                          {expandedRows[product.prodcode] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {hasRight('EDIT_PRODUCT') && (
                          <button
                            onClick={() => handleEdit(product.prodcode)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasRight('DELETE_PRODUCT') && (
                          <button
                            onClick={() => handleDelete(product.prodcode)}
                            disabled={deletingId === product.prodcode}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  {hasRight('STAMP') && (
                    <StampHistoryPanel
                      productId={product.prodcode}
                      isOpen={!!expandedRows[product.prodcode]}
                      colSpan={hasRight('STAMP') ? 6 : 5}
                    />
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <p className="text-xs font-medium text-slate-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{' '}
              {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
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
                        <span className="px-2 text-slate-400 text-sm">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-on-primary'
                            : 'text-outline hover:bg-surface-container-low'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-primary-container/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary text-on-primary p-1 rounded-full">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-on-primary-container">Inventory Status</h3>
          </div>
          <p className="text-xs text-on-primary-fixed-variant leading-relaxed">
            All product data is synced with the Central Repository. Pricing reflects current institutional contracts.
          </p>
        </div>
        <div className="p-6 bg-slate-50/80 border border-slate-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-slate-600">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Last Update</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inventory catalog last updated today at 08:45 AM by Administrator.
          </p>
        </div>
        <div className="p-6 bg-slate-50/80 border border-slate-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-slate-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All changes to product listings are logged for compliance with academic procurement standards.
          </p>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={(newProduct, initialPrice) => {
          setProducts([...products, newProduct]);
          if (initialPrice !== undefined) {
            setPriceMap(prev => ({ ...prev, [newProduct.prodcode]: initialPrice }));
          }
          setCurrentPage(1);
        }}
      />

      {/* Edit Product Modal */}
      {selectedProductForEdit && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProductForEdit}
          currentPrice={priceMap[selectedProductForEdit.prodcode]}
          onProductSaved={(updatedProduct, newPrice) => {
            setProducts(products.map(p => p.prodcode === updatedProduct.prodcode ? updatedProduct : p));
            if (newPrice !== undefined) {
              setPriceMap(prev => ({ ...prev, [updatedProduct.prodcode]: newPrice }));
            }
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
