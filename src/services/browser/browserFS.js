// IndexedDB 仮想ファイルシステム
// ブラウザ版でプロジェクトファイル（JSON, テキスト, 画像, 音声）を管理する

const DB_NAME = "TojinovelBrowserFS";
const DB_VERSION = 1;

let db = null;

// MIME type 判定テーブル
const MIME_TYPES = {
  ".json": "application/json",
  ".txt": "text/plain",
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function getMimeType(path) {
  const ext = "." + path.split(".").pop().toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// テキスト系MIMEか判定
function isTextMime(mimeType) {
  return (
    mimeType.startsWith("text/") || mimeType === "application/json"
  );
}

// DB初期化-----
export async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // プロジェクトメタ情報
      if (!database.objectStoreNames.contains("projects")) {
        database.createObjectStore("projects", { keyPath: "id" });
      }

      // 仮想ファイル（複合キー: [projectId, path]）
      if (!database.objectStoreNames.contains("files")) {
        const fileStore = database.createObjectStore("files", {
          keyPath: ["projectId", "path"],
        });
        fileStore.createIndex("byProject", "projectId", { unique: false });
      }

      // 設定（currentProjectId, recentProjects等）
      if (!database.objectStoreNames.contains("config")) {
        database.createObjectStore("config", { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(new Error("IndexedDB初期化エラー: " + event.target.error));
    };
  });
}

// ヘルパー: トランザクション実行
function tx(storeNames, mode = "readonly") {
  return db.transaction(storeNames, mode);
}

// config-----
export async function getConfig(key) {
  const transaction = tx("config");
  const store = transaction.objectStore("config");
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function setConfig(key, value) {
  const transaction = tx("config", "readwrite");
  const store = transaction.objectStore("config");
  return new Promise((resolve, reject) => {
    const request = store.put({ key, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// projects-----
export async function listProjects() {
  const transaction = tx("projects");
  const store = transaction.objectStore("projects");
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const projects = request.result || [];
      // 更新日時の降順でソート
      projects.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function createProject(name) {
  const id = crypto.randomUUID();
  const now = Date.now();
  const project = { id, name, createdAt: now, updatedAt: now };

  const transaction = tx("projects", "readwrite");
  const store = transaction.objectStore("projects");
  return new Promise((resolve, reject) => {
    const request = store.add(project);
    request.onsuccess = () => resolve(project);
    request.onerror = () => reject(request.error);
  });
}

export async function getProject(id) {
  const transaction = tx("projects");
  const store = transaction.objectStore("projects");
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function updateProjectTimestamp(id) {
  const project = await getProject(id);
  if (!project) return;
  project.updatedAt = Date.now();
  const transaction = tx("projects", "readwrite");
  const store = transaction.objectStore("projects");
  return new Promise((resolve, reject) => {
    const request = store.put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProject(id) {
  // プロジェクトのファイルをすべて削除
  const files = await listAllFiles(id);
  const transaction = tx(["projects", "files"], "readwrite");
  const projectStore = transaction.objectStore("projects");
  const fileStore = transaction.objectStore("files");

  return new Promise((resolve, reject) => {
    // ファイル削除
    for (const file of files) {
      fileStore.delete([id, file.path]);
    }
    // プロジェクト削除
    const request = projectStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// files-----
export async function readFile(projectId, path) {
  path = normalizePath(path);
  const transaction = tx("files");
  const store = transaction.objectStore("files");
  return new Promise((resolve, reject) => {
    const request = store.get([projectId, path]);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function writeFile(projectId, path, data, mimeType) {
  path = normalizePath(path);
  if (!mimeType) {
    mimeType = getMimeType(path);
  }

  const isText = typeof data === "string";
  const now = Date.now();
  const size = isText ? new Blob([data]).size : data.size;

  const entry = {
    projectId,
    path,
    type: isText ? "text" : "binary",
    content: isText ? data : null,
    blob: isText ? null : data,
    mimeType,
    size,
    updatedAt: now,
  };

  const transaction = tx("files", "readwrite");
  const store = transaction.objectStore("files");
  return new Promise((resolve, reject) => {
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFileEntry(projectId, path) {
  path = normalizePath(path);

  // ファイル単体の削除を試みる
  const file = await readFile(projectId, path);
  if (file) {
    const transaction = tx("files", "readwrite");
    const store = transaction.objectStore("files");
    return new Promise((resolve, reject) => {
      const request = store.delete([projectId, path]);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ディレクトリとして、前方一致で削除
  const prefix = path.endsWith("/") ? path : path + "/";
  const allFiles = await listAllFiles(projectId);
  const toDelete = allFiles.filter((f) => f.path.startsWith(prefix));

  if (toDelete.length === 0) return;

  const transaction = tx("files", "readwrite");
  const store = transaction.objectStore("files");
  return new Promise((resolve, reject) => {
    for (const f of toDelete) {
      store.delete([projectId, f.path]);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function renameFileEntry(projectId, oldPath, newPath) {
  oldPath = normalizePath(oldPath);
  newPath = normalizePath(newPath);

  // 単一ファイルのリネーム
  const file = await readFile(projectId, oldPath);
  if (file) {
    const transaction = tx("files", "readwrite");
    const store = transaction.objectStore("files");
    return new Promise((resolve, reject) => {
      // 旧エントリ削除 + 新エントリ追加
      store.delete([projectId, oldPath]);
      const newEntry = { ...file, path: newPath, updatedAt: Date.now() };
      const request = store.put(newEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ディレクトリリネーム（前方一致で全ファイル移動）
  const oldPrefix = oldPath.endsWith("/") ? oldPath : oldPath + "/";
  const newPrefix = newPath.endsWith("/") ? newPath : newPath + "/";
  const allFiles = await listAllFiles(projectId);
  const toMove = allFiles.filter((f) => f.path.startsWith(oldPrefix));

  if (toMove.length === 0) return;

  const transaction = tx("files", "readwrite");
  const store = transaction.objectStore("files");
  return new Promise((resolve, reject) => {
    for (const f of toMove) {
      store.delete([projectId, f.path]);
      const movedPath = newPrefix + f.path.slice(oldPrefix.length);
      store.put({ ...f, path: movedPath, updatedAt: Date.now() });
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function createFileEntry(projectId, path) {
  path = normalizePath(path);
  // 既存チェック
  const existing = await readFile(projectId, path);
  if (existing) {
    throw new Error("ファイルが既に存在します: " + path);
  }
  await writeFile(projectId, path, "", getMimeType(path));
}

// ディレクトリ一覧（仮想ディレクトリ）
export async function listDir(projectId, dirPath) {
  dirPath = normalizePath(dirPath);
  const prefix = dirPath === "" ? "" : dirPath + "/";

  const allFiles = await listAllFiles(projectId);

  // 直下のファイルとディレクトリを抽出
  const entries = new Map(); // name -> { name, isDir, size }

  for (const file of allFiles) {
    if (!file.path.startsWith(prefix)) continue;
    const rest = file.path.slice(prefix.length);
    if (!rest) continue;

    const slashIndex = rest.indexOf("/");
    if (slashIndex === -1) {
      // 直下のファイル
      entries.set(rest, { name: rest, isDir: false, size: file.size || 0 });
    } else {
      // サブディレクトリ
      const dirName = rest.slice(0, slashIndex);
      if (!entries.has(dirName)) {
        entries.set(dirName, { name: dirName, isDir: true, size: 0 });
      }
    }
  }

  // ディレクトリ優先、名前順でソート
  const result = Array.from(entries.values());
  result.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

// プロジェクト内の全ファイル取得
export async function listAllFiles(projectId) {
  const transaction = tx("files");
  const store = transaction.objectStore("files");
  const index = store.index("byProject");
  return new Promise((resolve, reject) => {
    const request = index.getAll(projectId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// パス正規化（先頭の ./ を除去）
function normalizePath(path) {
  if (!path) return "";
  return path.replace(/^\.\//, "").replace(/\\/g, "/");
}

// ストレージ使用量取得
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { usage: 0, quota: 0 };
}

// 永続化リクエスト
export async function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    return await navigator.storage.persist();
  }
  return false;
}
