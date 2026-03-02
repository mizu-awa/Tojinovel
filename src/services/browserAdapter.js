// Browser Adapter - IndexedDB仮想ファイルシステムを使用したブラウザ版アダプタ
// Service Worker でアセット配信を行い、既存コンポーネントの変更なしで動作する

import {
  initDB,
  getConfig,
  setConfig,
  listProjects as fsListProjects,
  createProject as fsCreateProject,
  getProject,
  updateProjectTimestamp,
  deleteProject as fsDeleteProject,
  readFile,
  writeFile,
  deleteFileEntry,
  renameFileEntry,
  createFileEntry,
  createDir as fsCreateDir,
  listDir,
  listAllFiles,
  requestPersistence,
} from "./browser/browserFS.js";
import { defaultGameData } from "../datas/defaultGameData.js";

// 現在のプロジェクトID
let currentProjectId = null;

// 初期化-----
async function init() {
  await initDB();

  // 永続化リクエスト
  await requestPersistence();

  // Service Worker 登録
  await registerServiceWorker();

  // 前回のプロジェクトを復元
  const savedId = await getConfig("currentProjectId");
  if (savedId) {
    const project = await getProject(savedId);
    if (project) {
      currentProjectId = savedId;
      await notifyServiceWorker(savedId);
    }
  }
}

// Service Worker-----
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker非対応: Blob URLフォールバックを使用");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "./browser-asset-sw.js",
      { scope: "./" }
    );
    // アクティブになるまで待機
    if (registration.installing) {
      await new Promise((resolve) => {
        registration.installing.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") resolve();
        });
      });
    }
  } catch (err) {
    console.warn("Service Worker登録失敗:", err);
  }
}

async function notifyServiceWorker(projectId) {
  if (!navigator.serviceWorker?.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: "SET_PROJECT",
    projectId,
  });
}

// ゲームデータ-----
async function loadGameData() {
  if (!currentProjectId) throw new Error("プロジェクトが選択されていません");
  const file = await readFile(currentProjectId, "data/gamedata.json");
  if (!file) throw new Error("gamedata.json が見つかりません");
  return JSON.parse(file.content);
}

async function saveGameData(data) {
  if (!currentProjectId) throw new Error("プロジェクトが選択されていません");
  const json = JSON.stringify(data, null, 2);
  await writeFile(currentProjectId, "data/gamedata.json", json);
  await updateProjectTimestamp(currentProjectId);
}

// イベントファイル-----
async function loadEventFile(path) {
  if (!currentProjectId) return null;
  try {
    const file = await readFile(currentProjectId, path);
    if (!file) return null;
    return file.content ?? "";
  } catch {
    return null;
  }
}

async function saveEventFile(path, content) {
  if (!currentProjectId) throw new Error("プロジェクトが選択されていません");
  await writeFile(currentProjectId, path, content);
}

// アセットURL解決（Service Workerが処理するのでパスをそのまま返す）
function resolveAssetUrl(path) {
  return path;
}

// プロジェクト管理-----
async function adapterListProjects() {
  const projects = await fsListProjects();
  // Wails版と同じ形式で返す（pathフィールドにidを使用）
  return projects.map((p) => ({
    name: p.name,
    path: p.id,
    lastModified: new Date(p.updatedAt).toISOString(),
  }));
}

async function openProject(id) {
  const project = await getProject(id);
  if (!project) throw new Error("プロジェクトが見つかりません: " + id);
  currentProjectId = id;
  await setConfig("currentProjectId", id);
  await updateProjectTimestamp(id);
  await notifyServiceWorker(id);
}

async function adapterCreateProject(name) {
  const project = await fsCreateProject(name);

  // デフォルトファイルを作成
  const gameDataJson = JSON.stringify(defaultGameData, null, 2);
  await writeFile(project.id, "data/gamedata.json", gameDataJson);

  // デフォルトディレクトリのプレースホルダー
  await writeFile(project.id, "data/events/.keep", "");
  await writeFile(project.id, "data/images/.keep", "");
  await writeFile(project.id, "data/sounds/.keep", "");

  // systemファイルをpublic/system/からコピー（Wails版のcopyEmbedDirと同等）
  const systemFiles = [
    "character_image.png",
    "scene_image.png",
    "item_image.png",
    "image.png",
    "transparent.png",
  ];
  const failedFiles = [];
  for (const filename of systemFiles) {
    try {
      const res = await fetch(`./system/${filename}`);
      if (!res.ok) {
        failedFiles.push(filename);
        continue;
      }
      const blob = await res.blob();
      await writeFile(project.id, `system/${filename}`, blob);
    } catch (e) {
      console.warn(`systemファイルコピー失敗: ${filename}`, e);
      failedFiles.push(filename);
    }
  }
  if (failedFiles.length > 0) {
    console.warn(`以下のsystemファイルのコピーに失敗しました: ${failedFiles.join(", ")}`);
  }

  // 作成したプロジェクトを開く
  currentProjectId = project.id;
  await setConfig("currentProjectId", project.id);
  await notifyServiceWorker(project.id);

  return project.id;
}

