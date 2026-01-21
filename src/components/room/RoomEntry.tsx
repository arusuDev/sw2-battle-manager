// ============================================
// ルーム作成・参加画面
// ============================================

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createRoom, joinRoom } from '../../lib/firestore';
import type { Room } from '../../types/room';

interface RoomEntryProps {
  onEnterRoom: (room: Room, isGM: boolean) => void;
}

type Mode = 'select' | 'create' | 'join';

export const RoomEntry: React.FC<RoomEntryProps> = ({ onEnterRoom }) => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 作成フォーム
  const [roomName, setRoomName] = useState('');
  const [gmName, setGmName] = useState('');

  // 参加フォーム
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  // ルーム作成
  const handleCreate = async () => {
    if (!user) return;
    if (!roomName.trim() || !gmName.trim()) {
      setError('ルーム名と表示名を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const room = await createRoom(
        { name: roomName.trim(), gmName: gmName.trim() },
        user.uid
      );
      onEnterRoom(room, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ルーム参加
  const handleJoin = async () => {
    if (!user) return;
    if (!roomId.trim() || !playerName.trim()) {
      setError('ルームIDと表示名を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const room = await joinRoom(
        { roomId: roomId.trim(), playerName: playerName.trim() },
        user.uid
      );
      const isGM = room.gmUserId === user.uid;
      onEnterRoom(room, isGM);
    } catch (err) {
      setError(err instanceof Error ? err.message : '参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 認証中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-stone-400">接続中...</div>
      </div>
    );
  }

  // 認証エラー
  if (authError) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">
          接続エラー: {authError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-500 mb-2">
            ⚔️ SW2.0 戦闘管理
          </h1>
          <p className="text-stone-400 text-sm">
            ルームを作成または参加してください
          </p>
        </div>

        {/* モード選択 */}
        {mode === 'select' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-amber-700 hover:bg-amber-600 
                text-white rounded-lg font-medium transition-colors"
            >
              🎲 ルームを作成（GM）
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-stone-700 hover:bg-stone-600 
                text-white rounded-lg font-medium transition-colors"
            >
              🚪 ルームに参加（PL）
            </button>
          </div>
        )}

        {/* ルーム作成フォーム */}
        {mode === 'create' && (
          <div className="bg-stone-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-stone-200 mb-4">
              ルームを作成
            </h2>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                ルーム名
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="例: 第5話 ゴブリン退治"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 
                  rounded text-stone-200 placeholder-stone-500
                  focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                あなたの表示名
              </label>
              <input
                type="text"
                value={gmName}
                onChange={(e) => setGmName(e.target.value)}
                placeholder="例: GM田中"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 
                  rounded text-stone-200 placeholder-stone-500
                  focus:outline-none focus:border-amber-600"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMode('select');
                  setError(null);
                }}
                className="flex-1 py-3 bg-stone-700 text-stone-300 rounded
                  hover:bg-stone-600 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 py-3 bg-amber-700 text-white rounded
                  hover:bg-amber-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '作成中...' : '作成する'}
              </button>
            </div>
          </div>
        )}

        {/* ルーム参加フォーム */}
        {mode === 'join' && (
          <div className="bg-stone-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-stone-200 mb-4">
              ルームに参加
            </h2>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                ルームID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="例: ABC123"
                maxLength={6}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 
                  rounded text-stone-200 placeholder-stone-500 text-center
                  text-xl tracking-widest font-mono uppercase
                  focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                あなたの表示名
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="例: 山田"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 
                  rounded text-stone-200 placeholder-stone-500
                  focus:outline-none focus:border-amber-600"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMode('select');
                  setError(null);
                }}
                className="flex-1 py-3 bg-stone-700 text-stone-300 rounded
                  hover:bg-stone-600 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 py-3 bg-amber-700 text-white rounded
                  hover:bg-amber-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '参加中...' : '参加する'}
              </button>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="text-center mt-8 text-stone-500 text-xs">
          SW2.0 TRPG 戦闘管理システム
        </div>
      </div>
    </div>
  );
};
