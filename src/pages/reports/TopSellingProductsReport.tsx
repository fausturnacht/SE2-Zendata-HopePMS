/**
 * @file pages/reports/TopSellingProductsReport.tsx
 * @description REP-002: Top 10 selling products by quantity.
 *
 * This report visualizes sales performance using a dual-mode display:
 *   - Chart view: Recharts BarChart showing quantity sold per product code.
 *   - Table view: Data table listing the top sellers with their ranks and totals.
 *
 * Data is aggregated client-side from the `salesdetail` table.
 * Restricted to SUPERADMIN role only.
 *
 * @see {@link ../../api/reports.ts} — getTopSellers() aggregation logic
 */
import { useState, useEffect } from 'react';
import { getTopSellers } from '../../api/reports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Table as TableIcon } from 'lucide-react';

export default function TopSellingProductsReport() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'both' | 'table'>('both');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getTopSellers(10);
        setData(res);
      } catch (error) {
        console.error('Error fetching top sellers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Report...</div>;
  }

  // Format data for chart
  const chartData = data.map(item => ({
    name: item.description || item.prodcode,
    productCode: item.prodcode,
    sold: item.total_sales_quantity || 0
  }));

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(42,52,57,0.06)] p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Top Selling Products</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Ranked by overall sales volume this quarter.</p>
        </div>
        <div className="flex bg-surface-container rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('both')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
              viewMode === 'both' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Chart
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
              viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <TableIcon className="w-4 h-4" /> Table
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid grid-cols-1 ${viewMode === 'both' ? 'lg:grid-cols-2' : ''} gap-12`}>
        
        {/* Chart Section */}
        {viewMode === 'both' && (
          <div className="flex flex-col justify-center h-[400px]">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                   <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis dataKey="name" type="category" width={150} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                     cursor={{ fill: '#f1f5f9' }}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="sold" fill="#1353d8" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-on-surface-variant">
                 No sales data available.
               </div>
             )}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-surface-container-low rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="text-xs font-label uppercase text-on-surface-variant pb-4 font-semibold w-16">Rank</th>
                <th className="text-xs font-label uppercase text-on-surface-variant pb-4 font-semibold w-32">Product Code</th>
                <th className="text-xs font-label uppercase text-on-surface-variant pb-4 font-semibold">Description</th>
                <th className="text-xs font-label uppercase text-on-surface-variant pb-4 font-semibold text-right">Total Sold</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center text-on-surface-variant">No sales data.</td></tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.prodcode} className="group hover:bg-surface-container-lowest transition-colors rounded-lg">
                    <td className="py-3 px-2 font-bold text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant font-mono text-xs">{item.prodcode}</td>
                    <td className="py-3 px-2 text-on-surface font-medium">{item.description || '—'}</td>
                    <td className="py-3 px-2 font-semibold text-on-surface text-right">{item.total_sales_quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
