import React from 'react';

interface QuickSweepBannerProps {
  count: number;
  onSweep: () => void;
  isDeleting: boolean;
}

export const QuickSweepBanner: React.FC<QuickSweepBannerProps> = ({ count, onSweep, isDeleting }) => {
  if (count < 30) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-short">
      <div className="bg-slate-900/95 backdrop-blur-md border border-purple-500/50 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-xl">
            🧹
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Storage Alert</p>
            <p className="text-sm font-bold text-slate-100">
              <span className="text-purple-400">{count}</span> Expired Items Accumulated
            </p>
          </div>
        </div>

        <button
          onClick={onSweep}
          disabled={isDeleting}
          className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
        >
          {isDeleting ? (
            <span>Clearing...</span>
          ) : (
            <>
              <span>Clean Now</span>
              <span>⚡</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

