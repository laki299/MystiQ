import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:text-purple-300 px-3 py-1.5 rounded-xl transition-all active:scale-95"
    >
      <span>←</span>
      <span>{label}</span>
    </button>
  );
};
