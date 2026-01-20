// ============================================
// キャラクター追加フォーム
// ============================================

import { useState } from 'react';
import type { Character, Stats } from '../../types';
import { SKILL_CATEGORIES } from '../../data/skills';

interface AddCharacterFormProps {
  onAdd: (character: Character) => void;
}

interface PartInput {
  name: string;
  hp: string;
  mp: string;
  hit: string;
  dodge: string;
  defense: string;
}

export const AddCharacterForm = ({ onAdd }: AddCharacterFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'ally' | 'enemy'>('ally');
  const [hp, setHp] = useState('30');
  const [mp, setMp] = useState('20');
  const [hasMultipleParts, setHasMultipleParts] = useState(false);
  const [parts, setParts] = useState<PartInput[]>([
    { name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0' }
  ]);

  // 味方用ステータス
  const [stats, setStats] = useState<Stats>({ dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 });
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [hitMod, setHitMod] = useState('0');
  const [dodgeMod, setDodgeMod] = useState('0');
  const [defense, setDefense] = useState('0');

  const addPart = () => {
    if (parts.length >= 10) return;
    setParts(prev => [...prev, {
      name: `部位${prev.length + 1}`,
      hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0'
    }]);
  };

  const removePart = (index: number) => {
    if (parts.length <= 1) return;
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, key: keyof PartInput, value: string) => {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (type === 'ally') {
      // 味方キャラクター
      const hpMax = parseInt(hp) || 30;
      const mpMax = parseInt(mp) || 20;

      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        type: 'ally',
        hp: { current: hpMax, max: hpMax },
        mp: { current: mpMax, max: mpMax },
        stats: { ...stats },
        skillLevels: { ...skillLevels },
        modifiers: {
          hitMod: parseInt(hitMod) || 0,
          dodgeMod: parseInt(dodgeMod) || 0,
          defense: parseInt(defense) || 0
        },
        buffs: [],
      });
    } else if (hasMultipleParts) {
      // 複数部位の敵
      const partsData = parts.map(p => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: p.name.trim() || '部位',
        hp: { current: parseInt(p.hp) || 30, max: parseInt(p.hp) || 30 },
        mp: { current: parseInt(p.mp) || 0, max: parseInt(p.mp) || 0 },
        hit: parseInt(p.hit) || 0,
        dodge: parseInt(p.dodge) || 0,
        defense: parseInt(p.defense) || 0,
      }));

      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        type: 'enemy',
        parts: partsData,
        buffs: [],
      });
    } else {
      // 単体の敵
      const hpMax = parseInt(hp) || 30;
      const mpMax = parseInt(mp) || 0;

      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        type: 'enemy',
        hp: { current: hpMax, max: hpMax },
        mp: { current: mpMax, max: mpMax },
        modifiers: {
          hitMod: parseInt(hitMod) || 0,
          dodgeMod: parseInt(dodgeMod) || 0,
          defense: parseInt(defense) || 0
        },
        buffs: [],
      });
    }

    // リセット
    setName('');
    setType('ally');
    setHp('30');
    setMp('20');
    setStats({ dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 });
    setSkillLevels({});
    setHitMod('0');
    setDodgeMod('0');
    setDefense('0');
    setHasMultipleParts(false);
    setParts([{ name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0' }]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-stone-700 rounded-lg
          text-stone-500 active:bg-stone-800/50 
          transition-colors flex items-center justify-center gap-2 text-lg"
      >
        <span className="text-2xl">+</span>
        <span>キャラクター追加</span>
      </button>
    );
  }

  return (
    <div className="bg-stone-900 rounded-lg p-4 border border-stone-700">
      <h3 className="text-lg font-bold text-stone-200 mb-4">新規キャラクター</h3>

      <div className="space-y-4">
        {/* 名前 */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="キャラクター名"
            className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 text-lg"
          />
        </div>

        {/* タイプ選択 */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">タイプ</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType('ally'); setHasMultipleParts(false); }}
              className={`flex-1 py-3 rounded font-medium transition-colors text-lg ${type === 'ally'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-800 text-stone-400 active:bg-stone-700'
                }`}
            >
              味方
            </button>
            <button
              type="button"
              onClick={() => setType('enemy')}
              className={`flex-1 py-3 rounded font-medium transition-colors text-lg ${type === 'enemy'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-800 text-stone-400 active:bg-stone-700'
                }`}
            >
              敵
            </button>
          </div>
        </div>

        {type === 'ally' ? (
          /* 味方キャラクター */
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">HP</label>
                <input
                  type="number"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-1">MP</label>
                <input
                  type="number"
                  value={mp}
                  onChange={(e) => setMp(e.target.value)}
                  className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                    text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                />
              </div>
            </div>

            {/* 能力値 */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">能力値</label>
              <div className="grid grid-cols-6 gap-1">
                {(['dex', 'agi', 'str', 'vit', 'int', 'mnd'] as const).map(key => (
                  <div key={key} className="text-center">
                    <label className="block text-xs text-stone-600">
                      {{ dex: '器用', agi: '敏捷', str: '筋力', vit: '生命', int: '知力', mnd: '精神' }[key]}
                    </label>
                    <input
                      type="number"
                      value={stats[key]}
                      onChange={(e) => setStats(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-1 py-1 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-center text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 技能 */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">技能レベル</label>
              {Object.entries(SKILL_CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey} className="mb-2">
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
                          onChange={(e) => setSkillLevels(prev => ({ ...prev, [skill]: parseInt(e.target.value) || 0 }))}
                          className="w-full px-1 py-0.5 bg-stone-800 border border-stone-700 rounded
                            text-stone-200 text-center text-sm focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 装備補正 */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">装備補正</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">命中</label>
                  <input
                    type="number"
                    value={hitMod}
                    onChange={(e) => setHitMod(e.target.value)}
                    className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-center focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">回避</label>
                  <input
                    type="number"
                    value={dodgeMod}
                    onChange={(e) => setDodgeMod(e.target.value)}
                    className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-center focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">防護点</label>
                  <input
                    type="number"
                    value={defense}
                    onChange={(e) => setDefense(e.target.value)}
                    className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 text-center focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 敵キャラクター */
          <>
            {/* 複数部位トグル */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasMultipleParts(false)}
                className={`flex-1 py-2 rounded text-sm transition-colors ${!hasMultipleParts
                    ? 'bg-red-700 text-white'
                    : 'bg-stone-800 text-stone-400'
                  }`}
              >
                単体
              </button>
              <button
                type="button"
                onClick={() => setHasMultipleParts(true)}
                className={`flex-1 py-2 rounded text-sm transition-colors ${hasMultipleParts
                    ? 'bg-red-700 text-white'
                    : 'bg-stone-800 text-stone-400'
                  }`}
              >
                複数部位
              </button>
            </div>

            {!hasMultipleParts ? (
              /* 単体敵 */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">HP</label>
                    <input
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">MP</label>
                    <input
                      type="number"
                      value={mp}
                      onChange={(e) => setMp(e.target.value)}
                      className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">命中</label>
                    <input
                      type="number"
                      value={hitMod}
                      onChange={(e) => setHitMod(e.target.value)}
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-center focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">回避</label>
                    <input
                      type="number"
                      value={dodgeMod}
                      onChange={(e) => setDodgeMod(e.target.value)}
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-center focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">防護点</label>
                    <input
                      type="number"
                      value={defense}
                      onChange={(e) => setDefense(e.target.value)}
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded
                        text-stone-200 text-center focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* 複数部位敵 */
              <div className="space-y-3">
                <div className="text-sm text-stone-400">部位</div>
                {parts.map((part, index) => (
                  <div key={index} className="bg-stone-800/50 rounded p-3 border border-stone-700">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={part.name}
                        onChange={(e) => updatePart(index, 'name', e.target.value)}
                        placeholder="部位名"
                        className="flex-1 px-2 py-1 bg-stone-700 border border-stone-600 rounded
                          text-stone-200 text-sm focus:outline-none focus:border-red-600"
                      />
                      {parts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="text-stone-500 hover:text-red-400 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">HP</label>
                        <input
                          type="number"
                          value={part.hp}
                          onChange={(e) => updatePart(index, 'hp', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">MP</label>
                        <input
                          type="number"
                          value={part.mp}
                          onChange={(e) => updatePart(index, 'mp', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">命中</label>
                        <input
                          type="number"
                          value={part.hit}
                          onChange={(e) => updatePart(index, 'hit', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">回避</label>
                        <input
                          type="number"
                          value={part.dodge}
                          onChange={(e) => updatePart(index, 'dodge', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">防護</label>
                        <input
                          type="number"
                          value={part.defense}
                          onChange={(e) => updatePart(index, 'defense', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {parts.length < 10 && (
                  <button
                    type="button"
                    onClick={addPart}
                    className="w-full py-2 border border-dashed border-stone-600 rounded
                      text-stone-500 text-sm active:bg-stone-800/50"
                  >
                    ＋ 部位を追加
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* 送信ボタン */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700 text-lg"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`flex-1 py-3 rounded font-bold text-lg transition-colors
              ${name.trim()
                ? type === 'ally'
                  ? 'bg-blue-600 text-white active:bg-blue-500'
                  : 'bg-red-600 text-white active:bg-red-500'
                : 'bg-stone-700 text-stone-500'
              }`}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
};
