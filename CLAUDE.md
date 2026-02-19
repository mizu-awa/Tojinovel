# CLAUDE.md - Tojinovel

## 概要

デスクトップアプリ（Wails v2）ベースの脱出ゲーム・ノベルゲーム制作ツール。React + Go構成。Wailsビルドしたバイナリがゲーム制作者に配布される。

- **エディタ**: `editor.html` → `src/editor.jsx` → `src/EditorApp.jsx`（Wails WebView上で動作）
- **デバッグプレイ**: `?debug` パラメータ → `src/GameApp.jsx`（debug prop付き）
- **プレイヤー書き出し**: 埋め込み `dist/player.html`（→ `index.html`）+ `dist/assets/` → プロジェクトフォルダにコピー
- **データ**: プロジェクトフォルダ内 `data/gamedata.json`、セーブは IndexedDB
- **プロジェクト管理**: 起動時にプロジェクト選択画面を表示。複数プロジェクト対応。設定は `%APPDATA%/Tojinovel/config.json`

## コマンド

```bash
npm run build        # プロダクションビルド（Wailsビルド前に必要）
npm run lint         # ESLint
npm run test:run     # Vitest一回実行
```
```powershell
wails dev                              # Wails開発サーバー（推奨）
wails build                            # Wailsアプリビルド
./scripts/use-sample.ps1 event_test    # サンプルデータをpublic/にコピー（wails dev前に実行）
./scripts/build-all.ps1                # リリースビルド＋ZIPパッケージング
```

## 主要ディレクトリ

```
src/
├── GameApp.jsx / EditorApp.jsx    # ルートコンポーネント
├── components/                     # UI（SceneWrap, Hotspots, EventViewer, ItemBox, ItemDrawer, Menu, SaveLoad）
│   └── editor/                     # エディタUI（panels/, settings/, codemirror/, ProjectSelector, FileExplorer）
├── hooks/                          # useGameData, useEventExecution, useEventLines, useMerge, useIndexedDBStorage, audioManager
│   ├── eventExecutionUtils.js      # イベント実行ユーティリティ（テスト対象）
│   └── editor/                     # useEditorData, useUndoRedo, useHandleChange, useSnap, useScenarioEditor
├── services/                       # ストレージ抽象化層（Adapter Pattern）
│   ├── storageService.js           # Adapter管理（setAdapter/getAdapter/storage）
│   ├── wailsAdapter.js             # Wails Goバインディング呼び出し（window.go.services.*）
│   └── httpAdapter.js              # フォールバック用fetchベースAdapter
├── datas/defaultGameData.js        # デフォルトスキーマ
└── theme/Theme.jsx                 # MUIテーマ

# Goバックエンド
main.go                             # Wails v2エントリポイント（embed.FSでdist/を内包）
app.go                              # Wailsアプリライフサイクル管理（startup/domReady）
services/
├── file_service.go                 # ファイルI/O（gamedata.json / イベントファイル / ReadDir等）
├── project_manager.go              # プロジェクト管理・プレイヤー書き出し・設定保存
└── asset_handler.go                # プロジェクトフォルダの画像・音声を相対パスで配信
```

## コーディング規約

- **JS (JSX) のみ**。TypeScript不使用
- **React 19 + Vite 7 + MUI 7 + Emotion**、ES Modules
- **関数コンポーネントのみ**、PascalCaseファイル名、`use`プレフィックスフック
- **Redux/Context不使用**。Propsバケツリレー。`useState`でUI状態、`useRef`で内部状態
- パフォーマンス要のコンポーネントは `React.memo`
- export: `export default function Name()` または `export default memo(Name)`
- スタイル: MUI + Emotion メイン、動的はインラインオブジェクト、`src/index.css`にホバー用ユーティリティクラス
- **コメントは日本語**
- ESLint: `no-unused-vars`は大文字/`_`始まり許可、`react-hooks/recommended`適用
- セクション区切り: `// state-----`, `// ref-----`, `// functions-----`
- Undo/Redo: `structuredClone`スナップショット（gameData + eventBuffer、最大50件）

## ゲームデータ構造

```javascript
{ game: { title, screenSize, startScene, ... },
  variables: [{ name, value }],          // フラグ（値はすべて文字列）
  characters: [{ name, expressions }],
  scenes: [{ name, background, hotspots, directions, visitEvent }],
  items: [{ name, image, have, hotspots }] }
```

## イベントファイル（.txt）

`【ラベル名】`でセクション分割、`//`コメント、`#`コマンド、`名前（表情）「セリフ」`でダイアログ。
テキスト中`[変数名]`で値展開。

### 主要コマンド
```
#フラグ: name = value          // 演算子: =, +, -, *, /, %
#if: var == value              // 比較: ==, !=, <, >, <=, >=, ><（重なり判定）
#else if: var == other          // 論理: かつ/&&, または/||（ANDがOR優先）
#else / #if終了
#ステート変更: シーン名, ホットスポット名, ステート名
#ステート一括変更: シーン名, ステート名
#アイテム入手: name / #アイテム破棄: name
#シーン移動: シーン名
#クリック待ち
#コンソール: メッセージ          // デバッグ出力
```

### ホットスポット
- `state`（現在）+ `states[]`（定義配列）。ステートごとに見た目・イベント定義
- `inputMode`+`inputVariable`: テキスト入力欄化
- `draggable`: ドラッグ移動可、`onDragEnd`でイベント発火、`><`で重なり判定
- `usedItems[]`: アイテム使用時イベント

### 共通部品
game設定で共通シーンを指定→そのホットスポットが全シーンに表示（z-index 1000+）。背景・方向移動・訪問イベントは無視。

### z-index階層
通常シーン500-600 / 共通シーン1000-1100 / 方向ボタン1500 / EventViewer2000+ / Menu3000+

## シナリオエディタ

CodeMirror 6使用（`src/components/editor/codemirror/`）。`useScenarioEditor.js`でバッファ管理（Map、IndexedDB 2秒デバウンスバックアップ）。Undo/Redoと統合。

## テスト

Vitest。テストファイルは`src/**/*.test.js`。主なテスト対象: `eventExecutionUtils.js`。

## データマイグレーション

`useMerge.js`の`mergeDefault`: デフォルト値補完 + 古い形式の自動変換（`defaultGameData.js`基準）。新→旧は非サポート。

## ルール

- **ブランチ**: 新機能は`feature/機能名`で切る
- **ドキュメント**: 機能変更後、CLAUDE.mdとWikiを更新
