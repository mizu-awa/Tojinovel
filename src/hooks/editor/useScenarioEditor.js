import { useCallback, useRef, useState } from "react";
import { openDB } from "idb";

const API_BASE = import.meta.env.VITE_API_BASE;

// IndexedDB設定（useIndexedDBStorage.js と同じDB/ストアを共用）
const DB_NAME = "TojinovelDB";
const STORE_NAME = "gameSaveStore";
const DB_VERSION = 1;
const IDB_KEY = `editorState:${location.origin + location.pathname}_eventBuffer`;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// ラベル位置を検索してスクロール
function scrollToLabel(textarea, label) {
  if (!textarea || !label) return;

  const text = textarea.value;
  // 【ラベル名】の形式を検索
  const labelPattern = `【${label}】`;
  const index = text.indexOf(labelPattern);

  if (index === -1) return;

  // その行の先頭位置を取得
  const lines = text.substring(0, index).split("\n");
  const lineNumber = lines.length - 1;

  // 1行あたりの高さを計算（概算）
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
  const scrollTop = lineNumber * lineHeight;

  // スクロール
  textarea.scrollTop = Math.max(0, scrollTop - 50); // 少し上に余裕を持たせる

  // カーソルをラベル位置に移動
  textarea.setSelectionRange(index, index + labelPattern.length);
  textarea.focus();
}

