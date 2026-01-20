// ============================================
// SW2.0 ダイス・威力計算
// ============================================

import type { DiceRoll } from '../types';
import { POWER_TABLE } from '../data/powerTable';

/**
 * 2d6をロールする
 */
export const roll2d6 = (): DiceRoll => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2 };
};

/**
 * 威力表からダメージを取得
 * @param power 威力値（0〜100、10刻み）
 * @param diceTotal ダイス合計（2〜12）
 */
export const getPowerDamage = (power: number, diceTotal: number): number => {
  const table = POWER_TABLE[power];
  if (!table) return 0;
  const index = diceTotal - 2; // 出目2がインデックス0
  return table[index] ?? 0;
};

/**
 * クリティカルを含むダメージロール
 * @param power 威力値
 * @param critValue クリティカル値（13以上でクリティカルなし）
 * @param maxRolls 最大ロール回数（無限ループ防止）
 */
export const rollDamageWithCrit = (
  power: number,
  critValue: number,
  maxRolls: number = 10
): { rolls: DiceRoll[]; totalDamage: number } => {
  const rolls: DiceRoll[] = [];
  let totalDamage = 0;
  
  let currentRoll = roll2d6();
  rolls.push(currentRoll);
  totalDamage += getPowerDamage(power, currentRoll.total);
  
  // クリティカル処理
  while (
    currentRoll.total >= critValue && 
    critValue <= 12 && 
    rolls.length < maxRolls
  ) {
    currentRoll = roll2d6();
    rolls.push(currentRoll);
    totalDamage += getPowerDamage(power, currentRoll.total);
  }
  
  return { rolls, totalDamage };
};
