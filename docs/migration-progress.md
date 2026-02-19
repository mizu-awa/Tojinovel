# Wails化 マイグレーション 進捗記録

## 完了済みステップ

### ステップ1: Adapter層の導入（Wailsなしで動作） ✅ 完了

**実施日**: 2026-02-18
**ブランチ**: feature/toWails

#### 実施内容

1. **仕様書のWails v2対応**
   - `docs/wails-migration-spec.md` - Wails v2のバインディング形式 (`window.go.services.*`) に修正、`AssetsHandler` の記述を追加
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
     - `window.go.services.FileService.*` 経由でGoの関数を呼び出し
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
  │           ├─ isWails=true  → wailsAdapter  → window.go.services.FileService.*
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

### ステップ3: `wails dev` 動作確認 + バグ修正 ✅ 完了

**実施日**: 2026-02-18
**ブランチ**: feature/toWails

#### 実施内容

1. **バグ修正: wailsAdapter.js のバインディングパス**
   - `window.go.main.FileService.*` → `window.go.services.FileService.*` に修正
   - `FileService` は `package services` に定義されているため、Wails v2 のバインディングパスは `window.go.services.FileService` が正しい
   - 自動生成されたバインディング（`wailsjs/go/services/FileService.js`）で正しいパスを確認

2. **app.go の拡張**
   - `App` struct に `fileService` フィールドを追加し、`NewApp(fileService)` で受け取る形に変更
   - `startup` コールバック: プロジェクトパスが未設定の場合、開発用デフォルト（`./public/`）を自動設定
   - `domReady` コールバック: Wailsアプリ起動時に `index.html` から `editor.html` へリダイレクト
     - Wailsはデフォルトで `index.html`（プレイヤー）を読み込むため、エディタへのリダイレクトが必要

3. **main.go の修正**
   - `NewApp(fileService)` で `FileService` を渡すように変更
   - `OnDomReady: app.domReady` コールバックを追加

#### `wails dev` 起動確認結果

```
✓ Wails CLI v2.11.0 で起動
✓ Go バインディング自動生成（wailsjs/go/services/FileService.js）
✓ Vite 開発サーバー起動（localhost:5173）
✓ Wails DevServer 起動（localhost:34115）
✓ WebView2 環境作成成功
✓ 開発用プロジェクトパス自動設定（C:\dev\Tojinovel\public）
```

#### 検証結果
- **wails dev**: 正常起動 ✅
- **Go vet**: エラーなし ✅
- **Vitest**: 64テスト全パス ✅
- **Vite Build**: プロダクションビルド成功 ✅
- **バインディング生成**: `window.go.services.FileService.*` で正しく生成 ✅

#### 注意点
- `.gitignore` の `frontend/` エントリは無害（`frontend:dir` が `.` のため Wails は `frontend/` ディレクトリを作成しない）
- `.gitignore` の `wailsjs/` は自動生成バインディングなのでそのまま維持
- `wails dev` 中、ブラウザから直接 `http://localhost:34115/editor.html` や `http://localhost:34115/debug.html` にアクセス可能

---

### ステップ4: プロジェクト管理 + エクスプローラー + デバッグ切り替え ✅ 完了

**実施日**: 2026-02-18
**ブランチ**: feature/toWails

#### 実施内容

1. **ProjectManager Go実装** (`services/project_manager.go`)
   - `ProjectManager` struct: プロジェクトの一覧・選択・作成を管理
   - `ListRecentProjects()` - 設定ファイルから最近のプロジェクト一覧（最大20件）
   - `OpenProject(path)` - FileService.SetProjectPath + 最近リストに追加
   - `CreateProject(name, parentDir)` - フォルダ構造作成 + デフォルトgamedata.json配置
   - `SelectProjectDialog()` / `SelectNewProjectParentDialog()` - Wails runtime.OpenDirectoryDialog
   - `GetCurrentProjectName()` - 現在のプロジェクト名
   - 設定ファイル: `os.UserConfigDir()/Tojinovel/config.json`

2. **main.go / app.go の更新**
   - `main.go`: `ProjectManager` を `Bind` 配列に追加
   - `app.go`: `NewApp(fileService, projectManager)` でProjectManager受け取り、startup時にSetContext(ctx)呼び出し
   - 開発モードのデフォルトプロジェクトパスは `OpenProject()` 経由で設定（最近リストにも追加される）

