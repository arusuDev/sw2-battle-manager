// ============================================
// ルームコンテキスト（状態管理）
// ============================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  subscribeToRoom,
  subscribeToMembers,
  subscribeToCharacters,
  leaveRoom,
  advanceRound,
  setPartyBuff,
  addCharacter as addCharacterToFirestore,
  updateCharacter as updateCharacterToFirestore,
  deleteCharacter as deleteCharacterFromFirestore,
} from '../lib/firestore';
import type { Room, RoomMember, RoomState } from '../types/room';
import type { Character, PartyBuff, Buff } from '../types';
import { isMultiPartEnemy } from '../types';

// ============================================
// コンテキスト定義
// ============================================

interface RoomContextValue extends RoomState {
  // アクション
  exitRoom: () => Promise<void>;
  nextRound: () => Promise<void>;
  updatePartyBuff: (buff: PartyBuff | null) => Promise<void>;
  // キャラクター操作
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (character: Character) => Promise<void>;
  deleteCharacter: (characterId: string) => Promise<void>;
  // バフ操作
  addBuff: (charId: string, buff: Buff) => Promise<void>;
  removeBuff: (charId: string, buffId: string, partId?: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextValue | null>(null);

// ============================================
// プロバイダー
// ============================================

interface RoomProviderProps {
  roomId: string;
  children: React.ReactNode;
  onExit: () => void;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({
  roomId,
  children,
  onExit,
}) => {
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 現在のメンバー情報
  const currentMember = members.find((m) => m.odId === user?.uid) || null;
  const isGM = room?.gmUserId === user?.uid;

  // ルーム情報の購読
  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    // ルーム情報
    const unsubRoom = subscribeToRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setError(null);
      } else {
        setError(new Error('ルームが見つかりません'));
      }
      setLoading(false);
    });

    // メンバー情報
    const unsubMembers = subscribeToMembers(roomId, (memberData) => {
      setMembers(memberData);
    });

    // キャラクター情報
    const unsubCharacters = subscribeToCharacters(roomId, (characterData) => {
      setCharacters(characterData);
    });

    return () => {
      unsubRoom();
      unsubMembers();
      unsubCharacters();
    };
  }, [roomId]);

  // ルーム退出
  const exitRoom = useCallback(async () => {
    if (!user || !roomId) return;

    try {
      await leaveRoom(roomId, user.uid);
      onExit();
    } catch (err) {
      console.error('退出エラー:', err);
    }
  }, [user, roomId, onExit]);

  // ラウンド進行
  const nextRound = useCallback(async () => {
    if (!roomId) return;

    try {
      await advanceRound(roomId);
    } catch (err) {
      console.error('ラウンド進行エラー:', err);
    }
  }, [roomId]);

  // 鼓咆更新
  const updatePartyBuff = useCallback(async (buff: PartyBuff | null) => {
    if (!roomId) return;

    try {
      await setPartyBuff(roomId, buff);
    } catch (err) {
      console.error('鼓咆更新エラー:', err);
    }
  }, [roomId]);

  // ============================================
  // キャラクター操作
  // ============================================

  // キャラクター追加
  const addCharacter = useCallback(async (character: Character) => {
    if (!roomId || !user) return;

    try {
      // 味方キャラはユーザーがオーナー、敵はnull（GMが管理）
      const ownerId = character.type === 'ally' ? user.uid : null;
      await addCharacterToFirestore(roomId, character, ownerId);
    } catch (err) {
      console.error('キャラクター追加エラー:', err);
    }
  }, [roomId, user]);

  // キャラクター更新
  const updateCharacter = useCallback(async (character: Character) => {
    if (!roomId) return;

    try {
      await updateCharacterToFirestore(roomId, character);
    } catch (err) {
      console.error('キャラクター更新エラー:', err);
    }
  }, [roomId]);

  // キャラクター削除
  const deleteCharacter = useCallback(async (characterId: string) => {
    if (!roomId) return;

    try {
      await deleteCharacterFromFirestore(roomId, characterId);
    } catch (err) {
      console.error('キャラクター削除エラー:', err);
    }
  }, [roomId]);

  // ============================================
  // バフ操作
  // ============================================

  // バフ追加
  const addBuff = useCallback(async (charId: string, buff: Buff) => {
    if (!roomId) return;

    const character = characters.find(c => c.id === charId);
    if (!character) return;

    const updatedCharacter = {
      ...character,
      buffs: [...(character.buffs || []), buff],
    };

    try {
      await updateCharacterToFirestore(roomId, updatedCharacter);
    } catch (err) {
      console.error('バフ追加エラー:', err);
    }
  }, [roomId, characters]);

  // バフ削除（部位対応）
  const removeBuff = useCallback(async (charId: string, buffId: string, partId?: string) => {
    if (!roomId) return;

    const character = characters.find(c => c.id === charId);
    if (!character) return;

    let updatedCharacter = { ...character };

    if (partId && isMultiPartEnemy(character)) {
      // 部位バフ削除
      const updatedParts = character.parts.map(part => {
        if (part.id === partId) {
          return {
            ...part,
            buffs: (part.buffs || []).filter(b => b.id !== buffId),
          };
        }
        return part;
      });
      updatedCharacter = { ...updatedCharacter, parts: updatedParts };
    } else {
      // 本体バフ削除
      updatedCharacter.buffs = (character.buffs || []).filter(b => b.id !== buffId);
    }

    try {
      await updateCharacterToFirestore(roomId, updatedCharacter);
    } catch (err) {
      console.error('バフ削除エラー:', err);
    }
  }, [roomId, characters]);

  const value: RoomContextValue = {
    room,
    members,
    characters,
    currentMember,
    isGM,
    loading,
    error,
    exitRoom,
    nextRound,
    updatePartyBuff,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addBuff,
    removeBuff,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

// ============================================
// フック
// ============================================

export const useRoom = (): RoomContextValue => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};
