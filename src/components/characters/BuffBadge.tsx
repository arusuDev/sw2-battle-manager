// ============================================
// バフバッジコンポーネント
// Issue #1: 鼓咆対応（🎺マーク、∞表示、金色系）
// ============================================

import type { Buff } from '../../types';

interface BuffBadgeProps {
  buff: Buff;
  onRemove: (buffId: string) => void;
}

export const BuffBadge = ({ buff, onRemove }: BuffBadgeProps) => {
  // 鼓咆かどうか
  const isKoho = buff.isKoho === true;
  
  // 永続（remaining: -1）かどうか
  const isPermanent = buff.remaining === -1;

  // 鼓咆用のスタイル（金色系）
  const kohoStyle = 'bg-amber-900/50 text-amber-300 border-amber-700/50';
  // 通常バフのスタイル（紫系）
  const normalStyle = 'bg-purple-900/40 text-purple-300 border-purple-700/30';

  return (
    <span 
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
        isKoho ? kohoStyle : normalStyle
      }`}
    >
      {/* 鼓咆マーク */}
      {isKoho && <span>🎺</span>}
      
      {/* バフ名 */}
      <span>{buff.name}</span>
      
      {/* 残りラウンド（永続なら∞） */}
      <span className={isKoho ? 'text-amber-400' : 'text-purple-400'}>
        {isPermanent ? '∞' : `${buff.remaining}R`}
      </span>
      
      {/* 削除ボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(buff.id);
        }}
        className={`ml-1 transition-colors ${
          isKoho 
            ? 'text-amber-400 hover:text-red-400' 
            : 'text-purple-400 hover:text-red-400'
        }`}
      >
        ×
      </button>
    </span>
  );
};