3. **ProjectSelector UI** (`src/components/editor/ProjectSelector.jsx`)
   - 最近のプロジェクト一覧（カード型レイアウト）
   - 「フォルダを選択」ボタン（OSダイアログ経由）
   - 「新規作成」ボタン + ダイアログ（プロジェクト名 + 作成場所選択）
   - エラーハンドリング付き

4. **main.jsx の拡張**
   - `RootApp` コンポーネント追加: Wails環境時にProjectSelector → EditorApp 切り替えフロー
   - HTTP環境では従来通り直接EditorApp表示
   - デバッグモード時に「エディタに戻る」フローティングボタン追加

5. **デバッグプレイボタン** (`src/components/editor/MyAppBar.jsx`)
   - PlayArrowアイコンボタンをツールバーに追加（Save右隣、Dividerで区切り）
   - クリック → 未保存なら保存 → `window.location.search = "?debug"` でデバッグモードに遷移
   - デバッグモードからの戻り: `window.location.search = ""` で遷移

6. **仮想エクスプローラー** (`src/components/editor/panels/FileExplorer.jsx`)
   - `data/` フォルダをルートとしたファイルツリー表示
   - MUI List + Collapse による遅延ロード型ツリー
   - ファイルクリック → 相対パス（`./data/...`）をクリップボードにコピー
   - 右クリックメニュー: パスコピー / リネーム / 削除
   - ファイル種類別アイコン（画像/音声/テキスト/JSON）
   - リフレッシュボタン付き

7. **MainTabs.jsx の更新**
   - 「エクスプローラー」タブ追加（Wails環境のみ表示）

8. **EditorApp.jsx の更新**
   - `FileExplorer` import追加
   - `mainTab === "explorer"` 時に左パネルにFileExplorer表示

9. **Adapter層の拡張**
   - `storageService.js`: プロジェクト管理 + ファイルツリーメソッド追加（optional chaining + fallback）
   - `wailsAdapter.js`: ProjectManagerバインディング追加
   - `httpAdapter.js`: 変更なし（optional chaining のfallbackで自動的にnull返却）

#### プロジェクト構造（新規追加分）

```
tojinovel/
├── services/
│   └── project_manager.go              ← プロジェクト管理（新規）
├── src/
│   ├── main.jsx                         ← RootApp + ProjectSelector統合（修正）
│   ├── components/editor/
│   │   ├── ProjectSelector.jsx          ← プロジェクト選択画面（新規）
│   │   ├── MyAppBar.jsx                 ← デバッグプレイボタン追加（修正）
│   │   ├── MainTabs.jsx                 ← エクスプローラータブ追加（修正）
│   │   └── panels/
│   │       └── FileExplorer.jsx         ← 仮想エクスプローラー（新規）
│   └── services/
│       ├── storageService.js            ← プロジェクト管理メソッド追加（修正）
│       └── wailsAdapter.js             ← ProjectManagerバインディング追加（修正）
```

#### アーキテクチャ（ステップ4完了時点）

```
[Wails v2 WebView]
  ├── React App
  │     └── main.jsx (RootApp)
  │           ├─ ProjectSelector  → storage.listProjects / openProject / createProject
  │           ├─ EditorApp        → storage.loadGameData / saveGameData / ...
  │           │   ├─ MyAppBar     → デバッグプレイボタン（?debug遷移）
  │           │   ├─ MainTabs     → エクスプローラータブ（Wails環境のみ）
  │           │   └─ FileExplorer → storage.readDir / deleteFile / renameFile
  │           └─ GameApp (debug)  → 「エディタに戻る」ボタン
  │
  └── Go Backend
        ├── App              … ライフサイクル管理
        ├── FileService      … ファイル読み書き（Bind登録）
        ├── ProjectManager   … プロジェクト管理（Bind登録）
        └── AssetHandler     … 相対パス → 実ファイル配信
```

#### 検証結果
- **Go vet**: エラーなし ✅
- **Go build**: コンパイル成功 ✅
- **Vitest**: 64テスト全パス ✅
- **ESLint**: 今回の変更による新規エラーなし ✅
- **Vite Build**: プロダクションビルド成功 ✅

---

---

### ステップ5: system/修正 + エクスプローラー改善 + エクスポート機能 ✅ 完了

**実施日**: 2026-02-19
**ブランチ**: feature/toWails

#### 実施内容

