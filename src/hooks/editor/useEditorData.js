import { useCallback, useMemo, useRef, useState } from "react";
import { defaultCharacterData, defaultExpressionData, defaultGameData } from "../../datas/defaultGameData";
import { useIndexedDBSaves } from "../useIndexedDBStorage";
import { mergeDefault } from "../useMerge";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function useEditorData(){
    // state--------------------------------------------------------------------------------------
      const [mainTab, setMainTab] = useState(() => {
        return sessionStorage.getItem("mainTab") ?? "settings";
      });

      const [selectedItem, setSelectedItem] = useState(() => {
        const v = sessionStorage.getItem("selectedItem");
        if (v === null) return "ゲーム情報";
        const num = Number(v);
        return String(num) === v ? num : v;
      });

      const [selectedSubItem, setSelectedSubItem] = useState(() => {
        return sessionStorage.getItem("selectedSubItem") ?? 0;
      });

      const [selectedThirdItem, setSelectedThirdItem] = useState(() => {
        return sessionStorage.getItem("selectedThirdItem") ?? 0;
      });
    
      const [gameData, setGameData] = useState(defaultGameData);

      const [isSaved, setIsSaved] = useState(true);
    
      // ref-------------------------------------------------------------------------------------------
      const gameDataRef = useRef(gameData);
      const hotspotRefs = useRef({}); // 各ホットスポットDOMを管理するRef

      // function-------------------------------------------------
      const downloadJSON = useCallback(() => {
        // JSON文字列に変換
        const json = JSON.stringify({...gameDataRef.current, toolVersion: import.meta.env.RELEASE_VERSION , commit: import.meta.env.VITE_COMMIT_HASH ?? "dev" }, null, 2); // 第2引数のnull,2で整形出力
    
        // Blobオブジェクトを作成（ブラウザで扱えるファイルデータ）
        const blob = new Blob([json], { type: "application/json" });
    
        // ダウンロード用URLを作成
        const url = URL.createObjectURL(blob);
    
        // <a>要素を作って自動クリック
        const a = document.createElement("a");
        a.href = url;
        a.download = "gamedata.json"; // ダウンロードされるファイル名
        a.click();
S    
        // 一時URLを破棄してメモリを解放
        URL.revokeObjectURL(url);
      },[]);

      const { saveGameDB, loadGameDB } = useIndexedDBSaves();
      
      const loadFile = useCallback(async () => {
        try {
          const res = await fetch("./data/gamedata.json");
          if (!res.ok) throw new Error("HTTPエラー: " + res.status);
          const json = await res.json();
          setGameData(mergeDefault(json));
        } catch (err) {
          console.error("JSON読み込み失敗:", err);
        }
      },[setGameData]);
    
      const saveIndexedDB = useCallback(async () => {
        await saveGameDB(0, gameDataRef.current)
      },[saveGameDB])
    
      const loadIndexedDB = useCallback(async () => {
        const data = await loadGameDB(0);
        if(data){
          setGameData(mergeDefault(data));
        }
        else{
          console.error("ブラウザ保存データ読み込み失敗")
        }
      }, [setGameData])

      const newGame = useCallback(() => {
        setGameData(defaultGameData);
      }, [setGameData])

      const loadFirst = useCallback(async () => {
        const isSessionRunning = sessionStorage.getItem("sessionRunning");

        const data = await loadGameDB(0);
        if(data && isSessionRunning){
          setGameData(mergeDefault(data));
          console.log("ブラウザ保存データを読み込み");
        }
        else{
          try {
            const res = await fetch("./data/gamedata.json");
            if (!res.ok) throw new Error("HTTPエラー: " + res.status);
            const json = await res.json();
            setGameData(mergeDefault(json));
            console.log("JSONファイルを読み込み");
          } catch (err) {
            console.log("データが存在しないため新規作成");
          }

          // セッションフラグを立てる
          sessionStorage.setItem("sessionRunning", "1");
        }
      }, [setGameData])

      const saveFile = useCallback(async () => {
        try{
          const res = await fetch(`${API_BASE}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...gameDataRef.current, toolVersion: import.meta.env.RELEASE_VERSION , commit: import.meta.env.VITE_COMMIT_HASH ?? "dev" }),
          });

          if (!res.ok) {
            console.error(`HTTP Error: ${res.status} ${res.statusText}`);
            console.log("保存に失敗したため、ゲームデータをダウンロードします。");
            downloadJSON();
          }
          else{
            setIsSaved(true);
          }
        }
        catch (error){
          console.error("Network Error:", error);
          console.log("保存に失敗したため、ゲームデータをダウンロードします。");
          downloadJSON();
        }
      },[]);

      // ラッパー
      const setMainTabWrapper = useCallback((value) => {
        setMainTab(value);
        sessionStorage.setItem("mainTab", value);
        setSelectedItem(value === "settings" ? items[0] : 0 );
      }, [setMainTab, setSelectedItem])

      const setSelectedItemWrapper = useCallback((valueOrEvent) => {
        // event -> value 抽出
        const value =
          valueOrEvent?.target?.value !== undefined
            ? valueOrEvent.target.value
            : valueOrEvent;

        setSelectedItem(value);
        sessionStorage.setItem("selectedItem", value);
        if(mainTab === "characters"){
          setSelectedSubItem(0);
        }
        else{
          setSelectedSubItem(null);
        }
      },[mainTab, setSelectedItem, setSelectedSubItem])

      const setSelectedSubItemWrapper = useCallback((valueOrEvent) => {
        // event -> value 抽出
        const value =
          valueOrEvent?.target?.value !== undefined
            ? valueOrEvent.target.value
            : valueOrEvent;

        setSelectedSubItem(value);
        sessionStorage.setItem("selectedSubItem", value);
      },[setSelectedSubItem])

      const setSelectedThirdItemWrapper = useCallback((valueOrEvent) => {
        // event -> value 抽出
        const value =
          valueOrEvent?.target?.value !== undefined
            ? valueOrEvent.target.value
            : valueOrEvent;

        setSelectedThirdItem(value);
        sessionStorage.setItem("selectedThirdItem", value);
      },[setSelectedThirdItem])
    
      // const--------------------------------------------------------------------------------------
      const sceneList = useMemo(() => gameData.scenes.map((scene) => scene.name),[gameData.scenes]);
      const itemList = useMemo(() => gameData.items.map((item) => item.name),[gameData.items]);
      const characterList = useMemo(() => gameData.characters.map((character) => character.name), [gameData.characters]);
      const itemsPre = 
          mainTab === "scenes" ? sceneList
        : mainTab === "items" ? itemList
        : mainTab === "characters" ? gameData.characters.map((character) => character.name)
        : mainTab === "settings" ? [
          "ゲーム情報",
          "ゲーム画面",
          "アイテムボックス",
          "アイテムドロワー",
          "テキストボックス",
          "方向移動",
          "選択肢",
          "画像表示",
          "入力フォーム",
          "ゲームメニュー",
          "セーブ・ロード",
          "コンフィグ",
          "変数",
          "キャラクター表示"
        ]
        : [];
    
      const items = useMemo(() => itemsPre, [itemsPre?.join("|") || ""]);
    
      const nowCharacter = useMemo(() => gameData.characters[selectedItem], [gameData.characters, selectedItem]);
      const nowScene = useMemo(() => gameData.scenes[selectedItem], [gameData.scenes, selectedItem]);
      const nowItem = useMemo(() => gameData.items[selectedItem], [gameData.items, selectedItem]);
    
      const subItemsPre = 
        mainTab === "characters" ? nowCharacter ? nowCharacter.expressions.map(e => e.name) : []
        : mainTab === "scenes" ? nowScene?.hotspots?.map(h => h.name) || []
        : mainTab === "items" ? nowItem?.hotspots?.map(h => h.name) || []
        : [];
      const subItems = useMemo(() => subItemsPre, [subItemsPre?.join("|") || ""]);
    
      const nowHotspot = useMemo(() =>
        mainTab === "scenes" ? nowScene?.hotspots?.[selectedSubItem]
        : mainTab === "items" ? nowItem?.hotspots?.[selectedSubItem] : undefined ,[mainTab, nowScene, nowItem, selectedSubItem]);
    
      const nowState = useMemo(() => nowHotspot?.states?.[selectedThirdItem],[nowHotspot, selectedThirdItem]);
      const stateList = useMemo(() => nowHotspot?.states.map(s => s.name), [nowHotspot?.states]);
    
      const thirdItemsPre = nowHotspot?.states.map(s => s.name) || [];
      const thirdItems = useMemo(() => thirdItemsPre, [thirdItemsPre?.join("|") || ""]);
    
      // data for editor
      const saveLoadSlotsForEditor =  useMemo(() =>
        ({type: "save", slots: Array.from({ length: gameData.game.save.slots + (gameData.game.save.auto ? 1 : 0) }, () => { return {"date": new Date()}})})
      ,[gameData.game.save.slots, gameData.game.save.auto]);
    
      const characterSlotsForEditor = useMemo(() =>
        mainTab === "settings" && (selectedItem === "キャラクター表示" || mainTab === "characters")
          ? Array.from({ length: gameData.game.character.slots }, () => ({
              ...defaultCharacterData,
              lastSpoken: 0,
              nowImage: defaultExpressionData.image,
            })).map((c, i) => ({ ...c, name: i }))
          : mainTab === "characters"
          ? [
              {
                ...nowCharacter,
                lastSpoken: 0,
                nowImage:
                  nowCharacter?.expressions?.[selectedSubItem]?.image ??
                  defaultExpressionData.image,
                name: nowCharacter?.name ?? `キャラクター${selectedItem ?? 1}`,
              },
            ]
          : [], [mainTab, gameData.game.character.slots, nowCharacter, selectedSubItem, selectedItem]);
    
      const linesForEditor = useMemo(() => 
        ((selectedItem === "テキストボックス"
            || selectedItem === "選択肢" 
            || selectedItem === "画像表示"
            || selectedItem === "入力フォーム"
            || selectedItem === "キャラクター表示"
            || mainTab === "characters"
          )
            ?
          [{
            type: "dialogue",
            char: nowCharacter?.name ?? "キャラクター",
            text: [
              {char: "こ", highlight: false},{char: "れ", highlight: false},{char: "は", highlight: false},
              {char: "サ", highlight: true},{char: "ン", highlight: true},{char: "プ", highlight: true},{char: "ル", highlight: true},
              {char: "で", highlight: false},{char: "す", highlight: false},{char: "\n", highlight: false},
              {char: "サ", highlight: true},{char: "ン", highlight: true},{char: "プ", highlight: true},{char: "ル", highlight: true},
              {char: "で", highlight: false},{char: "す", highlight: false}
            ],
          }] : null),
       [selectedItem, mainTab, nowCharacter]);
      
      const currentLineForEditor = useMemo(() => linesForEditor ? linesForEditor[0] : null, [linesForEditor]);
    
      const directionsForEditor = useMemo(() => mainTab === "scenes" && nowScene?.directions
        ? nowScene.directions
        : {
            top: { target: "sample" },
            right: { target: "sample" },
            bottom: { target: "sample" },
            left: { target: "sample" },
          }, [mainTab, nowScene?.directions]);
    
      const optionsForEditor = useMemo(() => selectedItem === "選択肢" ? ["選択肢1", "選択肢2", "選択肢3"] : null, [selectedItem]);
      const imageForEditor = useMemo(() => selectedItem === "画像表示" ? "./system/image.png" : null, [selectedItem]);
      const currentInputForEditor = useMemo(() => selectedItem === "入力フォーム" ? "necoClick" : null, [selectedItem]);
      const gameDataForEvent = useMemo(() => linesForEditor ? gameData : null, [linesForEditor, gameData]);

      const currentBackForEditor = useMemo(() => ({color: null, url: null, animation: null}), []);

      return ({
        mainTab,
        setMainTab: setMainTabWrapper,
        selectedItem,
        setSelectedItem: setSelectedItemWrapper,
        selectedSubItem,
        setSelectedSubItem: setSelectedSubItemWrapper,
        selectedThirdItem,
        setSelectedThirdItem: setSelectedThirdItemWrapper,
        gameData,
        setGameData,
        gameDataRef,
        hotspotRefs,
        sceneList,
        itemList,
        characterList,
        items,
        nowScene,
        nowItem,
        subItems,
        nowHotspot,
        nowState,
        stateList,
        thirdItems,
        saveLoadSlotsForEditor,
        characterSlotsForEditor,
        linesForEditor,
        currentLineForEditor,
        directionsForEditor,
        optionsForEditor,
        imageForEditor,
        currentInputForEditor,
        currentBackForEditor,
        gameDataForEvent,
        downloadJSON,
        loadFile,
        saveIndexedDB,
        loadIndexedDB,
        newGame,
        loadFirst,
        saveFile,
        isSaved,
        setIsSaved
      })
}