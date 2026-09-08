import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useExpiredCounter } from './hooks/useExpiredCounter';
import { QuickSweepBanner } from './components/common/QuickSweepBanner';
import { BottomNav, TabId } from './components/layout/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { DiscoverScreen } from './components/discover/DiscoverScreen';
import { ChatsScreen } from './components/chats/ChatsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { ref, get } from 'firebase/database';
import { rtdb } from './config/firebase.config';
import { subscribeToIncomingRequests } from './services/firebase/request.service';

export const App: React.FC = () => {
  const { profile, setProfile, isLoading, error } = useAuth();
  const [tab, setTab] = useState<TabId>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const { count, executeSweep, isDeleting } = useExpiredCounter(profile?.uid || null);

  useEffect(() => {
    if (!profile?.uid) return;
    get(ref(rtdb, `admins/${profile.uid}`))
      .then((snap) => setIsAdmin(snap.exists()))
      .catch(() => setIsAdmin(false));
  }, [profile?.uid]);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeToIncomingRequests(profile.uid, (list) => {
      setRequestCount(list.length);
    });
    return () => unsub();
  }, [profile?.uid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Connecting securely to MystiQ...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center p-4 text-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="text-xs text-slate-500">{error || 'Profile unavailable'}</p>
        </div>
      </div>
    );
  }

  if (isAdminView && isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="p-4 max-w-7xl mx-auto flex justify-between items-center bg-slate-900/80 border-b border-slate-800">
          <span className="text-sm font-bold text-indigo-400">MystiQ Admin</span>
          <button
            onClick={() => setIsAdminView(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            ← Back to App
          </button>
        </div>
        <AdminProtectedRoute currentUid={profile.uid} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-md mx-auto px-4 pt-4 relative min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-extrabold text-purple-400 tracking-wide">MYSTIQ</h1>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
            Live
          </span>
        </div>

        {tab === 'home' && (
          <HomeScreen
            profile={profile}
            onOpenDiscover={() => setTab('discover')}
            onOpenChats={() => setTab('chats')}
            onOpenProfile={() => setTab('profile')}
            requestCount={requestCount}
          />
        )}

        {tab === 'discover' && <DiscoverScreen profile={profile} />}

        {tab === 'chats' && <ChatsScreen profile={profile} />}

        {tab === 'profile' && (
          <ProfileScreen
            profile={profile}
            onProfileUpdated={setProfile}
            isAdmin={isAdmin}
            onOpenAdmin={() => setIsAdminView(true)}
          />
        )}

        <QuickSweepBanner count={count} onSweep={executeSweep} isDeleting={isDeleting} />

        <BottomNav active={tab} onChange={setTab} chatBadge={requestCount} />
      </div>
    </div>
  );
};

export default App;
                                 
