import { memo, useState, useEffect } from "react";

function DebugAudio({ bgm, audioManager, theme }) {
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
      <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 700, marginBottom: 6 }}>
        BGM
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
        <span>
          <span style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: currentBgm ? theme.primary : theme.muted,
            marginRight: 6,
          }} />
          {currentBgm || "再生なし"}
        </span>
        {currentBgm && (
          <button
            style={{
              padding: "2px 8px",
              backgroundColor: theme.paper,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "inherit",
            }}
            onClick={handleStopBGM}
          >
            停止
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(DebugAudio);
