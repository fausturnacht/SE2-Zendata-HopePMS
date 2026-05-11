/**
 * @file layouts/RootLayout.tsx
 * @description Application shell providing the sidebar navigation and top bar.
 *
 * Layout structure:
 *   - Sidebar (left): Collapsible navigation with role-gated menu items
 *   - Top bar: Displays current user email, role badge, and sign-out button
 *   - Content area: Renders the child page component
 *
 * Navigation items and their permission gates:
 *   - Dashboard     — Always visible
 *   - Products      — Always visible
 *   - Reports       — Visible if hasRight('REP_001')
 *   - Admin         — Visible if hasRight('ADM_USER') (Admin/SuperAdmin only)
 *   - Deleted Items — Visible to Admin/SuperAdmin only (direct role check)
 *
 * The sidebar is toggleable on all screen sizes via a hamburger menu button.
 *
 * @see {@link ../contexts/UserRightsContext.tsx} — hasRight() permission checks
 * @see {@link ../hooks/useAuth.ts} — currentUser and signOut
 */
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../contexts/UserRightsContext';
import { LayoutDashboard, Package, BarChart2, ShieldAlert, Trash2, LogOut, Menu } from 'lucide-react';

/**
 * Props for the RootLayout component.
 */
interface RootLayoutProps {
  /** The page content to render inside the layout's main area. */
  children: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { currentUser, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, hasRight } = useRights();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
    { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/products' },
    // Reports link gated: Shows if the user has either REP_001 or REP_002
    ...(hasRight('REP_001') || hasRight('REP_002') ? [{ name: 'Reports', icon: <BarChart2 className="w-5 h-5" />, href: '/reports' }] : []),
    
    // Deleted Items gated: Admin/SuperAdmin only
    ...(isAdmin || isSuperAdmin ? [{ name: 'Deleted Items', icon: <Trash2 className="w-5 h-5" />, href: '/deleted', subtitle: 'Admin/SuperAdmin only' }] : []),

    // Admin Module gated: Shows only if the user has the ADM_USER right
    ...(hasRight('ADM_USER') ? [{ name: 'Manage Users', icon: <ShieldAlert className="w-5 h-5" />, href: '/admin', subtitle: 'Admin/SuperAdmin only' }] : []),
  ];

  const userInitials = currentUser?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const avatarUrl = currentUser?.user_metadata?.avatar_url;

  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Staff Member';

  return (
    <div className="flex bg-surface min-h-screen font-sans text-on-surface">
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#0a1628] border-r border-white/5 flex flex-col transition-all duration-300 shadow-2xl md:shadow-none ${
        sidebarOpen 
          ? 'w-72 translate-x-0 opacity-100' 
          : 'w-0 -translate-x-full opacity-0 pointer-events-none'
      }`}>
        {/* Sidebar Header */}
        <div className="p-8 flex flex-col gap-6 min-w-[288px]">
          <div className="flex items-center gap-4">
            <div className="p-1 bg-white rounded-xl shadow-lg shadow-white/5 shrink-0">
              <img 
                src="/HOPE INC LOGO.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tighter leading-tight italic">HOPE, Inc.</h1>
              <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.2em]">Product Management</span>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar min-w-[288px]">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-start gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-white/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"></div>
                )}
                <div className={`mt-0.5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                  {item.subtitle && (
                    <span className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100/60' : 'text-slate-500'}`}>{item.subtitle}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-white/5 mt-auto min-w-[288px]">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-colors cursor-default">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-primary/30 shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/30">
                {userInitials}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate capitalize text-white">{userName}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
              onClick={toggleSidebar}
              title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <Menu className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-90 text-primary' : ''}`} />
            </button>
            <div className={`flex items-center gap-3 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
              <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
                <img src="/HOPE INC LOGO.png" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="text-base font-black text-primary tracking-tighter italic">HOPE, Inc.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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