// ブラウザ版ゲーム出力サービス
// player.html + assets/ + プロジェクトデータをZIPにまとめてダウンロード
// 事前ビルドされた public/player-dist/ からplayerランタイムを取得する

import JSZip from "jszip";
import { initDB, listAllFiles } from "./browser/browserFS.js";

const BASE = import.meta.env.BASE_URL;

// システムアセット一覧（public/system/ にあるデフォルト画像）
const SYSTEM_ASSETS = [
  "system/character_image.png",
  "system/scene_image.png",
  "system/item_image.png",
  "system/image.png",
  "system/transparent.png",
];

// アイコンファイル
const ICON_FILES = ["tojinovel.svg", "tojinovel_dark.svg"];

// player-dist/player.htmlをfetch
async function fetchPlayerHTML() {
  const res = await fetch(`${BASE}player-dist/player.html`);
  if (!res.ok) {
    throw new Error(
      "playerランタイムが見つかりません。npm run build:player を実行してください。"
    );
  }
  return await res.text();
}

// HTMLからscript/link/modulepreloadのアセットパスを抽出（base="./"形式）
function extractAssetPaths(html) {
  const paths = [];
  // script src="./assets/xxx.js"
  const scriptRe = /src="\.\/([^"]+)"/g;
  for (const m of html.matchAll(scriptRe)) paths.push(m[1]);
  // link href="./assets/xxx.js" or "./assets/xxx.css"
  const linkRe = /href="\.\/([^"]+\.(?:js|css))"/g;
  for (const m of html.matchAll(linkRe)) paths.push(m[1]);
  return [...new Set(paths)];
}

// ファイルをfetch（player-dist/からの相対パス）
async function fetchFromPlayerDist(path) {
  const res = await fetch(`${BASE}player-dist/${path}`);
  if (!res.ok) throw new Error(`${path} の取得に失敗: ${res.status}`);
  return res;
}

// ゲーム出力: player + プロジェクトデータをZIPダウンロード
export async function exportPlayerAsZip(projectId, projectName) {
  await initDB();

  const zip = new JSZip();

  // 1. player.htmlを取得してindex.htmlとして追加
  const playerHTML = await fetchPlayerHTML();
  zip.file("index.html", playerHTML);

  // 2. 参照されるJS/CSSアセットを取得して追加
  const assetPaths = extractAssetPaths(playerHTML);
  for (const path of assetPaths) {
    const res = await fetchFromPlayerDist(path);
    const content = await res.text();
    zip.file(path, content);
  }

  // 3. プロジェクトデータをIndexedDBから取得して追加
  const files = await listAllFiles(projectId);
  for (const file of files) {
    if (file.path.endsWith("/.keep")) continue;
    if (file.type === "text") {
      zip.file(file.path, file.content || "");
    } else if (file.blob) {
      zip.file(file.path, file.blob);
    }
  }

  // 4. システムアセットを追加（プロジェクトに含まれていない場合）
  const existingPaths = new Set(files.map((f) => f.path));
  for (const path of SYSTEM_ASSETS) {
    if (!existingPaths.has(path)) {
      try {
        const res = await fetch(`${BASE}${path}`);
        if (res.ok) zip.file(path, await res.blob());
      } catch {
        // システムアセットがない場合はスキップ
      }
    }
  }

  // 5. アイコンファイルを追加
  for (const icon of ICON_FILES) {
    if (!existingPaths.has(icon)) {
      try {
        const res = await fetch(`${BASE}${icon}`);
        if (res.ok) zip.file(icon, await res.text());
      } catch {
        // アイコンがない場合はスキップ
      }
    }
  }

  // 6. ZIP生成してダウンロード
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (projectName || "game") + ".zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
