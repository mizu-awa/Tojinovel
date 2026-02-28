# マージ前コード監査計画

**対象ブランチ**: `feature/toBrowser` → `main`
**変更規模**: 94ファイル, +7369 / -1166行
**作成日**: 2026-02-28

---

## 調査方針

mainブランチとの差分（94ファイル）を中心に、以下の観点で問題を探す:

1. **ランタイムエラー**: null参照、未定義メソッド呼び出し、型不一致
2. **ロジックバグ**: 条件分岐の抜け、状態管理の不整合、競合状態
3. **環境依存の問題**: Wails版とブラウザ版で動作が分岐する箇所の網羅性
4. **リグレッション**: 既存機能（ゲーム再生・編集・デバッグ）への影響
5. **セキュリティ**: パストラバーサル、XSS、外部入力の未検証

---

## フェーズ1: ストレージ抽象化レイヤー（最重要）

全機能の基盤。アダプター間の挙動差異がバグの温床になりやすい。

### 1-1. storageService.js — アダプター管理
- [ ] `adapter` が null のまま `storage.*` が呼ばれるパスがないか
- [ ] optional chaining (`?.`) のフォールバック値が適切か（null vs undefined vs 空配列）
- [ ] 全メソッドが3アダプター（wails/browser/http）で揃っているか

### 1-2. wailsAdapter.js — Wailsバインディング
- [ ] `window.go.services.FileService.*` のメソッド名がGo側と一致しているか
- [ ] `window.go.services.ProjectManager.*` のメソッド名がGo側と一致しているか
- [ ] Go関数の戻り値の型（string/object/array）がJS側の期待と合っているか
- [ ] エラー時（Goがerrorを返す場合）のJS側ハンドリング

### 1-3. browserAdapter.js — IndexedDB仮想FS
- [ ] `init()` の初期化順序（Service Worker登録 → IndexedDB → systemファイルコピー）
- [ ] `resolveAssetUrl()` がBlob URLを正しく生成・解放しているか（メモリリーク）
- [ ] ファイル操作（readDir, deleteFile, renameFile, createDir）の戻り値形式がwailsAdapterと一致するか
- [ ] `writeFileBlob()` がバイナリ（画像・音声）を正しく保存するか
- [ ] `importFile()` の `<input type="file">` フローが正常か

### 1-4. httpAdapter.js — HTTPフォールバック
- [ ] 新しいstorageService.jsのインターフェースに未対応のメソッドがないか
- [ ] ブラウザ版ビルドでhttpAdapterが読み込まれないことの確認

### 1-5. browserFS.js — IndexedDB仮想ファイルシステム
- [ ] ディレクトリ操作（mkdir, rmdir）の再帰処理
- [ ] ファイルパスの正規化（先頭スラッシュ、末尾スラッシュ、`./` の扱い）
- [ ] 大きなファイル（数MBの画像・音声）の読み書き性能
- [ ] トランザクション競合（同時に複数の読み書きが発生する場合）

---

## フェーズ2: エントリポイントとアプリ起動フロー

### 2-1. main.jsx — ルートアプリ
- [ ] ブラウザ版: `browserAdapter.init()` が失敗した場合のエラーハンドリング
- [ ] `sessionStorage.getItem("sessionRunning")` による状態復元の正確性
- [ ] `isDebug` 判定がWails版・ブラウザ版両方で正しく動くか
- [ ] `handleProjectReady` で `sessionStorage.clear()` → データ不整合の可能性
- [ ] ブラウザ版でProjectSelector表示時のプロジェクト一覧取得フロー

### 2-2. player.jsx — プレイヤーエントリ
- [ ] Wails版ビルドのみ `player.html` が含まれる（ブラウザ版で不要なコードが混入していないか）
- [ ] エクスポートされたプレイヤーが `httpAdapter` で動作するか

### 2-3. vite.config.js — ビルド設定
- [ ] `base` パスの違い（`./` vs `/Tojinovel/`）がアセット参照に影響しないか
- [ ] ブラウザ版で `player.html` がビルドから除外されているか確認

---

## フェーズ3: エディタ機能（EditorApp周辺）

