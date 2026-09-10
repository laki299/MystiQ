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
import { AuthScreen } from './components/auth/AuthScreen';
import { subscribeToIncomingRequests } from './services/firebase/request.service';

function checkIsAdmin(role: string | undefined) {
  if (!role) return false;
  return role === 'admin' || role === 'super_admin';
}

export const App: React.FC = function () {
  const authApi = useAuth();
  const profile = authApi.profile;
  const setProfile = authApi.setProfile;
  const isLoading = authApi.isLoading;
  const login = authApi.login;
  const register = authApi.register;
  const logout = authApi.logout;

  const [tab, setTab] = useState<TabId>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const isAdmin = profile ? checkIsAdmin(profile.role) : false;

  const sweep = useExpiredCounter(profile ? profile.uid : null);
  const count = sweep.count;
  const executeSweep = sweep.executeSweep;
  const isDeleting = sweep.isDeleting;

  useEffect(
    function () {
      if (!profile || !profile.uid) return;
      var unsub = subscribeToIncomingRequests(profile.uid, function (list) {
        setRequestCount(list.length);
      });
      return function () {
        unsub();
      };
    },
    [profile ? profile.uid : '']
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading MystiQ...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <AuthScreen
        onLogin={async function (u, p) {
          await login(u, p);
        }}
        onRegister={async function (u, p, d) {
          await register(u, p, d);
        }}
      />
    );
  }

  if (isAdminView && isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="p-4 max-w-7xl mx-auto flex justify-between items-center bg-slate-900/80 border-b border-slate-800">
          <span className="text-sm font-bold text-indigo-400">MystiQ Admin</span>
          <button
            onClick={function () {
              setIsAdminView(false);
            }}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
          >
            Back to App
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
          <h1 className="text-lg font-extrabold text-purple-400 tracking-wide">
            MYSTIQ
          </h1>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
            Live
          </span>
        </div>

        {tab === 'home' ? (
          <HomeScreen
            profile={profile}
            onOpenDiscover={function () {
              setTab('discover');
            }}
            onOpenChats={function () {
              setTab('chats');
            }}
            onOpenProfile={function () {
              setTab('profile');
            }}
            requestCount={requestCount}
            onProfileUpdated={setProfile}
          />
        ) : null}

        {tab === 'discover' ? <DiscoverScreen profile={profile} /> : null}

        {tab === 'chats' ? <ChatsScreen profile={profile} /> : null}

        {tab === 'profile' ? (
          <ProfileScreen
            profile={profile}
            onProfileUpdated={setProfile}
            isAdmin={isAdmin}
            onOpenAdmin={function () {
              setIsAdminView(true);
            }}
            onLogout={logout}
          />
        ) : null}

        <QuickSweepBanner
          count={count}
          onSweep={executeSweep}
          isDeleting={isDeleting}
        />

        <BottomNav active={tab} onChange={setTab} chatBadge={requestCount} />
      </div>
    </div>
  );
};

export default App;
