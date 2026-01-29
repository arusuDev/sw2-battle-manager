import { describe, it, expect } from 'vitest';
import type { Buff } from '../types';
import {
  addBuffWithKohoReplace,
  processBuffsOnRoundEnd,
  calculateBuffEffects,
  hasDuplicateBuff,
  getKohoBuff,
} from './buff';

// ============================================
// テストヘルパー: Buffオブジェクト生成
// ============================================
const createBuff = (overrides: Partial<Buff> = {}): Buff => ({
  id: 'buff-1',
  name: 'テストバフ',
  effect: 'hit+1',
  remaining: 3,
  buffType: 'hit',
  buffValue: 1,
  ...overrides,
});

const createKohoBuff = (overrides: Partial<Buff> = {}): Buff =>
  createBuff({
    id: 'koho-1',
    name: '怒涛の攻陣II',
    effect: 'power+2',
    remaining: -1,
    buffType: 'power',
    buffValue: 2,
    isKoho: true,
    ...overrides,
  });

// ============================================
// addBuffWithKohoReplace
// ============================================
describe('addBuffWithKohoReplace', () => {
  it('通常バフを既存リストに追加する', () => {
    const existing = [createBuff({ id: 'a', name: 'キャッツアイ' })];
    const newBuff = createBuff({ id: 'b', name: 'マッスルベアー' });

    const result = addBuffWithKohoReplace(existing, newBuff);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('キャッツアイ');
    expect(result[1].name).toBe('マッスルベアー');
  });

  it('空リストに通常バフを追加する', () => {
    const result = addBuffWithKohoReplace([], createBuff());
    expect(result).toHaveLength(1);
  });

  it('鼓咆を追加すると既存の鼓咆が上書きされる', () => {
    const existing = [
      createBuff({ id: 'normal', name: 'キャッツアイ' }),
      createKohoBuff({ id: 'old-koho', name: '堅陣の攻陣' }),
    ];
    const newKoho = createKohoBuff({ id: 'new-koho', name: '怒涛の攻陣II' });

    const result = addBuffWithKohoReplace(existing, newKoho);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('キャッツアイ');  // 通常バフは残る
    expect(result[1].name).toBe('怒涛の攻陣II');   // 新しい鼓咆に上書き
  });

  it('鼓咆がない状態で新規鼓咆を追加する', () => {
    const existing = [createBuff({ id: 'normal' })];
    const koho = createKohoBuff();

    const result = addBuffWithKohoReplace(existing, koho);

    expect(result).toHaveLength(2);
    expect(result.filter(b => b.isKoho)).toHaveLength(1);
  });

  it('通常バフ追加では既存の鼓咆は残る', () => {
    const existing = [createKohoBuff()];
    const normalBuff = createBuff({ id: 'new-normal' });

    const result = addBuffWithKohoReplace(existing, normalBuff);

    expect(result).toHaveLength(2);
    expect(result[0].isKoho).toBe(true);
  });
});

// ============================================
// processBuffsOnRoundEnd
// ============================================
describe('processBuffsOnRoundEnd', () => {
  it('通常バフのremainingを1減少させる', () => {
    const buffs = [createBuff({ remaining: 3 })];

    const { remainingBuffs } = processBuffsOnRoundEnd(buffs);

    expect(remainingBuffs).toHaveLength(1);
    expect(remainingBuffs[0].remaining).toBe(2);
  });

  it('remaining=1のバフはラウンド終了で期限切れになる', () => {
    const buffs = [createBuff({ remaining: 1, name: 'キャッツアイ' })];

    const { remainingBuffs, expiredBuffs } = processBuffsOnRoundEnd(buffs);

    expect(remainingBuffs).toHaveLength(0);
    expect(expiredBuffs).toHaveLength(1);
    expect(expiredBuffs[0].name).toBe('キャッツアイ');
  });

  it('永続バフ(remaining=-1)はラウンド終了で減少しない', () => {
    const buffs = [createKohoBuff({ remaining: -1 })];

    const { remainingBuffs, expiredBuffs } = processBuffsOnRoundEnd(buffs);

    expect(remainingBuffs).toHaveLength(1);
    expect(remainingBuffs[0].remaining).toBe(-1);
    expect(expiredBuffs).toHaveLength(0);
  });

  it('複数バフが混在する場合、各バフを正しく処理する', () => {
    const buffs = [
      createBuff({ id: '1', name: 'キャッツアイ', remaining: 3 }),
      createBuff({ id: '2', name: 'マッスルベアー', remaining: 1 }),
      createKohoBuff({ id: '3', name: '怒涛の攻陣II' }),
    ];

    const { remainingBuffs, expiredBuffs } = processBuffsOnRoundEnd(buffs);

    expect(remainingBuffs).toHaveLength(2);       // キャッツアイ(2R) + 鼓咆
    expect(expiredBuffs).toHaveLength(1);           // マッスルベアー期限切れ
    expect(expiredBuffs[0].name).toBe('マッスルベアー');
    expect(remainingBuffs.find(b => b.name === 'キャッツアイ')?.remaining).toBe(2);
    expect(remainingBuffs.find(b => b.isKoho)?.remaining).toBe(-1);
  });

  it('空のバフリストを渡すと空の結果を返す', () => {
    const { remainingBuffs, expiredBuffs } = processBuffsOnRoundEnd([]);

    expect(remainingBuffs).toHaveLength(0);
    expect(expiredBuffs).toHaveLength(0);
  });
});

