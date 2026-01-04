import { openDB } from 'idb';
import { useCallback } from 'react';

const DB_NAME = 'TojinovelDB';
const STORE_NAME = 'gameSaveStore';
const DB_VERSION = 1;
const STORAGE_KEY_BASE = `editorState:${location.origin + location.pathname}`;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export function useIndexedDBSaves() {
  // ✅ セーブ
  const saveGameDB = useCallback(async (slot, data) => {
    try {
      const db = await getDB();
      const key = `${STORAGE_KEY_BASE}_${slot}`;
      await db.put(STORE_NAME, data, key);
    } catch (e) {
      console.error('IndexedDB セーブエラー:', e);
    }
  }, []);

  // ✅ ロード
  const loadGameDB = useCallback(async (slot) => {
    try {
      const db = await getDB();
      const key = `${STORAGE_KEY_BASE}_${slot}`;
      const data = await db.get(STORE_NAME, key);
      return data || null;
    } catch (e) {
      console.error('IndexedDB ロードエラー:', e);
      return null;
    }
  }, []);

  // ✅ スロット一覧
  const listSavesDB = useCallback(async (maxSlots, auto) => {
    try {
      const db = await getDB();
      const results = [];
      if(auto){
        // autoの取得
        const autoData = await db.get(STORE_NAME, `${STORAGE_KEY_BASE}_auto`);
        results.push(autoData || null);
      }
      // 数値の取得
      for (let i = 0; i < maxSlots; i++) {
        const key = `${STORAGE_KEY_BASE}_${i}`;
        const data = await db.get(STORE_NAME, key);
        results.push(data || null);
      }
      return results;
    } catch (e) {
      console.error('IndexedDB スロット一覧取得エラー:', e);
      return [];
    }
  }, []);

  return { saveGameDB, loadGameDB, listSavesDB };
}
