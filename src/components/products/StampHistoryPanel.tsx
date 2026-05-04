import React, { useEffect, useState } from 'react';
import { getStampHistory, type StampEntry } from '../../api/stampHistory';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

interface StampHistoryPanelProps {
  productId: string;
  isOpen: boolean;
  colSpan: number;
}

export const StampHistoryPanel: React.FC<StampHistoryPanelProps> = ({
  productId,
  isOpen,
  colSpan,
}) => {
  const [history, setHistory] = useState<StampEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset cached data whenever the panel is closed
  useEffect(() => {
    if (!isOpen) {
      setHistory(null);
      setFetchError(null);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Fetch on open (only when history is null)
  useEffect(() => {
    if (!isOpen || history !== null) {
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await getStampHistory(productId);
        setHistory(data);
      } catch (error) {
        console.error('Stamp history load error:', error);
        setFetchError('Unable to load stamp history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, history, productId]);

  if (!isOpen) {
    return null;
  }

  const totalPages = history ? Math.max(1, Math.ceil(history.length / PAGE_SIZE)) : 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = history ? history.slice(startIndex, startIndex + PAGE_SIZE) : [];

  return (
    <tr className="bg-surface-container-lowest">
      <td colSpan={colSpan} className="px-6 pb-4 pt-0">
        <div className="rounded-[2rem] border border-surface-container-highest bg-white shadow-sm p-6">
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-2">
                Stamp History
              </p>
              <p className="text-sm text-slate-700">
                Audit trail of all recorded stamp events for this product.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50">
            {isLoading ? (
              <div className="flex items-center justify-center px-6 py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : fetchError ? (
              <div className="px-6 py-6 text-sm text-red-700">{fetchError}</div>
            ) : (
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs uppercase tracking-[0.22em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Stamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pageItems.length > 0 ? (
                    pageItems.map((entry, idx) => (
                      <tr key={entry.id} className="bg-white">
                        <td className="px-4 py-4 text-slate-400 font-mono text-xs w-12">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-800 text-xs tracking-wide">
                          {entry.stamp}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No stamp history found for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && !fetchError && history && history.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, history.length)} of{' '}
                {history.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                        <span className="px-1 text-slate-400 text-xs">…</span>
                      )}
                      <button
                        type="button"
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

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
