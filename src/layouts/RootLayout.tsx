import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { currentUser, signOut } = useAuth();
  const { isAdmin, isSuperAdmin } = useRights();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigationItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard', active: true },
    { name: 'Products', icon: 'inventory_2', href: '/products', active: false },
    { name: 'Reports', icon: 'analytics', href: '/reports', active: false },
    { name: 'Admin', icon: 'admin_panel_settings', href: '/admin', active: false },
    ...(isAdmin || isSuperAdmin ? [{ name: 'Deleted Items', icon: 'delete', href: '/deleted', active: false }] : []),
  ];

  return (
    <div className="bg-surface text-on-surface overflow-hidden font-body">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-800 cursor-pointer active:opacity-70 md:hidden" onClick={toggleSidebar}>menu</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-primary">HOPE INC.</span>
            <span className="text-sm font-medium text-on-surface-variant tracking-widest uppercase opacity-60">PMS</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-xs">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-on-surface">Welcome, {currentUser?.email?.split('@')[0] || 'User'}</span>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50 transition-colors rounded-lg active:opacity-70"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* NavigationDrawer */}
        <aside className={`h-screen w-64 border-r border-slate-200 bg-slate-50 fixed left-0 top-0 mt-14 flex flex-col p-4 gap-2 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:mt-0`}>
          {/* Header Profile Section */}
          <div className="flex flex-col mb-6 px-2">
            <div className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">Welcome, {currentUser?.email?.split('@')[0] || 'User'}</span>
                <span className="text-xs text-on-surface-variant font-medium">Academic Staff</span>
              </div>
            </div>
            <div className="h-px bg-slate-200/50 w-full mb-4"></div>
          </div>
          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                  item.active
                    ? 'bg-blue-50 text-primary font-medium'
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`material-symbols-outlined ${item.active ? "style='font-variation-settings: 'FILL' 1;'" : ''}`}>{item.icon}</span>
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>
          {/* Bottom Guard */}
          <div className="mt-auto p-2">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">Secure Academic Environment</p>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">System V 4.2.1-stable. Restricted access only.</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={toggleSidebar}></div>}

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-64 p-8 overflow-y-auto scrolling-touch bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
};
