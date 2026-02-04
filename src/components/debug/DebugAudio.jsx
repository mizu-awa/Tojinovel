import { memo, useState, useEffect } from "react";

const buttonStyle = {
  padding: "2px 8px",
  backgroundColor: "#fff",
  color: "#333",
  border: "1px solid #c4c4c4",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: "11px",
  fontFamily: "inherit",
};

const statusDotStyle = (active) => ({
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: active ? "#4bbeeb" : "#c4c4c4",
  marginRight: 6,
});

function DebugAudio({ bgm, audioManager }) {
  // bgmはrefなので定期的に再描画する
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentBgm = bgm.current;

  // BGM停止
  const handleStopBGM = () => {
    if (audioManager) {
      audioManager.stopBGM();
      bgm.current = null;
    }
  };

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#999", fontWeight: 700, marginBottom: 6 }}>
        BGM
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
        <span>
          <span style={statusDotStyle(!!currentBgm)} />
          {currentBgm || "再生なし"}
        </span>
        {currentBgm && (
          <button style={buttonStyle} onClick={handleStopBGM}>
            停止
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(DebugAudio);
