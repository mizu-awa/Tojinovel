# とじのべる（Tojinovel）

「とじのべる」は、脱出ゲーム・ノベルゲームを作成できるエディタです。
本リポジトリは、ゲーム再生画面 および エディタ画面（React/Vite）と
デスクトップアプリ基盤（Wails / Go + WebView2）をまとめた開発環境です。

**2つのビルドターゲット**があります：
- **Wails版**（デスクトップアプリ）— バイナリを配布
- **ブラウザ版 (Web Edition)**（静的ホスティング）— GitHub Pages等にデプロイ可能

---

## 📦 機能概要

- ゲームデータを編集（Wails版: デスクトップアプリ / ブラウザ版: Webブラウザ）
- ゲームをプレビュー（デバッグプレイ）
- ゲームデータ（JSON）・イベントファイル（テキスト）の保存・読み込み
- 複数プロジェクトの管理
- プレイヤー書き出し（`index.html` + `assets/` を出力）
- ゲーム出力（HTML）— Wails版: フォルダ直接書き出し / ブラウザ版: ZIPダウンロード
- Windows / macOS / Linux 対応（Wails版）
- ブラウザ版: データはIndexedDBに保存。ZIPでエクスポート/インポート可能

---

## 🖥 必要環境

### 開発者向け（このリポジトリを編集する場合）
- Node.js 18+（推奨：v20 / v22）
- npm
- Go 1.21+
- Wails CLI v2（`go install github.com/wailsapp/wails/v2/cmd/wails@latest`）
- PowerShell（ビルドスクリプト実行用）

### ユーザ（配布版を使うだけなら）
- Windows / macOS / Linux（対応バイナリを使用）
- WebView2ランタイム（Windowsはプリインストール済み。macOS/LinuxはWebKit2）

---

## 🚀 開発環境の起動

### Wails版（推奨）

```powershell
npm install
wails dev
```

Wails が Vite 開発サーバー（HMR）と Go バックエンドを同時に起動します。
WebView2 ウィンドウが自動で開き、エディタが表示されます。

### ブラウザ版

```bash
npm install
npm run dev:browser
```

ブラウザで `http://localhost:5173` を開くとエディタが表示されます。
データは IndexedDB に保存され、Go バックエンドは不要です。

### Vite のみで起動する場合（UI確認のみ）

```bash
npm run dev
```

UIの表示確認はできますが、**保存機能は動作しません**（Go バックエンドがないため）。

---

## 🧪 サンプルデータでテスト

サンプルプロジェクトを `public/` にコピーして `wails dev` で確認できます。
（`wails dev` はデフォルトで `./public/` をプロジェクトパスとして使用します）

```powershell
# サンプルデータをコピー
./scripts/use-sample.ps1 event_test

# 開発環境を起動
wails dev
```

### 利用可能なサンプル

| サンプル名 | 説明 |
|-----------|------|
| `event_test` | イベントコマンドのテスト用 |
| `simple_demo` | 基本的なゲームデモ |

```powershell
# 一覧表示
./scripts/use-sample.ps1
```

---

## 🧬 ユニットテスト

Vitest を使用したユニットテストを実行できます。

```bash
# ウォッチモードで実行（ファイル変更を監視）
npm run test

# 一回だけ実行
npm run test:run
```

### テスト対象

現在、以下のモジュールがテスト対象です：

- `src/hooks/eventExecutionUtils.js` - イベント実行エンジンのユーティリティ関数
  - 条件式の評価（`evalCondition`）
  - フラグ計算（`calcFlag`）
  - 変数展開（`expandVars`, `expandVarsShallow`）
  - テキスト解析（`parseLineText`）

---

## プロジェクト構造

