// ============================================
// SW2.0 戦闘管理システム - メインアプリ
// ============================================

import { useState } from 'react';
import type {
  Character,
  Buff,
  PartyBuff,
  ExpiredBuffNotification
} from './types';
import { isMultiPartEnemy } from './types';
import { CharacterCard, MultiPartEnemyCard } from './components/characters';
import {
  AddCharacterForm,
  AddBuffModal,
  CharacterEditModal,
  KohoModal,
  TemplateSelectModal
} from './components/modals';

export default function App() {
  // ============================================
  // State
  // ============================================
  const [characters, setCharacters] = useState<Character[]>([]);
  const [round, setRound] = useState(1);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [addingBuffChar, setAddingBuffChar] = useState<Character | null>(null);
  const [expiredBuffs, setExpiredBuffs] = useState<ExpiredBuffNotification[]>([]);
  const [partyBuff, setPartyBuff] = useState<PartyBuff | null>(null);
  const [showKohoModal, setShowKohoModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // ============================================
  // Character Management
  // ============================================
  const addCharacter = (char: Character) => {
    setCharacters(prev => [...prev, char]);
  };

  const updateCharacter = (updated: Character) => {
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  // ============================================
  // Buff Management
  // ============================================
  const addBuff = (charId: string, buff: Buff) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, buffs: [...(c.buffs || []), buff] };
      }
      return c;
    }));
  };

  const removeBuff = (charId: string, buffId: string) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, buffs: (c.buffs || []).filter(b => b.id !== buffId) };
      }
      return c;
    }));
  };

  // ============================================
  // Round Management
  // ============================================
  const advanceRound = () => {
    const newExpired: ExpiredBuffNotification[] = [];

    setCharacters(prev => prev.map(char => {
      const newBuffs = (char.buffs || []).map(buff => ({
        ...buff,
        remaining: buff.remaining - 1
      })).filter(buff => {
        if (buff.remaining <= 0) {
          newExpired.push({ charName: char.name, buffName: buff.name });
          return false;
        }
        return true;
      });
      return { ...char, buffs: newBuffs };
    }));

    if (newExpired.length > 0) {
      setExpiredBuffs(newExpired);
      setTimeout(() => setExpiredBuffs([]), 5000);
    }

    setRound(r => r + 1);
  };

  const revertRound = () => {
    if (round > 1) {
      setRound(r => r - 1);
    }
  };

  // ============================================
  // Damage Application
  // ============================================
  const applyDamageToTarget = (targetId: string, targetPartId: string, damage: number) => {
    setCharacters(prev => prev.map(char => {
      if (char.id !== targetId) return char;

      if (isMultiPartEnemy(char) && targetPartId) {
        // 複数部位の敵
        const newParts = char.parts.map(p => {
          if (p.id === targetPartId) {
            return { ...p, hp: { ...p.hp, current: p.hp.current - damage } };
          }
          return p;
        });
        return { ...char, parts: newParts };
      } else if ('hp' in char) {
        // 単体の敵
        return { ...char, hp: { ...char.hp, current: char.hp.current - damage } };
      }
      return char;
    }));
  };

  // ============================================
  // Reset
  // ============================================
  const resetAll = () => {
    if (window.confirm('すべてのデータをリセットしますか？')) {
      setCharacters([]);
      setRound(1);
      setPartyBuff(null);
      setExpiredBuffs([]);
    }
  };

  // ============================================
  // Derived State
  // ============================================
  const allies = characters.filter(c => c.type === 'ally');
  const enemies = characters.filter(c => c.type === 'enemy');

  // ============================================
  // Render
  // ============================================
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* 期限切れバフ通知 */}
      {expiredBuffs.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
          bg-amber-900/90 text-amber-100 px-4 py-2 rounded-lg shadow-lg
          border border-amber-700 max-w-sm"
        >
          <div className="text-sm font-medium mb-1">バフが切れました</div>
          {expiredBuffs.map((e, i) => (
            <div key={i} className="text-xs text-amber-200">
              {e.charName}: {e.buffName}
            </div>
          ))}
        </div>
      )}

      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-stone-950/95 border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-amber-400 to-orange-400"
              style={{ fontFamily: 'serif' }}>
              SW2.0 戦闘管理
            </h1>

            <button
              onClick={resetAll}
              className="text-sm text-stone-500 active:text-red-400 px-2 py-1"
            >
              リセット
            </button>
          </div>

          {/* ラウンドカウンター */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={revertRound}
              disabled={round <= 1}
              className="w-10 h-10 flex items-center justify-center bg-stone-800 
                active:bg-stone-700 disabled:opacity-50 rounded-full transition-colors text-stone-300 text-xl"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-xs text-stone-500">ROUND</div>
              <div className="text-3xl font-bold text-amber-400">{round}</div>
            </div>
            <button
              onClick={advanceRound}
              className="w-10 h-10 flex items-center justify-center bg-amber-700 
                active:bg-amber-600 rounded-full transition-colors text-white text-xl"
            >
              ＋
            </button>
          </div>
          <p className="text-center text-xs text-stone-600 mt-1">
            ＋でラウンド進行（バフ自動カウント）
          </p>
        </div>
      </header>

      {/* 鼓咆（全体バフ）エリア */}
      <div className="max-w-4xl mx-auto px-4 pt-3">
        <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-400">🎺 鼓咆（全体バフ）</span>
            <button
              onClick={() => setShowKohoModal(true)}
              className="text-xs text-amber-500 active:text-amber-400"
            >
              編集
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {partyBuff ? (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs
                ${partyBuff.type === 'attack'
                  ? 'bg-orange-900/50 text-orange-300 border border-orange-700/50'
                  : 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50'
                }`}
              >
                <span className="font-medium">{partyBuff.name}</span>
                <span className="opacity-75">{partyBuff.effect}</span>
              </div>
            ) : (
              <span className="text-xs text-stone-600">なし（攻撃系・防御系から1つずつ設定可能）</span>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto p-4">
        {characters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 mb-6">キャラクターがいません</p>
            <div className="flex flex-col gap-3">
              <AddCharacterForm onAdd={addCharacter} />
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full py-4 border-2 border-dashed border-amber-600/50 rounded-lg
                  text-amber-500 active:bg-amber-900/20 
                  transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <span className="text-xl">📋</span>
                <span>テンプレートから追加</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 味方セクション */}
            {allies.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  味方 ({allies.length})
                </h2>
                <div className="space-y-3">
                  {allies.map(char => (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      onUpdate={updateCharacter}
                      onDelete={deleteCharacter}
                      onEditStats={setEditingChar}
                      onAddBuff={setAddingBuffChar}
                      onRemoveBuff={removeBuff}
                      enemies={enemies}
                      partyBuff={partyBuff}
                      onApplyDamage={applyDamageToTarget}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 敵セクション */}
            {enemies.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  敵 ({enemies.length})
                </h2>
                <div className="space-y-3">
                  {enemies.map(char => (
                    isMultiPartEnemy(char) ? (
                      <MultiPartEnemyCard
                        key={char.id}
                        character={char}
                        onUpdate={(updated) => updateCharacter(updated)}
                        onDelete={deleteCharacter}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={removeBuff}
                      />
                    ) : (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        onUpdate={updateCharacter}
                        onDelete={deleteCharacter}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={removeBuff}
                      />
                    )
                  ))}
                </div>
              </section>
            )}

            {/* キャラ追加ボタン */}
            <div className="flex flex-col gap-3">
              <AddCharacterForm onAdd={addCharacter} />
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full py-4 border-2 border-dashed border-amber-600/50 rounded-lg
                  text-amber-500 active:bg-amber-900/20 
                  transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <span className="text-xl">📋</span>
                <span>テンプレートから追加</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* モーダル */}
      {editingChar && (
        <CharacterEditModal
          character={editingChar}
          onSave={updateCharacter}
          onClose={() => setEditingChar(null)}
        />
      )}

      {addingBuffChar && (
        <AddBuffModal
          character={addingBuffChar}
          onAdd={addBuff}
          onClose={() => setAddingBuffChar(null)}
        />
      )}

      {showKohoModal && (
        <KohoModal
          partyBuff={partyBuff}
          onSet={setPartyBuff}
          onClose={() => setShowKohoModal(false)}
        />
      )}

      {showTemplateModal && (
        <TemplateSelectModal
          onAdd={addCharacter}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      <footer className="text-center py-4 text-stone-600 text-sm">
        ※ページを閉じるとデータは消えます
      </footer>
    </div>
  );
}
