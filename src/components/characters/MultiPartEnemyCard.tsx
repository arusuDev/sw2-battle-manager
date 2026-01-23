// ============================================
// 複数部位の敵カードコンポーネント（改良版）
// - 削除確認ダイアログ追加
// - 削除ボタン位置変更
// - フェードアウトアニメーション
// ============================================

import { useState } from 'react';
import type { MultiPartEnemy, Part } from '../../types';
import { getHpBarColor, getHpPercent } from '../../utils/calc';
import { BuffBadge } from './BuffBadge';

interface MultiPartEnemyCardProps {
  character: MultiPartEnemy;
  onUpdate: (character: MultiPartEnemy) => void;
  onDelete: (id: string) => void;
  onAddBuff: (character: MultiPartEnemy) => void;
  onRemoveBuff: (charId: string, buffId: string, partId?: string) => void;
}

export const MultiPartEnemyCard = ({
  character,
  onUpdate,
  onDelete,
  onAddBuff,
  onRemoveBuff
}: MultiPartEnemyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const buffs = character.buffs || [];
  const parts = character.parts || [];

  const updatePartHp = (partId: string, delta: number) => {
    const newParts = parts.map(p => {
      if (p.id === partId) {
        const newHp = Math.max(-999, Math.min(p.hp.current + delta, p.hp.max));
        return { ...p, hp: { ...p.hp, current: newHp } };
      }
      return p;
    });
    onUpdate({ ...character, parts: newParts });
  };

  const updatePartMp = (partId: string, delta: number) => {
    const newParts = parts.map(p => {
      if (p.id === partId) {
        const newMp = Math.max(0, Math.min(p.mp.current + delta, p.mp.max));
        return { ...p, mp: { ...p.mp, current: newMp } };
      }
      return p;
    });
    onUpdate({ ...character, parts: newParts });
  };

  const getPartStatus = (part: Part): { label: string; color: string } | null => {
    if (part.hp.current <= 0) return { label: '破壊', color: 'text-gray-500' };
    return null;
  };

  // 削除処理（アニメーション付き）
  const handleDelete = () => {
    setIsDeleting(true);
    // アニメーション完了後に実際の削除を実行
    setTimeout(() => {
      onDelete(character.id);
    }, 300);
  };

  // 削除確認をキャンセル
  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  // コンパクト表示
  if (!isExpanded) {
    return (
      <div
        className={`
          rounded-lg p-3 cursor-pointer
          bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50
          shadow-lg active:opacity-80
          ${isDeleting ? 'opacity-0 scale-95 transition-all duration-300' : 'transition-all duration-200'}
        `}
        onClick={() => setIsExpanded(true)}
      >
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">
            敵
          </span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
            {parts.length}部位
          </span>
          <h3 className="text-base font-bold text-stone-100 flex-1 truncate">
            {character.name}
          </h3>
          <span className="text-xs text-stone-500">▼</span>
        </div>

        {/* 部位HP一覧 */}
        <div className="space-y-1">
          {parts.map(part => {
            const hpPercent = getHpPercent(part.hp.current, part.hp.max);
            const status = getPartStatus(part);
            return (
              <div key={part.id} className="flex items-center gap-2">
                <span className={`text-xs w-12 truncate ${status ? status.color : 'text-stone-400'}`}>
                  {part.name}
                </span>
                <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getHpBarColor(part.hp.current, part.hp.max)} transition-all duration-300`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className={`text-xs w-16 text-right ${part.hp.current <= 0 ? 'text-red-400' : 'text-stone-400'}`}>
                  {part.hp.current}/{part.hp.max}
                </span>
              </div>
            );
          })}
        </div>

        {/* バフ表示 */}
        {buffs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {buffs.map(buff => {
              const isKoho = buff.isKoho === true;
              const isPermanent = buff.remaining === -1;
              return (
                <span
                  key={buff.id}
                  className={`text-xs px-1.5 py-0.5 rounded ${isKoho ? 'bg-amber-900/40 text-amber-300' : 'bg-purple-900/40 text-purple-300'
                    }`}
                >
                  {isKoho && '🎺 '}
                  {buff.name} {isPermanent ? '∞' : `${buff.remaining}R`}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 展開表示
  return (
    <div className={`
      relative rounded-lg p-4 
      bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50
      shadow-lg
      ${isDeleting ? 'opacity-0 scale-95 transition-all duration-300' : 'transition-all duration-200'}
    `}>
      {/* 閉じるボタン（右上に単独配置） */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
          setShowDeleteConfirm(false);
        }}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center
          text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 rounded transition-colors text-sm"
      >
        ▲
      </button>

      {/* ヘッダー */}
      <div className="mb-3 pr-12">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-900/60 text-red-300">
            敵
          </span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded">
            {parts.length}部位
          </span>
        </div>
        <h3 className="text-xl font-bold text-stone-100 mt-1">{character.name}</h3>
      </div>

      {/* 各部位 */}
      <div className="space-y-4 mb-3">
        {parts.map(part => {
          const hpPercent = getHpPercent(part.hp.current, part.hp.max);
          const status = getPartStatus(part);
          return (
            <div key={part.id} className="bg-stone-800/30 rounded-lg p-3">
              {/* 部位名 */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`font-medium ${status ? status.color : 'text-stone-200'}`}>
                  {part.name}
                </span>
                {status && (
                  <span className={`text-xs px-1.5 py-0.5 rounded bg-stone-800 ${status.color}`}>
                    {status.label}
                  </span>
                )}
                {/* 部位バフ表示 */}
                {(part.buffs || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-2">
                    {(part.buffs || []).map(buff => (
                      <BuffBadge
                        key={buff.id}
                        buff={buff}
                        onRemove={() => onRemoveBuff(character.id, buff.id, part.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* HP */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-500">HP</span>
                  <span className={part.hp.current <= 0 ? 'text-red-400' : 'text-stone-300'}>
                    {part.hp.current} / {part.hp.max}
                  </span>
                </div>
                <div className="h-3 bg-stone-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${getHpBarColor(part.hp.current, part.hp.max)} transition-all duration-300`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <div className="flex gap-1">
                  {[-10, -5, -1].map(n => (
                    <button
                      key={n}
                      onClick={() => updatePartHp(part.id, n)}
                      className="flex-1 py-1 text-xs bg-red-950/50 active:bg-red-800/60 text-red-300 rounded"
                    >
                      {n}
                    </button>
                  ))}
                  {[1, 5, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => updatePartHp(part.id, n)}
                      className="flex-1 py-1 text-xs bg-emerald-950/50 active:bg-emerald-800/60 text-emerald-300 rounded"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* MP（あれば） */}
              {part.mp.max > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500">MP</span>
                    <span className="text-stone-300">{part.mp.current} / {part.mp.max}</span>
                  </div>
                  <div className="h-2 bg-stone-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${(part.mp.current / part.mp.max) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-1">
                    {[-3, -1].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
                      >
                        {n}
                      </button>
                    ))}
                    {[1, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 戦闘値 */}
              <div className="grid grid-cols-3 gap-1 mt-2 text-center">
                <div className="bg-stone-800/50 rounded px-1 py-0.5">
                  <span className="text-xs text-stone-500">命中 </span>
                  <span className="text-xs text-stone-300">{part.hit}</span>
                </div>
                <div className="bg-stone-800/50 rounded px-1 py-0.5">
                  <span className="text-xs text-stone-500">回避 </span>
                  <span className="text-xs text-stone-300">{part.dodge}</span>
                </div>
                <div className="bg-stone-800/50 rounded px-1 py-0.5">
                  <span className="text-xs text-stone-500">防護 </span>
                  <span className="text-xs text-stone-300">{part.defense}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* バフ一覧 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-stone-400">バフ/デバフ</span>
          <button
            onClick={() => onAddBuff(character)}
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            + 追加
          </button>
        </div>
        {buffs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {buffs.map(buff => (
              <BuffBadge
                key={buff.id}
                buff={buff}
                onRemove={() => onRemoveBuff(character.id, buff.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-600">なし</div>
        )}
      </div>

      {/* 削除ボタン（カード下部に配置） */}
      <div className="mt-4 pt-3 border-t border-stone-700/50">
        {!showDeleteConfirm ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="w-full py-2 text-sm text-stone-500 hover:text-red-400 
              hover:bg-red-950/30 rounded transition-colors"
          >
            この敵を削除
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-red-400">
              「{character.name}」を削除しますか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2 text-sm bg-stone-700 hover:bg-stone-600 
                  text-stone-300 rounded transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex-1 py-2 text-sm bg-red-700 hover:bg-red-600 
                  text-white rounded transition-colors font-medium"
              >
                削除する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
