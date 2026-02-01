import { useState, useMemo } from 'react';
import type {
    AllyCharacter,
    SingleEnemy,
    MultiPartEnemy,
    EnemyMagicSkill,
} from '../../types';
import { isMultiPartEnemy } from '../../types';
import { calcBuffEffects, calcMndResist, calcDefenseValue } from '../../utils/calc';
import { POWER_OPTIONS, CRIT_OPTIONS } from '../../data/powerTable';
import { getPowerDamage } from '../../utils/dice';

interface EnemyAttackSectionProps {
    enemy: SingleEnemy | MultiPartEnemy;
    allies: AllyCharacter[];
    onApplyDamage: (targetId: string, damage: number) => void;
}

interface EnemyAttackState {
    attackType: 'physical' | 'magic';
    selectedPartId: string;
    selectedMagicIndex: number;
    targetId: string;
    power: number; // 威力（魔法用）
    critValue: number; // C値（魔法用）
    physicalDamageBonus: number; // 追加ダメージ（物理用）
    magicDamageBonus: number; // 追加ダメージ（魔法用）
    rolls: { d1: string; d2: string }[];
    isResisted: boolean;
}

export const EnemyAttackSection = ({
    enemy,
    allies,
    onApplyDamage
}: EnemyAttackSectionProps) => {
    const [state, setState] = useState<EnemyAttackState>({
        attackType: 'physical',
        selectedPartId: isMultiPartEnemy(enemy) ? enemy.parts[0]?.id || '' : '',
        selectedMagicIndex: -1,
        targetId: '',
        power: 20,
        critValue: 10,
        physicalDamageBonus: 0,
        magicDamageBonus: 0,
        rolls: [{ d1: '', d2: '' }],
        isResisted: false,
    });

    // 攻撃パラメータ取得
    const attackParams = useMemo(() => {
        let name = enemy.name;
        let damage = 0; // 物理攻撃の固定ダメージ（打撃点）
        let magicPower = 0;
        let magicSkills: EnemyMagicSkill[] = [];

        if (isMultiPartEnemy(enemy)) {
            const part = enemy.parts.find(p => p.id === state.selectedPartId);
            if (part) {
                name = `${enemy.name} (${part.name})`;
                damage = part.fixedDamage || 0;
                magicSkills = part.magicSkills || [];
            }
        } else {
            name = enemy.name;
            damage = enemy.fixedDamage || 0;
            magicSkills = enemy.magicSkills || [];
        }

        // 魔法攻撃時の魔力取得
        if (state.attackType === 'magic' && state.selectedMagicIndex >= 0) {
            const magic = magicSkills[state.selectedMagicIndex];
            magicPower = magic ? magic.magicPower : 0;
        }

        return { name, damage, magicPower, magicSkills };
    }, [enemy, state.selectedPartId, state.attackType, state.selectedMagicIndex]);

    // ターゲット情報
    const target = allies.find(a => a.id === state.targetId);
    const targetStats = useMemo(() => {
        if (!target) return null;
        const eff = calcBuffEffects(target.buffs);
        return {
            mndResist: calcMndResist(target, eff),
            defense: calcDefenseValue(target, eff),
        };
    }, [target]);

    const updateRoll = (index: number, field: 'd1' | 'd2', value: string) => {
        // 空文字（クリア）は許可、数値は1~6に制限
        if (value !== '') {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 6) return;
        }

        setState(prev => {
            const newRolls = [...prev.rolls];
            newRolls[index] = { ...newRolls[index], [field]: value };

            // 魔法攻撃時：自動行追加ロジック
            if (prev.attackType === 'magic') {
                const d1 = field === 'd1' ? parseInt(value) || 0 : parseInt(newRolls[index].d1) || 0;
                const d2 = field === 'd2' ? parseInt(value) || 0 : parseInt(newRolls[index].d2) || 0;
                const newTotal = d1 + d2;

                // クリティカル未満なら後続を削除
                if (newTotal < prev.critValue || prev.critValue > 12) {
                    newRolls.splice(index + 1);
                }
            }

            return { ...prev, rolls: newRolls };
        });
    };

    // 回転用ボタン押下時（魔法のみ）
    const addNextRoll = () => {
        setState(prev => ({ ...prev, rolls: [...prev.rolls, { d1: '', d2: '' }] }));
    };

    // ダメージ計算
    const calcDamageResult = () => {
        let totalDamage = 0;
        let validRolls = 0;

        if (state.attackType === 'physical') {
            // 物理: 定値 + 出目合計 + 追加 - 防護
            const roll = state.rolls[0];
            const d1 = parseInt(roll.d1) || 0;
            const d2 = parseInt(roll.d2) || 0;
            const diceTotal = (roll.d1 !== '' || roll.d2 !== '') ? d1 + d2 : 0;

            totalDamage = attackParams.damage + diceTotal + state.physicalDamageBonus;
            if (targetStats) {
                totalDamage -= targetStats.defense;
            }
        } else {
            // 魔法: 威力表 + 魔力 + 追加ダメージ
            let powerDamage = 0;
            for (const roll of state.rolls) {
                const d1 = parseInt(roll.d1) || 0;
                const d2 = parseInt(roll.d2) || 0;
                const total = d1 + d2;
                if (roll.d1 === '' || roll.d2 === '' || total < 2) break;

                powerDamage += getPowerDamage(state.power, total);
                validRolls++;

                if (total < state.critValue || state.critValue > 12) break;
            }

            if (validRolls === 0) return 0; // 出目未入力なら0

            totalDamage = powerDamage + attackParams.magicPower + state.magicDamageBonus;

            // 抵抗半減（切り上げ）
            if (state.isResisted) {
                totalDamage = Math.ceil(totalDamage / 2);
            }
        }

        return Math.max(0, totalDamage);
    };

    const finalDamage = calcDamageResult();

    return (
        <div className="border-t border-stone-700 pt-3 mt-2 bg-stone-900/30 p-2 rounded">
            <div className="text-xs text-red-400 font-bold mb-2">⚔️ 攻撃操作</div>

            {/* 攻撃主体（部位）選択 */}
            {isMultiPartEnemy(enemy) && (
                <div className="mb-2">
                    <label className="block text-xs text-stone-500 mb-1">攻撃部位</label>
                    <select
                        value={state.selectedPartId}
                        onChange={(e) => setState(prev => ({ ...prev, selectedPartId: e.target.value }))}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        {enemy.parts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* 攻撃タイプ選択 */}
            <div className="flex gap-2 mb-2">
                <button
                    onClick={() => setState(prev => ({
                        ...prev,
                        attackType: 'physical',
                        selectedMagicIndex: -1,
                        rolls: [{ d1: '', d2: '' }]
                    }))}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${state.attackType === 'physical'
                        ? 'bg-red-800 text-white'
                        : 'bg-stone-800 text-stone-400'
                        }`}
                >
                    物理攻撃 (打撃点{attackParams.damage})
                </button>
                <button
                    onClick={() => setState(prev => ({
                        ...prev,
                        attackType: 'magic',
                        selectedMagicIndex: attackParams.magicSkills.length > 0 ? 0 : -1,
                        rolls: [{ d1: '', d2: '' }]
                    }))}
                    disabled={attackParams.magicSkills.length === 0}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${state.attackType === 'magic'
                        ? 'bg-indigo-800 text-white'
                        : 'bg-stone-800 text-stone-400'
                        } ${attackParams.magicSkills.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    魔法攻撃
                </button>
            </div>

            {/* 魔法選択 & 威力設定 */}
            {state.attackType === 'magic' && (
                <div className="mb-2 space-y-2">
                    <select
                        value={state.selectedMagicIndex}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            selectedMagicIndex: parseInt(e.target.value),
                            rolls: [{ d1: '', d2: '' }]
                        }))}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        {attackParams.magicSkills.map((skill, idx) => (
                            <option key={idx} value={idx}>
                                {skill.skill} Lv{skill.level} (魔力{skill.magicPower})
                            </option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-stone-500 mb-1">威力</label>
                            <select
                                value={state.power}
                                onChange={(e) => setState(prev => ({ ...prev, power: parseInt(e.target.value), rolls: [{ d1: '', d2: '' }] }))}
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
                                value={state.critValue}
                                onChange={(e) => setState(prev => ({ ...prev, critValue: parseInt(e.target.value), rolls: [{ d1: '', d2: '' }] }))}
                                className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                            >
                                {CRIT_OPTIONS.map(c => (
                                    <option key={c} value={c}>{c === 13 ? 'なし' : c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-2">
                {/* ターゲット選択 */}
                <div>
                    <label className="block text-xs text-stone-500 mb-1">対象</label>
                    <select
                        value={state.targetId}
                        onChange={(e) => setState(prev => ({ ...prev, targetId: e.target.value }))}
                        className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
                    >
                        <option value="">-- 対象 --</option>
                        {allies.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                {/* ターゲット情報表示 */}
                <div className="bg-stone-800 rounded p-1 flex flex-col justify-center text-center">
                    {targetStats ? (
                        <>
                            <div className="text-xs text-stone-400">
                                {state.attackType === 'physical' ? '目標防護点' : '目標抵抗'}
                            </div>
                            <div className="text-sm font-bold text-stone-200">
                                {state.attackType === 'physical' ? targetStats.defense : targetStats.mndResist}
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-stone-600">-</span>
                    )}
                </div>
            </div>

            {/* 追加ダメージ（物理用） */}
            {state.attackType === 'physical' && (
                <div className="mb-2">
                    <label className="block text-xs text-stone-500 mb-1">追加ダメージ (物理)</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setState(prev => ({ ...prev, physicalDamageBonus: prev.physicalDamageBonus - 1 }))}
                            className="p-1 bg-stone-700 rounded text-stone-300"
                        >-</button>
                        <input
                            type="number"
                            value={state.physicalDamageBonus}
                            onChange={(e) => setState(prev => ({ ...prev, physicalDamageBonus: parseInt(e.target.value) || 0 }))}
                            className="flex-1 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-center text-stone-200"
                        />
                        <button
                            onClick={() => setState(prev => ({ ...prev, physicalDamageBonus: prev.physicalDamageBonus + 1 }))}
                            className="p-1 bg-stone-700 rounded text-stone-300"
                        >+</button>
                    </div>
                </div>
            )}

            {/* 追加ダメージ（魔法用） */}
            {state.attackType === 'magic' && (
                <div className="mb-2">
                    <label className="block text-xs text-stone-500 mb-1">追加ダメージ (魔法)</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setState(prev => ({ ...prev, magicDamageBonus: prev.magicDamageBonus - 1 }))}
                            className="p-1 bg-stone-700 rounded text-stone-300"
                        >-</button>
                        <input
                            type="number"
                            value={state.magicDamageBonus}
                            onChange={(e) => setState(prev => ({ ...prev, magicDamageBonus: parseInt(e.target.value) || 0 }))}
                            className="flex-1 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-center text-stone-200"
                        />
                        <button
                            onClick={() => setState(prev => ({ ...prev, magicDamageBonus: prev.magicDamageBonus + 1 }))}
                            className="p-1 bg-stone-700 rounded text-stone-300"
                        >+</button>
                    </div>
                </div>
            )}

            {/* ダイスロール（手動入力） */}
            <div className="mb-3 p-2 bg-stone-800 rounded">
                <div className="text-xs text-stone-400 mb-2">
                    {state.attackType === 'physical' ? '出目 (ダメージに加算)' : '威力表用出目'}
                </div>

                <div className="space-y-1">
                    {state.rolls.map((roll, idx) => {
                        const d1 = parseInt(roll.d1) || 0;
                        const d2 = parseInt(roll.d2) || 0;
                        const total = d1 + d2;
                        const isValid = roll.d1 !== '' && roll.d2 !== '' && total >= 2;

                        // 魔法かつクリティカル判定
                        const isCrit = state.attackType === 'magic' && isValid && total >= state.critValue && state.critValue <= 12;

                        return (
                            <div key={idx} className={`flex items-center gap-1 justify-center p-1 rounded ${isCrit ? 'bg-yellow-900/30' : ''}`}>
                                {idx > 0 && <span className="text-[10px] text-yellow-500 mr-1">回転{idx}</span>}
                                <input type="number" value={roll.d1} onChange={e => updateRoll(idx, 'd1', e.target.value)}
                                    className="w-8 h-8 text-center bg-stone-900 border border-stone-600 rounded" placeholder="D1" />
                                <span>+</span>
                                <input type="number" value={roll.d2} onChange={e => updateRoll(idx, 'd2', e.target.value)}
                                    className="w-8 h-8 text-center bg-stone-900 border border-stone-600 rounded" placeholder="D2" />
                                <span>=</span>
                                <span className={`w-8 text-center font-bold ${isCrit ? 'text-yellow-400' : 'text-stone-300'}`}>{isValid ? total : '-'}</span>
                                {isCrit && <span className="text-[10px] text-yellow-400 ml-1">Critical!</span>}
                            </div>
                        );
                    })}
                </div>

                {/* 魔法クリティカル時の次ロールボタン */}
                {state.attackType === 'magic' && (() => {
                    const lastRoll = state.rolls[state.rolls.length - 1];
                    const d1 = parseInt(lastRoll.d1) || 0;
                    const d2 = parseInt(lastRoll.d2) || 0;
                    const total = d1 + d2;
                    const isValid = lastRoll.d1 !== '' && lastRoll.d2 !== '' && total >= 2;
                    if (isValid && total >= state.critValue && state.critValue <= 12 && state.rolls.length < 10) {
                        return (
                            <button
                                onClick={addNextRoll}
                                className="w-full mt-2 py-1 bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-200 text-xs rounded transition-colors"
                            >
                                + 次のダイスを入力
                            </button>
                        );
                    }
                    return null;
                })()}

            </div>

            {/* 抵抗オプション（魔法のみ） */}
            {state.attackType === 'magic' && (
                <div className="mb-3">
                    <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                        <input type="checkbox" checked={state.isResisted} onChange={e => setState(prev => ({ ...prev, isResisted: e.target.checked }))}
                            className="rounded bg-stone-700 border-stone-600" />
                        抵抗された (ダメージ半減)
                    </label>
                </div>
            )}

            {/* ダメージ適用 */}
            <div className="bg-red-950/30 p-2 rounded border border-red-900/30">
                <div className="text-center mb-2">
                    <span className="text-xs text-red-300 mr-2">算出ダメージ</span>
                    <span className="text-xl font-bold text-red-100">{finalDamage}</span>
                </div>
                <div className="text-[10px] text-stone-500 text-center mb-2">
                    {state.attackType === 'physical'
                        ? (() => {
                            const roll = state.rolls[0];
                            const d1 = parseInt(roll.d1) || 0;
                            const d2 = parseInt(roll.d2) || 0;
                            const diceTotal = (roll.d1 !== '' || roll.d2 !== '') ? d1 + d2 : 0;
                            return `定値${attackParams.damage} + 出目${diceTotal} + 追加${state.physicalDamageBonus} - 防護${targetStats?.defense ?? 0}`;
                        })()
                        : `威力表 + 魔力${attackParams.magicPower} + 追加${state.magicDamageBonus} ${state.isResisted ? '/ 2' : ''}`
                    }
                </div>
                <button
                    onClick={() => {
                        if (state.targetId) {
                            onApplyDamage(state.targetId, finalDamage);
                            // Reset rolls
                            setState(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false }));
                        }
                    }}
                    disabled={!state.targetId}
                    className="w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ダメージ適用
                </button>
            </div>

            {/* リセットボタン */}
            <div className="mt-2">
                <button
                    onClick={() => setState(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false, physicalDamageBonus: 0, magicDamageBonus: 0 }))}
                    className="w-full py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded transition-colors"
                >
                    入力クリア
                </button>
            </div>

        </div>
    );
};
