# Wails化 実装計画

## フェーズ概要

| フェーズ | 内容 | 目安 | 依存 |
|---|---|---|---|
| Phase 0 | 準備・Wailsプロジェクト初期化 | - | なし |
| Phase 1 | Storage Adapter 層の導入（React側） | - | Phase 0 |
| Phase 2 | Go バインディング実装 | - | Phase 0 |
| Phase 3 | エディタのAdapter統合 | - | Phase 1, 2 |
| Phase 4 | プロジェクト管理機能 | - | Phase 3 |
| Phase 5 | 仮想エクスプローラーUI | - | Phase 3 |
| Phase 6 | エクスポート・テスト・仕上げ | - | Phase 4, 5 |

---

## Phase 0: 準備・Wailsプロジェクト初期化

### 0-1. Wails CLI インストール・プロジェクト作成

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

※ Wails v2（安定版）を使用。

### 0-2. プロジェクト構造の決定
※構成の変更は不要と判断(Step3時点)

```
tojinovel/
├── main.go                  ← Wails v2 エントリポイント
├── app.go                   ← App struct（バインディング登録）
├── services/
│   ├── project_manager.go   ← プロジェクト管理
│   ├── file_service.go      ← ファイル読み書き
│   └── asset_handler.go     ← 相対パスアセット配信
├── frontend/                ← 既存の React プロジェクト（シンボリックリンク or コピー）
│   ├── src/
│   ├── index.html
│   ├── editor.html
│   ├── vite.config.js
│   └── ...
├── go.mod
├── go.sum
└── wails.json
```

**方針**: 既存のReactプロジェクトを `frontend/` として統合。Goコードは `services/` に配置。

### 0-3. wails.json 設定

```json
{
  "name": "Tojinovel",
  "assetdir": "./frontend/dist",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:watcher": "npm run dev",
  "frontend:dev:serverUrl": "auto"
}
```

### 0-4. 開発フロー確認

- `wails dev` で開発サーバー起動（Vite HMR + Go バインディング）
- `wails build` でプロダクションビルド

---

## Phase 1: Storage Adapter 層の導入（React側）

### 1-1. StorageService モジュール作成

**ファイル:** `src/services/storageService.js`

```javascript
// Adapter の動的切り替え
let adapter = null;

export function setAdapter(a) { adapter = a; }
export function getAdapter() { return adapter; }

// 便利関数（各hookから呼ぶ）
export const storage = {
  loadGameData: (...args) => adapter.loadGameData(...args),
  saveGameData: (...args) => adapter.saveGameData(...args),
  loadEventFile: (...args) => adapter.loadEventFile(...args),
  saveEventFile: (...args) => adapter.saveEventFile(...args),
  resolveAssetUrl: (...args) => adapter.resolveAssetUrl(...args),
};
```

### 1-2. HTTP Adapter 作成（既存動作の維持）

**ファイル:** `src/services/httpAdapter.js`

現在の `fetch()` ベースの動作をそのまま Adapter として切り出す。
これにより、Wails 化前でも Adapter 経由で動作する状態を作る。

