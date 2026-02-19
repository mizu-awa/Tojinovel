# とじのべる（Tojinovel）

「とじのべる」は、脱出ゲーム・ノベルゲームを作成できるエディタです。
本リポジトリは、ゲーム再生画面 および エディタ画面（React/Vite）と
デスクトップアプリ基盤（Wails / Go + WebView2）をまとめた開発環境です。

---

## 📦 機能概要

- デスクトップアプリ上でゲームデータを編集
- デスクトップアプリ上でゲームをプレビュー
- ゲームデータ（JSON）・イベントファイル（テキスト）の保存・読み込み
- 複数プロジェクトの管理（最近使ったプロジェクト一覧）
- プレイヤー書き出し（`index.html` + `assets/` をプロジェクトフォルダへ出力）
- Windows / macOS / Linux 対応

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

```powershell
npm install
wails dev
```

Wails が Vite 開発サーバー（HMR）と Go バックエンドを同時に起動します。
WebView2 ウィンドウが自動で開き、エディタが表示されます。

### Vite のみで起動する場合（ブラウザ確認）

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
│   └─ services/        # ストレージアダプター（storageService, wailsAdapter 等）
├─ index.html           # エントリポイント（エディタ）
│
├─ main.go              # Wails エントリポイント（embed.FS でdist/を内包）
├─ app.go               # Wails アプリライフサイクル管理
├─ services/            # Go バックエンドサービス
│   ├─ file_service.go  # ファイルI/O（gamedata.json / イベントファイル）
│   ├─ project_manager.go # プロジェクト管理・プレイヤー書き出し
│   └─ asset_handler.go # プロジェクトフォルダの画像・音声を配信
│
├─ wails.json           # Wails 設定
├─ scripts/             # ビルド・開発補助スクリプト
├─ samples/             # サンプルプロジェクト
├─ public/              # 開発用デフォルトプロジェクト
├─ release/             # 配布用成果物（ビルド時に生成）
├─ package.json
└─ README.md
```

---

## 🔨 ビルド（配布物の生成）

### フロントエンドのみビルド
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

---

## 📘 使い方（ユーザ向け）

1. ダウンロードした zip を任意のフォルダに展開
2. OS に合ったバイナリを起動
3. プロジェクト選択画面が表示されたら、「新規プロジェクト作成」または「フォルダを開く」を選択
4. エディタ画面でゲームを制作・編集・保存
5. アプリバーの「書き出し」ボタンでプレイヤー用ファイルを出力
6. 出力された `index.html` と `assets/` フォルダをサーバーにアップロードしてゲームを公開
