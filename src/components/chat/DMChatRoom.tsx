import React from 'react';
import { UserProfile } from '../../types/user.types';

interface DMChatRoomProps {
  currentUser: UserProfile;
  targetUser: UserProfile;
  onBack: () => void;
}

export const DMChatRoom: React.FC<DMChatRoomProps> = ({ targetUser, onBack }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 min-h-[300px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button 
          onClick={onBack} 
          className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-slate-300 font-medium"
        >
          ← Back
        </button>
        <h3 className="font-bold text-sm text-purple-300">{targetUser.anonymousName}</h3>
        <div className="w-12"></div>
      </div>

      <div className="text-center py-12">
        <p className="text-sm text-slate-400">Direct Chat with {targetUser.anonymousName}</p>
        <span className="text-xs text-slate-500 mt-1 block">Private messaging session</span>
      </div>
    </div>
  );
};