1. **`system/`フォルダのパス修正** (`services/project_manager.go`)
   - `CreateProject`の`data/system/`→ `system/`（トップレベル）に修正
   - コード上の参照（`./system/...`）と一致させるバグ修正
   - `embed.FS`を`ProjectManager`に受け渡す形に変更（`NewProjectManager(fileService, assets)`）
   - `CreateProject`時に埋め込み`dist/system/`から5ファイルをプロジェクトの`system/`にコピー
     - `transparent.png`, `character_image.png`, `item_image.png`, `scene_image.png`, `image.png`
   - `copyEmbedDir`ヘルパー（再帰的embed→ディスクコピー）を追加

2. **ExportPlayer機能** (`services/project_manager.go`)
   - `ExportPlayer()`メソッド追加
   - 埋め込み`dist/player.html`→ プロジェクトの`index.html`としてコピー
   - 埋め込み`dist/assets/`→ プロジェクトの`assets/`に全ファイルコピー
   - `system/`が存在しない場合は再コピー

3. **main.go更新** (`main.go`)
   - `NewProjectManager(fileService, assets)` に変更（embedFSを渡す）

4. **エクスプローラーをプロジェクトルートから表示** (`src/components/editor/panels/FileExplorer.jsx`)
   - `readDir("data")` → `readDir("")`（プロジェクトルート）
   - `parentPath="data"` → `parentPath=""`
   - ヘッダー表示テキスト修正（`data/` → `/`）
   - ファイル作成ダイアログに案内テキスト追加
   - 結果: `data/`, `system/` などトップレベルフォルダがすべて見えるようになった

5. **プレイヤー書き出しUI** (`src/services/wailsAdapter.js`, `src/services/storageService.js`, `src/components/editor/MyAppBar.jsx`)
   - `wailsAdapter.exportPlayer` → `window.go.services.ProjectManager.ExportPlayer()`
   - `storageService.exportPlayer` wrapper追加
   - `MyAppBar`にダウンロードアイコンボタン追加（Wails環境のみ表示）
   - 書き出し成功/失敗をSnackbarで通知

#### プロジェクト構造（書き出し後）

```
my-project/
├── index.html         ← 書き出しで追加（player.htmlをリネーム）
├── assets/            ← 書き出しで追加（ビルド済みJS/CSS）
├── system/            ← プロジェクト作成時にコピー（transparent.png等）
└── data/
    ├── gamedata.json
    ├── events/
    ├── images/
    └── sounds/
```

#### 検証結果
- **go vet**: エラーなし ✅
- **Go build**: コンパイル成功 ✅
- **Vitest**: 64テスト全パス ✅
- **Vite Build**: プロダクションビルド成功 ✅

---

## 人間による確認が必要な項目

### ステップ4の手動動作確認

`wails dev` を実行して以下を確認してください:

1. **プロジェクト選択画面**
   - 起動時にプロジェクト選択画面が表示されること
   - ※開発モードでは `public/` が自動的に開かれるため、直接エディタに遷移する場合あり
   - 確認方法: `%APPDATA%/Tojinovel/config.json` を削除してから起動

2. **フォルダ選択ダイアログ**
   - 「フォルダを選択」ボタンでOSのフォルダ選択ダイアログが開くこと
   - フォルダ選択後、エディタ画面に遷移すること

3. **新規プロジェクト作成**
   - 「新規作成」→ プロジェクト名入力 + 作成場所選択 → 作成
   - 指定場所にプロジェクトフォルダ（data/, data/events/ 等）が作成されること
   - `system/`がトップレベルに作成され、transparent.png等が入っていること
   - デフォルトの gamedata.json が配置されること

4. **デバッグプレイボタン**
   - ツールバー右端の ▶ ボタンでデバッグプレイ画面に遷移すること
   - 「エディタに戻る」ボタンでエディタに戻れること

5. **エクスプローラータブ**
   - 「エクスプローラー」タブが表示されること（Wails環境のみ）
   - プロジェクトルート（`data/`, `system/` など）が表示されること
   - ファイルクリックでパスがクリップボードにコピーされること
   - 右クリックメニュー（パスコピー/リネーム/削除）が動作すること

6. **プレイヤー書き出しボタン**
   - ツールバーの ⬇ ボタンでプレイヤー書き出しが実行されること
   - `index.html` と `assets/` フォルダがプロジェクトに作成されること
   - 出力された `index.html` をブラウザで開いてゲームが動作すること

7. **既存機能の動作確認**
   - ゲームデータの読み込み・保存が正常に動作すること
   - シナリオエディタでイベントファイルの読み書きが正常なこと
