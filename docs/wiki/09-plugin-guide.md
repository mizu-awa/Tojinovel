# 🔌プラグイン作成ガイド

> ⚠️ **Experimental（実験的機能）**: この機能は現在実験段階です。仕様が変更・廃止される可能性があります。

`#外部関数` コマンドで呼び出すJavaScriptプラグインの作成方法を説明します。

---

## 基本的な書き方

プラグインは **ES Modules 形式**で記述します。

```javascript
// plugins/myPlugin.js

export function 関数名(引数1, 引数2) {
  // 処理
  return 戻り値;
}
```

`export` を付けた関数が `#外部関数` コマンドから呼び出せます。

---

## 同期関数

戻り値が `Promise` でない通常の関数です。
イベントの進行をブロックせず、即座に次のコマンドへ進みます。

```javascript
// plugins/math.js

export function add(a, b) {
  return Number(a) + Number(b);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), Number(min)), Number(max));
}
```

イベントでの使用例:
```
#外部関数: plugins/math.js, add, result, score, bonus
「合計スコアは[result]点です」

#外部関数: plugins/math.js, clamp, hp, hp, 0, 100
```

---

## 非同期関数

`async` 関数または `Promise` を返す関数です。
完了するまでイベントの進行が一時停止します（タイムアウト: 10秒）。

```javascript
// plugins/api.js

export async function fetchRanking(userId) {
  const res = await fetch(`https://example.com/api/ranking/${userId}`);
  if (!res.ok) throw new Error("通信エラー");
  const data = await res.json();
  return data.rank;
}
```

イベントでの使用例:
```
#外部関数: plugins/api.js, fetchRanking, rank, player1
「あなたのランクは[rank]位です」
```

---

## 引数について

`#外部関数` から渡される引数は常に **数値または文字列のプリミティブ値**です。
オブジェクトや配列は渡されません。

```javascript
export function greet(name) {
  // name は文字列または数値
  return `こんにちは、${name}さん！`;
}
```

数値として扱いたい場合は `Number()` で変換してください:

```javascript
export function multiply(a, b) {
  return Number(a) * Number(b);
}
```

---

## 複数の関数を1ファイルにまとめる

1つのファイルに複数の関数を定義できます。

```javascript
// plugins/utils.js

export function formatDate(timestamp) {
  return new Date(Number(timestamp)).toLocaleDateString("ja-JP");
}

export function truncate(text, maxLen) {
  if (String(text).length <= Number(maxLen)) return text;
  return String(text).slice(0, Number(maxLen)) + "…";
}

export function randomChoice(...items) {
  return items[Math.floor(Math.random() * items.length)];
}
```

---

## npmパッケージの使用（バンドル手順）

npmパッケージを使う場合は、事前にバンドルして1ファイルにまとめます。

### esbuild を使う場合

```bash
# インストール
npm install -g esbuild

# バンドル（プラグインのエントリポイントを指定）
esbuild src/myPlugin.js --bundle --format=esm --outfile=plugins/myPlugin.js
```

### rollup を使う場合

```bash
# インストール
npm install -g rollup

# バンドル
rollup src/myPlugin.js --file plugins/myPlugin.js --format esm
```

### バンドル前のソースファイル例

```javascript
// src/csvPlugin.js
import Papa from "papaparse";

export function parseCsv(csvText) {
  const result = Papa.parse(csvText, { header: true });
  return JSON.stringify(result.data);
}
```

バンドル後の `plugins/csvPlugin.js` を `plugins/` フォルダに配置します。

---

## プラグインの配置場所

プラグインファイルはゲームプロジェクトの `plugins/` フォルダに配置することを推奨します。

```
game-project/
  events/
    story.txt
  plugins/
    math.js       ← プラグインはここに配置
    api.js
    utils.js
  images/
  ...
```

イベントからは次のように参照します:

```
#外部関数: plugins/math.js, add, result, 10, 20
```

---

## エラーハンドリング

関数内で例外が発生した場合、ゲームは停止せず進行を続けます。
戻り値は空文字列 `""` になります。

エラーの詳細はブラウザのコンソールに出力されます。

```javascript
export async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    return data.value;
  } catch (e) {
    console.error("[myPlugin] fetchData failed:", e);
    return ""; // エラー時のフォールバック値
  }
}
```

---

## 制約事項

| 項目 | 制約 |
|------|------|
| ファイル形式 | ES Modules のみ（`export` 必須） |
| ファイル拡張子 | `.js` のみ |
| ファイル名 | `[` `]` を含めることは禁止 |
| 引数の型 | 数値または文字列のプリミティブ値のみ |
| CDN import | 動作するが非推奨（オフライン環境で動かない） |
| タイムアウト | 非同期関数は10秒でタイムアウト |
| gameDataへのアクセス | 不可（引数はプリミティブ値のみ） |

---

## キャッシュについて

一度読み込んだプラグインファイルはキャッシュされ、同じイベント内での2回目以降の呼び出しは高速になります。

エディタでプラグインファイルを保存すると、キャッシュが自動的にクリアされます。

---

## 関連項目

- [イベントコマンドリファレンス - 外部関数](./05-event-reference.md#12-外部関数externalfunc)
