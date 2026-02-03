// ============================================
// 攻撃セクションコンポーネント
// ============================================

import { useState } from 'react';
import type {
    AllyCharacter,
    Character,
    PartyBuff,
    AttackCalcState
} from '../../types';
import { isMultiPartEnemy, isSingleEnemy } from '../../types';
import { COMBAT_SKILLS, MAGIC_SKILLS, MAGIC_NAMES } from '../../data/skills';
import { POWER_OPTIONS, CRIT_OPTIONS } from '../../data/powerTable';
import {
    calcBuffEffects,
    calcStrBonus,
    calcMagicPower
} from '../../utils/calc';
import { roll2d6, getPowerDamage } from '../../utils/dice';

interface AttackSectionProps {
    character: AllyCharacter;
    enemies: Character[];
    partyBuff: PartyBuff | null;
    onApplyDamage: (targetId: string, targetPartId: string, damage: number) => void;
}

export const AttackSection = ({
    character,
    enemies,
    partyBuff,
    onApplyDamage
}: AttackSectionProps) => {
    const [attackCalc, setAttackCalc] = useState<AttackCalcState>({
        attackType: 'physical',
        selectedSkill: '',
        targetId: '',
        targetPartId: '',
        power: 20,
        critValue: 10,
        rolls: [{ d1: '', d2: '' }],
        isResisted: false,
        isWeaknessHit: false,
        isWeaknessExploit: false, // 弱点看破
        finalDamage: null,
    });

    const { stats, skillLevels, buffs } = character;
    const baseBuffEffects = calcBuffEffects(buffs);

    // 鼓咆の効果をbuffEffectsに追加（命中力のみ、ダメージはgetKohoBonusで処理）
    const buffEffects = { ...baseBuffEffects };
    if (partyBuff) {
        // 命中力ボーナス
        if (partyBuff.hit) buffEffects.hit += partyBuff.hit;
    }

    // ============================================
    // 計算関数
    // ============================================

    // 追加ダメージ計算
    const calcExtraDamage = (): number => {
        if (attackCalc.attackType === 'physical') {
            const skillLv = skillLevels[attackCalc.selectedSkill] || 0;
            const strBonus = calcStrBonus(stats, buffEffects);
            return skillLv + strBonus;
        } else {
            return calcMagicPower(attackCalc.selectedSkill, skillLevels, stats, buffEffects);
        }
    };

    // 選択中の対象
    const selectedTarget = enemies.find(e => e.id === attackCalc.targetId);

    // 弱点情報取得
    const getWeakness = () => {
        if (!selectedTarget) return null;
        if (isSingleEnemy(selectedTarget) || isMultiPartEnemy(selectedTarget)) {
            return selectedTarget.weakness;
        }
        return null;
    };
    const weakness = getWeakness();

    // 対象の防御値取得
    const getTargetDefense = (): number => {
        if (!selectedTarget) return 0;

        const targetBuffEffects = calcBuffEffects(selectedTarget.buffs);

        if (attackCalc.attackType === 'physical') {
            let defense = 0;
            if (isMultiPartEnemy(selectedTarget) && attackCalc.targetPartId) {
                const part = selectedTarget.parts.find(p => p.id === attackCalc.targetPartId);
                defense = part?.defense || 0;
            } else if (isSingleEnemy(selectedTarget)) {
                defense = selectedTarget.modifiers?.defense || 0;
            }
            return defense + (targetBuffEffects.physicalReduce || 0);
        } else {
            return targetBuffEffects.magicReduce || 0;
        }
    };

    // 鼓咆ボーナス取得（攻撃系のダメージボーナス - 防御系の与ダメージペナルティ）
    const getKohoBonus = (): number => {
        if (!partyBuff) return 0;

        let bonus = 0;

        // 攻撃系の鼓咆：物理/魔法ダメージボーナス
        if (partyBuff.type === 'attack') {
            if (attackCalc.attackType === 'physical') {
                bonus += partyBuff.physicalDamage || 0;
            } else {
                bonus += partyBuff.magicDamage || 0;
            }
        }

        // 防御系の鼓咆：与ダメージペナルティ（物理のみ）
        if (partyBuff.type === 'defense' && attackCalc.attackType === 'physical') {
            bonus -= partyBuff.physicalDamagePenalty || 0;
        }

        return bonus;
    };

    // 自動ダイスロール
    const rollDamage = () => {
        const newRolls: { d1: string; d2: string }[] = [];
        let currentRoll = roll2d6();
        newRolls.push({ d1: currentRoll.d1.toString(), d2: currentRoll.d2.toString() });

        while (currentRoll.total >= attackCalc.critValue && attackCalc.critValue <= 12 && newRolls.length < 10) {
            currentRoll = roll2d6();
            newRolls.push({ d1: currentRoll.d1.toString(), d2: currentRoll.d2.toString() });
        }

        setAttackCalc(prev => ({ ...prev, rolls: newRolls }));
    };

    // ダイス入力値を更新
    const updateRollValue = (index: number, field: 'd1' | 'd2', value: string) => {
        setAttackCalc(prev => {
            const newRolls = [...prev.rolls];
            newRolls[index] = { ...newRolls[index], [field]: value };

            // クリティカル未満なら後続のロールを削除
            const d1 = field === 'd1' ? parseInt(value) || 0 : parseInt(newRolls[index].d1) || 0;
            const d2 = field === 'd2' ? parseInt(value) || 0 : parseInt(newRolls[index].d2) || 0;
            const newTotal = d1 + d2;

            if (newTotal < prev.critValue || prev.critValue > 12) {
                newRolls.splice(index + 1);
            }

            return { ...prev, rolls: newRolls };
        });
    };

    // ダイス入力値をBlur時に補正
    const handleRollBlur = (index: number, field: 'd1' | 'd2') => {
        setAttackCalc(prev => {
            const roll = prev.rolls[index];
            const value = roll[field];
            if (value === '') return prev;

            const val = Math.max(1, Math.min(6, parseInt(value) || 1));
            const newRolls = [...prev.rolls];
            newRolls[index] = { ...newRolls[index], [field]: val.toString() };

            return { ...prev, rolls: newRolls };
        });
    };

    // ダメージ計算
    const calculateDamage = (): { powerDamage: number; validRolls: number } | null => {
        let powerDamage = 0;
        let validRolls = 0;

        for (const roll of attackCalc.rolls) {
            const d1 = parseInt(roll.d1) || 0;
            const d2 = parseInt(roll.d2) || 0;
            const total = d1 + d2;
            if (roll.d1 === '' || roll.d2 === '' || total < 2) break;
            powerDamage += getPowerDamage(attackCalc.power, total);
            validRolls++;
            if (total < attackCalc.critValue || attackCalc.critValue > 12) break;
        }

        if (validRolls === 0 || !attackCalc.selectedSkill) return null;
        return { powerDamage, validRolls };
    };

    // 利用可能な技能
    const availableSkills = attackCalc.attackType === 'physical'
        ? COMBAT_SKILLS.filter(s => skillLevels[s] > 0)
        : MAGIC_SKILLS.filter(s => skillLevels[s] > 0);

    // ダメージ計算結果
    const damageResult = calculateDamage();

    return (
        <div className="border-t border-stone-700 pt-3">
            <span className="text-xs text-stone-500">攻撃</span>

            {/* 攻撃タイプ選択 */}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setAttackCalc(prev => ({
                        ...prev,
                        attackType: 'physical',
                        selectedSkill: '',
                        rolls: [{ d1: '', d2: '' }],
                        isWeaknessHit: false,
                        isWeaknessExploit: false
                    }))}
                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${attackCalc.attackType === 'physical'
                        ? 'bg-orange-700 text-white'
                        : 'bg-stone-800 text-stone-400'
                        }`}
                >
                    物理
                </button>
                <button
                    onClick={() => setAttackCalc(prev => ({
                        ...prev,
                        attackType: 'magic',
                        selectedSkill: '',
                        rolls: [{ d1: '', d2: '' }],
                        isWeaknessHit: false,
                        isWeaknessExploit: false
                    }))}
                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${attackCalc.attackType === 'magic'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-stone-800 text-stone-400'
                        }`}
                >
                    魔法
                </button>
            </div>

            {/* 技能選択 */}
            <div className="mt-2">
                <label className="block text-xs text-stone-500 mb-1">
                    {attackCalc.attackType === 'physical' ? '戦闘技能' : '魔法'}
                </label>
                <select
                    value={attackCalc.selectedSkill}
                    onChange={(e) => setAttackCalc(prev => ({ ...prev, selectedSkill: e.target.value }))}
                    className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                >
                    <option value="">-- 選択 --</option>
                    {availableSkills.map(s => (
                        <option key={s} value={s}>
                            {attackCalc.attackType === 'magic' ? MAGIC_NAMES[s] : s} Lv.{skillLevels[s]}
                        </option>
                    ))}
                </select>
            </div>

            {/* 対象選択 */}
            <div className="mt-2">
                <label className="block text-xs text-stone-500 mb-1">攻撃対象</label>
                <select
                    value={attackCalc.targetId}
                    onChange={(e) => setAttackCalc(prev => ({ ...prev, targetId: e.target.value, targetPartId: '', isWeaknessHit: false, isWeaknessExploit: false }))}
                    className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                >
                    <option value="">-- 対象選択 --</option>
                    {enemies.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>

            {/* 部位選択（複数部位敵の場合） */}
            {selectedTarget && isMultiPartEnemy(selectedTarget) && (
                <div className="mt-2">
                    <label className="block text-xs text-stone-500 mb-1">部位</label>
                    <select
                        value={attackCalc.targetPartId}
                        onChange={(e) => setAttackCalc(prev => ({ ...prev, targetPartId: e.target.value }))}
                        className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        <option value="">-- 部位選択 --</option>
                        {selectedTarget.parts.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} (HP:{p.hp.current}/{p.hp.max} 防護:{p.defense})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* 威力・C値 */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <label className="block text-xs text-stone-500 mb-1">威力</label>
                    <select
                        value={attackCalc.power}
                        onChange={(e) => setAttackCalc(prev => ({
                            ...prev,
                            power: parseInt(e.target.value),
                            rolls: [{ d1: '', d2: '' }]
                        }))}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        {POWER_OPTIONS.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-stone-500 mb-1">C値</label>
                    <select
                        value={attackCalc.critValue}
                        onChange={(e) => setAttackCalc(prev => ({
                            ...prev,
                            critValue: parseInt(e.target.value),
                            rolls: [{ d1: '', d2: '' }]
                        }))}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        {CRIT_OPTIONS.map(c => (
                            <option key={c} value={c}>{c === 13 ? 'なし' : c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 追加ダメージ表示 & 弱点表示 */}
            {attackCalc.selectedSkill && (
                <div className="mt-2 p-2 bg-stone-800/50 rounded text-xs text-stone-400">
                    <div>
                        追加ダメージ: <span className="text-stone-200 font-bold">{calcExtraDamage()}</span>
                        {attackCalc.attackType === 'physical'
                            ? ` (技能${skillLevels[attackCalc.selectedSkill]}+筋力B)`
                            : ` (魔力)`
                        }
                        {getKohoBonus() !== 0 && (
                            <span className={getKohoBonus() > 0 ? "text-orange-400" : "text-red-400"}>
                                {' '}{getKohoBonus() > 0 ? '+' : ''}鼓咆{getKohoBonus()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 弱点適用 */}
            {weakness && (
                <div className="mt-2 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-red-400">弱点情報:</span>
                        <span className="text-stone-200">{weakness.type} +{weakness.value}</span>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-red-900/20 p-2 rounded border border-red-900/30 hover:bg-red-900/30 transition-colors flex-1">
                            <input
                                type="checkbox"
                                checked={attackCalc.isWeaknessHit}
                                onChange={(e) => setAttackCalc(prev => ({ ...prev, isWeaknessHit: e.target.checked }))}
                                className="w-4 h-4 rounded bg-stone-700 border-stone-600 focus:ring-red-500 text-red-500"
                            />
                            <span className={attackCalc.isWeaknessHit ? 'text-red-200 font-bold' : 'text-stone-400'}>
                                弱点適用 (+{weakness.value})
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer bg-indigo-900/20 p-2 rounded border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors flex-1">
                            <input
                                type="checkbox"
                                checked={attackCalc.isWeaknessExploit}
                                onChange={(e) => setAttackCalc(prev => ({ ...prev, isWeaknessExploit: e.target.checked }))}
                                className="w-4 h-4 rounded bg-stone-700 border-stone-600 focus:ring-indigo-500 text-indigo-500"
                            />
                            <span className={attackCalc.isWeaknessExploit ? 'text-indigo-200 font-bold' : 'text-stone-400'}>
                                弱点看破 (×2)
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* ダイス入力エリア */}
            <div className="mt-3 space-y-2">
                {attackCalc.rolls.map((roll, index) => {
                    const total = (parseInt(roll.d1) || 0) + (parseInt(roll.d2) || 0);
                    const isValidRoll = roll.d1 !== '' && roll.d2 !== '' && total >= 2;
                    const isCrit = isValidRoll && total >= attackCalc.critValue && attackCalc.critValue <= 12;

                    return (
                        <div key={index} className={`p-2 rounded ${isCrit ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-stone-800/50'}`}>
                            <div className="flex items-center gap-2">
                                {index > 0 && <span className="text-yellow-400 text-xs">回転{index + 1}</span>}
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={roll.d1}
                                    onChange={(e) => updateRollValue(index, 'd1', e.target.value)}
                                    onBlur={() => handleRollBlur(index, 'd1')}
                                    placeholder="D1"
                                    className="w-12 px-2 py-1 bg-stone-700 border border-stone-600 rounded text-stone-200 text-center text-lg"
                                />
                                <span className="text-stone-500">+</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={roll.d2}
                                    onChange={(e) => updateRollValue(index, 'd2', e.target.value)}
                                    onBlur={() => handleRollBlur(index, 'd2')}
                                    placeholder="D2"
                                    className="w-12 px-2 py-1 bg-stone-700 border border-stone-600 rounded text-stone-200 text-center text-lg"
                                />
                                <span className="text-stone-500">=</span>
                                <span className={`text-lg font-bold min-w-[2rem] text-center ${isCrit ? 'text-yellow-400' : 'text-stone-200'}`}>
                                    {isValidRoll ? total : '-'}
                                </span>
                                {isCrit && <span className="text-yellow-400 text-xs">クリティカル!</span>}
                            </div>
                        </div>
                    );
                })}

                {/* クリティカル時に次のロール入力を追加 */}
                {(() => {
                    const lastRoll = attackCalc.rolls[attackCalc.rolls.length - 1];
                    const lastTotal = (parseInt(lastRoll.d1) || 0) + (parseInt(lastRoll.d2) || 0);
                    const lastIsValid = lastRoll.d1 !== '' && lastRoll.d2 !== '' && lastTotal >= 2;
                    const lastIsCrit = lastIsValid && lastTotal >= attackCalc.critValue && attackCalc.critValue <= 12;

                    if (lastIsCrit && attackCalc.rolls.length < 10) {
                        return (
                            <button
                                onClick={() => setAttackCalc(prev => ({ ...prev, rolls: [...prev.rolls, { d1: '', d2: '' }] }))}
                                className="w-full py-2 bg-yellow-800 hover:bg-yellow-700 text-yellow-200 text-sm rounded transition-colors"
                            >
                                + 次のダイスを入力
                            </button>
                        );
                    }
                    return null;
                })()}
            </div>

            {/* 抵抗チェック（魔法時のみ） */}
            {attackCalc.attackType === 'magic' && (
                <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={attackCalc.isResisted}
                            onChange={(e) => setAttackCalc(prev => ({ ...prev, isResisted: e.target.checked }))}
                            className="w-4 h-4 rounded bg-stone-700 border-stone-600"
                        />
                        抵抗された（ダメージ半減）
                    </label>
                </div>
            )}

            {/* ダメージ結果 */}
            {damageResult && (() => {
                const extraDamage = calcExtraDamage();
                const defense = getTargetDefense();
                const kohoBonus = getKohoBonus();
                const weaknessVal = (weakness && attackCalc.isWeaknessHit) ? weakness.value : 0;
                // 弱点看破：弱点値を2倍にする
                const weaknessBonus = attackCalc.isWeaknessExploit ? weaknessVal * 2 : weaknessVal;

                let finalDamage = damageResult.powerDamage + extraDamage - defense + kohoBonus + weaknessBonus;
                finalDamage = Math.max(0, finalDamage);

                // 抵抗時半減（切り上げ）
                if (attackCalc.attackType === 'magic' && attackCalc.isResisted) {
                    finalDamage = Math.ceil(finalDamage / 2);
                }

                return (
                    <div className="mt-3 p-3 bg-stone-800 rounded">
                        <div className="text-center">
                            <span className="text-stone-400 text-sm">ダメージ: </span>
                            <span className={`text-3xl font-bold ${attackCalc.attackType === 'physical' ? 'text-orange-400' : 'text-indigo-400'}`}>
                                {finalDamage}
                            </span>
                            {attackCalc.isResisted && (
                                <span className="text-xs text-stone-500 ml-2">(抵抗で半減)</span>
                            )}
                        </div>
                        <div className="text-xs text-stone-500 text-center mt-1">
                            威力{damageResult.powerDamage} + 追加{extraDamage} - 防御{defense}
                            {kohoBonus !== 0 && ` ${kohoBonus > 0 ? '+' : ''} 鼓咆${kohoBonus}`}
                            {weaknessBonus > 0 && ` + 弱点${weaknessBonus}${attackCalc.isWeaknessExploit ? '(看破)' : ''}`}
                        </div>

                        {/* 適用ボタン */}
                        {attackCalc.targetId && (
                            <button
                                onClick={() => {
                                    onApplyDamage(attackCalc.targetId, attackCalc.targetPartId, finalDamage);
                                    setAttackCalc(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false, isWeaknessHit: false, isWeaknessExploit: false }));
                                }}
                                className={`w-full mt-2 py-2 font-bold rounded transition-colors ${attackCalc.attackType === 'physical'
                                    ? 'bg-orange-700 hover:bg-orange-600 text-white'
                                    : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                                    }`}
                            >
                                ダメージを適用
                            </button>
                        )}
                    </div>
                );
            })()}

            {/* リセット＆自動ロールボタン */}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setAttackCalc(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false, isWeaknessHit: false, isWeaknessExploit: false }))}
                    className="flex-1 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded transition-colors"
                >
                    クリア
                </button>
                <button
                    onClick={rollDamage}
                    className="flex-1 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded transition-colors"
                >
                    🎲 自動ロール
                </button>
            </div>
        </div>
    );
};
