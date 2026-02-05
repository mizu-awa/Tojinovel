//react
import { useCallback, useEffect, useMemo, useRef } from "react";

//mui
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getDesignTokens } from "./theme/Theme";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";

//other library
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

//data
import { defaultItemData } from "./datas/defaultGameData";

//style
import { handleStyle, handleStyleVertical } from "./components/editor/handleStyle";

//my components
import MainTabs from "./components/editor/MainTabs";
import SceneWrap from "./components/SceneWrap";
import ItemBox from "./components/ItemBox";
import ItemDrawer from "./components/ItemDrawer";
import EventViewer from "./components/EventViewer";
import SceneDirections from "./components/SceneDirections";
import Menu from "./components/Menu";
import SaveLoad from "./components/SaveLoad";
import Hotspots from "./components/Hotspots";
import GameInfoSettings from "./components/editor/settings/GameInfoSettings";
import ScreenSettings from "./components/editor/settings/ScreenSettings";
import ItemBoxSettings from "./components/editor/settings/ItemBoxSettings";
import ItemDrawerSettings from "./components/editor/settings/ItemDrawerSettings";
import TextBoxSettings from "./components/editor/settings/TextBoxSettings";
import DirectionSettings from "./components/editor/settings/DirectionSettings";
import OptionSettings from "./components/editor/settings/OptionSettings";
import EventImageSettings from "./components/editor/settings/EventImageSettings";
import FormSettings from "./components/editor/settings/FormSettings";
import MenuSettings from "./components/editor/settings/MenuSettings";
import SaveLoadSettings from "./components/editor/settings/SaveLoadSettings";
import GameCharacterSettings from "./components/editor/settings/GameCharacterSettings";
import CharacterSettings from "./components/editor/settings/CharacterSettings";
import SceneSettings from "./components/editor/settings/SceneSettings";
import SettingsPanel from "./components/editor/panels/SettingsPanel";
import CharactersPanel from "./components/editor/panels/CharactersPanel";
import MyAppBar from "./components/editor/MyAppBar";
import SceneItemPanel from "./components/editor/panels/SceneItemPanel";
import EditVariables from "./components/editor/edits/EditVariables";
import useEditorData from "./hooks/editor/useEditorData";
import useResizeWindow from "./hooks/editor/useResizeWindow";
import useUndoRedo from "./hooks/editor/useUndoRedo";
import useHandleChange from "./hooks/editor/useHandleChange";
import useMoveHotspot from "./hooks/editor/useMoveHotSpot";
import useEditFunctions from "./hooks/editor/useEditFunctions";
import ItemSettings from "./components/editor/settings/ItemSettings";
import ConfigSettings from "./components/editor/settings/ConfigSettings";
import Config from "./components/Config";
import ScenarioEditor from "./components/editor/ScenarioEditor";
import useScenarioEditor from "./hooks/editor/useScenarioEditor";

// 空の定義
const noop = () => {};
const defaultRef0 = { current: 0 };
const defaultRefNull = { current: null };

const itemsDataforEditor = Array.from({ length: 16 }, (_, i) => ({ ...defaultItemData, name: defaultItemData.name + i }));

