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
import { NetworkAdRunner } from './components/ads/NetworkAdRunner';
import { ref, get } from 'firebase/database';
import { rtdb } from './config/firebase.config';
import { subscribeToIncomingRequests } from './services/firebase/request.service';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const sweep = useExpiredCounter(profile ? profile.uid : null);
  const count = sweep.count;
  const executeSweep = sweep.executeSweep;
  const isDeleting = sweep.isDeleting;

  useEffect(
    function () {
      if (!profile) {
        setIsAdmin(false);
        return;
      }

      var cancelled = false;

      (async function () {
        try {
          var role = profile.role;
          if (role === 'admin' || role === 'super_admin') {
            if (!cancelled) setIsAdmin(true);
            return;
          }
          var adminSnap = await get(ref(rtdb, 'admins/' + profile.uid));
          if (!cancelled) setIsAdmin(adminSnap.exists());
        } catch {
          if (!cancelled) setIsAdmin(false);
        }
      })();

      return function () {
        cancelled = true;
      };
    },
    [profile]
  );

  useEffect(
    function () {
      if (!profile) {
        setRequestCount(0);
        return;
      }
      var unsub = subscribeToIncomingRequests(profile.uid, function (list) {
        setRequestCount(list.length);
      });
      return function () {
        if (typeof unsub === 'function') unsub();
      };
    },
    [profile]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-purple-400 font-extrabold text-lg tracking-wide">
            MYSTIQ
          </p>
          <p className="text-xs text-slate-500">Loading…</p>
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
        onRegister={async function (u, p, extra) {
          await register(u, p, extra);
        }}
      />
    );
  }

  if (isAdminView && isAdmin) {
    return (
      <AdminProtectedRoute
        profile={profile}
        onBack={function () {
          setIsAdminView(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NetworkAdRunner uid={profile.uid} isAdmin={isAdmin} />

      <div className="max-w-md mx-auto px-3 pt-3 pb-24">
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
