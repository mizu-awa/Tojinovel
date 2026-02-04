// React
import { useState, useEffect, useRef, lazy, Suspense } from "react";

// デバッグレイアウト（debug.htmlからのみ読み込まれる）
const DebugLayout = lazy(() => import("./components/DebugLayout.jsx"));

// hooks
import { useGameData } from "./hooks/useGameData";
import { loadEventLines } from "./hooks/useEventLines";
import { audioManager } from "./hooks/audioManager";

// components
import SceneWrap from "./components/SceneWrap.jsx";
import SceneDirections from "./components/SceneDirections.jsx";
import Hotspots from "./components/Hotspots.jsx";
import ItemDrawer from "./components/ItemDrawer.jsx";
import ItemBox from "./components/ItemBox.jsx";
import EventViewer from "./components/EventViewer.jsx";
import Loading from "./components/Loading.jsx";
import Error from "./components/Error.jsx"
import Menu from "./components/Menu.jsx";
import SaveLoad from "./components/SaveLoad.jsx";
import { useIndexedDBSaves } from "./hooks/useIndexedDBStorage.js";
import Config from "./components/Config.jsx";
import BackgroundEventRunner from "./components/BackgroundEventRunner.jsx";

export default function GameApp({ debug }) {
  // state-----------------------------------------------------------------------------------------
  const [selectedItem, selectItem] = useState(null);
  const [viewItemName, setViewItemName] = useState(null);
  const [saveLoadSlots, setSaveLoadSlots] = useState(null);
  const [viewConfig, setViewConfig] = useState(false);
  // event
  const [lines, setLines] = useState(null);
  const [backLines, setBackLines] = useState(null);
  const [index, setIndex] = useState(0);
  const [characterSlots, setCharacterSlots] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [currentOptions, setCurrentOptions] = useState(null);
  const [currentBack, setCurrentBack] = useState({color: null, url: null, animation: null});
  const [currentImage, setCurrentImage] = useState(null);
  const [hiddenCharacter, hideCharacter] = useState(false);
  const [currentInput, setCurrentInput] = useState(null);
  const [timerEvents, setTimerEvents] = useState(null);

  // ref-------------------------------------------------------------------------------------------
  const ref = useRef();
  const eventSaveData = useRef(null);
  const timeoutRef = useRef(null);
  const timers = useRef([]);
  // event
  const ifDepth = useRef(0);
  const opDepth = useRef(0);
  const opLabel = useRef(null);

  const bgm = useRef(null);

  const ifDepthBack = useRef(0);
  const opDepthBack = useRef(0);
  const opLabelBack = useRef(null);
  
  const backLinesQueue = useRef([]);
  const isBackEventRunning = useRef(false);

  // functions-----------------------------------------------------------------------------------------
  const executeEvent = (parsedLines, jump=false) => {
    if(parsedLines.isView === undefined || parsedLines.isView === null) return null;

    if(parsedLines.isView){
      setLines(parsedLines);
      setIndex(0);
    }
    else{
      
      // 実行中でない または 強制ジャンプの場合即実行
      if (!isBackEventRunning.current || jump) {
        // 実行中でなければ即実行
        setBackLines(parsedLines);
        isBackEventRunning.current = true;
      }
      // 実行中ならキューに積む
      else{
        backLinesQueue.current.push(parsedLines);
        return;
      }
    }
  }

  const finishBackEvent = () => {
    if (backLinesQueue.current.length > 0) {
      const next = backLinesQueue.current.shift(); // ← ここが削除
      setBackLines(next);
      isBackEventRunning.current = true; // 念のため
    } else {
      setBackLines(null); // 何もなければ待機状態へ
      isBackEventRunning.current = false;
    }
  };

  // ホットスポットクリック時の関数
  const handleHotspotClick = async (hotspot) => {
    // アイテム使用イベントがある場合はそちらを優先
    let event = hotspot.usedItems ? hotspot.usedItems.find((ui) => ui.item === selectedItem) : null;
    if(!event){
      // アイテム使用イベントがない場合は通常のクリックイベントを実行
      event = hotspot.onClick;
    }

    // イベントが存在する場合のみ実行
    if(event && event.file){
      // 指定されたファイルを読み込み
      const parsedLines = await loadEventLines(event.file, event.label, gameData.characters);
      // ファイルパース結果をイベントとして実行
      executeEvent(parsedLines);
    }
  };

  // 部屋訪問時イベント実行の関数
  const visitScene = async (sceneName, gameData) => {
    // シーンを探す
    const scene = gameData.scenes.find(s => s.name === sceneName);
    // シーンがある場合のみ実行
    if(scene){
      const event = scene.visitEvent;
      // イベントが指定されている場合のみ実行
      if(event && event.file){
        // 指定されたファイルを読み込み
        const parsedLines = await loadEventLines(event.file, event.label, gameData.characters);
        // ファイルパース結果をイベントとして実行
        executeEvent(parsedLines);
      }
    }
  }

  // ファイルジャンプイベント実行の関数
  const fileJump = async (file, label) => {
    // 指定されたファイルを読み込み
    const parsedLines = await loadEventLines(file, label, gameData.characters);
    // ファイルパース結果をイベントとして実行
    executeEvent(parsedLines, true);
  }

  // 方向ボタンクリック時のイベント
  function handleDirectionClick(dir){
    if(dir.target){
      moveScene(dir.target)
    }
  }

  // アイテムボックス内アイテムクリック時のイベント
  function handleItemClick(name){
    // 選択中のアイテムだった場合、アイテムドロワーを開く
    if(name === selectedItem){
      setViewItemName(name);
    }
    else{
      // 選択中でない場合、選択状態にする
      selectItem(name);
    }
  }

  // アイテムドロワーの背景をクリックしたときの処理
  function handleItemBackClick(){
    setViewItemName(null);
  }

  // 画像読み込み関数
  const preloadImages = (urls) => {
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = (e) => reject;
            img.src = url;
          })
      )
    );
  };

  // EventViewerからセーブデータを吸い上げるための関数
  const getEventSaveData = (data) => {
    eventSaveData.current = data;
  }

  // セーブロード関数
  const { saveGameDB, loadGameDB, listSavesDB } = useIndexedDBSaves();

  // セーブ
  const saveGame = async (slot) => {
    const saveData = {
      date: new Date(),
      gameData: gameData,
      opData: {
        currentSceneName: currentScene.name,
        selectedItem: selectedItem,
        viewItemName: viewItemName
      },
      eventData: {
        lines: lines,
        index: index,
        characterSlots: characterSlots,
        currentLine: currentLine,
        currentOptions: currentOptions,
        currentBack: currentBack,
        currentImage: currentImage,
        hiddenCharacter: hiddenCharacter,
        currentInput: currentInput,
        ifDepth: ifDepth.current,
        opDepth: opDepth.current,
        opLabel: opLabel.current,
        bgm: bgm.current
      }
    }
    await saveGameDB(slot, saveData);
    setSaveLoadSlots(null);
  }

  // ロード
  const loadGame = async (slot) => {
    const data = await loadGameDB(slot);

    if(data){
      // ゲームデータの読み込み
      loadGameData(data);
      // この階層のステートの読み込み
      selectItem(data.opData.selectedItem);
      setViewItemName(data.opData.viewItemName);
      setLines(data.eventData.lines);
      // event
      setIndex(data.eventData.index);
      setCharacterSlots(data.eventData.characterSlots);
      setCurrentLine(data.eventData.currentLine);
      setCurrentOptions(data.eventData.currentOptions);
      setCurrentBack(data.eventData.currentBack);
      setCurrentImage(data.eventData.currentImage);
      hideCharacter(data.eventData.hiddenCharacter)
      setCurrentInput(data.eventData.currentInput);
      ifDepth.current = data.eventData.ifDepth;
      opDepth.current = data.eventData.opDepth;
      opLabel.current = data.eventData.opLabel;
      bgm.current = data.eventData.bgm;
      if(bgm.current){
        audioManager.playBGM(bgm.current, data.gameData.game.sound.bgm)
      }
      else{
        audioManager.stopBGM();
      }
    }

    setSaveLoadSlots(null);
  };

  // セーブ一覧（スロットの存在チェック）
  const listSaves = async (maxSlots, auto) => {
    const saves = await listSavesDB(maxSlots, auto);
    return saves;
  };

  // セーブボタンクリック
  const clickSave = async () => {
    if(gameData.game.save.slots === 0 && gameData.game.save.auto === true){
      saveGame("auto");
    }
    else if(gameData.game.save.slots === 1 && gameData.game.save.auto === false){
      saveGame(0);
    }
    else{
      const slots = await listSaves(gameData.game.save.slots, gameData.game.save.auto);
      setSaveLoadSlots({type: "save", slots: slots});
    }
  }

  // ロードボタンクリック
  const clickLoad = async () => {
    if(gameData.game.save.slots === 0 && gameData.game.save.auto === true){
      loadGame("auto");
    }
    else if(gameData.game.save.slots === 1 && gameData.game.save.auto === false){
      loadGame(0);
    }
    else{
      const slots = await listSaves(gameData.game.save.slots, gameData.game.save.auto);
      setSaveLoadSlots({type: "load", slots: slots});
    }
  }

  // セーブ画面を閉じる
  const closeSaveLoad = () => {
    setSaveLoadSlots(null);
  }

  // コンフィグ画面を閉じる
  const closeConfig = () => {
    setViewConfig(false);
  }

  // コンフィグ画面を開く
  const openConfig = () => {
    setViewConfig(true);
  }

  // タイマースタート
  const startTimer = (varName, start, end, file, label) => {
    const newTimer = {
      varName,
      count: start,
      end,
      step: (end - start) >= 0 ? 1 : -1,
      finished: false,
      paused: false,
      file,
      label
    }

    const fi = timers.current.findIndex(t => t.varName === varName);
    if(fi === -1){
      timers.current.push(newTimer);
    }
    else{
      timers.current[fi] = newTimer;// 同じ変数を使う場合上書き
    }
  }

  // タイマー一時停止
  const stopTimer = (varName) => {
    const fi = timers.current.findIndex(t => t.varName === varName);
    if(fi !== -1){
      timers.current[fi].paused = true;
    }
  }

  // タイマー再開
  const restartTimer = (varName) => {
    const fi = timers.current.findIndex(t => t.varName === varName);
    if(fi !== -1){
      timers.current[fi].paused = false;
    }
  }

  // use hooks-------------------------------------------------------------------------------------
  const { 
    gameData,
    currentScene,
    updateGameData,
    moveScene,
    loadGameData,
    loading,
    error
  } = useGameData("./data/gamedata.json", visitScene);
  

  // effects-----------------------------------------------------------------------------------------
  // ゲーム開始前に背景と立ち絵をまとめて読み込む
  useEffect(() => {
    if(gameData){
      const urls = [];
      // 部屋背景
      gameData.scenes.forEach((r) => {
        urls.push(r.background);

        // ホットスポット
        r.hotspots.forEach((h) => {
          // ステート
          h.states.forEach((s) => {
            urls.push(s.background);
          })
        })
      });

      // キャラクター
      gameData.characters.forEach((c) => {
        c.expressions.forEach((e) => {urls.push(e.image)});
      })

      // アイテム
      gameData.items.forEach((i) => {
        urls.push(i.image)

        // ホットスポット
        i.hotspots.forEach((h) => {
          // ステート
          h.states.forEach((s) => {
            urls.push(s.background);
          })
        })
      });

      preloadImages(urls);
    } 
  }, [gameData]);

  // リサイズ時の挙動を指定してスケール対応(絶対座標で指定するためにこの方式をとっている)
  useEffect(() => {
    if(gameData){
      const container = ref.current;
      const resize = () => {
        const { clientWidth, clientHeight } = container.parentElement;

        const baseWidth = gameData.game.screenSize[0];
        const baseHeight = gameData.game.screenSize[1];

        // 拡大はしない
        const scale = Math.min(Math.min(clientWidth / baseWidth, clientHeight / baseHeight), 1);

        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = "center center";
      };

      window.addEventListener("resize", resize);
      resize();

      return () => window.removeEventListener("resize", resize);
    }
  }, [gameData]);

  // ゲームタイトルを表示
  useEffect(() => {
    if(gameData){
      document.title = gameData.game.title;
    }
  },[gameData])

  // 自動保存
  useEffect(() => {
    if (!gameData) return;
    if (!gameData.game.save.auto) return;

    // デバウンス開始
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      saveGame("auto");
    }, 1500);

    // クリーンアップ
    return () => clearTimeout(timeoutRef.current);
  }, [gameData, currentScene, selectedItem, viewItemName,
    lines, index, characterSlots, currentLine, currentOptions, currentBack, currentImage, hiddenCharacter, currentInput,
    ifDepth.current, opDepth.current, opLabel.current]);

  // タイマー機能（イベントが終了しても動いている必要があるためトップに配置）
  useEffect(() => {
    // 常にバックグランドで1秒ごとのタイマーが動いている
    const id = setInterval(() => {
      if(timers.current.length > 0 && (timers.current.findIndex(t => !t.paused) !== -1)) {
        const updatedTimers = timers.current.map(( timer ) => {
          // 停止中の場合は何もしない
          if(timer.paused) return timer;

          // カウント処理
          const newCount = timer.count + timer.step;
          // 終了判定
          const finished = timer.step > 0 ? newCount >= timer.end : newCount <= timer.end;

          return {...timer, count: newCount, finished};
        })

        // 変数更新処理
        updateGameData(prev => {
          const next = { ...prev };
          updatedTimers.forEach(timer => {
            const idx = next.variables.findIndex(v => v.name === timer.varName);
            if(idx !== -1) next.variables[idx].value = timer.count;
          });
          return next;
        });

        // 満了イベント抽出
        const finishEvents = updatedTimers.filter(t => (t.finished && t.file && (t.file !== undefined)));
        if(finishEvents.length > 0){
          // 非同期実行するために別のEffectに飛ばす
          setTimerEvents(finishEvents);
        }

        // 満了タイマ削除処理
        const resultTimers = updatedTimers.filter(t => !t.finished);

        // タイマー更新処理
        timers.current = resultTimers;

      }
    }, 1000); // 1秒固定
    return () => clearInterval(id);
  }, [updateGameData]);

  // タイマーイベント実行
  useEffect(() => {
    if (!timerEvents) return;

    async function doEvent() {
      for (const timerEvent of timerEvents) {
        // 指定されたファイルを読み込み
        const parsedLines = await loadEventLines(timerEvent.file, timerEvent.label, gameData.characters);
        // ファイルパース結果をイベントとして実行
        executeEvent(parsedLines);
      }
      setTimerEvents(null);
    }

    doEvent();
  }, [timerEvents]);

  // calc----------------------------------------------------------------------------------------------
  const viewItem = gameData ? gameData.items.find((r) => r.name === viewItemName) : null;

  // render---------------------------------------------------------------------------------------------
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  const backStyle = {
    ...gameData.game.backStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const gameContainerStyle = {
    ...gameData.game.gameStyle,
    boxShadow: `0 4px 12px ${gameData.game.gameStyle.shadowColor}`,
    display: "flex",
    width: gameData.game.screenSize[0],
    height: gameData.game.screenSize[1],
    cursor: "pointer",
    userSelect: "none",
    flexFlow: gameData.game.itemBox.position === "right" ? "row"
            : gameData.game.itemBox.position === "left" ? "row-reverse"
            : gameData.game.itemBox.position === "top" ? "column-reverse"
            : gameData.game.itemBox.position === "bottom" ? "column"
            : "row",
    overflow: "clip",
  };

  // ゲームコンテンツ（共通）
  const gameContent = (
    <div ref={ref} style={gameContainerStyle}>
      <SceneWrap
        screenSize={gameData.game.screenSize}
        itemBoxSize={gameData.game.itemBox.foldable ? 0 : gameData.game.itemBox.size}
        itemBoxPosition={gameData.game.itemBox.position}
        background={currentScene.background}
      >
        {/* ホットスポット */}
        <Hotspots
          type="scene"
          hotspots={currentScene.hotspots}
          currentSceneName={currentScene.name}
          handleHotspotClick={handleHotspotClick}
          variables={gameData.variables}
        />

        {/* 方向移動ボタン */}
        <SceneDirections
          directions={currentScene.directions}
          config={gameData.game.direction}
          handleDirectionClick={handleDirectionClick}
        />

        {/* アイテム表示 */}
        <ItemDrawer
          item={viewItem}
          itemDrawer={gameData.game.itemDrawer}
          handleHotspotClick={handleHotspotClick}
          handleItemBackClick={handleItemBackClick}
          variables={gameData.variables}
        />

        {/* メニューボタン */}
        <Menu
          menu={gameData.game.menu}
          save={clickSave}
          load={clickLoad}
          config={openConfig}
        />
      </SceneWrap>

      {/* アイテムボックス */}
      <ItemBox
        items={gameData.items}
        itemBox={gameData.game.itemBox}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
        screenSize={gameData.game.screenSize}
      />

      {/* イベント表示 */}
      <EventViewer
        onComplete={() => setLines(null)}
        lines={lines}
        gameData={gameData}
        updateGameData={updateGameData}
        setViewItemName={setViewItemName}
        fileJump={fileJump}
        moveScene={moveScene}
        save={getEventSaveData}
        index={index}
        setIndex={setIndex}
        characterSlots={characterSlots}
        setCharacterSlots={setCharacterSlots}
        currentLine={currentLine}
        setCurrentLine={setCurrentLine}
        currentOptions={currentOptions}
        setCurrentOptions={setCurrentOptions}
        currentBack={currentBack}
        setCurrentBack={setCurrentBack}
        currentImage={currentImage}
        setCurrentImage={setCurrentImage}
        hiddenCharacter={hiddenCharacter}
        hideCharacter={hideCharacter}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        ifDepth={ifDepth}
        opDepth={opDepth}
        opLabel={opLabel}
        bgm={bgm}
        openSave={clickSave}
        openLoad={clickLoad}
        saveGame={saveGame}
        loadGame={loadGame}
        audioManager={audioManager}
        openConfig={openConfig}
        startTimer={startTimer}
        stopTimer={stopTimer}
        restartTimer={restartTimer}
      />

      {/* イベント表示(バックグラウンド) */}
      <BackgroundEventRunner
        onComplete={finishBackEvent}
        lines={backLines}
        gameData={gameData}
        updateGameData={updateGameData}
        setViewItemName={setViewItemName}
        fileJump={fileJump}
        moveScene={moveScene}
        save={getEventSaveData}
        index={0}
        setIndex={null}
        ifDepth={ifDepthBack}
        opDepth={opDepthBack}
        opLabel={opLabelBack}
        bgm={bgm}
        openSave={clickSave}
        openLoad={clickLoad}
        saveGame={saveGame}
        loadGame={loadGame}
        audioManager={audioManager}
        openConfig={openConfig}
        startTimer={startTimer}
        stopTimer={stopTimer}
        restartTimer={restartTimer}
      />

      {/* セーブロード画面 */}
      <SaveLoad
        saveLoadSlots={saveLoadSlots}
        save={gameData.game.save}
        saveClick={saveGame}
        loadClick={loadGame}
        closeSaveLoad={closeSaveLoad}
      />

      {/* 設定画面 */}
      <Config
        visible={viewConfig}
        config={gameData.game.config}
        close={closeConfig}
        bgm={gameData.game.sound.bgm}
        se={gameData.game.sound.se}
        voice={gameData.game.sound.voice}
        speed={gameData.game.textBox.speed}
        updateGameData={updateGameData}
      />
    </div>
  );

  // デバッグモード: PanelGroupで横並びレイアウト
  if (debug) {
    const debugProps = {
      gameData, updateGameData, currentScene, moveScene,
      selectedItem, selectItem, lines, setLines, backLines,
      index, executeEvent, timers, bgm, audioManager,
      stopTimer, restartTimer,
    };
    return (
      <Suspense fallback={
        <div style={{ ...backStyle, width: "100vw", height: "100vh" }}>
          {gameContent}
        </div>
      }>
        <DebugLayout debugProps={debugProps}>
          <div style={{ ...backStyle, width: "100%", height: "100%" }}>
            {gameContent}
          </div>
        </DebugLayout>
      </Suspense>
    );
  }

  // 通常モード
  return (
    <div style={{ ...backStyle, width: "100vw", height: "100vh" }}>
      {gameContent}
    </div>
  );
}
