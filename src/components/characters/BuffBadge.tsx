// ============================================
// バフバッジコンポーネント
// ============================================

import type { Buff } from '../../types';

interface BuffBadgeProps {
  buff: Buff;
  onRemove: (buffId: string) => void;
}

export const BuffBadge = ({ buff, onRemove }: BuffBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-purple-900/40 text-purple-300 
      px-2 py-1 rounded border border-purple-700/30"
    >
      <span>{buff.name}</span>
      <span className="text-purple-400">{buff.remaining}R</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(buff.id);
        }}
        className="ml-1 text-purple-400 hover:text-red-400 transition-colors"
      >
        ×
      </button>
    </span>
  );
};
