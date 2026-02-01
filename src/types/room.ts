// ============================================
// ルーム関連の型定義
// ============================================

import { Timestamp } from 'firebase/firestore';
import type { Character, CharacterTemplate, PartyBuff } from './index';

// ルーム情報
export interface Room {
  id: string;
  name: string;
  gmUserId: string;
  currentRound: number;
  partyBuff: PartyBuff | null;
  passwords: string[];  // 合言葉リスト
  customTemplates?: CharacterTemplate[];  // ユーザー登録テンプレート
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore保存用（idなし）
export type RoomData = Omit<Room, 'id'>;

// ルームメンバー
export interface RoomMember {
  odId: string;
  odName: string;
  isGM: boolean;
  unlockedPasswords: string[];
  joinedAt: Timestamp;
}

// Firestore保存用
export type RoomMemberData = Omit<RoomMember, 'odId'>;

// ルーム内キャラクター（既存のCharacterを拡張）
export type RoomCharacter = Character & {
  ownerId: string | null;  // null = 敵（GMが操作）
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// ルーム作成時の入力
export interface CreateRoomInput {
  name: string;
  gmName: string;
}

// ルーム参加時の入力
export interface JoinRoomInput {
  roomId: string;
  playerName: string;
}

// ルームコンテキストの状態
export interface RoomState {
  room: Room | null;
  members: RoomMember[];
  characters: Character[];  // UIではCharacterとして扱う
  currentMember: RoomMember | null;
  isGM: boolean;
  isGMPresent: boolean;  // GMがメンバー一覧に存在するか
  loading: boolean;
  error: Error | null;
}