```javascript
const API_BASE = import.meta.env.VITE_API_BASE;

export const httpAdapter = {
  loadGameData: async () => {
    const res = await fetch("./data/gamedata.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  },
  saveGameData: async (data) => {
    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  },
  loadEventFile: async (path) => {
    const res = await fetch(path);
    if (!res.ok) return null;
    const ct = res.headers.get("Content-Type");
    if (!ct || !ct.startsWith("text/")) return null;
    return res.text();
  },
  saveEventFile: async (path, content) => {
    const serverPath = path.replace(/^\.\//, "");
    const res = await fetch(`${API_BASE}/save-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: serverPath, content }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  },
  resolveAssetUrl: (path) => path, // 現状通り相対パスそのまま
};
```

### 1-3. Wails Adapter 作成

**ファイル:** `src/services/wailsAdapter.js`

Wails v2 では Go バインディングが `window.go.main.StructName.MethodName()` の形式で公開される。

```javascript
export const wailsAdapter = {
  loadGameData: async () => {
    const json = await window.go.main.FileService.LoadGameData();
    return JSON.parse(json);
  },
  saveGameData: async (data) => {
    await window.go.main.FileService.SaveGameData(JSON.stringify(data, null, 2));
  },
  loadEventFile: async (path) => {
    return window.go.main.FileService.LoadEventFile(path);
  },
  saveEventFile: async (path, content) => {
    await window.go.main.FileService.SaveEventFile(path, content);
  },
  resolveAssetUrl: (path) => path, // AssetHandlerが処理
  // プロジェクト管理
  listProjects: () => window.go.main.ProjectManager.ListRecentProjects(),
  openProject: (path) => window.go.main.ProjectManager.OpenProject(path),
  createProject: (name) => window.go.main.ProjectManager.CreateProject(name),
  selectProjectDialog: () => window.go.main.ProjectManager.SelectProjectDialog(),
  // ファイルツリー
  readDir: (path) => window.go.main.FileService.ReadDir(path),
  deleteFile: (path) => window.go.main.FileService.DeleteFile(path),
  renameFile: (old, nw) => window.go.main.FileService.RenameFile(old, nw),
  importFile: (dest) => window.go.main.FileService.ImportFile(dest),
};
```

### 1-4. Adapter 初期化

**ファイル:** `src/editor.jsx`（エディタのエントリポイント）

```javascript
import { setAdapter } from "./services/storageService";
import { httpAdapter } from "./services/httpAdapter";
import { wailsAdapter } from "./services/wailsAdapter";

// Wails環境かどうか判定
const isWails = !!window.go;

setAdapter(isWails ? wailsAdapter : httpAdapter);
```

### 1-5. 既存hookの書き換え

対象ファイルと変更箇所:

**`useEditorData.js`:**
- `loadFile`: `fetch("./data/gamedata.json")` → `storage.loadGameData()`
- `saveFile`: `fetch(API_BASE + "/save")` → `storage.saveGameData(data)`
- `loadFirst`: 同上

**`useScenarioEditor.js`:**
- `loadEventFile`: `fetch(normalizedPath)` → `storage.loadEventFile(path)`
- `saveAllDirtyFiles`: `fetch(API_BASE + "/save-event")` → `storage.saveEventFile(path, content)`

**注意:** プレイヤー側 (`useGameData.js`, `useEventLines.js`) は変更しない。
プレイヤーはWails内でもAssetHandler経由の `fetch()` で動作するため。

---

## Phase 2: Go バインディング実装

### 2-1. FileService

**ファイル:** `services/file_service.go`

```go
package services

import (
    "encoding/json"
    "os"
    "path/filepath"
    "strings"
)

type FileService struct {
    projectPath string
}

func NewFileService() *FileService {
    return &FileService{}
}

func (f *FileService) SetProjectPath(path string) {
    f.projectPath = path
}

// パスのバリデーション（ディレクトリトラバーサル防止）
func (f *FileService) validatePath(relativePath string) (string, error) {
    clean := filepath.Clean(relativePath)
    if strings.Contains(clean, "..") {
        return "", fmt.Errorf("invalid path")
    }
    full := filepath.Join(f.projectPath, clean)
    absProject, _ := filepath.Abs(f.projectPath)
    absFull, _ := filepath.Abs(full)
    if !strings.HasPrefix(absFull, absProject) {
        return "", fmt.Errorf("path outside project")
    }
    return full, nil
}

func (f *FileService) LoadGameData() (string, error) {
    path := filepath.Join(f.projectPath, "data", "gamedata.json")
    data, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }
    return string(data), nil
}

func (f *FileService) SaveGameData(jsonStr string) error {
    // JSON整形
    var tmp any
    if err := json.Unmarshal([]byte(jsonStr), &tmp); err != nil {
        return err
    }
    pretty, err := json.MarshalIndent(tmp, "", "  ")
    if err != nil {
        return err
    }
    path := filepath.Join(f.projectPath, "data", "gamedata.json")
    return os.WriteFile(path, pretty, 0644)
}

