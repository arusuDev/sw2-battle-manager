// ============================================
// SW2.0 プリセットデータ
// ============================================

import type { PresetSkill, KohoPreset } from '../types';

// プリセット練技データ
export const PRESET_SKILLS: PresetSkill[] = [
  { name: 'ガゼルフット', effect: '回避+1', duration: 3, buffType: 'dodge', buffValue: 1 },
  { name: 'キャッツアイ', effect: '命中+1', duration: 3, buffType: 'hit', buffValue: 1 },
  { name: 'ビートルスキン', effect: '防護点+2', duration: 3, buffType: 'defense', buffValue: 2 },
  { name: 'マッスルベアー', effect: '筋力B+2', duration: 3, buffType: 'strBonus', buffValue: 2 },
  { name: 'ケンタウロスレッグ', effect: '敏捷度+12', duration: 1, buffType: 'agi', buffValue: 12 },
  { name: 'ジャイアントアーム', effect: '筋力+12', duration: 1, buffType: 'str', buffValue: 12 },
  { name: 'スフィンクスノレッジ', effect: '知力+12', duration: 1, buffType: 'int', buffValue: 12 },
  { name: 'デーモンフィンガー', effect: '器用度+12', duration: 1, buffType: 'dex', buffValue: 12 },
];

// 鼓咆プリセットデータ
export const KOHO_PRESETS: {
  attack: KohoPreset[];
  defense: KohoPreset[];
  evasion: KohoPreset[];
  resist: KohoPreset[];
} = {
  // 攻撃系
  attack: [
    { name: '怒涛の攻陣I', effect: '物理ダメージ+2 回避力-1', physicalDamage: 2, dodgePenalty: 1 },
    { name: '怒涛の攻陣II：烈火', effect: '物理ダメージ+2', physicalDamage: 2 },
    { name: '怒涛の攻陣II：旋風', effect: '命中力+1', hit: 1 },
    { name: '怒涛の攻陣III：轟炎', effect: '物理ダメージ+3', physicalDamage: 3 },
    { name: '怒涛の攻陣III：旋刃', effect: '物理ダメージ+1 命中力+1', physicalDamage: 1, hit: 1 },
  ],
  // 防御系
  defense: [
    { name: '鉄壁の防陣I', effect: '防護点+2 与物理ダメージ-2', defense: 2, physicalDamagePenalty: 2 },
    { name: '鉄壁の防陣II：鉄鎧', effect: '防護点+2', defense: 2 },
    { name: '鉄壁の防陣II：堅体', effect: '防護点+1 受魔法ダメージ-1', defense: 1, magicReduce: 1 },
    { name: '鉄壁の防陣III：鋼鎧', effect: '防護点+3', defense: 3 },
    { name: '鉄壁の防陣III：甲盾', effect: '防護点+2 受魔法ダメージ-2', defense: 2, magicReduce: 2 },
  ],
  // 回避系
  evasion: [
    { name: '流麗なる俊陣I', effect: '回避力+1 防護点-2', dodge: 1, defensePenalty: 2 },
    { name: '流麗なる俊陣II：陽炎', effect: '回避力+1', dodge: 1 },
    { name: '流麗なる俊陣II：流水', effect: '回避力+2 防護点-2', dodge: 2, defensePenalty: 2 },
    { name: '流麗なる俊陣III：浮身', effect: '回避力+1 被ダメージ-1', dodge: 1, damageReduce: 1 },
    { name: '流麗なる俊陣III：幻惑', effect: '回避力+2', dodge: 2 },
  ],
  // 抵抗系
  resist: [
    { name: '強靭なる丈陣I：抵体', effect: '生命抵抗力+1 精神抵抗力-1', vitResist: 1, mndResistPenalty: 1 },
    { name: '強靭なる丈陣I：抵心', effect: '精神抵抗力+1 生命抵抗力-1', mndResist: 1, vitResistPenalty: 1 },
    { name: '強靭なる丈陣II：強身', effect: '生命抵抗力+2 精神抵抗力-1', vitResist: 2, mndResistPenalty: 1 },
    { name: '強靭なる丈陣II：安精', effect: '精神抵抗力+2 生命抵抗力-1', mndResist: 2, vitResistPenalty: 1 },
  ],
};
