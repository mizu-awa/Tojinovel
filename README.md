# とじのべる（Tojinovel）

「とじのべる」は、脱出ゲーム・ノベルゲームを作成できるエディタです。  
本リポジトリは、ゲーム再生画面 および エディタ画面（React/Vite）と  
動作用のローカルサーバ（Go）をまとめた開発環境です。

---

## 📦 機能概要

- ブラウザ上でゲームデータを編集
- ブラウザ上でゲームをプレビュー
- ゲームデータ（JSON）の保存・読み込み
- Windows / macOS / Linux に対応した実行バイナリ

---

## 🖥 必要環境

### 開発者向け（このリポジトリを編集する場合）
- Node.js 18+（推奨：v20 / v22）
- npm
- Go 1.21+
- PowerShell（ビルドスクリプト実行用）

### ユーザ（配布版を使うだけなら）
- Windows / macOS / Linux（対応バイナリを使用）
- Webブラウザ

---

## 🚀 開発環境の起動

### フロントエンドを起動
```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 が開きます。  
Go サーバは server ディレクトリで以下で起動できます：

### GOサーバを起動
```bash
cd server
go run server.go
```
config.jsonに記載のポート番号で起動します。

## プロジェクト構造
/   
├─ src/             # React（Vite）側 リソース   
├─ index.html       # ゲーム再生画面      
├─ editor.html      # ゲーム編集画面     
│  
├─ server/          # Go サーバ  
│   ├─ main.go  
│   ├─ config.json  # 開発用サーバ設定ファイル  
│   ├─ build/       # OSごとのビルド成果物  
│   └─ build-all.ps1  
│  
├─ build-all.ps1    # リリースフォルダ作成バッチ  
├─ release          # 配布用成果物  
│  
├─ package.json  
└─ README.md

## 🔨 ビルド（配布物の生成）
### フロントエンドのみをビルド
```bash
npm run build
```

### Go バイナリのみをビルド（全 OS 用）
```bash
cd server
./build-all.ps1
```

### 一括ビルド
```powershell
./scripts/build-all.ps1
```

## ビルド後のフォルダ構成例
```
/release  
├─ game/                # Reactアプリ本体  
│   ├─ assets  
│   ├─ index.html  
│   ├─ editor.html  
│   └─ data/  
│       └─ gamedata.json      
│  
├─ tojinovel-...           # サーバ実行用バイナリファイル      
├─ ...     
```

## 📘 使い方（ユーザ向け）

1. ダウンロードした zip を任意のフォルダに展開
2. OS に合ったバイナリを起動
3. ブラウザが自動で立ち上がり、編集画面が表示される
4. /game配下に画像・音楽・イベント用テキストなどを配置
5. editor.html でゲームを編集
6. 保存（Ctrl+Sでも可）
7. index.html でゲームをプレビュー
8. 完成後は /game/data/gamedata.json を含む /game フォルダを公開サーバへアップロード

完成したゲーム情報は /game/data/gamedata.json に出力されます。  
/game をご自身のサーバーにアップロードすると、ゲームを公開できます。  
editor.htmlと/game/systemが不要な場合は削除してください。

