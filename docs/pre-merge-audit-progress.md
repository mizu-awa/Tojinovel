# マージ前コード監査 — 進捗管理

**開始日**: 2026-02-28
**計画**: [pre-merge-audit-plan.md](pre-merge-audit-plan.md)
**発見事項**: [pre-merge-audit-findings.md](pre-merge-audit-findings.md)

---

## 進捗サマリー

| # | フェーズ | 状態 | 発見数 | 備考 |
|---|---------|------|--------|------|
| 1 | ストレージ抽象化レイヤー | ✅ 完了 | 4 | F-001, F-005, F-007, F-015 |
| 2 | エントリポイント・起動フロー | ✅ 完了 | 2 | F-003, F-016 |
| 3 | エディタ機能 | ✅ 完了 | 3 | F-001, F-002, F-014 |
| 4 | ゲーム再生機構 | ✅ 完了 | 3 | F-006, F-012, F-013 |
| 5 | UIコンポーネント | ✅ 完了 | 3 | F-004, F-021, F-025 |
| 6 | SW・ブラウザ固有 | ✅ 完了 | 2 | F-011, F-019 |
| 7 | Goバックエンド | ✅ 完了 | 3 | F-020, F-022, F-024 |
| 8 | CI/CD・ビルド | ✅ 完了 | 1 | F-010 |
| 9 | 横断的観点 | ✅ 完了 | 5 | F-008, F-009, F-016, F-017, F-023 |

**状態の凡例**: ⬜ 未着手 / 🔄 進行中 / ✅ 完了 / ⏸️ ブロック中

---

## フェーズ別 詳細チェックリスト

### フェーズ1: ストレージ抽象化レイヤー

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 1-1a | adapter nullアクセスパスの有無 | ✅ | **問題あり** F-005: コア5メソッドにoptional chainingなし |
| 1-1b | optional chainingフォールバック値の適切性 | ✅ | 問題なし: フォールバック値は妥当（null/[]/""） |
| 1-1c | 3アダプター間のメソッド網羅性 | ✅ | **問題あり** F-001: browserAdapterにreadDirRecursive欠落 |
| 1-2a | wailsAdapter: Goメソッド名の一致確認 | ✅ | 問題なし: 全メソッド名がGo側と一致 |
| 1-2b | wailsAdapter: 戻り値型の一致確認 | ✅ | 問題なし: JSON.parse/stringifyで型変換適切 |
| 1-2c | wailsAdapter: Goエラー時のJSハンドリング | ✅ | 問題なし: loadEventFileでtry-catch適切 |
| 1-3a | browserAdapter: init()初期化順序 | ✅ | 問題なし: IDB→永続化→SW→復元の順で適切 |
| 1-3b | browserAdapter: Blob URL生成・解放 | ✅ | 問題なし: resolveAssetUrlはパスをそのまま返す（SW配信） |
| 1-3c | browserAdapter: 戻り値形式のwails互換性 | ✅ | 問題なし: listProjects等でwails形式に変換済み |
| 1-3d | browserAdapter: バイナリファイル保存 | ✅ | **問題あり** F-007: application/jsonがバイナリ保存される |
| 1-3e | browserAdapter: importFile()フロー | ✅ | 問題なし: file picker→writeFile→resolveの流れは正常 |
| 1-4a | httpAdapter: 未対応メソッドの確認 | ✅ | 問題なし: optional chainingで安全にフォールバック |
| 1-5a | browserFS: パス正規化 | ✅ | **問題あり** F-015: ../バリデーションなし |
| 1-5b | browserFS: トランザクション競合 | ✅ | 軽微: 単一ユーザー環境で発生確率は低い |

### フェーズ2: エントリポイント・起動フロー

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 2-1a | browserAdapter.init()失敗時のエラー処理 | ✅ | **問題あり** F-003: try-catchなし、永久ローディング |
| 2-1b | sessionStorage状態復元の正確性 | ✅ | 問題なし: sessionRunningとclear()の組み合わせは妥当 |
| 2-1c | isDebug判定の環境互換性 | ✅ | 問題なし: URLパラメータベースで環境非依存 |
| 2-1d | handleProjectReady sessionStorage.clear()の影響 | ✅ | 問題なし: プロジェクト切替時のクリアは意図通り |
| 2-2a | player.jsx環境別動作 | ✅ | 問題なし: Wails版のみで正常に動作 |
| 2-3a | vite.config.js baseパスの影響 | ✅ | **注意** F-016: ./とパスなしの不整合あり |

### フェーズ3: エディタ機能

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 3-1a | EditorApp: FileExplorer統合 | ✅ | 問題なし: props受け渡し正常 |
| 3-1b | EditorApp: デバッグ遷移のデータ保全 | ✅ | 問題なし: sessionStorageに保存・復元 |
| 3-2a | useEditorData: fetch()残存確認 | ✅ | 問題なし: storage API移行完了 |
| 3-3a | useScenarioEditor: storage API移行完全性 | ✅ | 問題なし: loadEventFile/saveEventFile使用 |
| 3-3b | useScenarioEditor: コード補完のパス候補 | ✅ | **問題あり** F-001経由: ブラウザ版でパス候補が空 |
| 3-4a | useUndoRedo: スナップショット互換性 | ✅ | 問題なし: structuredClone互換 |
| 3-5a | useEditFunctions: パス関連の確認 | ✅ | **問題あり** F-002: copyItemStateの型バグ |
| 3-6a | useFileList: readDirRecursive戻り値 | ✅ | **問題あり** F-001, F-014 |