func (f *FileService) LoadEventFile(relativePath string) (string, error) {
    fullPath, err := f.validatePath(relativePath)
    if err != nil {
        return "", err
    }
    data, err := os.ReadFile(fullPath)
    if err != nil {
        return "", err
    }
    return string(data), nil
}

func (f *FileService) SaveEventFile(relativePath string, content string) error {
    fullPath, err := f.validatePath(relativePath)
    if err != nil {
        return err
    }
    dir := filepath.Dir(fullPath)
    if err := os.MkdirAll(dir, 0755); err != nil {
        return err
    }
    return os.WriteFile(fullPath, []byte(content), 0644)
}
```

### 2-2. ProjectManager

**ファイル:** `services/project_manager.go`

```go
type ProjectManager struct {
    fileService *FileService
    configPath  string // 設定ファイル（最近のプロジェクト等）
}

type RecentProject struct {
    Name         string `json:"name"`
    Path         string `json:"path"`
    LastModified string `json:"lastModified"`
}

func (p *ProjectManager) OpenProject(path string) error
func (p *ProjectManager) ListRecentProjects() ([]RecentProject, error)
func (p *ProjectManager) CreateProject(name string) (string, error)
func (p *ProjectManager) SelectProjectDialog() (string, error)
```

- 設定ファイルは `%APPDATA%/Tojinovel/config.json`（Windows）等に保存
- 最近のプロジェクトは最大20件保持

### 2-3. AssetHandler

**ファイル:** `services/asset_handler.go`

```go
func NewAssetHandler(fileService *FileService) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        requestPath := r.URL.Path
        // プロジェクトフォルダ内のファイルを配信
        fullPath := filepath.Join(fileService.projectPath, requestPath)
        // セキュリティチェック
        // ...
        http.ServeFile(w, r, fullPath)
    })
}
```

Wails v2 の `options.App` で `AssetsHandler` を設定:

```go
import "github.com/wailsapp/wails/v2/pkg/options"

