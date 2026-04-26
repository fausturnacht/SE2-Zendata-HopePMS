import { useState, useEffect } from 'react';
import { Bell, MoreVertical, SlidersHorizontal } from 'lucide-react';
import { getProducts, type Product } from '../api/products';
import { useRights } from '../hooks/useRights';

export default function Home() {
  const { isSuperAdmin, isAdmin } = useRights();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getProducts(isSuperAdmin ? 'SUPERADMIN' : isAdmin ? 'ADMIN' : 'USER');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch dashboard products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [isSuperAdmin, isAdmin]);

  const totalProducts = products.length;
  const verifiedProducts = products.filter(p => p.stamp === 'VERIFIED').length;
  const pendingProducts = totalProducts - verifiedProducts;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Monitor product inventory, track pricing metrics, and manage catalog resources efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between z-10 relative mb-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#1a56db] bg-[#e0e7ff] px-3 py-1 rounded-full">
              Primary Analytics
            </span>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 z-10 relative mb-6">Product Inventory Metrics</h2>

          <div className="flex-1 min-h-[160px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50 mb-6 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Inventory Categorization Chart
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 z-10 relative">
            <div>
              <div className="text-3xl font-bold text-[#1a56db]">
                {isLoading ? '...' : totalProducts}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Total Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {isLoading ? '...' : verifiedProducts}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Verified Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {isLoading ? '...' : pendingProducts}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Pending Review</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Recent Alerts */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] text-[#1a56db] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Alerts</h3>
            </div>
            
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <p className="text-sm text-slate-600 leading-snug">Low stock warning for A4 Printer Paper</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a56db] mt-1.5 shrink-0"></div>
                <p className="text-sm text-slate-600 leading-snug">Price updated for Digital Projector - 4K</p>
              </li>
            </ul>

            <button className="text-xs font-bold text-[#1a56db] hover:text-blue-800 tracking-wider uppercase transition-colors">
              View All Notifications
            </button>
          </div>

          {/* Configure View */}
          <div className="bg-white border text-center border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 text-slate-300 flex items-center justify-center mb-4">
               <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Configure View</h3>
            <p className="text-sm text-slate-500 px-4 mb-6 leading-relaxed">
              Add or remove metrics from your main dashboard canvas.
            </p>
            <button className="w-full py-2.5 rounded-lg bg-[#1a56db] text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Edit Layout
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Chart Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-900">Inventory Flux</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="px-4 py-1.5 text-xs font-medium text-slate-600 rounded-md">Daily</button>
            <button className="px-4 py-1.5 text-xs font-medium bg-[#e0e7ff] text-[#1a56db] rounded-md shadow-sm">Weekly</button>
          </div>
        </div>
        
        <div className="h-48 w-full relative mb-4 flex items-end">
          {/* Mock Chart SVG */}
          <svg className="w-full h-full text-blue-500/20" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path 
              d="M 0,200 L 0,150 C 200,100 300,180 500,160 C 700,140 800,40 1000,20 L 1000,200 Z" 
              fill="currentColor" 
              className="text-[#eef2ff]"
            />
            <path 
              d="M 0,150 C 200,100 300,180 500,160 C 700,140 800,40 1000,20" 
              fill="none" 
              stroke="#acc1ff" 
              strokeWidth="2"
            />
             <path 
              d="M 0,180 C 200,190 300,130 500,150 C 700,170 800,90 1000,110" 
              fill="none" 
              stroke="#cbd5e1" 
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 px-2 uppercase tracking-wider">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}
