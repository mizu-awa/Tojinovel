# Wails化 仕様書

## 1. 現状分析

### 1.1 現在のアーキテクチャ

```
[ブラウザ] ←HTTP→ [Go Server (port 42736)]
                     ├── 静的ファイル配信 (dist/)
                     ├── POST /save       → gamedata.json 書き込み
                     └── POST /save-event → イベントtxt 書き込み
```

### 1.2 現在のI/Oポイント（抽象化対象）

| ファイル | 操作 | 現在の実装 |
|---|---|---|
| `useEditorData.js` | gamedata.json 読み込み | `fetch("./data/gamedata.json")` |
| `useEditorData.js` | gamedata.json 保存 | `fetch(API_BASE + "/save", POST)` |
| `useScenarioEditor.js` | イベントtxt 読み込み | `fetch(normalizedPath)` |
| `useScenarioEditor.js` | イベントtxt 保存 | `fetch(API_BASE + "/save-event", POST)` |
| `useGameData.js` | gamedata.json 読み込み（プレイヤー） | `fetch(fileName)` |
| `useEventLines.js` | イベントtxt 読み込み（プレイヤー） | `fetch(url)` |
| `audioManager.js` | 音声再生 | Howler.js（相対パスURL） |
| コンポーネント各所 | 画像表示 | `<img src="./assets/...">` 等 |

### 1.3 環境変数

- `VITE_API_BASE`: Go サーバーのベースURL（開発時: `http://localhost:42736`）

---

## 2. 新アーキテクチャ

### 2.1 全体構成（Wails v2）

```
[Wails v2 WebView]
  ├── React App (Vite ビルド済み)
  │     └── StorageService (Adapter)
  │           ├── WailsAdapter  → Go バインディング呼び出し (window.go.main.*)
  │           └── BrowserAdapter → IndexedDB + fetch（将来）
  │
  └── Go Backend (Wails v2 Runtime)
        ├── ProjectManager   … プロジェクト一覧・選択
        ├── FileService      … ファイル読み書き（プロジェクト内）
        └── AssetHandler     … 相対パスでアセット配信（AssetsHandler）
```

### 2.2 Adapter Pattern 詳細（Wails v2）

```javascript
// src/services/storageService.js

// インターフェース定義（実装が満たすべきメソッド）
const StorageInterface = {
  // ゲームデータ
  loadGameData: async () => {},       // → object
  saveGameData: async (data) => {},   // → void

  // イベントファイル
  loadEventFile: async (path) => {},  // → string | null
  saveEventFile: async (path, content) => {}, // → void

  // アセット
  resolveAssetUrl: (relativePath) => "", // → string (表示用URL)

  // プロジェクト管理
  listProjects: async () => {},       // → [{name, path, lastModified}]
  openProject: async (path) => {},    // → void
  createProject: async (name) => {},  // → path

  // ファイルツリー（仮想エクスプローラー）
  readDir: async (dirPath) => {},     // → [{name, isDir, size}]
  deleteFile: async (path) => {},     // → void
  renameFile: async (oldPath, newPath) => {}, // → void
  importFile: async (destPath) => {}, // → void（ダイアログ経由）
};
```

### 2.3 Wails Adapter 実装方針

```javascript
// src/services/wailsAdapter.js
// Wails v2 のバインディングは window.go.main.StructName.MethodName() 形式
export const wailsAdapter = {
  loadGameData: () => window.go.main.FileService.LoadGameData(),
  saveGameData: (data) => window.go.main.FileService.SaveGameData(JSON.stringify(data)),
  loadEventFile: (path) => window.go.main.FileService.LoadEventFile(path),
  saveEventFile: (path, content) => window.go.main.FileService.SaveEventFile(path, content),
  resolveAssetUrl: (relativePath) => relativePath, // AssetsHandlerが処理
  // ...
};
```

### 2.4 Browser Adapter 実装方針（将来）

```javascript
// src/services/browserAdapter.js
export const browserAdapter = {
  loadGameData: async () => { /* IndexedDB から取得 */ },
  saveGameData: async (data) => { /* IndexedDB に保存 */ },
  loadEventFile: async (path) => { /* IndexedDB から取得 */ },
  saveEventFile: async (path, content) => { /* IndexedDB に保存 */ },
  resolveAssetUrl: (relativePath) => {
    // IndexedDB の Blob から Object URL を生成
  },
  // ...
};
```

---

## 3. 機能仕様

### 3.1 マルチプロジェクト管理

