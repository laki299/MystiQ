import React, { useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { ProfileEditModal } from './ProfileEditModal';
import { BackButton } from '../common/BackButton';
import { useExpiredCounter } from '../../hooks/useExpiredCounter';
import { WalletPanel } from '../wallet/WalletPanel';

interface ProfileScreenProps {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = function (props) {
  var profile = props.profile;
  var onProfileUpdated = props.onProfileUpdated;
  var onBack = props.onBack;
  var isAdmin = props.isAdmin;
  var onOpenAdmin = props.onOpenAdmin;
  var onLogout = props.onLogout;

  var [editOpen, setEditOpen] = useState(false);
  var sweep = useExpiredCounter(profile.uid);
  var count = sweep.count;
  var executeSweep = sweep.executeSweep;
  var isDeleting = sweep.isDeleting;

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        {onBack ? <BackButton onClick={onBack} /> : <div />}
        <h2 className="text-sm font-bold text-slate-100">Profile</h2>
        <div className="w-16" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 p-5">
        <div className="relative flex flex-col items-center text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">
            {profile.anonymousName}
          </h3>
          <p className="text-xs text-slate-400">@{profile.username}</p>
          <button
            type="button"
            onClick={function () {
              setEditOpen(true);
            }}
            className="mt-1 px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200"
          >
            Edit profile
          </button>
        </div>
      </div>

      <WalletPanel profile={profile} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Expired data</p>
          <p className="text-sm text-slate-200">
            Items: <span className="font-bold text-purple-300">{count}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={executeSweep}
          disabled={isDeleting || count === 0}
          className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 disabled:opacity-40"
        >
          {isDeleting ? 'Cleaning...' : 'Clean Now'}
        </button>
      </div>

      {isAdmin && onOpenAdmin ? (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 text-left"
        >
          <p className="text-sm font-bold text-indigo-300">Admin Panel</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analytics, reports, ads, settings
          </p>
        </button>
      ) : null}

      {onLogout ? (
        <button
          type="button"
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
}
