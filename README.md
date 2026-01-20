# SW2.0 戦闘管理システム

ソード・ワールド2.0 TRPG用の戦闘管理Webアプリケーションです。

## 機能

### キャラクター管理
- 味方キャラクターの作成（能力値・技能レベル・装備補正）
- 敵キャラクターの作成（単体 / 複数部位対応）
- HP/MP の管理（マイナスHP対応、気絶・死亡判定）
- テンプレートからの追加（合言葉でGM用隠しキャラ解放）

### バフ/練技システム
- プリセット練技（ガゼルフット、キャッツアイ等）
- カスタムバフの追加
- ラウンド経過で自動カウントダウン
- バフ切れ通知

### 鼓咆（全体バフ）
- 攻撃系鼓咆（物理/魔法ダメージ+）
- 防御系鼓咆（物理/魔法ダメージ軽減）
- 攻撃計算時に自動適用

### 攻撃システム
- 物理/魔法攻撃の切り替え
- ダイスロール入力（リアルダイス対応）
- 威力表からのダメージ計算
- クリティカル連続ロール対応
- 抵抗時の半減計算
- ターゲット選択 → ダメージ自動適用

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

## 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS

## 将来の予定

- Firebase連携によるルーム共有
- リアルタイム同期
- GMによるテンプレート登録
- 合言葉によるキャラ表示制御

## ディレクトリ構成

```
src/
├── App.tsx              # メインアプリ
├── main.tsx             # エントリーポイント
├── index.css            # スタイル
│
├── types/               # 型定義
│   └── index.ts
│
├── data/                # 定数データ
│   ├── index.ts         # エクスポート
│   ├── skills.ts        # 技能定義
│   ├── presets.ts       # プリセット練技・鼓咆
│   ├── powerTable.ts    # 威力表
│   └── templates.ts     # キャラテンプレート
│
├── utils/               # ユーティリティ
│   ├── index.ts         # エクスポート
│   ├── calc.ts          # 各種計算
│   └── dice.ts          # ダイス処理
│
├── components/
│   ├── characters/      # キャラ関連
│   │   ├── index.ts     # エクスポート
│   │   ├── CharacterCard.tsx
│   │   ├── MultiPartEnemyCard.tsx
│   │   ├── AttackSection.tsx  # 攻撃計算UI
│   │   └── BuffBadge.tsx
│   │
│   ├── modals/          # モーダル
│   │   ├── index.ts     # エクスポート
│   │   ├── AddCharacterForm.tsx
│   │   ├── CharacterEditModal.tsx
│   │   ├── AddBuffModal.tsx
│   │   ├── KohoModal.tsx
│   │   └── TemplateSelectModal.tsx
│   │
│   └── ui/              # 共通UI
│       ├── index.ts     # エクスポート
│       └── StatBar.tsx
│
└── legacy/              # レガシーコード（参照用）
```

## ライセンス

MIT
