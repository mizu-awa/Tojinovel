# マージ前コード監査 — 進捗管理

**開始日**: 2026-02-28
**計画**: [pre-merge-audit-plan.md](pre-merge-audit-plan.md)
**発見事項**: [pre-merge-audit-findings.md](pre-merge-audit-findings.md)（調査開始後に作成）

---

## 進捗サマリー

| # | フェーズ | 状態 | 発見数 | 担当 | 備考 |
|---|---------|------|--------|------|------|
| 1 | ストレージ抽象化レイヤー | ⬜ 未着手 | - | - | 最優先 |
| 2 | エントリポイント・起動フロー | ⬜ 未着手 | - | - | |
| 3 | エディタ機能 | ⬜ 未着手 | - | - | |
| 4 | ゲーム再生機構 | ⬜ 未着手 | - | - | コア機能 |
| 5 | UIコンポーネント | ⬜ 未着手 | - | - | 新規コード多 |
| 6 | SW・ブラウザ固有 | ⬜ 未着手 | - | - | |
| 7 | Goバックエンド | ⬜ 未着手 | - | - | |
| 8 | CI/CD・ビルド | ⬜ 未着手 | - | - | |
| 9 | 横断的観点 | ⬜ 未着手 | - | - | |

**状態の凡例**: ⬜ 未着手 / 🔄 進行中 / ✅ 完了 / ⏸️ ブロック中

---

## フェーズ別 詳細チェックリスト

### フェーズ1: ストレージ抽象化レイヤー

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 1-1a | adapter nullアクセスパスの有無 | ⬜ | |
| 1-1b | optional chainingフォールバック値の適切性 | ⬜ | |
| 1-1c | 3アダプター間のメソッド網羅性 | ⬜ | |
| 1-2a | wailsAdapter: Goメソッド名の一致確認 | ⬜ | |
| 1-2b | wailsAdapter: 戻り値型の一致確認 | ⬜ | |
| 1-2c | wailsAdapter: Goエラー時のJSハンドリング | ⬜ | |
| 1-3a | browserAdapter: init()初期化順序 | ⬜ | |
| 1-3b | browserAdapter: Blob URL生成・解放 | ⬜ | |
| 1-3c | browserAdapter: 戻り値形式のwails互換性 | ⬜ | |
| 1-3d | browserAdapter: バイナリファイル保存 | ⬜ | |
| 1-3e | browserAdapter: importFile()フロー | ⬜ | |
| 1-4a | httpAdapter: 未対応メソッドの確認 | ⬜ | |
| 1-5a | browserFS: パス正規化 | ⬜ | |
| 1-5b | browserFS: トランザクション競合 | ⬜ | |

### フェーズ2: エントリポイント・起動フロー

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 2-1a | browserAdapter.init()失敗時のエラー処理 | ⬜ | |
| 2-1b | sessionStorage状態復元の正確性 | ⬜ | |
| 2-1c | isDebug判定の環境互換性 | ⬜ | |
| 2-1d | handleProjectReady sessionStorage.clear()の影響 | ⬜ | |
| 2-2a | player.jsx環境別動作 | ⬜ | |
| 2-3a | vite.config.js baseパスの影響 | ⬜ | |

### フェーズ3: エディタ機能

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 3-1a | EditorApp: FileExplorer統合 | ⬜ | |
| 3-1b | EditorApp: デバッグ遷移のデータ保全 | ⬜ | |
| 3-2a | useEditorData: fetch()残存確認 | ⬜ | |
| 3-3a | useScenarioEditor: storage API移行完全性 | ⬜ | |
| 3-3b | useScenarioEditor: コード補完のパス候補 | ⬜ | |
| 3-4a | useUndoRedo: スナップショット互換性 | ⬜ | |
| 3-5a | useEditFunctions: パス関連の確認 | ⬜ | |
| 3-6a | useFileList: readDirRecursive戻り値 | ⬜ | |

