// ============================================
// キャラクターカードコンポーネント（改良版）
// - 削除確認ダイアログ追加
// - 削除ボタン位置変更
// - フェードアウトアニメーション
// - 魔力表示セクション追加
// - 敵用攻撃セクション追加(Issue#2)
// ============================================

import { useState } from 'react';
import type {
  Character,
  PartyBuff,
  AllyCharacter,
  SingleEnemy,
  MultiPartEnemy
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
  getMagicPowerList,
  getHpStatus,
  getHpBarColor,
  getHpPercent
} from '../../utils/calc';
import { BuffBadge } from './BuffBadge';
import { AttackSection } from './AttackSection';
import { EnemyAttackSection } from './EnemyAttackSection';


interface CharacterCardProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  onEditStats?: (character: Character) => void;
  onAddBuff: (character: Character) => void;
  onRemoveBuff: (charId: string, buffId: string) => void;
  enemies?: Character[]; // 味方が攻撃する場合のターゲット（=敵一覧）
  allies?: Character[];  // 敵が攻撃する場合のターゲット（=味方一覧）
  partyBuff?: PartyBuff | null;
  onApplyDamage?: (targetId: string, targetPartId: string, damage: number) => void;
  onEnemyAttackDamage?: (targetId: string, damage: number) => void;
}

export const CharacterCard = ({
  character,
  onUpdate,
  onDelete,
  onEditStats,
  onAddBuff,
  onRemoveBuff,
  enemies = [],
  allies = [],
  partyBuff,
  onApplyDamage,
  onEnemyAttackDamage
}: CharacterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 魔力一覧（味方のみ）
  const magicPowerList = isAlly(character)
    ? getMagicPowerList(skillLevels, stats, buffEffects)
    : [];

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

  // 削除処理（アニメーション付き）
  const handleDelete = () => {
    setIsDeleting(true);
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
          ${isEnemy
            ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50'
            : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
          }
          shadow-lg active:opacity-80
          ${isDeleting ? 'opacity-0 scale-95 transition-all duration-300' : 'transition-all duration-200'}
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
      ${isEnemy
        ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50'
        : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
      }
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
            {[-5, -3, -1].map(n => (
              <button
                key={n}
                onClick={() => updateResource('mp', n)}
                className="flex-1 py-1.5 text-sm bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
              >
                {n}
              </button>
            ))}
            {[1, 3, 5].map(n => (
              <button
                key={n}
                onClick={() => updateResource('mp', n)}
                className="flex-1 py-1.5 text-sm bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 能力値（味方のみ） */}
      {isAlly(character) && (
        <div className="grid grid-cols-6 gap-1 mb-3 text-center">
          {(['dex', 'agi', 'str', 'vit', 'int', 'mnd'] as const).map(key => {
            const labels: Record<string, string> = {
              dex: '器用', agi: '敏捷', str: '筋力', vit: '生命', int: '知力', mnd: '精神'
            };
            const baseValue = stats[key];
            const buffBonus = buffEffects[key] || 0;
            const totalValue = baseValue + buffBonus;
            const bonus = Math.floor(totalValue / 6);
            return (
              <div key={key} className="bg-stone-800/50 rounded px-1 py-1">
                <div className="text-xs text-stone-500">{labels[key]}</div>
                <div className={`text-sm ${buffBonus > 0 ? 'text-green-400' : 'text-stone-300'}`}>
                  {totalValue}
                </div>
                <div className="text-xs text-amber-400">B:{bonus}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 戦闘値（味方のみ） */}
      {isAlly(character) && (
        <div className="grid grid-cols-5 gap-1 mb-3 text-center">
          <div className="bg-stone-800/50 rounded px-1 py-1">
            <div className="text-xs text-stone-500">命中</div>
            <div className="text-sm text-stone-200">
              {calcHitValue(character, buffEffects)}
            </div>
          </div>
          <div className="bg-stone-800/50 rounded px-1 py-1">
            <div className="text-xs text-stone-500">回避</div>
            <div className="text-sm text-stone-200">
              {calcDodgeValue(character, buffEffects)}
            </div>
          </div>
          <div className="bg-stone-800/50 rounded px-1 py-1">
            <div className="text-xs text-stone-500">防護</div>
            <div className="text-sm text-stone-200">
              {calcDefenseValue(character, buffEffects)}
            </div>
          </div>
          <div className="bg-stone-800/50 rounded px-1 py-1">
            <div className="text-xs text-stone-500">生抵</div>
            <div className="text-sm text-stone-200">
              {calcVitResist(character, buffEffects)}
            </div>
          </div>
          <div className="bg-stone-800/50 rounded px-1 py-1">
            <div className="text-xs text-stone-500">精抵</div>
            <div className="text-sm text-stone-200">
              {calcMndResist(character, buffEffects)}
            </div>
          </div>
        </div>
      )}

      {/* 魔力表示（味方で魔法技能がある場合のみ） */}
      {isAlly(character) && magicPowerList.length > 0 && (
        <div className="mb-3 p-2 bg-indigo-950/30 rounded border border-indigo-800/30">
          <div className="text-xs text-indigo-400 mb-2">🔮 魔力</div>
          <div className="grid grid-cols-2 gap-2">
            {magicPowerList.map(magic => (
              <div
                key={magic.skillName}
                className="bg-stone-800/50 rounded px-2 py-1 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-stone-400">{magic.magicName}</div>
                  <div className="text-xs text-stone-500">Lv.{magic.level}</div>
                </div>
                <div className={`text-lg font-bold ${buffEffects.magicPower > 0 ? 'text-green-400' : 'text-indigo-300'}`}>
                  {magic.magicPower}
                </div>
              </div>
            ))}
          </div>
          {buffEffects.magicPower > 0 && (
            <div className="text-xs text-green-400 mt-1">
              ※魔力バフ +{buffEffects.magicPower} 適用中
            </div>
          )}
        </div>
      )}

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

      {/* 攻撃セクション（味方のみ） */}
      {isAlly(character) && enemies.length > 0 && onApplyDamage && (
        <AttackSection
          character={character}
          enemies={enemies}
          partyBuff={partyBuff ?? null}
          onApplyDamage={onApplyDamage}
        />
      )}

      {/* 攻撃セクション（敵のみ） */}
      {isEnemy && allies.length > 0 && onEnemyAttackDamage && (isSingleEnemy(character) || isMultiPartEnemy(character)) && (
        <EnemyAttackSection
          enemy={character as SingleEnemy | MultiPartEnemy}
          allies={allies as AllyCharacter[]}
          onApplyDamage={onEnemyAttackDamage}
        />
      )}

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
            このキャラクターを削除
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
