import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useExpiredCounter } from './hooks/useExpiredCounter';
import { QuickSweepBanner } from './components/common/QuickSweepBanner';

export const App: React.FC = () => {
  const { profile, isLoading, error, telegramUser } = useAuth();
  const { count, executeSweep, isDeleting } = useExpiredCounter(profile?.uid || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Connecting securely to MystiQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center p-4 text-center">
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto relative">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h1 className="text-xl font-bold text-purple-400">MYSTIQ</h1>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full">
            Auto-Saved
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Your Anonymous Identity</p>
          <p className="text-lg font-semibold text-slate-100">{profile?.anonymousName}</p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
          <p className="text-slate-400">Internal Firebase UID: <span className="text-slate-200 font-mono">{profile?.uid}</span></p>
          <p className="text-slate-400">Telegram Session ID: <span className="text-slate-200 font-mono">{telegramUser?.id || 'Dev Mode'}</span></p>
          <p className="text-slate-400">Status: <span className="text-emerald-400">Connected & Saved in Realtime DB</span></p>
        </div>
      </div>

      <QuickSweepBanner 
        count={count} 
        onSweep={executeSweep} 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default App;

