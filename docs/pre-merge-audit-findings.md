# マージ前コード監査 — 発見事項

**対象ブランチ**: `feature/toBrowser` → `main`
**調査日**: 2026-02-28

---

## サマリー

| 深刻度 | 件数 |
|--------|------|
| Critical | 4 |
| High | 7 |
| Medium | 9 |
| Low | 5 |
| **合計** | **25** |

---

## Critical

### [F-001] browserAdapter に readDirRecursive が未実装
- **深刻度**: Critical
- **フェーズ**: 1-1c / 3-6a
- **ファイル**: src/services/browserAdapter.js（export objectに欠落）
- **内容**: `storageService.js` は `readDirRecursive` を定義し、`wailsAdapter.js` も実装しているが、`browserAdapter` にはこのメソッドがない。optional chaining により `Promise.resolve([])` が返り、ブラウザ版でファイル一覧が常に空になる。`useFileList.js` 経由でシナリオエディタのコード補完パス候補が全く表示されなくなる。
- **修正案**: browserAdapterのexportに `readDirRecursive` を追加。`listAllFiles` をラップして wailsAdapter と同じ形式（パス文字列の配列）で返す関数を実装する。
- **対応状況**: ⬜ 未対応

### [F-002] copyItemState で selectedThirdItem に不正な値が設定される
- **深刻度**: Critical
- **フェーズ**: 3-5a
- **ファイル**: src/hooks/editor/useEditFunctions.js:213
- **内容**: `copyItemState()` の L213 で `setSelectedThirdItem(gameDataRef.current.items[selectedItem].hotspots[selectedSubItem])` と、ホットスポットオブジェクト全体を設定している。正しくは `.states.length`（追加後のインデックス）。直上の `addItemState`（L205）は `.states.length` で正しい。このバグによりアイテムステートのコピー後に選択状態が壊れる。
- **修正案**: L213 を `setSelectedThirdItem(gameDataRef.current.items[selectedItem].hotspots[selectedSubItem].states.length);` に修正。
- **対応状況**: ⬜ 未対応

### [F-003] browserAdapter.init() 失敗時にエラーハンドリングなし
- **深刻度**: Critical
- **フェーズ**: 2-1a / 9-1a
- **ファイル**: src/main.jsx:35-40
- **内容**: ブラウザ版の初期化で `browserAdapter.init()` が try-catch なしで呼ばれている。IndexedDB 初期化失敗（容量超過、権限拒否、プライベートブラウジング等）時にPromise rejectionが未処理となり、「読み込み中...」が永久に表示される。
- **修正案**: try-catch で囲み、エラー状態をUIに表示する。
- **対応状況**: ⬜ 未対応

### [F-004] ProjectSelector ZIP インポート成功時に loading が false にならない
- **深刻度**: Critical
- **フェーズ**: 5-2b
- **ファイル**: src/components/editor/ProjectSelector.jsx:124-128, 148-152
- **内容**: `handleImportZip` と `handleDrop` で、ZIPインポート成功時に `setLoading(false)` が呼ばれない。error パスのみ `setLoading(false)` がある。成功時は `onProjectReady()` で画面遷移するため気づきにくいが、遷移先でローディング状態が残る可能性がある。
- **修正案**: try ブロック内、`onProjectReady()` 呼び出し前に `setLoading(false)` を追加。
- **対応状況**: ⬜ 未対応

---

## High

### [F-005] storageService コアメソッドに adapter null ガードなし
- **深刻度**: High
- **フェーズ**: 1-1a
- **ファイル**: src/services/storageService.js:16-20
- **内容**: `loadGameData`, `saveGameData`, `loadEventFile`, `saveEventFile`, `resolveAssetUrl` の5メソッドは `adapter.method()` を直接呼び出し、optional chaining を使っていない。`adapter` が null（`setAdapter()` 前）で呼ばれると `TypeError` がスローされる。他の全メソッド（L23以降）は `adapter?.method()` で安全にフォールバックしている。
- **修正案**: コアメソッドも `adapter?.method()` に統一するか、アダプター未設定時に分かりやすいエラーを投げるガード関数を追加する。
- **対応状況**: ⬜ 未対応

