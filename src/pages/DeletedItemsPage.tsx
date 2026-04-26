import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeletedProducts, recoverProduct, type Product } from '../api/products';
import { useRights } from '../hooks/useRights';

const ITEMS_PER_PAGE = 10;

export default function DeletedItemsPage() {
  const { isAdmin, isSuperAdmin } = useRights();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      navigate('/products', { replace: true });
    }
  }, [isAdmin, isSuperAdmin, navigate]);

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

  // Handle search
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.prodcode.toLowerCase().includes(searchLower) ||
      (product.description?.toLowerCase().includes(searchLower) ?? false)
    );
  });

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
          <span className="material-symbols-outlined text-lg text-slate-400">info</span>
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
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
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
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold w-56 text-primary tracking-widest">Product Code</th>
                <th className="px-6 py-4 font-semibold text-primary tracking-widest">Description</th>
                <th className="px-6 py-4 font-semibold w-48 text-primary tracking-widest">Deletion Stamp</th>
                <th className="px-6 py-4 font-semibold text-right w-32 text-primary tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                       <span>Loading archived products...</span>
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
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
                      <p className="text-xs text-slate-500 mt-0.5">Unit: {product.unit || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div><span className="font-medium text-slate-700">{product.stamp || 'System generated'}</span></div>
                      <div className="opacity-70 mt-0.5 border border-slate-200 mt-1 inline-block px-1 rounded bg-slate-100 text-slate-400">DELETED</div>
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