**起動フロー:**
1. アプリ起動 → プロジェクト選択画面を表示
2. 「最近のプロジェクト」一覧 or 「フォルダを選択」or「新規作成」
3. プロジェクト選択後 → エディタ画面へ遷移

**プロジェクトフォルダ構造:**
```
my-project/
├── data/
│   ├── gamedata.json
│   ├── events/
│   │   └── *.txt
│   ├── images/
│   ├── sounds/
│   └── ...
├── index.html        ← ビルド時にコピー
└── assets/           ← Viteビルド済みJS/CSS
```

**Go側:**
```go
type ProjectManager struct {
    currentProjectPath string
    recentProjects     []RecentProject
}

func (p *ProjectManager) OpenProject(path string) error
func (p *ProjectManager) ListRecentProjects() []RecentProject
func (p *ProjectManager) CreateProject(name string) (string, error)
func (p *ProjectManager) SelectProjectDialog() (string, error) // Wails ダイアログ
```

### 3.2 ファイルアクセス（FileService）

```go
type FileService struct {
    projectPath string
}

func (f *FileService) LoadGameData() (string, error)
func (f *FileService) SaveGameData(jsonStr string) error
func (f *FileService) LoadEventFile(relativePath string) (string, error)
func (f *FileService) SaveEventFile(relativePath string, content string) error
func (f *FileService) ReadDir(relativePath string) ([]FileInfo, error)
func (f *FileService) DeleteFile(relativePath string) error
func (f *FileService) RenameFile(oldPath string, newPath string) error
func (f *FileService) ImportFile(destDir string) error // ダイアログ経由
```

**セキュリティ:**
- 全パスはプロジェクトフォルダからの相対パスのみ許可
- `..` を含むパスは拒否（現サーバーと同等）
- `filepath.Clean` + プロジェクトパスプレフィックス検証

### 3.3 アセット配信（AssetsHandler）

Wails v2 の `AssetsHandler`（`options.App.AssetsHandler`）を使い、
`./data/images/bg.png` のような相対パスリクエストをプロジェクトフォルダ内の実ファイルにマッピングする。

```go
func assetHandler(projectPath string) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // リクエストパスからプロジェクト内ファイルを解決
        filePath := filepath.Join(projectPath, r.URL.Path)
        // セキュリティチェック後にファイル配信
        http.ServeFile(w, r, filePath)
    })
}
```

**ポイント:**
- Wails v2 では `AssetsHandler` はフロントエンドの埋め込みアセットで解決できなかったリクエストを処理するフォールバックハンドラ
- React側のコード変更不要（`<img src="./data/images/bg.png">` がそのまま動作）
- Content-Type自動判定（画像/音声/テキスト）

### 3.4 仮想エクスプローラー（Asset Manager UI）

**UI構成:**
- エディタのサイドバー or パネル内に配置
- MUIのTreeView風コンポーネントでフォルダ/ファイルツリー表示
- コンテキストメニュー: コピー、削除、リネーム、パスコピー

**機能:**
1. プロジェクト内 `data/` フォルダのツリー表示
2. ファイル選択 → 相対パスをクリップボードにコピー
3. ファイルのドラッグ&ドロップインポート（OS → アプリ）
4. 右クリックメニューで削除・リネーム
5. 画像ファイルのプレビュー（サムネイル表示）

---

## 4. 移行における制約・方針

### 4.1 React側の変更方針

- **最小変更原則**: 既存コンポーネントは極力変更しない
- `fetch()` による直接的なAPI呼び出しを `StorageService` 経由に変更するのはフック層のみ
- アセット（画像・音声）の相対パス参照は `AssetHandler` により変更不要

### 4.2 プレイヤー側への影響

- プレイヤー (`GameApp.jsx`) は配布時には従来通り静的HTMLとして動作
- Wails内でのデバッグプレイ時のみ `AssetHandler` 経由になる
- `useGameData.js` と `useEventLines.js` は `fetch()` のまま（AssetHandlerが応答）

### 4.3 エディタ側の変更

- `useEditorData.js`: `saveFile` / `loadFile` を StorageService 経由に
- `useScenarioEditor.js`: `saveAllDirtyFiles` / `loadEventFile` を StorageService 経由に
- エディタ専用の変更なのでプレイヤー側には影響なし

### 4.4 ビルド・配布

- Wails v2 アプリとしてクロスコンパイル（Windows / macOS / Linux）
- プレイヤー用の静的ファイル一式は「エクスポート」機能で出力
  - index.html + ビルド済みJS/CSS + data/ フォルダをZIPまたはフォルダコピー
