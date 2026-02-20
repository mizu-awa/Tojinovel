# ブラウザ版（Webエディタ）実装ドキュメント

## Context

現在のTojinovelはWails v2デスクトップアプリとして動作しているが、元々の設計思想として「将来のWeb版とコードベースを共有できるアーキテクチャ」を目指してAdapter Patternが導入されている。この計画では、既存のWails版を維持したまま、ブラウザだけで完結するWebエディタ版を追加ビルドターゲットとして実装する。

**既存の設計が活かせるポイント**:
- `storageService.js`のAdapter Pattern（`setAdapter`/`getAdapter`/`storage`オブジェクト）
- 全コンポーネントが`storage`経由でI/Oしており、アダプタ差し替えで動作可能
- 未実装メソッドは`?.`で`null`を返すため、段階的実装が可能
- `vite.config.js`の`base: './'`による相対パス設計

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│  ブラウザ版 (静的ホスティング: GitHub Pages等)            │
├─────────────────────────────────────────────────────────┤
│  React SPA (既存コンポーネント共有)                       │
│  ├── EditorApp / GameApp (変更なし)                      │
│  ├── ProjectSelector (ブラウザモード分岐追加)             │
│  └── FileExplorer (アダプタ経由で動作、変更最小)          │
├─────────────────────────────────────────────────────────┤
│  browserAdapter.js (新規)                                │
│  └── browserFS.js → IndexedDB仮想ファイルシステム        │
├─────────────────────────────────────────────────────────┤
│  Service Worker (browser-asset-sw.js)                    │
│  └── 相対パスリクエストを傍受 → IndexedDBからBlob返却     │
├─────────────────────────────────────────────────────────┤
│  IndexedDB: TojinovelBrowserFS                           │
│  ├── projects (プロジェクトメタ情報)                      │
│  ├── files (仮想ファイル: テキスト/Blob)                  │
│  └── config (設定・最近のプロジェクト)                     │
└─────────────────────────────────────────────────────────┘
```

## Phase 1: IndexedDB仮想ファイルシステム基盤

### 新規ファイル
- **`src/services/browser/browserFS.js`** — IndexedDB仮想FSレイヤー
- **`src/services/browserAdapter.js`** — storageService準拠アダプタ

### IndexedDBスキーマ (`TojinovelBrowserFS`)

```javascript
// Object Store: projects (keyPath: "id")
{ id: "uuid", name: "My Game", createdAt: timestamp, updatedAt: timestamp }

// Object Store: files (keyPath: ["projectId", "path"])
{ projectId: "uuid", path: "data/gamedata.json", type: "text"|"binary",
  content: "string", blob: Blob, mimeType: "application/json",
  size: 1234, updatedAt: timestamp }
// Index: byProject (keyPath: "projectId")

