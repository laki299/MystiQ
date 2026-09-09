import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { PresenceUser } from '../../types/room.types';
import { APP_CONFIG } from '../../config/app.config';
import { subscribeToCategoryPresenceList } from '../../services/firebase/presence.service';
import { usePresence } from '../../hooks/usePresence';
import { sendChatRequest } from '../../services/firebase/request.service';

interface DiscoverScreenProps {
  profile: UserProfile;
}

const ICON_BG: Record<string, string> = {
  general: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  friendship: 'bg-gradient-to-br from-violet-500 to-purple-600',
  romantic: 'bg-gradient-to-br from-pink-500 to-rose-600',
  casual: 'bg-gradient-to-br from-amber-400 to-orange-500',
};

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ profile }) => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  usePresence(categoryId, profile);

  // Live counts for all categories
  useEffect(() => {
    const unsubs = APP_CONFIG.categories.map((cat) =>
      subscribeToCategoryPresenceList(cat.id, (list) => {
        setCounts((prev) => ({ ...prev, [cat.id]: list.filter((u) => u.uid !== profile.uid).length }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [profile.uid]);

  useEffect(() => {
    if (!categoryId) return;
    const unsub = subscribeToCategoryPresenceList(categoryId, setUsers);
    return () => unsub();
  }, [categoryId]);

  const filtered = useMemo(
    () => users.filter((u) => u.uid !== profile.uid),
    [users, profile.uid]
  );

  const handleRequest = async (target: PresenceUser) => {
    if (!categoryId) return;
    setSendingTo(target.uid);
    try {
      await sendChatRequest(
        profile.uid,
        target.uid,
        categoryId,
        profile.anonymousName,
        profile.avatar || ''
      );
      setToast(`Request sent to ${target.anonymousName}`);
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setToast(err?.message || 'Could not send request');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setSendingTo(null);
    }
  };

  // Category picker view
  if (!categoryId) {
    return (
      <div className="space-y-4 pb-28">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <p className="text-sm font-bold text-white">MYSTIQ</p>
            <p className="text-[11px] text-slate-400">Realtime</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{profile.anonymousName}</p>
            <p className="text-[11px] text-slate-400">Anonymous Member</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-lg">
              👥
            </div>
            <div>
              <p className="text-sm font-bold text-white">Select Room Category</p>
              <p className="text-[11px] text-slate-400">Real-time Presence</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {APP_CONFIG.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 flex items-center gap-3 active:scale-[0.99] transition text-left"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${
                  ICON_BG[cat.id] || 'bg-slate-700'
                } flex items-center justify-center text-2xl shadow-md`}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{cat.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{cat.description}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {counts[cat.id] ?? 0} online
                </p>
              </div>
              <span className="text-slate-600 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentCat = APP_CONFIG.categories.find((c) => c.id === categoryId);

  // People in category
  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCategoryId(null)}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{currentCat?.name}</p>
          <p className="text-[11px] text-emerald-400">{filtered.length} online</p>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-2xl mb-2">🌌</p>
            <p className="text-xs text-slate-400">No one online here yet</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.uid}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3"
            >
              <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {u.avatar ? (
                  <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{u.anonymousName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {[u.city, u.language].filter(Boolean).join(' · ') || 'Anonymous'}
                </p>
              </div>
              <button
                onClick={() => handleRequest(u)}
                disabled={sendingTo === u.uid}
                className="text-[11px] font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-50"
              >
                {sendingTo === u.uid ? '...' : 'Request'}
              </button>
            </div>
          ))
        )}
      </div>

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-slate-900 border border-purple-500/40 text-center text-xs font-semibold text-purple-200 py-2.5 rounded-xl">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};
