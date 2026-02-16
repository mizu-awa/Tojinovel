# Wails化 マイグレーション・ロードマップ

## 関連ドキュメント

- [仕様書](./wails-migration-spec.md) - アーキテクチャ設計・Adapter Pattern・機能仕様
- [実装計画](./wails-implementation-guide.md) - フェーズ別の詳細実装手順

## 全体像

```
現在の構成                          新しい構成
─────────────                    ─────────────
Browser ←HTTP→ Go Server          Wails WebView ←binding→ Go Backend
                                    │
 fetch("/save")                     ├─ ProjectManager（マルチプロジェクト）
 fetch("/save-event")               ├─ FileService（ファイルR/W）
 fetch("./data/gamedata.json")      └─ AssetHandler（相対パスアセット配信）
```

## Adapter Pattern による段階的移行

```
React Hooks
    │
    ▼
StorageService ─────┐
    │               │
    ├─ httpAdapter   │  ← Phase 1 で導入（既存動作を維持）
    ├─ wailsAdapter  │  ← Phase 3 で統合
    └─ browserAdapter│  ← 将来のWeb版用
```

**重要**: Phase 1 完了時点で httpAdapter 経由で既存構成のまま動作する。
Wails への移行はリスクを最小化しながら段階的に行える。

## フェーズ一覧

```
Phase 0: Wails プロジェクト初期化
  └─ CLI セットアップ、Go モジュール構成

Phase 1: Storage Adapter 層の導入 ★最初にやるべき
  ├─ storageService.js
  ├─ httpAdapter.js（既存 fetch をラップ）
  ├─ useEditorData.js 書き換え
  └─ useScenarioEditor.js 書き換え
  → ブラウザ + Go サーバーで動作確認

Phase 2: Go バインディング実装
  ├─ FileService（読み書き + パス検証）
  ├─ AssetHandler（相対パス → 実ファイル配信）
  └─ ProjectManager（プロジェクト管理）

Phase 3: Wails Adapter 統合
  ├─ wailsAdapter.js
  ├─ 環境判定（window.go の有無）
  └─ Wails 環境下で動作確認

Phase 4: プロジェクト管理機能
  ├─ ProjectSelector.jsx（起動画面）
  ├─ 最近のプロジェクト一覧
  └─ 新規プロジェクト作成

Phase 5: 仮想エクスプローラーUI
  ├─ FileExplorer.jsx（ファイルツリー）
  ├─ パスコピー・ファイル追加・削除・リネーム
  └─ 画像プレビュー

Phase 6: エクスポート・仕上げ
  ├─ プロジェクトZIPエクスポート
  ├─ クロスプラットフォームビルド
  └─ テスト・品質保証
```

## 変更影響範囲

### 変更するファイル

| ファイル | Phase | 変更内容 |
|---|---|---|
| `src/services/storageService.js` | 1 | **新規作成** Adapter管理 |
| `src/services/httpAdapter.js` | 1 | **新規作成** 既存fetch移植 |
| `src/services/wailsAdapter.js` | 3 | **新規作成** Goバインディング呼出 |
| `src/hooks/editor/useEditorData.js` | 1 | fetch → storage 書き換え |
| `src/hooks/editor/useScenarioEditor.js` | 1 | fetch → storage 書き換え |
| `src/editor.jsx` | 1 | Adapter初期化追加 |
| `src/EditorApp.jsx` | 4 | プロジェクト選択画面統合 |
| `src/components/editor/ProjectSelector.jsx` | 4 | **新規作成** |
| `src/components/editor/panels/FileExplorer.jsx` | 5 | **新規作成** |

### 変更しないファイル（重要）

| ファイル | 理由 |
|---|---|
| `src/GameApp.jsx` | プレイヤーはfetch維持（AssetHandler対応） |
| `src/hooks/useGameData.js` | プレイヤー用、変更不要 |
| `src/hooks/useEventLines.js` | プレイヤー用、変更不要 |
| `src/hooks/audioManager.js` | 相対パスのまま動作 |
| `src/components/**`（editor以外） | 影響なし |

## ブラウザ版（将来）への拡張パス

Phase 1 で導入する Adapter Pattern により、将来の完全ブラウザ版は
`browserAdapter.js` を追加するだけで対応可能:

```javascript
// src/services/browserAdapter.js
export const browserAdapter = {
  loadGameData: async () => { /* IndexedDB */ },
  saveGameData: async (data) => { /* IndexedDB */ },
  loadEventFile: async (path) => { /* IndexedDB 仮想FS */ },
  saveEventFile: async (path, content) => { /* IndexedDB 仮想FS */ },
  resolveAssetUrl: (path) => {
    /* IndexedDB Blob → Object URL */
  },
  // ...
};
```
