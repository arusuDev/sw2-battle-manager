// ============================================
// テンプレート選択モーダル
// ============================================

import { useState } from 'react';
import type { Character, CharacterTemplate, EnemyTemplate } from '../../types';
import { isAllyTemplate, isMultiPartTemplate } from '../../types';
import { CHARACTER_TEMPLATES } from '../../data/templates';
import { MAGIC_SKILLS } from '../../data/skills';

interface TemplateSelectModalProps {
  onAdd: (character: Character) => void;
  onClose: () => void;
  customTemplates?: CharacterTemplate[];
}

export const TemplateSelectModal = ({ onAdd, onClose, customTemplates = [] }: TemplateSelectModalProps) => {
  const [tab, setTab] = useState<'allies' | 'enemies'>('allies');
  const [password, setPassword] = useState('');

  const handleSelect = (template: CharacterTemplate) => {
    const baseId = Date.now().toString();

    if (isAllyTemplate(template)) {
      // 味方キャラ
      const hpMax = 15 + (template.stats?.vit || 12) +
        Math.max(...Object.values(template.skillLevels || {}).map(v => v || 0), 0) * 3;
      const mpMax = (template.stats?.mnd || 12) +
        Math.max(...Object.entries(template.skillLevels || {})
          .filter(([k]) => (MAGIC_SKILLS as readonly string[]).includes(k))
          .map(([, v]) => v || 0), 0) * 3;

      onAdd({
        id: baseId,
        name: template.name,
        type: 'ally',
        hp: { current: hpMax, max: hpMax },
        mp: { current: mpMax, max: mpMax },
        stats: { ...template.stats },
        skillLevels: { ...template.skillLevels },
        modifiers: { ...template.modifiers },
        buffs: [],
      });
    } else if (isMultiPartTemplate(template)) {
      // 複数部位の敵
      const partsData = template.parts.map((p, i) => ({
        id: baseId + '-' + i,
        name: p.name,
        hp: { current: p.hp, max: p.hp },
        mp: { current: p.mp || 0, max: p.mp || 0 },
        hit: p.hit || 0,
        dodge: p.dodge || 0,
        defense: p.defense || 0,
      }));
      onAdd({
        id: baseId,
        name: template.name,
        type: 'enemy',
        parts: partsData,
        buffs: [],
      });
    } else {
      // 単体の敵
      const singleEnemy = template as EnemyTemplate & { hp: number; mp: number; hit: number; dodge: number; defense: number };
      onAdd({
        id: baseId,
        name: template.name,
        type: 'enemy',
        hp: { current: singleEnemy.hp, max: singleEnemy.hp },
        mp: { current: singleEnemy.mp || 0, max: singleEnemy.mp || 0 },
        modifiers: {
          hitMod: singleEnemy.hit || 0,
          dodgeMod: singleEnemy.dodge || 0,
          defense: singleEnemy.defense || 0
        },
        buffs: [],
      });
    }
    onClose();
  };

  // テンプレートのフィルタリング
  const filterTemplates = <T extends CharacterTemplate>(templates: T[]): T[] => {
    return templates.filter(t => {
      if (!t.hidden) return true;
      if (password && t.password && t.password === password) return true;
      return false;
    });
  };

  // カスタムテンプレートを味方・敵に分類
  const customAllies = customTemplates.filter(t => t.type === 'ally') as CharacterTemplate[];
  const customEnemies = customTemplates.filter(t => t.type === 'enemy') as CharacterTemplate[];

  const templates = tab === 'allies'
    ? filterTemplates([...CHARACTER_TEMPLATES.allies, ...customAllies])
    : filterTemplates([...CHARACTER_TEMPLATES.enemies, ...customEnemies]);

  // 合言葉で解放されたテンプレート数（両タブ合計）
  const allTemplates = [
    ...CHARACTER_TEMPLATES.allies,
    ...CHARACTER_TEMPLATES.enemies,
    ...customTemplates,
  ];
  const unlockedCount = password ? allTemplates.filter(t => t.hidden && t.password === password).length : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">テンプレートから追加</h3>

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('allies')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${tab === 'allies'
              ? 'bg-blue-700 text-white'
              : 'bg-stone-800 text-stone-400'
              }`}
          >
            味方
          </button>
          <button
            onClick={() => setTab('enemies')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${tab === 'enemies'
              ? 'bg-red-700 text-white'
              : 'bg-stone-800 text-stone-400'
              }`}
          >
            敵
          </button>
        </div>

        {/* 合言葉入力 */}
        <div className="mb-4">
          <label className="block text-xs text-stone-500 mb-1">🔑 合言葉（GMから教えてもらった場合）</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="合言葉を入力..."
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
          {unlockedCount > 0 && (
            <div className="mt-1 text-xs text-amber-400">
              ✨ {unlockedCount}件の隠しキャラが解放されました！
            </div>
          )}
        </div>

        {/* テンプレート一覧 */}
        <div className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-sm">
              テンプレートがありません
            </div>
          ) : templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => handleSelect(tpl)}
              className={`w-full p-3 rounded text-left transition-colors ${tpl.hidden
                ? 'bg-amber-900/40 hover:bg-amber-800/50 active:bg-amber-700/60 border border-amber-700/50'
                : tab === 'allies'
                  ? 'bg-blue-900/40 hover:bg-blue-800/50 active:bg-blue-700/60 border border-blue-700/50'
                  : 'bg-red-900/40 hover:bg-red-800/50 active:bg-red-700/60 border border-red-700/50'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tpl.hidden && (
                    <span className="text-xs bg-amber-700/60 text-amber-200 px-1.5 py-0.5 rounded">
                      🔓
                    </span>
                  )}
                  <span className={`font-medium ${tpl.hidden ? 'text-amber-200' : tab === 'allies' ? 'text-blue-200' : 'text-red-200'
                    }`}>
                    {tpl.name}
                  </span>
                </div>
                {isMultiPartTemplate(tpl) && (
                  <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
                    {tpl.parts.length}部位
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {isAllyTemplate(tpl) ? (
                  <>
                    {Object.entries(tpl.skillLevels || {})
                      .filter(([, v]) => v > 0)
                      .slice(0, 4)
                      .map(([k, v]) => `${k}${v}`)
                      .join(' / ')}
                    {Object.keys(tpl.skillLevels || {}).length > 4 && ' ...'}
                  </>
                ) : isMultiPartTemplate(tpl) ? (
                  tpl.parts.map(p => p.name).join(', ')
                ) : (
                  `HP:${(tpl as any).hp} 命中:${(tpl as any).hit} 回避:${(tpl as any).dodge} 防護:${(tpl as any).defense}`
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