### [F-006] BackgroundEventRunner に selectItem prop が欠落
- **深刻度**: High
- **フェーズ**: 4-1a
- **ファイル**: src/components/BackgroundEventRunner.jsx:5-59
- **内容**: `useEventExecution` は `selectItem` を受け取り、`discardItem` コマンド実行時に `selectItem?.()` を呼ぶ。しかし `BackgroundEventRunner` は props に `selectItem` を含まず、`useEventExecution` にも渡していない。バックグラウンドイベントでの `discardItem` が常にサイレントに失敗する。
- **修正案**: `BackgroundEventRunner` の props と `useEventExecution` 呼び出しに `selectItem` を追加する。
- **対応状況**: ⬜ 未対応

### [F-007] browserFS writeFile で application/json の Blob がバイナリ保存される
- **深刻度**: High
- **フェーズ**: 1-3d
- **ファイル**: src/services/browser/browserFS.js:198
- **内容**: `writeFile` は `mimeType?.startsWith("text/")` でテキスト変換を判断するが、`application/json` は `text/` で始まらないためバイナリとして保存される。同ファイル L35-38 に `isTextMime()` 関数が定義されているが未使用。ファイルピッカーからJSONファイルをインポートした場合、後の `readFile` で `file.content` が `null` になる。
- **修正案**: L198 の条件を `isTextMime(mimeType)` に変更する。
- **対応状況**: ⬜ 未対応

### [F-008] EditorApp saveAll() が fire-and-forget
- **深刻度**: High
- **フェーズ**: 9-2a
- **ファイル**: src/EditorApp.jsx:290-292
- **内容**: Ctrl+S ハンドラで `saveAll()` を await なし・catch なしで呼んでいる。保存失敗時にユーザーへのフィードバックがない。
- **修正案**: `.catch()` を追加するか、await + エラー通知を実装する。
- **対応状況**: ⬜ 未対応

### [F-009] loadBufferFromIndexedDB の Promise に .catch() なし
- **深刻度**: High
- **フェーズ**: 9-2b
- **ファイル**: src/EditorApp.jsx:386-389
- **内容**: `loadBufferFromIndexedDB().then(...)` に `.catch()` がなく、IndexedDB 読み取り失敗時に未処理 rejection が発生する。
- **修正案**: `.catch((err) => console.error('Buffer load failed:', err))` を追加。
- **対応状況**: ⬜ 未対応

### [F-010] PR チェックにブラウザ版ビルドテストが含まれていない
- **深刻度**: High
- **フェーズ**: 8-1b
- **ファイル**: .github/workflows/prcheck.yml
- **内容**: PR チェックでは Wails 版ビルドのみ実行され、`npm run build:browser` が含まれていない。ブラウザ版のビルド破損がマージ前に検出されない。
- **修正案**: `npm run build:browser` ステップを prcheck.yml に追加する。
- **対応状況**: ⬜ 未対応

### [F-011] Service Worker: DB を getFile 後即座に close
- **深刻度**: High
- **フェーズ**: 6-1a
- **ファイル**: public/browser-asset-sw.js:61-63
- **内容**: `const db = await openDB(); const file = await getFile(db, ...); db.close();` の順で実行されるが、`getFile` のトランザクションが完了する前に `db.close()` が呼ばれる可能性がある。間欠的なフェッチ失敗の原因になりうる。
- **修正案**: `db.close()` を削除するか、`getFile` 内でトランザクション完了後に閉じる。Service Worker はシングルスレッドなので接続を維持しても問題ない。
- **対応状況**: ⬜ 未対応

---

## Medium

