# Wails化 マイグレーション 進捗記録

## 完了済みステップ

### ステップ1: Adapter層の導入（Wailsなしで動作） ✅ 完了

**実施日**: 2026-02-18
**ブランチ**: feature/toWails

#### 実施内容

1. **仕様書のWails v2対応**
   - `docs/wails-migration-spec.md` - Wails v2のバインディング形式 (`window.go.main.*`) に修正、`AssetsHandler` の記述を追加
   - `docs/wails-implementation-guide.md` - CLIインストールコマンド、wailsAdapter.jsのバインディング形式、AssetHandler設定をv2向けに修正
   - Wails v3参照をすべてv2に統一

2. **新規ファイル作成**
   - `src/services/storageService.js` - Adapter管理モジュール。`setAdapter()` / `getAdapter()` / `storage` オブジェクト
   - `src/services/httpAdapter.js` - 既存のfetchベース動作をAdapterとして切り出し。loadGameData / saveGameData / loadEventFile / saveEventFile / resolveAssetUrl

3. **既存ファイル修正**
   - `src/editor.jsx` - Adapter初期化コード追加（`setAdapter(httpAdapter)`）
   - `src/hooks/editor/useEditorData.js` - `API_BASE`/`fetch()` 直接呼び出しを `storage.*` に置き換え
     - `loadFile`: `fetch("./data/gamedata.json")` → `storage.loadGameData()`
     - `loadFirst`: 同上
     - `saveFile`: `fetch(API_BASE + "/save")` → `storage.saveGameData(data)`
   - `src/hooks/editor/useScenarioEditor.js` - `API_BASE`/`fetch()` 直接呼び出しを `storage.*` に置き換え
     - `loadEventFile`: `fetch(normalizedPath)` → `storage.loadEventFile(path)`（Content-TypeチェックはhttpAdapter側に移動）
     - `saveAllDirtyFiles`: `fetch(API_BASE + "/save-event")` → `storage.saveEventFile(path, content)`

4. **変更していないファイル（設計通り）**
   - `src/GameApp.jsx` - プレイヤー側は変更不要
   - `src/hooks/useGameData.js` - プレイヤー用、変更不要
   - `src/hooks/useEventLines.js` - プレイヤー用、変更不要
   - `src/hooks/audioManager.js` - 相対パスのまま動作

#### 検証結果
- **Vitest**: 64テスト全パス ✅
- **ESLint**: 今回の変更による新規エラーなし（既存のwarning/errorのみ）✅
- **Vite Build**: プロダクションビルド成功 ✅

#### アーキテクチャ

```
React Hooks (useEditorData, useScenarioEditor)
    │
    ▼
storage (storageService.js)
    │
    ├─ httpAdapter.js  ← 現在使用中（既存Goサーバー + fetch）
    ├─ wailsAdapter.js ← 次ステップで作成（Goバインディング）
    └─ browserAdapter.js ← 将来のWeb版用
```

---

### ステップ2: Wailsプロジェクト初期化 + Wails Adapter統合 ✅ 完了

**実施日**: 2026-02-18
**ブランチ**: feature/toWails

#### 実施内容

1. **Wails CLI セットアップ**
   - `go install github.com/wailsapp/wails/v2/cmd/wails@latest` でインストール
   - Wails v2.11.0 確認

2. **Go モジュール初期化**
   - `go.mod` をプロジェクトルートに作成（`module tojinovel`）
   - Wails v2 依存を追加（`github.com/wailsapp/wails/v2 v2.11.0`）
   - `go mod tidy` で依存関係を整理

