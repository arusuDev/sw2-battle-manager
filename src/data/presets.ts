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
} = {
  attack: [
    { name: '怒涛の攻陣', effect: '物理ダメージ+2', physicalDamage: 2, magicDamage: 0 },
    { name: '堅陣の攻陣', effect: '物理ダメージ+1', physicalDamage: 1, magicDamage: 0 },
  ],
  defense: [
    { name: '鉄壁の防陣', effect: '物理ダメージ-1, 魔法ダメージ-1', physicalReduce: 1, magicReduce: 1 },
    { name: '金剛の防陣', effect: '物理ダメージ-2', physicalReduce: 2, magicReduce: 0 },
  ]
};
