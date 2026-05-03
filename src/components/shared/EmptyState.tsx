import { PackageSearch, Plus, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState({ 
  message, 
  ctaLabel, 
  onCtaClick 
}: { 
  message: string, 
  ctaLabel?: string, 
  onCtaClick?: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4 md:p-8 flex items-center justify-center relative min-h-[460px]"
    >
      {/* Subtle background architectural element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.02]">
        <Box className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] text-blue-600" strokeWidth={0.5} />
      </div>

      {/* Empty State Container */}
      <div className="max-w-md w-full flex flex-col items-center text-center p-10 md:p-14 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 border border-slate-100/50">
        
        {/* Icon Container with multi-layered design */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-50 rounded-full blur-2xl opacity-50 scale-150"></div>
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center relative border border-slate-50">
            <div className="absolute inset-2 rounded-full border border-dashed border-slate-200 animate-[spin_30s_linear_infinite]"></div>
            <PackageSearch className="w-12 h-12 md:w-14 md:h-14 text-blue-600/40" strokeWidth={1} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100">
             <Box className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Text Content */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Catalog is Empty</h3>
        <p className="text-slate-500 text-sm mb-10 max-w-[280px] leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        {(ctaLabel && onCtaClick) && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCtaClick}
            className="group relative bg-[#1a56db] text-white font-bold text-sm py-3.5 px-8 rounded-2xl shadow-[0_4px_12px_rgba(26,86,219,0.2)] hover:shadow-[0_6px_20px_rgba(26,86,219,0.3)] transition-all flex items-center justify-center gap-2.5"
          >
            <Plus className="w-5 h-5" />
            {ctaLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
