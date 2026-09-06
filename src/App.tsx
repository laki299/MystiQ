import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useExpiredCounter } from './hooks/useExpiredCounter';
import { QuickSweepBanner } from './components/common/QuickSweepBanner';
import { ProfileEditModal } from './components/profile/ProfileEditModal';
import { UserProfile } from './types/user.types';

export const App: React.FC = () => {
  const { profile: initialProfile, isLoading, error, telegramUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);

  React.useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);

  const { count, executeSweep, isDeleting } = useExpiredCounter(profile?.uid || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Connecting securely to MystiQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center p-4 text-center">
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto relative pb-24">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h1 className="text-xl font-bold text-purple-400">MYSTIQ</h1>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full">
            Auto-Saved
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-100 truncate">{profile?.anonymousName}</h2>
            <p className="text-xs text-slate-400 truncate">
              {profile?.profession || 'Anonymous Member'} {profile?.city ? `• ${profile.city}` : ''}
            </p>
            <button
              onClick={() => setIsEditOpen(true)}
              className="mt-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold underline"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2 text-slate-400">
            <p>Age: <span className="text-slate-200">{profile?.age || 'Not set'}</span></p>
            <p>Gender: <span className="text-slate-200 capitalize">{profile?.gender || 'Unspecified'}</span></p>
            <p>Country: <span className="text-slate-200">{profile?.country || 'Not set'}</span></p>
            <p>Language: <span className="text-slate-200">{profile?.language || 'en'}</span></p>
          </div>

          {profile?.bio && (
            <div className="pt-2 border-t border-slate-800/60">
              <p className="text-slate-400">Bio:</p>
              <p className="text-slate-200 italic">{profile.bio}</p>
            </div>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <div className="pt-2 border-t border-slate-800/60">
              <p className="text-slate-400 mb-1">Interests:</p>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map(item => (
                  <span key={item} className="bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-md text-[10px]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating 1-Click Sweep Banner */}
      <QuickSweepBanner 
        count={count} 
        onSweep={executeSweep} 
        isDeleting={isDeleting} 
      />

      {/* Edit Profile Modal */}
      {profile && (
        <ProfileEditModal
          profile={profile}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
};

export default App;
                    
