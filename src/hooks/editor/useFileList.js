import { useCallback, useRef, useState } from "react";
import { storage } from "../../services/storageService";

// プロジェクト内の全ファイルリストを取得・キャッシュするフック
export default function useFileList() {
  const [fileList, setFileList] = useState([]);
  const loadedRef = useRef(false);

  const refreshFileList = useCallback(async () => {
    try {
      const files = await storage.readDirRecursive();
      setFileList(files || []);
      loadedRef.current = true;
    } catch (e) {
      console.error("ファイルリスト取得失敗:", e);
      setFileList([]);
      loadedRef.current = true; // 無限リトライを防止
    }
  }, []);

  // 初回ロード（遅延: 最初のフォーカス時に呼ぶ用）
  const ensureLoaded = useCallback(() => {
    if (!loadedRef.current) {
      refreshFileList();
    }
  }, [refreshFileList]);

  return { fileList, refreshFileList, ensureLoaded };
}