### 3-1. EditorApp.jsx — メインエディタ
- [ ] FileExplorerの統合（props受け渡し、状態管理）
- [ ] デバッグプレイへの遷移・復帰フローのデータ保全
- [ ] ブラウザ版固有UIの出し分け（エクスプローラー、エクスポートボタン等）

### 3-2. useEditorData.js — エディタデータ管理
- [ ] `storage.loadGameData()` / `storage.saveGameData()` への移行が完全か
- [ ] `fetch()` の直接呼び出しが残っていないか
- [ ] ブラウザ版でのデータ初回ロードフロー

### 3-3. useScenarioEditor.js — シナリオエディタ
- [ ] `storage.loadEventFile()` / `storage.saveEventFile()` への移行
- [ ] コード補完のファイルパス候補が3環境で正しく取得できるか
- [ ] ファイルの自動保存（デバウンス）とIndexedDBバックアップの競合

### 3-4. useUndoRedo.js — Undo/Redo
- [ ] `structuredClone` でのスナップショットが新しいデータ構造と互換か
- [ ] シナリオエディタとゲーム編集のUndo/Redo分離が正しく動作するか

### 3-5. useEditFunctions.js — 編集操作
- [ ] ファイルパスを扱う関数がアダプター経由になっているか

### 3-6. useFileList.js — ファイル一覧（新規）
- [ ] `storage.readDirRecursive()` の戻り値パースが3環境で一貫しているか

---

## フェーズ4: ゲーム再生機構（GameApp周辺）

### 4-1. GameApp.jsx — ゲームプレイヤー
- [ ] `debug` propの受け渡しと動作分岐
- [ ] アセット読み込み（画像・音声）のパス解決が全環境で正常か

### 4-2. useGameData.js — ゲームデータ読み込み
- [ ] `storage.loadGameData()` の呼び出しと戻り値パース
- [ ] エラー時のフォールバック動作

### 4-3. useEventExecution.js — イベント実行エンジン
- [ ] 158行の変更 — 新規追加されたロジックの正確性
- [ ] バックグラウンドイベントの `fj` バグ修正の妥当性
- [ ] クリック待ちスキップ判定の正確性
- [ ] アイテムウィンドウの表示/非表示制御

### 4-4. useEventLines.js — イベントパース（新規101行）
- [ ] イベントファイルの読み込みと行分割ロジック
- [ ] `storage.loadEventFile()` の呼び出しとエラーハンドリング
- [ ] エンコーディング（UTF-8 BOM等）の対応

### 4-5. useIndexedDBStorage.js — セーブ/ロード
- [ ] プロジェクトパスによるIndexedDBキーの分離が正しく動くか
- [ ] ブラウザ版とWails版でセーブデータが混在しないか

---

## フェーズ5: UIコンポーネント

### 5-1. FileExplorer.jsx（新規853行 — 最大の新規ファイル）
- [ ] ファイルツリーの展開/折りたたみ状態管理
- [ ] ドラッグ&ドロップのファイルインポート
- [ ] 右クリックメニュー（コピー・リネーム・削除）のエッジケース
- [ ] フォルダ追加機能の動作
- [ ] ファイル名バリデーション（特殊文字、日本語、長い名前）

### 5-2. ProjectSelector.jsx（新規385行）
- [ ] Wails版: ダイアログ連携（openProject, createProject）
- [ ] ブラウザ版: ZIPインポート/IndexedDBプロジェクト管理
- [ ] プロジェクト一覧の表示と選択
- [ ] エラーハンドリング（存在しないパス、権限エラー）

### 5-3. 各Settingsコンポーネントの変更
- [ ] FilePathInput統合による画像/音声パス入力の動作
- [ ] ImagePreview統合によるプレビュー表示
- [ ] パスの `./` プレフィックス処理の統一性

### 5-4. EventViewer.jsx / Menu.jsx / SaveLoad.jsx 等
- [ ] `resolveAssetUrl()` によるアセットURL生成が全環境で動作するか
- [ ] Menuの表示改善（最新コミット）が正しいか

---

## フェーズ6: Service Worker & ブラウザ版固有機能

### 6-1. browser-asset-sw.js — Service Worker
- [ ] キャッシュ戦略（no-cache vs no-store）の適切性
- [ ] IndexedDBからのアセット配信フロー
- [ ] Service Workerの更新・アンインストール処理
- [ ] MIME type判定の正確性