3. **新規Goファイル作成**
   - `app.go` - Wailsアプリケーションのライフサイクル管理（`App` struct、`startup` コールバック）
   - `main.go` - Wails v2 エントリポイント
     - `embed.FS` で `dist/` を埋め込み
     - `AssetServer.Assets` にフロントエンド静的ファイル設定
     - `AssetServer.Handler` に `AssetHandler` をフォールバックとして設定
     - `Bind` に `App` と `FileService` を登録
   - `services/file_service.go` - ファイル読み書きサービス
     - `LoadGameData` / `SaveGameData` - gamedata.json の読み書き（JSON整形付き）
     - `LoadEventFile` / `SaveEventFile` - イベントtxtの読み書き
     - `ReadDir` / `DeleteFile` / `RenameFile` - ファイルツリー操作
     - `validatePath` - ディレクトリトラバーサル防止（`..` 拒否 + プロジェクトパスプレフィックス検証）
   - `services/asset_handler.go` - 相対パスアセット配信HTTPハンドラ
     - `http.Handler` インターフェース実装
     - プロジェクトフォルダ内のファイルをContent-Type自動判定で配信
     - セキュリティチェック（パストラバーサル防止）
     - キャッシュ無効化ヘッダ付与

4. **Wails設定ファイル**
   - `wails.json` - フロントエンドビルド設定（npm install / npm run build / npm run dev）

5. **フロントエンドAdapter統合**（実装計画のステップ3を前倒し）
   - `src/services/wailsAdapter.js` - Wails v2 Goバインディング呼び出しAdapter
     - `window.go.main.FileService.*` 経由でGoの関数を呼び出し
     - loadGameData / saveGameData / loadEventFile / saveEventFile / resolveAssetUrl
     - readDir / deleteFile / renameFile（ファイルツリー用）
   - `src/editor.jsx` - 環境判定ロジック追加
     - `window.go` の有無でWails環境を検出
     - `isWails ? wailsAdapter : httpAdapter` で自動切り替え

#### プロジェクト構造（新規追加分）

```
tojinovel/
├── main.go                     ← Wails v2 エントリポイント（新規）
├── app.go                      ← App struct（新規）
├── go.mod                      ← Go モジュール定義（新規）
├── go.sum                      ← Go 依存ハッシュ（新規）
├── wails.json                  ← Wails設定（新規）
├── services/
│   ├── file_service.go         ← ファイル読み書き（新規）
│   └── asset_handler.go        ← アセット配信ハンドラ（新規）
├── src/
│   ├── services/
│   │   ├── storageService.js   ← ステップ1で作成済み
│   │   ├── httpAdapter.js      ← ステップ1で作成済み
│   │   └── wailsAdapter.js     ← Goバインディング呼出（新規）
│   └── editor.jsx              ← 環境判定追加（修正）
├── server/                     ← 既存HTTPサーバー（変更なし、互換維持）
└── dist/                       ← Viteビルド出力（embed対象）
```

#### アーキテクチャ（ステップ2完了時点）

```
[Wails v2 WebView]
  ├── React App (dist/ に埋め込み)
  │     └── editor.jsx
  │           ├─ isWails=true  → wailsAdapter  → window.go.main.FileService.*
  │           └─ isWails=false → httpAdapter    → fetch() + Go HTTPサーバー
  │
  └── Go Backend
        ├── App (app.go)            … ライフサイクル管理
        ├── FileService             … ファイル読み書き（Bind登録）
        └── AssetHandler            … 相対パス → 実ファイル配信（AssetServer.Handler）
```

#### 検証結果
- **Go vet**: エラーなし ✅
- **Go build**: コンパイル成功（embed含む）✅
- **Vitest**: 64テスト全パス ✅
- **ESLint**: 今回の変更による新規エラーなし ✅
- **Vite Build**: プロダクションビルド成功 ✅

---

## 次のステップ

### ステップ3: `wails dev` で動作確認
- `wails dev` コマンドでアプリケーション起動確認
- エディタ画面がWails WebView内で表示されることを確認
- Goバインディング経由でのファイル読み書き動作確認
- AssetHandlerによるアセット（画像・音声）配信の動作確認

### ステップ4: プロジェクト管理 + エクスプローラー
- `ProjectManager` Go実装（`services/project_manager.go`）
- `ProjectSelector.jsx` UI作成（プロジェクト選択画面）
- `FileExplorer.jsx` UI作成（仮想エクスプローラー）

### ステップ5: 仕上げ
- エクスポート機能
- エラーハンドリング改善
- クロスプラットフォームテスト
