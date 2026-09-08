import React, { useState } from 'react';

interface AvatarSelectorProps {
  currentAvatar: string;
  onAvatarSelected: (url: string) => void;
}

const AVATAR_STYLES = [
  'bottts',
  'fun-emoji',
  'avataaars',
  'lorelei',
  'personas',
  'shapes',
  'icons',
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onAvatarSelected,
}) => {
  const [selectedStyle, setSelectedStyle] = useState('bottts');
  const [randomSeed, setRandomSeed] = useState(Date.now().toString());

  const presets = Array.from(
    { length: 8 },
    (_, i) =>
      `https://api.dicebear.com/7.x/\( {selectedStyle}/svg?seed=preset_ \){randomSeed}_${i}`
  );

  return (
    <div className="space-y-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
          Anonymous Avatar
        </label>
        <button
          type="button"
          onClick={() => setRandomSeed(Date.now().toString())}
          className="text-[11px] bg-purple-950 border border-purple-800 text-purple-300 px-2.5 py-1 rounded-lg hover:bg-purple-900 transition-colors"
        >
          🎲 Roll New
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {AVATAR_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setSelectedStyle(style)}
            className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-all ${
              selectedStyle === style
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((url, idx) => {
          const isSelected = currentAvatar === url;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onAvatarSelected(url)}
              className={`w-14 h-14 rounded-xl bg-slate-900 p-1 border-2 transition-all flex items-center justify-center overflow-hidden ${
                isSelected
                  ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20 bg-purple-950/40'
                  : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <img src={url} alt="Avatar" className="w-full h-full object-contain" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
