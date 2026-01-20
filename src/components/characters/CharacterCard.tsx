// ============================================
// キャラクターカードコンポーネント
// ============================================

import { useState } from 'react';
import type {
  Character,
  PartyBuff
} from '../../types';
import { isAlly, isSingleEnemy, isMultiPartEnemy } from '../../types';
import {
  calcBuffEffects,
  calcAdventurerLevel,
  calcHitValue,
  calcDodgeValue,
  calcDefenseValue,
  calcVitResist,
  calcMndResist,
  getHpStatus,
  getHpBarColor,
  getHpPercent
} from '../../utils/calc';
import { BuffBadge } from './BuffBadge';
import { AttackSection } from './AttackSection';


interface CharacterCardProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  onEditStats?: (character: Character) => void;
  onAddBuff: (character: Character) => void;
  onRemoveBuff: (charId: string, buffId: string) => void;
  enemies?: Character[];
  partyBuff?: PartyBuff | null;
  onApplyDamage?: (targetId: string, targetPartId: string, damage: number) => void;
}

export const CharacterCard = ({
  character,
  onUpdate,
  onDelete,
  onEditStats,
  onAddBuff,
  onRemoveBuff,
  enemies = [],
  partyBuff,
  onApplyDamage
}: CharacterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isEnemy = character.type === 'enemy';
  const buffs = character.buffs || [];

  // 味方専用の値
  const stats = isAlly(character) ? character.stats : { dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 };
  const skillLevels = isAlly(character) ? character.skillLevels : {};
  const advLv = calcAdventurerLevel(skillLevels);
  const buffEffects = calcBuffEffects(buffs);

  // HP/MP（単体のみ）
  const hp = isSingleEnemy(character) || isAlly(character) ? character.hp : { current: 0, max: 0 };
  const mp = isSingleEnemy(character) || isAlly(character) ? character.mp : { current: 0, max: 0 };
  const hpPercent = getHpPercent(hp.current, hp.max);
  const hpStatus = getHpStatus(hp.current, stats.vit);

  const updateResource = (resource: 'hp' | 'mp', delta: number) => {
    if (isMultiPartEnemy(character)) return;

    const current = character[resource];
    const minValue = resource === 'hp' ? -999 : 0;
    const newValue = Math.max(minValue, Math.min(current.current + delta, current.max));
    onUpdate({
      ...character,
      [resource]: { ...current, current: newValue }
    } as Character);
  };



  // コンパクト表示
  if (!isExpanded) {
    return (
      <div
        className={`
          rounded-lg p-3 cursor-pointer
          ${isEnemy
            ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50'
            : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
          }
          shadow-lg active:opacity-80
        `}
        onClick={() => setIsExpanded(true)}
      >
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`
            text-xs font-medium px-1.5 py-0.5 rounded
            ${isEnemy ? 'bg-red-900/60 text-red-300' : 'bg-blue-900/60 text-blue-300'}
          `}>
            {isEnemy ? '敵' : '味方'}
          </span>
          {!isEnemy && advLv > 0 && (
            <span className="text-xs bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">
              Lv.{advLv}
            </span>
          )}
          <h3 className="text-base font-bold text-stone-100 flex-1 truncate">
            {character.name}
          </h3>
          <span className="text-xs text-stone-500">▼</span>
        </div>

        {/* HP/MP */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-stone-500">HP</span>
              <div className="flex items-center gap-1">
                {hpStatus && (
                  <span className={`${hpStatus.color} text-xs font-bold`}>{hpStatus.label}</span>
                )}
                <span className={hp.current <= 0 ? 'text-red-400' : 'text-stone-300'}>
                  {hp.current}/{hp.max}
                </span>
              </div>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getHpBarColor(hp.current, hp.max)} transition-all duration-300`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
          {mp.max > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-stone-500">MP</span>
                <span className="text-stone-300">{mp.current}/{mp.max}</span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${mp.max > 0 ? (mp.current / mp.max) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* バフ表示 */}
        {buffs.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
    <div className={`
      relative rounded-lg p-4 
      ${isEnemy
        ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50'
        : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
      }
      shadow-lg
    `}>
      {/* 閉じるボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
        className="absolute top-2 right-10 w-8 h-8 flex items-center justify-center
          text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 rounded transition-colors text-sm"
      >
        ▲
      </button>

      {/* 削除ボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(character.id);
        }}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center
          text-stone-400 hover:text-red-400 hover:bg-red-950/50 rounded transition-colors text-xl z-10"
      >
        ×
      </button>

      {/* ヘッダー */}
      <div className="mb-3 pr-20">
        <div className="flex items-center gap-2">
          <span className={`
            text-xs font-medium px-2 py-0.5 rounded
            ${isEnemy ? 'bg-red-900/60 text-red-300' : 'bg-blue-900/60 text-blue-300'}
          `}>
            {isEnemy ? '敵' : '味方'}
          </span>
          {!isEnemy && advLv > 0 && (
            <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
              Lv.{advLv}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <h3 className="text-xl font-bold text-stone-100">{character.name}</h3>
          {!isEnemy && onEditStats && (
            <button
              onClick={() => onEditStats(character)}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              編集
            </button>
          )}
        </div>
      </div>

      {/* HP */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-stone-400">HP</span>
          <div className="flex items-center gap-2">
            {hpStatus && (
              <span className={`text-sm font-bold ${hpStatus.color}`}>{hpStatus.label}</span>
            )}
            <span className={`text-lg font-bold ${hp.current <= 0 ? 'text-red-400' : 'text-stone-200'}`}>
              {hp.current} / {hp.max}
            </span>
          </div>
        </div>
        <div className="h-4 bg-stone-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full ${getHpBarColor(hp.current, hp.max)} transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex gap-1">
          {[-10, -5, -1].map(n => (
            <button
              key={n}
              onClick={() => updateResource('hp', n)}
              className="flex-1 py-2 text-sm bg-red-950/50 active:bg-red-800/60 text-red-300 rounded"
            >
              {n}
            </button>
          ))}
          {[1, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => updateResource('hp', n)}
              className="flex-1 py-2 text-sm bg-emerald-950/50 active:bg-emerald-800/60 text-emerald-300 rounded"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* MP */}
      {mp.max > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-stone-400">MP</span>
            <span className="text-lg font-bold text-stone-200">{mp.current} / {mp.max}</span>
          </div>
          <div className="h-3 bg-stone-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${mp.max > 0 ? (mp.current / mp.max) * 100 : 0}%` }}
            />
          </div>
          <div className="flex gap-1">
            {[-5, -1].map(n => (
              <button
                key={n}
                onClick={() => updateResource('mp', n)}
                className="flex-1 py-1 text-sm bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
              >
                {n}
              </button>
            ))}
            {[1, 5].map(n => (
              <button
                key={n}
                onClick={() => updateResource('mp', n)}
                className="flex-1 py-1 text-sm bg-cyan-950/50 active:bg-cyan-800/60 text-cyan-300 rounded"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 味方用：戦闘ステータス */}
      {!isEnemy && isAlly(character) && (
        <div className="grid grid-cols-5 gap-2 mb-3 p-2 bg-stone-800/50 rounded text-center text-xs">
          <div>
            <div className="text-stone-500">命中</div>
            <div className="text-stone-200 font-bold">{calcHitValue(character, buffEffects)}</div>
          </div>
          <div>
            <div className="text-stone-500">回避</div>
            <div className="text-stone-200 font-bold">{calcDodgeValue(character, buffEffects)}</div>
          </div>
          <div>
            <div className="text-stone-500">防護</div>
            <div className="text-stone-200 font-bold">{calcDefenseValue(character, buffEffects)}</div>
          </div>
          <div>
            <div className="text-stone-500">生抵</div>
            <div className="text-stone-200 font-bold">{calcVitResist(character, buffEffects)}</div>
          </div>
          <div>
            <div className="text-stone-500">精抵</div>
            <div className="text-stone-200 font-bold">{calcMndResist(character, buffEffects)}</div>
          </div>
        </div>
      )}

      {/* バフ */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-500">バフ/練技</span>
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
          <div className="text-xs text-stone-600">バフなし</div>
        )}
      </div>

      {/* 攻撃セクション（味方のみ） */}
      {!isEnemy && isAlly(character) && onApplyDamage && (
        <AttackSection
          character={character}
          enemies={enemies}
          partyBuff={partyBuff ?? null}
          onApplyDamage={onApplyDamage}
        />
      )}
    </div>
  );
};
