// ============================================
// キャラクター編集モーダル
// ============================================

import { useState } from 'react';
import type { Character, AllyCharacter, Stats, Modifiers } from '../../types';
import { isAlly } from '../../types';
import { SKILL_CATEGORIES } from '../../data/skills';

interface CharacterEditModalProps {
  character: Character;
  onSave: (character: Character) => void;
  onClose: () => void;
}

export const CharacterEditModal = ({ character, onSave, onClose }: CharacterEditModalProps) => {
  // 味方キャラのみ編集可能
  if (!isAlly(character)) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700">
          <p className="text-stone-400">敵キャラクターは編集できません</p>
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-stone-800 text-stone-400 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const [name, setName] = useState(character.name);
  const [hpMax, setHpMax] = useState(character.hp.max.toString());
  const [mpMax, setMpMax] = useState(character.mp.max.toString());
  const [stats, setStats] = useState<Stats>({ ...character.stats });
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({ ...character.skillLevels });
  const [modifiers, setModifiers] = useState<Modifiers>({ ...character.modifiers });

  const handleSave = () => {
    const newHpMax = parseInt(hpMax) || character.hp.max;
    const newMpMax = parseInt(mpMax) || character.mp.max;
    
    const updated: AllyCharacter = {
      ...character,
      name: name.trim() || character.name,
      hp: { 
        current: Math.min(character.hp.current, newHpMax), 
        max: newHpMax 
      },
      mp: { 
        current: Math.min(character.mp.current, newMpMax), 
        max: newMpMax 
      },
      stats,
      skillLevels,
      modifiers,
    };
    onSave(updated);
    onClose();
  };

  const updateStat = (key: keyof Stats, value: string) => {
    setStats(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const updateSkillLevel = (skill: string, value: string) => {
    const lv = parseInt(value) || 0;
    setSkillLevels(prev => ({ ...prev, [skill]: lv }));
  };

  const updateModifier = (key: keyof Modifiers, value: string) => {
    setModifiers(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-lg border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">キャラクター編集</h3>
        
        {/* 名前 */}
        <div className="mb-4">
          <label className="block text-sm text-stone-400 mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* HP/MP最大値 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm text-stone-400 mb-1">HP最大値</label>
            <input
              type="number"
              value={hpMax}
              onChange={(e) => setHpMax(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                text-stone-200 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">MP最大値</label>
            <input
              type="number"
              value={mpMax}
              onChange={(e) => setMpMax(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                text-stone-200 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* 能力値 */}
        <div className="mb-4">
          <label className="block text-sm text-stone-400 mb-2">能力値</label>
          <div className="grid grid-cols-3 gap-2">
            {(['dex', 'agi', 'str', 'vit', 'int', 'mnd'] as const).map(key => (
              <div key={key}>
                <label className="block text-xs text-stone-500 mb-1">
                  {{ dex: '器用', agi: '敏捷', str: '筋力', vit: '生命', int: '知力', mnd: '精神' }[key]}
                </label>
                <input
                  type="number"
                  value={stats[key]}
                  onChange={(e) => updateStat(key, e.target.value)}
                  className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 text-center text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 技能レベル */}
        <div className="mb-4">
          <label className="block text-sm text-stone-400 mb-2">技能レベル</label>
          {Object.entries(SKILL_CATEGORIES).map(([catKey, cat]) => (
            <div key={catKey} className="mb-3">
              <div className="text-xs text-stone-500 mb-1">{cat.label}</div>
              <div className="grid grid-cols-4 gap-1">
                {cat.skills.map(skill => (
                  <div key={skill} className="text-center">
                    <label className="block text-xs text-stone-600 truncate">{skill}</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={skillLevels[skill] || 0}
                      onChange={(e) => updateSkillLevel(skill, e.target.value)}
                      className="w-full px-1 py-0.5 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-center text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 装備補正 */}
        <div className="mb-4">
          <label className="block text-sm text-stone-400 mb-2">装備補正</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-stone-500 mb-1">命中補正</label>
              <input
                type="number"
                value={modifiers.hitMod}
                onChange={(e) => updateModifier('hitMod', e.target.value)}
                className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 text-center text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">回避補正</label>
              <input
                type="number"
                value={modifiers.dodgeMod}
                onChange={(e) => updateModifier('dodgeMod', e.target.value)}
                className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 text-center text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">防護点</label>
              <input
                type="number"
                value={modifiers.defense}
                onChange={(e) => updateModifier('defense', e.target.value)}
                className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 text-center text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-700 text-white rounded active:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
