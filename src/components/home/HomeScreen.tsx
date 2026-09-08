import React from 'react';
import { UserProfile } from '../../types/user.types';
import { APP_CONFIG } from '../../config/app.config'

interface HomeScreenProps {
  profile: UserProfile;
  onOpenDiscover: () => void;
  onOpenProfile: () => void;
  onOpenChats: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onOpenDiscover,
  onOpenProfile,
  onOpenChats,
}) => {
  return (
    <div className="space-y-4 pb-28">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 p-5 shadow-xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-600/20 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-indigo-600/20 blur-2xl" />

        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300/80 font-semibold">
            Welcome to
          </p>
          <h1 className="mt-1 text-2xl font-black text-white tracking-wide">
            {APP_CONFIG.appName}
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Anonymous discovery. Temporary chats. Your real identity stays hidden.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-purple-950 border border-purple-700/50 overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-100 truncate">
                {profile.anonymousName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {profile.profession || 'Anonymous Member'}
                {profile.city ? ` · ${profile.city}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenDiscover}
          className="rounded-2xl border border-purple-500/30 bg-purple-600/15 hover:bg-purple-600/25 p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="text-2xl mb-2">✨</div>
          <p className="text-sm font-bold text-purple-200">Discover</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Find people by category</p>
        </button>

        <button
          onClick={onOpenChats}
          className="rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="text-2xl mb-2">💬</div>
          <p className="text-sm font-bold text-slate-100">Chats</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Your active conversations</p>
        </button>
      </div>

      {/* Categories preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Categories
          </h2>
          <button
            onClick={onOpenDiscover}
            className="text-[11px] text-purple-400 font-semibold"
          >
            Open all →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {APP_CONFIG.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={onOpenDiscover}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-left hover:border-purple-500/30 transition-all"
            >
              <span className="text-xl">{cat.icon}</span>
              <p className="mt-1.5 text-xs font-bold text-slate-100">{cat.name}</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-purple-300 font-semibold">Privacy:</span> Messages auto-expire in{' '}
          {Math.floor(APP_CONFIG.limits.textExpirySeconds / 60)}:
          {String(APP_CONFIG.limits.textExpirySeconds % 60).padStart(2, '0')} minutes.
          No permanent chat history.
        </p>
        <button
          onClick={onOpenProfile}
          className="mt-2 text-[11px] font-semibold text-purple-400"
        >
          Edit profile →
        </button>
      </div>
    </div>
  );
};
