// ============================================
// キャラクター追加フォーム
// ============================================

import { useState } from 'react';
import type { Character, CharacterTemplate, Stats, EnemyMagicSkill, Weakness } from '../../types';
import { SKILL_CATEGORIES, MAGIC_SKILLS } from '../../data/skills';

interface AddCharacterFormProps {
  onAdd: (character: Character) => Promise<void>;
  onAddTemplate?: (template: CharacterTemplate) => Promise<void>;
}

// 部位入力用インターフェース
interface PartInput {
  name: string;
  hp: string;
  mp: string;
  hit: string;
  dodge: string;
  defense: string;
  // 🆕 追加
  attackName: string;
  fixedDamage: string;
  magicSkills: EnemyMagicSkill[];
}

// 魔法スキル入力コンポーネント
const MagicSkillsInput = ({
  skills,
  onChange
}: {
  skills: EnemyMagicSkill[];
  onChange: (skills: EnemyMagicSkill[]) => void;
}) => {
  const addSkill = () => {
    onChange([...skills, { skill: 'ソーサラー', level: 1, magicPower: 0 }]);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, key: keyof EnemyMagicSkill, value: string | number) => {
    onChange(skills.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-stone-500">魔法技能</div>
      {skills.map((skill, index) => (
        <div key={index} className="flex flex-wrap gap-2 items-end bg-stone-800 p-2 rounded border border-stone-700">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] text-stone-500">技能</label>
            <select
              value={skill.skill}
              onChange={(e) => updateSkill(index, 'skill', e.target.value)}
              className="w-full px-1 py-1 bg-stone-700 border border-stone-600 rounded text-xs text-stone-200"
            >
              {MAGIC_SKILLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="w-16">
            <label className="block text-[10px] text-stone-500">Lv</label>
            <input
              type="number"
              value={skill.level}
              onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 0)}
              className="w-full px-1 py-1 bg-stone-700 border border-stone-600 rounded text-xs text-stone-200 text-center"
            />
          </div>
          <div className="w-16">
            <label className="block text-[10px] text-stone-500">魔力</label>
            <input
              type="number"
              value={skill.magicPower}
              onChange={(e) => updateSkill(index, 'magicPower', parseInt(e.target.value) || 0)}
              className="w-full px-1 py-1 bg-stone-700 border border-stone-600 rounded text-xs text-stone-200 text-center"
            />
          </div>
          <button
            type="button"
            onClick={() => removeSkill(index)}
            className="text-stone-500 hover:text-red-400 px-1 py-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSkill}
        className="text-xs text-indigo-400 hover:text-indigo-300 border border-dashed border-indigo-900 px-2 py-1 rounded w-full"
      >
        + 魔法技能を追加
      </button>
    </div>
  );
};

export const AddCharacterForm = ({ onAdd, onAddTemplate }: AddCharacterFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'ally' | 'enemy'>('ally');
  const [hp, setHp] = useState('30');
  const [mp, setMp] = useState('20');
  const [hasMultipleParts, setHasMultipleParts] = useState(false);

  // 複数部位データ
  const [parts, setParts] = useState<PartInput[]>([
    { name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0', attackName: '', fixedDamage: '0', magicSkills: [] }
  ]);

  // 味方用ステータス
  const [stats, setStats] = useState<Stats>({ dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 });
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [hitMod, setHitMod] = useState('0');
  const [dodgeMod, setDodgeMod] = useState('0');
  const [defense, setDefense] = useState('0');

  // 合言葉
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');

  // 敵用追加ステータス（単体）
  const [enemyAttackName, setEnemyAttackName] = useState('');
  const [enemyFixedDamage, setEnemyFixedDamage] = useState('0');
  const [enemyMagicSkills, setEnemyMagicSkills] = useState<EnemyMagicSkill[]>([]);
  const [enemyWeaknessType, setEnemyWeaknessType] = useState('');
  const [enemyWeaknessValue, setEnemyWeaknessValue] = useState('0');

  const addPart = () => {
    if (parts.length >= 10) return;
    setParts(prev => [...prev, {
      name: `部位${prev.length + 1}`,
      hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0',
      attackName: '', fixedDamage: '0', magicSkills: []
    }]);
  };

  const removePart = (index: number) => {
    if (parts.length <= 1) return;
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, key: keyof PartInput, value: any) => {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));
  };

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;

    // 合言葉設定時はテンプレートとして登録
    const isTemplateRegistration = usePassword && password.trim() && onAddTemplate;

    setIsSubmitting(true);
    try {
      if (isTemplateRegistration) {
        // テンプレートとして登録（合言葉付き）
        const templateId = Date.now().toString();
        if (type === 'ally') {
          const template: CharacterTemplate = {
            id: templateId,
            name: name.trim(),
            type: 'ally',
            stats: { ...stats },
            skillLevels: { ...skillLevels },
            modifiers: {
              hitMod: parseInt(hitMod) || 0,
              dodgeMod: parseInt(dodgeMod) || 0,
              defense: parseInt(defense) || 0,
            },
            hidden: true,
            password: password.trim(),
          };
          await onAddTemplate(template);
        } else if (hasMultipleParts) {
          const templateParts = parts.map(p => ({
            name: p.name.trim() || '部位',
            hp: parseInt(p.hp) || 30,
            mp: parseInt(p.mp) || 0,
            hit: parseInt(p.hit) || 0,
            dodge: parseInt(p.dodge) || 0,
            defense: parseInt(p.defense) || 0,
          }));
          const template: CharacterTemplate = {
            id: templateId,
            name: name.trim(),
            type: 'enemy',
            parts: templateParts,
            hidden: true,
            password: password.trim(),
          };
          await onAddTemplate(template);
        } else {
          const template: CharacterTemplate = {
            id: templateId,
            name: name.trim(),
            type: 'enemy',
            hp: parseInt(hp) || 30,
            mp: parseInt(mp) || 0,
            hit: parseInt(hitMod) || 0,
            dodge: parseInt(dodgeMod) || 0,
            defense: parseInt(defense) || 0,
            hidden: true,
            password: password.trim(),
          };
          await onAddTemplate(template);
        }
      } else {
        // 通常のキャラクター追加
        if (type === 'ally') {
          const hpMax = parseInt(hp) || 30;
          const mpMax = parseInt(mp) || 20;

          const allyData: any = {
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
          };
          await onAdd(allyData);
        } else {
          const weakness: Weakness | undefined = enemyWeaknessType.trim()
            ? { type: enemyWeaknessType.trim(), value: parseInt(enemyWeaknessValue) || 0 }
            : undefined;

          if (hasMultipleParts) {
            const partsData = parts.map(p => {
              const partBase = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: p.name.trim() || '部位',
                hp: { current: parseInt(p.hp) || 30, max: parseInt(p.hp) || 30 },
                mp: { current: parseInt(p.mp) || 0, max: parseInt(p.mp) || 0 },
                hit: parseInt(p.hit) || 0,
                dodge: parseInt(p.dodge) || 0,
                defense: parseInt(p.defense) || 0,
                fixedDamage: parseInt(p.fixedDamage) || 0,
              };

              const additionalProps: any = {};
              if (p.attackName.trim()) additionalProps.attackName = p.attackName.trim();
              if (p.magicSkills.length > 0) additionalProps.magicSkills = p.magicSkills;

              return { ...partBase, ...additionalProps };
            });

            const enemyData: any = {
              id: Date.now().toString(),
              name: name.trim(),
              type: 'enemy',
              parts: partsData,
              buffs: [],
            };
            if (weakness) enemyData.weakness = weakness;

            await onAdd(enemyData);
          } else {
            const hpMax = parseInt(hp) || 30;
            const mpMax = parseInt(mp) || 0;

            const enemyData: any = {
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
              fixedDamage: parseInt(enemyFixedDamage) || 0,
            };

            if (enemyAttackName.trim()) enemyData.attackName = enemyAttackName.trim();
            if (enemyMagicSkills.length > 0) enemyData.magicSkills = enemyMagicSkills;
            if (weakness) enemyData.weakness = weakness;

            await onAdd(enemyData);
          }
        }
      }

      // 成功時のみリセットして閉じる
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Character add failed:', error);
      alert(isTemplateRegistration ? 'テンプレートの登録に失敗しました。' : 'キャラクターの追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
    setParts([{ name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0', attackName: '', fixedDamage: '0', magicSkills: [] }]);
    setUsePassword(false);
    setPassword('');

    // 敵追加データリセット
    setEnemyAttackName('');
    setEnemyFixedDamage('0');
    setEnemyMagicSkills([]);
    setEnemyWeaknessType('');
    setEnemyWeaknessValue('0');
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
    <div className="bg-stone-900 rounded-lg p-4 border border-stone-700 max-h-[90vh] overflow-y-auto">
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

        {/* 合言葉設定 */}
        <div>
          <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              checked={usePassword}
              onChange={(e) => {
                setUsePassword(e.target.checked);
                if (!e.target.checked) setPassword('');
              }}
              className="rounded bg-stone-700 border-stone-600"
            />
            合言葉を設定して非表示にする
          </label>
          {usePassword && (
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="合言葉を入力"
              className="w-full mt-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded
                text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-600"
            />
          )}
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
            {/* 弱点（共通） */}
            <div className="bg-red-950/20 rounded p-2 border border-red-900/30 mb-2">
              <div className="text-xs text-stone-400 mb-1">弱点設定</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enemyWeaknessType}
                  onChange={(e) => setEnemyWeaknessType(e.target.value)}
                  placeholder="炎, 物理など"
                  className="flex-1 px-2 py-1 bg-stone-800 border-stone-700 rounded text-sm text-stone-200"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-500">+</span>
                  <input
                    type="number"
                    value={enemyWeaknessValue}
                    onChange={(e) => setEnemyWeaknessValue(e.target.value)}
                    className="w-16 px-2 py-1 bg-stone-800 border-stone-700 rounded text-sm text-stone-200 text-center"
                  />
                </div>
              </div>
            </div>

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

                {/* 攻撃データ入力 */}
                <div className="border-t border-stone-700 pt-2 mt-2">
                  <div className="text-xs text-stone-400 mb-2">攻撃データ</div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-stone-500">攻撃名</label>
                      <input
                        type="text"
                        value={enemyAttackName}
                        onChange={(e) => setEnemyAttackName(e.target.value)}
                        placeholder="爪、ブレスなど"
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-sm text-stone-200"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-[10px] text-stone-500">固定D(2d+)</label>
                      <input
                        type="number"
                        value={enemyFixedDamage}
                        onChange={(e) => setEnemyFixedDamage(e.target.value)}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-sm text-stone-200 text-center"
                      />
                    </div>
                  </div>
                  <MagicSkillsInput
                    skills={enemyMagicSkills}
                    onChange={setEnemyMagicSkills}
                  />
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
                    <div className="grid grid-cols-5 gap-2 mb-2">
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
                    {/* 部位ごとの攻撃データ */}
                    <div className="border-t border-stone-600/50 pt-2">
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <label className="block text-[10px] text-stone-500">攻撃名</label>
                          <input
                            type="text"
                            value={part.attackName}
                            onChange={(e) => updatePart(index, 'attackName', e.target.value)}
                            placeholder="攻撃名"
                            className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded text-xs text-stone-200"
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[10px] text-stone-500">固定D</label>
                          <input
                            type="number"
                            value={part.fixedDamage}
                            onChange={(e) => updatePart(index, 'fixedDamage', e.target.value)}
                            className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded text-xs text-stone-200 text-center"
                          />
                        </div>
                      </div>
                      <MagicSkillsInput
                        skills={part.magicSkills}
                        onChange={(skills) => updatePart(index, 'magicSkills', skills)}
                      />
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
            disabled={isSubmitting}
            className="flex-1 py-3 bg-stone-800 text-stone-400 border border-stone-700 rounded 
              hover:bg-stone-700 active:bg-stone-600 text-lg transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>

          {(() => {
            const isDisabled = !name.trim() || isSubmitting;
            let buttonClass = "flex-1 py-3 rounded font-bold text-lg transition-all shadow-md ";

            if (isDisabled) {
              buttonClass += "bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed opacity-70";
            } else if (type === 'ally') {
              buttonClass += "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 active:translate-y-0.5";
            } else {
              buttonClass += "bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 active:translate-y-0.5";
            }

            return (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isDisabled}
                className={buttonClass}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {usePassword && password.trim() ? 'テンプレート登録中...' : '追加中...'}
                  </span>
                ) : (
                  usePassword && password.trim() ? 'テンプレートとして登録' : '追加'
                )}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
