// ============================================
// SW2.0 キャラクターテンプレート
// ============================================

import type { AllyTemplate, EnemyTemplate } from '../types';

// 味方テンプレート
export const ALLY_TEMPLATES: AllyTemplate[] = [
  {
    id: 'tpl-ally-warrior',
    name: 'サンプル戦士',
    type: 'ally',
    stats: { dex: 14, agi: 12, str: 18, vit: 16, int: 8, mnd: 10 },
    skillLevels: { 'ファイター': 3, 'スカウト': 1 },
    modifiers: { hitMod: 0, dodgeMod: 0, defense: 5 },
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-ally-mage',
    name: 'サンプル魔法使い',
    type: 'ally',
    stats: { dex: 12, agi: 10, str: 8, vit: 10, int: 18, mnd: 16 },
    skillLevels: { 'ソーサラー': 3, 'セージ': 2 },
    modifiers: { hitMod: 0, dodgeMod: 0, defense: 1 },
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-ally-priest',
    name: 'サンプル神官',
    type: 'ally',
    stats: { dex: 12, agi: 12, str: 12, vit: 14, int: 14, mnd: 16 },
    skillLevels: { 'プリースト': 3, 'ファイター': 1 },
    modifiers: { hitMod: 0, dodgeMod: 0, defense: 3 },
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-ally-allskill',
    name: '全技能キャラ（テスト用）',
    type: 'ally',
    stats: { dex: 18, agi: 18, str: 18, vit: 18, int: 18, mnd: 18 },
    skillLevels: {
      'ファイター': 5, 'グラップラー': 5, 'フェンサー': 5, 'シューター': 5,
      'ソーサラー': 5, 'コンジャラー': 5, 'プリースト': 5, 'マギテック': 5, 'フェアリーテイマー': 5,
      'スカウト': 5, 'レンジャー': 5, 'セージ': 5, 'エンハンサー': 5, 'バード': 5, 'ライダー': 5, 'アルケミスト': 5, 'ウォーリーダー': 5,
    },
    modifiers: { hitMod: 0, dodgeMod: 0, defense: 10 },
    hidden: false,
    password: '',
  },
  // 合言葉で表示される隠しキャラ例
  {
    id: 'tpl-ally-secret',
    name: '隠し勇者',
    type: 'ally',
    stats: { dex: 20, agi: 20, str: 20, vit: 20, int: 20, mnd: 20 },
    skillLevels: { 'ファイター': 7, 'プリースト': 5, 'セージ': 3 },
    modifiers: { hitMod: 2, dodgeMod: 2, defense: 12 },
    hidden: true,
    password: 'hero',
  },
];

// 敵テンプレート
export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  {
    id: 'tpl-enemy-goblin',
    name: 'ゴブリン',
    type: 'enemy',
    hp: 15,
    mp: 0,
    hit: 4,
    dodge: 4,
    defense: 2,
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-enemy-orc',
    name: 'オーク',
    type: 'enemy',
    hp: 30,
    mp: 0,
    hit: 6,
    dodge: 5,
    defense: 4,
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-enemy-ogre',
    name: 'オーガ',
    type: 'enemy',
    hp: 50,
    mp: 10,
    hit: 8,
    dodge: 6,
    defense: 6,
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-enemy-dragon',
    name: 'ドラゴン（3部位）',
    type: 'enemy',
    parts: [
      { name: '頭部', hp: 60, mp: 40, hit: 12, dodge: 10, defense: 10 },
      { name: '胴体', hp: 100, mp: 0, hit: 10, dodge: 8, defense: 12 },
      { name: '尾', hp: 40, mp: 0, hit: 9, dodge: 9, defense: 8 },
    ],
    hidden: false,
    password: '',
  },
  {
    id: 'tpl-enemy-hydra',
    name: 'ヒドラ（5部位）',
    type: 'enemy',
    parts: [
      { name: '頭1', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
      { name: '頭2', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
      { name: '頭3', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
      { name: '頭4', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
      { name: '胴体', hp: 80, mp: 0, hit: 6, dodge: 5, defense: 8 },
    ],
    hidden: false,
    password: '',
  },
  // 合言葉で表示される隠しボス例
  {
    id: 'tpl-enemy-secretboss',
    name: '裏ボス',
    type: 'enemy',
    parts: [
      { name: '本体', hp: 200, mp: 100, hit: 15, dodge: 12, defense: 15 },
      { name: '右腕', hp: 80, mp: 0, hit: 14, dodge: 10, defense: 10 },
      { name: '左腕', hp: 80, mp: 0, hit: 14, dodge: 10, defense: 10 },
    ],
    hidden: true,
    password: 'boss',
  },
];

// テンプレート全体
export const CHARACTER_TEMPLATES = {
  allies: ALLY_TEMPLATES,
  enemies: ENEMY_TEMPLATES,
};
