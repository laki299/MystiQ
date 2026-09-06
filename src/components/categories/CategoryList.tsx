import React, { useEffect, useState } from 'react';
import { RoomCategory } from '../../types/room.types';
import { subscribeToCategoryPresence } from '../../services/firebase/presence.service';

export const CATEGORIES: RoomCategory[] = [
  { id: 'general', name: 'General Chat', description: 'Open random chit-chat', icon: '💬', color: 'from-blue-600 to-indigo-600' },
  { id: 'flirt', name: 'Flirt & Vibe', description: 'Connect with anonymous souls', icon: '🔥', color: 'from-rose-600 to-pink-600' },
  { id: 'confession', name: 'Confessions', description: 'Share dark secrets freely', icon: '🤫', color: 'from-purple-600 to-violet-600' },
  { id: 'deep-talk', name: 'Late Night Talk', description: 'Deep philosophical discussions', icon: '🌙', color: 'from-cyan-600 to-blue-700' },
  { id: 'tech', name: 'Tech & Gaming', description: 'Geek out on code & games', icon: '⚡', color: 'from-emerald-600 to-teal-600' },
];

interface CategoryCardProps {
  category: RoomCategory;
  onSelect: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const [activeCount, setActiveCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = subscribeToCategoryPresence(category.id, (count) => {
      setActiveCount(count);
    });
    return () => unsubscribe();
  }, [category.id]);

  return (
    <div
      onClick={() => onSelect(category.id)}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-purple-500/50 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-purple-500/30">
          {category.icon}
        </span>
        <span className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-slate-300 font-semibold">{activeCount} online</span>
        </span>
      </div>
      <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{category.description}</p>
    </div>
  );
};

interface CategoryListProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Select Room Category
        </h2>
        <span className="text-[10px] text-purple-400 font-medium">Real-time Presence</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} category={cat} onSelect={onSelectCategory} />
        ))}
      </div>
    </div>
  );
};

