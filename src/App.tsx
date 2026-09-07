import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useExpiredCounter } from './hooks/useExpiredCounter';
import { usePresence } from './hooks/usePresence';
import { QuickSweepBanner } from './components/common/QuickSweepBanner';
import { ProfileEditModal } from './components/profile/ProfileEditModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { CategoryList, CATEGORIES } from './components/categories/CategoryList';
import { ChatRoom } from './components/chat/ChatRoom';
import { DMChatRoom } from './components/chat/DMChatRoom';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { UserProfile } from './types/user.types';

export const App: React.FC = () => {
  const { profile: initialProfile, isLoading, error } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // DM & Profile View State
  const [inspectUid, setInspectUid] = useState<string | null>(null);
  const [activeDMUser, setActiveDMUser] = useState<UserProfile | null>(null);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);

  const { count, executeSweep, isDeleting } = useExpiredCounter(profile?.uid || null);

  usePresence(selectedCategory, profile);

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

  // যদি অ্যাডমিন মোড অন থাকে তবে সরাসরি অ্যাডমিন প্রটেক্টেড ভিউ রেন্ডার হবে
  if (isAdminView && profile?.uid) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="p-4 max-w-7xl mx-auto flex justify-between items-center bg-slate-900/80 border-b border-slate-800">
          <span className="text-sm font-bold text-indigo-400">MystiQ Admin Mode</span>
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

  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto relative pb-24">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl mb-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h1 className="text-lg font-extrabold text-purple-400 tracking-wide">MYSTIQ</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdminView(true)}
              className="bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] px-2.5 py-1 rounded-full font-bold hover:bg-indigo-900 transition flex items-center gap-1"
              title="Open Admin Dashboard"
            >
              ⚡ Admin
            </button>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              Realtime
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-100 truncate">{profile?.anonymousName}</h2>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.profession || 'Anonymous Member'} {profile?.city ? `• ${profile.city}` : ''}
            </p>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="text-xs bg-purple-950 border border-purple-800 text-purple-300 px-3 py-1.5 rounded-xl hover:bg-purple-900 font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Navigation Router */}
      {activeDMUser && profile ? (
        <DMChatRoom
          currentUser={profile}
          targetUser={activeDMUser}
          onBack={() => setActiveDMUser(null)}
        />
      ) : selectedCategory && profile && currentCategoryObj ? (
        <ChatRoom
          categoryId={selectedCategory}
          categoryName={currentCategoryObj.name}
          profile={profile}
          onBack={() => setSelectedCategory(null)}
        />
      ) : (
        <CategoryList onSelectCategory={(catId) => setSelectedCategory(catId)} />
      )}

      {/* Sweep Banner */}
      <QuickSweepBanner 
        count={count} 
        onSweep={executeSweep} 
        isDeleting={isDeleting} 
      />

      {/* Modals */}
      {profile && (
        <ProfileEditModal
          profile={profile}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}

      <UserProfileModal
        targetUid={inspectUid}
        isOpen={Boolean(inspectUid)}
        onClose={() => setInspectUid(null)}
        onStartDM={(targetUser) => setActiveDMUser(targetUser)}
      />
    </div>
  );
};

export default App;
