// ============================================
// SW2.0 バフ処理ユーティリティ
// Issue #1: 一括バフ付与・鼓咆処理
// ============================================

import type { Buff } from '../types';

/**
 * 鼓咆の上書きロジック付きでバフを追加
 * - isKoho: true のバフは1種類のみ（新しいもので上書き）
 * - 通常バフはそのまま追加
 */
export const addBuffWithKohoReplace = (
  currentBuffs: Buff[],
  newBuff: Buff
): Buff[] => {
  if (newBuff.isKoho) {
    // 既存の鼓咆を削除してから追加
    const withoutKoho = currentBuffs.filter(b => !b.isKoho);
    return [...withoutKoho, newBuff];
  }
  // 通常バフはそのまま追加
  return [...currentBuffs, newBuff];
};

/**
 * ラウンド終了時のバフ処理
 * - remaining を1減らす
 * - remaining: -1（永続）はスキップ
 * - remaining: 0 以下になったバフは削除
 */
export const processBuffsOnRoundEnd = (
  buffs: Buff[]
): { remainingBuffs: Buff[]; expiredBuffs: Buff[] } => {
  const remainingBuffs: Buff[] = [];
  const expiredBuffs: Buff[] = [];

  for (const buff of buffs) {
    // 永続バフ（remaining: -1）はそのまま残す
    if (buff.remaining === -1) {
      remainingBuffs.push(buff);
      continue;
    }

    const newRemaining = buff.remaining - 1;
    if (newRemaining <= 0) {
      expiredBuffs.push(buff);
    } else {
      remainingBuffs.push({ ...buff, remaining: newRemaining });
    }
  }

  return { remainingBuffs, expiredBuffs };
};

/**
 * バフ効果の集計（既存のcalcBuffEffectsと同等）
 */
export const calculateBuffEffects = (buffs: Buff[]) => {
  const effects: Record<string, number> = {
    hit: 0,
    dodge: 0,
    defense: 0,
    vitResist: 0,
    mndResist: 0,
    strBonus: 0,
    power: 0,
    magicPower: 0,
    magicDefense: 0,
    physicalReduce: 0,
    magicReduce: 0,
    dex: 0,
    agi: 0,
    str: 0,
    vit: 0,
    int: 0,
    mnd: 0,
  };

  (buffs || []).forEach(buff => {
    if (buff.buffType && buff.buffValue) {
      effects[buff.buffType] = (effects[buff.buffType] || 0) + buff.buffValue;
    }
  });

  return effects;
};

/**
 * 同名バフが既に存在するかチェック
 */
export const hasDuplicateBuff = (buffs: Buff[], buffName: string): boolean => {
  return buffs.some(b => b.name === buffName);
};

/**
 * 現在の鼓咆を取得
 */
export const getKohoBuff = (buffs: Buff[]): Buff | undefined => {
  return buffs.find(b => b.isKoho);
};
