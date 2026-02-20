// ブラウザ版アセット配信用 Service Worker
// IndexedDB からプロジェクトファイルを読み取り、fetchリクエストに応答する
// Wails版の AssetHandler (Go) と同等の役割

const DB_NAME = "TojinovelBrowserFS";
const DB_VERSION = 1;

// 現在のプロジェクトID（postMessageで更新）
let activeProjectId = null;

// アセット対象パスのプレフィックス
const ASSET_PREFIXES = ["data/", "system/"];

// インストール時: 即座にアクティブ化
self.addEventListener("install", () => {
  self.skipWaiting();
});

// アクティブ化時: 既存クライアントを制御
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// メッセージ受信: プロジェクトID切替
self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_PROJECT") {
    activeProjectId = event.data.projectId;
  }
});

// fetchイベント: アセットリクエストの傍受
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 同一オリジンのみ対象
  if (url.origin !== self.location.origin) return;

  // パス取得（先頭の / を除去）
  let path = url.pathname.replace(/^\//, "");

  // Viteのベースパス考慮（相対パスビルド時）
  // scope相対のパスに正規化
  const scope = new URL("./", self.location.href).pathname;
  if (path.startsWith(scope.replace(/^\//, ""))) {
    path = path.slice(scope.replace(/^\//, "").length);
  }

  // アセットパスかどうか判定
  const isAsset = ASSET_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (!isAsset) return;

  // プロジェクト未選択なら通常のfetchにフォールバック
  if (!activeProjectId) return;

  event.respondWith(handleAssetRequest(path));
});

// IndexedDBからファイルを読み取りResponseを返す
async function handleAssetRequest(path) {
  try {
    const db = await openDB();
    const file = await getFile(db, activeProjectId, path);
    db.close();

    if (!file) {
      return new Response("Not found: " + path, { status: 404 });
    }

    const headers = {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Cache-Control": "no-store",
    };

    if (file.type === "text") {
      return new Response(file.content, { headers });
    } else {
      return new Response(file.blob, { headers });
    }
  } catch (err) {
    return new Response("Service Worker error: " + err.message, {
      status: 500,
    });
  }
}

// Raw IndexedDB API（Service Worker内ではライブラリを使用できないため）
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("files")) {
        const fileStore = db.createObjectStore("files", {
          keyPath: ["projectId", "path"],
        });
        fileStore.createIndex("byProject", "projectId", { unique: false });
      }
      if (!db.objectStoreNames.contains("config")) {
        db.createObjectStore("config", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getFile(db, projectId, path) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const request = store.get([projectId, path]);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