// Object Store: config (keyPath: "key")
{ key: "currentProjectId", value: "uuid" }
{ key: "recentProjects", value: [...] }
```

### browserFS.js 主要API
- `initDB()` — DB初期化/マイグレーション
- `listProjects()` / `createProject(name)` / `deleteProject(id)`
- `readFile(projectId, path)` / `writeFile(projectId, path, content/blob)`
- `deleteFile(projectId, path)` / `renameFile(projectId, old, new)`
- `listDir(projectId, dirPath)` — パス前方一致フィルタで仮想ディレクトリ一覧
- `getConfig(key)` / `setConfig(key, value)`

### browserAdapter.js — storageServiceインターフェース完全実装
`wailsAdapter.js`と同じメソッドをすべて実装:
- `loadGameData()` → `browserFS.readFile(currentProjectId, "data/gamedata.json")`をJSONパース
- `saveGameData(data)` → JSON.stringifyして`writeFile`
- `loadEventFile(path)` / `saveEventFile(path, content)` → テキストファイルR/W
- `resolveAssetUrl(path)` → パスをそのまま返す（Service Workerが処理）
- `listProjects()` / `openProject(id)` / `createProject(name)` / `getCurrentProjectName()`
- `readDir(path)` / `deleteFile(path)` / `renameFile(old, new)` / `createFile(path)`
- `importFile(destDir)` → `<input type="file">`でブラウザファイルピッカー起動
- `exportPlayer()` → ZIP生成してダウンロード（Phase 5で本実装）
- `init()` — Service Worker登録 + `navigator.storage.persist()`

## Phase 2: Service Worker（アセット配信）

### 新規ファイル
- **`public/browser-asset-sw.js`** — アセット配信用Service Worker

### 仕組み
Wails版の`AssetHandler`（Go）と同等の役割をService Workerで実現:

1. `data/`, `system/`へのfetchリクエストを傍受
2. IndexedDBから該当ファイルを読み取り
3. `new Response(blob, { headers: { 'Content-Type': mimeType } })`で返却
4. ファイルが見つからなければ`404`

### 技術的ポイント
- Service Worker内ではraw IndexedDB APIを使用（`idb`ライブラリはimport不可）
- `skipWaiting()` + `clients.claim()`で即時有効化
- プロジェクト切替時は`postMessage`でプロジェクトIDを通知
- Service Worker非対応環境（HTTP、プライベートブラウジング）はBlob URLフォールバック

## Phase 3: ビルド設定 & エントリポイント

### 変更ファイル
- **`src/main.jsx`** — 3モードアダプタ検出
- **`vite.config.js`** — ブラウザビルド設定追加
- **`package.json`** — ビルドスクリプト追加

### アダプタ検出ロジック (main.jsx)
```javascript
// 環境変数ベースで明確に分岐
if (import.meta.env.VITE_BUILD_MODE === 'browser') {
  const { browserAdapter } = await import('./services/browserAdapter.js');
  await browserAdapter.init(); // SW登録、永続化リクエスト
  setAdapter(browserAdapter);
} else if (window.go) {
  setAdapter(wailsAdapter);
} else {
  setAdapter(httpAdapter);
}
```

### ビルドスクリプト
```json
{
  "build:browser": "cross-env VITE_BUILD_MODE=browser vite build --outDir dist-browser",
  "dev:browser": "cross-env VITE_BUILD_MODE=browser vite"
}
```

### vite.config.js変更
- `VITE_BUILD_MODE`環境変数を`define`に追加
- ブラウザビルド時: `outDir: 'dist-browser'`、`input`から`player.html`を除外
- Wailsビルド: 既存設定を維持（`dist/`出力）

## Phase 4: ProjectSelector ブラウザモード対応

### 変更ファイル
- **`src/components/editor/ProjectSelector.jsx`** — 条件分岐UI

### 変更内容
```javascript
const isBrowser = import.meta.env.VITE_BUILD_MODE === 'browser';
```
- OSフォルダ選択ボタン非表示（`selectProjectDialog`不使用）
- 新規作成: 名前のみ入力（親ディレクトリ不要）
- ストレージ使用量表示（`navigator.storage.estimate()`）
- データ永続性警告バナー追加

## Phase 5: ZIPインポート/エクスポート

### 新規ファイル
- **`src/services/zipService.js`** — JSZipラッパー

### 新規依存
- **`jszip`** (`^3.10.1`) — ZIP圧縮/展開

### 機能
- **エクスポート**: プロジェクト全ファイルをIndexedDBから読み出し → ZIP生成 → ダウンロード
- **インポート**: ZIPファイル選択 → 展開 → 新規プロジェクトとしてIndexedDBに書き込み
- **ドラッグ&ドロップ**: ProjectSelector画面でZIPドロップ対応
- Wails版との相互運用: ZIPフォルダ構成はWails版プロジェクト構造と一致

## Phase 6: FileExplorer ブラウザ版ファイルインポート

### 変更ファイル
- **`src/services/browserAdapter.js`** — `importFile(destDir)`本実装

### 実装
- `<input type="file" multiple accept="image/*,audio/*">`で選択
- 選択ファイルをBlob化してIndexedDBに保存
- 相対パスを返却（`destDir/filename.png`）

## Phase 7: UI仕上げ・ストレージ管理

### 新規ファイル
- **`src/components/editor/StorageQuotaBar.jsx`** — 容量表示バー
- **`src/components/editor/BrowserDataWarning.jsx`** — 永続性警告

### 機能
- `navigator.storage.estimate()`: 使用量/残量をプログレスバー表示
- 80%超過時に警告色 + ZIPバックアップ促進
- `navigator.storage.persist()`: 初回起動時に永続化リクエスト
- 警告バナー: 「ブラウザのキャッシュクリアでデータが消える可能性があります」
- `localStorage`フラグで非表示可（再表示はストレージ設定から）

## 実装済みファイル一覧

### 新規ファイル
| ファイル | 役割 |
|---------|------|
| `src/services/browser/browserFS.js` | IndexedDB仮想ファイルシステム |
| `src/services/browserAdapter.js` | storageService準拠アダプタ |
| `public/browser-asset-sw.js` | アセット配信用Service Worker |
| `src/services/zipService.js` | ZIP圧縮/展開サービス |

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/main.jsx` | ブラウザモード検出 + 非同期アダプタ初期化 |
| `vite.config.js` | ブラウザビルド設定（dist-browser出力） |
| `package.json` | `build:browser`/`dev:browser`スクリプト、jszip/cross-env依存追加 |
| `src/components/editor/ProjectSelector.jsx` | ブラウザモードUI分岐、ZIP import/export、ストレージ表示 |

