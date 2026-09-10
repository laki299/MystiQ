import React, { useEffect, useState } from 'react';
import { ref, update } from 'firebase/database';
import { UserProfile } from '../../types/user.types';
import { APP_CONFIG } from '../../config/app.config';
import { ShareAppButton } from '../common/ShareAppButton';
import { useMultiPresence } from '../../hooks/useMultiPresence';
import { rtdb } from '../../config/firebase.config';

interface HomeScreenProps {
  profile: UserProfile;
  onOpenDiscover: () => void;
  onOpenProfile: () => void;
  onOpenChats: () => void;
  requestCount?: number;
  onProfileUpdated?: (p: UserProfile) => void;
}

const CAT_STYLES: Record<string, string> = {
  general: 'from-blue-600 to-indigo-600',
  friendship: 'from-violet-600 to-purple-600',
  romantic: 'from-fuchsia-600 to-pink-600',
  casual: 'from-amber-500 to-orange-600',
};

function defaultActiveMap() {
  const map: Record<string, boolean> = {};
  APP_CONFIG.categories.forEach(function (c) {
    map[c.id] = false;
  });
  return map;
}

export const HomeScreen: React.FC<HomeScreenProps> = function (props) {
  const profile = props.profile;
  const onOpenDiscover = props.onOpenDiscover;
  const onOpenProfile = props.onOpenProfile;
  const onOpenChats = props.onOpenChats;
  const requestCount = props.requestCount || 0;
  const onProfileUpdated = props.onProfileUpdated;

  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    function () {
      return profile.activeCategories || defaultActiveMap();
    }
  );

  useEffect(
    function () {
      if (profile.activeCategories) {
        setActiveMap(profile.activeCategories);
      }
    },
    [profile.uid]
  );

  useMultiPresence(activeMap, profile);

  const toggleCategory = async function (categoryId: string) {
    const next: Record<string, boolean> = {};
    Object.keys(activeMap).forEach(function (k) {
      next[k] = activeMap[k];
    });
    APP_CONFIG.categories.forEach(function (c) {
      if (typeof next[c.id] !== 'boolean') next[c.id] = false;
    });
    next[categoryId] = !next[categoryId];
    setActiveMap(next);

    try {
      await update(ref(rtdb, 'users/' + profile.uid), {
        activeCategories: next,
        lastActiveAt: Date.now(),
      });
      if (onProfileUpdated) {
        onProfileUpdated(
          Object.assign({}, profile, { activeCategories: next })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
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
            <p className="text-[9px] text-emerald-300 font-semibold">
              Access Active
            </p>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">Open</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white">Your Active Categories</h3>
          <button
            onClick={onOpenDiscover}
            className="text-[11px] text-purple-400 font-semibold"
          >
            Discover
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Tap to turn Active / Inactive in each category
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {APP_CONFIG.categories.map(function (cat) {
            const isOn = !!activeMap[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={function () {
                  toggleCategory(cat.id);
                }}
                className={
                  isOn
                    ? 'rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-left'
                    : 'rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-left opacity-70'
                }
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={
                      'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl ' +
                      (CAT_STYLES[cat.id] || 'from-slate-600 to-slate-700')
                    }
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{cat.name}</p>
                    <p
                      className={
                        isOn
                          ? 'text-[10px] text-emerald-400 font-semibold'
                          : 'text-[10px] text-slate-500'
                      }
                    >
                      {isOn ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-4 flex items-center gap-3 shadow-lg shadow-purple-900/40">
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
          <button
            onClick={onOpenDiscover}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              🔍
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">
              Discover
            </span>
          </button>

          <button
            onClick={onOpenChats}
            className="flex flex-col items-center gap-1.5 relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              💬
            </div>
            {requestCount > 0 ? (
              <span className="absolute top-0 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {requestCount}
              </span>
            ) : null}
            <span className="text-[10px] font-semibold text-slate-300 text-center">
              Requests
            </span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              👤
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">
              My Profile
            </span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
              🧹
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center">
              Clean Data
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