export default function EditorApp() {
  // edit data
  const {
        mainTab, setMainTab,
        selectedItem, setSelectedItem,
        selectedSubItem, setSelectedSubItem,
        selectedThirdItem, setSelectedThirdItem,
        gameData, setGameData,
        gameDataRef,
        hotspotRefs,
        sceneList, itemList, characterList, stateList,
        items, subItems, thirdItems,
        nowScene, nowItem, nowHotspot, nowState,
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
        saveIndexedDB,loadFirst,saveFile,
        isSaved, setIsSaved
      } = useEditorData();
  
  // resize window--------------------------------------------------------------------
  const { ref, boxRef } = useResizeWindow({gameData});
  
  // undo redo--------------------------------------------------------
  const { debouncedDoAction, undo, redo, canUndo, canRedo }
  = useUndoRedo({setGameData, gameDataRef, mainTab, selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem});

  // handle change----------------------------------------------------------------------------------
  const { handleMainTabChange, handleAddArrayItem, handleDeleteKey, handleDatasetChange} = useHandleChange({setGameData, setMainTab, setIsSaved, debouncedDoAction});

  // edit hotspot-------------------------------------------------------
  const { onDragStart, handleResizeStart, handleRotateStart }
    = useMoveHotspot({gameDataRef, ref, hotspotRefs, mainTab, selectedItem, setGameData, setSelectedSubItem, setSelectedThirdItem, debouncedDoAction});

  // edit---------------------------------------------------------------------------
  const {
    addCharacter, copyCharacter, deleteCharacter,
    addExpression, copyExpression, deleteExpression,
    addScene, copyScene, deleteScene,
    addItem, copyItem, deleteItem,
    addHotspot, copyHotspot, deleteHotspot,
    addState, copyState, deleteState,
    addItemHotspot, copyItemHotspot, deleteItemHotspot,
    addItemState, copyItemState, deleteItemState,
    addUsedItem,deleteUsedItem,addUsedItemItem,deleteUsedItemItem,
    copy, paste, copyBykey, pasteByKey, deleteByKey
    } = useEditFunctions({
    gameDataRef, handleAddArrayItem, handleDeleteKey,
    selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem,
    mainTab
});

  // scenario editor------------------------------------------------------
  const {
    currentFilePath,
    currentLabel,
    textareaRef,
    loadEventFile,
    handleTextChange,
    saveAllDirtyFiles,
    hasDirtyFiles: _hasDirtyFiles,
    status: scenarioStatus,
    loadBufferFromIndexedDB,
    fileNotFound,
    createNewFile,
    closeFile,
  } = useScenarioEditor({ setIsSaved });

  // 保存処理を統合（gamedata.json + イベントファイル）
  const saveAll = useCallback(async () => {
    const result = await saveAllDirtyFiles();
    if (!result.ok) {
      console.error("イベントファイル保存エラー:", result.errors);
    }
    saveFile();
  }, [saveAllDirtyFiles, saveFile]);

  // keydown-------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {

      // 保存
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveAll();
      }
      // アンドゥ/リドゥ: フォーム内外を問わず統一動作
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
      }
      else{ // フォームと関連があるショートカット
        const isInput =
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable;

        // テキストが選択されているかどうかをチェック
        const selection = window.getSelection();
        const hasTextSelection = selection && selection.toString().length > 0;
        if (isInput || hasTextSelection) return; // フォームはブラウザに任せる

        // --- コピー & ペースト機能 ---
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
          e.preventDefault();
          copyBykey(); // 自作のコピー関数を呼ぶ
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
          e.preventDefault();
          pasteByKey(); // 自作のペースト関数を呼ぶ
        }
        // --- デリート機能 ---
        else if (e.key === "Delete") {
          e.preventDefault();
          deleteByKey();//TODO: リストが更新されない！！解決できなかったら消すしかない…
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, copyBykey, pasteByKey, saveAll, deleteByKey]);

  // 最新 gameData を ref に保持
  useEffect(() => {
    if(gameData && gameDataRef){
      gameDataRef.current = gameData;
    }
  }, [gameData]);

  // データを読み込み
  useEffect(() => {
    if(loadFirst){
      loadFirst();
      loadBufferFromIndexedDB();
    }
  },[loadFirst, loadBufferFromIndexedDB])

  // IndexedDB自動保存 フォーカス外れ等によるページリロード対策
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!gameData) return;

    // デバウンス開始
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      saveIndexedDB();
    }, 2000);

    // クリーンアップ
    return () => clearTimeout(timeoutRef.current);
  }, [gameData]);


  // theme----------------------------------------------------------------------------------------------
  // OSの設定に従う
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? "dark" : "light")),
    [prefersDarkMode]
  );

  // render null-------------------------------------------------------
  if(!gameData) return null;

  // render const -------------------------------------------------------------------------------------
  // OPTIMIZE: 三項演算子で書いたほうが軽いかも？
  const gameSettingComponents = {
    "ゲーム情報" : <GameInfoSettings game={gameData.game} scenes={gameData.scenes} handleDatasetChange={handleDatasetChange} />,
    "ゲーム画面" : <ScreenSettings game={gameData.game} handleDatasetChange={handleDatasetChange} />,
    "アイテムボックス" : <ItemBoxSettings gameItemBox={gameData.game.itemBox} handleDatasetChange={handleDatasetChange} />,
    "アイテムドロワー" : <ItemDrawerSettings gameItemDrawer={gameData.game.itemDrawer} handleDatasetChange={handleDatasetChange} />,
    "テキストボックス" : <TextBoxSettings gameTextBox={gameData.game.textBox} handleDatasetChange={handleDatasetChange} />,
    "方向移動" : <DirectionSettings gameDirection={gameData.game.direction} handleDatasetChange={handleDatasetChange} />,
    "選択肢" : <OptionSettings gameOption={gameData.game.option} handleDatasetChange={handleDatasetChange} />,
    "画像表示" : <EventImageSettings gameImage={gameData.game.image} handleDatasetChange={handleDatasetChange} />,
    "入力フォーム" : <FormSettings gameInput={gameData.game.input} handleDatasetChange={handleDatasetChange}/>,
    "ゲームメニュー" : <MenuSettings gameMenu={gameData.game.menu} handleDatasetChange={handleDatasetChange}/>,
    "セーブ・ロード" : <SaveLoadSettings gameSave={gameData.game.save} handleDatasetChange={handleDatasetChange} />,
    "コンフィグ": <ConfigSettings gameConfig={gameData.game.config} handleDatasetChange={handleDatasetChange} />,
    "キャラクター表示" : <GameCharacterSettings gameCharacter={gameData.game.character} handleDatasetChange={handleDatasetChange} />
  }
  // OPTIMIZE: 三項演算子で書いたほうが軽いかも？
  const rightPanels = {
   "settings" : gameSettingComponents[selectedItem],
   "characters" : 
    <CharacterSettings
      characters={gameData.characters}
      characterList={characterList}
      index={selectedItem}
      subIndex={selectedSubItem}
      handleDatasetChange={handleDatasetChange}
    />,
    "scenes" :
      <SceneSettings
        scene={nowScene}
        selectedItem={selectedItem}
        selectedSubItem={selectedSubItem}
        selectedThirdItem={selectedThirdItem}
        sceneList={sceneList}
        itemList={itemList}
        addUsedItem={addUsedItem}
        deleteUsedItem={deleteUsedItem}
        hotspot={nowHotspot}
        state={nowState}
        states={stateList}
        handleDatasetChange={handleDatasetChange}
        loadEventFile={loadEventFile}
      />,
    "items":
      <ItemSettings
        item={nowItem}
        selectedItem={selectedItem}
        selectedSubItem={selectedSubItem}
        selectedThirdItem={selectedThirdItem}
        sceneList={sceneList}
        itemList={itemList}
        addUsedItem={addUsedItemItem}
        deleteUsedItem={deleteUsedItemItem}
        hotspot={nowHotspot}
        state={nowState}
        states={stateList}
        handleDatasetChange={handleDatasetChange}
        loadEventFile={loadEventFile}
      />,
  }
  const sceneItemPanel =
    <SceneItemPanel
      mainTab={mainTab}
      items={items}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      addScene={addScene}
      copyScene={copyScene}
      deleteScene={deleteScene}
      addItem={addItem}
      copyItem={copyItem}
      deleteItem={deleteItem}
      subItems={subItems}
      selectedSubItem={selectedSubItem}
      setSelectedSubItem={setSelectedSubItem}
      addHotspot={addHotspot}
      copyHotspot={copyHotspot}
      deleteHotspot={deleteHotspot}
      addItemHotspot={addItemHotspot}
      copyItemHotspot={copyItemHotspot}
      deleteItemHotspot={deleteItemHotspot}
      thirdItems={thirdItems}
      selectedThirdItem={selectedThirdItem}
      setSelectedThirdItem={setSelectedThirdItem}
      addState={addState}
      copyState={copyState}
      deleteState={deleteState}
      addItemState={addItemState}
      copyItemState={copyItemState}
      deleteItemState={deleteItemState}
      copy={copy}
      paste={paste}
    />;
  // OPTIMIZE: 三項演算子で書いたほうが軽いかも？
  const leftPanels = {
    "settings":<SettingsPanel items={items} selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>,
    "characters":
      <CharactersPanel
        items={items}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        addCharacter={addCharacter}
        duplicateCharacter={copyCharacter}
        deleteCharacter={deleteCharacter}
        subItems={subItems}
        selectedSubItem={selectedSubItem}
        setSelectedSubItem={setSelectedSubItem}
        addExpression={addExpression}
        duplicateExpression={copyExpression}
        deleteExpression={deleteExpression}
        copy={copy}
        paste={paste}
      />,
    "scenes": sceneItemPanel,
    "items": sceneItemPanel
  }

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      {/* Header */}
      <MyAppBar
        save={saveAll}
        isSaved={isSaved}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Tabs */}
      <MainTabs
        value={mainTab}
        onChange={handleMainTabChange}
      />

      {/* Main */}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <PanelGroup direction="horizontal" style={{ flex: 1, minHeight: 0 }}>
          {/* Left */}
          <Panel
            defaultSize={15}
            minSize={10}
            style={{ height: "100%" }}
          >
            {leftPanels[mainTab]}
          </Panel>

          <PanelResizeHandle style={handleStyle} />

          {/* Center */}
          <Panel defaultSize={65}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={100}>
                {selectedItem !== "変数" ? 
                  // ゲーム画面表示
                  <div
                    ref={boxRef}
                    style={{
                      ...gameData.game.backStyle,
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                  >
                    <div
                      ref={ref}
                      style={{
                        ...gameData.game.gameStyle,
                        boxShadow: `0 4px 12px ${gameData.game.gameStyle.shadowColor}`,
                        display: "flex",
                        width: gameData.game.screenSize[0],
                        height: gameData.game.screenSize[1],
                        userSelect: "none",
                        flexFlow: gameData.game.itemBox.position === "right" ? "row"
                                : gameData.game.itemBox.position === "left" ? "row-reverse"
                                : gameData.game.itemBox.position === "top" ? "column-reverse"
                                : gameData.game.itemBox.position === "bottom" ? "column"
                                : "row",
                        overflow: "clip"
                      }}
                    >

                      <SceneWrap
                        screenSize={gameData.game.screenSize}
                        itemBoxSize={gameData.game.itemBox.foldable ? 0 : gameData.game.itemBox.size}
                        itemBoxPosition={gameData.game.itemBox.position}
                        background={mainTab === "scenes" ? nowScene?.background : ""}
                        edit
                      >
                        {/* ホットスポット選択解除 */}
                        <div
                          onClick={() => {
                            setSelectedSubItem(null);
                            setSelectedThirdItem(null);
                          }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0
                          }}
                        />

                        {/* シーンホットスポット */}
                        {mainTab === "scenes" &&
                          <Hotspots
                            type="scene"
                            edit
                            hotspotIndex={selectedSubItem}
                            stateIndex={selectedThirdItem}
                            hotspots={nowScene?.hotspots}
                            handleHotspotClick={noop}
                            onMouseDown={onDragStart}
                            hotspotRefs={hotspotRefs}
                            handleResizeStart={handleResizeStart}
                            handleRotateStart={handleRotateStart}
                            variables={gameData.variables}
                          />}

                        {/* 方向移動ボタン */}
                        {(selectedItem === "方向移動" || mainTab === "scenes") &&
                          <SceneDirections
                            directions={directionsForEditor}
                            config={gameData.game.direction}
                            handleDirectionClick={noop}
                          />}

                        {/* アイテム表示 */}
                        {(selectedItem === "アイテムドロワー" || mainTab === "items") &&
                          <ItemDrawer
                            item={mainTab === "items" ? nowItem : itemsDataforEditor[0]}
                            itemDrawer={gameData.game.itemDrawer}
                            handleHotspotClick={noop}
                            handleItemBackClick={noop}
                            edit
                            hotspotIndex={selectedSubItem}
                            stateIndex={selectedThirdItem}
                            onMouseDown={onDragStart}
                            hotspotRefs={hotspotRefs}
                            handleResizeStart={handleResizeStart}
                            handleRotateStart={handleRotateStart}
                            variables={gameData.variables}
                            setSelectedSubItem={setSelectedSubItem}
                            setSelectedThirdItem={setSelectedThirdItem}
                          />}

                        {/* メニューボタン */}
                        {selectedItem !== "変数" &&
                          <Menu
                            menu={gameData.game.menu}
                            save={noop}
                            load={noop}
                          />}

                      </SceneWrap>

                      {/* アイテムボックス */}
                      <ItemBox
                        items={itemsDataforEditor}
                        itemBox={gameData.game.itemBox}
                        selectedItem={itemsDataforEditor[0].name}
                        handleItemClick={noop}
                        screenSize={gameData.game.screenSize}
                      />

                      {/* イベント表示 */}
                      <EventViewer
                        onComplete={noop}
                        lines={linesForEditor}
                        gameData={gameDataForEvent}
                        updateGameData={noop}
                        setViewItemName={noop}
                        fileJump={noop}
                        moveScene={noop}
                        save={noop}
                        index={0}
                        setIndex={noop}
                        characterSlots={characterSlotsForEditor}
                        setCharacterSlots={noop}
                        currentLine={currentLineForEditor}
                        setCurrentLine={noop}
                        currentOptions={optionsForEditor}
                        setCurrentOptions={noop}
                        currentBack={currentBackForEditor}
                        setCurrentBack={noop}
                        currentImage={imageForEditor}
                        setCurrentImage={noop}
                        hiddenCharacter={false}
                        hideCharacter={noop}
                        currentInput={currentInputForEditor}
                        setCurrentInput={noop}
                        ifDepth={defaultRef0}
                        opDepth={defaultRef0}
                        opLabel={defaultRefNull}
                        bgm={null}
                        forEdit={true}
                        openSave={noop}
                        openLoad={noop}
                        saveGame={noop}
                        loadGame={noop}
                        audioManager={null}
                        openConfig={noop}
                      />

                      {/* セーブロード画面 */}
                      {selectedItem === "セーブ・ロード" &&
                        <SaveLoad
                          saveLoadSlots={saveLoadSlotsForEditor}
                          save={gameData.game.save}
                          saveClick={noop}
                          loadClick={noop}
                          closeSaveLoad={noop}
                        />}
                      
                      {/* 設定画面 */}
                      {selectedItem === "コンフィグ" &&
                        <Config
                          visible={true}
                          config={gameData.game.config}
                          close={noop}
                          bgm={gameData.game.sound.bgm}
                          se={gameData.game.sound.se}
                          voice={gameData.game.sound.voice}
                          speed={gameData.game.textBox.speed}
                          updateGameData={noop}
                        />}

                    </div>
                  </div>

                :// 変数編集画面
                  <EditVariables
                    variables={gameData.variables}
                    handleDatasetChange={handleDatasetChange}
                    handleDeleteKey={handleDeleteKey}
                    handleAddArrayItem={handleAddArrayItem}
                  />
                }
              </Panel>

              {/* シナリオエディタ: シーン/アイテムタブでのみ表示 */}
              {(mainTab === "scenes" || mainTab === "items") && <>
                <PanelResizeHandle style={handleStyleVertical} />
                <Panel defaultSize={35} minSize={15}>
                  <ScenarioEditor
                    currentFilePath={currentFilePath}
                    currentLabel={currentLabel}
                    textareaRef={textareaRef}
                    handleTextChange={handleTextChange}
                    status={scenarioStatus}
                    loadEventFile={loadEventFile}
                    fileNotFound={fileNotFound}
                    createNewFile={createNewFile}
                    closeFile={closeFile}
                  />
                </Panel>
              </>}

            </PanelGroup>
          </Panel>

          <PanelResizeHandle style={handleStyle} />

          {/* Right */}
          <Panel defaultSize={20}>
            <Box sx={{ height: "100%", p: 1, overflowY: "scroll" }}>
                {rightPanels[mainTab]}
                <Box sx={{width: "100%", height: "2em"}} />{/* FIXME: スクロールが下まで行かない 暫定対策 */}
            </Box>
          </Panel>
        </PanelGroup>
      </Box>

      {/* Footer NOTE: 必要があれば使う */}
      {/*<Box sx={{ p: 1, textAlign: "center" }}>
        Footer
      </Box>*/}

    </Box>
    </ThemeProvider>
  );
}