err := wails.Run(&options.App{
    // ...
    AssetsHandler: NewAssetHandler(fileService),
    Bind: []interface{}{
        app,
        fileService,
        projectManager,
    },
})
```

**Wails v2 の注意点:**
- バインディングは `Bind` フィールドに登録したstructのエクスポートされたメソッドが自動的に `window.go.main.StructName.MethodName()` で呼び出し可能になる
- `AssetsHandler` は `http.Handler` を受け取り、フロントエンドの静的アセットで解決できないリクエストを処理する

---

## Phase 3: エディタのAdapter統合

### 3-1. useEditorData.js の書き換え

変更点:
1. `API_BASE` の直接参照を削除
2. `loadFile` → `storage.loadGameData()` を使用
3. `saveFile` → `storage.saveGameData(data)` を使用
4. `loadFirst` → 同様に書き換え
5. フォールバック（保存失敗時のダウンロード）は維持

### 3-2. useScenarioEditor.js の書き換え

変更点:
1. `loadEventFile` 内の `fetch(normalizedPath)` → `storage.loadEventFile(path)`
2. `saveAllDirtyFiles` 内の `fetch(API_BASE + "/save-event")` → `storage.saveEventFile(path, content)`
3. Content-Type チェックは Adapter 内に移動（HTTP Adapter のみ必要）

### 3-3. 動作確認

- HTTP Adapter で既存の Go サーバー + ブラウザで動作確認
- Wails Adapter で Wails 環境下で動作確認
- 両方で保存・読み込み・イベント編集が正常動作することを確認

---

## Phase 4: プロジェクト管理機能

### 4-1. プロジェクト選択画面

**新規コンポーネント:** `src/components/editor/ProjectSelector.jsx`

- アプリ起動時に表示
- 最近のプロジェクト一覧（カード形式）
- 「フォルダを選択」ボタン（Wails ダイアログ）
- 「新規プロジェクト」ボタン

### 4-2. 新規プロジェクト作成

Go側で:
1. 指定パスにフォルダ作成
2. `data/` サブフォルダ作成
3. デフォルトの `gamedata.json` を配置
4. `data/events/`, `data/images/`, `data/sounds/` を作成

### 4-3. エディタへの統合

`EditorApp.jsx` に状態追加:
- `projectReady` が `false` → プロジェクト選択画面
- `projectReady` が `true` → 従来のエディタ画面

---

## Phase 5: 仮想エクスプローラーUI

### 5-1. FileExplorer コンポーネント

**新規コンポーネント:** `src/components/editor/panels/FileExplorer.jsx`

- MUI TreeView or カスタムツリーコンポーネント
- `storage.readDir()` でフォルダ構造取得
- 遅延ロード（フォルダ展開時に子要素取得）

### 5-2. 機能実装

1. **ファイルツリー表示**: フォルダ/ファイルをアイコン付きで表示
2. **パスコピー**: ファイルクリック → `./data/images/bg.png` 形式でクリップボードにコピー
3. **ファイル追加**: 「追加」ボタン → OS ファイルダイアログ → プロジェクトにコピー
4. **削除**: 右クリック → 確認ダイアログ → 削除
5. **リネーム**: 右クリック → インライン編集
6. **画像プレビュー**: 画像ファイルホバーでサムネイル表示

### 5-3. エディタへの配置

- エディタの左サイドバー or パネル内にタブとして追加
- 既存のエディタレイアウト（`react-resizable-panels`）に統合

---

## Phase 6: エクスポート・テスト・仕上げ

### 6-1. プロジェクトエクスポート

- プロジェクトフォルダの内容 + プレイヤー用静的ファイル（index.html, ビルド済みJS/CSS）をZIP化
- または指定フォルダにコピー
- Go側に `ExportProject(destPath string)` を実装

### 6-2. テスト

- 既存の Vitest テストが通ることを確認
- Adapter 層の単体テスト追加（httpAdapter のモックテスト）
- E2Eテスト（手動）: プロジェクト作成→編集→保存→プレイ→エクスポートの一連フロー

### 6-3. クロスプラットフォームビルド

```bash
wails build -platform windows/amd64
wails build -platform darwin/universal
wails build -platform linux/amd64
```

※ Wails v2 のクロスコンパイルはホストOS上でのビルドが基本。他OS向けはCI/CD環境を推奨。

---

## 実装順序の詳細（推奨）

### ステップ 1: Adapter層だけを先に導入（ブラウザ動作のまま）
1. `src/services/` ディレクトリ作成
2. `storageService.js` 作成
3. `httpAdapter.js` 作成（現在の fetch をそのまま移植）
4. `editor.jsx` で Adapter 初期化
5. `useEditorData.js` を書き換え
6. `useScenarioEditor.js` を書き換え
7. **テスト**: 既存の Go サーバー + ブラウザで全機能が動作することを確認

→ この時点でコードレビュー・マージ可能。Wails なしでも動く。

### ステップ 2: Wails プロジェクト初期化
1. Wails CLI セットアップ
2. Go モジュール初期化
3. `main.go` / `app.go` 作成
4. `FileService` の基本実装
5. `AssetHandler` の実装
6. `wails dev` で動作確認

### ステップ 3: Wails Adapter 統合
1. `wailsAdapter.js` 作成
2. `editor.jsx` の環境判定・切り替えロジック追加
3. Wails 環境下での動作確認

### ステップ 4: プロジェクト管理 + エクスプローラー
1. `ProjectManager` 実装
2. `ProjectSelector.jsx` 作成
3. `FileExplorer.jsx` 作成
4. エディタレイアウトへの統合

### ステップ 5: 仕上げ
1. エクスポート機能
2. エラーハンドリング改善
3. クロスプラットフォームテスト

---

## リスク・注意点

1. **Wails バージョン**: Wails v2（安定版）を使用。v3 はプレリリース状態のため採用しない。
2. **WebView 互換性**: Windows では WebView2 (Chromium)。macOS では WKWebView (Safari)。CSS/JS の互換性に注意。
3. **ファイルパス**: Windows の `\` と Unix の `/` の差異。Go側で `filepath.ToSlash()` で統一。
4. **大容量ファイル**: 画像・音声の大量読み込み時のメモリ。AssetHandler でストリーム配信。
5. **既存テスト**: Adapter導入後も `vitest run` が通ることを最優先で確認。
