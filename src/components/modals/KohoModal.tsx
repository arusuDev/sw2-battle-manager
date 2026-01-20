// ============================================
// 鼓咆（全体バフ）モーダル
// ============================================

import { useState } from 'react';
import type { PartyBuff } from '../../types';
import { KOHO_PRESETS } from '../../data/presets';

interface KohoModalProps {
  partyBuff: PartyBuff | null;
  onSet: (buff: PartyBuff | null) => void;
  onClose: () => void;
}

export const KohoModal = ({ partyBuff, onSet, onClose }: KohoModalProps) => {
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customType, setCustomType] = useState<'attack' | 'defense'>('attack');
  const [customPhysDmg, setCustomPhysDmg] = useState('0');
  const [customMagicDmg, setCustomMagicDmg] = useState('0');
  const [customPhysReduce, setCustomPhysReduce] = useState('0');
  const [customMagicReduce, setCustomMagicReduce] = useState('0');

  const handlePresetSelect = (type: 'attack' | 'defense', koho: typeof KOHO_PRESETS.attack[0]) => {
    onSet({ 
      type, 
      name: koho.name, 
      effect: koho.effect,
      physicalDamage: koho.physicalDamage || 0,
      magicDamage: koho.magicDamage || 0,
      physicalReduce: koho.physicalReduce || 0,
      magicReduce: koho.magicReduce || 0,
    });
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onSet({ 
      type: customType,
      name: customName.trim(), 
      effect: customEffect.trim() || '効果',
      physicalDamage: parseInt(customPhysDmg) || 0,
      magicDamage: parseInt(customMagicDmg) || 0,
      physicalReduce: parseInt(customPhysReduce) || 0,
      magicReduce: parseInt(customMagicReduce) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">鼓咆（全体バフ）</h3>

        {/* 攻撃系鼓咆 */}
        <div className="mb-4">
          <span className="text-sm font-medium text-orange-400 block mb-2">攻撃系鼓咆</span>
          <div className="grid grid-cols-2 gap-2">
            {KOHO_PRESETS.attack.map(koho => (
              <button
                key={koho.name}
                onClick={() => handlePresetSelect('attack', koho)}
                className={`p-2 rounded text-left transition-colors ${
                  partyBuff?.type === 'attack' && partyBuff?.name === koho.name
                    ? 'bg-orange-700 border border-orange-500'
                    : 'bg-orange-900/50 hover:bg-orange-800/60 active:bg-orange-700/70 border border-orange-700/50'
                }`}
              >
                <div className="text-sm font-medium text-orange-200">{koho.name}</div>
                <div className="text-xs text-stone-400">{koho.effect}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 防御系鼓咆 */}
        <div className="mb-4">
          <span className="text-sm font-medium text-cyan-400 block mb-2">防御系鼓咆</span>
          <div className="grid grid-cols-2 gap-2">
            {KOHO_PRESETS.defense.map(koho => (
              <button
                key={koho.name}
                onClick={() => handlePresetSelect('defense', koho)}
                className={`p-2 rounded text-left transition-colors ${
                  partyBuff?.type === 'defense' && partyBuff?.name === koho.name
                    ? 'bg-cyan-700 border border-cyan-500'
                    : 'bg-cyan-900/50 hover:bg-cyan-800/60 active:bg-cyan-700/70 border border-cyan-700/50'
                }`}
              >
                <div className="text-sm font-medium text-cyan-200">{koho.name}</div>
                <div className="text-xs text-stone-400">{koho.effect}</div>
              </button>
            ))}
          </div>
        </div>

        {/* カスタム鼓咆 */}
        <div className="border-t border-stone-700 pt-4">
          <span className="text-sm text-stone-400 mb-2 block">カスタム鼓咆</span>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setCustomType('attack')}
              className={`flex-1 py-1 rounded text-sm ${
                customType === 'attack' ? 'bg-orange-700 text-white' : 'bg-stone-800 text-stone-400'
              }`}
            >
              攻撃系
            </button>
            <button
              onClick={() => setCustomType('defense')}
              className={`flex-1 py-1 rounded text-sm ${
                customType === 'defense' ? 'bg-cyan-700 text-white' : 'bg-stone-800 text-stone-400'
              }`}
            >
              防御系
            </button>
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
          {customType === 'attack' ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-stone-500 mb-1">物理ダメージ+</label>
                <input
                  type="number"
                  value={customPhysDmg}
                  onChange={(e) => setCustomPhysDmg(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-orange-600"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">魔法ダメージ+</label>
                <input
                  type="number"
                  value={customMagicDmg}
                  onChange={(e) => setCustomMagicDmg(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-orange-600"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-stone-500 mb-1">物理ダメージ軽減</label>
                <input
                  type="number"
                  value={customPhysReduce}
                  onChange={(e) => setCustomPhysReduce(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">魔法ダメージ軽減</label>
                <input
                  type="number"
                  value={customMagicReduce}
                  onChange={(e) => setCustomMagicReduce(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          )}
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