// ブラウザ版ではOSダイアログは使えない → null を返す
function selectProjectDialog() {
  return Promise.resolve(null);
}

function selectNewProjectParentDialog() {
  return Promise.resolve(null);
}

async function getCurrentProjectName() {
  if (!currentProjectId) return "";
  const project = await getProject(currentProjectId);
  return project?.name || "";
}

function getCurrentProjectPath() {
  return currentProjectId || "";
}

// ファイルツリー-----
async function adapterReadDir(path) {
  if (!currentProjectId) return [];
  return await listDir(currentProjectId, path);
}

async function adapterDeleteFile(path) {
  if (!currentProjectId) return;
  await deleteFileEntry(currentProjectId, path);
}

async function adapterRenameFile(oldPath, newPath) {
  if (!currentProjectId) return;
  await renameFileEntry(currentProjectId, oldPath, newPath);
}

async function adapterCreateFile(path) {
  if (!currentProjectId) return;
  await createFileEntry(currentProjectId, path);
}

async function adapterCreateDir(path) {
  if (!currentProjectId) return;
  await fsCreateDir(currentProjectId, path);
}

// プレイヤー書き出し（ブラウザ版では未サポート、Phase 5でZIPダウンロードとして実装予定）
function exportPlayer() {
  return Promise.resolve(null);
}

// ファイルインポート（ブラウザのファイルピッカー）
async function importFile(destDir) {
  if (!currentProjectId) return null;

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = "image/*,audio/*,.txt,.json";

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) {
        resolve(null);
        return;
      }

      const file = input.files[0];
      const path = destDir
        ? destDir.replace(/\/$/, "") + "/" + file.name
        : file.name;

      await writeFile(currentProjectId, path, file, file.type);
      resolve(path);
    };

    // キャンセル時
    input.oncancel = () => resolve(null);

    input.click();
  });
}

// ファイルD&Dインポート（Blobをそのまま書き込む）
async function writeFileBlob(destPath, blob) {
  if (!currentProjectId) return null;
  await writeFile(currentProjectId, destPath, blob, blob.type);
  return destPath;
}

// プロジェクト削除（ブラウザ版追加機能）
async function adapterDeleteProject(id) {
  await fsDeleteProject(id);
  if (currentProjectId === id) {
    currentProjectId = null;
    await setConfig("currentProjectId", null);
  }
}

// 再帰的ファイル一覧（wailsAdapterと同じパス文字列の配列で返す）
async function adapterReadDirRecursive() {
  if (!currentProjectId) return [];
  const files = await listAllFiles(currentProjectId);
  return files
    .filter((f) => !f.path.endsWith("/.keep"))
    .map((f) => f.path);
}

// 全ファイル取得（ZIP出力用）
async function getAllFiles(projectId) {
  return await listAllFiles(projectId || currentProjectId);
}

export const browserAdapter = {
  init,

  // ゲームデータ
  loadGameData,
  saveGameData,

  // イベントファイル
  loadEventFile,
  saveEventFile,

  // アセットURL
  resolveAssetUrl,

  // プロジェクト管理
  listProjects: adapterListProjects,
  openProject,
  createProject: adapterCreateProject,
  selectProjectDialog,
  selectNewProjectParentDialog,
  getCurrentProjectName,
  getCurrentProjectPath,

  // ファイルツリー
  readDir: adapterReadDir,
  deleteFile: adapterDeleteFile,
  renameFile: adapterRenameFile,
  createFile: adapterCreateFile,
  createDir: adapterCreateDir,

  // プレイヤー書き出し
  exportPlayer,

  // ファイルインポート
  importFile,

  // ファイルD&Dインポート
  writeFileBlob,

  // 再帰的ファイル一覧（wailsAdapterと同じパス文字列の配列で返す）
  readDirRecursive: adapterReadDirRecursive,

  // ブラウザ版追加機能
  deleteProject: adapterDeleteProject,
  getAllFiles,
};
