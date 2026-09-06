import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types/user.types';
import { ChatMessage } from '../../types/chat.types';
import { sendChatMessage, subscribeToCategoryChat } from '../../services/firebase/chat.service';

interface ChatRoomProps {
  categoryId: string;
  categoryName: string;
  profile: UserProfile;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ categoryId, categoryName, profile, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategoryChat(categoryId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [categoryId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await sendChatMessage(categoryId, profile, textToSend);
    } catch (err) {
      console.error('[Send Message Error]:', err);
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[75vh] shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-sm font-bold text-slate-200 truncate">{categoryName}</h2>
        </div>
        <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
          Auto-Delete (2h)
        </span>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-1">
            <span>🌌</span>
            <p>No messages yet. Say hello anonymously!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === profile.uid;
            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {msg.senderAvatar ? (
                    <img src={msg.senderAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">👤</span>
                  )}
                </div>

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] font-semibold text-purple-400 ml-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs break-words ${
                      isMe
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[9px] text-slate-500 px-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an anonymous message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};
        
