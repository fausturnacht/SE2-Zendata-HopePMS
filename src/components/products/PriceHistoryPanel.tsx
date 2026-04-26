import React, { useEffect, useState } from 'react';
import { addPriceEntry, getPriceHistory, type PriceEntry } from '../../api/priceHistory';

interface PriceHistoryPanelProps {
  productId: string;
  isOpen: boolean;
  onToggle: () => void;
  onPriceSaved?: (unitPrice: number) => void;
  colSpan: number;
}

export const PriceHistoryPanel: React.FC<PriceHistoryPanelProps> = ({
  productId,
  isOpen,
  onToggle,
  onPriceSaved,
  colSpan,
}) => {
  const [history, setHistory] = useState<PriceEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [effDate, setEffDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [unitPrice, setUnitPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || history !== null) {
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await getPriceHistory(productId);
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Price history load error:', error);
        setFetchError('Unable to load price history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, history, productId]);

  const handleSave = async () => {
    const parsedPrice = parseFloat(unitPrice);
    if (!effDate) {
      setSaveError('Please select an effective date.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setSaveError('Please enter a valid price greater than 0.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const saved = await addPriceEntry({
        prodcode: productId,
        effdate: effDate,
        unitprice: parsedPrice,
        record_status: 'ACTIVE',
      });

      if (saved) {
        setHistory((prev) => [saved as PriceEntry, ...(prev ?? [])]);
        setUnitPrice('');
        setSaveSuccess(true);
        onPriceSaved?.(parsedPrice);
      }
    } catch (error) {
      console.error('Price history save error:', error);
      setSaveError('Unable to save new price. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <tr className="bg-surface-container-lowest">
      <td colSpan={colSpan} className="px-6 py-4">
        <div className="rounded-[2rem] border border-surface-container-highest bg-white shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-2">
                Price History
              </p>
              <p className="text-sm text-slate-700">
                Review historical effective dates and add a new unit price for this item.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="material-symbols-outlined text-base">expand_less</span>
              Collapse
            </button>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50">
              {isLoading ? (
                <div className="flex items-center justify-center px-6 py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : fetchError ? (
                <div className="px-6 py-6 text-sm text-red-700">{fetchError}</div>
              ) : (
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Effective Date</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(history && history.length > 0) ? (
                      history.map((entry) => (
                        <tr key={`${entry.prodcode}-${entry.effdate}`} className="bg-white">
                          <td className="px-4 py-4 font-medium text-slate-800">{entry.effdate}</td>
                          <td className="px-4 py-4 text-right font-semibold text-slate-900">
                            ${entry.unitprice.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-500">
                          No historical prices found for this product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="grid flex-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_1fr]">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Effective Date
                    <input
                      type="date"
                      value={effDate}
                      onChange={(e) => setEffDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Price
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-9 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex w-full justify-end sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {(saveError || saveSuccess) && (
                <div className="mt-4 text-sm">
                  {saveError && <p className="text-red-700">{saveError}</p>}
                  {saveSuccess && <p className="text-emerald-700">Price entry saved successfully.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
