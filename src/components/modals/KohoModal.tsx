// ============================================
// 鼓咆（全体バフ）モーダル
// ============================================

import { useState } from 'react';
import type { PartyBuff, KohoPreset } from '../../types';
import { KOHO_PRESETS } from '../../data/presets';

interface KohoModalProps {
  partyBuff: PartyBuff | null;
  onSet: (buff: PartyBuff | null) => void;
  onClose: () => void;
}

type KohoType = 'attack' | 'defense' | 'evasion' | 'resist';

const KOHO_TYPE_CONFIG: Record<KohoType, { label: string; color: string; bgActive: string; bgHover: string; border: string; text: string }> = {
  attack: {
    label: '攻撃系',
    color: 'orange',
    bgActive: 'bg-orange-700 border-orange-500',
    bgHover: 'bg-orange-900/50 hover:bg-orange-800/60 active:bg-orange-700/70 border-orange-700/50',
    border: 'border-orange-600',
    text: 'text-orange-400',
  },
  defense: {
    label: '防御系',
    color: 'cyan',
    bgActive: 'bg-cyan-700 border-cyan-500',
    bgHover: 'bg-cyan-900/50 hover:bg-cyan-800/60 active:bg-cyan-700/70 border-cyan-700/50',
    border: 'border-cyan-600',
    text: 'text-cyan-400',
  },
  evasion: {
    label: '回避系',
    color: 'green',
    bgActive: 'bg-green-700 border-green-500',
    bgHover: 'bg-green-900/50 hover:bg-green-800/60 active:bg-green-700/70 border-green-700/50',
    border: 'border-green-600',
    text: 'text-green-400',
  },
  resist: {
    label: '抵抗系',
    color: 'purple',
    bgActive: 'bg-purple-700 border-purple-500',
    bgHover: 'bg-purple-900/50 hover:bg-purple-800/60 active:bg-purple-700/70 border-purple-700/50',
    border: 'border-purple-600',
    text: 'text-purple-400',
  },
};

export const KohoModal = ({ partyBuff, onSet, onClose }: KohoModalProps) => {
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customType, setCustomType] = useState<KohoType>('attack');

  const handlePresetSelect = (type: KohoType, koho: KohoPreset) => {
    onSet({
      type,
      name: koho.name,
      effect: koho.effect,
      // 攻撃系
      physicalDamage: koho.physicalDamage,
      magicDamage: koho.magicDamage,
      hit: koho.hit,
      // 防御系
      defense: koho.defense,
      physicalReduce: koho.physicalReduce,
      magicReduce: koho.magicReduce,
      // 回避系
      dodge: koho.dodge,
      damageReduce: koho.damageReduce,
      // 抵抗系
      vitResist: koho.vitResist,
      mndResist: koho.mndResist,
      // ペナルティ
      dodgePenalty: koho.dodgePenalty,
      defensePenalty: koho.defensePenalty,
      physicalDamagePenalty: koho.physicalDamagePenalty,
      vitResistPenalty: koho.vitResistPenalty,
      mndResistPenalty: koho.mndResistPenalty,
    });
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onSet({
      type: customType,
      name: customName.trim(),
      effect: customEffect.trim() || '効果',
    });
    onClose();
  };

  const renderKohoSection = (type: KohoType, presets: KohoPreset[]) => {
    const config = KOHO_TYPE_CONFIG[type];
    return (
      <div className="mb-4">
        <span className={`text-sm font-medium ${config.text} block mb-2`}>{config.label}鼓咆</span>
        <div className="grid grid-cols-1 gap-2">
          {presets.map(koho => (
            <button
              key={koho.name}
              onClick={() => handlePresetSelect(type, koho)}
              className={`p-2 rounded text-left transition-colors border ${
                partyBuff?.type === type && partyBuff?.name === koho.name
                  ? config.bgActive
                  : config.bgHover
              }`}
            >
              <div className={`text-sm font-medium text-${config.color}-200`}>{koho.name}</div>
              <div className="text-xs text-stone-400">{koho.effect}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">鼓咆（全体バフ）</h3>

        {/* 攻撃系鼓咆 */}
        {renderKohoSection('attack', KOHO_PRESETS.attack)}

        {/* 防御系鼓咆 */}
        {renderKohoSection('defense', KOHO_PRESETS.defense)}

        {/* 回避系鼓咆 */}
        {renderKohoSection('evasion', KOHO_PRESETS.evasion)}

        {/* 抵抗系鼓咆 */}
        {renderKohoSection('resist', KOHO_PRESETS.resist)}

        {/* カスタム鼓咆 */}
        <div className="border-t border-stone-700 pt-4">
          <span className="text-sm text-stone-400 mb-2 block">カスタム鼓咆</span>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {(['attack', 'defense', 'evasion', 'resist'] as KohoType[]).map(type => {
              const config = KOHO_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setCustomType(type)}
                  className={`py-1 rounded text-xs ${
                    customType === type
                      ? `bg-${config.color}-700 text-white`
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="鼓咆名"
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 mb-2"
          />
          <input
            type="text"
            value={customEffect}
            onChange={(e) => setCustomEffect(e.target.value)}
            placeholder="効果説明（表示用）"
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 mb-2"
          />
          <button
            onClick={handleCustomAdd}
            disabled={!customName.trim()}
            className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500
              text-white rounded transition-colors"
          >
            カスタム追加
          </button>
        </div>

        {/* 解除ボタン */}
        {partyBuff && (
          <button
            onClick={() => { onSet(null); onClose(); }}
            className="w-full mt-4 py-2 bg-red-900/50 hover:bg-red-800/60 text-red-300 rounded transition-colors"
          >
            鼓咆を解除
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
