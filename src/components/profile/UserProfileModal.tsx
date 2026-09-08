import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';
import { blockUser } from '../../services/firebase/security.service';
import { ReportModal } from '../common/ReportModal';

interface UserProfileModalProps {
  currentUid: string;
  targetUid: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDM: (targetUser: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUid,
  targetUid,
  isOpen,
  onClose,
  onStartDM
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!targetUid || !isOpen) return;

    setLoading(true);
    setIsBlocked(false);
    const userRef = ref(rtdb, `users/${targetUid}`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }
      })
      .finally(() => setLoading(false));
  }, [targetUid, isOpen]);

  const handleBlock = async () => {
    if (!user) return;
    try {
      await blockUser(currentUid, user.uid, user.anonymousName);
      setIsBlocked(true);
    } catch (err) {
      console.error('[Block Error]:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xs p-5 space-y-4 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg">
            ✕
          </button>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading profile...</div>
          ) : user ? (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-950/80 border-2 border-purple-600/50 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{user.anonymousName}</h3>
                <p className="text-xs text-slate-400">
                  {user.profession || 'Anonymous Member'} {user.city ? `• ${user.city}` : ''}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-left text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <p>Age: <span className="text-slate-200">{user.age || 'N/A'}</span></p>
                  <p>Gender: <span className="text-slate-200 capitalize">{user.gender || 'Unspecified'}</span></p>
                </div>

                {user.bio && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <p className="text-slate-200 italic">"{user.bio}"</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onStartDM(user);
                    onClose();
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  🔒 Send Private Message
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg text-[11px] font-semibold"
                  >
                    🚩 Report
                  </button>
                  <button
                    onClick={handleBlock}
                    disabled={isBlocked}
                    className="bg-red-950/60 border border-red-800/60 hover:bg-red-900 text-red-300 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-50"
                  >
                    {isBlocked ? 'Blocked' : '🚫 Block'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">User not found.</div>
          )}
        </div>
      </div>

      {user && (
        <ReportModal
          reporterUid={currentUid}
          reportedUid={user.uid}
          reportedName={user.anonymousName}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </>
  );
};
