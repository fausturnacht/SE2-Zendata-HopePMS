import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, 
  Package, 
  Users, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { getProducts, type Product, verifyAllProducts } from '../api/products';
import { fetchAllUsers, getPendingUsers } from '../api/users';
import { getTopSellers } from '../api/reports';
import { useRights } from '../contexts/UserRightsContext';
import { Link } from 'react-router-dom';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { SkeletonTable } from '../components/shared/SkeletonTable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Home() {
  const { hasRight, isSuperAdmin } = useRights();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyAll = async () => {
    try {
      setIsVerifying(true);
      await verifyAllProducts();
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to verify products:', err);
      setError('Failed to bulk verify products.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [productsData, usersData, pendingUsersData, reportsData] = await Promise.all([
        getProducts(),
        hasRight('ADM_USER') ? fetchAllUsers() : Promise.resolve([]),
        hasRight('ADM_USER') ? getPendingUsers() : Promise.resolve([]),
        hasRight('REP_002') ? getTopSellers(5) : Promise.resolve([])
      ]);

      setProducts(productsData);
      setActiveUsersCount(usersData.length);
      setPendingUsersCount(pendingUsersData.length);
      setTopSellers(reportsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Failed to load dashboard metrics. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [hasRight]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => {
    const total = products.length;
    const verified = products.filter(p => p.stamp === 'VERIFIED').length;
    const rejected = products.filter(p => p.stamp === 'REJECTED').length;
    const pendingReview = total - verified - rejected;
    
    return {
      total,
      verified,
      rejected,
      pendingReview
    };
  }, [products]);

  const pieData = useMemo(() => [
    { name: 'Verified', value: stats.verified, color: '#10b981' },
    { name: 'Pending', value: stats.pendingReview, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ].filter(item => item.value > 0), [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-1/3 bg-slate-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-200 p-6 rounded-2xl animate-pulse">
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-4"></div>
              <div className="h-8 w-1/3 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
        <SkeletonTable columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>SYSTEM OVERVIEW</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Real-time insights across products, user authorization, and sales performance.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button 
                onClick={handleVerifyAll}
                disabled={isVerifying}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isVerifying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                {isVerifying ? 'Verifying...' : 'Verify All Products'}
              </button>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Status</div>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-slate-700">Online</span>
              </div>
            </div>
        </div>
      </div>

      <ErrorBanner error={error} onRetry={fetchDashboardData} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/products" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-500 mt-1">Total Products</div>
        </Link>

        {hasRight('ADM_USER') && (
          <Link to="/admin" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-1" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeUsersCount}</div>
            <div className="text-sm text-slate-500 mt-1">Active Users</div>
          </Link>
        )}

        {hasRight('ADM_USER') && pendingUsersCount > 0 && (
          <Link to="/admin" className="group bg-rose-50 border-rose-100 p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-bounce">URGENT</div>
            </div>
            <div className="text-2xl font-bold text-rose-700">{pendingUsersCount}</div>
            <div className="text-sm text-rose-600 mt-1">Pending Authorizations</div>
          </Link>
        )}

        <Link to="/products" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-all group-hover:translate-x-1" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pendingReview}</div>
          <div className="text-sm text-slate-500 mt-1">Products Pending Review</div>
        </Link>

        {(!hasRight('ADM_USER') || pendingUsersCount === 0) && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">12%</div>
            <div className="text-sm text-slate-500 mt-1">Weekly Growth</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inventory Distribution</h3>
                <p className="text-xs text-slate-400 mt-1">Breakdown of verified vs pending review products</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-[240px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value} Items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {hasRight('REP_002') && topSellers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
                  <p className="text-xs text-slate-400 mt-1">Quantity sold by product code</p>
                </div>
                <Link to="/reports/top-selling" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider">
                  Full Report <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellers}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="prodcode" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="total_sales_quantity" radius={[4, 4, 0, 0]} barSize={32}>
                      {topSellers.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* System Activity & Alerts */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] text-white rounded-2xl p-6 shadow-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-700/50 rounded-lg text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Security Alerts</h3>
            </div>
            
            <div className="space-y-4">
              {pendingUsersCount > 0 ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <div className="flex items-center gap-3 text-rose-400 mb-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">High Priority</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">
                    {pendingUsersCount} new user requests require authorization. 
                  </p>
                  <Link to="/admin" className="mt-4 block text-center py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-bold transition-colors">
                    Review Requests
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-slate-500">
                  <ShieldCheck className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-widest">System Secure</p>
                  <p className="text-[10px] opacity-60">All access points verified</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">New Product</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Add to catalog</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              {hasRight('ADM_USER') && (
                <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">Manage Users</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Review permissions</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>
              )}

              {hasRight('REP_001') && (
                <Link to="/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">Export Reports</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Generate PDF/Excl</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

