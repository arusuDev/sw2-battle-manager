// ============================================
// SW2.0 戦闘管理システム - 型定義
// 修正: BuffTypeに'magicPower'を追加
// ============================================

// 能力値
export interface Stats {
  dex: number;  // 器用度
  agi: number;  // 敏捷度
  str: number;  // 筋力
  vit: number;  // 生命力
  int: number;  // 知力
  mnd: number;  // 精神力
}

// HP/MPプール
export interface ResourcePool {
  current: number;
  max: number;
}

// 補正値
export interface Modifiers {
  hitMod: number;     // 命中補正
  dodgeMod: number;   // 回避補正
  defense: number;    // 防護点
}

// バフ効果タイプ（magicPower追加）
export type BuffType =
  | 'hit' | 'dodge' | 'defense'
  | 'vitResist' | 'mndResist'
  | 'strBonus' | 'power' | 'magicPower'
  | 'magicDefense' | 'physicalReduce' | 'magicReduce'
  | 'dex' | 'agi' | 'str' | 'vit' | 'int' | 'mnd';

// バフ/デバフ
export interface Buff {
  id: string;
  name: string;
  effect: string;
  remaining: number;
  buffType?: BuffType;
  buffValue?: number;
  isKoho?: boolean;   // 🆕 鼓咆フラグ
}

// バフ効果の集計結果（magicPower追加）
export interface BuffEffects {
  hit: number;
  dodge: number;
  defense: number;
  vitResist: number;
  mndResist: number;
  strBonus: number;
  power: number;
  magicPower: number;  // 追加
  magicDefense: number;
  physicalReduce: number;
  magicReduce: number;
  dex: number;
  agi: number;
  str: number;
  vit: number;
  int: number;
  mnd: number;
}

// 敵の魔法スキル
export interface EnemyMagicSkill {
  skill: string;      // "ソーサラー", "プリースト" など
  level: number;      // レベル
  magicPower: number; // 魔力（達成値）
}

// 弱点データ
export interface Weakness {
  type: string;   // "物理", "炎", "氷" など（表示用）
  value: number;  // ダメージ加算値
}

// 複数部位の敵の部位
export interface Part {
  id: string;
  name: string;
  hp: ResourcePool;
  mp: ResourcePool;
  hit: number;
  dodge: number;
  defense: number;
  buffs?: Buff[];

  // 🆕 攻撃関連
  attackName?: string;       // "槍", "角"（任意）
  fixedDamage?: number;      // 物理の固定ダメージ (2d+X の X)
  magicSkills?: EnemyMagicSkill[];  // 魔法スキル（部位ごと）
}

// 一括バフ付与の対象（キャラまたは部位）
export interface BulkBuffTarget {
  characterId: string;
  characterName: string;
  partId?: string;      // 複数部位敵の場合
  partName?: string;    // 部位名
  isEnemy: boolean;
}


// 基本キャラクター
interface BaseCharacter {
  id: string;
  name: string;
  buffs: Buff[];
}

// 味方キャラクター
export interface AllyCharacter extends BaseCharacter {
  type: 'ally';
  hp: ResourcePool;
  mp: ResourcePool;
  stats: Stats;
  skillLevels: Record<string, number>;
  modifiers: Modifiers;
}

// 単体の敵
export interface SingleEnemy extends BaseCharacter {
  type: 'enemy';
  hp: ResourcePool;
  mp: ResourcePool;
  modifiers: Modifiers;

  // 🆕 攻撃関連
  fixedDamage?: number;              // 物理の固定ダメージ
  attackName?: string;               // 攻撃方法名（任意）
  magicSkills?: EnemyMagicSkill[];   // 魔法スキル
  weakness?: Weakness;               // 弱点
}

// 複数部位の敵
export interface MultiPartEnemy extends BaseCharacter {
  type: 'enemy';
  parts: Part[];
  weakness?: Weakness;  // 🆕 弱点（敵全体で共通）
}

// キャラクターの統合型
export type Character = AllyCharacter | SingleEnemy | MultiPartEnemy;

// 型ガード
export const isAlly = (char: Character): char is AllyCharacter => {
  return char.type === 'ally';
};

export const isSingleEnemy = (char: Character): char is SingleEnemy => {
  return char.type === 'enemy' && !('parts' in char);
};

export const isMultiPartEnemy = (char: Character): char is MultiPartEnemy => {
  return char.type === 'enemy' && 'parts' in char;
};

// 鼓咆（全体バフ）
export interface PartyBuff {
  type: 'attack' | 'defense';
  name: string;
  effect: string;
  physicalDamage?: number;
  magicDamage?: number;
  physicalReduce?: number;
  magicReduce?: number;
}

// 鼓咆プリセット
export interface KohoPreset {
  name: string;
  effect: string;
  physicalDamage?: number;
  magicDamage?: number;
  physicalReduce?: number;
  magicReduce?: number;
}

// プリセット練技
export interface PresetSkill {
  name: string;
  effect: string;
  duration: number;
  buffType: BuffType;
  buffValue: number;
}

// 攻撃計算の状態
export interface AttackCalcState {
  attackType: 'physical' | 'magic';
  selectedSkill: string;
  targetId: string;
  targetPartId: string;
  power: number;
  critValue: number;
  rolls: { d1: string; d2: string }[];
  isResisted: boolean;
  isWeaknessHit: boolean;
  isWeaknessExploit: boolean;  // 🆕 弱点看破（ダメージx2）
  finalDamage: number | null;
}

// ダイスロール結果
export interface DiceRoll {
  d1: number;
  d2: number;
  total: number;
}

// ============================================
// テンプレート関連
// ============================================

// テンプレートの部位（IDなし）
export interface TemplatePart {
  name: string;
  hp: number;
  mp: number;
  hit: number;
  dodge: number;
  defense: number;
}

// 味方テンプレート
export interface AllyTemplate {
  id: string;
  name: string;
  type: 'ally';
  stats: Stats;
  skillLevels: Record<string, number>;
  modifiers: Modifiers;
  hidden: boolean;
  password: string;
}

// 単体敵テンプレート
export interface SingleEnemyTemplate {
  id: string;
  name: string;
  type: 'enemy';
  hp: number;
  mp: number;
  hit: number;
  dodge: number;
  defense: number;
  hidden: boolean;
  password: string;
}

// 複数部位敵テンプレート
export interface MultiPartEnemyTemplate {
  id: string;
  name: string;
  type: 'enemy';
  parts: TemplatePart[];
  hidden: boolean;
  password: string;
}

export type EnemyTemplate = SingleEnemyTemplate | MultiPartEnemyTemplate;
export type CharacterTemplate = AllyTemplate | EnemyTemplate;

// テンプレートの型ガード
export const isAllyTemplate = (tpl: CharacterTemplate): tpl is AllyTemplate => {
  return tpl.type === 'ally';
};

export const isMultiPartTemplate = (tpl: CharacterTemplate): tpl is MultiPartEnemyTemplate => {
  return tpl.type === 'enemy' && 'parts' in tpl;
};

// ============================================
// ルーム関連（Firebase用）
// ============================================

export interface RoomState {
  round: number;
  characters: Character[];
  partyBuff: PartyBuff | null;
}

export interface Room {
  id: string;
  name: string;
  password: string;
  gmPassword: string;
  gmId: string;
  members: string[];
  createdAt: Date;
  state: RoomState;
  templates: {
    allies: AllyTemplate[];
    enemies: EnemyTemplate[];
  };
}

// 期限切れバフ通知
export interface ExpiredBuffNotification {
  id: string;
  characterName: string;
  buffName: string;
}
