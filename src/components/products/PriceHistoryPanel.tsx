import React, { useEffect, useState } from 'react';
import { addPriceEntry, getPriceHistory, type PriceEntry } from '../../api/priceHistory';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
} from 'recharts';

interface PriceHistoryPanelProps {
  productId: string;
  isOpen: boolean;
  onToggle: () => void;
  onPriceSaved?: (unitPrice: number) => void;
  colSpan: number;
}

// Custom tooltip for the chart
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-[#1a56db] font-bold">${Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
};

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

  // Reset cached data whenever the panel is closed so the next open always
  // triggers a fresh fetch from the API.
  useEffect(() => {
    if (!isOpen) {
      setHistory(null);
      setFetchError(null);
    }
  }, [isOpen]);

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
        const updatedHistory = [saved as PriceEntry, ...(history ?? [])];
        setHistory(updatedHistory);
        setUnitPrice('');
        setSaveSuccess(true);

        // Only update the displayed "Current Price" if this entry is actually
        // the most recent effective date across all entries.
        const latestDate = updatedHistory.reduce(
          (max, e) => (e.effdate > max ? e.effdate : max),
          ''
        );
        if (effDate >= latestDate) {
          onPriceSaved?.(parsedPrice);
        }
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

  // Build chart data: sorted chronologically ascending so the line reads left → right over time
  const chartData = history
    ? [...history]
        .sort((a, b) => (a.effdate < b.effdate ? -1 : a.effdate > b.effdate ? 1 : 0))
        .map((e) => ({
          date: e.effdate,
          price: Number(e.unitprice),
        }))
    : [];

  const singlePoint = chartData.length === 1;

  // Build sorted history for the table (descending by date)
  const sortedHistory = history
    ? [...history].sort((a, b) => (a.effdate < b.effdate ? 1 : a.effdate > b.effdate ? -1 : 0))
    : [];

  return (
    <tr className="bg-surface-container-lowest">
      <td colSpan={colSpan} className="px-6 py-4">
        <div className="rounded-[2rem] border border-surface-container-highest bg-white shadow-sm p-6">
          {/* Header */}
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

          {/* Two-column body: table+form | chart */}
          <div className="flex flex-col gap-4 lg:flex-row">

            {/* LEFT — History table + add entry form */}
            <div className="flex-1 min-w-0 space-y-4">
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
                        <th className="px-4 py-3">Effective Date</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedHistory && sortedHistory.length > 0 ? (
                        sortedHistory.map((entry) => (
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

              {/* Add entry form */}
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
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
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
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

            {/* RIGHT — Price trend chart */}
            <div className="flex-1 min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-4">
                Price Trend
              </p>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : !history || history.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-slate-400">No data to chart yet.</p>
                </div>
              ) : (
                <div className="flex-1" style={{ minHeight: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                        width={52}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#1a56db"
                        strokeWidth={2}
                        dot={
                          singlePoint
                            ? // For a single point, render a visible filled circle
                              <Dot r={6} fill="#1a56db" stroke="#fff" strokeWidth={2} />
                            : { r: 4, fill: '#1a56db', stroke: '#fff', strokeWidth: 2 }
                        }
                        activeDot={{ r: 6, fill: '#1a56db', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
