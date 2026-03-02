// build-player-dist.js
// playerランタイム（ゲーム再生用HTML + JS/CSS）を public/player-dist/ に事前ビルド
// ゲーム出力（エクスポート）時にここからfetchして使う

import { build } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { rmSync, readFileSync, readdirSync, unlinkSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/player-dist");

// 既存の出力をクリーン
try {
  rmSync(outDir, { recursive: true, force: true });
} catch {
  // 存在しない場合はスキップ
}

await build({
  root,
  plugins: [react()],
  base: "./",
  publicDir: false, // publicディレクトリのコピーを無効化（衝突回避）
  build: {
    outDir: "public/player-dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        player: resolve(root, "player.html"),
      },
    },
  },
  logLevel: "info",
});

// player.htmlが参照するアセットだけ残し、不要ファイルを削除
const playerHTML = readFileSync(join(outDir, "player.html"), "utf-8");
const referencedFiles = new Set();
// src="./assets/xxx" と href="./assets/xxx" を抽出
for (const m of playerHTML.matchAll(/(?:src|href)="\.\/assets\/([^"]+)"/g)) {
  referencedFiles.add(m[1]);
}

// assetsディレクトリから不要ファイルを削除
const assetsDir = join(outDir, "assets");
for (const f of readdirSync(assetsDir)) {
  if (!referencedFiles.has(f)) {
    unlinkSync(join(assetsDir, f));
  }
}

// トップレベルの不要ファイルを削除（index.html等）
for (const f of readdirSync(outDir)) {
  if (f !== "player.html" && f !== "assets") {
    try { unlinkSync(join(outDir, f)); } catch { /* dir, skip */ }
  }
}

console.log("Player runtime built to public/player-dist/");
console.log("  Files:", ["player.html", ...referencedFiles].join(", "));
