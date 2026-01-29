// ============================================
// SW2.0 戦闘管理システム - メインアプリ（Firebase統合版）
// 修正: 鼓咆の同期問題を解消
// ============================================

import { useState, useEffect } from 'react';
import type {
  Character,
  PartyBuff,
  ExpiredBuffNotification,
  BulkBuffTarget,
  Buff
} from './types';
import type { Room } from './types/room';
import { isMultiPartEnemy } from './types';
import { CharacterCard, MultiPartEnemyCard } from './components/characters';
import {
  AddCharacterForm,
  AddBuffModal,
  CharacterEditModal,
  KohoModal,
  TemplateSelectModal,
  BulkBuffModal
} from './components/modals';
import { RoomEntry, RoomHeader } from './components/room';
import { RoomProvider, useRoom } from './contexts/RoomContext';
import { addBuffWithKohoReplace, processBuffsOnRoundEnd } from './utils/buff';

// ============================================
// 戦闘画面（既存のメイン部分）
// ============================================
function BattleScreen() {
  const {
    room,
    isGM,
    characters,
    nextRound,
    updatePartyBuff,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addBuff,
    removeBuff,
  } = useRoom();

  // ============================================
  // Local State（UI用）
  // ============================================
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [addingBuffChar, setAddingBuffChar] = useState<Character | null>(null);
  const [expiredBuffs, setExpiredBuffs] = useState<ExpiredBuffNotification[]>([]);
  // 削除: const [partyBuff, setPartyBuff] = useState<PartyBuff | null>(null);
  const [showKohoModal, setShowKohoModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBulkBuffModal, setShowBulkBuffModal] = useState(false);
  const [prevRound, setPrevRound] = useState(room?.currentRound ?? 1);

  // ルームのラウンド（Firestoreから同期）
  const round = room?.currentRound ?? 1;

  // 鼓咆はFirestoreから直接取得（ローカルstateを使わない）
  const partyBuff = room?.partyBuff ?? null;

  // 削除: useEffectでの同期（これが問題の原因だった）
  // useEffect(() => {
  //   if (room?.partyBuff !== undefined) {
  //     setPartyBuff(room.partyBuff);
  //   }
  // }, [room?.partyBuff]);

  // ============================================
  // ラウンド進行時のバフ処理
  // ============================================
  useEffect(() => {
    // ラウンドが進んだ時のみ処理
    if (round > prevRound) {
      const newExpired: ExpiredBuffNotification[] = [];

      // 全キャラのバフを減少させる
      const updatePromises: Promise<void>[] = [];
      for (const char of characters) {
        const { remainingBuffs, expiredBuffs } = processBuffsOnRoundEnd(char.buffs || []);

        if (expiredBuffs.length > 0) {
          expiredBuffs.forEach(buff => {
            newExpired.push({
              id: `expired-${char.id}-${buff.name}-${Date.now()}`,
              characterName: char.name,
              buffName: buff.name
            });
          });
        }

        // バフが変更されたら更新
        if (JSON.stringify(remainingBuffs) !== JSON.stringify(char.buffs)) {
          updatePromises.push(updateCharacter({ ...char, buffs: remainingBuffs }));
        }
      }
      Promise.all(updatePromises).catch(console.error);

      if (newExpired.length > 0) {
        setExpiredBuffs(newExpired);
        setTimeout(() => setExpiredBuffs([]), 5000);
      }
    }
    setPrevRound(round);
  }, [round, prevRound, characters, updateCharacter]);

  // ============================================
  // Character Handlers（Firestore経由）
  // ============================================
  const handleAddCharacter = async (char: Character) => {
    await addCharacter(char);
  };

  const handleUpdateCharacter = async (updated: Character) => {
    await updateCharacter(updated);
  };

  const handleDeleteCharacter = async (id: string) => {
    await deleteCharacter(id);
  };

  // ============================================
  // Buff Handlers（Firestore経由）
  // ============================================
  const handleAddBuff = async (charId: string, buff: Buff) => {
    await addBuff(charId, buff);
  };

  const handleRemoveBuff = async (charId: string, buffId: string, partId?: string) => {
    await removeBuff(charId, buffId, partId);
  };

  // 一括バフ適用
  const handleBulkBuffApply = async (targets: BulkBuffTarget[], buff: Buff) => {
    for (const target of targets) {
      const char = characters.find(c => c.id === target.characterId);
      if (!char) continue;

      if (target.partId && isMultiPartEnemy(char)) {
        // 複数部位敵の部位にバフ付与
        const updatedParts = char.parts.map(part => {
          if (part.id === target.partId) {
            const newBuffs = addBuffWithKohoReplace(part.buffs || [], {
              ...buff,
              id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
            });
            return { ...part, buffs: newBuffs };
          }
          return part;
        });
        await updateCharacter({ ...char, parts: updatedParts });
      } else {
        // 通常キャラにバフ付与
        const newBuffs = addBuffWithKohoReplace(char.buffs || [], {
          ...buff,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        });
        await updateCharacter({ ...char, buffs: newBuffs });
      }
    }
    setShowBulkBuffModal(false);
  };

  // 鼓咆一括解除
  const handleBulkRemoveKoho = async (targets: BulkBuffTarget[]) => {
    for (const target of targets) {
      const char = characters.find(c => c.id === target.characterId);
      if (!char) continue;

      if (target.partId && isMultiPartEnemy(char)) {
        // 複数部位敵の部位から鼓咆を削除
        const updatedParts = char.parts.map(part => {
          if (part.id === target.partId) {
            const newBuffs = (part.buffs || []).filter(b => !b.isKoho);
            return { ...part, buffs: newBuffs };
          }
          return part;
        });
        await updateCharacter({ ...char, parts: updatedParts });
      } else {
        // 通常キャラから鼓咆を削除
        const newBuffs = (char.buffs || []).filter(b => !b.isKoho);
        await updateCharacter({ ...char, buffs: newBuffs });
      }
    }
    setShowBulkBuffModal(false);
  };

  // ============================================
  // Damage Application
  // ============================================
  const applyDamageToTarget = async (targetId: string, targetPartId: string, damage: number) => {
    const char = characters.find(c => c.id === targetId);
    if (!char) return;

    if (isMultiPartEnemy(char) && targetPartId) {
      const newParts = char.parts.map(p => {
        if (p.id === targetPartId) {
          return { ...p, hp: { ...p.hp, current: p.hp.current - damage } };
        }
        return p;
      });
      await updateCharacter({ ...char, parts: newParts });
    } else if ('hp' in char) {
      await updateCharacter({
        ...char,
        hp: { ...char.hp, current: char.hp.current - damage }
      });
    }
  };

  // 敵からの攻撃ダメージ適用（味方は部位がないのでpartId不要）
  const handleEnemyAttackDamage = async (targetId: string, damage: number) => {
    await applyDamageToTarget(targetId, '', damage);
  };

  // ============================================
  // 鼓咆の更新（Firestore連携のみ）
  // ============================================
  const handleSetPartyBuff = async (buff: PartyBuff | null) => {
    // ローカルstateを更新せず、Firestoreのみ更新
    // → onSnapshotで自動的にroom.partyBuffが更新される
    await updatePartyBuff(buff);
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
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 
          bg-amber-900/90 text-amber-100 px-4 py-2 rounded-lg shadow-lg
          border border-amber-700 max-w-sm"
        >
          <div className="text-sm font-medium mb-1">バフが切れました</div>
          {expiredBuffs.map((e, i) => (
            <div key={i} className="text-xs text-amber-200">
              {e.characterName}: {e.buffName}
            </div>
          ))}
        </div>
      )}

      {/* ルームヘッダー（Firebase連携） */}
      <RoomHeader />

      {/* ラウンド操作 */}
      <div className="sticky top-12 z-10 bg-stone-950/95 border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-stone-500">ROUND</div>
              <div className="text-3xl font-bold text-amber-400">{round}</div>
            </div>
            {isGM && (
              <button
                onClick={nextRound}
                className="px-4 py-2 bg-amber-700 active:bg-amber-600 
                  rounded-lg transition-colors text-white text-sm font-medium"
              >
                次のラウンドへ ▶
              </button>
            )}
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setShowBulkBuffModal(true)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 
                text-white text-sm rounded transition-colors flex items-center gap-1"
            >
              <span>✨</span>
              <span className="hidden sm:inline">一括バフ</span>
            </button>
          </div>

          <p className="text-center text-xs text-stone-600 mt-1">
            {isGM ? 'GMのみラウンドを進行できます' : 'GMがラウンドを進行します'}
          </p>
        </div>
      </div>

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
                {/* 鼓咆解除ボタン */}
                <button
                  onClick={() => handleSetPartyBuff(null)}
                  className="ml-1 text-stone-400 hover:text-red-400"
                >
                  ×
                </button>
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
              <AddCharacterForm onAdd={handleAddCharacter} />
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
                      onUpdate={handleUpdateCharacter}
                      onDelete={handleDeleteCharacter}
                      onEditStats={setEditingChar}
                      onAddBuff={setAddingBuffChar}
                      onRemoveBuff={handleRemoveBuff}
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
                        onUpdate={handleUpdateCharacter}
                        onDelete={handleDeleteCharacter}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={handleRemoveBuff}
                        allies={allies}
                        onEnemyAttackDamage={handleEnemyAttackDamage}
                      />
                    ) : (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        onUpdate={handleUpdateCharacter}
                        onDelete={handleDeleteCharacter}
                        onEditStats={setEditingChar}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={handleRemoveBuff}
                        allies={allies}
                        onEnemyAttackDamage={handleEnemyAttackDamage}
                      />
                    )
                  ))}
                </div>
              </section>
            )}

            {/* キャラ追加ボタン */}
            <div className="flex flex-col gap-3">
              <AddCharacterForm onAdd={handleAddCharacter} />
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
          onSave={handleUpdateCharacter}
          onClose={() => setEditingChar(null)}
        />
      )}

      {addingBuffChar && (
        <AddBuffModal
          character={addingBuffChar}
          onAdd={handleAddBuff}
          onClose={() => setAddingBuffChar(null)}
        />
      )}

      {showKohoModal && (
        <KohoModal
          partyBuff={partyBuff}
          onSet={handleSetPartyBuff}
          onClose={() => setShowKohoModal(false)}
        />
      )}

      {showTemplateModal && (
        <TemplateSelectModal
          onAdd={handleAddCharacter}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {showBulkBuffModal && (
        <BulkBuffModal
          characters={characters}
          onApply={handleBulkBuffApply}
          onRemoveKoho={handleBulkRemoveKoho}
          onClose={() => setShowBulkBuffModal(false)}
        />
      )}

      <footer className="text-center py-4 text-stone-600 text-sm">
        ルームID: {room?.id} | リアルタイム同期中 🔄
      </footer>
    </div>
  );
}

// ============================================
// メインApp（ルーム管理を含む）
// ============================================
export default function App() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // ルーム入室
  const handleEnterRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  // ルーム退出
  const handleExitRoom = () => {
    setCurrentRoom(null);
  };

  // ルーム未参加 → RoomEntry表示
  if (!currentRoom) {
    return <RoomEntry onEnterRoom={handleEnterRoom} />;
  }

  // ルーム参加中 → 戦闘画面表示
  return (
    <RoomProvider
      roomId={currentRoom.id}
      onExit={handleExitRoom}
    >
      <BattleScreen />
    </RoomProvider>
  );
}
