import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { LayoutDashboard, Package, BarChart2, ShieldAlert, Trash2, Bell, LogOut, Menu, X } from 'lucide-react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { currentUser, signOut } = useAuth();
  const { isAdmin, isSuperAdmin } = useRights();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
    { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/products' },
    { name: 'Reports', icon: <BarChart2 className="w-5 h-5" />, href: '/reports' },
    { name: 'Admin', icon: <ShieldAlert className="w-5 h-5" />, href: '/admin', subtitle: 'Admin/SuperAdmin only' },
    ...(isAdmin || isSuperAdmin ? [{ name: 'Deleted Items', icon: <Trash2 className="w-5 h-5" />, href: '/deleted', subtitle: 'Admin/SuperAdmin only' }] : []),
  ];

  const userInitials = currentUser?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="flex bg-[#f7f9fb] min-h-screen font-sans text-slate-800">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#f8fafc] border-r border-slate-200 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900">HOPE PMS</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Product Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`mt-0.5 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 m-4 rounded-xl bg-slate-100/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            {userInitials}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold truncate capitalize">{userName}</span>
            <span className="text-xs text-slate-500">Staff Member</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="hidden sm:block text-[15px] font-medium text-slate-600">Product Management System</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={signOut}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
