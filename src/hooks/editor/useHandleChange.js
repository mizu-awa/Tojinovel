import { useCallback } from "react";

export default function useHsndleChange({
    setGameData,
    setMainTab,
    setIsSaved,
    debouncedDoAction
}){
    // mainタブ用の関数
      const handleMainTabChange = useCallback((event, newValue) => {
        setMainTab(newValue);
      }, [setMainTab]);

    // ネストしたJSONの更新に対応するhandleChange
      const handleNestedChange = useCallback((path, options = {}) => (event) => {
        debouncedDoAction();
        setGameData((prev) => {
          const keys = path.split(".");
    
          // top-levelをコピー
          const newData = { ...prev };
          let target = newData;
    
          // 経路に沿って部分コピー
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const index = Number(key);
            const nextKey = isNaN(index) ? key : index;
    
            // 次の層を浅くコピー
            if (Array.isArray(target[nextKey])) {
              target[nextKey] = [...target[nextKey]];
            } else if (typeof target[nextKey] === "object" && target[nextKey] !== null) {
              target[nextKey] = { ...target[nextKey] };
            }
    
            target = target[nextKey];
          }
    
          const lastKey = keys[keys.length - 1];
          const lastIndex = Number(lastKey);
    
          let value = event.target.value;
    
          // ✅ チェックボックス対応
          if (event.target.type === "checkbox") {
            value = event.target.checked;
          } else {
            value = event.target.value;
          }
    
          // type="number" 用に数値変換
          if (event.target.type === "number") {
            value = value === "" ? "" : Number(value);
          }
    
          // オプションに応じて変換
          if (options.type === "px") {
            value = value === "" ? "" : `${value}${options.unit || "px"}`;
          }
          else if (options.type === "url") {
            if (value === "") {
              value = "";
            } else {
              // 先頭の / を全部削除
              let cleanValue = value.replace(/^\/+/, "");
              // ./ がついていなければ追加
              if (!cleanValue.startsWith("./")) {
                cleanValue = `./${cleanValue}`;
              }
              value = `url(${cleanValue})`;
            }
          }
          else if (options.type === "path") {
            if (value === "") {
              value = "";
            } else {
              // 先頭の / を全部削除
              let cleanValue = value.replace(/^\/+/, "");
              // ./ がついていなければ追加
              if (!cleanValue.startsWith("./")) {
                cleanValue = `./${cleanValue}`;
              }
              value = cleanValue;
            }
          }
    
          target[!isNaN(lastIndex) ? lastIndex : lastKey] = value;
    
          return newData;
        });

        setIsSaved(false);
      }, [setGameData, setIsSaved, debouncedDoAction]);

      // datasetから取得するバージョン
      const handleDatasetChange = useCallback((e) => {
        const { dataset } = e.target;
        const options = dataset.type ? { type: dataset.type } : {};

        handleNestedChange(dataset.path, options)(e);
      }, [handleNestedChange]);
          
      // パスを指定して配列に要素を追加する関数
      // newItem は追加したい値（オブジェクトや文字列など）
      const handleAddArrayItem = useCallback((path, newItem) => {
        if(!newItem) return null;
        debouncedDoAction(true);
        setGameData((prev) => {
          const keys = path.split(".");
          const newData = { ...prev }; // ✅ 一番上だけ浅いコピー
          let target = newData;
    
          // 中間のオブジェクトも浅くコピー
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const index = Number(key);
            const keyName = !isNaN(index) ? index : key;
    
            const next = target[keyName];
            if (next === undefined) {
              console.warn("追加対象が存在しません:", path);
              return prev; // 差分なし
            }
    
            // 配列かオブジェクトかで浅いコピー
            target[keyName] = Array.isArray(next) ? [...next] : { ...next };
            target = target[keyName];
          }
    
          // 最後のキーを処理
          const lastKey = keys[keys.length - 1];
          const lastIndex = Number(lastKey);
          const finalKey = !isNaN(lastIndex) ? lastIndex : lastKey;
    
          const targetArray = target[finalKey];
          if (!Array.isArray(targetArray)) {
            console.warn("指定パスが配列ではありません:", path);
            return prev;
          }
    
          // ✅ 配列を浅くコピーしてpush
          target[finalKey] = [...targetArray, newItem];
    
          return newData;
        });

        setIsSaved(false);
      },[setGameData, setIsSaved, debouncedDoAction]);

      // パスを指定してキーを削除する関数（配列でもいける）
      const handleDeleteKey = useCallback((path) => {
        debouncedDoAction(true);
        setGameData((prev) => {
          const keys = path.split(".");
          const newData = { ...prev }; // ✅ 最上位だけ浅いコピー
          let target = newData;
    
          // 中間階層をたどる＆部分的に浅いコピー
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const index = Number(key);
            const keyName = !isNaN(index) ? index : key;
    
            const next = target[keyName];
            if (next === undefined) {
              console.warn("削除対象が存在しません:", path);
              return prev;
            }
    
            // 中間が配列 or オブジェクトかを判定して浅くコピー
            target[keyName] = Array.isArray(next) ? [...next] : { ...next };
            target = target[keyName];
          }
    
          const lastKey = keys[keys.length - 1];
          const lastIndex = Number(lastKey);
    
          if (!isNaN(lastIndex) && Array.isArray(target)) {
            // ✅ 配列の要素削除（浅くコピーしているので安全）
            if (lastIndex >= 0 && lastIndex < target.length) {
              target.splice(lastIndex, 1);
            } else {
              console.warn("削除対象の配列インデックスが不正です:", lastIndex);
            }
          } else {
            // ✅ オブジェクトのプロパティ削除
            if (Object.prototype.hasOwnProperty.call(target, lastKey)) {
              delete target[lastKey];
            } else {
              console.warn("削除対象のキーが存在しません:", lastKey);
            }
          }
    
          return newData;
        });

        setIsSaved(false);
      }, [setGameData, setIsSaved, debouncedDoAction]);

    return ({
        handleMainTabChange,
        handleNestedChange,
        handleAddArrayItem,
        handleDeleteKey,
        handleDatasetChange
    })
}