import { useCallback, useRef, useState } from "react";
import { openDB } from "idb";
import { storage } from "../../services/storageService";
import { Transaction } from "@codemirror/state";

// IndexedDB設定（useIndexedDBStorage.js と同じDB/ストアを共用）
const DB_NAME = "TojinovelDB";
const STORE_NAME = "gameSaveStore";
const DB_VERSION = 1;
// プロジェクト別のキーにするため関数化（プロジェクト切り替え時のバッファ混在を防ぐ）
function getIdbKey() {
  const projectPath = sessionStorage.getItem("currentProjectPath");
  const base = projectPath || (location.origin + location.pathname);
  return `editorState:${base}_eventBuffer`;
}

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// CodeMirror EditorViewのコンテンツを取得
function getEditorContent(editorView) {
  if (!editorView) return "";
  return editorView.state.doc.toString();
}

// CodeMirror EditorViewにコンテンツを設定（履歴に追加しない）
function setEditorContent(editorView, content) {
  if (!editorView) return;
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: content },
    annotations: Transaction.addToHistory.of(false),
  });
}

// ラベル位置を検索してスクロール（CodeMirror EditorView対応）
function scrollToLabel(editorView, label) {
  if (!editorView || !label) return;

  const text = editorView.state.doc.toString();
  // 【ラベル名】の形式を検索
  const labelPattern = `【${label}】`;
  const index = text.indexOf(labelPattern);

  if (index === -1) return;

  // その位置にスクロールしてカーソルを移動
  editorView.dispatch({
    selection: { anchor: index, head: index + labelPattern.length },
    scrollIntoView: true,
  });
  editorView.focus();
}

