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
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onProfileUpdated,
  onBack,
  isAdmin,
  onOpenAdmin,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const { count, executeSweep, isDeleting } = useExpiredCounter(profile.uid);

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        {onBack ? <BackButton onClick={onBack} /> : <div />}
        <h2 className="text-sm font-bold text-slate-100">Profile</h2>
        <div className="w-16" />
      </div>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 p-5">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-purple-600/15 blur-2xl" />

        <div className="relative flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-purple-950 border-2 border-purple-600/40 overflow-hidden flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{profile.anonymousName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.profession || 'Anonymous Member'}
              {profile.city ? ` · ${profile.city}` : ''}
            </p>
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-300 italic max-w-xs">"{profile.bio}"</p>
          )}

          <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
            {profile.age > 0 && (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
                Age {profile.age}
              </span>
            )}
            {profile.gender !== 'unspecified' && (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 capitalize">
                {profile.gender}
              </span>
            )}
            {profile.language && (
              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
                {profile.language}
              </span>
            )}
          </div>

          {(profile.interests || []).length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {profile.interests.map((item) => (
                <span
                  key={item}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-200"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setEditOpen(true)}
            className="mt-1 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Clean my data */}
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
            Expired items: <span className="font-bold text-purple-300">{count}</span>
          </p>
          <button
            onClick={executeSweep}
            disabled={isDeleting || count === 0}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 disabled:opacity-40 transition-all"
          >
            {isDeleting ? 'Cleaning...' : 'Clean Now'}
          </button>
        </div>
      </div>

      {/* Admin entry — only if admin */}
      {isAdmin && onOpenAdmin && (
        <button
          onClick={onOpenAdmin}
          className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-950/60 p-4 text-left transition-all"
        >
          <p className="text-sm font-bold text-indigo-300">⚡ Admin Panel</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analytics, reports, ads, settings
          </p>
        </button>
      )}

      <ProfileEditModal
        profile={profile}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          onProfileUpdated(updated);
          setEditOpen(false);
        }}
      />
    </div>
  );
};
