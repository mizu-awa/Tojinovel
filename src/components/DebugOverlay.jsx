import { useState, memo } from "react";
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

// スタイル定数
const overlayStyle = {
  height: "100%",
  backgroundColor: "#fafafa",
  color: "#333",
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
  borderBottom: "1px solid #e0e0e0",
  flexShrink: 0,
};

const tabBarStyle = {
  display: "flex",
  gap: 0,
  padding: "0 8px",
  borderBottom: "1px solid #e0e0e0",
  flexShrink: 0,
};

const tabStyle = (active) => ({
  padding: "8px 12px",
  border: "none",
  borderBottom: active ? "2px solid #4bbeeb" : "2px solid transparent",
  borderRadius: 0,
  backgroundColor: "transparent",
  color: active ? "#4bbeeb" : "#666",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: active ? 700 : 400,
  fontFamily: "inherit",
});

const contentStyle = {
  flex: 1,
  overflow: "auto",
  padding: "8px 12px",
};

function DebugOverlay({
  gameData,
  updateGameData,
  currentScene,
  moveScene,
  selectedItem,
  selectItem,
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

  return (
    <div style={overlayStyle}>
      {/* ヘッダー */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#4bbeeb" }}>
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
      <div style={contentStyle}>
        {activeTab === "variables" && (
          <DebugVariables
            variables={gameData.variables}
            updateGameData={updateGameData}
          />
        )}
        {activeTab === "scenes" && (
          <DebugScenes
            scenes={gameData.scenes}
            currentSceneName={currentScene.name}
            moveScene={moveScene}
          />
        )}
        {activeTab === "items" && (
          <DebugItems
            items={gameData.items}
            selectedItem={selectedItem}
            selectItem={selectItem}
            updateGameData={updateGameData}
          />
        )}
        {activeTab === "hotspots" && (
          <DebugHotspots
            hotspots={currentScene.hotspots}
            currentSceneName={currentScene.name}
            items={gameData.items}
            updateGameData={updateGameData}
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
          />
        )}
        {activeTab === "timers" && (
          <DebugTimers
            timers={timers}
            stopTimer={stopTimer}
            restartTimer={restartTimer}
          />
        )}
        {activeTab === "audio" && (
          <DebugAudio
            bgm={bgm}
            audioManager={audioManager}
          />
        )}
      </div>
    </div>
  );
}

export default memo(DebugOverlay);
