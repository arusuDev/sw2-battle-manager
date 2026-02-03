// ============================================
// SW2.0 各種計算
// 修正: magicPowerバフ対応、getMagicPowerList追加
// ============================================

import type { Buff, BuffEffects, Stats, AllyCharacter } from '../types';
import { COMBAT_SKILLS, MAGIC_SKILLS, MAGIC_NAMES } from '../data/skills';

/**
 * 能力値ボーナスを計算（能力値 ÷ 6 切り捨て）
 */
export const calcBonus = (stat: number): number => {
  return Math.floor(stat / 6);
};

/**
 * バフ効果の集計（magicPower追加）
 */
export const calcBuffEffects = (buffs: Buff[]): BuffEffects => {
  const effects: BuffEffects = {
    hit: 0,
    dodge: 0,
    defense: 0,
    vitResist: 0,
    mndResist: 0,
    strBonus: 0,
    power: 0,
    magicPower: 0,  // 追加
    magicDefense: 0,
    physicalReduce: 0,
    magicReduce: 0,
    damageReduce: 0,  // 被ダメージ軽減
    dex: 0,
    agi: 0,
    str: 0,
    vit: 0,
    int: 0,
    mnd: 0,
  };

  (buffs || []).forEach(buff => {
    if (buff.buffType && buff.buffValue) {
      const key = buff.buffType as keyof BuffEffects;
      effects[key] = (effects[key] || 0) + buff.buffValue;
    }
  });

  return effects;
};

/**
 * 戦闘技能の最高レベルを算出
 */
export const calcCombatLevel = (skillLevels: Record<string, number>): number => {
  const levels = COMBAT_SKILLS.map(s => skillLevels[s] || 0);
  return Math.max(...levels, 0);
};

/**
 * 魔法技能の最高レベルを算出
 */
export const calcMagicLevel = (skillLevels: Record<string, number>): number => {
  const levels = MAGIC_SKILLS.map(s => skillLevels[s] || 0);
  return Math.max(...levels, 0);
};

/**
 * 冒険者レベルを算出（全技能の最高レベル）
 */
export const calcAdventurerLevel = (skillLevels: Record<string, number>): number => {
  const levels = Object.values(skillLevels || {}).map(v => v || 0);
  return Math.max(...levels, 0);
};

/**
 * 命中力を計算
 */
export const calcHitValue = (
  char: AllyCharacter,
  buffEffects: BuffEffects
): number => {
  const { stats, skillLevels, modifiers } = char;
  const combatLv = calcCombatLevel(skillLevels);
  const baseDexBonus = calcBonus(stats.dex);
  const dexBuffBonus = calcBonus(buffEffects.dex || 0);
  return combatLv + baseDexBonus + dexBuffBonus + (modifiers?.hitMod || 0) + buffEffects.hit;
};

/**
 * 回避力を計算
 */
export const calcDodgeValue = (
  char: AllyCharacter,
  buffEffects: BuffEffects
): number => {
  const { stats, skillLevels, modifiers } = char;
  const combatLv = calcCombatLevel(skillLevels);
  const baseAgiBonus = calcBonus(stats.agi);
  const agiBuffBonus = calcBonus(buffEffects.agi || 0);
  return combatLv + baseAgiBonus + agiBuffBonus + (modifiers?.dodgeMod || 0) + buffEffects.dodge;
};

/**
 * 防護点を計算
 */
export const calcDefenseValue = (
  char: AllyCharacter,
  buffEffects: BuffEffects
): number => {
  return (char.modifiers?.defense || 0) + buffEffects.defense;
};

/**
 * 生命抵抗力を計算
 */
export const calcVitResist = (
  char: AllyCharacter,
  buffEffects: BuffEffects
): number => {
  const advLv = calcAdventurerLevel(char.skillLevels);
  const baseVitBonus = calcBonus(char.stats.vit);
  const vitBuffBonus = calcBonus(buffEffects.vit || 0);
  return advLv + baseVitBonus + vitBuffBonus + buffEffects.vitResist;
};

/**
 * 精神抵抗力を計算
 */
