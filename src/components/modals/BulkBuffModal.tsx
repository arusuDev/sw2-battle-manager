// ============================================
// 一括バフ付与モーダル
// Issue #1: 複数キャラへの一括バフ・鼓咆付与
// ============================================

import { useState, useMemo } from 'react';
import type { Character, Buff, BulkBuffTarget, BuffType } from '../../types';
import { isAlly, isMultiPartEnemy } from '../../types';
import { PRESET_SKILLS, KOHO_PRESETS } from '../../data/presets';

interface BulkBuffModalProps {
  characters: Character[];
  onApply: (targets: BulkBuffTarget[], buff: Buff) => void;
  onRemoveKoho?: (targets: BulkBuffTarget[]) => void;
  onClose: () => void;
}

type TabType = 'allies' | 'enemies' | 'koho';

export const BulkBuffModal = ({ characters, onApply, onRemoveKoho, onClose }: BulkBuffModalProps) => {
  // ============================================
  // State
  // ============================================
  const [activeTab, setActiveTab] = useState<TabType>('allies');
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());

  // バフ設定
  const [buffMode, setBuffMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customDuration, setCustomDuration] = useState('3');
  const [customBuffType, setCustomBuffType] = useState<BuffType>('hit');
  const [customBuffValue, setCustomBuffValue] = useState('1');

  // 鼓咆設定
  const [kohoMode, setKohoMode] = useState<'preset' | 'custom'>('preset');
  const [kohoType, setKohoType] = useState<'attack' | 'defense'>('attack');
  const [selectedKoho, setSelectedKoho] = useState<string>('');

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
      } else if ((activeTab === 'enemies' || activeTab === 'koho') && char.type === 'enemy') {
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

  // 味方リスト（鼓咆用）
  const allyTargets = useMemo((): BulkBuffTarget[] => {
    return characters
      .filter(isAlly)
      .map(char => ({
        characterId: char.id,
        characterName: char.name,
        isEnemy: false,
      }));
  }, [characters]);

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
    const currentTargets = activeTab === 'koho' ? allyTargets : targets;
    const allKeys = currentTargets.map(getTargetKey);
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

    if (activeTab === 'koho') {
      // 鼓咆の場合
      if (kohoMode === 'preset') {
        const kohoList = kohoType === 'attack' ? KOHO_PRESETS.attack : KOHO_PRESETS.defense;
        const preset = kohoList.find(k => k.name === selectedKoho);
        if (!preset) return;

        // 鼓咆のBuffType決定
        let buffType: BuffType = 'physicalReduce';
        let buffValue = 0;
        if (preset.physicalDamage) {
          buffType = 'power';
          buffValue = preset.physicalDamage;
        } else if (preset.magicDamage) {
          buffType = 'magicPower';
          buffValue = preset.magicDamage;
        } else if (preset.physicalReduce) {
          buffType = 'physicalReduce';
          buffValue = preset.physicalReduce;
        } else if (preset.magicReduce) {
          buffType = 'magicReduce';
          buffValue = preset.magicReduce;
        }

        buff = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: preset.name,
          effect: preset.effect,
          remaining: -1, // 永続
          buffType,
          buffValue,
          isKoho: true,
        };
      } else {
        // カスタム鼓咆
        if (!customName.trim()) return;

        buff = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: customName.trim(),
          effect: customEffect.trim() || `${customBuffType}+${customBuffValue}`,
          remaining: -1, // 永続
          buffType: customBuffType,
          buffValue: parseInt(customBuffValue) || 0,
          isKoho: true,
        };
      }

      // 鼓咆は味方全員に適用
      const targetList = allyTargets.filter(t => selectedTargets.has(getTargetKey(t)));
      onApply(targetList, buff);
    } else {
      // 通常バフの場合
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
    }

    onClose();
  };

  // ============================================
  // 削除適用
  // ============================================
  const handleRemove = () => {
    if (selectedTargets.size === 0 || !onRemoveKoho) return;

    // 鼓咆は味方全員対象リストから選択されたものを抽出
    const targetList = allyTargets.filter(t => selectedTargets.has(getTargetKey(t)));
    onRemoveKoho(targetList);
    onClose();
  };

  // ============================================
  // Render
  // ============================================
  const currentTargets = activeTab === 'koho' ? allyTargets : targets;
  const selectedCount = currentTargets.filter(t => selectedTargets.has(getTargetKey(t))).length;

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
          <button
            onClick={() => { setActiveTab('koho'); setSelectedTargets(new Set()); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'koho'
                ? 'bg-amber-700 text-white'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
          >
            🎺 鼓咆
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 対象選択 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">
                対象を選択 ({selectedCount}/{currentTargets.length})
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
              {currentTargets.map(target => {
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
              {currentTargets.length === 0 && (
                <div className="text-stone-500 text-sm">対象がいません</div>
              )}
            </div>
          </div>

          {/* バフ選択（鼓咆タブ以外） */}
          {activeTab !== 'koho' && (
            <>
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
            </>
          )}

          {/* 鼓咆選択 */}
          {activeTab === 'koho' && (
            <div className="space-y-3">
              <div className="text-xs text-amber-400">
                🎺 鼓咆は永続（∞）で、1キャラにつき1種類のみです（上書き）
              </div>

              {/* モード切替 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setKohoMode('preset')}
                  className={`flex-1 py-2 rounded text-sm transition-colors ${kohoMode === 'preset'
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-700 text-stone-400'
                    }`}
                >
                  プリセット
                </button>
                <button
                  onClick={() => setKohoMode('custom')}
                  className={`flex-1 py-2 rounded text-sm transition-colors ${kohoMode === 'custom'
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-700 text-stone-400'
                    }`}
                >
                  カスタム
                </button>
              </div>

              {kohoMode === 'preset' ? (
                <>
                  {/* 攻撃系/防御系切替 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setKohoType('attack')}
                      className={`flex-1 py-2 rounded text-sm transition-colors ${kohoType === 'attack'
                          ? 'bg-red-700 text-white'
                          : 'bg-stone-700 text-stone-400'
                        }`}
                    >
                      攻撃系
                    </button>
                    <button
                      onClick={() => setKohoType('defense')}
                      className={`flex-1 py-2 rounded text-sm transition-colors ${kohoType === 'defense'
                          ? 'bg-blue-700 text-white'
                          : 'bg-stone-700 text-stone-400'
                        }`}
                    >
                      防御系
                    </button>
                  </div>

                  {/* 鼓咆リスト */}
                  <div className="space-y-2">
                    {(kohoType === 'attack' ? KOHO_PRESETS.attack : KOHO_PRESETS.defense).map(koho => (
                      <button
                        key={koho.name}
                        onClick={() => setSelectedKoho(koho.name)}
                        className={`w-full p-3 rounded text-left transition-colors ${selectedKoho === koho.name
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                      >
                        <div className="font-medium">🎺 {koho.name}</div>
                        <div className="text-xs opacity-70">{koho.effect}</div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* カスタム鼓咆入力 */
                <div className="space-y-3 bg-stone-800/50 rounded p-3">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">鼓咆名</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="例：怒涛の攻陣"
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">効果タイプ</label>
                      <select
                        value={customBuffType}
                        onChange={(e) => setCustomBuffType(e.target.value as BuffType)}
                        className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded
                          text-stone-200 text-sm focus:outline-none focus:border-amber-600"
                      >
                        <option value="power">物理D上昇</option>
                        <option value="magicPower">魔法D上昇</option>
                        <option value="hit">命中上昇</option>
                        <option value="physicalReduce">物理D軽減</option>
                        <option value="magicReduce">魔法D軽減</option>
                        <option value="defense">防護点上昇</option>
                        <option value="dodge">回避上昇</option>
                        <option value="vitResist">生命抵抗</option>
                        <option value="mndResist">精神抵抗</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">値</label>
                      <input
                        type="number"
                        value={customBuffValue}
                        onChange={(e) => setCustomBuffValue(e.target.value)}
                        className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded
                          text-stone-200 text-sm text-center focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-amber-400 mt-2">
                    ※鼓咆は永続効果（∞）として適用されます
                  </div>
                </div>
              )}
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

          {activeTab === 'koho' && onRemoveKoho && (
            <button
              onClick={handleRemove}
              disabled={selectedCount === 0}
              className="px-4 py-3 bg-red-800/80 text-red-100 rounded font-medium
                hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              解除
            </button>
          )}

          <button
            onClick={handleApply}
            disabled={
              selectedCount === 0 ||
              (activeTab === 'koho' && kohoMode === 'preset' && !selectedKoho) ||
              (activeTab === 'koho' && kohoMode === 'custom' && !customName.trim()) ||
              (activeTab !== 'koho' && buffMode === 'preset' && !selectedPreset) ||
              (activeTab !== 'koho' && buffMode === 'custom' && !customName.trim())
            }
            className={`flex-1 py-3 rounded font-medium transition-colors
              ${activeTab === 'koho'
                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                : activeTab === 'enemies'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-blue-700 hover:bg-blue-600 text-white'
              } disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed`}
          >
            {activeTab === 'koho' ? '鼓咆を適用' : `${selectedCount}件に適用`}
          </button>
        </div>
      </div>
    </div>
  );
};
