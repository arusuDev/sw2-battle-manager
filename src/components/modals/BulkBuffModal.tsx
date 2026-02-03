// ============================================
// 一括バフ付与モーダル
// Issue #1: 複数キャラへの一括バフ付与
// ============================================

import { useState, useMemo } from 'react';
import type { Character, Buff, BulkBuffTarget, BuffType } from '../../types';
import { isAlly, isMultiPartEnemy } from '../../types';
import { PRESET_SKILLS } from '../../data/presets';

interface BulkBuffModalProps {
  characters: Character[];
  onApply: (targets: BulkBuffTarget[], buff: Buff) => void;
  onClose: () => void;
}

type TabType = 'allies' | 'enemies';

export const BulkBuffModal = ({ characters, onApply, onClose }: BulkBuffModalProps) => {
  // ============================================
  // State
  // ============================================
  const [activeTab, setActiveTab] = useState<TabType>('allies');
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());

  // バフ設定
  const [buffMode, setBuffMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customName, setCustomName] = useState('');
  const customEffect = ''; // UI未実装のため固定
  const [customDuration, setCustomDuration] = useState('3');
  const [customBuffType, setCustomBuffType] = useState<BuffType>('hit');
  const [customBuffValue, setCustomBuffValue] = useState('1');


  // ============================================
  // 対象リストの生成
  // ============================================
  const targets = useMemo((): BulkBuffTarget[] => {
    const result: BulkBuffTarget[] = [];

    characters.forEach(char => {
      if (activeTab === 'allies' && isAlly(char)) {
        result.push({
          characterId: char.id,
          characterName: char.name,
          isEnemy: false,
        });
      } else if (activeTab === 'enemies' && char.type === 'enemy') {
        if (isMultiPartEnemy(char)) {
          // 複数部位敵は部位単位で追加
          char.parts.forEach(part => {
            result.push({
              characterId: char.id,
              characterName: `${char.name}`,
              partId: part.id,
              partName: part.name,
              isEnemy: true,
            });
          });
        } else {
          result.push({
            characterId: char.id,
            characterName: char.name,
            isEnemy: true,
          });
        }
      }
    });

    return result;
  }, [characters, activeTab]);

  // ============================================
  // 選択操作
  // ============================================
  const getTargetKey = (target: BulkBuffTarget): string => {
    return target.partId ? `${target.characterId}-${target.partId}` : target.characterId;
  };

  const toggleTarget = (target: BulkBuffTarget) => {
    const key = getTargetKey(target);
    setSelectedTargets(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allKeys = targets.map(getTargetKey);
    setSelectedTargets(new Set(allKeys));
  };

  const deselectAll = () => {
    setSelectedTargets(new Set());
  };

  // ============================================
  // バフ適用
  // ============================================
  const handleApply = () => {
    if (selectedTargets.size === 0) return;

    let buff: Buff;

    if (buffMode === 'preset') {
      const preset = PRESET_SKILLS.find(p => p.name === selectedPreset);
      if (!preset) return;

      buff = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: preset.name,
        effect: preset.effect,
        remaining: preset.duration,
        buffType: preset.buffType,
        buffValue: preset.buffValue,
      };
    } else {
      // カスタムバフ
      if (!customName.trim()) return;

      buff = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: customName.trim(),
        effect: customEffect.trim() || `${customBuffType}+${customBuffValue}`,
        remaining: parseInt(customDuration) || 3,
        buffType: customBuffType,
        buffValue: parseInt(customBuffValue) || 0,
      };
    }

    const targetList = targets.filter(t => selectedTargets.has(getTargetKey(t)));
    onApply(targetList, buff);

    onClose();
  };

  // ============================================
  // Render
  // ============================================
  const selectedCount = targets.filter(t => selectedTargets.has(getTargetKey(t))).length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-stone-700">
        {/* ヘッダー */}
        <div className="p-4 border-b border-stone-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-200">✨ 一括バフ付与</h2>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-300 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-stone-700">
          <button
            onClick={() => { setActiveTab('allies'); setSelectedTargets(new Set()); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'allies'
              ? 'bg-blue-700 text-white'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
          >
            味方
          </button>
          <button
            onClick={() => { setActiveTab('enemies'); setSelectedTargets(new Set()); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'enemies'
              ? 'bg-red-700 text-white'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
          >
            敵
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 対象選択 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">
                対象を選択 ({selectedCount}/{targets.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  全選択
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs text-stone-500 hover:text-stone-400"
                >
                  解除
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {targets.map(target => {
                const key = getTargetKey(target);
                const isSelected = selectedTargets.has(key);
                const displayName = target.partName
                  ? `${target.characterName}(${target.partName})`
                  : target.characterName;

                return (
                  <button
                    key={key}
                    onClick={() => toggleTarget(target)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isSelected
                      ? target.isEnemy
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                      }`}
                  >
                    {displayName}
                  </button>
                );
              })}
              {targets.length === 0 && (
                <div className="text-stone-500 text-sm">対象がいません</div>
              )}
            </div>
          </div>

          {/* バフ選択 */}
          {/* モード切替 */}
          <div className="flex gap-2">
            <button
              onClick={() => setBuffMode('preset')}
              className={`flex-1 py-2 rounded text-sm transition-colors ${buffMode === 'preset'
                ? 'bg-purple-700 text-white'
                : 'bg-stone-700 text-stone-400'
                }`}
            >
              プリセット
            </button>
            <button
              onClick={() => setBuffMode('custom')}
              className={`flex-1 py-2 rounded text-sm transition-colors ${buffMode === 'custom'
                ? 'bg-purple-700 text-white'
                : 'bg-stone-700 text-stone-400'
                }`}
            >
              カスタム
            </button>
          </div>

          {buffMode === 'preset' ? (
            /* プリセット選択 */
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SKILLS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPreset(preset.name)}
                  className={`p-2 rounded text-left text-sm transition-colors ${selectedPreset === preset.name
                    ? 'bg-purple-700 text-white'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs opacity-70">{preset.effect} / {preset.duration}R</div>
                </button>
              ))}
            </div>
          ) : (
            /* カスタム入力 */
            <div className="space-y-3 bg-stone-800/50 rounded p-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">バフ名</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="バフ名"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">効果</label>
                  <select
                    value={customBuffType}
                    onChange={(e) => setCustomBuffType(e.target.value as BuffType)}
                    className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-sm focus:outline-none focus:border-purple-600"
                  >
                    <option value="hit">命中</option>
                    <option value="dodge">回避</option>
                    <option value="defense">防護点</option>
                    <option value="power">威力</option>
                    <option value="magicPower">魔力</option>
                    <option value="strBonus">筋力B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">値</label>
                  <input
                    type="number"
                    value={customBuffValue}
                    onChange={(e) => setCustomBuffValue(e.target.value)}
                    className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-sm text-center focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">持続R</label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    min="1"
                    className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-sm text-center focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* フッター */}
        <div className="p-4 border-t border-stone-700 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-700 text-stone-300 rounded
              hover:bg-stone-600 transition-colors"
          >
            キャンセル
          </button>

          <button
            onClick={handleApply}
            disabled={
              selectedCount === 0 ||
              (buffMode === 'preset' && !selectedPreset) ||
              (buffMode === 'custom' && !customName.trim())
            }
            className={`flex-1 py-3 rounded font-medium transition-colors
              ${activeTab === 'enemies'
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-blue-700 hover:bg-blue-600 text-white'
              } disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed`}
          >
            {`${selectedCount}件に適用`}
          </button>
        </div>
      </div>
    </div>
  );
};
