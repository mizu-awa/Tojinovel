# 外部JavaScript実行機能（外部関数） - 設計仕様書

## 概要

ユーザーが記述したJavaScriptファイルをイベントコマンドから呼び出し、
CSVパース・サーバー通信・複雑なフラグ計算などの処理を実行する機能。

---

## コマンド構文

```
#外部関数:ファイル名.js, 関数名, 戻り値変数名, 引数1, 引数2, ...
```

### 引数の解釈

既存コマンド（`#フラグ`, `#if`等）と同じ `parseOperand` 方式を使用する。

| 記述 | 解釈 |
|------|------|
| `score` | variablesに`score`があればその値、なければ文字列`"score"` |
| `10` | 数値`10` |
| `"hello"` | 文字列リテラル`"hello"` |
| `'hello'` | 文字列リテラル`"hello"` |

- `[varName]` による変数展開は `expandVarsShallow` により全フィールドに適用される（既存と同じ）
- ファイル名に `[]` を含めることは禁止（実用上問題なし）

### 戻り値の省略

3番目のパラメータを空にすると戻り値を破棄する。

```
#外部関数:analytics.js, sendEvent,, pageView, button_click
                                  ^^-- 空欄 = 戻り値なし
```

`_` 等のダミー変数名を書いた場合は、通常の変数として実際に作成される（特別扱いしない）。

### 英語エイリアス

```
#externalFunc:plugin.js, calc, result, 10, 20
```

---

## 同期/非同期の自動判定

プラグイン関数の戻り値が `Promise` かどうかで自動的に処理を分岐する。

### 同期関数の場合

whileループ内で即座に実行・変数格納し、次のコマンドへ進む。
breakは発生しない。

```javascript
// プラグイン側
export function calc(a, b) {
  return Number(a) + Number(b);
}
```

### 非同期関数の場合

ブロッキングイベントとして扱い、whileループをbreakする。
ループ外で `await` し、完了後にイベントを再開する。

```javascript
// プラグイン側
export async function fetchData(userId) {
  const res = await fetch(`/api/user/${userId}`);
  const data = await res.json();
  return data.score;
}
```

### 判定ロジック

```javascript
const ret = module[funcName](...resolvedArgs);
if (ret instanceof Promise) {
  // ブロッキング: break → await → 変数格納 → 再開
} else {
  // 非ブロッキング: 即座に変数格納 → ループ続行
}
```

### タイムアウト

非同期実行時のみ適用。デフォルト10秒。
タイムアウト時はエラー扱い（コンソール警告、戻り値は空文字列）。

---

## JSファイルの読み込みとセキュリティ

### 読み込みフロー（全環境共通）

```
storage.loadEventFile("plugins/myPlugin.js")
  → テキスト取得
  → new Blob([code], { type: "application/javascript" })
  → URL.createObjectURL(blob)
  → import(blobUrl)
  → module[funcName](...args)
  → URL.revokeObjectURL(blobUrl)
```

- Wails: Go経由でローカルファイル読み込み → Blob URL
- ブラウザ: IndexedDB経由で読み込み → Blob URL
- HTTP: fetch経由で読み込み → Blob URL

既存の `loadEventFile` をそのまま使用。新メソッド不要。
ただし拡張子チェック（`.js` のみ許可）をパーサーまたは実行側で行う。

### 隔離方針

- Web Worker / iframe サンドボックスは使わない（コスト対効果が低い）
- プラグインに渡す引数はプリミティブ値のみ（parseOperandの出力 = 数値 or 文字列）
- gameDataへの参照は一切渡さない → State直接書き換えは構造的に不可能
- `window` / `document` へのアクセスは制限しない

### モジュールキャッシュ

- `Map<filePath, module>` でキャッシュし、同じファイルの再importを避ける
- エディタでファイル保存時にキャッシュを破棄する仕組みを用意

### ライブラリの使用

- npmパッケージを使う場合はバンドル済みファイルを要求（esbuild/rollup等）
- CDN importは禁止しないが非推奨（オフライン環境で動かないため）
- ドキュメントにバンドル手順を記載

