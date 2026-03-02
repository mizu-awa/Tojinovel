# CLAUDE.md - Tojinovel

脱出ゲーム・ノベルゲーム制作ツール。React + Go(Wails v2)構成。
詳細は `README.md`,`docs/wiki/` 参照。

## アーキテクチャ要点

- **Wails版**: デスクトップアプリ。`editor.html`→EditorApp / `?debug`→GameApp
- **ブラウザ版**: `VITE_BUILD_MODE=browser`。IndexedDB仮想FS + Service Worker
- **ストレージ抽象化**: Adapter Pattern（`src/services/storageService.js`）で Wails/ブラウザ/http切替

## コマンド

```bash
npm run build          # Wails版フロントエンドビルド（dist/）
npm run build:browser  # ブラウザ版ビルド（dist-browser/）
npm run dev:browser    # ブラウザ版開発サーバー
npm run lint           # ESLint
npm run test:run       # Vitest一回実行
wails dev              # Wails開発サーバー（推奨）
wails build            # Wailsアプリビルド
```

## コーディング規約

- **JS (JSX) のみ**。TypeScript不使用
- **React 19 + Vite 7 + MUI 7 + Emotion**、ES Modules
- **関数コンポーネントのみ**、PascalCaseファイル名、`use`プレフィックスフック
- **Redux/Context不使用**。Propsバケツリレー。`useState`でUI状態、`useRef`で内部状態
- パフォーマンス要は `React.memo`
- export: `export default function Name()` または `export default memo(Name)`
- スタイル: MUI + Emotion メイン、動的はインラインオブジェクト
- **コメントは日本語**
- セクション区切り: `// state-----`, `// ref-----`, `// functions-----`
- Undo/Redo: `structuredClone`スナップショット（gameData + eventBuffer、最大50件）

## テスト

Vitest。`src/**/*.test.js`。主な対象: `eventExecutionUtils.js`

## ルール

- **ブランチ**: 新機能は`feature/機能名`で切る
- **ドキュメント**: 機能変更後、CLAUDE.mdとWikiを更新
