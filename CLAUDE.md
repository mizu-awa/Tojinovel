# CLAUDE.md - Tojinovel 開発ガイド

## プロジェクト概要

Tojinovel（とじのべる）は、ブラウザベースの脱出ゲーム・ノベルゲーム制作ツール。
React フロントエンド（ゲームプレイヤー + ビジュアルエディタ）と Go バックエンドで構成される。
ビルド成果物（dist/）がゲーム制作者に配布され、制作者はそれを使ってゲームを作成する。

- **ゲームプレイヤー**: `index.html` → `src/main.jsx` → `src/GameApp.jsx`
- **エディタ**: `editor.html` → `src/editor.jsx` → `src/EditorApp.jsx`
- **デバッグプレイヤー**: `debug.html` → `src/debug.jsx` → `src/GameApp.jsx`（debug prop付き）
- **サーバー**: `server/server.go`（ファイル配信 + JSON保存、ポート 42736）

ゲームデータは `public/data/gamedata.json` に一元管理され、セーブデータは IndexedDB に保存される。

## ビルド・開発コマンド

```bash
npm run dev        # Vite 開発サーバー起動
npm run build      # プロダクションビルド（prebuild でコミットハッシュ埋め込み）
npm run lint       # ESLint 実行
npm run preview    # ビルド成果物のプレビュー
```

Go サーバーのビルド:
```powershell
./server/build-all.ps1    # Windows/macOS/Linux 向けクロスコンパイル
./server/dev.ps1          # 開発用サーバー起動
```

テスト:
```bash
npm run test              # Vitest ウォッチモードで実行
npm run test:run          # 一回だけ実行
```

## イベントテスト

サンプルデータを使ってイベントの動作確認を行う手順。

### クイックスタート（一括起動）

```powershell
./scripts/dev-test.ps1 event_test
```

これだけでサンプルデータのコピーと開発サーバー起動が完了。
ブラウザで http://localhost:5173/debug.html を開いてテスト。

### 個別に実行する場合

```powershell
# 1. テスト用サンプルデータを public/data にコピー
./scripts/use-sample.ps1 event_test

# 2. 開発サーバーを起動（別々のターミナルで実行）
npm run dev              # フロントエンド（Vite、ポート 5173）
./server/dev.ps1         # バックエンド（Go、ポート 42736）

# 3. ブラウザでデバッグプレイヤーを開く
# http://localhost:5173/debug.html
```

### use-sample.ps1

`samples/` フォルダ内のサンプルデータを `public/data` にコピーするスクリプト。

```powershell
# 利用可能なサンプル一覧を表示
./scripts/use-sample.ps1

# 特定のサンプルを使用
./scripts/use-sample.ps1 event_test
./scripts/use-sample.ps1 simple_demo
```

### 利用可能なサンプル

- `event_test`: イベントコマンドのテスト用
- `simple_demo`: 基本的なゲームデモ

## ディレクトリ構成

```
src/
├── GameApp.jsx                  # ゲームプレイヤーのルートコンポーネント
├── EditorApp.jsx                # エディタのルートコンポーネント
├── components/                  # UIコンポーネント
│   ├── SceneWrap.jsx            # シーン表示
│   ├── Hotspots.jsx             # ホットスポット（クリック領域）
│   ├── EventViewer.jsx          # イベント実行・テキスト表示
│   ├── ItemBox.jsx              # アイテムボックス
│   ├── ItemDrawer.jsx           # アイテム詳細ドロワー
│   ├── Menu.jsx / SaveLoad.jsx  # メニュー・セーブロード
│   └── editor/                  # エディタ専用コンポーネント
│       ├── panels/              # パネル（Settings, Scene, Characters）
│       ├── settings/            # 各種設定フォーム（17ファイル）
│       ├── codemirror/          # CodeMirror言語・テーマ定義
│       ├── SnapOverlay.jsx     # ガイドライン描画（スナップ時のマゼンタ線）
│       └── FormField.jsx 等     # 共通UIパーツ
├── hooks/                       # カスタムフック
│   ├── useGameData.js           # ゲームデータ読み込み・シーン管理
│   ├── useMerge.js              # デフォルト値補完・データマイグレーション
│   ├── useEventExecution.js     # イベントコマンド実行エンジン
│   ├── eventExecutionUtils.js   # イベント実行用ユーティリティ関数（テスト対象）
│   ├── eventExecutionUtils.test.js  # ユニットテスト
│   ├── useEventLines.js         # イベントテキストパーサー
│   ├── useIndexedDBStorage.js   # IndexedDB セーブ/ロード
│   ├── audioManager.js          # Howler.js ベースの音声管理
│   └── editor/                  # エディタ専用フック
│       ├── useEditorData.js     # エディタ状態管理
│       ├── useUndoRedo.js       # Undo/Redo（履歴50件、gameData + eventBuffer）
│       ├── useHandleChange.js   # ネストされたデータの更新ハンドラ
│       ├── useSnap.js          # ガイドラインスナップ計算ロジック
│       └── useScenarioEditor.js # シナリオエディタ（イベントファイル編集）
├── datas/
│   └── defaultGameData.js       # デフォルトスキーマ定義
└── theme/
    └── Theme.jsx                # MUI テーマ（ライト/ダーク）
```