export default function useScenarioEditor({ setIsSaved }) {
  // ref-------------------------------------------------------------------------------------------
  // key: ファイルパス（"./events/room1.txt"）, value: { content: string, dirty: boolean }
  const eventBufferRef = useRef(new Map());
  const textareaRef = useRef(null);
  const currentFilePathRef = useRef(null);
  const currentLabelRef = useRef("");
  const idbTimeoutRef = useRef(null);
  // textarea がマウントされた時に適用する pending content
  const pendingContentRef = useRef(null);

  // state（ヘッダー表示用の最小限）-----------------------------------------------------------------
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [currentLabel, setCurrentLabel] = useState("");
  const [hasDirtyFiles, setHasDirtyFiles] = useState(false);
  const [status, setStatus] = useState(null);
  const [fileNotFound, setFileNotFound] = useState(false);

  // functions-------------------------------------------------------------------------------------

  // dirtyファイルの有無を更新
  const updateHasDirtyFiles = useCallback(() => {
    for (const [, entry] of eventBufferRef.current) {
      if (entry.dirty) {
        setHasDirtyFiles(true);
        return;
      }
    }
    setHasDirtyFiles(false);
  }, []);

  // IndexedDBにバッファを保存
  const saveBufferToIndexedDB = useCallback(async () => {
    try {
      const db = await getDB();
      const serialized = Object.fromEntries(eventBufferRef.current);
      await db.put(STORE_NAME, serialized, IDB_KEY);
    } catch (e) {
      console.error("イベントバッファのIndexedDB保存エラー:", e);
    }
  }, []);

  // textareaの現在の内容をバッファに書き戻す
  const flushCurrentToBuffer = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path || !textareaRef.current) return;

    const currentContent = textareaRef.current.value;
    const existing = eventBufferRef.current.get(path);

    if (!existing || existing.content !== currentContent) {
      eventBufferRef.current.set(path, { content: currentContent, dirty: true });
      updateHasDirtyFiles();
    }
  }, [updateHasDirtyFiles]);

  // デバウンスされたIndexedDB保存をスケジュール
  const scheduleIDBSave = useCallback(() => {
    if (idbTimeoutRef.current) clearTimeout(idbTimeoutRef.current);
    idbTimeoutRef.current = setTimeout(() => {
      // 保存前にtextareaの最新内容をバッファに反映
      flushCurrentToBuffer();
      saveBufferToIndexedDB();
    }, 2000);
  }, [flushCurrentToBuffer, saveBufferToIndexedDB]);

  // textareaにpending contentを適用する関数
  const applyPendingContent = useCallback((textarea) => {
    if (!textarea) return;

    if (pendingContentRef.current !== null) {
      textarea.value = pendingContentRef.current;
      pendingContentRef.current = null;

      // ラベル位置にスクロール
      if (currentLabelRef.current) {
        setTimeout(() => scrollToLabel(textarea, currentLabelRef.current), 50);
      }
    }
  }, []);

  // textarea ref のコールバック（マウント時に pending content を適用）
  const setTextareaRef = useCallback((textarea) => {
    textareaRef.current = textarea;
    applyPendingContent(textarea);
  }, [applyPendingContent]);

  // ファイルを閉じる
  const closeFile = useCallback(() => {
    flushCurrentToBuffer();
    currentFilePathRef.current = null;
    currentLabelRef.current = "";
    pendingContentRef.current = null;
    setCurrentFilePath(null);
    setCurrentLabel("");
    setStatus(null);
    setFileNotFound(false);
    if (textareaRef.current) textareaRef.current.value = "";
  }, [flushCurrentToBuffer]);

  // ファイルを開く
  const loadEventFile = useCallback(async (filePath, label) => {
    if (!filePath) {
      closeFile();
      return;
    }

    // パスを正規化（./ がなければ追加）
    const normalizedPath = filePath.startsWith("./") ? filePath : `./${filePath}`;

    // 同じファイルでラベルだけ変わった場合はスクロールのみ
    if (currentFilePathRef.current === normalizedPath) {
      setCurrentLabel(label || "");
      currentLabelRef.current = label || "";
      // ラベル位置にスクロール
      if (label && textareaRef.current) {
        setTimeout(() => scrollToLabel(textareaRef.current, label), 50);
      }
      return;
    }

    // 現在のtextareaの内容をバッファに退避
    flushCurrentToBuffer();

    // 新しいファイルパスとラベルを設定
    currentFilePathRef.current = normalizedPath;
    currentLabelRef.current = label || "";
    setCurrentFilePath(normalizedPath);
    setCurrentLabel(label || "");
    setFileNotFound(false);

    const existing = eventBufferRef.current.get(normalizedPath);

    if (existing) {
      // バッファにある場合はそこから表示
      // textareaがまだマウントされていない可能性があるため、pending contentに保存
      pendingContentRef.current = existing.content;

      if (textareaRef.current) {
        // textareaが既に存在する場合は直接設定
        textareaRef.current.value = existing.content;
        pendingContentRef.current = null;
        // ラベル位置にスクロール
        if (label) {
          setTimeout(() => scrollToLabel(textareaRef.current, label), 50);
        }
      }
      setStatus(existing.dirty ? "未保存" : null);
      return;
    }

    // サーバーからfetch
    setStatus("読み込み中...");
    try {
      const response = await fetch(normalizedPath);

      // fetchの後、パスが変わっていたら結果を破棄（高速切替対策）
      if (currentFilePathRef.current !== normalizedPath) return;

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        // text/html が返ってきた場合はファイルが存在しない（サーバーがHTMLを返している）
        if (contentType && contentType.startsWith("text/html")) {
          setFileNotFound(true);
          setStatus("ファイルが存在しません");
          pendingContentRef.current = "";
          if (textareaRef.current) textareaRef.current.value = "";
          return;
        }
        if (contentType && contentType.startsWith("text/")) {
          const text = await response.text();
          if (currentFilePathRef.current !== normalizedPath) return;
          eventBufferRef.current.set(normalizedPath, { content: text, dirty: false });

          // pending contentに保存
          pendingContentRef.current = text;

          if (textareaRef.current) {
            textareaRef.current.value = text;
            pendingContentRef.current = null;
            // ラベル位置にスクロール
            if (label) {
              setTimeout(() => scrollToLabel(textareaRef.current, label), 50);
            }
          }
          setStatus(null);
        } else {
          // テキストではない → ファイルが存在しない扱い
          setFileNotFound(true);
          setStatus("ファイルが存在しません");
          pendingContentRef.current = "";
          if (textareaRef.current) textareaRef.current.value = "";
        }
      } else {
        // 404等 → ファイルが存在しない
        setFileNotFound(true);
        setStatus("ファイルが存在しません");
        pendingContentRef.current = "";
        if (textareaRef.current) textareaRef.current.value = "";
      }
    } catch {
      // ネットワークエラー → ファイルが存在しない扱い
      if (currentFilePathRef.current !== normalizedPath) return;
      setFileNotFound(true);
      setStatus("ファイルが存在しません");
      pendingContentRef.current = "";
      if (textareaRef.current) textareaRef.current.value = "";
    }
  }, [flushCurrentToBuffer, closeFile]);

  // 新規ファイルを作成（バッファに空の内容を作成してdirtyにする）
  const createNewFile = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path) return;

    // 空の内容でバッファに追加（dirty=trueで保存対象に）
    eventBufferRef.current.set(path, { content: "", dirty: true });
    pendingContentRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.value = "";
      pendingContentRef.current = null;
    }
    setFileNotFound(false);
    setStatus("未保存（新規ファイル）");
    setHasDirtyFiles(true);
    setIsSaved(false);

    // IndexedDBにも保存
    scheduleIDBSave();
  }, [setIsSaved, scheduleIDBSave]);

  // textarea入力時のハンドラ（onInputイベント用）
  const handleTextChange = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path || !textareaRef.current) return;

    const currentContent = textareaRef.current.value;
    eventBufferRef.current.set(path, { content: currentContent, dirty: true });
    setHasDirtyFiles(true);
    setIsSaved(false);
    setStatus("未保存");

    // IndexedDBへのデバウンス保存をスケジュール
    scheduleIDBSave();
  }, [setIsSaved, scheduleIDBSave]);

  // 全dirtyファイルをサーバーに保存
  const saveAllDirtyFiles = useCallback(async () => {
    // 最新のtextarea内容をバッファに退避
    flushCurrentToBuffer();

    const errors = [];
    const promises = [];

    for (const [path, entry] of eventBufferRef.current) {
      if (!entry.dirty) continue;

      // サーバーに送るパスは ./ を除去
      const serverPath = path.replace(/^\.\//, "");

      const promise = fetch(`${API_BASE}/save-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: serverPath, content: entry.content }),
      })
        .then((res) => {
          if (res.ok) {
            entry.dirty = false;
          } else {
            errors.push(`${path}: HTTP ${res.status}`);
          }
        })
        .catch((e) => {
          errors.push(`${path}: ${e.message}`);
        });

      promises.push(promise);
    }

    await Promise.all(promises);

    updateHasDirtyFiles();
    if (errors.length === 0 && currentFilePathRef.current) {
      setStatus(null);
      setFileNotFound(false);
    }

    // 保存成功したらIndexedDBも更新
    await saveBufferToIndexedDB();

    return { ok: errors.length === 0, errors };
  }, [flushCurrentToBuffer, updateHasDirtyFiles, saveBufferToIndexedDB]);

  // IndexedDBからバッファを復元
  const loadBufferFromIndexedDB = useCallback(async () => {
    try {
      const db = await getDB();
      const data = await db.get(STORE_NAME, IDB_KEY);
      if (data) {
        eventBufferRef.current = new Map(Object.entries(data));
        updateHasDirtyFiles();
      }
    } catch (e) {
      console.error("イベントバッファのIndexedDB読み込みエラー:", e);
    }
  }, [updateHasDirtyFiles]);

  return {
    currentFilePath,
    currentLabel,
    textareaRef: setTextareaRef, // コールバック ref を返す
    loadEventFile,
    handleTextChange,
    saveAllDirtyFiles,
    hasDirtyFiles,
    status,
    loadBufferFromIndexedDB,
    fileNotFound,
    createNewFile,
    closeFile,
  };
}