### [F-012] viewItemNameRef がstale になる可能性
- **深刻度**: Medium
- **フェーズ**: 4-1b
- **ファイル**: src/hooks/useEventExecution.js:48, 795
- **内容**: `viewItemNameRef` は `useRef(viewItemName)` で初期化され、`lines` エフェクト発火時のみ更新される。`viewItemName` が `lines` 変更なしに変わった場合、ref が stale になる。
- **修正案**: `viewItemName` 同期用の `useEffect` を追加する。
- **対応状況**: ✅ 対応不要（意図通りの動作。イベント開始時のスナップショットとして使用され、finalize内でのみ参照されるため stale の実害なし）

### [F-013] ファイルジャンプ時にアニメーションタイマー未クリア
- **深刻度**: Medium
- **フェーズ**: 4-3a
- **ファイル**: src/hooks/useEventExecution.js:743-760
- **内容**: ファイルジャンプ発生時に `animEndTimer` がクリアされない。前のアニメーション完了タイマーが残り、古い `finalize` 関数が非同期で呼ばれ状態不整合の原因になりうる。
- **修正案**: ファイルジャンプ前に `clearTimeout(animEndTimer.current)` を追加。
- **対応状況**: ⬜ 未対応

### [F-014] useFileList: refreshFileList 失敗時も loadedRef が true になる
- **深刻度**: Medium
- **フェーズ**: 3-6a
- **ファイル**: src/hooks/editor/useFileList.js:13
- **内容**: `refreshFileList` の catch ブロックで `setFileList([])` は実行されるが、`loadedRef.current = true` が try ブロック内（L13）にあるため、エラー時は `loadedRef` が `false` のまま。実際にはこれは「リトライ可能」という意味で正しい動作だが、try の外に移動すると無限リトライを防げる。現状では初回失敗 → `ensureLoaded()` 再呼び出しで無限リトライの可能性がある。
- **修正案**: 意図に応じて `loadedRef.current = true` の位置を調整。リトライさせたくない場合は catch 内にも追加。
- **対応状況**: ⬜ 未対応

### [F-015] browserFS normalizePath に ../ バリデーションなし
- **深刻度**: Medium
- **フェーズ**: 1-5a / 9-1a
- **ファイル**: src/services/browser/browserFS.js:379-382
- **内容**: `normalizePath()` は `./` 除去とバックスラッシュ変換のみで、`../` を含むパスを許可している。IndexedDB 内のパストラバーサルは直接のセキュリティリスクは低い（サンドボックス内）が、論理的なデータ不整合を招く可能性がある。
- **修正案**: `../` を含むパスを拒否するか、正規化で除去する。
- **対応状況**: ⬜ 未対応

### [F-016] パス表記の不統一（./data/ vs data/）
- **深刻度**: Medium
- **フェーズ**: 9-1b
- **ファイル**: src/services/httpAdapter.js:9 vs src/services/browserAdapter.js:85
- **内容**: httpAdapter は `./data/gamedata.json`、browserAdapter は `data/gamedata.json` とプレフィックスが不統一。`browserFS.normalizePath` が `./` を除去するため実害は少ないが、他の箇所で同様の不整合がある場合にバグの原因になる。
- **修正案**: 全体で `./` なしに統一する。
- **対応状況**: ⬜ 未対応

### [F-017] saveIndexedDB が fire-and-forget（自動保存タイマー内）
- **深刻度**: Medium
- **フェーズ**: 9-2c
- **ファイル**: src/EditorApp.jsx:403-404
- **内容**: 2秒タイマー内で `saveIndexedDB()` を await なしで呼んでいる。保存が2秒以上かかる場合、次のタイマー発火前に前回の保存が完了しない可能性がある。
- **修正案**: await するか、保存中フラグで重複実行を防止する。
- **対応状況**: ⬜ 未対応

### [F-018] systemファイルコピー失敗がサイレント
- **深刻度**: Medium
- **フェーズ**: 9-4c
- **ファイル**: src/services/browserAdapter.js:159-168
- **内容**: プロジェクト作成時のsystemファイルコピーが `console.warn` のみでエラーを飲み込む。systemファイル（デフォルト画像等）がないとエディタでプレビューが壊れる可能性がある。
- **修正案**: 必須ファイルのコピー失敗時はユーザーに警告表示。
- **対応状況**: ⬜ 未対応

