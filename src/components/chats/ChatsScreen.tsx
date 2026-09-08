import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { Conversation } from '../../types/chat.types';
import { ChatRequest } from '../../types/request.types';
import {
  subscribeToUserConversations,
  getOrCreateConversation,
} from '../../services/firebase/chat.service';
import {
  subscribeToIncomingRequests,
  respondToChatRequest,
} from '../../services/firebase/request.service';
import { getUserProfile } from '../../services/firebase/profile.service';
import { APP_CONFIG } from '../../config/app.config';
import { ChatRoom } from '../chat/ChatRoom';
import { BackButton } from '../common/BackButton';

interface ChatsScreenProps {
  profile: UserProfile;
  onBack?: () => void;
}

interface ActiveChat {
  conversationId: string;
  categoryId: string;
  partnerUid: string;
  partnerName: string;
  partnerAvatar: string;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({ profile, onBack }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [partnerMap, setPartnerMap] = useState<Record<string, UserProfile>>({});
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = subscribeToUserConversations(profile.uid, setConversations);
    const unsub2 = subscribeToIncomingRequests(profile.uid, setRequests);
    return () => {
      unsub1();
      unsub2();
    };
  }, [profile.uid]);

  // Load partner profiles for conversations
  useEffect(() => {
    const load = async () => {
      const map: Record<string, UserProfile> = { ...partnerMap };
      for (const c of conversations) {
        const partnerUid = Object.keys(c.participants || {}).find((id) => id !== profile.uid);
        if (partnerUid && !map[partnerUid]) {
          const p = await getUserProfile(partnerUid);
          if (p) map[partnerUid] = p;
        }
      }
      for (const r of requests) {
        if (!map[r.fromUid]) {
          const p = await getUserProfile(r.fromUid);
          if (p) map[r.fromUid] = p;
        }
      }
      setPartnerMap(map);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, requests, profile.uid]);

  const handleAccept = async (req: ChatRequest) => {
    setBusyId(req.id);
    try {
      await respondToChatRequest(req.id, 'accepted');
      const convId = await getOrCreateConversation(req.fromUid, req.toUid, req.categoryId);
      const partner = partnerMap[req.fromUid];
      setActiveChat({
        conversationId: convId,
        categoryId: req.categoryId,
        partnerUid: req.fromUid,
        partnerName: partner?.anonymousName || req.fromName,
        partnerAvatar: partner?.avatar || req.fromAvatar || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (req: ChatRequest) => {
    setBusyId(req.id);
    try {
      await respondToChatRequest(req.id, 'rejected');
    } finally {
      setBusyId(null);
    }
  };

  if (activeChat) {
    const catName =
      APP_CONFIG.categories.find((c) => c.id === activeChat.categoryId)?.name ||
      activeChat.categoryId;

    return (
      <ChatRoom
        conversationId={activeChat.conversationId}
        categoryName={catName}
        partnerName={activeChat.partnerName}
        partnerAvatar={activeChat.partnerAvatar}
        profile={profile}
        onBack={() => setActiveChat(null)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        {onBack ? <BackButton onClick={onBack} /> : <div />}
        <h2 className="text-sm font-bold text-slate-100">Chats</h2>
        <div className="w-16" />
      </div>

      {/* Incoming requests */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Requests ({requests.length})
        </h3>
        {requests.length === 0 ? (
          <p className="text-[11px] text-slate-600 px-1">No pending requests</p>
        ) : (
          requests.map((req) => {
            const cat =
              APP_CONFIG.categories.find((c) => c.id === req.categoryId)?.name ||
              req.categoryId;
            return (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                    {req.fromAvatar ? (
                      <img src={req.fromAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{req.fromName}</p>
                    <p className="text-[11px] text-slate-400">{cat}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    disabled={busyId === req.id}
                    className="flex-1 text-xs font-bold py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    disabled={busyId === req.id}
                    className="flex-1 text-xs font-bold py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active conversations — no last message preview */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Active ({conversations.length})
        </h3>
        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center">
            <p className="text-xs text-slate-500">No active chats yet</p>
          </div>
        ) : (
          conversations.map((c) => {
            const partnerUid = Object.keys(c.participants || {}).find(
              (id) => id !== profile.uid
            );
            const partner = partnerUid ? partnerMap[partnerUid] : null;
            const catName =
              APP_CONFIG.categories.find((x) => x.id === c.categoryId)?.name ||
              c.categoryId;

            return (
              <button
                key={c.id}
                onClick={() =>
                  setActiveChat({
                    conversationId: c.id,
                    categoryId: c.categoryId,
                    partnerUid: partnerUid || '',
                    partnerName: partner?.anonymousName || 'Anonymous',
                    partnerAvatar: partner?.avatar || '',
                  })
                }
                className="w-full flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-left hover:border-purple-500/30 transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {partner?.avatar ? (
                    <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">
                    {partner?.anonymousName || 'Anonymous'}
                  </p>
                  <p className="text-[11px] text-slate-400">{catName}</p>
                </div>
                <span className="text-slate-600 text-sm">→</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
