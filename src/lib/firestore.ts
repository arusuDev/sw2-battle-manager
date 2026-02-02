// ============================================
// Firestore ルーム操作
// ============================================

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Room,
  RoomData,
  RoomMember,
  RoomMemberData,
  CreateRoomInput,
  JoinRoomInput,
} from '../types/room';

// ============================================
// ユーティリティ
// ============================================

/**
 * 6文字のランダムなルームIDを生成
 * 紛らわしい文字（0,O,I,l）を除外
 */
export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * ルームIDの存在チェック
 */
export const checkRoomExists = async (roomId: string): Promise<boolean> => {
  const roomRef = doc(db, 'rooms', roomId.toUpperCase());
  const roomSnap = await getDoc(roomRef);
  return roomSnap.exists();
};

// ============================================
// ルーム操作
// ============================================

/**
 * ルーム作成
 */
export const createRoom = async (
  input: CreateRoomInput,
  userId: string
): Promise<Room> => {
  // ユニークなルームIDを生成（重複チェック）
  let roomId = generateRoomId();
  let attempts = 0;
  while (await checkRoomExists(roomId) && attempts < 10) {
    roomId = generateRoomId();
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('ルームIDの生成に失敗しました。再度お試しください。');
  }

  const now = serverTimestamp();

  // ルームデータ
  const roomData: RoomData = {
    name: input.name,
    gmUserId: userId,
    currentRound: 1,
    partyBuff: null,
    passwords: [],
    createdAt: now as Timestamp,
    updatedAt: now as Timestamp,
  };

  // ルーム作成
  const roomRef = doc(db, 'rooms', roomId);
  await setDoc(roomRef, roomData);

  // GMをメンバーとして追加
  const memberData: RoomMemberData = {
    odName: input.gmName,
    isGM: true,
    unlockedPasswords: [],
    joinedAt: now as Timestamp,
  };

  const memberRef = doc(db, 'rooms', roomId, 'members', userId);
  await setDoc(memberRef, memberData);

  return {
    id: roomId,
    ...roomData,
  } as Room;
};

/**
 * ルーム取得
 */
export const getRoom = async (roomId: string): Promise<Room | null> => {
  const roomRef = doc(db, 'rooms', roomId.toUpperCase());
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return null;
  }

  return {
    id: roomSnap.id,
    ...roomSnap.data(),
  } as Room;
};

/**
 * ルーム参加
 */
export const joinRoom = async (
  input: JoinRoomInput,
  userId: string
): Promise<Room> => {
  const roomId = input.roomId.toUpperCase();

  // ルーム存在チェック
  const room = await getRoom(roomId);
  if (!room) {
    throw new Error('ルームが見つかりません。IDを確認してください。');
  }

  // 既存メンバーかチェック
  const memberRef = doc(db, 'rooms', roomId, 'members', userId);
  const memberSnap = await getDoc(memberRef);

  if (memberSnap.exists()) {
    // 既に参加済み → 名前だけ更新
    await updateDoc(memberRef, {
      odName: input.playerName,
    });
  } else {
    // 新規参加
    const memberData: RoomMemberData = {
      odName: input.playerName,
      isGM: false,
      unlockedPasswords: [],
      joinedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(memberRef, memberData);
  }

  return room;
};

/**
 * ルーム退出
 */
export const leaveRoom = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const memberRef = doc(db, 'rooms', roomId, 'members', userId);
  await deleteDoc(memberRef);
};

// ============================================
// リアルタイムリスナー
// ============================================

/**
 * ルーム情報のリアルタイム監視
 */
export const subscribeToRoom = (
  roomId: string,
  callback: (room: Room | null) => void
) => {
  const roomRef = doc(db, 'rooms', roomId);

  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback({
        id: snap.id,
        ...snap.data(),
      } as Room);
    } else {
      callback(null);
    }
  });
};

/**
 * メンバー一覧のリアルタイム監視
 */
export const subscribeToMembers = (
  roomId: string,
  callback: (members: RoomMember[]) => void
) => {
  const membersRef = collection(db, 'rooms', roomId, 'members');

  return onSnapshot(membersRef, (snap) => {
    const members = snap.docs.map((doc) => ({
      odId: doc.id,
      ...doc.data(),
    })) as RoomMember[];
    callback(members);
  });
};

// ============================================
// ラウンド管理
// ============================================

/**
 * ラウンドを進める
 */
export const advanceRound = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません');
  }

  const currentRound = roomSnap.data().currentRound || 1;

  await updateDoc(roomRef, {
    currentRound: currentRound + 1,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 鼓咆（全体バフ）を設定
 */
export const setPartyBuff = async (
  roomId: string,
  partyBuff: Room['partyBuff']
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);

  await updateDoc(roomRef, {
    partyBuff,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// GM管理
// ============================================

/**
 * GMに昇格する（自分のメンバードキュメントのisGMフラグを更新）
 * ※ルームドキュメントの更新はセキュリティルールで制限されるため、メンバーのフラグのみ変更
 */
export const promoteToGM = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const memberRef = doc(db, 'rooms', roomId, 'members', userId);
  await updateDoc(memberRef, {
    isGM: true,
  });
};

// ============================================
// キャラクター管理
// ============================================

import type { Character, CharacterTemplate } from '../types';

// ============================================
// テンプレート管理
// ============================================

/**
 * カスタムテンプレートを追加
 */
export const addCustomTemplate = async (
  roomId: string,
  template: CharacterTemplate
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません');
  }

  const currentTemplates = roomSnap.data().customTemplates || [];
  await updateDoc(roomRef, {
    customTemplates: [...currentTemplates, template],
    updatedAt: serverTimestamp(),
  });
};

/**
 * キャラクターを追加
 */
export const addCharacter = async (
  roomId: string,
  character: Character,
  ownerId: string | null = null
): Promise<void> => {
  const charRef = doc(db, 'rooms', roomId, 'characters', character.id);

  await setDoc(charRef, {
    ...character,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * キャラクターを更新
 */
export const updateCharacter = async (
  roomId: string,
  character: Character
): Promise<void> => {
  const charRef = doc(db, 'rooms', roomId, 'characters', character.id);

  await updateDoc(charRef, {
    ...character,
    updatedAt: serverTimestamp(),
  });
};

/**
 * キャラクターを削除
 */
export const deleteCharacter = async (
  roomId: string,
  characterId: string
): Promise<void> => {
  const charRef = doc(db, 'rooms', roomId, 'characters', characterId);
  await deleteDoc(charRef);
};

/**
 * キャラクター一覧のリアルタイム監視
 */
export const subscribeToCharacters = (
  roomId: string,
  callback: (characters: Character[]) => void
) => {
  const charsRef = collection(db, 'rooms', roomId, 'characters');

  return onSnapshot(charsRef, (snap) => {
    const characters = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Character[];
    callback(characters);
  });
};
