// ============================================
// ルームヘッダー（ルーム情報表示）
// ============================================

import { useState } from 'react';
import { useRoom } from '../../contexts/RoomContext';

export const RoomHeader: React.FC = () => {
  const { room, members, currentMember, isGM, isGMPresent, exitRoom, nextRound, becomeGM } = useRoom();
  const [showMembers, setShowMembers] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showGMConfirm, setShowGMConfirm] = useState(false);

  if (!room) return null;

  return (
    <>
      {/* ヘッダー */}
      <div className="bg-stone-800 border-b border-stone-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左: ルーム情報 */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">{room.name}</span>
                {isGM && (
                  <span className="text-xs bg-amber-700 text-amber-100 px-2 py-0.5 rounded">
                    GM
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <span>ID: {room.id}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(room.id)}
                  className="text-stone-500 hover:text-stone-300"
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* 右: ラウンド & メンバー */}
          <div className="flex items-center gap-4">
            {/* ラウンド */}
            <div className="text-center">
              <div className="text-xs text-stone-400">ラウンド</div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-white">
                  {room.currentRound}
                </span>
                {isGM && (
                  <button
                    onClick={nextRound}
                    className="text-stone-400 hover:text-amber-400 ml-1"
                    title="次のラウンドへ"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>

            {/* メンバー数 */}
            <button
              onClick={() => setShowMembers(true)}
              className="text-center hover:bg-stone-700 rounded px-2 py-1"
            >
              <div className="text-xs text-stone-400">参加者</div>
              <div className="text-lg font-bold text-white">
                {members.length}
              </div>
            </button>

            {/* 退出ボタン */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-stone-400 hover:text-red-400 p-2"
              title="ルームを退出"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* GM不在通知バー */}
      {!isGMPresent && !isGM && (
        <div className="bg-amber-900/50 border-b border-amber-700 px-4 py-2 flex items-center justify-between">
          <span className="text-amber-200 text-sm">
            GMが不在です。GMに昇格してルームを管理できます。
          </span>
          <button
            onClick={() => setShowGMConfirm(true)}
            className="text-sm bg-amber-700 text-amber-100 px-3 py-1 rounded
              hover:bg-amber-600 transition-colors"
          >
            GMに昇格
          </button>
        </div>
      )}

      {/* メンバー一覧モーダル */}
      {showMembers && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMembers(false)}
        >
          <div
            className="bg-stone-800 rounded-lg w-full max-w-sm max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-stone-700">
              <h3 className="font-bold text-stone-200">参加者一覧</h3>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-72">
              {members.map((member) => (
                <div
                  key={member.odId}
                  className={`flex items-center justify-between px-3 py-2 rounded
                    ${member.odId === currentMember?.odId 
                      ? 'bg-amber-900/30 border border-amber-700' 
                      : 'bg-stone-700'
                    }`}
                >
                  <span className="text-stone-200">{member.odName}</span>
                  <div className="flex items-center gap-2">
                    {member.isGM && (
                      <span className="text-xs bg-amber-700 text-amber-100 px-2 py-0.5 rounded">
                        GM
                      </span>
                    )}
                    {member.odId === currentMember?.odId && (
                      <span className="text-xs text-stone-400">あなた</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-stone-700 space-y-2">
              {!isGMPresent && !isGM && (
                <button
                  onClick={() => {
                    setShowMembers(false);
                    setShowGMConfirm(true);
                  }}
                  className="w-full py-2 bg-amber-700 text-amber-100 rounded
                    hover:bg-amber-600 transition-colors"
                >
                  GMに昇格する
                </button>
              )}
              <button
                onClick={() => setShowMembers(false)}
                className="w-full py-2 bg-stone-700 text-stone-300 rounded
                  hover:bg-stone-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退出確認モーダル */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="bg-stone-800 rounded-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-stone-200 mb-4">
              ルームを退出しますか？
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              {isGM 
                ? 'GMが退出してもルームは残ります。後から同じIDで再参加できます。'
                : '後から同じIDで再参加できます。'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-stone-700 text-stone-300 rounded
                  hover:bg-stone-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  exitRoom();
                  setShowExitConfirm(false);
                }}
                className="flex-1 py-3 bg-red-700 text-white rounded
                  hover:bg-red-600 transition-colors"
              >
                退出する
              </button>
            </div>
          </div>
        </div>
      )}
      {/* GM昇格確認モーダル */}
      {showGMConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowGMConfirm(false)}
        >
          <div
            className="bg-stone-800 rounded-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-stone-200 mb-4">
              GMに昇格しますか？
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              GMに昇格すると、ラウンド進行や敵キャラクターの管理など、ルームの管理権限を取得します。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGMConfirm(false)}
                className="flex-1 py-3 bg-stone-700 text-stone-300 rounded
                  hover:bg-stone-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  becomeGM();
                  setShowGMConfirm(false);
                }}
                className="flex-1 py-3 bg-amber-700 text-white rounded
                  hover:bg-amber-600 transition-colors"
              >
                GMに昇格する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