## コーディング規約

### 言語・フレームワーク

- **JavaScript (JSX)** のみ使用。TypeScript は不使用
- **React 19** + **Vite 7** + **MUI 7** + **Emotion**
- ES Modules（`"type": "module"`）

### ESLint ルール

- `eslint.config.js` で設定（ESLint 9 flat config）
- `no-unused-vars`: 大文字またはアンダースコア始まりの変数は許可（`varsIgnorePattern: '^[A-Z_]'`）
- `react-hooks/recommended` と `react-refresh` プラグインを適用

### コンポーネント

- **関数コンポーネントのみ**（クラスコンポーネント不使用）
- ファイル名は **PascalCase**（`ItemBox.jsx`, `SceneWrap.jsx`）
- フック名は **camelCase** で `use` プレフィックス（`useGameData.js`）
- パフォーマンスが必要なコンポーネントには `React.memo` を適用
- export は `export default function ComponentName()` または `export default memo(ComponentName)`
- コメントは日本語で記述

### インポート順序

```javascript
// React
import { useState, useEffect, useRef } from "react";

// hooks
import { useGameData } from "./hooks/useGameData";

// components
import SceneWrap from "./components/SceneWrap.jsx";
```

### 状態管理

- **Redux / Context API は不使用**。Props のバケツリレーで状態を渡す
- `useState` で UI 状態、`useRef` で描画に影響しない内部状態（イベント実行深度、タイマー等）を管理
- `sessionStorage` でエディタ状態の永続化
- `IndexedDB`（idb ライブラリ）でゲームセーブデータの永続化
- エディタの Undo/Redo は `structuredClone` によるスナップショット方式（最大50件）
  - スナップショットには `gameData` と `eventBuffer`（シナリオエディタのファイル内容）の両方を含む

### スタイリング

- **MUI コンポーネント + Emotion** がメイン
- 動的スタイルは **インラインスタイルオブジェクト**
- グローバルCSS（`src/index.css`）にホバーエフェクト用ユーティリティクラス（`.hoverBt`, `.hoverDk`, `.hoverOp` 等）とアニメーション keyframes を定義
- エディタの小さなUI部品は `styled()` で Emotion ベースのスタイル付きコンポーネントを作成

### セクション区切り

大きなコンポーネントやフックでは、コメントでセクション区切りを入れる:
```javascript
// state-----------------------------------------------------------------------------------------
const [selectedItem, selectItem] = useState(null);

// ref-------------------------------------------------------------------------------------------
const ref = useRef();

// functions-----------------------------------------------------------------------------------------
const executeEvent = () => { ... };
```

## 脱出ゲーム：フラグ・状態管理

### ゲームデータの全体構造

```javascript
{
  game: { title, screenSize, startScene, ... },  // ゲーム設定
  variables: [{ name, value }],                   // フラグ（変数）
  characters: [{ name, expressions }],            // キャラクター
  scenes: [{ name, background, hotspots, ... }],  // シーン（部屋）
  items: [{ name, image, have, hotspots }]         // アイテム
}
```

### フラグ（variables）

- `gameData.variables[]` 配列で管理。各要素は `{ name: string, value: string }`
- **値はすべて文字列**として保存される（数値も `"0"`, `"1"` 等）
- イベントファイル（`.txt`）から `#フラグ:` コマンドで操作

```
#フラグ: score = 100
#フラグ: health - 10
#フラグ: attempts + 1
```