export const calcMndResist = (
  char: AllyCharacter,
  buffEffects: BuffEffects
): number => {
  const advLv = calcAdventurerLevel(char.skillLevels);
  const baseMndBonus = calcBonus(char.stats.mnd);
  const mndBuffBonus = calcBonus(buffEffects.mnd || 0);
  return advLv + baseMndBonus + mndBuffBonus + buffEffects.mndResist;
};

/**
 * 筋力ボーナスを計算（バフ込み）
 */
export const calcStrBonus = (
  stats: Stats,
  buffEffects: BuffEffects
): number => {
  const baseStrBonus = calcBonus(stats.str);
  const strBuffBonus = calcBonus(buffEffects.str || 0);
  return baseStrBonus + strBuffBonus + (buffEffects.strBonus || 0);
};

/**
 * 魔力を計算（magicPowerバフ対応）
 * 魔力 = 技能レベル + 知力ボーナス + 魔力バフ
 */
export const calcMagicPower = (
  skillName: string,
  skillLevels: Record<string, number>,
  stats: Stats,
  buffEffects: BuffEffects
): number => {
  const skillLv = skillLevels[skillName] || 0;
  const baseIntBonus = calcBonus(stats.int);
  const intBuffBonus = calcBonus(buffEffects.int || 0);
  const magicPowerBuff = buffEffects.magicPower || 0;  // 追加
  return skillLv + baseIntBonus + intBuffBonus + magicPowerBuff;
};

/**
 * 習得済み魔法技能の魔力一覧を取得
 * CharacterCardでの魔力表示用
 */
export interface MagicPowerInfo {
  skillName: string;    // 技能名（ソーサラーなど）
  magicName: string;    // 魔法名（真語魔法など）
  level: number;        // 技能レベル
  magicPower: number;   // 魔力
}

export const getMagicPowerList = (
  skillLevels: Record<string, number>,
  stats: Stats,
  buffEffects: BuffEffects
): MagicPowerInfo[] => {
  const list: MagicPowerInfo[] = [];

  MAGIC_SKILLS.forEach(skillName => {
    const level = skillLevels[skillName] || 0;
    if (level > 0) {
      list.push({
        skillName,
        magicName: MAGIC_NAMES[skillName] || skillName,
        level,
        magicPower: calcMagicPower(skillName, skillLevels, stats, buffEffects),
      });
    }
  });

  return list;
};

/**
 * ゼロバフ効果（初期状態との比較用）
 */
export const ZERO_BUFF_EFFECTS: BuffEffects = {
  hit: 0, dodge: 0, defense: 0,
  vitResist: 0, mndResist: 0,
  strBonus: 0, power: 0, magicPower: 0,
  magicDefense: 0, physicalReduce: 0, magicReduce: 0, damageReduce: 0,
  dex: 0, agi: 0, str: 0, vit: 0, int: 0, mnd: 0,
};

/**
 * 値の変動に応じたテキストカラーを返す
 * diff > 0 → 緑（バフ）、diff < 0 → 赤（デバフ）、diff === 0 → デフォルト色
 */
export const getStatColor = (current: number, base: number, defaultColor: string = 'text-stone-300'): string => {
  const diff = current - base;
  if (diff > 0) return 'text-green-400';
  if (diff < 0) return 'text-red-400';
  return defaultColor;
};

/**
 * HPの状態を取得
 */
export const getHpStatus = (
  currentHp: number,
  vit: number
): { label: string; color: string } | null => {
  if (currentHp <= -vit) return { label: '死亡', color: 'text-gray-500' };
  if (currentHp <= 0) return { label: '気絶', color: 'text-red-400' };
  return null;
};

/**
 * HPバーの色を取得
 */
export const getHpBarColor = (currentHp: number, maxHp: number): string => {
  if (currentHp <= 0) return 'bg-gray-600';
  const percent = (currentHp / maxHp) * 100;
  if (percent <= 25) return 'bg-red-500';
  if (percent <= 50) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

/**
 * HPパーセントを計算
 */
export const getHpPercent = (currentHp: number, maxHp: number): number => {
  return Math.max(0, (currentHp / maxHp) * 100);
};
