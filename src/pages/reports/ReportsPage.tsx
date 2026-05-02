import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRights } from '../../hooks/useRights';
import FullProductListingReport from './FullProductListingReport';
import TopSellingProductsReport from './TopSellingProductsReport';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { hasRight } = useRights();
  const navigate = useNavigate();

  const canViewReports = hasRight('REP_001') || hasRight('REP_002');
  
  useEffect(() => {
    if (!canViewReports) {
      navigate('/products');
    }
  }, [canViewReports, navigate]);

  const [activeTab, setActiveTab] = useState<'REP_001' | 'REP_002'>(hasRight('REP_001') ? 'REP_001' : 'REP_002');

  if (!canViewReports) return null;

  return (
    <main className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col gap-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Reports Overview</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
              Access generated academic and inventory reporting. Select a specific report scope to view detailed datasets and export capabilities.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 pb-px w-full overflow-x-auto no-scrollbar">
        {hasRight('REP_001') && (
          <button
            onClick={() => setActiveTab('REP_001')}
            className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'REP_001'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            REP-001: Full Product Listing
          </button>
        )}
        {hasRight('REP_002') && (
          <button
            onClick={() => setActiveTab('REP_002')}
            className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'REP_002'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            REP-002: Top Selling Products
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col max-w-full relative z-10">
        {activeTab === 'REP_001' && <FullProductListingReport />}
        {activeTab === 'REP_002' && <TopSellingProductsReport />}
      </div>
    </main>
  );
}