### 6-2. zipService.js — ZIPエクスポート/インポート（新規120行）
- [ ] ZIPファイルの生成と読み込みフロー
- [ ] 大きなプロジェクトのZIPエクスポート時のメモリ使用量
- [ ] ファイルパスのエンコーディング（日本語ファイル名）

---

## フェーズ7: Go バックエンド（Wails版固有）

### 7-1. file_service.go
- [ ] `validatePath()` のパストラバーサル防止が十分か
- [ ] `ReadDir` / `ReadDirRecursive` の戻り値構造
- [ ] ファイル書き込み時のアトミック性（部分書き込み防止）
- [ ] 大ファイルのメモリ使用量

### 7-2. project_manager.go
- [ ] `CreateProject()` でのsystemファイルコピーの完全性
- [ ] `ExportPlayer()` のファイルコピーフロー
- [ ] 設定ファイル（config.json）の読み書き競合
- [ ] 最近のプロジェクト一覧のパスが無効（削除済み）な場合の処理

### 7-3. asset_handler.go
- [ ] `ServeHTTP()` のパストラバーサル防止
- [ ] Content-Type判定の正確性（特に.txt, .json, .jsx）
- [ ] キャッシュヘッダの設定

---

## フェーズ8: CI/CD & ビルド設定

### 8-1. GitHub Actions（.github/workflows/main.yml）
- [ ] Wails版ビルドジョブの設定
- [ ] ブラウザ版ビルド・デプロイジョブ
- [ ] テスト実行ジョブ
- [ ] マトリクスビルド（Win/Mac/Linux）の設定

### 8-2. スクリプト類
- [ ] `scripts/build-all.ps1` の変更内容
- [ ] `scripts/use-sample.ps1` の変更内容

---

## フェーズ9: 横断的観点

### 9-1. パス処理の一貫性
- [ ] `./data/...` vs `data/...` vs `/data/...` — 全体で統一されているか
- [ ] Windows (`\`) vs Unix (`/`) パス区切りの処理
- [ ] URLエンコーディング（スペースや日本語を含むパス）

### 9-2. エラーハンドリング
- [ ] `async/await` のtry-catch漏れ
- [ ] Promiseの未処理rejection
- [ ] ユーザーへのエラー通知（Snackbar等）の網羅性

### 9-3. メモリリーク
- [ ] Blob URLの `revokeObjectURL()` 呼び出し漏れ
- [ ] イベントリスナーのクリーンアップ（useEffectのreturn）
- [ ] Service Workerのキャッシュ蓄積

### 9-4. 状態の永続化
- [ ] sessionStorageの使い方（セッション継続判定、プロジェクトパス）
- [ ] IndexedDBのデータベース名・ストア名の一貫性
- [ ] デバッグモード遷移時のデータ保全

---

## 実施手順

各フェーズは独立してレビュー可能。優先度順:

| 順番 | フェーズ | 理由 |
|------|---------|------|
| 1 | フェーズ1（ストレージ抽象化） | 全機能の基盤、バグ影響範囲が最大 |
| 2 | フェーズ4（ゲーム再生） | コア機能、既存ユーザー影響大 |
| 3 | フェーズ2（起動フロー） | 環境分岐の起点、初期化エラーは致命的 |
| 4 | フェーズ3（エディタ機能） | メイン機能、変更量大 |
| 5 | フェーズ5（UIコンポーネント） | 新規コード量が多い（FileExplorer等） |
| 6 | フェーズ6（SW・ブラウザ固有） | ブラウザ版の要 |
| 7 | フェーズ7（Goバックエンド） | Wails版の要 |
| 8 | フェーズ9（横断的観点） | 全体を通した品質チェック |
| 9 | フェーズ8（CI/CD） | デプロイに影響 |

---

## 完了基準

- [ ] 全フェーズのコードレビュー完了
- [ ] 発見した問題の一覧を `docs/pre-merge-audit-findings.md` に記録
- [ ] Critical/Highの問題は修正済み
- [ ] `npm run test:run` 全パス
- [ ] `npm run lint` エラーなし
- [ ] `npm run build` 成功
- [ ] `npm run build:browser` 成功
