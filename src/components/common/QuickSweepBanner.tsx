import React from 'react';

interface QuickSweepBannerProps {
  count: number;
  onSweep: () => void;
  isDeleting: boolean;
}

export const QuickSweepBanner: React.FC<QuickSweepBannerProps> = ({
  count,
  onSweep,
  isDeleting,
}) => {
  if (count 

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border border-purple-500/40 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-xl flex-shrink-0">
            🧹
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
              Clean My Data
            </p>
            <p className="text-sm font-bold text-slate-100 truncate">
              <span className="text-purple-400">{count}</span> expired items
            </p>
          </div>
        </div>

        <button
          onClick={onSweep}
          disabled={isDeleting}
          className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex-shrink-0"
        >
          {isDeleting ? 'Clearing...' : 'Clean Now'}
        </button>
      </div>
    </div>
  );
};
