import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { PresenceUser } from '../../types/room.types';
import { APP_CONFIG } from '../../config/app.config';
import { subscribeToCategoryPresenceList } from '../../services/firebase/presence.service';
import { usePresence } from '../../hooks/usePresence';
import { sendChatRequest } from '../../services/firebase/request.service';
import { BackButton } from '../common/BackButton';

interface DiscoverScreenProps {
  profile: UserProfile;
  onBac

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ profile, onBack }) => {
  const [categoryId, setCategoryId] = useState(APP_CONFIG.categories[0].id);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Gender filter simple
  const [genderFilter, setGenderFilter] = useState<string>('all');

  usePresence(categoryId, profile);

  useEffect(() => {
    const unsub = subscribeToCategoryPresenceList(categoryId, setUsers);
    return () => unsub();
  }, [categoryId]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (u.uid === profile.uid) return false;
      if (genderFilter !== 'all' && u.gender && u.gender !== genderFilter) return false;
      return true;
    });
  }, [users, profile.uid, genderFilter]);

  const handleRequest = async (target: PresenceUser) => {
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

  const currentCat = APP_CONFIG.categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        {onBack ? <BackButton onClick={onBack} /> : <div />}
        <h2 className="text-sm font-bold text-slate-100">Discover</h2>
        <div className="w-16" />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {APP_CONFIG.categories.map((cat) => {
          const active = cat.id === categoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                active
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          {currentCat?.name} · <span className="text-emerald-400 font-semibold">{filtered.length} online</span>
        </p>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-500"
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-2xl mb-2">🌌</p>
            <p className="text-xs text-slate-400">No one online in this category yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Stay here — presence is live.</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.uid}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3"
            >
              <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {u.avatar ? (
                  <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{u.anonymousName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {[u.gender !== 'unspecified' ? u.gender : null, u.city, u.language]
                    .filter(Boolean)
                    .join(' · ') || 'Anonymous'}
                </p>
              </div>

              <button
                onClick={() => handleRequest(u)}
                disabled={sendingTo === u.uid}
                className="text-[11px] font-bold px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all active:scale-95"
              >
                {sendingTo === u.uid ? '...' : 'Request'}
              </button>
            </div>
          ))
        )}
      </div>

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-slate-900 border border-purple-500/40 text-center text-xs font-semibold text-purple-200 py-2.5 rounded-xl shadow-xl">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};