export default function useScenarioEditor({ setIsSaved }) {
  // ref-------------------------------------------------------------------------------------------
  // key: ファイルパス（"./events/room1.txt"）, value: { content: string, dirty: boolean }
  const eventBufferRef = useRef(new Map());
  const editorViewRef = useRef(null);
  const currentFilePathRef = useRef(null);
  const currentLabelRef = useRef("");
  const idbTimeoutRef = useRef(null);
  const scrollTimerRef = useRef(null);
  // エディタがマウントされた時に適用する pending content
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
      await db.put(STORE_NAME, serialized, getIdbKey());
    } catch (e) {
      console.error("イベントバッファのIndexedDB保存エラー:", e);
    }
  }, []);

  // エディタの現在の内容をバッファに書き戻す
  const flushCurrentToBuffer = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path || !editorViewRef.current) return;

    const currentContent = getEditorContent(editorViewRef.current);
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
      // 保存前にエディタの最新内容をバッファに反映
      flushCurrentToBuffer();
      saveBufferToIndexedDB();
    }, 2000);
  }, [flushCurrentToBuffer, saveBufferToIndexedDB]);

  // pending contentを適用する関数
  const applyPendingContent = useCallback(() => {
    if (!editorViewRef.current) return;

    // pendingContentがなくても、現在のファイルのバッファ内容をフォールバックとして使う
    // （タブ切替でアンマウント→再マウントされた場合の復元）
    let content = pendingContentRef.current;
    if (content === null && currentFilePathRef.current) {
      const entry = eventBufferRef.current.get(currentFilePathRef.current);
      if (entry) content = entry.content;
    }

    if (content !== null) {
      setEditorContent(editorViewRef.current, content);
      pendingContentRef.current = null;

      // ラベル位置にスクロール
      if (currentLabelRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => scrollToLabel(editorViewRef.current, currentLabelRef.current), 50);
      }
    }
  }, []);

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
    if (editorViewRef.current) {
      setEditorContent(editorViewRef.current, "");
    }
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
      if (label && editorViewRef.current) {
        setTimeout(() => scrollToLabel(editorViewRef.current, label), 50);
      }
      return;
    }

    // 現在のエディタの内容をバッファに退避
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
      pendingContentRef.current = existing.content;

      if (editorViewRef.current) {
        // エディタが既に存在する場合は直接設定
        setEditorContent(editorViewRef.current, existing.content);
        pendingContentRef.current = null;
        // ラベル位置にスクロール
        if (label) {
          clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => scrollToLabel(editorViewRef.current, label), 50);
        }
      }
      setStatus(existing.dirty ? "未保存" : null);
      return;
    }

    // Adapter経由でファイル読み込み
    setStatus("読み込み中...");
    try {
      const text = await storage.loadEventFile(normalizedPath);

      // 読み込み後、パスが変わっていたら結果を破棄（高速切替対策）
      if (currentFilePathRef.current !== normalizedPath) return;

      if (text !== null) {
        eventBufferRef.current.set(normalizedPath, { content: text, dirty: false });

        // pending contentに保存
        pendingContentRef.current = text;

        if (editorViewRef.current) {
          setEditorContent(editorViewRef.current, text);
          pendingContentRef.current = null;
          // ラベル位置にスクロール
          if (label) {
            clearTimeout(scrollTimerRef.current);
            scrollTimerRef.current = setTimeout(() => scrollToLabel(editorViewRef.current, label), 50);
          }
        }
        setStatus(null);
      } else {
        // nullが返った → ファイルが存在しない
        setFileNotFound(true);
        setStatus("ファイルが存在しません");
        pendingContentRef.current = "";
        if (editorViewRef.current) setEditorContent(editorViewRef.current, "");
      }
    } catch {
      // エラー → ファイルが存在しない扱い
      if (currentFilePathRef.current !== normalizedPath) return;
      setFileNotFound(true);
      setStatus("ファイルが存在しません");
      pendingContentRef.current = "";
      if (editorViewRef.current) setEditorContent(editorViewRef.current, "");
    }
  }, [flushCurrentToBuffer, closeFile]);

  // 新規ファイルを作成（バッファに空の内容を作成してdirtyにする）
  const createNewFile = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path) return;

    // 空の内容でバッファに追加（dirty=trueで保存対象に）
    eventBufferRef.current.set(path, { content: "", dirty: true });
    pendingContentRef.current = "";
    if (editorViewRef.current) {
      setEditorContent(editorViewRef.current, "");
      pendingContentRef.current = null;
    }
    setFileNotFound(false);
    setStatus("未保存（新規ファイル）");
    setHasDirtyFiles(true);
    setIsSaved(false);

    // IndexedDBにも保存
    scheduleIDBSave();
  }, [setIsSaved, scheduleIDBSave]);

  // エディタ入力時のハンドラ（CodeMirror updateListener用）
  const handleTextChange = useCallback(() => {
    const path = currentFilePathRef.current;
    if (!path || !editorViewRef.current) return;

    const currentContent = getEditorContent(editorViewRef.current);
    eventBufferRef.current.set(path, { content: currentContent, dirty: true });
    setHasDirtyFiles(true);
    setIsSaved(false);
    setStatus("未保存");

    // IndexedDBへのデバウンス保存をスケジュール
    scheduleIDBSave();
  }, [setIsSaved, scheduleIDBSave]);

  // 全dirtyファイルをサーバーに保存
  const saveAllDirtyFiles = useCallback(async () => {
    // 最新のエディタ内容をバッファに退避
    flushCurrentToBuffer();

    const errors = [];
    const promises = [];

    for (const [path, entry] of eventBufferRef.current) {
      if (!entry.dirty) continue;

      const promise = storage.saveEventFile(path, entry.content)
        .then(() => {
          eventBufferRef.current.set(path, { ...entry, dirty: false });
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
      const data = await db.get(STORE_NAME, getIdbKey());
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
    editorViewRef,
    loadEventFile,
    handleTextChange,
    saveAllDirtyFiles,
    hasDirtyFiles,
    status,
    loadBufferFromIndexedDB,
    fileNotFound,
    createNewFile,
    closeFile,
    applyPendingContent,
  };
}
