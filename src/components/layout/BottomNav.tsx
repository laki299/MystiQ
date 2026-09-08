import React from 'react';

export type TabId = 'home' | 'discover' | 'chats' | 'profile';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  chatBadge?: number;
}

const items: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'discover', label: 'Discover', icon: '✨' },
  { id: 'chats', label: 'Chats', icon: '💬' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  active,
  onChange,
  chatBadge = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
      <div className="mx-3 mb-3 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl shadow-purple-950/30">
        <div className="grid grid-cols-4 gap-1 p-1.5">
          {items.map((item) => {
            const isActive = active ===
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className={`mt-1 text-[10px] font-semibold ${isActive ? 'text-purple-300' : ''}`}>
                  {item.label}
                </span>
                {item.id === 'chats' && chatBadge > 0 && (
                  <span className="absolute top-1 right-3 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {chatBadge > 9 ? '9+' : chatBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
