// ============================================
// 複数部位の敵カードコンポーネント
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
  onRemoveBuff: (charId: string, buffId: string) => void;
}

export const MultiPartEnemyCard = ({
  character,
  onUpdate,
  onDelete,
  onAddBuff,
  onRemoveBuff
}: MultiPartEnemyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // コンパクト表示
  if (!isExpanded) {
    return (
      <div
        className="rounded-lg p-3 cursor-pointer
          bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50
          shadow-lg active:opacity-80"
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
                <span className={`text-xs w-12 truncate ${status ? 'text-gray-500' : 'text-stone-400'}`}>
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
            {buffs.map(buff => (
              <span key={buff.id} className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">
                {buff.name} {buff.remaining}R
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 展開表示
  return (
    <div className="rounded-lg p-4 bg-gradient-to-br from-red-950/80 to-stone-900/90 
      border border-red-800/50 shadow-lg"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">
            敵
          </span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
            {parts.length}部位
          </span>
          <h3 className="text-lg font-bold text-stone-100">{character.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-8 h-8 flex items-center justify-center text-stone-400 
              hover:text-stone-200 hover:bg-stone-700/50 rounded text-sm"
          >
            ▲
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(character.id);
            }}
            className="w-8 h-8 flex items-center justify-center text-stone-400 
              hover:text-red-400 hover:bg-red-950/50 rounded text-xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* 各部位 */}
      <div className="space-y-3">
        {parts.map(part => {
          const status = getPartStatus(part);
          const hpPercent = getHpPercent(part.hp.current, part.hp.max);
          const mpPercent = part.mp.max > 0 ? (part.mp.current / part.mp.max) * 100 : 0;

          return (
            <div key={part.id} className="p-3 bg-stone-800/50 rounded border border-stone-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-200">{part.name}</span>
                  {status && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded bg-gray-800 ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>命中 <span className="text-stone-200">{part.hit}</span></span>
                  <span>回避 <span className="text-stone-200">{part.dodge}</span></span>
                  <span>防護 <span className="text-stone-200">{part.defense}</span></span>
                </div>
              </div>

              {/* HP */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-500">HP</span>
                <span className={`text-sm ${part.hp.current <= 0 ? 'text-red-400' : 'text-stone-300'}`}>
                  {part.hp.current}/{part.hp.max}
                </span>
              </div>
              <div className="h-3 bg-stone-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getHpBarColor(part.hp.current, part.hp.max)} transition-all duration-300`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <div className="flex gap-1 mb-2">
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

              {/* MP */}
              {part.mp.max > 0 && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500">MP</span>
                    <span className="text-sm text-stone-300">
                      {part.mp.current}/{part.mp.max}
                    </span>
                  </div>
                  <div className="h-2 bg-stone-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${mpPercent}%` }}
                    />
                  </div>
                  <div className="flex gap-1">
                    {[-5, -1].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
                      >
                        {n}
                      </button>
                    ))}
                    {[1, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-cyan-950/50 active:bg-cyan-800/60 text-cyan-300 rounded"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* バフ表示 */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-500">バフ/デバフ</span>
          <button
            onClick={() => onAddBuff(character)}
            className="text-xs text-purple-400 active:text-purple-300"
          >
            ＋追加
          </button>
        </div>
        {buffs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {buffs.map(buff => (
              <BuffBadge
                key={buff.id}
                buff={buff}
                onRemove={(buffId) => onRemoveBuff(character.id, buffId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-600">なし</div>
        )}
      </div>
    </div>
  );
};
