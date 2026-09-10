import React, { useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { ProfileEditModal } from './ProfileEditModal';
import { BackButton } from '../common/BackButton';
import { useExpiredCounter } from '../../hooks/useExpiredCounter';

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
          </div>

          {profile.age > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
                Age {profile.age}
              </span>
              {profile.gender !== 'unspecified' ? (
                <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 capitalize">
                  {profile.gender}
                </span>
              ) : null}
            </div>
          ) : null}

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

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
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
            Analytics, reports, ads, settings
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