### フェーズ4: ゲーム再生機構

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 4-1a | GameApp: debug prop分岐 | ⬜ | |
| 4-1b | GameApp: アセットパス解決 | ⬜ | |
| 4-2a | useGameData: loadGameData呼び出し | ⬜ | |
| 4-3a | useEventExecution: 新規ロジック検証 | ⬜ | |
| 4-3b | useEventExecution: fjバグ修正 | ⬜ | |
| 4-3c | useEventExecution: クリック待ちスキップ | ⬜ | |
| 4-4a | useEventLines: パース・エラー処理 | ⬜ | |
| 4-5a | useIndexedDBStorage: プロジェクト別分離 | ⬜ | |

### フェーズ5: UIコンポーネント

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 5-1a | FileExplorer: ツリー状態管理 | ⬜ | |
| 5-1b | FileExplorer: D&Dインポート | ⬜ | |
| 5-1c | FileExplorer: 右クリックメニュー | ⬜ | |
| 5-1d | FileExplorer: ファイル名バリデーション | ⬜ | |
| 5-2a | ProjectSelector: Wails版ダイアログ | ⬜ | |
| 5-2b | ProjectSelector: ブラウザ版ZIP/IDB | ⬜ | |
| 5-3a | Settings: FilePathInput統合 | ⬜ | |
| 5-4a | EventViewer等: resolveAssetUrl動作 | ⬜ | |

### フェーズ6: SW・ブラウザ固有

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 6-1a | SW: キャッシュ戦略 | ⬜ | |
| 6-1b | SW: IDBアセット配信 | ⬜ | |
| 6-1c | SW: MIME type判定 | ⬜ | |
| 6-2a | zipService: 生成・読み込み | ⬜ | |
| 6-2b | zipService: 日本語ファイル名 | ⬜ | |

### フェーズ7: Goバックエンド

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 7-1a | file_service: validatePath | ⬜ | |
| 7-1b | file_service: ReadDir戻り値構造 | ⬜ | |
| 7-2a | project_manager: systemファイルコピー | ⬜ | |
| 7-2b | project_manager: 無効パスの処理 | ⬜ | |
| 7-3a | asset_handler: セキュリティ | ⬜ | |

### フェーズ8: CI/CD・ビルド

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 8-1a | Actions: ビルドジョブ設定 | ⬜ | |
| 8-1b | Actions: デプロイ設定 | ⬜ | |
| 8-2a | スクリプト: build-all.ps1 | ⬜ | |

### フェーズ9: 横断的観点

| # | チェック項目 | 状態 | 結果 |
|---|------------|------|------|
| 9-1a | パス表記の統一性 | ⬜ | |
| 9-1b | Win/Unixパス区切り | ⬜ | |
| 9-2a | async/await try-catch漏れ | ⬜ | |
| 9-2b | Promise未処理rejection | ⬜ | |
| 9-3a | Blob URL解放漏れ | ⬜ | |
| 9-3b | useEffectクリーンアップ | ⬜ | |
| 9-4a | sessionStorage使用の妥当性 | ⬜ | |
| 9-4b | IndexedDB名・ストア名の一貫性 | ⬜ | |

---

## 発見事項の記録ルール

各発見事項は以下の形式で `pre-merge-audit-findings.md` に記録:

```markdown
### [F-001] タイトル
- **深刻度**: Critical / High / Medium / Low / Info
- **フェーズ**: 1-3b
- **ファイル**: src/services/browserAdapter.js:42
- **内容**: 問題の説明
- **修正案**: 推奨する修正方法
- **対応状況**: ⬜ 未対応 / ✅ 修正済み / ➡️ 次回対応
```

---

## 最終チェック

- [ ] 全フェーズ完了
- [ ] `npm run test:run` 全パス
- [ ] `npm run lint` エラーなし
- [ ] `npm run build` 成功
- [ ] `npm run build:browser` 成功
- [ ] 発見事項のCritical/High全対応
- [ ] レビュー結果の最終まとめ作成
