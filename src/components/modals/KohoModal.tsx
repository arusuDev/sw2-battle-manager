// ============================================
// 鼓咆（全体バフ）モーダル
// ============================================

import { useState } from 'react';
import type { PartyBuff, KohoPreset } from '../../types';
import { KOHO_PRESETS } from '../../data/presets';

interface KohoModalProps {
  partyBuff: PartyBuff | null;
  onSet: (buff: PartyBuff | null) => void;
  onClose: () => void;
}

type KohoType = 'attack' | 'defense' | 'evasion' | 'resist';

const KOHO_TYPE_CONFIG: Record<KohoType, {
  label: string;
  bgActive: string;
  bgHover: string;
  textColor: string;
  headerBg: string;
}> = {
  attack: {
    label: '攻撃系',
    bgActive: 'bg-orange-700 border-orange-500',
    bgHover: 'bg-orange-900/50 hover:bg-orange-800/60 active:bg-orange-700/70 border-orange-700/50',
    textColor: 'text-orange-200',
    headerBg: 'bg-orange-900/30 hover:bg-orange-900/50 border-orange-700/50',
  },
  defense: {
    label: '防御系',
    bgActive: 'bg-cyan-700 border-cyan-500',
    bgHover: 'bg-cyan-900/50 hover:bg-cyan-800/60 active:bg-cyan-700/70 border-cyan-700/50',
    textColor: 'text-cyan-200',
    headerBg: 'bg-cyan-900/30 hover:bg-cyan-900/50 border-cyan-700/50',
  },
  evasion: {
    label: '回避系',
    bgActive: 'bg-green-700 border-green-500',
    bgHover: 'bg-green-900/50 hover:bg-green-800/60 active:bg-green-700/70 border-green-700/50',
    textColor: 'text-green-200',
    headerBg: 'bg-green-900/30 hover:bg-green-900/50 border-green-700/50',
  },
  resist: {
    label: '抵抗系',
    bgActive: 'bg-purple-700 border-purple-500',
    bgHover: 'bg-purple-900/50 hover:bg-purple-800/60 active:bg-purple-700/70 border-purple-700/50',
    textColor: 'text-purple-200',
    headerBg: 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-700/50',
  },
};

export const KohoModal = ({ partyBuff, onSet, onClose }: KohoModalProps) => {
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customType, setCustomType] = useState<KohoType>('attack');

  // アコーディオンの開閉状態（現在選択中のタイプをデフォルトで開く）
  const [openSection, setOpenSection] = useState<KohoType | 'custom' | null>(
    partyBuff?.type || 'attack'
  );

  const handlePresetSelect = (type: KohoType, koho: KohoPreset) => {
    // Firestoreはundefinedを保存できないため、定義された値のみを含むオブジェクトを作成
    const buff: PartyBuff = {
      type,
      name: koho.name,
      effect: koho.effect,
    };

    // 定義されている値のみを追加
    if (koho.physicalDamage !== undefined) buff.physicalDamage = koho.physicalDamage;
    if (koho.magicDamage !== undefined) buff.magicDamage = koho.magicDamage;
    if (koho.hit !== undefined) buff.hit = koho.hit;
    if (koho.defense !== undefined) buff.defense = koho.defense;
    if (koho.physicalReduce !== undefined) buff.physicalReduce = koho.physicalReduce;
    if (koho.magicReduce !== undefined) buff.magicReduce = koho.magicReduce;
    if (koho.dodge !== undefined) buff.dodge = koho.dodge;
    if (koho.damageReduce !== undefined) buff.damageReduce = koho.damageReduce;
    if (koho.vitResist !== undefined) buff.vitResist = koho.vitResist;
    if (koho.mndResist !== undefined) buff.mndResist = koho.mndResist;
    if (koho.dodgePenalty !== undefined) buff.dodgePenalty = koho.dodgePenalty;
    if (koho.defensePenalty !== undefined) buff.defensePenalty = koho.defensePenalty;
    if (koho.physicalDamagePenalty !== undefined) buff.physicalDamagePenalty = koho.physicalDamagePenalty;
    if (koho.vitResistPenalty !== undefined) buff.vitResistPenalty = koho.vitResistPenalty;
    if (koho.mndResistPenalty !== undefined) buff.mndResistPenalty = koho.mndResistPenalty;

    onSet(buff);
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onSet({
      type: customType,
      name: customName.trim(),
      effect: customEffect.trim() || '効果',
    });
    onClose();
  };

  const toggleSection = (section: KohoType | 'custom') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const renderAccordionSection = (type: KohoType, presets: KohoPreset[]) => {
    const config = KOHO_TYPE_CONFIG[type];
    const isOpen = openSection === type;
    const hasSelectedItem = partyBuff?.type === type;

    return (
      <div className="mb-2">
        {/* ヘッダー */}
        <button
          onClick={() => toggleSection(type)}
          className={`w-full p-3 rounded-lg border flex items-center justify-between transition-colors ${config.headerBg}`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-medium ${config.textColor}`}>{config.label}鼓咆</span>
            {hasSelectedItem && (
              <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">選択中</span>
            )}
          </div>
          <span className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* コンテンツ */}
        {isOpen && (
          <div className="mt-2 space-y-2 pl-2">
            {presets.map(koho => (
              <button
                key={koho.name}
                onClick={() => handlePresetSelect(type, koho)}
                className={`w-full p-2 rounded text-left transition-colors border ${
                  partyBuff?.type === type && partyBuff?.name === koho.name
                    ? config.bgActive
                    : config.bgHover
                }`}
              >
                <div className={`text-sm font-medium ${config.textColor}`}>{koho.name}</div>
                <div className="text-xs text-stone-400">{koho.effect}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCustomSection = () => {
    const isOpen = openSection === 'custom';

    return (
      <div className="mb-2">
        {/* ヘッダー */}
        <button
          onClick={() => toggleSection('custom')}
          className="w-full p-3 rounded-lg border bg-stone-800/50 hover:bg-stone-800 border-stone-700 flex items-center justify-between transition-colors"
        >
          <span className="font-medium text-stone-300">カスタム鼓咆</span>
          <span className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* コンテンツ */}
        {isOpen && (
          <div className="mt-2 pl-2 space-y-2">
            <div className="grid grid-cols-4 gap-1">
              {(['attack', 'defense', 'evasion', 'resist'] as KohoType[]).map(type => {
                const config = KOHO_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setCustomType(type)}
                    className={`py-1.5 rounded text-xs transition-colors ${
                      customType === type
                        ? config.bgActive
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="鼓咆名"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
            <input
              type="text"
              value={customEffect}
              onChange={(e) => setCustomEffect(e.target.value)}
              placeholder="効果説明（表示用）"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
                text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={handleCustomAdd}
              disabled={!customName.trim()}
              className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500
                text-white rounded transition-colors"
            >
              カスタム追加
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">鼓咆（全体バフ）</h3>

        {/* アコーディオン形式の鼓咆セクション */}
        {renderAccordionSection('attack', KOHO_PRESETS.attack)}
        {renderAccordionSection('defense', KOHO_PRESETS.defense)}
        {renderAccordionSection('evasion', KOHO_PRESETS.evasion)}
        {renderAccordionSection('resist', KOHO_PRESETS.resist)}

        {/* カスタム鼓咆 */}
        {renderCustomSection()}

        {/* 解除ボタン */}
        {partyBuff && (
          <button
            onClick={() => { onSet(null); onClose(); }}
            className="w-full mt-4 py-2 bg-red-900/50 hover:bg-red-800/60 text-red-300 rounded transition-colors"
          >
            鼓咆を解除
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
