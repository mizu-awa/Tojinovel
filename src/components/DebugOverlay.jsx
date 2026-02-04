import { useState, memo } from "react";
import useDebugTheme from "../hooks/useDebugTheme.js";
import DebugVariables from "./debug/DebugVariables.jsx";
import DebugScenes from "./debug/DebugScenes.jsx";
import DebugItems from "./debug/DebugItems.jsx";
import DebugHotspots from "./debug/DebugHotspots.jsx";
import DebugEvents from "./debug/DebugEvents.jsx";
import DebugTimers from "./debug/DebugTimers.jsx";
import DebugAudio from "./debug/DebugAudio.jsx";

const TABS = [
  { key: "variables", label: "変数" },
  { key: "scenes",    label: "シーン" },
  { key: "items",     label: "アイテム" },
  { key: "hotspots",  label: "ホットスポット" },
  { key: "events",    label: "イベント" },
  { key: "timers",    label: "タイマー" },
  { key: "audio",     label: "オーディオ" },
];

function DebugOverlay({
  gameData,
  updateGameData,
  currentScene,
  moveScene,
  selectedItem,
  selectItem,
  viewItemName,
  lines,
  setLines,
  backLines,
  index,
  executeEvent,
  timers,
  bgm,
  audioManager,
  stopTimer,
  restartTimer,
}) {
  const [activeTab, setActiveTab] = useState("variables");
  const theme = useDebugTheme();

  // スタイル
  const overlayStyle = {
    height: "100%",
    backgroundColor: theme.bg,
    color: theme.text,
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    overflow: "hidden",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: `1px solid ${theme.border}`,
    flexShrink: 0,
  };

  const tabBarStyle = {
    display: "flex",
    gap: 0,
    padding: "0 8px",
    borderBottom: `1px solid ${theme.border}`,
    flexShrink: 0,
  };

  const tabStyle = (active) => ({
    padding: "8px 12px",
    border: "none",
    borderBottom: active ? `2px solid ${theme.primary}` : "2px solid transparent",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: active ? theme.primary : theme.textSecondary,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: active ? 700 : 400,
    fontFamily: "inherit",
  });

  return (
    <div style={overlayStyle}>
      {/* ヘッダー */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: theme.primary }}>
          DEBUG
        </span>
      </div>

      {/* タブバー */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            style={tabStyle(activeTab === tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
        {activeTab === "variables" && (
          <DebugVariables
            variables={gameData.variables}
            updateGameData={updateGameData}
            theme={theme}
          />
        )}
        {activeTab === "scenes" && (
          <DebugScenes
            scenes={gameData.scenes}
            currentSceneName={currentScene.name}
            moveScene={moveScene}
            theme={theme}
          />
        )}
        {activeTab === "items" && (
          <DebugItems
            items={gameData.items}
            selectedItem={selectedItem}
            selectItem={selectItem}
            updateGameData={updateGameData}
            theme={theme}
          />
        )}
        {activeTab === "hotspots" && (
          <DebugHotspots
            hotspots={currentScene.hotspots}
            currentSceneName={currentScene.name}
            items={gameData.items}
            viewItemName={viewItemName}
            updateGameData={updateGameData}
            theme={theme}
          />
        )}
        {activeTab === "events" && (
          <DebugEvents
            lines={lines}
            setLines={setLines}
            backLines={backLines}
            index={index}
            executeEvent={executeEvent}
            characters={gameData.characters}
            theme={theme}
          />
        )}
        {activeTab === "timers" && (
          <DebugTimers
            timers={timers}
            stopTimer={stopTimer}
            restartTimer={restartTimer}
            theme={theme}
          />
        )}
        {activeTab === "audio" && (
          <DebugAudio
            bgm={bgm}
            audioManager={audioManager}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

export default memo(DebugOverlay);
