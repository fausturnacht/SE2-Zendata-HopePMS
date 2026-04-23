export default function Home() {
  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-8 md:max-w-none md:mx-0">
      {/* Welcome Section */}
      <header className="space-y-1">
        <span className="text-[0.75rem] font-bold tracking-[0.05em] text-on-surface-variant uppercase font-label">
          SECURE ACADEMIC ENVIRONMENT
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
          Dashboard Overview
        </h1>
      </header>

      {/* Bento Grid Layout for Dashboard */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6">
        {/* Primary Dashboard Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 academic-shadow border border-outline-variant/15 md:col-span-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="bg-primary-container p-3 rounded-lg text-primary">
                <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                Live Status
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-on-surface">Active Portfolio</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Monitor and manage institutional research assets and ongoing academic project workflows in real-time.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-surface-container-low flex items-center justify-between">
              <span className="text-sm font-medium text-primary">View Full Report</span>
              <span className="material-symbols-outlined text-primary text-sm" data-icon="arrow_forward">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-2 gap-4 md:col-span-4 md:grid-cols-1 md:gap-6">
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant mb-3 block" data-icon="inventory_2">inventory_2</span>
            <div className="text-2xl font-bold text-on-surface">142</div>
            <div className="text-xs font-medium text-on-surface-variant tracking-wide uppercase mt-1">Products</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant mb-3 block" data-icon="analytics">analytics</span>
            <div className="text-2xl font-bold text-on-surface">98%</div>
            <div className="text-xs font-medium text-on-surface-variant tracking-wide uppercase mt-1">Efficiency</div>
          </div>
        </div>

        {/* Visualization Placeholder */}
        <div className="bg-white rounded-xl p-6 academic-shadow border border-outline-variant/15 md:col-span-12 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Growth Analytics</h3>
            <span className="material-symbols-outlined text-on-surface-variant" data-icon="more_vert">more_vert</span>
          </div>
          <div className="h-40 w-full bg-surface-container rounded-lg flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-on-surface-variant bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm border border-outline-variant/20">
                Analytical Feed Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <footer className="mt-8 pt-8 border-t border-surface-container text-center md:mt-20 md:pt-10 md:border-t md:border-slate-200 md:flex md:justify-between md:items-center md:pb-8">
        <p className="text-[0.7rem] tracking-[0.05em] text-on-surface-variant font-label uppercase">
          Hope Inc. Proprietary Management System © 2024
        </p>
        <div className="hidden md:flex gap-6">
          <a className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors" href="#">Privacy Protocol</a>
          <a className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors" href="#">System Health</a>
        </div>
      </footer>
    </div>
  );
}
