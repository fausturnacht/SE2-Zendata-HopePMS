import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeletedProducts, recoverProduct, type Product } from '../api/products';
import { useRights } from '../contexts/UserRightsContext';
import { Search, Filter, ArrowUpDown, ChevronDown, Info } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function DeletedItemsPage() {
  const { isAdmin, isSuperAdmin, loadingRights } = useRights();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (!loadingRights && !isAdmin && !isSuperAdmin) {
      navigate('/products', { replace: true });
    }
  }, [isAdmin, isSuperAdmin, navigate, loadingRights]);

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDeletedProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching deleted products:', err);
        setError('Failed to load deleted products');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin || isSuperAdmin) {
      fetchDeleted();
    }
  }, [isAdmin, isSuperAdmin]);

  // Handle search, filter, sort
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
        const aValue = a[sortConfig.key as keyof Product] || '';
        const bValue = b[sortConfig.key as keyof Product] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, products, filterCategory, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleRecover = async (prodcode: string) => {
    try {
      await recoverProduct(prodcode);
      setProducts(products.filter(p => p.prodcode !== prodcode));
    } catch (err) {
      console.error('Failed to recover product:', err);
      alert('Failed to recover product. See console for details.');
    }
  };

  if (loadingRights) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Archived Products
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-error-container text-on-error-container">
                Admin / Superadmin Only
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Review and recover products that have been soft-deleted from the active inventory. Permanent deletion is not supported from this interface.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg text-sm text-slate-600 shadow-sm border border-slate-200">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Items here are retained for 90 days.</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        {/* Table Controls/Filters */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                placeholder="Search archive..." 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-slate-800 appearance-none cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Units' : cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
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
                className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-slate-800 appearance-none cursor-pointer"
              >
                <option value="">Sort by...</option>
                <option value="prodcode-asc">Product Code (A-Z)</option>
                <option value="prodcode-desc">Product Code (Z-A)</option>
                <option value="description-asc">Description (A-Z)</option>
                <option value="description-desc">Description (Z-A)</option>
                <option value="stamp-asc">Deletion Date (Oldest)</option>
                <option value="stamp-desc">Deletion Date (Newest)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th onClick={() => handleSort('prodcode')} className="px-6 py-4 font-semibold w-56 text-primary tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    Product Code
                    {sortConfig?.key === 'prodcode' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('description')} className="px-6 py-4 font-semibold text-primary tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    Description
                    {sortConfig?.key === 'description' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('unit')} className="px-6 py-4 font-semibold w-32 text-primary tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    Unit
                    {sortConfig?.key === 'unit' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('stamp')} className="px-6 py-4 font-semibold w-48 text-primary tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    Deletion Stamp
                    {sortConfig?.key === 'stamp' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-right w-32 text-primary tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                       <span>Loading archived products...</span>
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                     {searchTerm ? 'No archived products match your search.' : 'No archived products available.'}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product.prodcode} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-primary font-semibold">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-sm">inventory</span>
                        </div>
                        <span>{product.prodcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{product.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        {product.unit || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="font-medium text-slate-700">{product.stamp?.replace('DELETED ', '') || 'System generated'}</div>
                      <div className="opacity-70 mt-1 inline-block px-1 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold">DELETED</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRecover(product.prodcode)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors uppercase tracking-wide disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                        <span>Recover</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(endIndex, filteredProducts.length)}</span> of <span className="font-medium text-slate-900">{filteredProducts.length}</span> archived items
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                aria-label="Previous Page"
               >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                aria-label="Next Page"
               >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
