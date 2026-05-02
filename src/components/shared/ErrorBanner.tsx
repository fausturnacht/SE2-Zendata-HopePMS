import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function ErrorBanner({ 
  error, 
  onRetry 
}: { 
  error: Error | string | unknown | null, 
  onRetry?: () => void 
}) {
  if (!error) return null;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error ? error.message : 'An unknown error occurred';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-rose-100 rounded-2xl p-5 flex items-start gap-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative overflow-hidden mb-8 group"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-r-full"></div>
      <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
        <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-rose-900 font-bold text-sm tracking-tight">System Notice</h3>
        <p className="text-rose-600/80 text-sm mt-1 leading-relaxed line-clamp-2">{errorMessage}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="shrink-0 flex items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_4px_10px_rgba(225,29,72,0.2)] active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </motion.div>
  );
}