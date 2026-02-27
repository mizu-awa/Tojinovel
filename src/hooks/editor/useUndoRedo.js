import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50; // 最大履歴数
const DEBOUNCE_MS = 500; // デバウンス時間

export default function useUndoRedo({
    setGameData, gameDataRef, mainTab, selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem,
}){
    const historyRef = useRef([]);
    const futureRef = useRef([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // デバウンス用
    const debounceRef = useRef(null);
    const isEditingRef = useRef(false);

    // 最新値を ref に保持（undo/redo コールバックの安定化のため）
    const latestRef = useRef({ mainTab, selectedItem, selectedSubItem, selectedThirdItem, setSelectedItem, setSelectedSubItem, setSelectedThirdItem });
    latestRef.current = { mainTab, selectedItem, selectedSubItem, selectedThirdItem, setSelectedItem, setSelectedSubItem, setSelectedThirdItem };

    // 選択中の値をバグらせないようにするための関数
      const checkSelected = useCallback((newData) => {
        const { mainTab: tab, selectedItem: item, selectedSubItem: sub, selectedThirdItem: third,
                setSelectedItem: setItem, setSelectedSubItem: setSub, setSelectedThirdItem: setThird } = latestRef.current;
        if(tab === "characters" ){
          const newItem = Math.min(newData.characters.length - 1, item);
          setItem(newItem);
          setSub(Math.min((newData.characters[newItem]?.expressions.length || 1) - 1, sub));
        }
        else if(tab === "scenes"){
          const newItem = Math.min(newData.scenes.length - 1, item);
          setItem(newItem);
          const newSub = Math.min((newData.scenes[newItem]?.hotspots.length || 1) - 1, sub);
          setSub(newSub);
          setThird(Math.min((newData.scenes[newItem]?.hotspots[newSub]?.states.length || 1) - 1, third));
        }
        else if(tab === "items"){
          const newItem = Math.min(newData.items.length - 1, item);
          setItem(newItem);
          const newSub = Math.min((newData.items[newItem]?.hotspots.length || 1) - 1, sub);
          setSub(newSub);
          setThird(Math.min((newData.items[newItem]?.hotspots[newSub]?.states.length || 1) - 1, third));
        }
      }, []);

      // デバウンス付きスナップショット
      // immediate=true: 構造変更やドラッグ開始時に、進行中のバーストを強制終了して新しいスナップショットを取る
      const debouncedDoAction = useCallback((immediate = false) => {
        // immediate: 進行中のバーストを強制終了
        if (immediate && isEditingRef.current) {
          clearTimeout(debounceRef.current);
          isEditingRef.current = false;
        }

        // バースト開始時のみスナップショットを取る
        if (!isEditingRef.current) {
          const snapshot = {
            gameData: structuredClone(gameDataRef.current),
          };
          historyRef.current = [...historyRef.current, snapshot].slice(-MAX_HISTORY);
          futureRef.current = [];
          isEditingRef.current = true;
          setCanUndo(true);
          setCanRedo(false);
        }

        // デバウンスタイマーリセット
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          isEditingRef.current = false;
        }, DEBOUNCE_MS);
      }, []);

      const undo = useCallback(() => {
        const history = historyRef.current;
        if (history.length === 0) return;

        // 編集中バーストをリセット（次の変更で新しいスナップショットが取られるようにする）
        clearTimeout(debounceRef.current);
        isEditingRef.current = false;

        // 1つ前のスナップショット
        const previous = history[history.length - 1];

        // history を1つ戻す
        historyRef.current = history.slice(0, -1);

        // 現在の状態を future に保存（※ clone 必須）
        const currentSnapshot = {
          gameData: structuredClone(gameDataRef.current),
        };
        futureRef.current = [currentSnapshot, ...futureRef.current];

        setCanUndo(historyRef.current.length > 0);
        setCanRedo(true);

        // gameDataを復元
        checkSelected(previous.gameData);
        setGameData(previous.gameData);
      }, [checkSelected, setGameData]);

      const redo = useCallback(() => {
        const future = futureRef.current;
        if (future.length === 0) return;

        // 編集中バーストをリセット
        clearTimeout(debounceRef.current);
        isEditingRef.current = false;

        const next = future[0];

        // future を1つ進める
        futureRef.current = future.slice(1);

        // 現在の状態を history に保存（※ clone 必須）
        const currentSnapshot = {
          gameData: structuredClone(gameDataRef.current),
        };
        historyRef.current = [...historyRef.current, currentSnapshot];

        setCanUndo(true);
        setCanRedo(futureRef.current.length > 0);

        // gameDataを復元
        checkSelected(next.gameData);
        setGameData(next.gameData);
      }, [checkSelected, setGameData]);


    return ({
        debouncedDoAction,
        undo,
        redo,
        canUndo,
        canRedo
    })
}