- 演算子: `=`（代入）, `+`（加算/文字列結合）, `-`, `*`, `/`（切り捨て除算）, `%`（剰余）
- テキスト中で `[変数名]` と書くと値が展開される

### 条件分岐

```
#if: variable_name == value
    実行するコマンド
#else if: variable_name == other_value
    別の条件のコマンド
#else
    代替コマンド
#if終了
```

- 比較演算子: `==`, `!=`, `<`, `>`, `<=`, `>=`, `><`（ホットスポット重なり判定）
- 論理演算子: `かつ` / `&&`（AND）、`または` / `||`（OR）
  - AND は OR より優先される（例: `A || B && C` は `A || (B && C)` と同じ）
  - 例: `#if: key == 1 かつ door == 0`、`#if: key == 1 || magic == 1`
- `#else if:` で追加の条件分岐が可能（複数連結可）
- `><` 演算子: 左辺と右辺にホットスポット名を指定し、矩形が重なっていれば真
  - アイテムドロワーが開いていればアイテムの、閉じていればシーンのホットスポットを参照
  - 非表示ステートやホットスポット不在の場合は偽
- ネスト可能（`ifDepth` ref でスタック管理、`ifMatched` Map でブランチマッチ状態を追跡）

### ホットスポットのステート

- 各ホットスポットは `state`（現在のステート名）と `states[]`（ステート定義の配列）を持つ
- ステートごとに見た目（x, y, width, height, background, style）、クリックイベント、アイテム使用イベントが定義される
- ステートの `inputMode: true` + `inputVariable` を設定すると、ホットスポットがテキスト入力欄になる（入力値は指定変数にリアルタイム反映）
- ステートの `draggable: true` を設定すると、プレイヤーがホットスポットをドラッグ移動できる
  - ドラッグ完了時、ステートの x/y が直接更新される（セーブ/ロードで位置が永続化）
  - `onDragEnd: { file, label }` でドラッグ完了時に発火するイベントを指定可能
  - 重なり判定は `#if` の `><` 演算子で行う（後述）
- イベントコマンドでステートを切り替える:

```
#ステート変更: シーン名, ホットスポット名, ステート名
#ステート一括変更: シーン名, ステート名
```

### アイテム管理

- `item.have`（boolean）で所持判定
- 取得/破棄はイベントコマンドで制御:

```
#アイテム入手: アイテム名
#アイテム破棄: アイテム名
```

- アイテムにもホットスポットとステートがあり、アイテム詳細画面でのインタラクションを定義
- ホットスポットの `usedItems[]` で「特定アイテム使用時のイベント」を設定可能

### シーン遷移

- `scene.directions` の4方向（top, right, bottom, left）にターゲットシーン名を設定
- `scene.visitEvent` でシーン訪問時の自動イベントを指定
- イベントからの直接遷移: `#シーン移動: シーン名`

### セーブ/ロード

- IndexedDB に全ゲーム状態（gameData + イベント実行位置 + UI状態）を保存
- オートセーブ対応（1.5秒デバウンス）
- セーブデータには `gameData`, `currentSceneName`, `selectedItem`, イベント実行状態（`ifDepth`, `opDepth` 等）が含まれる

### イベントファイル形式

- `.txt` ファイルに記述。`【ラベル名】` でセクション分割
- `//` でコメント
- `#` で始まる行はコマンド
- `名前（表情）「セリフ」` でキャラクターダイアログ
- `#クリック待ち` でプレイヤーのクリック待ち

### デバッグコンソール

- `#コンソール:` コマンドでデバッグ出力を行う
- デバッグプレイヤー（`debug.html`）の「コンソール」タブに出力が表示される
- ブラウザの `console.log` にも同時に出力される
- テキスト中の `[変数名]` は値に展開される

```
#フラグ: score = 42
#コンソール: スコアは[score]です
// → デバッグコンソールに「スコアは42です」と表示
```

- 実装: `useEventExecution.js` で `onConsoleLog` コールバック経由で `GameApp.jsx` の `consoleLogs` state に追加
- UI: `DebugConsole.jsx`（タイムスタンプ付きログ一覧、クリアボタン）

### シナリオエディタ

エディタ内でイベントファイル（.txt）を直接編集できる機能。

