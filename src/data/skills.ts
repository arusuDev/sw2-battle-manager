// ============================================
// SW2.0 技能定義
// ============================================

// 技能カテゴリ
export const SKILL_CATEGORIES = {
  warrior: {
    label: '戦士系',
    skills: ['ファイター', 'グラップラー', 'フェンサー', 'シューター']
  },
  magic: {
    label: '魔法系',
    skills: ['ソーサラー', 'コンジャラー', 'プリースト', 'マギテック', 'フェアリーテイマー']
  },
  other: {
    label: 'その他',
    skills: ['スカウト', 'レンジャー', 'セージ', 'エンハンサー', 'バード', 'ライダー', 'アルケミスト', 'ウォーリーダー']
  }
} as const;

// 戦闘系技能リスト
export const COMBAT_SKILLS = SKILL_CATEGORIES.warrior.skills;

// 魔法系技能リスト
export const MAGIC_SKILLS = SKILL_CATEGORIES.magic.skills;

// 全技能リスト
export const ALL_SKILLS = [
  ...SKILL_CATEGORIES.warrior.skills,
  ...SKILL_CATEGORIES.magic.skills,
  ...SKILL_CATEGORIES.other.skills,
];

// 魔法系技能と魔法名の対応
export const MAGIC_NAMES: Record<string, string> = {
  'ソーサラー': '真語魔法',
  'コンジャラー': '操霊魔法',
  'プリースト': '神聖魔法',
  'マギテック': '魔動機術',
  'フェアリーテイマー': '妖精魔法',
};

// 型定義
export type SkillCategory = keyof typeof SKILL_CATEGORIES;
export type CombatSkill = typeof COMBAT_SKILLS[number];
export type MagicSkill = typeof MAGIC_SKILLS[number];
export type Skill = typeof ALL_SKILLS[number];
