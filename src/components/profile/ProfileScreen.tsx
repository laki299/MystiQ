import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { ProfileEditModal } from './ProfileEditModal';
import { BackButton } from '../common/BackButton';
import { useExpiredCounter } from '../../hooks/useExpiredCounter';
import {
  getHostCoins,
  requestWithdraw,
} from '../../services/coin.service';
import { fetchAppSettings } from '../../services/adminService';

interface ProfileScreenProps {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = function (props) {
  const profile = props.profile;
  const onProfileUpdated = props.onProfileUpdated;
  const onBack = props.onBack;
  const isAdmin = props.isAdmin;
  const onOpenAdmin = props.onOpenAdmin;
  const onLogout = props.onLogout;

  const [editOpen, setEditOpen] = useState(false);
  const sweep = useExpiredCounter(profile.uid);
  const count = sweep.count;
  const executeSweep = sweep.executeSweep;
  const isDeleting = sweep.isDeleting;

  const isHost = profile.role === 'host';
  var coinsState = useState(profile.hostCoins || 0);
  var coins = coinsState[0];
  var setCoins = coinsState[1];
  var withdrawAmount = useState('');
  var amountStr = withdrawAmount[0];
  var setAmountStr = withdrawAmount[1];
  var hostMsg = useState('');
  var msg = hostMsg[0];
  var setMsg = hostMsg[1];
  var minWithdraw = useState(100);
  var minW = minWithdraw[0];
  var setMinW = minWithdraw[1];
  var busy = useState(false);
  var isBusy = busy[0];
  var setBusy = busy[1];

  useEffect(
    function () {
      if (!isHost) return;
      getHostCoins(profile.uid).then(function (c) {
        setCoins(c);
      });
      fetchAppSettings().then(function (s) {
        setMinW(s.minWithdrawCoins || 100);
      });
    },
    [profile.uid, isHost]
  );

  async function submitWithdraw() {
    var n = Number(amountStr);
    if (!n || n <= 0) {
      setMsg('Enter amount');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      await requestWithdraw(profile.uid, n, {
        username: profile.username,
        anonymousName: profile.anonymousName,
      });
      setMsg('Withdraw request sent. Admin will pay offline.');
      setAmountStr('');
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        {onBack ? <BackButton onClick={onBack} /> : <div />}
        <h2 className="text-sm font-bold text-slate-100">Profile</h2>
        <div className="w-16" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 p-5">
        <div className="relative flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-purple-950 border-2 border-purple-600/40 overflow-hidden flex items-center justify-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-white">
              {profile.anonymousName}
            </h3>
            {profile.username ? (
              <p className="text-[11px] text-purple-300 mt-0.5">
                @{profile.username}
              </p>
            ) : null}
            <p className="text-[10px] text-slate-500 mt-1 break-all px-2">
              UID: {profile.uid}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.profession || 'Anonymous Member'}
              {profile.city ? ' · ' + profile.city : ''}
            </p>
            {isHost ? (
              <p className="text-[11px] text-emerald-400 font-bold mt-1">
                Host · {coins} coins
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
            {profile.age > 0 ? (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
                Age {profile.age}
              </span>
            ) : null}
            {profile.gender !== 'unspecified' ? (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 capitalize">
                {profile.gender}
              </span>
            ) : null}
            {profile.language ? (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
                {profile.language}
              </span>
            ) : null}
          </div>

          <button
            onClick={function () {
              setEditOpen(true);
            }}
            className="mt-1 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {isHost ? (
        <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-3">
          <p className="text-xs font-bold text-emerald-300">Host wallet</p>
          <p className="text-2xl font-black text-white">{coins} coins</p>
          <p className="text-[11px] text-slate-400">
            Min withdraw: {minW} · Payment is offline via admin
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={amountStr}
              onChange={function (e) {
                setAmountStr(e.target.value);
              }}
              placeholder="Amount"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
            />
            <button
              type="button"
              disabled={isBusy}
              onClick={submitWithdraw}
              className="px-4 py-2 bg-emerald-700 disabled:opacity-50 text-xs font-bold rounded-xl"
            >
              {isBusy ? '...' : 'Request'}
            </button>
          </div>
          {msg ? (
            <p className="text-[11px] text-slate-300">{msg}</p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧹</span>
          <div>
            <p className="text-xs font-bold text-slate-100">Clean My Data</p>
            <p className="text-[11px] text-slate-500">
              Remove only your expired temporary data
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300">
            Expired items:{' '}
            <span className="font-bold text-purple-300">{count}</span>
          </p>
          <button
            onClick={executeSweep}
            disabled={isDeleting || count === 0}
            className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 disabled:opacity-40"
          >
            {isDeleting ? 'Cleaning...' : 'Clean Now'}
          </button>
        </div>
      </div>

      {isAdmin && onOpenAdmin ? (
        <button
          onClick={onOpenAdmin}
          className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 text-left"
        >
          <p className="text-sm font-bold text-indigo-300">Admin Panel</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analytics, users, hosts, ads, settings
          </p>
        </button>
      ) : null}

      {onLogout ? (
        <button
          onClick={onLogout}
          className="w-full rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-left"
        >
          <p className="text-sm font-bold text-rose-300">Log out</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sign out on this device
          </p>
        </button>
      ) : null}

      <ProfileEditModal
        profile={profile}
        isOpen={editOpen}
        onClose={function () {
          setEditOpen(false);
        }}
        onSaved={function (updated) {
          onProfileUpdated(updated);
          setEditOpen(false);
        }}
      />
    </div>
  );
};