**アーキテクチャ:**
- `useScenarioEditor.js`: バッファ管理、fetch、IndexedDB、保存ロジック
- `ScenarioEditor.jsx`: UIコンポーネント（memo化、CodeMirrorエディタ）
- `server.go`: `POST /save-event` エンドポイント

**CodeMirror 6:**
シナリオエディタでは CodeMirror 6 を使用してシンタックスハイライトと入力補完を提供。
関連ファイルは `src/components/editor/codemirror/` に配置:
- `eventLanguage.js`: イベントファイル用カスタム言語定義（StreamLanguage）
  - トークン: `#コマンド`, `【ラベル】`, `「セリフ」`, `[変数]`, `// コメント`, `キャラ名（表情）` 等
- `eventTheme.js`: エディタのテーマ定義（背景色、フォント、トークン色）
- `eventCompletion.js`: 入力補完（コマンド、ラベル、変数名等）
- `eventBrackets.js`: ブラケット（括弧）のマッチング設定

**バッファ管理:**
- `eventBufferRef = useRef(new Map())` でファイル内容をメモリ上に保持
- key: ファイルパス（`"./events/room1.txt"`）, value: `{ content: string, dirty: boolean }`
- IndexedDB に2秒デバウンスでバックアップ（クラッシュ対策）

**Undo/Redo統合:**
- `useUndoRedo` のスナップショットに `gameData` と `eventBuffer` の両方を含める
- シナリオエディタの `onBeforeTextChange` コールバックで変更前スナップショットを取得
- 循環依存解決: `onBeforeTextChangeRef` を使用してフック間でコールバックを共有

**注意点:**
- CodeMirrorは `EditorView` を `useRef` で保持し、`useEffect` でコンテンツを同期
- `pendingContentRef` パターン: エディタマウント前のコンテンツを保持し、マウント時に適用
- ファイルのフェッチ後にパスが変わっていたら結果を破棄（高速切替対策）

### よくある脱出ゲームのパターン

**フラグで進行管理:**
```
#フラグ: puzzle_solved = 1
#if: puzzle_solved == 1
    #ステート変更: 書斎, 引き出し, open
#if終了
```

**アイテムの取得→使用→消費:**
```
#アイテム入手: 鍵
// ホットスポットの usedItems で「鍵」使用時イベントを設定
#アイテム破棄: 鍵
#ステート変更: 玄関, ドア, unlocked
```

### 共通部品機能

すべてのシーンに共通して表示されるホットスポット（UI部品）を設定できる機能。
自作ゲームメニュー、常に表示される制限時間など、脱出ゲームに限らないゲームエンジンとしての機能拡張。

**設定方法:**
1. エディタで「ゲーム全体」→「ゲーム情報」→「共通シーン」を開く
2. 既存シーンの1つを選択（デフォルトは空 = 無効）
3. 選択したシーンのホットスポットが全シーンで表示される

**特徴:**
- 共通シーンは通常のシーンと同じように編集可能
- イベントから通常シーンと同じようにステート変更可能（`#ステート変更: 共通シーン名, ホットスポット名, ...`）
- 通常シーンの上に重ねて表示される（z-index: 1000-1100）
- セーブ/ロードで状態が自動的に保存される
- アイテム詳細画面には表示されない

**制約事項:**
- 共通シーンの背景は無視される（通常シーンの背景のみ表示）
- 共通シーンの方向移動設定は無視される
- 共通シーンの訪問イベントは実行されない

**推奨事項:**
- 共通シーンのホットスポット zIndex は 0-400 推奨（実際の描画は 1000-1400 になる）
- 共通シーン名に「共通」「UI」等のプレフィックスを推奨（例: `共通_メニュー`）
- 用途: 常に表示される UI パーツ（メニューボタン、ステータス表示、制限時間など）

**z-index 階層構造:**
- 通常シーン: 500-600
- 共通シーン: 1000-1100
- 方向移動ボタン: 1500
- EventViewer: 2000-2005
- Menu/SaveLoad/Config: 3000+

## ユニットテスト

Vitest を使用したユニットテスト環境。テストファイルは `src/**/*.test.js` に配置。

### テスト対象モジュール