```
/
├─ src/                 # React（Vite）側リソース
│   ├─ components/      # UI コンポーネント
│   ├─ hooks/           # カスタムフック
│   └─ services/        # ストレージアダプター
│       ├─ storageService.js    # Adapter管理（共通）
│       ├─ wailsAdapter.js      # Wails版アダプター
│       ├─ browserAdapter.js    # ブラウザ版アダプター
│       ├─ browser/browserFS.js # IndexedDB仮想FS
│       ├─ zipService.js        # ZIPエクスポート/インポート
│       ├─ playerExportService.js # ブラウザ版ゲーム出力
│       └─ httpAdapter.js       # フォールバック用
├─ index.html           # エントリポイント（エディタ）
├─ public/
│   └─ browser-asset-sw.js  # ブラウザ版 Service Worker
│
├─ main.go              # Wails エントリポイント（embed.FS でdist/を内包）
├─ app.go               # Wails アプリライフサイクル管理
├─ services/            # Go バックエンドサービス（Wails版のみ）
│   ├─ file_service.go  # ファイルI/O（gamedata.json / イベントファイル）
│   ├─ project_manager.go # プロジェクト管理・プレイヤー書き出し
│   └─ asset_handler.go # プロジェクトフォルダの画像・音声を配信
│
├─ wails.json           # Wails 設定
├─ scripts/             # ビルド・開発補助スクリプト
├─ samples/             # サンプルプロジェクト
├─ public/              # 開発用デフォルトプロジェクト
├─ dist/                # Wails版フロントエンドビルド出力
├─ dist-browser/        # ブラウザ版ビルド出力
├─ release/             # 配布用成果物（ビルド時に生成）
├─ package.json
└─ README.md
```

---

## 🔨 ビルド（配布物の生成）

### Wails版フロントエンドのみビルド
```bash
npm run build
```
出力先: `dist/`（Wailsビルド時に自動で実行されるため、通常は不要）

### Wailsアプリをビルド（推奨）
```powershell
wails build
```
出力先: `build/bin/`（カレントOS用バイナリ）

### リリースZIPを作成
```powershell
./scripts/build-all.ps1
```
`wails build` 実行後、バイナリ・ライセンス等をまとめて `release/` にZIP出力します。

### ブラウザ版をビルド
```bash
npm run build:browser
```
出力先: `dist-browser/`（静的ファイル一式）。GitHub Pages / Netlify / Vercel 等にデプロイ可能。**HTTPS必須**（Service Worker の制約）。

`build:browser` は内部で `build:player`（ゲーム再生用ランタイムの事前ビルド）を自動実行します。

### ゲーム再生用ランタイムのみビルド
```bash
npm run build:player
```
出力先: `public/player-dist/`。ブラウザ版の「ゲーム出力 (HTML)」機能で使用するplayerランタイムを事前ビルドします。`npm run dev:browser` でゲーム出力をテストする場合は、事前に一度実行してください。

---

## 📘 使い方（ユーザ向け）

### Wails版（デスクトップアプリ）

1. ダウンロードした zip を任意のフォルダに展開
2. OS に合ったバイナリを起動
3. プロジェクト選択画面が表示されたら、「新規プロジェクト作成」または「フォルダを開く」を選択
4. エディタ画面でゲームを制作・編集・保存
5. アプリバーの「書き出し」ボタンでプレイヤー用ファイルを出力
6. 出力された `index.html` と `assets/` フォルダをサーバーにアップロードしてゲームを公開

### ブラウザ版（Web Edition）

1. ブラウザでデプロイ先URLを開く
2. 「新規プロジェクト」を作成、またはZIPファイルをドラッグ＆ドロップでインポート
3. エディタ画面でゲームを制作・編集・保存（データはブラウザのIndexedDBに保存）
4. アプリバーの「エクスポート」ボタンから出力形式を選択：
   - **ゲーム出力 (HTML)** — `index.html` + `assets/` + `data/` をZIPでダウンロード。解凍してサーバーにアップロードすればゲームを公開できます
   - **プロジェクトZIP** — プロジェクトデータのバックアップ用

> ⚠️ ブラウザ版のデータはブラウザ内に保存されます。キャッシュクリアやブラウザのストレージ解放でデータが消える場合があります。定期的にZIPエクスポートでバックアップしてください。
