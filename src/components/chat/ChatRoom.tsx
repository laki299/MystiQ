import React, { useEffect, useRef, useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { ChatMessage } from '../../types/chat.types';
import { sendTextMessage, subscribeToMessages } from '../../services/firebase/chat.service';
import { BackButton } from '../common/BackButton';
import { APP_CONFIG } from '../../config/app.config';

interface ChatRoomProps {
  conversationId: string;
  categoryName: string;
  partnerName: string;
  partnerAvatar?: string;
  profile: UserProfile;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversationId,
  categoryName,
  partnerName,
  partnerAvatar,
  profile,
  onBack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, setMessages);
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText;
    setInputText('');
    setIsSending(true);
    try {
      await sendTextMessage(conversationId, profile.uid, text);
    } catch (err) {
      console.error('[Send Error]', err);
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const expiryLabel = `\( {Math.floor(APP_CONFIG.limits.textExpirySeconds / 60)}: \){String(
    APP_CONFIG.limits.textExpirySeconds % 60
  ).padStart(2, '0')}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[75vh] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 bg-slate-950/70 border-b border-slate-800 gap-2">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0 text-center">
          <p className="text-sm font-bold text-slate-100 truncate">{partnerName}</p>
          <p className="text-[10px] text-slate-500">{categoryName}</p>
        </div>
        <span className="text-[9px] text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full flex-shrink-0">
          {expiryLabel}m
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-1">
            <span className="text-2xl">🕯️</span>
            <p>No messages yet. Say hello anonymously.</p>
            <p className="text-[10px] text-slate-600">Messages vanish after {expiryLabel}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === profile.uid;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {isMe ? (
                    profile.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px]">👤</span>
                    )
                  ) : partnerAvatar ? (
                    <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px]">👤</span>
                  )}
                </div>

                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs break-words ${
                      isMe
                        ? 'bg-purple-600 text-white rounded-br-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] text-slate-500 mt-0.5 block ${
                      isMe ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Anonymous message..."
          maxLength={500}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
};