- `eventExecutionUtils.js`: イベント実行エンジンのユーティリティ関数
  - `parseIfNumber`: 文字列を数値に変換（可能な場合）
  - `parseOperand`: 変数・数値・文字列リテラルのパース
  - `evalCondition`: 条件式（`==`, `!=`, `<`, `>` 等）の評価
  - `calcFlag`: フラグ計算（`+`, `-`, `*`, `/`, `%`, `=`）
  - `expandVars`, `expandVarsShallow`: 変数参照の展開
  - `parseLineText`: セリフテキストの解析（ハイライト対応）
  - `randomInt`, `random`: 乱数生成

### テストの書き方

```javascript
import { describe, it, expect } from 'vitest';
import { parseIfNumber } from './eventExecutionUtils.js';

describe('parseIfNumber', () => {
    it('数値文字列を数値に変換する', () => {
        expect(parseIfNumber('42')).toBe(42);
    });
});
```

### データマイグレーション

`useMerge.js` の `mergeDefault` 関数は以下の2つの役割を持つ:

1. **デフォルト値補完**: `defaultGameData.js` のスキーマに基づき、不足しているプロパティにデフォルト値を設定
2. **データマイグレーション**: 古いデータ形式を新しい形式に変換

**マイグレーション例:**
- ホットスポットの位置情報: `area: [x0, y0, x1, y1]` → `x, y, width, height`

新しいバージョンのツールで古いデータを開く際に自動変換される。
逆方向（新→旧）のマイグレーションはサポートしない。

## UI拡張パラメータ（2026-02）

### 名前表示部の独立化（game.textBox.nameStyle）

キャラクター名表示部が完全に独立したパラメータセットを持つようになりました：

- `color`: 文字色
- `fontSize`: 文字サイズ
- `padding`: パディング（数値px）
- `minWidth`: 最小幅（数値px）
- `distance`: テキストボックスとの距離（px）
  - `0`: テキストボックスに接続（下部ボーダー・角丸なし）
  - `> 0`: 独立表示（全ボーダー・角丸適用）
- `borderWidth`, `borderStyle`, `borderColor`: ボーダー設定
- `borderRadius`: 角丸（distance > 0 の時のみ全ての角に適用）

### SaveLoad画面の拡張（game.save）

タイトルと×ボタンのスタイルが独立したオブジェクトになりました：

```javascript
"save": {
  "gap": 10,                    // スロット間隔
  "titleStyle": {
    "fontSize": "24px",         // タイトルフォントサイズ
    "color": "rgba(0,0,0,1)",
    "backgroundColor": "transparent",
    "padding": "0px"
  },
  "closeBtnStyle": {
    "size": 24,                 // ×ボタンサイズ
    "color": "rgba(0,0,0,1)",
    "hover": "hoverOp"          // ホバー効果
  }
}
```

### 方向移動ボタンの画像対応（game.direction.images）

4方向それぞれに自作画像を設定可能：

```javascript
"direction": {
  "images": {
    "top": "",      // 上方向の画像パス
    "right": "",    // 右方向の画像パス
    "bottom": "",   // 下方向の画像パス
    "left": ""      // 左方向の画像パス
  }
}
```

表示優先順位: 画像 > デフォルトアイコン（`useDefaultArrow: true`） > なし

### フォント設定機能

#### 全体フォント（game.gameStyle.fontFamily）

ゲーム全体のデフォルトフォントを設定：

```javascript
"gameStyle": {
  "fontFamily": "system-ui"  // デフォルトフォント
}
```

**Google Fonts 自動ロード:**
- エディタの「ゲーム全体」→「ゲームスタイル」→「デフォルトフォント」で選択
- プリセット: Noto Sans JP, Noto Serif JP, M PLUS Rounded 1c 等
- Google Fonts を選択すると自動的にCDNから読み込まれる
- ユーザーは「プリロード」を意識する必要なし

#### ホットスポットごとのフォント（state.style.fontFamily）

各ホットスポットのステートで個別にフォントを上書き可能：

```javascript
"style": {
  "fontFamily": ""  // 空文字列 = game.gameStyle.fontFamily を継承
}
```

エディタの「シーン」→「ホットスポット」→「ステート」→「テキスト」→「フォント」で設定。

### コーディングルール

- **ブランチ運用**: 新機能や機能変更を行うときは、必ず `feature/機能名` のブランチを切ってから実装すること
- **ドキュメント更新**: 機能変更後、以下を確認・更新すること:
  - **CLAUDE.md**: 実装内容に合わせて追記・修正する
  - **Wiki**: 矛盾が生じていないか確認し、必要に応じて修正する