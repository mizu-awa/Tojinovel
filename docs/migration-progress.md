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

## 次のステップ

### ステップ2: Wailsプロジェクト初期化
- Wails v2 CLI セットアップ
- Go モジュール初期化（`go.mod`）
- `main.go` / `app.go` 作成
- `FileService` の基本実装
- `AssetHandler` の実装
- `wails dev` で動作確認

### ステップ3: Wails Adapter 統合
- `src/services/wailsAdapter.js` 作成
- `src/editor.jsx` の環境判定（`window.go` の有無）・切り替えロジック追加
- Wails環境下での動作確認

### ステップ4: プロジェクト管理 + エクスプローラー
- `ProjectManager` Go実装
- `ProjectSelector.jsx` UI作成
- `FileExplorer.jsx` UI作成

### ステップ5: 仕上げ
- エクスポート機能
- エラーハンドリング改善
- クロスプラットフォームテスト