### [F-019] zipService 拡張子なしファイルの処理
- **深刻度**: Medium
- **フェーズ**: 6-2a
- **ファイル**: src/services/zipService.js:68, 108
- **内容**: `path.split(".").pop()` で拡張子を取得するが、拡張子なしファイルの場合ファイル名全体が返り、誤った MIME 判定になる。
- **修正案**: `path.lastIndexOf(".")` で拡張子の有無を確認してから処理。
- **対応状況**: ⬜ 未対応

### [F-020] Go config ファイルの非アトミック書き込み
- **深刻度**: Medium
- **フェーズ**: 7-2b
- **ファイル**: services/project_manager.go（saveConfig関数）
- **内容**: `saveConfig()` が `os.WriteFile()` を直接使用。書き込み途中でクラッシュすると config.json が破損する可能性がある。
- **修正案**: 一時ファイルに書き込み後 `os.Rename()` でアトミックに置換。
- **対応状況**: ⬜ 未対応

### [F-021] confirm() がWails WebView2でブロックされる可能性
- **深刻度**: Medium
- **フェーズ**: 5-2a
- **ファイル**: src/components/editor/ProjectSelector.jsx:166
- **内容**: プロジェクト削除時に `confirm()` を使用。Wails の WebView2 では `confirm()` がブロックされる場合がある（FileExplorer では MUI Dialog を使用）。
- **修正案**: MUI Dialog に置換する。
- **対応状況**: ⬜ 未対応

---

## Low

### [F-022] Go ListRecentProjects が無効パスを返す
- **深刻度**: Low
- **フェーズ**: 7-2b
- **ファイル**: services/project_manager.go（ListRecentProjects関数）
- **内容**: 削除済みプロジェクトのパスがフィルタされずに返される。ユーザーが選択するとエラーになるが、OpenProject 側でエラーハンドリングされている。
- **修正案**: `ListRecentProjects` でパスの存在チェックを追加。
- **対応状況**: ⬜ 未対応

### [F-023] URL.revokeObjectURL に try-finally なし
- **深刻度**: Low
- **フェーズ**: 9-3a
- **ファイル**: src/hooks/editor/useEditorData.js:39-57
- **内容**: ダウンロード処理で `a.click()` が例外を投げた場合 `URL.revokeObjectURL()` が呼ばれずメモリリークの可能性。実際には `a.click()` が例外を投げることは極めて稀。
- **修正案**: try-finally で囲む。
- **対応状況**: ⬜ 未対応

### [F-024] Go ReadDirRecursive がエラーをサイレントスキップ
- **深刻度**: Low
- **フェーズ**: 7-1b
- **ファイル**: services/file_service.go:245-248
- **内容**: `filepath.Walk` 内でエラーのあるエントリをスキップ（`return nil`）しているが、ログ出力がない。権限エラーなどで一部ファイルが見えない場合に気づけない。
- **修正案**: エラーのログ出力を追加。
- **対応状況**: ⬜ 未対応

### [F-025] エラーメッセージに err.message ではなく err を使用
- **深刻度**: Low
- **フェーズ**: 5-1c
- **ファイル**: src/components/editor/panels/FileExplorer.jsx:242
- **内容**: `${err}` でエラー表示。Error オブジェクトの場合 `[object Object]` が表示される可能性がある。
- **修正案**: `${err.message || err}` に変更。
- **対応状況**: ⬜ 未対応

### [F-026] saveFile 失敗時のSnackbar通知なし
- **深刻度**: Low
- **フェーズ**: 9-2d
- **ファイル**: src/hooks/editor/useEditorData.js:110-124
- **内容**: 保存エラー時に `console.error` のみでユーザーへの通知がない。フォールバックとして JSON ダウンロードは実行される。
- **修正案**: Snackbar でエラー通知を表示。
- **対応状況**: ⬜ 未対応
