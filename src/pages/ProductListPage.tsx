import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, type Product, type UserType } from '../api/products';
import { getPriceHistory, type PriceEntry } from '../api/priceHistory';
import { useRights } from '../hooks/useRights';
import { AddProductModal } from '../components/products/AddProductModal';
import { EditProductModal } from '../components/products/EditProductModal';
import { SoftDeleteConfirmDialog } from '../components/products/SoftDeleteConfirmDialog';
import { PriceHistoryPanel } from '../components/products/PriceHistoryPanel';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, ChevronLeft, ChevronRight, Info, History, Shield, Plus } from 'lucide-react';

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading products...</p>
        </div>
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
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium bg-[#1a56db] text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold pr-1">ROLE-BASED ACCESS</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content Area: Search + Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-[#f8fafc]">
          <div className="relative w-full max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product code, description, or unit..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Product Code
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Description
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Unit
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Current Price
                </th>
                {hasRight('STAMP') && (
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    Stamp
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
                      <td className="px-6 py-5 text-sm font-semibold text-[#1a56db]">
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${product.stamp === 'VERIFIED' ? 'bg-[#e0e7ff] text-[#3730a3]' : 'bg-slate-100 text-slate-500'}`}>
                          {product.stamp || 'Verified'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(product.prodcode)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          aria-label={expandedRows[product.prodcode] ? 'Collapse price history' : 'Expand price history'}
                        >
                          {expandedRows[product.prodcode] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {hasRight('EDIT_PRODUCT') && (
                          <button
                            onClick={() => handleEdit(product.prodcode)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                            ? 'bg-[#1a56db] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
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
        <div className="p-6 bg-[#f0f4ff] rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#1a56db] text-white p-1 rounded-full">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1e3a8a]">Inventory Status</h3>
          </div>
          <p className="text-xs text-[#1e40af] leading-relaxed">
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
        onProductAdded={(newProduct) => {
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
