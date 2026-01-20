// ============================================
// バフ追加モーダル
// ============================================

import { useState } from 'react';
import type { Character, Buff, BuffType } from '../../types';
import { PRESET_SKILLS } from '../../data/presets';

interface AddBuffModalProps {
  character: Character;
  onAdd: (charId: string, buff: Buff) => void;
  onClose: () => void;
}

const BUFF_TYPES: { value: BuffType; label: string }[] = [
  { value: 'hit', label: '命中' },
  { value: 'dodge', label: '回避' },
  { value: 'defense', label: '防護点' },
  { value: 'vitResist', label: '生命抵抗' },
  { value: 'mndResist', label: '精神抵抗' },
  { value: 'strBonus', label: '筋力B' },
  { value: 'power', label: '威力' },
  { value: 'magicDefense', label: '魔法防御' },
  { value: 'physicalReduce', label: '物理軽減' },
  { value: 'magicReduce', label: '魔法軽減' },
  { value: 'dex', label: '器用度' },
  { value: 'agi', label: '敏捷度' },
  { value: 'str', label: '筋力' },
  { value: 'vit', label: '生命力' },
  { value: 'int', label: '知力' },
  { value: 'mnd', label: '精神力' },
];

export const AddBuffModal = ({ character, onAdd, onClose }: AddBuffModalProps) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [name, setName] = useState('');
  const [effect, setEffect] = useState('');
  const [duration, setDuration] = useState('3');
  const [buffType, setBuffType] = useState<BuffType>('hit');
  const [buffValue, setBuffValue] = useState('1');

  // 既存バフの名前リスト（重複防止用）
  const existingBuffNames = (character.buffs || []).map(b => b.name);

  // 付与されていないプリセットのみ
  const availablePresets = PRESET_SKILLS.filter(
    p => !existingBuffNames.includes(p.name)
  );

  const handlePresetSelect = (preset: typeof PRESET_SKILLS[0]) => {
    const buff: Buff = {
      id: Date.now().toString(),
      name: preset.name,
      effect: preset.effect,
      remaining: preset.duration,
      buffType: preset.buffType,
      buffValue: preset.buffValue,
    };
    onAdd(character.id, buff);
    onClose();
  };

  const handleCustomSubmit = () => {
    if (!name.trim()) return;
    const buff: Buff = {
      id: Date.now().toString(),
      name: name.trim(),
      effect: effect.trim() || '効果',
      remaining: parseInt(duration) || 3,
      buffType,
      buffValue: parseInt(buffValue) || 0,
    };
    onAdd(character.id, buff);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-2">
          バフ/練技追加
        </h3>
        <p className="text-sm text-stone-400 mb-4">{character.name}</p>

        {/* モード切替 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('preset')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${mode === 'preset'
                ? 'bg-purple-700 text-white'
                : 'bg-stone-800 text-stone-400'
              }`}
          >
            プリセット
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${mode === 'custom'
                ? 'bg-purple-700 text-white'
                : 'bg-stone-800 text-stone-400'
              }`}
          >
            カスタム
          </button>
        </div>

        {mode === 'preset' ? (
          /* プリセット一覧 */
          <div className="space-y-2">
            {availablePresets.length === 0 ? (
              <div className="text-center text-stone-500 py-4">
                すべてのプリセットが付与済みです
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availablePresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="p-2 rounded text-left transition-colors
                      bg-purple-900/50 hover:bg-purple-800/60 active:bg-purple-700/70
                      border border-purple-700/50"
                  >
                    <div className="text-sm font-medium text-purple-200">{preset.name}</div>
                    <div className="text-xs text-stone-400">{preset.effect}</div>
                    <div className="text-xs text-purple-400">{preset.duration}R</div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
            >
              閉じる
            </button>
          </div>
        ) : (
          /* カスタム入力 */
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-stone-400 mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="バフ名"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">効果（表示用）</label>
              <input
                type="text"
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
                placeholder="例: 命中+2"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">効果タイプ</label>
                <select
                  value={buffType}
                  onChange={(e) => setBuffType(e.target.value as BuffType)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 focus:outline-none focus:border-purple-600"
                >
                  {BUFF_TYPES.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-1">効果値</label>
                <input
                  type="number"
                  value={buffValue}
                  onChange={(e) => setBuffValue(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">持続ラウンド</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleCustomSubmit}
                disabled={!name.trim()}
                className="flex-1 py-3 bg-purple-700 text-white rounded active:bg-purple-600
                  disabled:bg-stone-700 disabled:text-stone-500"
              >
                追加
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