### フェーズ4: ゲーム再生機構

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 4-1a | GameApp: debug prop分岐 | ✅ | **問題あり** F-006: BackgroundEventRunnerにselectItem欠落 |
| 4-1b | GameApp: アセットパス解決 | ✅ | **問題あり** F-012: viewItemNameRef stale |
| 4-2a | useGameData: loadGameData呼び出し | ✅ | 問題なし: storage.loadGameData()正常 |
| 4-3a | useEventExecution: 新規ロジック検証 | ✅ | **問題あり** F-013: アニメーションタイマー未クリア |
| 4-3b | useEventExecution: fjバグ修正 | ✅ | 問題なし: fjバグ修正は妥当 |
| 4-3c | useEventExecution: クリック待ちスキップ | ✅ | 問題なし: ロジック正常 |
| 4-4a | useEventLines: パース・エラー処理 | ✅ | 問題なし: エラーハンドリング適切 |
| 4-5a | useIndexedDBStorage: プロジェクト別分離 | ✅ | 問題なし: currentProjectPathで分離 |

### フェーズ5: UIコンポーネント

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 5-1a | FileExplorer: ツリー状態管理 | ✅ | 問題なし |
| 5-1b | FileExplorer: D&Dインポート | ✅ | 問題なし |
| 5-1c | FileExplorer: 右クリックメニュー | ✅ | **軽微** F-025: エラーメッセージ表示 |
| 5-1d | FileExplorer: ファイル名バリデーション | ✅ | 問題なし |
| 5-2a | ProjectSelector: Wails版ダイアログ | ✅ | **問題あり** F-021: confirm()がWebView2でブロック可能性 |
| 5-2b | ProjectSelector: ブラウザ版ZIP/IDB | ✅ | **問題あり** F-004: loading状態未リセット |
| 5-3a | Settings: FilePathInput統合 | ✅ | 問題なし |
| 5-4a | EventViewer等: resolveAssetUrl動作 | ✅ | 問題なし: SW経由で配信 |

### フェーズ6: SW・ブラウザ固有

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 6-1a | SW: キャッシュ戦略 | ✅ | 問題なし: no-cacheで適切 |
| 6-1b | SW: IDBアセット配信 | ✅ | **問題あり** F-011: DB.close()タイミング |
| 6-1c | SW: MIME type判定 | ✅ | 問題なし |
| 6-2a | zipService: 生成・読み込み | ✅ | **問題あり** F-019: 拡張子なしファイル処理 |
| 6-2b | zipService: 日本語ファイル名 | ✅ | 問題なし: JSZipが適切に処理 |

### フェーズ7: Goバックエンド

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 7-1a | file_service: validatePath | ✅ | 問題なし: パストラバーサル防止は適切（ローカルアプリ） |
| 7-1b | file_service: ReadDir戻り値構造 | ✅ | **軽微** F-024: エラースキップのログなし |
| 7-2a | project_manager: systemファイルコピー | ✅ | 問題なし: 再帰コピー正常 |
| 7-2b | project_manager: 無効パスの処理 | ✅ | **問題あり** F-020: config非アトミック書き込み, F-022: 無効パスフィルタなし |
| 7-3a | asset_handler: セキュリティ | ✅ | 問題なし: validatePathで保護 |

### フェーズ8: CI/CD・ビルド

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 8-1a | Actions: ビルドジョブ設定 | ✅ | 問題なし |
| 8-1b | Actions: デプロイ設定 | ✅ | **問題あり** F-010: ブラウザ版ビルドテスト未実施 |
| 8-2a | スクリプト: build-all.ps1 | ✅ | 問題なし |

### フェーズ9: 横断的観点

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 9-1a | パス表記の統一性 | ✅ | **問題あり** F-015, F-016 |
| 9-1b | Win/Unixパス区切り | ✅ | 問題なし: normalizePath()でバックスラッシュ変換 |
| 9-2a | async/await try-catch漏れ | ✅ | **問題あり** F-008, F-009, F-017 |
| 9-2b | Promise未処理rejection | ✅ | **問題あり** F-003, F-009 |
| 9-3a | Blob URL解放漏れ | ✅ | **軽微** F-023: try-finallyなし（発生確率極低） |
| 9-3b | useEffectクリーンアップ | ✅ | 問題なし: クリーンアップ適切 |
| 9-4a | sessionStorage使用の妥当性 | ✅ | 問題なし |
| 9-4b | IndexedDB名・ストア名の一貫性 | ✅ | 問題なし: 意図的な2DB分離（BrowserFS/TojinovelDB） |

---

## 最終チェック

- [x] 全フェーズ完了
- [ ] `npm run test:run` 全パス
- [ ] `npm run lint` エラーなし
- [ ] `npm run build` 成功
- [ ] `npm run build:browser` 成功
- [ ] 発見事項のCritical/High全対応
- [ ] レビュー結果の最終まとめ作成
