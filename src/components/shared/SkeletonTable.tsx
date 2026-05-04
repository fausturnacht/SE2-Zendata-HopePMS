export function SkeletonTable({ columns = 6 }: { columns?: number }) {
  // Generate an array for rows
  const rows = Array.from({ length: 5 });
  const colsArray = Array.from({ length: columns });

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden w-full">
      {/* Table Header Skeleton */}
      <div 
        className="grid gap-4 px-8 py-6 bg-[#f8fafc] border-b border-slate-100" 
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {colsArray.map((_, i) => (
          <div key={`th-${i}`} className="h-2.5 w-20 bg-slate-200 rounded-full animate-pulse"></div>
        ))}
      </div>
      
      {/* Table Rows Skeleton */}
      <div className="divide-y divide-slate-50 bg-white">
        {rows.map((_, i) => (
          <div 
            key={i} 
            className="grid gap-4 px-8 py-7 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {colsArray.map((_, j) => (
               <div key={`td-${i}-${j}`} className={`h-3 bg-slate-100 rounded-full animate-pulse transition-all ${j === 0 ? 'w-24 bg-blue-100' : 'w-20'}`} style={{ animationDelay: `${(i * 100) + (j * 50)}ms` }}></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="px-8 py-6 bg-[#f8fafc] flex justify-between items-center border-t border-slate-100">
        <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse opacity-70"></div>
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
