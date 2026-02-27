//react
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import useFileList from "./hooks/editor/useFileList";
import ItemSettings from "./components/editor/settings/ItemSettings";
import ConfigSettings from "./components/editor/settings/ConfigSettings";
import Config from "./components/Config";
import ScenarioEditor from "./components/editor/ScenarioEditor";
import useScenarioEditor from "./hooks/editor/useScenarioEditor";
import SnapOverlay from "./components/editor/SnapOverlay";
import FileExplorer from "./components/editor/panels/FileExplorer";
import ImagePreview from "./components/editor/ImagePreview";

// 画像拡張子判定
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]);
const isImageFile = (path) => {
  const ext = path.split(".").pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
};
const isTextFile = (path) => path.split(".").pop()?.toLowerCase() === "txt";

// 空の定義
const noop = () => {};
const defaultRef0 = { current: 0 };
const defaultRefNull = { current: null };
const defaultRefMap = { current: new Map() };
const deselectOverlayStyle = { position: "absolute", width: "100%", height: "100%", top: 0, left: 0 };

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
        sceneList, itemList, characterList, variableList, stateList,
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

  // scenario editor------------------------------------------------------
  // CodeMirrorフォーカス状態管理
  const [isCodeMirrorFocused, setIsCodeMirrorFocused] = useState(false);
  const isCodeMirrorFocusedRef = useRef(false);
  useEffect(() => {
    isCodeMirrorFocusedRef.current = isCodeMirrorFocused;
  }, [isCodeMirrorFocused]);

  const {
    currentFilePath,
    currentLabel,
    editorViewRef,
    loadEventFile,
    handleTextChange,
    saveAllDirtyFiles,
    hasDirtyFiles: _hasDirtyFiles,
    status: scenarioStatus,
    loadBufferFromIndexedDB,
    fileNotFound,
    createNewFile,
    closeFile,
    applyPendingContent,
  } = useScenarioEditor({
    setIsSaved,
  });

  // シナリオエディタ最大化状態
  const [isScenarioEditorMaximized, setIsScenarioEditorMaximized] = useState(false);
  const toggleScenarioEditorMaximize = useCallback(() => {
    setIsScenarioEditorMaximized(prev => !prev);
  }, []);

  // エクスプローラーで選択中のファイル（画像プレビュー用）
  const [explorerSelectedImage, setExplorerSelectedImage] = useState(null);

  // タブ切替時にエクスプローラー状態をリセット
  useEffect(() => {
    if (mainTab !== "explorer") {
      setExplorerSelectedImage(null);
    }
  }, [mainTab]);

  // エクスプローラーでファイルクリック時のハンドラ
  const handleExplorerFileSelect = useCallback((filePath) => {
    if (isTextFile(filePath)) {
      setExplorerSelectedImage(null);
      loadEventFile(filePath);
    } else if (isImageFile(filePath)) {
      setExplorerSelectedImage(filePath);
    }
  }, [loadEventFile]);

  // undo redo--------------------------------------------------------
  const { debouncedDoAction, undo, redo, canUndo, canRedo }
  = useUndoRedo({
    setGameData, gameDataRef, mainTab, selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem,
  });

  // handle change----------------------------------------------------------------------------------
  const { handleMainTabChange, handleNestedChange, handleAddArrayItem, handleDeleteKey, handleDatasetChange} = useHandleChange({setGameData, setMainTab, setIsSaved, debouncedDoAction});

  // snap guide lines-----------------------------------------------------
  const [guideLines, setGuideLines] = useState([]);

  // シーンエリアのサイズ（アイテムボックスを除いた領域）
  const sceneSize = useMemo(() => {
    if (!gameData?.game) return [800, 600];
    const [sw, sh] = gameData.game.screenSize;
    const itemBox = gameData.game.itemBox;
    const boxSize = itemBox.foldable ? 0 : itemBox.size;
    const isHorizontal = itemBox.position === "right" || itemBox.position === "left";
    return isHorizontal ? [sw - boxSize, sh] : [sw, sh - boxSize];
  }, [gameData?.game?.screenSize, gameData?.game?.itemBox?.size, gameData?.game?.itemBox?.position, gameData?.game?.itemBox?.foldable]);

  // edit hotspot-------------------------------------------------------
  const { onDragStart, handleResizeStart, handleRotateStart }
    = useMoveHotspot({gameDataRef, ref, hotspotRefs, mainTab, selectedItem, setGameData, setSelectedSubItem, setSelectedThirdItem, debouncedDoAction, screenSize: sceneSize, setGuideLines});

  // ホットスポットのテキストをインライン編集するコールバック
  const handleHotspotTextChange = useCallback((hIndex, sIndex, newText) => {
    const collection = mainTab === "scenes" ? "scenes" : "items";
    const path = `${collection}.${selectedItem}.hotspots.${hIndex}.states.${sIndex}.text`;
    handleNestedChange(path)({ target: { value: newText } });
  }, [mainTab, selectedItem, handleNestedChange]);

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

  // ファイルリスト（オートコンプリート用）
  const { fileList, refreshFileList, ensureLoaded: ensureFileListLoaded } = useFileList();

  // 保存処理を統合（gamedata.json + イベントファイル）
  const saveAll = useCallback(async () => {
    const result = await saveAllDirtyFiles();
    if (!result.ok) {
      console.error("イベントファイル保存エラー:", result.errors);
    }
    await saveFile();
  }, [saveAllDirtyFiles, saveFile]);

  // Google Fontsの自動ロード
  useEffect(() => {
    if (!gameData) return;

    // 使用されているフォントを収集
    const fonts = new Set();

    // 全体フォント
    const defaultFont = gameData.game?.gameStyle?.fontFamily;
    if (defaultFont && defaultFont !== "system-ui" && !defaultFont.includes(",")) {
      fonts.add(defaultFont);
    }

    // 全ホットスポットのフォント
    gameData.scenes?.forEach(scene => {
      scene.hotspots?.forEach(hotspot => {
        hotspot.states?.forEach(state => {
          if (state.style?.fontFamily && state.style.fontFamily !== "system-ui" && !state.style.fontFamily.includes(",")) {
            fonts.add(state.style.fontFamily);
          }
        });
      });
    });

    gameData.items?.forEach(item => {
      item.hotspots?.forEach(hotspot => {
        hotspot.states?.forEach(state => {
          if (state.style?.fontFamily && state.style.fontFamily !== "system-ui" && !state.style.fontFamily.includes(",")) {
            fonts.add(state.style.fontFamily);
          }
        });
      });
    });

    // Google Fonts をロード
    if (fonts.size > 0) {
      const fontFamilies = Array.from(fonts).map(f => f.replace(/ /g, "+")).join("&family=");
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
      link.rel = "stylesheet";
      link.id = "google-fonts-dynamic-editor";

      // 既存のリンクを削除
      const existingLink = document.getElementById("google-fonts-dynamic-editor");
      if (existingLink) {
        document.head.removeChild(existingLink);
      }

      document.head.appendChild(link);

      return () => {
        const linkToRemove = document.getElementById("google-fonts-dynamic-editor");
        if (linkToRemove) {
          document.head.removeChild(linkToRemove);
        }
      };
    }
  }, [gameData]);

  // keydown-------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {

      // 保存
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveAll();
      }
      // アンドゥ/リドゥ: CodeMirrorフォーカス中はCodeMirrorに任せる
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        if (isCodeMirrorFocusedRef.current) return;
        e.preventDefault();
        undo();
      }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        if (isCodeMirrorFocusedRef.current) return;
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
        // --- 矢印キー: ホットスポット移動/サイズ変更 ---
        else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          if ((mainTab === "scenes" || mainTab === "items") && selectedSubItem >= 0 && selectedThirdItem >= 0) {
            const current = gameDataRef.current;
            const stateData =
              mainTab === "scenes"
                ? current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]
                : current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem];
            if (stateData) {
              e.preventDefault();
              debouncedDoAction(true);
              if (e.shiftKey) {
                // Shift + 矢印: サイズ変更
                if (e.key === "ArrowRight") stateData.width += 1;
                if (e.key === "ArrowLeft") stateData.width = Math.max(1, stateData.width - 1);
                if (e.key === "ArrowDown") stateData.height += 1;
                if (e.key === "ArrowUp") stateData.height = Math.max(1, stateData.height - 1);
              } else {
                // 矢印キー: 1px移動
                if (e.key === "ArrowRight") stateData.x += 1;
                if (e.key === "ArrowLeft") stateData.x -= 1;
                if (e.key === "ArrowDown") stateData.y += 1;
                if (e.key === "ArrowUp") stateData.y -= 1;
              }
              setGameData(structuredClone(current));
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, copyBykey, pasteByKey, saveAll, deleteByKey, mainTab, selectedItem, selectedSubItem, selectedThirdItem, debouncedDoAction, setGameData]);

  // CodeMirror外クリックでフォーカスを外す
  useEffect(() => {
    const handleMouseDown = (e) => {
      const cmDom = editorViewRef.current?.dom;
      if (cmDom && !cmDom.contains(e.target)) {
        editorViewRef.current?.contentDOM.blur();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [editorViewRef]);

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
      loadBufferFromIndexedDB().then(() => {
        const savedPath = sessionStorage.getItem("scenarioEditorFilePath");
        if (savedPath) loadEventFile(savedPath);
      });
      refreshFileList();
    }
  },[loadFirst, loadBufferFromIndexedDB, loadEventFile, refreshFileList])

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

  // 施策5: ホットスポット選択解除のコールバックを安定化
  const handleDeselectHotspot = useCallback(() => {
    setSelectedSubItem(null);
    setSelectedThirdItem(null);
  }, []);

  // 施策4: インラインスタイルをメモ化
  const backWrapStyle = useMemo(() => {
    if (!gameData?.game) return {};
    return {
      ...gameData.game.backStyle,
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    };
  }, [gameData?.game?.backStyle]);

  const gameWrapStyle = useMemo(() => {
    if (!gameData?.game) return {};
    return {
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
      overflow: "clip",
      flexShrink: 0,
      backgroundImage: 
        "linear-gradient(to right, rgba(125, 125, 125, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(125, 125, 125, 0.5) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    };
  }, [gameData?.game?.gameStyle, gameData?.game?.screenSize, gameData?.game?.itemBox?.position]);

  // render null-------------------------------------------------------
  if(!gameData) return null;

  // 共通シーンを取得
  const commonScene = gameData?.game?.commonSceneName
    ? gameData.scenes.find(s => s.name === gameData.game.commonSceneName)
    : null;

  // render const -------------------------------------------------------------------------------------
  // 施策1: 選択中のSettingsコンポーネントだけを生成
  const renderGameSetting = () => {
    switch(selectedItem) {
      case "ゲーム情報": return <GameInfoSettings game={gameData.game} scenes={gameData.scenes} handleDatasetChange={handleDatasetChange} />;
      case "ゲーム画面": return <ScreenSettings game={gameData.game} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "アイテムボックス": return <ItemBoxSettings gameItemBox={gameData.game.itemBox} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "アイテムドロワー": return <ItemDrawerSettings gameItemDrawer={gameData.game.itemDrawer} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "テキストボックス": return <TextBoxSettings gameTextBox={gameData.game.textBox} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "方向移動": return <DirectionSettings gameDirection={gameData.game.direction} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "選択肢": return <OptionSettings gameOption={gameData.game.option} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "画像表示": return <EventImageSettings gameImage={gameData.game.image} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "入力フォーム": return <FormSettings gameInput={gameData.game.input} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "ゲームメニュー": return <MenuSettings gameMenu={gameData.game.menu} handleDatasetChange={handleDatasetChange}/>;
      case "セーブ・ロード": return <SaveLoadSettings gameSave={gameData.game.save} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "コンフィグ": return <ConfigSettings gameConfig={gameData.game.config} handleDatasetChange={handleDatasetChange} fileList={fileList} ensureFileListLoaded={ensureFileListLoaded} />;
      case "キャラクター表示": return <GameCharacterSettings gameCharacter={gameData.game.character} handleDatasetChange={handleDatasetChange} />;
      default: return null;
    }
  };

  // 施策1: 表示中のタブの右パネルだけを生成
  const renderRightPanel = () => {
    switch(mainTab) {
      case "settings": return renderGameSetting();
      case "characters": return (
        <CharacterSettings
          characters={gameData.characters}
          characterList={characterList}
          index={selectedItem}
          subIndex={selectedSubItem}
          handleDatasetChange={handleDatasetChange}
          fileList={fileList}
          ensureFileListLoaded={ensureFileListLoaded}
        />
      );
      case "scenes": return (
        <SceneSettings
          scene={nowScene}
          selectedItem={selectedItem}
          selectedSubItem={selectedSubItem}
          selectedThirdItem={selectedThirdItem}
          sceneList={sceneList}
          itemList={itemList}
          variableList={variableList}
          addUsedItem={addUsedItem}
          deleteUsedItem={deleteUsedItem}
          hotspot={nowHotspot}
          state={nowState}
          states={stateList}
          handleDatasetChange={handleDatasetChange}
          loadEventFile={loadEventFile}
          fileList={fileList}
          ensureFileListLoaded={ensureFileListLoaded}
        />
      );
      case "items": return (
        <ItemSettings
          item={nowItem}
          selectedItem={selectedItem}
          selectedSubItem={selectedSubItem}
          selectedThirdItem={selectedThirdItem}
          sceneList={sceneList}
          itemList={itemList}
          variableList={variableList}
          addUsedItem={addUsedItemItem}
          deleteUsedItem={deleteUsedItemItem}
          hotspot={nowHotspot}
          state={nowState}
          states={stateList}
          handleDatasetChange={handleDatasetChange}
          loadEventFile={loadEventFile}
          fileList={fileList}
          ensureFileListLoaded={ensureFileListLoaded}
        />
      );
      default: return null;
    }
  };

  // 施策1: 表示中のタブの左パネルだけを生成
  const renderLeftPanel = () => {
    switch(mainTab) {
      case "settings": return <SettingsPanel items={items} selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>;
      case "characters": return (
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
        />
      );
      case "scenes":
      case "items": return (
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
        />
      );
      case "explorer": return <FileExplorer onFileSelect={handleExplorerFileSelect} onFileChange={refreshFileList} />;
      default: return null;
    }
  };

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
        <PanelGroup direction="horizontal" autoSaveId="editor-main" style={{ flex: 1, minHeight: 0 }}>
          {/* Left */}
          <Panel
            defaultSize={15}
            minSize={10}
            style={{ height: "100%" }}
          >
            {renderLeftPanel()}
          </Panel>

          <PanelResizeHandle style={handleStyle} />

          {/* Center */}
          <Panel defaultSize={65}>
            <PanelGroup direction="vertical" autoSaveId="editor-center">
              <Panel defaultSize={100}>
                {mainTab === "explorer" ?
                  // エクスプローラー: 画像プレビュー or プレースホルダー
                  (explorerSelectedImage ? (
                    <ImagePreview filePath={explorerSelectedImage} />
                  ) : !currentFilePath ? (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography variant="body2" color="text.disabled">
                        ファイルを選択してください
                      </Typography>
                    </Box>
                  ) : null)

                : selectedItem !== "変数" ?
                  // ゲーム画面表示
                  <div
                    ref={boxRef}
                    style={backWrapStyle}
                  >
                    <div
                      ref={ref}
                      style={gameWrapStyle}
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
                          onClick={handleDeselectHotspot}
                          style={deselectOverlayStyle}
                        />

                        {/* ガイドライン表示 */}
                        {(mainTab === "scenes" || mainTab === "items") &&
                          <SnapOverlay guideLines={guideLines} screenSize={sceneSize} />}

                        {/* シーンホットスポット */}
                        {mainTab === "scenes" && (
                          <>
                            {/* 通常シーンのホットスポット */}
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
                              onTextChange={handleHotspotTextChange}
                            />

                            {/* 共通シーンのホットスポット */}
                            {commonScene && commonScene.name !== nowScene?.name && (
                              <Hotspots
                                type="common"
                                edit
                                hotspotIndex={-1}
                                stateIndex={null}
                                hotspots={commonScene.hotspots}
                                handleHotspotClick={noop}
                                onMouseDown={noop}
                                hotspotRefs={null}
                                handleResizeStart={noop}
                                handleRotateStart={noop}
                                variables={gameData.variables}
                                onTextChange={noop}
                              />
                            )}
                          </>
                        )}

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
                            gameData={gameData}
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
                        ifMatched={defaultRefMap}
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
                          screenSize={gameData.game.screenSize}
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

              {/* シナリオエディタ: シーン/アイテム/エクスプローラータブで表示 */}
              {(mainTab === "scenes" || mainTab === "items" || (mainTab === "explorer" && !explorerSelectedImage && currentFilePath)) && <>
                <PanelResizeHandle style={handleStyleVertical} />
                <Panel defaultSize={35} minSize={0}>
                  <ScenarioEditor
                    currentFilePath={currentFilePath}
                    currentLabel={currentLabel}
                    editorViewRef={editorViewRef}
                    handleTextChange={handleTextChange}
                    status={scenarioStatus}
                    loadEventFile={loadEventFile}
                    fileNotFound={fileNotFound}
                    createNewFile={createNewFile}
                    closeFile={closeFile}
                    applyPendingContent={applyPendingContent}
                    isMaximized={isScenarioEditorMaximized}
                    onToggleMaximize={toggleScenarioEditorMaximize}
                    onFocusChange={setIsCodeMirrorFocused}
                    sceneList={sceneList}
                    itemList={itemList}
                  />
                </Panel>
              </>}

            </PanelGroup>
          </Panel>

          <PanelResizeHandle style={handleStyle} />

          {/* Right */}
          <Panel defaultSize={20}>
            <Box sx={{ height: "100%", p: 1, overflowY: "scroll" }}>
                {renderRightPanel()}
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