---

## エラーハンドリング

| 状況 | 動作 |
|------|------|
| ファイルが見つからない | コンソール警告、戻り値は空文字列、進行継続 |
| 関数が見つからない | コンソール警告、戻り値は空文字列、進行継続 |
| 実行時例外 | try-catchで捕捉、コンソール警告、戻り値は空文字列、進行継続 |
| 非同期タイムアウト | コンソール警告、戻り値は空文字列、進行継続 |
| デバッグモード時 | 上記に加えてエラーダイアログを表示 |

---

## エディタ対応

### 構文ハイライト（eventLanguage.js）

`#外部関数:` を `keyword` トークンとして追加。

### オートコンプリート（eventCompletion.js）

`#外部関数:` の補完候補を追加。

### ファイルエクスプローラ（FileExplorer.jsx）

変更不要。`plugins/` フォルダは自然にツリーに表示される。

---

## パーサー実装方針（useEventLines.js）

```javascript
case command.startsWith("外部関数:"): {
  const parts = command.replace("外部関数:", "").split(",").map(s => s.trim());
  blocks.push({
    type: "externalFunc",
    file: parts[0],              // ファイル名（リテラル）
    func: parts[1],              // 関数名（リテラル）
    returnVar: parts[2] || null, // 空欄 → null（戻り値なし）
    args: parts.slice(3)         // 実行時にparseOperandで解決
  });
  break;
}
```

英語エイリアス: `externalFunc:` → `外部関数:` を `prefixAliases` に追加。

---

## 実行実装方針（useEventExecution.js）

```javascript
case "externalFunc": {
  const resolvedArgs = line.args.map(a => parseOperand(a, newGameData.variables));
  const ret = await executeExternalFunc(line.file, line.func, resolvedArgs);

  if (ret instanceof Promise) {
    // ブロッキング: 状態を保存してbreak
    // Promise完了後に変数格納 → handleClick()で再開
  } else {
    // 非ブロッキング: 即座に変数格納
    if (line.returnVar) {
      // 変数に格納（無ければ新規作成）
    }
  }
  break;
}
```

実際のモジュール読み込み・実行ロジックは `externalFuncService.js` 等に切り出す。

---

## 実装計画

### Phase 1: コア機能

1. **externalFuncService.js 作成**
   - `loadModule(filePath)` — ファイル読み込み → Blob URL → import → キャッシュ
   - `executeFunc(filePath, funcName, args)` — モジュール取得 → 関数実行 → 結果返却
   - タイムアウト処理（Promise.race）
   - エラーハンドリング（try-catch）

2. **useEventLines.js 修正**
   - `#外部関数:` コマンドのパース追加
   - `prefixAliases` に `externalFunc:` → `外部関数:` 追加

3. **useEventExecution.js 修正**
   - `type: "externalFunc"` の実行処理追加
   - 同期: whileループ内で即実行
   - 非同期: ブロッキングイベントとしてbreak → await → 再開

### Phase 2: エディタ対応

4. **eventLanguage.js 修正**
   - `#外部関数:` のハイライトトークン追加

5. **eventCompletion.js 修正**
   - `#外部関数:` の補完候補追加

### Phase 3: ドキュメント

6. **05-event-reference.md 更新**
   - 外部関数コマンドのリファレンス追加

7. **プラグイン作成ガイド**
   - プラグインの書き方、バンドル手順、制約事項

### Phase 4: テスト

8. **externalFuncService.test.js**
   - モジュール読み込み、同期/非同期実行、エラー処理、タイムアウトのテスト

---

## 注意事項・既知のリスク

| リスク | 対策 |
|--------|------|
| `expandVarsShallow` がファイル名の `[]` も展開する | ファイル名に `[]` 禁止（規約） |
| セーブ/ロード時にプラグイン実行中だった場合 | 非同期実行中のセーブを禁止、またはリロード時に再実行 |
| BackgroundEventRunner での非同期実行 | 同じブロッキング方式が使えるが要テスト |
| キャッシュの整合性 | エディタ保存時にキャッシュクリアする仕組みが必要 |