// ============================================
// calculateBuffEffects
// ============================================
describe('calculateBuffEffects', () => {
  it('単一バフの効果を正しく集計する', () => {
    const buffs = [createBuff({ buffType: 'hit', buffValue: 2 })];

    const effects = calculateBuffEffects(buffs);

    expect(effects.hit).toBe(2);
    expect(effects.dodge).toBe(0);
  });

  it('同じ種類のバフは合算される', () => {
    const buffs = [
      createBuff({ id: '1', buffType: 'hit', buffValue: 1 }),
      createBuff({ id: '2', buffType: 'hit', buffValue: 2 }),
    ];

    const effects = calculateBuffEffects(buffs);

    expect(effects.hit).toBe(3);
  });

  it('異なる種類のバフはそれぞれ独立に集計される', () => {
    const buffs = [
      createBuff({ id: '1', buffType: 'hit', buffValue: 1 }),
      createBuff({ id: '2', buffType: 'dodge', buffValue: 2 }),
      createBuff({ id: '3', buffType: 'power', buffValue: 3 }),
    ];

    const effects = calculateBuffEffects(buffs);

    expect(effects.hit).toBe(1);
    expect(effects.dodge).toBe(2);
    expect(effects.power).toBe(3);
  });

  it('buffTypeやbuffValueが未定義のバフは無視される', () => {
    const buffs = [
      createBuff({ buffType: undefined, buffValue: undefined }),
      createBuff({ id: '2', buffType: 'hit', buffValue: 1 }),
    ];

    const effects = calculateBuffEffects(buffs);

    expect(effects.hit).toBe(1);
  });

  it('空のバフリストでは全て0を返す', () => {
    const effects = calculateBuffEffects([]);

    expect(effects.hit).toBe(0);
    expect(effects.dodge).toBe(0);
    expect(effects.defense).toBe(0);
    expect(effects.power).toBe(0);
    expect(effects.magicPower).toBe(0);
  });
});

// ============================================
// hasDuplicateBuff
// ============================================
describe('hasDuplicateBuff', () => {
  it('同名バフが存在する場合trueを返す', () => {
    const buffs = [createBuff({ name: 'キャッツアイ' })];

    expect(hasDuplicateBuff(buffs, 'キャッツアイ')).toBe(true);
  });

  it('同名バフがない場合falseを返す', () => {
    const buffs = [createBuff({ name: 'キャッツアイ' })];

    expect(hasDuplicateBuff(buffs, 'マッスルベアー')).toBe(false);
  });

  it('空リストではfalseを返す', () => {
    expect(hasDuplicateBuff([], 'キャッツアイ')).toBe(false);
  });
});

// ============================================
// getKohoBuff
// ============================================
describe('getKohoBuff', () => {
  it('鼓咆バフを返す', () => {
    const koho = createKohoBuff();
    const buffs = [createBuff(), koho];

    const result = getKohoBuff(buffs);

    expect(result).toBeDefined();
    expect(result?.isKoho).toBe(true);
    expect(result?.name).toBe('怒涛の攻陣II');
  });

  it('鼓咆がない場合undefinedを返す', () => {
    const buffs = [createBuff()];

    expect(getKohoBuff(buffs)).toBeUndefined();
  });

  it('空リストではundefinedを返す', () => {
    expect(getKohoBuff([])).toBeUndefined();
  });
});
