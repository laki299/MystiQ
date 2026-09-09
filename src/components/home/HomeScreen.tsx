import React from 'react';
import { UserProfile } from '../../types/user.types';
import { APP_CONFIG } from '../../config/app.config';
import { ShareAppButton } from '../common/ShareAppButton';

interface HomeScreenProps {
  profile: UserProfile;
  onOpenDiscover: () => void;
  onOpenProfile: () => void;
  onOpenChats: () => void;
  requestCount?: number;
}

const CAT_STYLES: Record<string, string> = {
  general: 'from-blue-600 to-indigo-600',
  friendship: 'from-violet-600 to-purple-600',
  romantic: 'from-fuchsia-600 to-pink-600',
  casual: 'from-amber-500 to-orange-600',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onOpenDiscover,
  onOpenProfile,
  onOpenChats,
  requestCount = 0,
}) => {
  return (
    <div className="space-y-5 pb-28">
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400">Welcome back,</p>
            <h2 className="text-base font-bold text-white truncate">
              {profile.anonymousName}
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium">Online</p>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-center">
            <p className="text-[9px] text-emerald-300 font-semibold">Access Active</p>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">Open</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Your Active Categories</h3>
          <button
            onClick={onOpenDiscover}
            className="text-[11px] text-purple-400 font-semibold"
          >
            Manage
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {APP_CONFIG.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={onOpenDiscover}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                  CAT_STYLES[cat.id] || 'from-slate-600 to-slate-700'
                } flex items-center justify-center text-2xl shadow-lg shadow-purple-900/20`}
              >
                {cat.icon}
              </div>
              <span className="text-[10px] font-semibold text-slate-200">{cat.name}</span>
              <span className="text-[9px] text-emerald-400">Online</span>
            </button>
          ))}
        </div>
      </div>

      <button className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-4 flex items-center gap-3 shadow-lg shadow-purple-900/40 active:scale-[0.99] transition">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
          🎁
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">Get 8 Hours Access</p>
          <p className="text-[11px] text-purple-100/80">
            Watch rewarded ads to continue using MystiQ.
          </p>
        </div>
        <span className="text-white/70 text-lg">›</span>
      </button>

      <ShareAppButton />

      <div>
        <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2.5">
          <button onClick={onOpenDiscover} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              🔍
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">Discover</span>
          </button>

          <button onClick={onOpenChats} className="flex flex-col items-center gap-1.5 relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              💬
            </div>
            {requestCount > 0 && (
              <span className="absolute top-0 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {requestCount}
              </span>
            )}
            <span className="text-[10px] font-semibold text-slate-300 text-center">Requests</span>
          </button>

          <button onClick={onOpenProfile} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              👤
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">My Profile</span>
          </button>

          <button onClick={onOpenProfile} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              🧹
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">Clean Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
