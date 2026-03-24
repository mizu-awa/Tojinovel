// 外部JavaScript関数実行サービス
// ユーザーが作成したJSファイルをBlobURL経由でimportし、関数を実行する

import { storage } from "./storageService.js";

// モジュールキャッシュ: filePath → module
const moduleCache = new Map();

// キャッシュをクリア（エディタ保存時などに呼び出し）
export function clearModuleCache(filePath) {
  if (filePath) {
    moduleCache.delete(filePath);
  } else {
    moduleCache.clear();
  }
}

// ファイル読み込み → Blob URL → import → キャッシュ
async function loadModule(filePath) {
  const code = await storage.loadEventFile(filePath);
  if (!code) throw new Error(`外部関数ファイルが見つかりません: ${filePath}`);

  const blob = new Blob([code], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  try {
    const mod = await import(blobUrl);
    moduleCache.set(filePath, mod);
    return mod;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// タイムアウト用Promise生成
function createTimeoutPromise(filePath, funcName, ms = 10000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.warn(`[Tojinovel] 外部関数: タイムアウト (${filePath}::${funcName})`);
      resolve("");
    }, ms)
  );
}

// キャッシュ済みモジュールで関数を呼び出す（同期）
// 戻り値がPromiseの場合はそのまま返す
function callFunc(mod, filePath, funcName, args) {
  if (typeof mod[funcName] !== "function") {
    console.warn(`[Tojinovel] 外部関数: 関数が見つかりません (${filePath}::${funcName})`);
    return "";
  }
  let ret;
  try {
    ret = mod[funcName](...args);
  } catch (e) {
    console.warn(`[Tojinovel] 外部関数: 実行エラー (${filePath}::${funcName})`, e);
    return "";
  }
  if (ret instanceof Promise) {
    // 非同期関数: タイムアウト付きPromiseに変換
    return Promise.race([
      ret.catch((e) => {
        console.warn(`[Tojinovel] 外部関数: 非同期実行エラー (${filePath}::${funcName})`, e);
        return "";
      }),
      createTimeoutPromise(filePath, funcName),
    ]);
  }
  return ret;
}

/**
 * 外部関数を実行する。
 * - キャッシュ済み + 同期関数: 値をそのまま返す（Promiseではない）
 * - キャッシュ未済 or 非同期関数: Promiseを返す
 *
 * 呼び出し側は戻り値が instanceof Promise かどうかで分岐する。
 */
export function executeExternalFunc(filePath, funcName, args) {
  // .js拡張子チェック
  if (!filePath.endsWith(".js")) {
    console.warn(`[Tojinovel] 外部関数: .jsファイルのみ許可されています (${filePath})`);
    return "";
  }

  // キャッシュ済みの場合は同期実行を試みる
  if (moduleCache.has(filePath)) {
    return callFunc(moduleCache.get(filePath), filePath, funcName, args);
  }

  // キャッシュなし: モジュールをロードしてから実行（Promise）
  return loadModule(filePath)
    .then((mod) => callFunc(mod, filePath, funcName, args))
    .catch((e) => {
      console.warn(`[Tojinovel] 外部関数: モジュール読み込みエラー (${filePath})`, e);
      return "";
    });
}
