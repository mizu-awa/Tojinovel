import { useCallback, useRef } from "react";

const MAX_HISTORY = 50; // 最大履歴数

export default function useUndoRedo({
    setGameData, gameDataRef, mainTab, selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem
}){
    const historyRef = useRef([]);
    const futureRef = useRef([]);

    // 選択中の値をバグらせないようにするための関数
      const checkSelected = useCallback((newData) => {
        if(mainTab === "characters" ){
          setSelectedItem(Math.min(newData.characters.length - 1, selectedItem));
          setSelectedSubItem(Math.min((newData.characters[selectedItem]?.expressions.length || 1) - 1, selectedSubItem));
        }
        else if(mainTab === "scenes"){
          setSelectedItem(Math.min(newData.scenes.length - 1, selectedItem));
          setSelectedSubItem(Math.min((newData.scenes[selectedItem]?.hotspots.length || 1) - 1, selectedSubItem));
          setSelectedThirdItem(Math.min((newData.scenes[selectedItem]?.hotspots[selectedSubItem]?.states.length || 1) - 1, selectedThirdItem));
        }
      },[mainTab, selectedItem, selectedSubItem, selectedThirdItem]);
      
      const doAction = useCallback(() => {
        const snapshot = structuredClone(gameDataRef.current);

        historyRef.current = [
          ...historyRef.current,
          snapshot
        ].slice(-MAX_HISTORY);

        futureRef.current = [];
      }, []);
    
      const undo = useCallback(() => {
        const history = historyRef.current;
        if (history.length === 0) return;

        // 1つ前のスナップショット
        const previous = history[history.length - 1];

        // history を1つ戻す
        historyRef.current = history.slice(0, -1);

        // 現在の状態を future に保存（※ clone 必須）
        futureRef.current = [
          structuredClone(gameDataRef.current),
          ...futureRef.current,
        ];

        checkSelected(previous);
        setGameData(previous);
      }, [checkSelected, setGameData]);
    
      const redo = useCallback(() => {
        const future = futureRef.current;
        if (future.length === 0) return;

        const next = future[0];

        // future を1つ進める
        futureRef.current = future.slice(1);

        // 現在の状態を history に保存（※ clone 必須）
        historyRef.current = [
          ...historyRef.current,
          structuredClone(gameDataRef.current),
        ];

        checkSelected(next);
        setGameData(next);
      }, [checkSelected, setGameData]);


    return ({
        doAction,
        undo,
        redo
    })
}