### 影響なし（変更不要）
- `src/services/storageService.js` — インターフェース変更なし
- `src/services/wailsAdapter.js` — そのまま維持
- `src/services/httpAdapter.js` — そのまま維持
- `src/components/editor/panels/FileExplorer.jsx` — adapter経由で動作済み
- Go backend全体 — 変更なし

## 技術的判断

### Service Worker vs Blob URL
**Service Worker採用**。理由:
- Reactコンポーネントの変更がゼロ（`<img src="./data/images/bg.png">`がそのまま動作）
- Wails版の`AssetHandler`と同じ「リクエスト傍受」パターンで一貫性がある
- 音声（Howler.js）やCSS `url()`も透過的に動作
- 制約: HTTPS or localhostが必要（静的ホスティングなら問題なし）

### 別DB vs 共有DB
**別DB (`TojinovelBrowserFS`) 採用**。既存の`TojinovelDB`（セーブデータ用）とバージョン競合を避ける。

### readDirの実装方式
IndexedDBにはディレクトリ概念がないため、全ファイルをパス前方一致でフィルタ。典型的なゲームプロジェクト（数百ファイル）では性能問題なし。

## リスクと対策

| リスク | 対策 |
|------|------|
| IndexedDB容量制限（ブラウザ依存: 50MB〜10GB） | クォータ表示 + ZIPバックアップ促進 |
| ブラウザがIndexedDBをクリア（ストレージ圧迫時） | `navigator.storage.persist()` + 警告表示 |
| Service Worker非対応環境 | Blob URLフォールバック |
| 大規模プロジェクトのインポート/エクスポート速度 | プログレスインジケータ表示 |

## 使い方

### 開発
```bash
npm run dev:browser    # ブラウザ版開発サーバー起動
```

### ビルド
```bash
npm run build:browser  # dist-browser/ にビルド出力
```

### デプロイ
`dist-browser/` を静的ホスティング（GitHub Pages, Netlify, Vercel等）にデプロイ。
**HTTPS必須**（Service Workerの制約）。localhostでは開発モードで動作。

### 回帰テスト
```bash
npm run build          # Wails版ビルド（従来通り dist/ に出力）
npm run test:run       # 既存テスト（64件全通過確認済み）
wails dev              # Wails版開発（従来通り動作）
```

## 検証チェックリスト

- [ ] `npm run dev:browser`でブラウザ版起動
- [ ] プロジェクト新規作成
- [ ] エディタでシーン・ホットスポット編集 → 保存
- [ ] FileExplorerでファイルインポート（画像・音声）
- [ ] インポートした画像がシーン背景として表示
- [ ] デバッグプレイ（?debug）が動作
- [ ] ZIPエクスポート → ZIPインポートの往復
- [ ] `npm run build:browser` → 静的サーバーで配信テスト
- [ ] `wails dev`でWails版が従来通り動作（回帰テスト）
